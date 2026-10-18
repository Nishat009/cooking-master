'use client';

import Image from 'next/image';
import { useState } from 'react';
import { safeURL } from '@/lib/meal-utils';

interface Props {
  src?: string | null;
  alt: string;
  className?: string;
  priority?: boolean;
}

export default function FoodImage({ src, alt, className, priority = false }: Props) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const url = safeURL(src);
  if (!url || failedSource === url) return <span className={`image-fallback ${className || ''}`} role="img" aria-label={alt}>Made with a little love</span>;
  return <Image src={url} alt={alt} className={className} width={700} height={550} unoptimized loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : 'auto'} onError={() => setFailedSource(url)} />;
}
