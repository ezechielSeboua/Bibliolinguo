# Cahier des charges — Dashboard Admin Bibliolingo

**Destinataire :** Claude Code (construction pas à pas)
**Stack imposée :** Next.js (App Router) + Supabase + TypeScript
**Objectif :** un back-office privé permettant d'administrer le contenu de l'app Bibliolingo, en priorité la **création et la validation des jeux**.

---

## 1. Contexte

Bibliolingo est une application d'apprentissage de la Bible (cible évangélique francophone). Le contenu (livres, sections, versets, jeux, questions) vit dans une base **Supabase (PostgreSQL)** déjà créée et peuplée (66 livres, Genèse publiée avec son texte intégral en Segond 1910).

Ce dashboard est l'outil interne d'administration. Il n'est **jamais** exposé au public : seuls des administrateurs y accèdent.

Le besoin n°1 immédiat : pouvoir **créer, prévisualiser et valider les jeux** d'une section, sans manipuler de SQL ni de JSON à la main.

---

## 2. Contraintes de sécurité (CRITIQUE)

Ces règles priment sur tout le reste.

- Le dashboard utilise la clé **`service_role`** de Supabase (accès complet, contourne la RLS). Cette clé donne un pouvoir total sur la base.
- **La clé `service_role` ne doit JAMAIS atteindre le navigateur.** Elle vit uniquement côté serveur Next.js (Server Components, Route Handlers, Server Actions), via une variable d'environnement **sans** préfixe `NEXT_PUBLIC_`.
- Toutes les opérations de lecture/écriture sur le contenu passent par le **serveur** Next.js, jamais par un client Supabase instancié côté navigateur avec cette clé.
- Variables d'environnement attendues (`.env.local`, jamais committé) :
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY` (secrète, serveur uniquement)
  - `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` (pour l'authentification admin côté client uniquement)
- Ajouter `.env.local` au `.gitignore`.

---

## 3. Authentification et accès admin

- La connexion réutilise **Supabase Auth** (email + mot de passe).
- L'accès au dashboard est restreint aux administrateurs. Mécanisme demandé :
  - une table `admins` (colonne `user_id` référençant `auth.users`, ou colonne `email`),
  - un **middleware Next.js** qui, sur toutes les routes du dashboard, vérifie que l'utilisateur connecté figure dans `admins` ; sinon, redirection vers la page de connexion.
- Aucune route du dashboard (hors page de login) n'est accessible sans session admin valide.
- Prévoir la création de la table `admins` (script SQL fourni dans la doc d'installation) et l'ajout manuel du premier admin.

---

## 4. Modèle de données (rappel)

Le dashboard agit sur les tables existantes. Hiérarchie du contenu :

```
book_groups → books → sections → games → questions
verses (texte biblique, lié à books)
```

Tables et champs principaux concernés :

- **books** : id, slug, name, position, chapter_count, is_published, book_group_id
- **sections** : id, book_id, position, title, chapter_start, chapter_end, intro, summary
- **games** : id, section_id, position, title, type (`mcq` | `fill_verse` | `order` | `match`), difficulty (1-3), xp_reward
- **questions** : id, game_id, position, prompt, reference, difficulty (1-3), payload (JSONB)
- **verses** : id, book_id, chapter, verse_number, text, translation

### Formats du champ `payload` (questions) selon le type de jeu

**mcq** :
```json
{ "options": ["A", "B", "C", "D"], "answer_index": 0 }
```
**fill_verse** :
```json
{ "text_before": "Au commencement, Dieu créa les cieux et la ", "text_after": ".", "options": ["terre","mer","lumière","vie"], "answer_index": 0 }
```
**order** :
```json
{ "items": ["Création","Chute","Déluge","Babel"], "correct_order": [0,1,2,3] }
```
**match** :
```json
{ "pairs": [ {"left":"Noé","right":"L'arche"}, {"left":"Abraham","right":"L'alliance"} ] }
```

Important : l'utilisateur **ne saisit jamais le JSON brut**. L'interface propose un formulaire adapté à chaque type, et c'est le code qui construit le `payload`.

---

## 5. Champ de validation à ajouter

Pour gérer la relecture, ajouter à la table `games` une colonne de statut (script SQL à inclure dans la doc) :

- `status` : text, valeurs `draft` | `review` | `published`, défaut `draft`.

Signification : `draft` (brouillon en cours), `review` (à relire), `published` (validé, prêt à être servi à l'app). L'app mobile ne servira que les jeux `published` (cette logique de filtrage côté app viendra plus tard ; pour l'instant, le dashboard gère seulement le statut).

---

## 6. Fonctionnalités — par priorité

### Espace 1 — Gestion du contenu (PRIORITÉ ABSOLUE, à livrer en premier)

Navigation hiérarchique : choisir un livre → une section → gérer ses jeux.

**6.1 Liste des livres**
- Afficher les livres (nom, testament via le groupe, publié ou non, nombre de sections).
- Cliquer un livre mène à ses sections.

**6.2 Liste des sections d'un livre**
- Afficher les sections (titre, plage de chapitres, nombre de jeux).
- Cliquer une section mène à ses jeux.

**6.3 Gestion des jeux d'une section (LE CŒUR)**
- Lister les jeux de la section (titre, type, difficulté, statut, nombre de questions).
- Créer un jeu : titre, type (menu déroulant : QCM / Compléter le verset / Remettre dans l'ordre / Association), difficulté (1-3), XP.
- Éditer / supprimer un jeu.
- Changer le statut (draft → review → published) via un sélecteur clair.

**6.4 Gestion des questions d'un jeu**
- Lister les questions d'un jeu.
- Ajouter / éditer une question avec un **formulaire adapté au type du jeu** :
  - *QCM* : énoncé, 2 à 4 options (champs texte), sélection de la bonne réponse (radio), référence biblique.
  - *Compléter le verset* : texte avant le trou, texte après, options, bonne réponse, référence.
  - *Remettre dans l'ordre* : liste d'éléments réordonnables, l'ordre saisi étant l'ordre correct.
  - *Association* : paires gauche/droite.
- Le code construit le `payload` JSON à partir du formulaire ; l'utilisateur ne voit jamais de JSON.
- Réordonner les questions (champ `position`).

**6.5 Prévisualisation**
- Pour chaque question, un aperçu rendant la question **comme dans l'app** (la question, les options, la bonne réponse mise en évidence), afin de valider d'un coup d'œil.

**6.6 Aide à la validation biblique**
- Lors de la saisie d'une question, permettre d'**afficher le passage biblique concerné** : un champ pour choisir livre/chapitre, qui interroge la table `verses` et affiche le texte (Segond 1910) à côté du formulaire.
- Objectif : que le rédacteur/relecteur vérifie que la réponse correspond bien au texte réel, sans quitter l'écran.

### Espace 2 — Versets (lecture seule)
- Consulter le texte d'un livre/chapitre (depuis `verses`), en lecture seule (le texte s'importe par script, on ne l'édite pas ici).

### Espace 3 — Utilisateurs (ultérieur)
- Liste des comptes (via l'API Admin Supabase, côté serveur) : email, date d'inscription.
- Détail d'un utilisateur : progression (profiles, game_progress), streak, XP.
- Actions : suspendre / réactiver un compte. Pas de modification de progression.

### Espace 4 — Statistiques (ultérieur)
- Indicateurs simples calculés via des **vues SQL** : inscriptions par jour, utilisateurs actifs, leçons complétées, rétention J+1 / J+7, points de décrochage.
- Graphiques côté client (ex. Recharts) à partir des chiffres renvoyés par le serveur.

### Espace 5 — Configuration de l'app (ultérieur)
- Table `app_settings` (clé/valeur) : XP par leçon, nombre de cœurs, etc.
- Édition de ces réglages depuis le dashboard ; l'app les lira au démarrage.
- Publication : activer/désactiver `is_published` d'un livre ou d'une section.

---

## 7. Exigences techniques

- **Next.js App Router**, TypeScript.
- Accès Supabase côté serveur via `@supabase/supabase-js` instancié avec la `service_role` dans des modules serveur uniquement (jamais importés côté client).
- Utiliser **Server Actions** ou **Route Handlers** pour toutes les mutations (création/édition/suppression).
- UI propre et fonctionnelle ; une librairie de composants légère est acceptable (ex. shadcn/ui ou Tailwind). La priorité est la clarté d'usage, pas l'esthétique.
- Validation des entrées côté serveur (types, champs requis, cohérence du payload selon le type de jeu) avant écriture en base.
- Gestion des erreurs explicite (messages clairs si une écriture échoue).

---

## 8. Ordre de construction recommandé

1. Mise en place du projet Next.js + connexion Supabase serveur + variables d'environnement + `.gitignore`.
2. Table `admins` + colonne `status` sur `games` (scripts SQL fournis dans la doc d'installation).
3. Authentification admin + middleware de protection des routes.
4. Espace 1 — navigation livres → sections → jeux (lecture).
5. Espace 1 — création/édition de jeux.
6. Espace 1 — formulaires de questions par type + construction du payload.
7. Espace 1 — prévisualisation + affichage du passage biblique (aide à la validation).
8. Gestion du statut (draft/review/published).
9. Espaces ultérieurs (versets en lecture, utilisateurs, stats, configs) — une fois l'espace 1 pleinement fonctionnel.

---

## 9. Critères de réussite (definition of done)

- Un administrateur peut se connecter ; un non-admin ne peut pas accéder au dashboard.
- La clé `service_role` n'apparaît jamais dans le bundle client (vérifiable).
- On peut créer un jeu QCM dans la section « Les Origines » de la Genèse, lui ajouter une question via le formulaire, voir l'aperçu, afficher le passage de Genèse concerné, et passer le jeu en `published`.
- Aucune saisie de JSON brut n'est nécessaire pour créer une question.
- Les données créées apparaissent correctement dans Supabase.

---

## 10. Documentation attendue de Claude Code

En plus du code, produire un court **README** expliquant : installation, variables d'environnement à renseigner, scripts SQL à exécuter (table `admins`, colonne `status`), comment créer le premier admin, et comment lancer le projet en local.
