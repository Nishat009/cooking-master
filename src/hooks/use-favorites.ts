'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { cacheMeal, getMeal } from '@/lib/mealdb';
import { isMeal } from '@/lib/meal-utils';
import type { Meal } from '@/types/meal';

const STORAGE_KEY = 'cooking-master:cookbook:v1';

export function useFavorites(notify: (message: string) => void) {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [savingIds, setSavingIds] = useState(new Set<string>());
  const favorites = useRef(new Map<string, Meal>());
  const pending = useRef(new Set<string>());

  useEffect(() => {
    function hydrate() {
      try {
        const stored: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        const saved = Array.isArray(stored) ? stored.filter(isMeal) : [];
        favorites.current = new Map(saved.map((meal) => [meal.idMeal, meal]));
        saved.forEach(cacheMeal);
        setMeals([...favorites.current.values()]);
      } catch {
        notify('Your cookbook couldn’t be read. Browser storage may be unavailable.');
      }
    }
    // Hydrate only after mounting; the server and first client render stay identical.
    hydrate();
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY || event.key === null) hydrate();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [notify]);

  const toggle = useCallback(async (id: string) => {
    if (pending.current.has(id)) return;
    pending.current.add(id);
    setSavingIds(new Set(pending.current));
    try {
      const wasSaved = favorites.current.has(id);
      const meal = wasSaved ? null : await getMeal(id);
      // Read the latest map after awaiting so concurrent saves are not lost.
      const next = new Map(favorites.current);
      if (wasSaved) next.delete(id); else if (meal) next.set(id, meal);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next.values()]));
      favorites.current = next;
      setMeals([...next.values()]);
      notify(wasSaved ? 'Recipe removed from your cookbook.' : 'A good find! Saved to your cookbook.');
    } catch {
      notify('Couldn’t save this change. Check your connection and browser storage, then try again.');
    } finally {
      pending.current.delete(id);
      setSavingIds(new Set(pending.current));
    }
  }, [notify]);

  const savedIds = useMemo(() => new Set(meals.map(({ idMeal }) => idMeal)), [meals]);
  return { meals, savedIds, savingIds, toggle };
}
