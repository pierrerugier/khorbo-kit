"use server";

import { redirect } from "next/navigation";
import { db } from "@/db";
import { utilisateurs } from "@/db/schema";
import {
  aucunCompte,
  empreinteMotDePasse,
  fermerSession,
  MOT_DE_PASSE_MIN,
  normaliserEmail,
  ouvrirSession,
  premierComptePermis,
  verifierIdentifiants,
} from "@/lib/connexion";

// Après une erreur, le nom et l'e-mail reviennent dans les cases : on ne retape jamais ce qui était juste.
export type Etat = { message: string; nom?: string; email?: string } | null;

/** La page où revenir après la connexion : seulement une page de l'outil, jamais un autre site. */
function suiteSure(suite: FormDataEntryValue | null): string {
  const s = typeof suite === "string" ? suite : "";
  return s.startsWith("/") && !s.startsWith("//") && !s.startsWith("/connexion") ? s : "/";
}

export async function seConnecter(_avant: Etat, form: FormData): Promise<Etat> {
  const email = String(form.get("email") ?? "");
  const motDePasse = String(form.get("motDePasse") ?? "");
  if (!email || !motDePasse) return { message: "Remplissez l'e-mail et le mot de passe.", email };
  const verdict = await verifierIdentifiants(email, motDePasse);
  if (!verdict.ok) return { message: verdict.message, email };
  await ouvrirSession(verdict.utilisateurId);
  redirect(suiteSure(form.get("suite")));
}

export async function creerPremierCompte(_avant: Etat, form: FormData): Promise<Etat> {
  if (!premierComptePermis()) return { message: "Le premier compte se crée sur votre ordinateur." };
  if (!(await aucunCompte())) return { message: "Un compte existe déjà. Connectez-vous." };
  const nom = String(form.get("nom") ?? "").trim();
  const email = normaliserEmail(String(form.get("email") ?? ""));
  const motDePasse = String(form.get("motDePasse") ?? "");
  if (!nom) return { message: "Écrivez votre nom.", nom, email };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { message: "Cette adresse e-mail ne semble pas complète.", nom, email };
  if (motDePasse.length < MOT_DE_PASSE_MIN) {
    return { message: `Le mot de passe doit faire au moins ${MOT_DE_PASSE_MIN} caractères.`, nom, email };
  }
  const [compte] = await db
    .insert(utilisateurs)
    .values({ nom, email, empreinte: await empreinteMotDePasse(motDePasse), creeLe: new Date().toISOString() })
    .returning({ id: utilisateurs.id });
  await ouvrirSession(compte.id);
  redirect(suiteSure(form.get("suite")));
}

export async function seDeconnecter() {
  await fermerSession();
  redirect("/connexion");
}
