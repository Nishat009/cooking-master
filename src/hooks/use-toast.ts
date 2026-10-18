'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export function useToast() {
  const [message, setMessage] = useState('');
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dismiss = useCallback(() => { setMessage(''); }, []);
  const notify = useCallback((text: string) => {
    if (timeout.current) clearTimeout(timeout.current);
    setMessage(text);
    timeout.current = setTimeout(() => setMessage(''), 3800);
  }, []);
  useEffect(() => () => { if (timeout.current) clearTimeout(timeout.current); }, []);
  return { message, notify, dismiss };
}
