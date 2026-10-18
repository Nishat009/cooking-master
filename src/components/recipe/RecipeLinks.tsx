import type { Meal } from '@/types/meal';
import { safeURL } from '@/lib/meal-utils';
import Icon from '@/components/ui/Icon';

export default function RecipeLinks({ meal }: { meal: Meal }) {
  const video = safeURL(meal.strYoutube, ['www.youtube.com', 'youtube.com', 'youtu.be', 'm.youtube.com']);
  const source = safeURL(meal.strSource);
  return <div className="recipe-links">{video && <a href={video} target="_blank" rel="noopener noreferrer"><Icon name="play" /> Watch on YouTube ↗</a>}{source && <a href={source} target="_blank" rel="noopener noreferrer">Original recipe ↗</a>}</div>;
}
