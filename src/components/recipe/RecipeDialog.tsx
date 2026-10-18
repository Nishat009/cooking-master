'use client';

import { useEffect, useRef, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import type { CookbookControls, Meal } from '@/types/meal';
import Icon from '@/components/ui/Icon';
import Toast from '@/components/ui/Toast';
import RecipeDetails from './RecipeDetails';

interface Props { open: boolean; loading: boolean; error: boolean; meal: Meal | null; target: string | null; cookbook: CookbookControls; toast: string; notify: (message: string) => void; onClose: () => void; onRetry: () => void }
const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

export default function RecipeDialog({ open, loading, error, meal, target, cookbook, toast, notify, onClose, onRetry }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const mounted = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) { dialog.showModal(); dialog.scrollTop = 0; }
    if (!open && dialog.open) dialog.close();
  }, [open, mounted]);

  if (!mounted) return null;
  // A body portal keeps native focus management and printable recipe layout intact.
  return createPortal(
    <dialog id="recipe-dialog" ref={ref} aria-labelledby="recipe-title" onCancel={(event) => { event.preventDefault(); onClose(); }} onClose={() => { if (open) onClose(); }} onClick={(event) => {
      if (event.target !== event.currentTarget) return;
      const rect = event.currentTarget.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose();
    }}>
      <button className="dialog-close" id="close-dialog" aria-label="Close recipe" onClick={onClose}><Icon name="close" /></button>
      <div id="recipe-content">
        {loading && <div className="dialog-loading"><Icon name="pot" /><h2 id="recipe-title">{target ? 'Opening your recipe…' : 'A delicious surprise is on its way…'}</h2><p>Getting everything ready for the kitchen.</p></div>}
        {error && <div className="dialog-loading"><h2 id="recipe-title">This recipe needs another moment</h2><p>We couldn’t load the details. Check your connection and try again.</p><button className="button button-primary" data-retry-recipe onClick={onRetry}>Try again</button></div>}
        {!loading && !error && meal && <RecipeDetails key={meal.idMeal} meal={meal} cookbook={cookbook} notify={notify} />}
      </div>
      {open && <Toast message={toast} />}
    </dialog>, document.body,
  );
}
