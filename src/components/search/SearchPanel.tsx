import type { SearchFilters } from '@/types/meal';
import Icon from '@/components/ui/Icon';
import FilterBar from './FilterBar';

interface Props {
  filters: SearchFilters;
  categories: string[];
  areas: string[];
  onChange: (filters: SearchFilters, submit?: boolean) => void;
  onSearch: () => void;
  onReset: () => void;
}

export default function SearchPanel({ filters, categories, areas, onChange, onSearch, onReset }: Props) {
  return (
    <form id="search-form" className="search-panel" role="search" onSubmit={(event) => { event.preventDefault(); onSearch(); }}>
      <div className="search-row">
        <label className="search-input-wrap" htmlFor="meal"><Icon name="search" /><span className="sr-only">Search recipes</span><input id="meal" type="search" placeholder={filters.mode === 'ingredient' ? 'One ingredient, endless possibilities. Try chicken…' : 'Try chicken, pasta, or your favorite dish…'} maxLength={100} autoComplete="off" value={filters.query} onChange={(event) => onChange({ ...filters, query: event.target.value })} /></label>
        <label className="mode-wrap"><span className="sr-only">Search by</span><select id="search-mode" value={filters.mode} onChange={(event) => onChange({ ...filters, mode: event.target.value as SearchFilters['mode'] }, Boolean(filters.query.trim()))}><option value="name">By meal name</option><option value="ingredient">By ingredient</option></select></label>
        <button className="button button-primary" type="submit" id="search-button">Find recipes <Icon name="arrow" /></button>
      </div>
      <FilterBar filters={filters} categories={categories} areas={areas} onChange={(field, value) => onChange({ ...filters, [field]: value }, true)} onReset={onReset} />
    </form>
  );
}
