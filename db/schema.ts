import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Le plan de la base. Chaque table est un classeur, chaque colonne un champ, chaque ligne une fiche.
// Pour changer ce plan : ajouter sans rien effacer, et compter les fiches avant et après (voir CLAUDE.md).

// Les personnes qui ont le droit d'entrer dans l'outil.
// Le mot de passe n'est jamais gardé en clair : seulement son empreinte, impossible à retourner.
export const utilisateurs = sqliteTable("utilisateurs", {
  id: integer("id").primaryKey(),
  nom: text("nom").notNull(),
  email: text("email").notNull().unique(),
  empreinte: text("empreinte").notNull(),
  // Après 5 mots de passe faux de suite, le compte attend 15 minutes (lib/connexion.ts).
  echecs: integer("echecs").notNull().default(0),
  bloqueJusqua: text("bloque_jusqua"),
  creeLe: text("cree_le").notNull(),
});

// Une session ouverte par appareil. Le navigateur garde un jeton ; la base n'en garde que l'empreinte.
export const sessions = sqliteTable("sessions", {
  id: integer("id").primaryKey(),
  utilisateurId: integer("utilisateur_id")
    .notNull()
    .references(() => utilisateurs.id, { onDelete: "cascade" }),
  empreinteJeton: text("empreinte_jeton").notNull().unique(),
  expireLe: text("expire_le").notNull(),
  creeLe: text("cree_le").notNull(),
});

// La table d'exemple du kit. Elle montre que la base est branchée :
// Claude la remplacera par vos vraies tables (clients, devis, interventions).
export const exemples = sqliteTable("exemples", {
  id: integer("id").primaryKey(),
  nom: text("nom").notNull(),
  valeur: integer("valeur").notNull(),
  creeLe: text("cree_le").notNull(),
});
