import Icon from '@/components/ui/Icon';
import type { SearchFilters } from '@/types/meal';

interface Props {
  filters: SearchFilters;
  categories: string[];
  areas: string[];
  onChange: (field: 'category' | 'area', value: string) => void;
  onReset: () => void;
}

export default function FilterBar({ filters, categories, areas, onChange, onReset }: Props) {
  return (
    <div className="filter-row">
      <span className="filter-label">Make it yours</span>
      <label><Icon name="pot" /><span className="sr-only">Category</span><select id="category-filter" value={filters.category} onChange={(event) => onChange('category', event.target.value)}><option value="">All categories</option>{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
      <label><Icon name="globe" /><span className="sr-only">Cuisine</span><select id="area-filter" value={filters.area} onChange={(event) => onChange('area', event.target.value)}><option value="">All cuisines</option>{areas.map((area) => <option key={area}>{area}</option>)}</select></label>
      <button id="reset-filters" type="button" className="text-button" onClick={onReset}>Reset filters</button>
    </div>
  );
}
