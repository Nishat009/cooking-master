live: https://cooking-m.netlify.app/
 # Cooking Master

A Next.js 16 App Router + React 19 + TypeScript recipe discovery app powered by the same TheMealDB V1 API. The previous design, browser cookbook, search/filter behavior, and recipe features are preserved.

## Run locally

Use Node.js 20.9 or newer:

```sh
npm install
npm run dev
```

Open http://127.0.0.1:5500. The development server supports Fast Refresh and listens only on your machine.

For a production build:

```sh
npm run build
npm start
```

Both servers use port 5500. Stop one before starting the other. To choose another port directly: `npx next dev --hostname 127.0.0.1 --port 5501`.

## Project structure

```text
src/
  app/
    layout.tsx              # Metadata, viewport, and global stylesheet
    page.tsx                # Server page: composes the app, hero, and footer
    error.tsx               # Route error boundary
    not-found.tsx           # 404 page
    globals.css             # Existing responsive design and print styles
  components/
    CookingApp.tsx          # Client composition and search/view state
    layout/                 # Header, Footer
    home/                   # Hero, SectionIntro, DiscoveryBanner
    search/                 # SearchPanel, FilterBar, CategoryChips, FilterStatus
    recipes/                # RecipeCard, RecipeGrid, RecipeSkeleton, SaveButton,
                            # ResultsHeading, ResultsState, LoadMoreButton
    recipe/                 # RecipeDialog, RecipeDetails, RecipeActions,
                            # IngredientChecklist, CookingInstructions, RecipeLinks
    ui/                     # Brand, Icon, FoodImage, Toast
  hooks/
    use-recipes.ts          # Discovery/cookbook results and stale-request handling
    use-recipe-filters.ts   # Category/cuisine loading, retries, offline options
    use-favorites.ts        # Browser storage, concurrent saves, cross-tab updates
    use-recipe-dialog.ts    # Details, random recipes, shared hash links
    use-toast.ts            # Notifications and timer cleanup
  lib/
    mealdb.ts               # Typed API access, timeouts, deduplication and caches
    meal-utils.ts           # Safe URLs, validation, ingredients and local filtering
  types/
    meal.ts                 # Meal, ingredient, search and component types
public/
  icon.svg
tests/
  app.test.cjs              # Browser regression tests with API fixtures
  live-smoke.cjs            # Optional browser test against the real API
```

The root layout, home page, Hero, and Footer are composed on the server. The interactive app is a client boundary, with API/storage work in hooks after hydration. Browser-only APIs never run during server rendering. Components use typed props and React event handlers; there are no HTML string templates or global DOM event handlers. The native dialog uses a body portal to preserve focus management and printing.

## Features

- Meal-name and single-ingredient search, including Enter to submit.
- Combined category/cuisine/search filters using meal-ID intersection.
- Category shortcuts, alphabetical sorting, 12-card batches, and Load more.
- Full recipe dialog with up to 20 ingredients, measures, instructions and available video/source links.
- Ingredient checklist, printable recipes, shareable `#meal=ID` links, and random meals.
- My cookbook stores full recipes in localStorage and supports local search/filtering when the API is unavailable.
- Loading skeletons, retries, empty states, image fallbacks, stale-response protection, responsive layouts, and keyboard controls.

The original localStorage key `cooking-master:cookbook:v1` is retained. Existing favorites remain available when you use the same browser and origin (http://127.0.0.1:5500). Browser storage is not a cloud account; clearing it removes saved recipes.

## API

Uses `search.php`, `filter.php`, `lookup.php`, `random.php`, `categories.php`, and `list.php` at `https://www.themealdb.com/api/json/v1/1/`. Discovery requests are cached for five minutes, full recipe details are kept in memory, and random requests are never cached. The default collection is an API sample, not the entire database. Multiple ingredient searches require a premium API and are not included.

The existing developer test key `1` remains for local/educational use. See [TheMealDB API documentation](https://www.themealdb.com/api.php) for production terms. Food images use `next/image` with `unoptimized` so the browser can load the provider's images directly without an additional image proxy. Google Fonts is optional, with system-font fallbacks.

## Checks

```sh
npm run lint
npm run typecheck
npm run build
npm test
```

Build before running `npm test`. Tests start a separate Next.js production server on port 5511 and use Playwright with installed Chrome/Edge (or Playwright Chromium). API fixtures cover the existing interactions, persistence/offline behavior, retry flows, escaping, mobile layout, and Next.js route responses.

With the app running, `npm run test:live` checks the real API in Chrome, sharing, and print layout. It saves desktop/mobile screenshots under the ignored `test-results/` directory and requires internet access.
