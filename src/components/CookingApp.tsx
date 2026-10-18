'use client';

import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { EMPTY_FILTERS, PAGE_SIZE, type SearchFilters, type SortOrder, type View } from '@/types/meal';
import { useToast } from '@/hooks/use-toast';
import { useFavorites } from '@/hooks/use-favorites';
import { useRecipeFilters } from '@/hooks/use-recipe-filters';
import { useRecipes } from '@/hooks/use-recipes';
import { useRecipeDialog } from '@/hooks/use-recipe-dialog';
import Header from '@/components/layout/Header';
import SectionIntro from '@/components/home/SectionIntro';
import DiscoveryBanner from '@/components/home/DiscoveryBanner';
import SearchPanel from '@/components/search/SearchPanel';
import CategoryChips from '@/components/search/CategoryChips';
import FilterStatus from '@/components/search/FilterStatus';
import ResultsHeading from '@/components/recipes/ResultsHeading';
import RecipeGrid from '@/components/recipes/RecipeGrid';
import ResultsState from '@/components/recipes/ResultsState';
import LoadMoreButton from '@/components/recipes/LoadMoreButton';
import RecipeDialog from '@/components/recipe/RecipeDialog';
import Toast from '@/components/ui/Toast';

export default function CookingApp({ hero, footer }: { hero: ReactNode; footer: ReactNode }) {
  const [view, setView] = useState<View>('discover');
  const [draft, setDraft] = useState<SearchFilters>(EMPTY_FILTERS);
  const [filters, setFilters] = useState<SearchFilters>(EMPTY_FILTERS);
  const [sort, setSort] = useState<SortOrder>('default');
  const [limit, setLimit] = useState(PAGE_SIZE);
  const toast = useToast();
  const favorites = useFavorites(toast.notify);
  const options = useRecipeFilters(favorites.meals);
  const recipes = useRecipes(filters, view, favorites.meals);
  const dialog = useRecipeDialog();
  const cookbook = { savedIds: favorites.savedIds, savingIds: favorites.savingIds, onToggle: favorites.toggle };

  const sortedMeals = useMemo(() => {
    const meals = [...recipes.meals];
    if (sort !== 'default') meals.sort((a, b) => a.strMeal.localeCompare(b.strMeal) * (sort === 'za' ? -1 : 1));
    return meals;
  }, [recipes.meals, sort]);
  const visible = sortedMeals.slice(0, limit);

  function search(next = draft) {
    setFilters({ ...next, query: next.query.trim() });
    setLimit(PAGE_SIZE);
  }
  function changeFilters(next: SearchFilters, submit = false) {
    setDraft(next);
    if (submit) search(next);
  }
  function reset() {
    setDraft(EMPTY_FILTERS);
    setFilters({ ...EMPTY_FILTERS });
    setSort('default');
    setLimit(PAGE_SIZE);
  }
  function changeView(next: View) {
    setView(next);
    reset();
    document.getElementById('explore')?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }
  const closeRecipe = dialog.close;
  const dismissToast = toast.dismiss;
  const closeDialog = useCallback(() => { closeRecipe(); dismissToast(); }, [closeRecipe, dismissToast]);

  return <>
    <div id="cooking-app">
      <a className="skip-link" href="#explore">Skip to recipes</a>
      <Header view={view} savedCount={favorites.meals.length} onViewChange={changeView} onRandom={() => void dialog.openRecipe()} />
      <main>
        {hero}
        <section className="explore-section" id="explore" aria-labelledby="results-title">
          <div className="shell">
            <SectionIntro />
            <SearchPanel filters={draft} categories={options.categories} areas={options.areas} onChange={changeFilters} onSearch={() => search()} onReset={reset} />
            <FilterStatus error={options.error} loading={options.loading} onRetry={options.retry} />
            <CategoryChips categories={options.categories} selected={draft.category} onSelect={(category) => changeFilters({ ...draft, category }, true)} />
            <ResultsHeading filters={filters} view={view} loading={recipes.loading} error={recipes.error} visible={visible.length} total={recipes.meals.length} sort={sort} onSort={(value) => { setSort(value); setLimit(PAGE_SIZE); }} />
            <RecipeGrid meals={visible} loading={recipes.loading} cookbook={cookbook} onOpen={dialog.openRecipe} />
            <ResultsState hidden={recipes.loading || (!recipes.error && recipes.meals.length > 0)} error={recipes.error} emptyCookbook={view === 'favorites' && favorites.meals.length === 0} onRetry={() => search()} onReset={reset} onDiscover={() => changeView('discover')} />
            <LoadMoreButton hidden={recipes.loading || recipes.error || visible.length >= sortedMeals.length} onLoadMore={() => {
              const index = visible.length;
              setLimit((value) => value + PAGE_SIZE);
              requestAnimationFrame(() => document.querySelectorAll<HTMLButtonElement>('#meals [data-recipe]')[index]?.focus({ preventScroll: true }));
            }} />
            <DiscoveryBanner onRandom={() => void dialog.openRecipe()} />
          </div>
        </section>
      </main>
      {footer}
    </div>
    {!dialog.open && <Toast message={toast.message} />}
    <RecipeDialog open={dialog.open} loading={dialog.loading} error={dialog.error} meal={dialog.meal} target={dialog.target} cookbook={cookbook} toast={toast.message} notify={toast.notify} onClose={closeDialog} onRetry={() => void dialog.retry()} />
  </>;
}
