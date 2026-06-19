# Import des versets — Instructions pour Claude Code

Ce dossier importe les versets de la Genèse (Bible Segond 1910, domaine public)
dans la table `verses` de Supabase, via le script `import-verses.js`.

## Ce que fait le script

1. Télécharge le texte de la Genèse depuis l'API publique **getbible.net** (Louis Segond 1910).
2. Récupère l'`id` du livre dans la base Supabase (recherche par `slug = 'genesis'`).
3. Insère les ~1 533 versets dans la table `verses`, par lots, en mode `upsert`
   (rejouable sans créer de doublons).
4. Vérifie le nombre total de versets importés.

## Prérequis

- **Node.js 18+** (pour le `fetch` natif).
- Le schéma Supabase déjà créé **et** le seed des livres déjà exécuté
  (le livre `genesis` doit exister dans la table `books`).

## Mise en place

1. Dans ce dossier, initialise le projet et installe les dépendances :

   ```bash
   npm init -y
   npm pkg set type=module
   npm install @supabase/supabase-js dotenv
   ```

2. Crée un fichier **`.env`** (à NE JAMAIS committer) avec :

   ```
   SUPABASE_URL=https://TON-PROJET.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=ta_cle_service_role
   ```

   - `SUPABASE_URL` : dans Supabase → Project Settings → API → Project URL.
   - `SUPABASE_SERVICE_ROLE_KEY` : même page, section "Project API keys",
     la clé **`service_role`** (⚠️ secrète, écriture, contourne la RLS — ne jamais l'exposer).

3. Ajoute un `.gitignore` :

   ```
   node_modules/
   .env
   ```

## Lancement

```bash
node import-verses.js
```

Sortie attendue (exemple) :

```
🚀 Import des versets — genesis (LSG1910)
📖 Livre trouvé : Genèse (id …)
🌐 Téléchargement …
✅ 1533 versets extraits de la source.
   … 500/1533 versets insérés
   … 1000/1533 versets insérés
   … 1533/1533 versets insérés
🔎 Total en base pour ce livre : 1533 versets.
🎉 Terminé.
```

## Vérifications à faire après l'import

- Dans Supabase → Table Editor → `verses`, confirmer la présence des versets.
- Contrôler la **versification** (nombre de versets par chapitre cohérent) avec, dans le SQL Editor :

  ```sql
  select chapter, count(*) as nb_versets
  from verses v
  join books b on b.id = v.book_id
  where b.slug = 'genesis'
  group by chapter order by chapter;
  ```

  Genèse 1 doit avoir 31 versets, Genèse 2 → 25, etc.

## Notes

- **Structure de l'API** : le script suppose le format getbible v2
  (`{ book: [ { chapter, verses: [ { verse, text } ] } ] }`).
  Si l'extraction renvoie 0 verset, inspecte la vraie réponse de
  `https://api.getbible.net/v2/ls1910/1.json` et adapte la fonction `fetchVerses()`.
- **Réutilisable pour les autres livres** : il suffit de changer l'objet `BOOK`
  en haut du script (`slug` + `getbibleNumber`) et de relancer.
- **Source alternative** si getbible pose problème : dépôts GitHub publics de la
  Segond 1910 (ex. BibleCorps/FRA-B-LSG1910-PD-UBS) au format texte/JSON.
