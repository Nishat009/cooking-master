'use client';

import { useCallback, useEffect, useState } from 'react';
import { searchMeals } from '@/lib/mealdb';
import { filterCookbook } from '@/lib/meal-utils';
import type { Meal, SearchFilters, View } from '@/types/meal';

export function useRecipes(filters: SearchFilters, view: View, favorites: Meal[]) {
  const [result, setResult] = useState<{ meals: Meal[]; loading: boolean; error: boolean }>({ meals: [], loading: true, error: false });
  const [attempt, setAttempt] = useState(0);
  // Cookbook changes only reload results when viewing the cookbook.
  const cookbook = view === 'favorites' ? favorites : null;
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setResult((previous) => ({ ...previous, loading: true, error: false }));
      try {
        const meals = cookbook ? filterCookbook(cookbook, filters) : await searchMeals(filters);
        if (!cancelled) setResult({ meals, loading: false, error: false });
      } catch {
        if (!cancelled) setResult({ meals: [], loading: false, error: true });
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [filters, cookbook, attempt]);
  const retry = useCallback(() => setAttempt((value) => value + 1), []);
  return { ...result, retry };
}
