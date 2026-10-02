import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// L'adresse et le jeton de la base se lisent dans .env.local, jamais dans le code.
config({ path: ".env.local" });

export default defineConfig({
  schema: "./db/schema.ts",
  dialect: "turso",
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL ?? "file:local.db",
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
});
