import type { Ingredient, Meal, SearchFilters } from '@/types/meal';

export function isMeal(value: unknown): value is Meal {
  if (!value || typeof value !== 'object') return false;
  const meal = value as Partial<Meal>;
  return typeof meal.idMeal === 'string' && /^\d+$/.test(meal.idMeal) && typeof meal.strMeal === 'string';
}

export function safeURL(value: string | null | undefined, allowedHosts?: string[]): string {
  try {
    const url = new URL(value || '');
    return url.protocol === 'https:' && (!allowedHosts || allowedHosts.includes(url.hostname)) ? url.href : '';
  } catch { return ''; }
}

export function ingredientsFor(meal: Meal): Ingredient[] {
  return Array.from({ length: 20 }, (_, index) => ({
    name: String(meal[`strIngredient${index + 1}`] || '').trim(),
    measure: String(meal[`strMeasure${index + 1}`] || '').trim(),
  })).filter(({ name }) => name);
}

export function filterCookbook(meals: Meal[], filters: SearchFilters): Meal[] {
  const { query, mode, category, area } = filters;
  const term = query.toLowerCase().replace(/_/g, ' ');
  return meals.filter((meal) => {
    const matchesQuery = !query || (mode === 'ingredient'
      ? ingredientsFor(meal).some(({ name }) => name.toLowerCase().includes(term))
      : meal.strMeal.toLowerCase().includes(term));
    return matchesQuery && (!category || meal.strCategory === category) && (!area || meal.strArea === area);
  });
}

export function filterOptions(values: (string | null | undefined)[]): string[] {
  return [...new Set(values.filter((value): value is string => typeof value === 'string' && Boolean(value)))].sort();
}
