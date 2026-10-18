import type { CookbookControls } from '@/types/meal';
import SaveButton from '@/components/recipes/SaveButton';

interface Props { id: string; cookbook: CookbookControls; notify: (message: string) => void }

export default function RecipeActions({ id, cookbook, notify }: Props) {
  async function share() {
    const url = new URL(location.href);
    url.hash = `meal=${id}`;
    try { await navigator.clipboard.writeText(url.href); notify('Recipe link copied. Share a little deliciousness!'); }
    catch { location.hash = `meal=${id}`; notify('Copy this recipe link from your address bar.'); }
  }
  return <div className="recipe-actions"><SaveButton id={id} saved={cookbook.savedIds.has(id)} busy={cookbook.savingIds.has(id)} onToggle={cookbook.onToggle} variant="detail" /><button className="button button-outline" data-share={id} onClick={() => void share()}>Share</button><button className="button button-outline" data-print onClick={() => window.print()}>Print</button></div>;
}
