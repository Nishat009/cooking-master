import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cooking Master — A little inspiration for every appetite',
  description: 'Find your next favorite meal. Explore recipes from around the world, cook with what you have, and save the ones you love.',
  icons: { icon: '/icon.svg' },
};
export const viewport: Viewport = { themeColor: '#faf8f4' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
