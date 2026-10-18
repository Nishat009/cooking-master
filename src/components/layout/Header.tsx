import type { View } from '@/types/meal';
import Brand from '@/components/ui/Brand';
import Icon from '@/components/ui/Icon';

interface Props {
  view: View;
  savedCount: number;
  onViewChange: (view: View) => void;
  onRandom: () => void;
}

export default function Header({ view, savedCount, onViewChange, onRandom }: Props) {
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Brand />
        <nav aria-label="Main navigation">
          <button id="discover-nav" className={`nav-link${view === 'discover' ? ' active' : ''}`} aria-current={view === 'discover' ? 'page' : undefined} onClick={() => onViewChange('discover')}>Discover</button>
          <button id="favorites-nav" className={`nav-link${view === 'favorites' ? ' active' : ''}`} aria-current={view === 'favorites' ? 'page' : undefined} onClick={() => onViewChange('favorites')}><Icon name="heart" /> My cookbook <span id="saved-count" className="count">{savedCount}</span></button>
        </nav>
        <button className="button button-outline header-random" data-random onClick={onRandom}><Icon name="shuffle" /> Surprise me</button>
      </div>
    </header>
  );
}
