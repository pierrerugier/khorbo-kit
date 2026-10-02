# Le kit de départ Khorbo

Le squelette commun à tous les outils du cours : un site Next.js vide, une base de données Turso avec une table d'exemple, et un fichier CLAUDE.md.

Vous n'avez rien à taper ici vous-même. Dans la leçon « Le kit de départ », vous donnez ce dossier à Claude, et il fait le reste.

Pour qui veut le faire à la main :

1. `npm install`
2. Recopier `.env.example` en `.env.local`, puis y coller l'adresse et le jeton de la base Turso. Sans ces deux valeurs, le kit utilise un fichier `local.db` sur l'ordinateur.
3. `npm run db:push`, puis `npm run db:exemple`
4. `npm run dev`, et ouvrir http://localhost:3000

Ce code est à vous : vous pouvez l'utiliser et le modifier librement pour vos outils.
