// Remplit la table d'exemple, une seule fois : « npm run db:exemple ».
import { createClient } from "@libsql/client";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL ?? "file:local.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const { rows } = await client.execute("select count(*) as n from exemples");
if (Number(rows[0].n) > 0) {
  console.log(`La table d'exemple contient déjà ${rows[0].n} ligne(s) : rien n'est ajouté.`);
} else {
  const aujourdhui = new Date().toISOString().slice(0, 10);
  for (const [nom, valeur] of [["Exemple un", 12], ["Exemple deux", 7], ["Exemple trois", 19]]) {
    await client.execute({ sql: "insert into exemples (nom, valeur, cree_le) values (?, ?, ?)", args: [nom, valeur, aujourdhui] });
  }
  console.log("Trois lignes d'exemple ajoutées.");
}
