import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

// Turso quand .env.local (ou Vercel) donne l'adresse et le jeton,
// sinon un fichier local.db sur l'ordinateur, pour essayer sans rien régler.
const client = createClient({
  url: process.env.TURSO_DATABASE_URL ?? "file:local.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });
