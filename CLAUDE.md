# Mon outil : consignes pour Claude

Ce fichier est relu au début de chaque conversation. Il est très général : la leçon « Votre brief » le complète avec votre métier.

## Qui nous sommes
[À compléter : le nom de l'entreprise, son métier, qui utilise l'outil.]

## Ce que fait l'outil
[À compléter : les écrans, du plus utile au moins utile.]

## Règles pour Claude

### Conventions
- Écris en français, avec des mots simples. Tout le texte de l'outil est en français.
- Chaque écran doit marcher sur un téléphone.
- Un écran à la fois : construis ce qui est demandé, rien de plus.
- Explique en une phrase ce que tu as fait, sans jargon.

### La porte de l'outil
- L'outil est fermé par défaut : proxy.ts renvoie vers /connexion qui n'a pas de session valable.
- Chaque page et chaque action qui lit ou écrit la base commence par `exigerUtilisateur()` (lib/connexion.ts).
- Une page ouverte à tous (accueil d'un site, tarifs) s'ajoute à PAGES_PUBLIQUES dans proxy.ts, et seulement si je le demande. Jamais une page qui montre mes données.
- Les mots de passe ne sont gardés qu'en empreinte. Ne les écris jamais en clair, ni dans la base, ni dans un fichier, ni dans la conversation.

### Interdits
- N'affiche jamais « Enregistré » sans avoir relu la donnée dans la base.
- Ne retire jamais la connexion, même pour un essai.
- Aucune clé secrète dans le code : elle va dans .env.local, et dans les réglages de Vercel.
- Ne supprime ni ne renomme une colonne sans me demander. Pour changer la base, ajoute sans rien effacer, et compte les fiches avant et après.
- Ne force jamais un changement de la base ni un envoi sur GitHub.

## Technique
Site Next.js (dossier app), base de données Turso décrite dans db/schema.ts avec Drizzle (sans réglage, un fichier local.db sur l'ordinateur, qui ne part jamais sur GitHub), connexion par e-mail et mot de passe (lib/connexion.ts, proxy.ts, app/connexion), mise en ligne par Vercel depuis un dépôt GitHub privé.
- `npm run dev` lance le site sur l'ordinateur, à l'adresse localhost:3000.
- `npm run db:push` applique db/schema.ts à la base indiquée par .env.local.
- `npm run db:exemple` remplit la table d'exemple, une seule fois.
