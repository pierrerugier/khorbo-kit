import { redirect } from "next/navigation";
import { aucunCompte, MOT_DE_PASSE_MIN, premierComptePermis, utilisateurConnecte } from "@/lib/connexion";
import { Formulaire } from "./Formulaire";

export default async function Connexion({ searchParams }: { searchParams: Promise<{ suite?: string }> }) {
  const { suite = "/" } = await searchParams;

  let connecte = null;
  let personne = false;
  let panne = false;
  try {
    connecte = await utilisateurConnecte();
    personne = await aucunCompte();
  } catch {
    panne = true;
  }
  if (connecte) redirect(suite.startsWith("/") && !suite.startsWith("//") ? suite : "/");

  if (panne) {
    return (
      <section className="porte">
        <h1>Connexion</h1>
        <p className="message">
          La base ne répond pas encore. Demandez à Claude : « Applique le schéma du kit à ma base. »
        </p>
      </section>
    );
  }

  if (personne && !premierComptePermis()) {
    return (
      <section className="porte">
        <h1>Connexion</h1>
        <p className="message">Aucun compte n&apos;existe encore dans cette base. Demandez à Claude de créer le vôtre.</p>
      </section>
    );
  }

  return (
    <section className="porte">
      <h1>{personne ? "Créez votre compte" : "Connexion"}</h1>
      <p className="intro">
        {personne
          ? "Personne n'a encore de compte. Le premier, c'est le vôtre : il ouvre la porte de votre outil."
          : "Votre outil est protégé. Connectez-vous pour entrer."}
      </p>
      <Formulaire premier={personne} suite={suite} min={MOT_DE_PASSE_MIN} />
    </section>
  );
}
