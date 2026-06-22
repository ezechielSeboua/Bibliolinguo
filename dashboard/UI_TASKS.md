# Bibliolinguo Dashboard — Tâches UI/UX

Fichier de suivi persistant des améliorations UI/UX identifiées lors de l'audit du 2026-06-19.
Ce fichier est la source de vérité : mettre à jour le statut à chaque action effectuée.

Statuts : `[ ]` en attente · `[~]` en cours · `[x]` terminé

---

## PRIORITÉ HAUTE

### #5 — Notifications de succès (toasts)
- **Statut :** `[x]`
- **Pages :** Section (suppression jeu), Utilisateurs (suspension/réactivation), Réglages (sauvegarde paramètres)
- **Problème :** Aucun retour visuel après une action. L'admin ne sait pas si ça a fonctionné.
- **Solution :** Installer et câbler un système de toast (ex: `sonner`) déclenché après chaque Server Action.
- **Fichiers clés :**
  - `app/(admin)/layout.tsx` — ajouter le `<Toaster />`
  - `app/(admin)/books/[bookId]/sections/[sectionId]/actions.ts`
  - `app/(admin)/users/actions.ts`
  - `app/(admin)/settings/actions.ts`

---

### #6 — Bouton "Mot de passe oublié" fonctionnel
- **Statut :** `[x]`
- **Page :** `app/login/page.tsx:167`
- **Problème :** Le `onClick` contient un TODO vide. Bouton trompeur.
- **Solution :** Implémenter `supabase.auth.resetPasswordForEmail()` dans une action, ou masquer le bouton temporairement.

---

### #2 — Sidebar mobile (drawer responsive)
- **Statut :** `[x]`
- **Page :** `app/(admin)/components/Sidebar.tsx` + `app/(admin)/layout.tsx`
- **Problème :** La sidebar est fixe (`w-60`) sans gestion mobile. Sur écrans < 1024px, le contenu est masqué ou écrasé.
- **Solution :** Ajouter un bouton hamburger dans le header mobile, et un drawer (overlay) qui s'ouvre/ferme via état React.
- **Fichiers clés :**
  - `app/(admin)/components/Sidebar.tsx`
  - `app/(admin)/layout.tsx`

---

### #22 — Recherche utilisateurs
- **Statut :** `[x]`
- **Page :** `app/(admin)/users/page.tsx`
- **Problème :** Aucun champ de recherche. Trouver un utilisateur spécifique parmi des dizaines de pages est impossible.
- **Solution :** Ajouter un champ de recherche par email (via `searchParams` → filtre Supabase).

---

## PRIORITÉ MOYENNE

### #1 — Unifier la palette de couleurs (slate vs gray)
- **Statut :** `[x]`
- **Pages :** Toutes
- **Problème :** Certaines pages utilisent `slate-*`, d'autres `gray-*` pour les mêmes éléments. Incohérence visuelle.
- **Solution :** Choisir `slate` comme référence et remplacer tous les `gray-*` par `slate-*` sur les pages admin.
- **Fichiers clés :**
  - `app/(admin)/users/page.tsx`
  - `app/(admin)/users/[userId]/page.tsx`
  - `app/(admin)/settings/page.tsx`
  - `app/(admin)/books/[bookId]/page.tsx`
  - `app/(admin)/books/[bookId]/sections/[sectionId]/page.tsx`

---

### #9 — Icônes sur les cartes KPI du Dashboard
- **Statut :** `[x]`
- **Page :** `app/(admin)/dashboard/page.tsx:36`
- **Problème :** 4 chiffres bruts sans icône, alors que la page Stats a des icônes colorées pour les mêmes métriques.
- **Solution :** Ajouter une icône Lucide + couleur de fond à chaque carte (comme `StatCard` dans stats).

---

### #10 — Remplacer AnimatedCards par des raccourcis d'action
- **Statut :** `[x]`
- **Page :** `app/(admin)/dashboard/AnimatedCards.tsx`
- **Problème :** Les 5 cartes reproduisent exactement les liens de la sidebar, sans valeur ajoutée.
- **Solution :** Remplacer par des raccourcis contextuels : "Jeux en attente de relecture", "Derniers inscrits", "Créer un jeu".

---

### #12 — Tableau Livres responsive
- **Statut :** `[x]`
- **Page :** `app/(admin)/books/page.tsx:44`
- **Problème :** 7 colonnes sans `overflow-x-auto`. Se compresse illisiblement sur écrans moyens.
- **Solution :** Envelopper le tableau dans `<div className="overflow-x-auto">`.

---

### #14 — Ligne de tableau entièrement cliquable
- **Statut :** `[x]`
- **Pages :** `app/(admin)/books/page.tsx`, `app/(admin)/books/[bookId]/page.tsx`
- **Problème :** Seul le nom est un lien. Cliquer ailleurs sur la ligne ne fait rien.
- **Solution :** Utiliser `cursor-pointer` sur la `<tr>` avec un `onClick` ou envelopper la ligne dans un lien.

---

