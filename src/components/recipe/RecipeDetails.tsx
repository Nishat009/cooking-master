import type { CookbookControls, Meal } from '@/types/meal';
import { ingredientsFor } from '@/lib/meal-utils';
import FoodImage from '@/components/ui/FoodImage';
import IngredientChecklist from './IngredientChecklist';
import CookingInstructions from './CookingInstructions';
import RecipeActions from './RecipeActions';

interface Props { meal: Meal; cookbook: CookbookControls; notify: (message: string) => void }

export default function RecipeDetails({ meal, cookbook, notify }: Props) {
  return <>
    <div className="recipe-hero">
      <FoodImage className="recipe-photo" src={meal.strMealThumb} alt={meal.strMeal} priority />
      <div className="recipe-overview"><div className="eyebrow">FROM THE RECIPE COLLECTION</div><h2 id="recipe-title">{meal.strMeal}</h2><div className="recipe-badges">{[meal.strCategory, meal.strArea].filter(Boolean).map((label, index) => <span key={`${index}-${label}`}>{label}</span>)}</div><RecipeActions id={meal.idMeal} cookbook={cookbook} notify={notify} /></div>
    </div>
    <div className="recipe-body"><IngredientChecklist ingredients={ingredientsFor(meal)} /><CookingInstructions meal={meal} /></div>
    <p className="recipe-credit">Recipe provided by TheMealDB.</p>
  </>;
}
