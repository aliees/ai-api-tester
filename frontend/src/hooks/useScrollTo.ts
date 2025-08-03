import { useRef, useCallback } from 'react';

export const useScrollTo = <T extends HTMLElement>() => {
  const ref = useRef<T>(null);
  const scrollTo = useCallback(() => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return { ref, scrollTo };
};