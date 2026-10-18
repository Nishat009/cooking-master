import { Fragment } from 'react';
import type { CookbookControls, Meal } from '@/types/meal';
import FoodImage from '@/components/ui/FoodImage';
import Icon from '@/components/ui/Icon';
import SaveButton from './SaveButton';

interface Props { meal: Meal; cookbook: CookbookControls; onOpen: (id: string) => void }

export default function RecipeCard({ meal, cookbook, onOpen }: Props) {
  const meta = [meal.strCategory, meal.strArea].filter(Boolean);
  return (
    <article className="meal-card">
      <div className="meal-image-wrap"><FoodImage src={meal.strMealThumb} alt={meal.strMeal} /></div>
      <SaveButton id={meal.idMeal} saved={cookbook.savedIds.has(meal.idMeal)} busy={cookbook.savingIds.has(meal.idMeal)} onToggle={cookbook.onToggle} />
      <div className="meal-card-body">
        <div className="meal-meta">{meta.length ? meta.map((value, index) => <Fragment key={`${index}-${value}`}>{index > 0 && <span className="meta-dot" />}{value}</Fragment>) : 'A new flavor to discover'}</div>
        <h4><button className="recipe-open" data-recipe={meal.idMeal} title={meal.strMeal} onClick={() => onOpen(meal.idMeal)}>{meal.strMeal}</button></h4>
        <div className="card-bottom"><span>Let’s get cooking</span><Icon name="arrow" /></div>
      </div>
    </article>
  );
}
