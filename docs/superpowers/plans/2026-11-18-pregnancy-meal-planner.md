# Pregnancy Meal Planner Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A mobile-first PWA where Matej and his partner plan 4 meals a day, share the plan and a generated shopping list live, using pregnancy-safe, Slovenia-friendly recipes.

**Architecture:** Static React app in `meal-planner/`. Pure TypeScript domain logic (safety, shopping aggregation, week suggestion, recipe import parsing) is unit-tested and kept free of UI and network. Supabase provides auth (magic link), Postgres with row-level security, and realtime sync; one edge function imports recipes from URLs.

**Tech Stack:** Vite, React 18, TypeScript, Tailwind, Vitest + Testing Library, Supabase (supabase-js, Postgres, Edge Functions), vite-plugin-pwa.

**Spec:** `docs/superpowers/specs/2026-11-18-pregnancy-meal-planner-design.md`. Visual reference: Artifact https://claude.ai/artifact/SxW2eDn3ovcFumnLHXZUvg (screens Plan, Recipes, Shopping).

## Global Constraints

- Meat-free except minced beef in bolognese/lasagna; fish, eggs, dairy allowed.
- Pregnancy-safe default: eggs fully cooked, pasteurised dairy only, low-mercury fish in limited amounts, no raw fish, no unpasteurised cheese, no raw sprouts.
- Not medical advice; a visible notice says to confirm diet with her doctor or dietitian.
- Starter recipes are original (not copied); imports store the source link.
- Four meal slots per day: `breakfast | lunch | dinner | snack`. Weeks start Monday.
- Ingredients common in Slovenian shops (Mercator, Spar, Hofer, Lidl).
- UI in Slovenian and English; mobile-first; installable PWA.
- Style: bg `#FAF8F4`, ink `#1F2421`, secondary text `#5B625D`, accent `#2F5D3D`, tint `#E6EFE6`, font Inter; tap targets at least 44 px; text contrast at least 4.5:1.
- Adding a meal to the plan takes at most 2 taps.
- Nothing is created in Supabase without Matej's explicit go-ahead.

## Review Focus

- Same ingredient in different units (`g` vs `kg`, `ml` vs `l`) must merge, not duplicate.
- Empty plan produces an empty list with a friendly message, not an error.
- A week crossing the year boundary (28 Dec 2026 – 3 Jan 2027) lists and navigates correctly.
- Imported page with no recipe data gives a clear error and saves nothing.
- Imported ingredient not in the safety lists is flagged "check", never "safe"; Slovenian terms (`surovo mleko`, `nepasterizirano`, `surova riba`) are caught.
- Minced beef in a recipe that is not bolognese/lasagna is flagged.
- Both phones ticking the same shopping item at once ends in a consistent state.

---

## File Structure

- `meal-planner/src/domain/types.ts`: shared types.
- `meal-planner/src/domain/safety.ts`: safety rules.
- `meal-planner/src/domain/shopping.ts`: list aggregation.
- `meal-planner/src/domain/suggest.ts`: week suggestion.
- `meal-planner/src/domain/weeks.ts`: Monday-based week math.
- `meal-planner/src/domain/importRecipe.ts`: JSON-LD recipe parsing.
- `meal-planner/src/data/recipes.ts`: starter library (about 60).
- `meal-planner/src/data/*`: Supabase hooks.
- `meal-planner/src/screens/{Plan,Recipes,Shopping}.tsx`, `src/components/TabBar.tsx`, `src/i18n/{sl,en}.ts`.
- `meal-planner/supabase/migrations/0001_init.sql`, `meal-planner/supabase/functions/import-recipe/index.ts`.

### Task 1: Scaffold and app shell

**Files:** Create `meal-planner/` (Vite React-TS template), `tailwind.config.ts` with the Global Constraints colours, `src/components/TabBar.tsx`, `src/App.tsx`; Test `src/components/TabBar.test.tsx`.

**Interfaces:**
- Produces: `TabBar` (`{ active: 'plan'|'recipes'|'shopping'; onChange(tab): void }`), routes `/`, `/recipes`, `/shopping`.

