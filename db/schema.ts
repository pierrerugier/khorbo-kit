import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// La table d'exemple du kit. Elle montre que la base est branchée :
// Claude la remplacera par vos vraies tables (clients, devis, interventions).
export const exemples = sqliteTable("exemples", {
  id: integer("id").primaryKey(),
  nom: text("nom").notNull(),
  valeur: integer("valeur").notNull(),
  creeLe: text("cree_le").notNull(),
});
