import { createHash } from "node:crypto";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/db";
import { sessions, utilisateurs } from "@/db/schema";

// Ce que proxy.ts a besoin de savoir, sans rien d'autre : à qui appartient le jeton du navigateur.

export const COOKIE = "session";

export const empreinteJeton = (jeton: string) => createHash("sha256").update(jeton).digest("hex");

/** L'utilisateur d'un jeton de session encore valable, ou null. */
export async function utilisateurDuJeton(jeton: string | undefined) {
  if (!jeton) return null;
  const [ligne] = await db
    .select({ id: utilisateurs.id, nom: utilisateurs.nom, email: utilisateurs.email })
    .from(sessions)
    .innerJoin(utilisateurs, eq(utilisateurs.id, sessions.utilisateurId))
    .where(and(eq(sessions.empreinteJeton, empreinteJeton(jeton)), gt(sessions.expireLe, new Date().toISOString())))
    .limit(1);
  return ligne ?? null;
}
