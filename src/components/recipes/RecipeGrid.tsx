import type { CookbookControls, Meal } from '@/types/meal';
import RecipeCard from './RecipeCard';
import RecipeSkeleton from './RecipeSkeleton';

interface Props { meals: Meal[]; loading: boolean; cookbook: CookbookControls; onOpen: (id: string) => void }

export default function RecipeGrid({ meals, loading, cookbook, onOpen }: Props) {
  return <div id="meals" className="meal-grid" aria-busy={loading}>{loading ? Array.from({ length: 8 }, (_, index) => <RecipeSkeleton key={index} />) : meals.map((meal) => <RecipeCard key={meal.idMeal} meal={meal} cookbook={cookbook} onOpen={onOpen} />)}</div>;
}
