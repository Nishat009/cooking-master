import type { ReactNode } from 'react';

const paths: Record<string, ReactNode> = {
  search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></>,
  heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />,
  arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
  shuffle: <path d="m17 3 4 4-4 4m0 2 4 4-4 4M3 7h3c5 0 7 10 12 10h3M3 17h3c2 0 3-2 5-5m3-4c1-1 3-1 7-1" />,
  close: <path d="m6 6 12 12M6 18 18 6" />,
  pot: <path d="M5 10h14v7a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4Zm-3 2h3m14 0h3M4 7h16M10 7V5h4v2M8 2v1m8-1v1" />,
  globe: <><circle cx="12" cy="12" r="9" /><ellipse cx="12" cy="12" rx="4" ry="9" /><path d="M3 12h18" /></>,
  play: <path d="m9 5 11 7-11 7Z" />,
};

export default function Icon({ name }: { name: keyof typeof paths }) {
  return <svg className="icon" aria-hidden="true" viewBox="0 0 24 24">{paths[name]}</svg>;
}
