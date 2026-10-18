export interface Meal {
  idMeal: string;
  strMeal: string;
  strMealThumb?: string | null;
  strCategory?: string | null;
  strArea?: string | null;
  strInstructions?: string | null;
  strYoutube?: string | null;
  strSource?: string | null;
  [key: `strIngredient${number}`]: string | null | undefined;
  [key: `strMeasure${number}`]: string | null | undefined;
}

export interface Ingredient {
  name: string;
  measure: string;
}

export interface SearchFilters {
  query: string;
  mode: 'name' | 'ingredient';
  category: string;
  area: string;
}

export type View = 'discover' | 'favorites';
export type SortOrder = 'default' | 'az' | 'za';

export interface CookbookControls {
  savedIds: Set<string>;
  savingIds: Set<string>;
  onToggle: (id: string) => void;
}

export const EMPTY_FILTERS: SearchFilters = { query: '', mode: 'name', category: '', area: '' };
export const PAGE_SIZE = 12;
