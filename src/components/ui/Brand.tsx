import Link from 'next/link';
import Icon from './Icon';

export default function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link className={`brand${compact ? ' footer-brand' : ''}`} href="/" aria-label="Cooking Master home">
      {!compact && <span className="brand-icon"><Icon name="pot" /></span>}
      <span>cooking<span className="brand-light">master</span><span className="brand-dot">.</span></span>
    </Link>
  );
}
