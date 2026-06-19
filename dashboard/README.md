# Bibliolingo Admin Dashboard

Dashboard administrateur pour gérer le contenu de l'application Bibliolingo (livres, sections, jeux, questions).

## Stack

- **Next.js 16** (App Router, TypeScript)
- **Supabase** (PostgreSQL + Auth)
- **Tailwind CSS v4**

---

## Installation

```bash
npm install
```

---

## Variables d'environnement

Créer un fichier `.env.local` à la racine du projet (ne jamais committer ce fichier) :

```env
# URL de votre projet Supabase
SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co

# Clé service_role — accès complet, serveur uniquement
# Ne jamais exposer côté client ni avec le préfixe NEXT_PUBLIC_
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

Ces variables sont uniquement lues côté serveur (Server Actions, Proxy). La clé `service_role` n'atteint jamais le navigateur.

---

## Scripts SQL à exécuter dans Supabase

Ouvrir l'éditeur SQL de votre projet Supabase et exécuter les scripts suivants dans l'ordre.

### 1. Table `admins`

```sql
CREATE TABLE IF NOT EXISTS public.admins (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 2. Colonne `status` sur la table `games`

```sql
ALTER TABLE public.games
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'review', 'published'));
```

### 3. Colonnes de la table `questions`

Si la table `questions` n'a pas encore ces colonnes, les ajouter :

```sql
ALTER TABLE public.questions
  ADD COLUMN IF NOT EXISTS prompt      TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS reference   TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS difficulty  INT  NOT NULL DEFAULT 1
    CHECK (difficulty IN (1, 2, 3)),
  ADD COLUMN IF NOT EXISTS position    INT  NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS payload     JSONB NOT NULL DEFAULT '{}';
```

### 4. Table `app_settings`

```sql
CREATE TABLE IF NOT EXISTS public.app_settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT ''
);

-- Valeurs par défaut
INSERT INTO public.app_settings (key, value) VALUES
  ('xp_per_lesson',        '10'),
  ('max_hearts',           '5'),
  ('heart_refill_minutes', '30'),
  ('streak_freeze_cost',   '50')
ON CONFLICT (key) DO NOTHING;
```

---

## Créer le premier administrateur

1. Créer un compte dans **Supabase Auth** (Dashboard → Authentication → Users → Invite user).
2. Récupérer le `user_id` (UUID) du compte créé.
3. Insérer l'entrée dans la table `admins` :

```sql
INSERT INTO public.admins (user_id)
VALUES ('xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx');
```

---

## Lancer le projet en local

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) — vous serez redirigé vers `/login`.

---

## Architecture de sécurité

| Couche | Rôle |
|--------|------|
| **Proxy** (`proxy.ts`) | Vérifie la validité du token JWT sur toutes les routes sauf `/login`. Redirige vers `/login` si invalide. |
| **Layout admin** (`app/(admin)/layout.tsx`) | Vérifie que l'utilisateur figure dans la table `admins`. Double vérification côté serveur. |
| **Server Actions** | Toutes les mutations passent par le serveur. La clé `service_role` n'atteint jamais le client. |
