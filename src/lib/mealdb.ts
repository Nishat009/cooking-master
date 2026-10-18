import type { Meal, SearchFilters } from '@/types/meal';
import { isMeal } from './meal-utils';

const API_BASE = 'https://www.themealdb.com/api/json/v1/1/';
const CACHE_TTL = 5 * 60 * 1000;
interface ApiResponse { meals?: unknown; categories?: unknown }
const requests = new Map<string, { promise: Promise<ApiResponse>; time: number }>();
const details = new Map<string, Meal>();

async function request(endpoint: string, params: Record<string, string> = {}, cache = true): Promise<ApiResponse> {
  const url = new URL(endpoint, API_BASE);
  url.search = new URLSearchParams(params).toString();
  const key = url.href;
  const existing = requests.get(key);
  if (cache && existing && Date.now() - existing.time < CACHE_TTL) return existing.promise;

  const promise = (async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(key, { signal: controller.signal });
      if (!response.ok) throw new Error('The recipe service is temporarily unavailable.');
      const data: unknown = await response.json();
      if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Unexpected recipe response.');
      return data as ApiResponse;
    } finally { clearTimeout(timeout); }
  })();
  if (cache) requests.set(key, { promise, time: Date.now() });
  try { return await promise; }
  catch (error) {
    if (requests.get(key)?.promise === promise) requests.delete(key);
    throw error;
  }
}

function mealsFrom(data: ApiResponse): Meal[] {
  return Array.isArray(data.meals) ? data.meals.filter(isMeal) : [];
}

export function cacheMeal(meal: Meal) {
  if (typeof meal.strInstructions === 'string') details.set(meal.idMeal, meal);
}

export async function searchMeals({ query, mode, category, area }: SearchFilters): Promise<Meal[]> {
  const queries: Promise<ApiResponse>[] = [];
  if (query) queries.push(request(mode === 'ingredient' ? 'filter.php' : 'search.php', mode === 'ingredient' ? { i: query.replace(/\s+/g, '_') } : { s: query }));
  if (category) queries.push(request('filter.php', { c: category }));
  if (area) queries.push(request('filter.php', { a: area }));
  if (!queries.length) queries.push(request('search.php', { s: '' }));
  const sets = (await Promise.all(queries)).map(mealsFrom);
  const otherIds = sets.slice(1).map((meals) => new Set(meals.map(({ idMeal }) => idMeal)));
  const meals = sets[0]
    .filter(({ idMeal }) => otherIds.every((ids) => ids.has(idMeal)))
    .map((meal) => ({ ...meal, strCategory: meal.strCategory || category, strArea: meal.strArea || area }));
  meals.forEach(cacheMeal);
  return [...new Map(meals.map((meal) => [meal.idMeal, meal])).values()];
}

export async function getMeal(id: string): Promise<Meal> {
  if (!/^\d+$/.test(id)) throw new Error('Invalid recipe.');
  const cached = details.get(id);
  if (cached) return cached;
  const meal = mealsFrom(await request('lookup.php', { i: id }))[0];
  if (!meal) throw new Error('This recipe is no longer available.');
  cacheMeal(meal);
  return meal;
}

export async function getRandomMeal(): Promise<Meal> {
  const meal = mealsFrom(await request('random.php', {}, false))[0];
  if (!meal) throw new Error('No recipe found.');
  cacheMeal(meal);
  return meal;
}

export async function getCategories(): Promise<string[]> {
  const data = await request('categories.php');
  if (!Array.isArray(data.categories)) throw new Error('Categories unavailable.');
  return data.categories.map((item: { strCategory?: unknown }) => item?.strCategory).filter((name): name is string => typeof name === 'string').sort();
}

export async function getAreas(): Promise<string[]> {
  const data = await request('list.php', { a: 'list' });
  if (!Array.isArray(data.meals)) throw new Error('Cuisines unavailable.');
  return data.meals.map((item: { strArea?: unknown }) => item?.strArea).filter((name): name is string => typeof name === 'string').sort();
}