### #21 — Unifier la couleur des liens (blue → indigo)
- **Statut :** `[x]`
- **Page :** `app/(admin)/users/page.tsx:74`
- **Problème :** Seule page à utiliser `text-blue-600` pour les liens au lieu d'`indigo`.
- **Solution :** Remplacer `text-blue-600 hover:underline` par `text-indigo-600 hover:text-indigo-700 transition-colors`.

---

### #13 — Recherche / filtre sur la page Livres
- **Statut :** `[x]`
- **Page :** `app/(admin)/books/page.tsx`
- **Problème :** 66 livres bibliques, aucune recherche ni filtre par Testament.
- **Solution :** Ajouter un champ de recherche client-side (filtre sur le tableau déjà chargé) + boutons filtre Ancien/Nouveau Testament.

---

### #17 — Bouton "Ajouter une section" sur la page Livre
- **Statut :** `[x]`
- **Page :** `app/(admin)/books/[bookId]/page.tsx`
- **Problème :** Aucune action de création de section visible.
- **Solution :** Ajouter un formulaire ou bouton `CreateSectionForm` (similaire à `CreateGameForm`).

---

## PRIORITÉ BASSE

### #8 — `aria-live` sur le message d'erreur Login
- **Statut :** `[x]`
- **Page :** `app/login/page.tsx:178`
- **Problème :** L'erreur apparaît visuellement mais n'est pas annoncée par les lecteurs d'écran.
- **Solution :** Ajouter `aria-live="polite"` sur le `<div role="alert">` (déjà présent, vérifier si suffisant).

---

### #7 — Alt text logo cohérent
- **Statut :** `[x]`
- **Page :** `app/login/page.tsx:53`
- **Problème :** `alt="Bibliolingo"` vs fichier `Bibliolinguo_logo.png`. Clarifier le nom officiel.
- **Solution :** Harmoniser l'alt text avec le nom de marque officiel.

---

### #18 — DifficultyDots accessibles et lisibles
- **Statut :** `[x]`
- **Page :** `app/(admin)/books/[bookId]/sections/[sectionId]/page.tsx:17`
- **Problème :** 3 points de 8px sans légende ni `aria-label`. Non accessible, difficile à lire.
- **Solution :** Ajouter `aria-label={`Difficulté : ${level}/3`}` sur le conteneur + agrandir légèrement les points.

---

### #20 — En-tête colonne "Diff." explicite
- **Statut :** `[x]`
- **Page :** `app/(admin)/books/[bookId]/sections/[sectionId]/page.tsx:107`
- **Problème :** Abréviation ambiguë.
- **Solution :** Remplacer par "Difficulté" ou ajouter un `title="Difficulté"` sur le `<th>`.

---

### #23 — Pagination améliorée (numéros de pages)
- **Statut :** `[x]`
- **Page :** `app/(admin)/users/page.tsx:113`
- **Problème :** Seulement "Précédent / Suivant" sans numéros de pages ni saut direct.
- **Solution :** Afficher les numéros de pages cliquables (avec ellipsis pour les grandes listes).

---

### #25 — UUID utilisateur copiable (non brut)
- **Statut :** `[x]`
- **Page :** `app/(admin)/users/[userId]/page.tsx:57`
- **Problème :** UUID brut affiché en entier, peu utile visuellement.
- **Solution :** Tronquer (`xxxxxxxx-...`) avec bouton "copier" sur clic.

---

### #28 — Grille stats utilisateurs déséquilibrée
- **Statut :** `[x]`
- **Page :** `app/(admin)/stats/page.tsx:76`
- **Problème :** 1 seule carte dans une grille 4 colonnes — 3 colonnes vides.
- **Solution :** Ajouter d'autres métriques utilisateurs (ex: inscrits ce mois, actifs 7 derniers jours) ou réduire la grille à 1 colonne pour cette section.

---

### #29 — Animation des barres de progression dans Stats
- **Statut :** `[x]`
- **Page :** `app/(admin)/stats/page.tsx:104`
- **Problème :** Les barres apparaissent à leur taille finale sans animation.
- **Solution :** Utiliser une animation CSS `@keyframes` ou Framer Motion pour animer de 0% à la valeur cible au chargement.

---

### #30 — Sidebar rétractable (icônes seulement)
- **Statut :** `[x]`
- **Page :** `app/(admin)/components/Sidebar.tsx`
- **Problème :** 240px fixes permanents, aucun mode compact.
- **Solution :** Ajouter un bouton toggle qui réduit la sidebar à `w-16` (icônes seulement) avec tooltip au survol.

---

### #31 — Badge "Admin" contraste insuffisant
- **Statut :** `[x]`
- **Page :** `app/(admin)/components/Sidebar.tsx:38`
- **Problème :** `text-slate-500` sur `bg-slate-900` — ratio de contraste trop faible.
- **Solution :** Passer à `text-slate-300` ou utiliser un badge stylé (`bg-indigo-900 text-indigo-300`).

---

## Résumé de progression

| Priorité | Total | Terminé |
|----------|-------|---------|
| Haute    | 4     | 4       |
| Moyenne  | 7     | 7       |
| Basse    | 9     | 9       |
| **Total**| **20**| **20**  |

> Toutes les tâches de l'audit du 2026-06-19 sont terminées.
