import type { Metadata } from "next";
import { utilisateurConnecte } from "@/lib/connexion";
import { seDeconnecter } from "./connexion/actions";
import "./globals.css";

// Le nom affiché en haut de chaque page et dans l'onglet du navigateur.
const NOM = "mon-outil";

export const metadata: Metadata = {
  title: NOM,
  description: "Outil interne, construit avec le kit de départ Khorbo.",
  robots: { index: false, follow: false },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Sert seulement à l'affichage du nom et du bouton : la vraie vérification est dans proxy.ts et dans chaque page.
  const utilisateur = await utilisateurConnecte().catch(() => null);
  return (
    <html lang="fr">
      <body>
        <header className="entete">
          <span className="pastille" aria-hidden="true">{NOM.charAt(0).toUpperCase()}</span>
          <span className="nom">{NOM}</span>
          {utilisateur && (
            <nav aria-label="Menu">
              <a href="/">Accueil</a>
              <span className="qui">{utilisateur.nom}</span>
              <form action={seDeconnecter}>
                <button type="submit" className="lien">Se déconnecter</button>
              </form>
            </nav>
          )}
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
