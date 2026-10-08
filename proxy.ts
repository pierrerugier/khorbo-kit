import { NextResponse, type NextRequest } from "next/server";
import { COOKIE, utilisateurDuJeton } from "@/lib/jeton";

// La porte de l'outil. Chaque page passe par ici : sans session valable, retour à la page de connexion.

// Les pages ouvertes à tous. Une page publique s'ajoute ici, et seulement quand je le demande.
const PAGES_PUBLIQUES = ["/connexion"];

const estPublique = (chemin: string) =>
  PAGES_PUBLIQUES.some((p) => chemin === p || (p !== "/" && chemin.startsWith(`${p}/`)));

export async function proxy(requete: NextRequest) {
  const chemin = requete.nextUrl.pathname;
  if (estPublique(chemin)) return NextResponse.next();

  const utilisateur = await utilisateurDuJeton(requete.cookies.get(COOKIE)?.value).catch(() => null);
  if (utilisateur) return NextResponse.next();

  const connexion = new URL("/connexion", requete.url);
  if (chemin !== "/") connexion.searchParams.set("suite", chemin);
  const reponse = NextResponse.redirect(connexion);
  reponse.cookies.delete(COOKIE);
  return reponse;
}

export const config = {
  // Tout, sauf les fichiers que Next fabrique et les images du dossier public.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|txt|xml)$).*)"],
};
