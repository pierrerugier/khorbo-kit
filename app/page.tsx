import { connection } from "next/server";
import { db } from "@/db";
import { exemples } from "@/db/schema";
import { exigerUtilisateur } from "@/lib/connexion";

const DATE = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

export default async function Accueil() {
  // La table est relue dans la base à chaque visite, jamais figée au moment de la mise en ligne.
  await connection();
  // Chaque page de l'outil commence par là : sans session valable, retour à la page de connexion.
  const utilisateur = await exigerUtilisateur();

  let lignes: (typeof exemples.$inferSelect)[] = [];
  let erreur = false;
  try {
    lignes = await db.select().from(exemples);
  } catch {
    erreur = true;
  }

  return (
    <>
      <p className="repere">Kit de départ</p>
      <h1>Bienvenue, {utilisateur.nom.split(" ")[0]}</h1>
      <p className="intro">
        Ceci est la page d&apos;accueil du kit de départ. La porte est fermée : il faut un compte pour entrer. Une base de données
        est déjà branchée, avec une première table à l&apos;intérieur.
      </p>

      {erreur ? (
        <p className="message">
          La base ne répond pas encore. Demandez à Claude : « Applique le schéma du kit à ma base, puis remplis la table d&apos;exemple. »
        </p>
      ) : lignes.length === 0 ? (
        <p className="message">La table d&apos;exemple est vide. Demandez à Claude de la remplir, ou lancez « npm run db:exemple ».</p>
      ) : (
        <div className="cadre">
          <table>
            <thead>
              <tr>
                <th scope="col">Nom</th>
                <th scope="col" className="nombre">Valeur</th>
                <th scope="col">Créé le</th>
              </tr>
            </thead>
            <tbody>
              {lignes.map((l) => (
                <tr key={l.id}>
                  <td>{l.nom}</td>
                  <td className="nombre">{l.valeur}</td>
                  <td>{DATE.format(new Date(l.creeLe))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
