const PREFERRED = ['Chicken', 'Vegetarian', 'Seafood', 'Pasta', 'Beef', 'Dessert', 'Vegan'];

interface Props { categories: string[]; selected: string; onSelect: (value: string) => void }

export default function CategoryChips({ categories, selected, onSelect }: Props) {
  return (
    <div id="category-chips" className="category-chips" role="group" aria-label="Quick category filters">
      {['', ...PREFERRED.filter((category) => categories.includes(category))].map((category) => <button key={category} className={`chip${selected === category ? ' active' : ''}`} data-category={category} aria-pressed={selected === category} onClick={() => onSelect(category)}>{category || '✦ All recipes'}</button>)}
    </div>
  );
}
