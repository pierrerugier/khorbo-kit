import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { sessions, utilisateurs } from "@/db/schema";
import { COOKIE, empreinteJeton, utilisateurDuJeton } from "@/lib/jeton";

// La porte de l'outil : les comptes, les mots de passe et les sessions.
// proxy.ts renvoie vers /connexion qui n'a pas de session valable ; chaque page et chaque action
// qui lit ou écrit la base commence en plus par exigerUtilisateur(), pour ne jamais dépendre d'un seul verrou.

const DUREE_SESSION_JOURS = 30;
const ECHECS_MAX = 5;
const ATTENTE_MINUTES = 15;
export const MOT_DE_PASSE_MIN = 10;

const scryptAsync = promisify(scrypt) as (motDePasse: string, sel: Buffer, longueur: number) => Promise<Buffer>;

/** L'empreinte d'un mot de passe : « sel:empreinte », en hexadécimal. Le mot de passe lui-même n'est gardé nulle part. */
export async function empreinteMotDePasse(motDePasse: string): Promise<string> {
  const sel = randomBytes(16);
  const empreinte = await scryptAsync(motDePasse, sel, 64);
  return `${sel.toString("hex")}:${empreinte.toString("hex")}`;
}

async function motDePasseJuste(motDePasse: string, gardee: string): Promise<boolean> {
  const [sel, empreinte] = gardee.split(":");
  if (!sel || !empreinte) return false;
  const calculee = await scryptAsync(motDePasse, Buffer.from(sel, "hex"), 64);
  const attendue = Buffer.from(empreinte, "hex");
  return attendue.length === calculee.length && timingSafeEqual(attendue, calculee);
}

export const normaliserEmail = (email: string) => email.trim().toLowerCase();

/** Personne n'a encore de compte : la page de connexion propose de créer le premier. */
export async function aucunCompte(): Promise<boolean> {
  const [premier] = await db.select({ id: utilisateurs.id }).from(utilisateurs).limit(1);
  return !premier;
}

/**
 * Le premier compte ne se crée que sur l'ordinateur (npm run dev). En ligne, une base vide ne doit jamais
 * laisser le premier venu devenir le patron de l'outil.
 */
export const premierComptePermis = () => process.env.NODE_ENV !== "production";

/** La personne connectée, ou null. */
export async function utilisateurConnecte() {
  const jeton = (await cookies()).get(COOKIE)?.value;
  return utilisateurDuJeton(jeton);
}

/** La personne connectée ; sans session valable, retour à la page de connexion. */
export async function exigerUtilisateur() {
  const utilisateur = await utilisateurConnecte();
  if (!utilisateur) redirect("/connexion");
  return utilisateur;
}

/** Ouvre une session sur cet appareil : un jeton au hasard dans le navigateur, son empreinte dans la base. */
export async function ouvrirSession(utilisateurId: number) {
  const jeton = randomBytes(32).toString("base64url");
  const expire = new Date(Date.now() + DUREE_SESSION_JOURS * 24 * 3600 * 1000);
  await db.insert(sessions).values({
    utilisateurId,
    empreinteJeton: empreinteJeton(jeton),
    expireLe: expire.toISOString(),
    creeLe: new Date().toISOString(),
  });
  (await cookies()).set(COOKIE, jeton, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expire,
  });
}

/** Ferme la session de cet appareil, dans la base comme dans le navigateur. */
export async function fermerSession() {
  const magasin = await cookies();
  const jeton = magasin.get(COOKIE)?.value;
  if (jeton) await db.delete(sessions).where(eq(sessions.empreinteJeton, empreinteJeton(jeton)));
  magasin.delete(COOKIE);
}

export type Verdict = { ok: true; utilisateurId: number } | { ok: false; message: string };

/**
 * Vérifie un e-mail et un mot de passe. Le message d'erreur est le même que l'adresse existe ou non,
 * et 5 essais faux de suite font attendre le compte 15 minutes.
 */
export async function verifierIdentifiants(email: string, motDePasse: string): Promise<Verdict> {
  const faux: Verdict = { ok: false, message: "E-mail ou mot de passe incorrect." };
  const [compte] = await db.select().from(utilisateurs).where(eq(utilisateurs.email, normaliserEmail(email))).limit(1);
  if (!compte) {
    // Le même temps de calcul qu'avec un vrai compte, pour ne pas révéler quelles adresses existent.
    await empreinteMotDePasse(motDePasse);
    return faux;
  }
  if (compte.bloqueJusqua && compte.bloqueJusqua > new Date().toISOString()) {
    return { ok: false, message: `Trop d'essais. Réessayez dans ${ATTENTE_MINUTES} minutes.` };
  }
  if (!(await motDePasseJuste(motDePasse, compte.empreinte))) {
    const echecs = compte.echecs + 1;
    const bloque = echecs >= ECHECS_MAX ? new Date(Date.now() + ATTENTE_MINUTES * 60 * 1000).toISOString() : null;
    await db
      .update(utilisateurs)
      .set({ echecs: bloque ? 0 : echecs, bloqueJusqua: bloque })
      .where(eq(utilisateurs.id, compte.id));
    return faux;
  }
  await db.update(utilisateurs).set({ echecs: 0, bloqueJusqua: null }).where(eq(utilisateurs.id, compte.id));
  return { ok: true, utilisateurId: compte.id };
}
