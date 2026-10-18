import Icon from '@/components/ui/Icon';

interface Props { id: string; saved: boolean; busy: boolean; onToggle: (id: string) => void; variant?: 'card' | 'detail' }

export default function SaveButton({ id, saved, busy, onToggle, variant = 'card' }: Props) {
  return (
    <button className={variant === 'card' ? 'save-button' : 'button button-outline'} data-save={id} aria-label={saved ? 'Remove from cookbook' : 'Save to cookbook'} aria-pressed={saved} aria-busy={busy} disabled={busy} onClick={() => onToggle(id)}>
      <Icon name="heart" />
      {variant === 'detail' && <span data-save-label>{busy ? 'Saving…' : saved ? 'Saved to cookbook' : 'Save recipe'}</span>}
    </button>
  );
}
