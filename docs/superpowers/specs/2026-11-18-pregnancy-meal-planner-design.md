# Pregnancy Meal Planner – Design

Date: 2026-11-18 · Owner: Matej · Status: draft for approval

## Intent and why
Matej and his pregnant partner (week ~22.5, due 21 Mar 2027, SLE since age 14, 160 cm / 50 kg) struggle daily with "what do we cook?". Matej is busy. The app lets them plan breakfast, lunch, dinner and snacks ahead and generates a shopping list, with meals that suit pregnancy and are buyable in Slovenia.

## Goals
- Weekly plan grid: 7 days x 4 meals (breakfast, lunch, dinner, snack).
- Shopping list generated from the plan: merged quantities, grouped by shop aisle, tick-off, manual items. Synced live between two phones.
- Starter library of about 60 original recipes (written by us, not copied) with Slovenian-available ingredients, prep time and nutrition tags (iron, folate, calcium, protein, omega-3, B12, fibre).
- "Import from link": read a recipe from European sites that publish standard schema.org Recipe data; stored with source link.
- Pregnancy-safe by default: no meat except minced beef in bolognese/lasagna; eggs fully cooked, pasteurised dairy, low-mercury fish in limited amounts; no raw fish, unpasteurised cheese, raw sprouts.
- Filters: meal type, prep time, nutrient tag, favourites. Quick "suggest a week" that fills empty slots.
- Modern minimalist UI, mobile-first, installable (PWA), Slovenian and English text.

## Non-goals
- No medical advice, calorie targets, or lupus treatment guidance. A short notice says to confirm diet with her doctor or dietitian.
- No scraping or republishing full copyrighted recipes; no live supermarket stock or price checks.
- No public accounts, social features, or multi-household support.

## Anti-goals
- Planning must never take longer than the cooking it replaces: adding a meal is at most 2 taps.
- Never present an unsafe food as safe; unknown ingredients on imported recipes get a "check" flag rather than a pass.

## Constraints
- Meat-free except minced beef in bolognese/lasagna (not vegetarian: fish, eggs, dairy assumed OK; Matej to confirm any other dislikes/allergies).
- Ingredients should be common in Slovenian shops (Mercator, Spar, Hofer, Lidl); the user flags anything unavailable.
- Two users, shared data, phones primary.

## Approaches considered
- A. PWA, data in browser only: simplest, no sync. Rejected.
- **B. PWA + Supabase shared database (chosen by Matej):** both phones share plan and list in real time. Needs a Supabase project and a simple shared login.
- C. Single published artifact page with sharing: fast but less control and offline support. Rejected.

## Decisions made together
- Approach B, meat rule and fish/eggs/dairy assumption as above.
- Starter recipes written by us plus import-by-link.

## Calls I made (please check)
- Stack: Vite + React + TypeScript + Tailwind, Supabase (Postgres, auth, realtime), hosted as a static site.
- Auth: one shared household, email magic link for the two of you; row-level security so only members read data.
- Recipes store ingredients as structured rows (name, quantity, unit, aisle) so lists can be merged.
- Imports pass through a safety check against a keyword list of avoided foods.
- Style: white/warm-grey, one soft green accent, large type, generous spacing, bottom tab bar (Plan, Recipes, Shopping).

## Left to the builder
- Exact schema, component structure, the ingredient-aisle mapping, the recipe text, and visual details within the style above.
- Creating the Supabase project/tables needs Matej's go-ahead first.

## Open items
- Hosting target for the finished site (Matej to choose).
- Any further foods she dislikes or must avoid.
