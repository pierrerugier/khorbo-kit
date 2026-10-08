"use client";

import { useActionState } from "react";
import { creerPremierCompte, seConnecter, type Etat } from "./actions";

export function Formulaire({ premier, suite, min }: { premier: boolean; suite: string; min: number }) {
  const [etat, envoyer, enCours] = useActionState<Etat, FormData>(premier ? creerPremierCompte : seConnecter, null);
  return (
    <form action={envoyer} className="formulaire">
      <input type="hidden" name="suite" value={suite} />
      {premier && (
        <label>
          Votre nom
          <input name="nom" autoComplete="name" defaultValue={etat?.nom} required />
        </label>
      )}
      <label>
        E-mail
        <input name="email" type="email" autoComplete="email" inputMode="email" defaultValue={etat?.email} required />
      </label>
      <label>
        Mot de passe
        <input
          name="motDePasse"
          type="password"
          autoComplete={premier ? "new-password" : "current-password"}
          minLength={premier ? min : undefined}
          required
        />
        {premier && <span className="aide">{min} caractères au moins.</span>}
      </label>
      {etat && (
        <p className="erreur" role="alert">
          {etat.message}
        </p>
      )}
      <button type="submit" disabled={enCours}>
        {enCours ? "Un instant…" : premier ? "Créer mon compte" : "Se connecter"}
      </button>
    </form>
  );
}
