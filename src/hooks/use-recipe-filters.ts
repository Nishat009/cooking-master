'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { getAreas, getCategories } from '@/lib/mealdb';
import { filterOptions } from '@/lib/meal-utils';
import type { Meal } from '@/types/meal';

export function useRecipeFilters(favorites: Meal[]) {
  const [categories, setCategories] = useState<string[]>([]);
  const [areas, setAreas] = useState<string[]>([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const results = await Promise.allSettled([getCategories(), getAreas()]);
      if (cancelled) return;
      if (results[0].status === 'fulfilled') setCategories(results[0].value);
      if (results[1].status === 'fulfilled') setAreas(results[1].value);
      setError(results.some((result) => result.status === 'rejected'));
      setLoading(false);
    }
    void load();
    return () => { cancelled = true; };
  }, [attempt]);

  const options = useMemo(() => ({
    categories: filterOptions([...categories, ...favorites.map((meal) => meal.strCategory)]),
    areas: filterOptions([...areas, ...favorites.map((meal) => meal.strArea)]),
  }), [categories, areas, favorites]);
  const retry = useCallback(() => setAttempt((value) => value + 1), []);
  return { ...options, error, loading, retry };
}