- [ ] **Step 1: Write failing test** `renders three tabs and marks the active one with aria-current="page"` and `calls onChange with 'shopping' when Shopping is clicked`.
- [ ] **Step 2: Run** `npx vitest run src/components/TabBar.test.tsx`. Expected: FAIL (component missing).
- [ ] **Step 3: Scaffold Vite, Tailwind, Vitest, React Router; implement `TabBar` and the three empty screens** matching the Artifact tab bar (76 px, bottom, icons plus labels).
- [ ] **Step 4: Run tests.** Expected: PASS. Run `npm run build`. Expected: success.
- [ ] **Step 5: Commit** `feat: scaffold app shell`.

### Task 2: Domain types and week math

**Files:** Create `src/domain/types.ts`, `src/domain/weeks.ts`; Test `src/domain/weeks.test.ts`.

**Interfaces:**
- Produces: `type Slot = 'breakfast'|'lunch'|'dinner'|'snack'`; `type Aisle = 'produce'|'dairy-eggs'|'fish'|'bakery'|'pantry'|'frozen'|'other'`; `type Nutrient = 'iron'|'folate'|'calcium'|'protein'|'omega3'|'b12'|'fibre'`; `interface Ingredient { name: string; quantity: number; unit: 'g'|'kg'|'ml'|'l'|'pcs'|'tbsp'|'tsp'; aisle: Aisle }`; `interface Recipe { id: string; title: { sl: string; en: string }; slots: Slot[]; minutes: number; nutrients: Nutrient[]; ingredients: Ingredient[]; steps: string[]; sourceUrl?: string; safety: SafetyResult }`; `interface PlanEntry { id: string; date: string /* YYYY-MM-DD */; slot: Slot; recipeId: string }`; `weekStart(date: string): string` (Monday); `weekDays(start: string): string[]` (7 dates).

- [ ] **Step 1: Failing tests:** `weekStart('2026-11-18') === '2026-11-16'`; `weekDays('2026-12-28')` returns 2026-12-28 … 2027-01-03; Sunday `2026-11-22` maps to `2026-11-16`.
- [ ] **Step 2: Run, expect FAIL.**
- [ ] **Step 3: Implement** using UTC date arithmetic (no local-timezone drift).
- [ ] **Step 4: Run, expect PASS.**
- [ ] **Step 5: Commit** `feat: domain types and week math`.

### Task 3: Safety rules

**Files:** Create `src/domain/safety.ts`; Test `src/domain/safety.test.ts`.

**Interfaces:**
- Consumes: `Ingredient`.
- Produces: `type SafetyResult = { status: 'ok'|'check'|'blocked'; reasons: string[] }`; `checkSafety(title: string, ingredients: Ingredient[]): SafetyResult`.

- [ ] **Step 1: Failing tests:** chicken breast gives `blocked`; minced beef with title "Spinach lasagna with beef" gives `ok`, with title "Beef stew" gives `blocked`; "surovo mleko" and "nepasterizirano mleko" give `blocked`; "raw sprouts" gives `blocked`; "smoked salmon" gives `check`; an ingredient name not in any list (e.g. "mystery paste") gives `check`; plain list of spinach, eggs, feta gives `ok`. Matching is case-insensitive and works for English and Slovenian keywords.
- [ ] **Step 2: Run, expect FAIL.**
- [ ] **Step 3: Implement** with three keyword lists (blocked, check, known-ok) in the same file; anything not known-ok yields `check`.
- [ ] **Step 4: Run, expect PASS.**
- [ ] **Step 5: Commit** `feat: pregnancy safety rules`.

### Task 4: Shopping list aggregation

**Files:** Create `src/domain/shopping.ts`; Test `src/domain/shopping.test.ts`.

**Interfaces:**
- Consumes: `PlanEntry`, `Recipe`, `Aisle`.
- Produces: `interface ShoppingItem { name: string; quantity: number; unit: Ingredient['unit']; aisle: Aisle }`; `buildShoppingList(entries: PlanEntry[], recipes: Recipe[]): Record<Aisle, ShoppingItem[]>`.

