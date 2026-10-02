import type { Metadata } from "next";
import "./globals.css";

// Le nom affiché en haut de chaque page et dans l'onglet du navigateur.
const NOM = "mon-outil";

export const metadata: Metadata = {
  title: NOM,
  description: "Outil interne, construit avec le kit de départ Khorbo.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <header className="entete">
          <span className="pastille" aria-hidden="true">{NOM.charAt(0).toUpperCase()}</span>
          <span className="nom">{NOM}</span>
          <nav aria-label="Menu">
            <a href="/" aria-current="page">Accueil</a>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
