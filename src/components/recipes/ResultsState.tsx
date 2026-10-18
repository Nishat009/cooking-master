import Icon from '@/components/ui/Icon';

interface Props { hidden: boolean; error: boolean; emptyCookbook: boolean; onRetry: () => void; onReset: () => void; onDiscover: () => void }

export default function ResultsState({ hidden, error, emptyCookbook, onRetry, onReset, onDiscover }: Props) {
  const title = error ? 'Couldn’t reach the kitchen' : emptyCookbook ? 'Keep your favorites close' : 'No recipes on this plate… yet';
  const message = error ? 'Check your internet connection and try again. Your saved cookbook is still available.' : emptyCookbook ? 'Tap the heart on any recipe to build your own little collection of delicious ideas.' : 'Try another meal name, a single ingredient, or fewer filters. There’s something delicious out there.';
  const action = error ? 'retry' : emptyCookbook ? 'discover' : 'reset';
  return <div id="results-state" className="results-state" hidden={hidden}><span className="state-icon" aria-hidden="true"><Icon name="pot" /></span><h3>{title}</h3><p>{message}</p><button className="button button-outline" data-state-action={action} onClick={error ? onRetry : emptyCookbook ? onDiscover : onReset}>{error ? 'Try again' : emptyCookbook ? 'Discover recipes' : 'Clear search & filters'} <Icon name="arrow" /></button></div>;
}