- [ ] **Step 1: Failing tests:** 200 g + 0.3 kg spinach merges to one item of 500 g; two recipes using the same ingredient sum; the same recipe planned twice doubles quantities; empty entries give every aisle `[]`; items within an aisle are sorted by name.
- [ ] **Step 2: Run, expect FAIL.**
- [ ] **Step 3: Implement** normalising kg→g and l→ml before merging by lowercase name plus unit.
- [ ] **Step 4: Run, expect PASS.**
- [ ] **Step 5: Commit** `feat: shopping list aggregation`.

### Task 5: Starter recipe library

**Files:** Create `src/data/recipes.ts`; Test `src/data/recipes.test.ts`.

**Interfaces:**
- Consumes: `Recipe`, `checkSafety`.
- Produces: `starterRecipes: Recipe[]` (at least 60, original wording, Slovenian and English titles, at least 10 per slot type breakfast/lunch/dinner and at least 8 snacks).

- [ ] **Step 1: Failing tests:** at least 60 recipes; unique ids; every recipe has at least one nutrient tag, positive `minutes`, and structured ingredients; `checkSafety` returns `ok` for all; only recipes whose title contains bolognese or lasagna may include minced beef.
- [ ] **Step 2: Run, expect FAIL.**
- [ ] **Step 3: Write the recipes** from common Slovenian-shop ingredients: legumes, eggs, dairy, fish, whole grains, greens, vegetables, fruit, nuts. Matej reviews the list and removes anything she dislikes.
- [ ] **Step 4: Run, expect PASS.**
- [ ] **Step 5: Commit** `feat: starter recipe library`.

### Task 6: Week suggestion

**Files:** Create `src/domain/suggest.ts`; Test `src/domain/suggest.test.ts`.

**Interfaces:**
- Consumes: `PlanEntry`, `Recipe`, `weekDays`.
- Produces: `suggestWeek(start: string, existing: PlanEntry[], recipes: Recipe[], seed: number): Omit<PlanEntry,'id'>[]`.

- [ ] **Step 1: Failing tests:** fills only empty slots, never overwrites existing entries; only recipes whose `slots` include the slot are used; no recipe repeats on consecutive days in the same slot when alternatives exist; same seed gives the same output.
- [ ] **Step 2: Run, expect FAIL.**
- [ ] **Step 3: Implement** with a seeded PRNG.
- [ ] **Step 4: Run, expect PASS.**
- [ ] **Step 5: Commit** `feat: week suggestion`.

### Task 7: Recipe import parser

**Files:** Create `src/domain/importRecipe.ts`; Test `src/domain/importRecipe.test.ts` with HTML fixtures in `src/domain/__fixtures__/`.

**Interfaces:**
- Consumes: `Recipe`, `checkSafety`.
- Produces: `parseRecipeFromHtml(html: string, sourceUrl: string): { ok: true; recipe: Omit<Recipe,'id'> } | { ok: false; error: 'no-recipe-data' }`.

- [ ] **Step 1: Failing tests:** fixture with `application/ld+json` Recipe (also inside `@graph`) is parsed into title, minutes (from ISO duration `PT1H15M` = 75), ingredient lines and steps; `sourceUrl` is stored; page with no Recipe data returns `no-recipe-data`; imported recipe with an unknown ingredient has `safety.status === 'check'`; one containing chicken has `blocked`.
- [ ] **Step 2: Run, expect FAIL.**
- [ ] **Step 3: Implement** JSON-LD extraction and ingredient-line parsing (quantity, unit, name; unparsed lines keep `quantity: 1, unit: 'pcs'` and a `check` reason).
- [ ] **Step 4: Run, expect PASS.**
- [ ] **Step 5: Commit** `feat: recipe import parser`.

### Task 8: Supabase schema, auth, data layer (needs Matej's go-ahead)

**Files:** Create `supabase/migrations/0001_init.sql`, `src/data/supabase.ts`, `src/data/usePlan.ts`, `src/data/useShopping.ts`, `src/data/useRecipes.ts`, `src/screens/Login.tsx`.

**Interfaces:**
- Produces: tables `households`, `household_members`, `recipes`, `plan_entries`, `shopping_checks(household_id, item_key, checked)`, `custom_items`, each with RLS allowing only household members; hooks `usePlan(weekStart): { entries; add(date, slot, recipeId); remove(id) }`, `useShoppingChecks(): { checked: Set<string>; toggle(key) }`, `useRecipes(): Recipe[]` (starter plus imported), all subscribed to realtime.

