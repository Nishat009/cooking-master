'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getMeal, getRandomMeal } from '@/lib/mealdb';
import type { Meal } from '@/types/meal';

export function useRecipeDialog() {
  const [state, setState] = useState<{ open: boolean; loading: boolean; error: boolean; meal: Meal | null; target: string | null }>({ open: false, loading: false, error: false, meal: null, target: null });
  const requestId = useRef(0);
  const open = useCallback(async (id: string | null = null) => {
    const request = ++requestId.current;
    setState({ open: true, loading: true, error: false, meal: null, target: id });
    try {
      const meal = id ? await getMeal(id) : await getRandomMeal();
      if (request === requestId.current) setState({ open: true, loading: false, error: false, meal, target: id });
    } catch {
      if (request === requestId.current) setState({ open: true, loading: false, error: true, meal: null, target: id });
    }
  }, []);
  const close = useCallback(() => {
    requestId.current++;
    setState((previous) => ({ ...previous, open: false }));
  }, []);
  useEffect(() => {
    const readHash = () => {
      const match = location.hash.match(/^#meal=(\d+)$/);
      if (match) void open(match[1]);
    };
    readHash();
    window.addEventListener('hashchange', readHash);
    return () => window.removeEventListener('hashchange', readHash);
  }, [open]);
  return { ...state, openRecipe: open, close, retry: () => open(state.target) };
}
