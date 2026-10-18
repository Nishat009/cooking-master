import type { SearchFilters, SortOrder, View } from '@/types/meal';

interface Props { filters: SearchFilters; view: View; loading: boolean; error: boolean; visible: number; total: number; sort: SortOrder; onSort: (value: SortOrder) => void }

export default function ResultsHeading({ filters, view, loading, error, visible, total, sort, onSort }: Props) {
  const { query, category, area } = filters;
  const title = view === 'favorites' ? 'Your personal cookbook' : query ? `Recipes for “${query}”` : category ? `${category} recipes to love` : area ? `Explore ${area} cooking` : 'A little dinner inspiration';
  const count = loading ? 'Finding something delicious…' : error ? 'The recipe collection is taking a little break.' : total ? `Showing ${visible} of ${total} ${total === 1 ? 'recipe' : 'recipes'}${view === 'favorites' ? ' in your cookbook' : ' to inspire your next meal'}` : 'A fresh start for your next meal.';
  return <div className="results-heading"><div><h3 id="results-title">{title}</h3><p id="results-count" role="status" aria-live="polite">{count}</p></div><label className="sort-label">Sort by <select id="sort-order" value={sort} onChange={(event) => onSort(event.target.value as SortOrder)}><option value="default">Recommended</option><option value="az">Name: A–Z</option><option value="za">Name: Z–A</option></select></label></div>;
}