- [ ] **Step 1: Ask Matej for approval** before creating or changing anything in Supabase (project choice, cost); then apply the migration with the Supabase tools.
- [ ] **Step 2: Failing tests** (against mocked client): `usePlan.add` inserts a row with the household id; `toggle` is an upsert (two phones toggling the same key ends in one row, last write wins).
- [ ] **Step 3: Implement** tables, RLS (member-only select/insert/update/delete) and hooks; magic-link login for two invited emails.
- [ ] **Step 4: Run tests and check advisors** (`get_advisors`): no missing-RLS warnings.
- [ ] **Step 5: Commit** `feat: supabase schema and data layer`.

### Task 9: Plan screen

**Files:** Create `src/screens/Plan.tsx`; Test `src/screens/Plan.test.tsx`.

**Interfaces:** Consumes `usePlan`, `useRecipes`, `suggestWeek`, `weekStart`, `weekDays`.

- [ ] **Step 1: Failing tests:** shows day strip Mo–Su with today selected and four slots; an empty slot shows "Add"; tapping Add, then a recipe, fills the slot (2 taps); "Suggest week" fills only empty slots; week navigation across 2026-12-28 shows the right days.
- [ ] **Step 2: Run, expect FAIL.**
- [ ] **Step 3: Implement** per the Artifact's Plan screen, including week number from due date 2027-03-21 (week 40).
- [ ] **Step 4: Run, expect PASS.**
- [ ] **Step 5: Commit** `feat: plan screen`.

### Task 10: Recipes screen with import

**Files:** Create `src/screens/Recipes.tsx`, `supabase/functions/import-recipe/index.ts`; Test `src/screens/Recipes.test.tsx`.

**Interfaces:** Consumes `useRecipes`, `parseRecipeFromHtml`. Edge function `import-recipe` takes `{ url: string }` and returns `{ html: string }` (https only, 1 MB cap, 8 s timeout); parsing happens in the client.

- [ ] **Step 1: Failing tests:** search filters by title (Slovenian and English); nutrient chips filter; `blocked` recipes cannot be added to the plan; `check` recipes show a "check ingredients" label; import error `no-recipe-data` shows a clear message and saves nothing.
- [ ] **Step 2: Run, expect FAIL.**
- [ ] **Step 3: Implement** the screen per the Artifact; deploy the function once Matej approves Supabase changes.
- [ ] **Step 4: Run, expect PASS.**
- [ ] **Step 5: Commit** `feat: recipes screen and import`.

### Task 11: Shopping screen

**Files:** Create `src/screens/Shopping.tsx`; Test `src/screens/Shopping.test.tsx`.

**Interfaces:** Consumes `buildShoppingList`, `useShoppingChecks`, `usePlan`.

- [ ] **Step 1: Failing tests:** items grouped by aisle with quantities; ticking shows strike-through and updates "N of M done"; empty plan shows the empty-state message; adding a custom item appears in "other".
- [ ] **Step 2: Run, expect FAIL.**
- [ ] **Step 3: Implement** per the Artifact.
- [ ] **Step 4: Run, expect PASS.**
- [ ] **Step 5: Commit** `feat: shopping screen`.

### Task 12: Languages, PWA, disclaimer, deploy

**Files:** Create `src/i18n/sl.ts`, `src/i18n/en.ts`, PWA manifest via vite-plugin-pwa; Test `src/i18n/i18n.test.ts`.

- [ ] **Step 1: Failing test:** `sl` and `en` have identical key sets; the disclaimer string exists in both.
- [ ] **Step 2: Run, expect FAIL.**
- [ ] **Step 3: Implement** language switch (default Slovenian), the disclaimer on first launch and in settings, and installable PWA with offline shell.
- [ ] **Step 4: Run all tests and `npm run build`.** Expected: all pass.
- [ ] **Step 5: Deploy** to a free static host (my call: Netlify; confirm with Matej first), set Supabase URL and anon key as build env vars, commit `feat: i18n, pwa, deploy`.
