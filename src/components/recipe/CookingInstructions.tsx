import type { Meal } from '@/types/meal';
import RecipeLinks from './RecipeLinks';

export default function CookingInstructions({ meal }: { meal: Meal }) {
  const steps = String(meal.strInstructions || '').trim().split(/\r?\n+/).map((step) => step.trim()).filter(Boolean);
  return <section><h3>Let’s make it</h3><p className="recipe-hint">A little care makes a delicious difference.</p>{steps.length ? <ol className="instruction-list">{steps.map((step, index) => <li key={index}>{step}</li>)}</ol> : <p>Cooking instructions are not available for this recipe.</p>}<RecipeLinks meal={meal} /></section>;
}
