import type { Ingredient } from '@/types/meal';

export default function IngredientChecklist({ ingredients }: { ingredients: Ingredient[] }) {
  return (
    <section>
      <h3>Ingredients</h3>
      <p className="recipe-hint">{ingredients.length} ingredients · Check them off as you go</p>
      <ul className="ingredient-list">{ingredients.length ? ingredients.map((item, index) => <li key={`${index}-${item.name}`}><label><input type="checkbox" /><span>{item.name}{item.measure && <small>{item.measure}</small>}</span></label></li>) : <li>No ingredients were provided for this recipe.</li>}</ul>
    </section>
  );
}
