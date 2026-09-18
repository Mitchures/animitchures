import { useEffect, useState } from 'react';

const DURATION_MS = 480;
const FRAME_MS = 40;

/** True when either the OS or the app's own switch asks for reduced motion. */
export const prefersReducedMotion = (): boolean =>
  document.documentElement.getAttribute('data-motion') === 'reduced' ||
  (typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches);

/** Digits left of the lock point are final; the rest are random. */
function scramble(value: string, progress: number): string {
  const digits = value.length;
  return [...value]
    .map((ch, i) => {
      if (!/\d/.test(ch)) return ch;
      const lockAt = ((i + 1) / digits) * 0.85;
      return progress >= lockAt ? ch : String(Math.floor(Math.random() * 10));
    })
    .join('');
}

/**
 * The approved "settle" arrival: every digit flickers through random values
 * and locks in from left to right over 480ms. Non-digit characters (a dot, a
 * dash) are never scrambled. Re-runs only when `value` changes.
 */
export function useSettle(value: string, enabled: boolean): string {
  const [shown, setShown] = useState(() =>
    enabled && !prefersReducedMotion() ? scramble(value, 0) : value,
  );

  useEffect(() => {
    if (!enabled || prefersReducedMotion()) {
      setShown(value);
      return;
    }
    const start = Date.now();
    setShown(scramble(value, 0));
    const timer = setInterval(() => {
      const progress = Math.min(1, (Date.now() - start) / DURATION_MS);
      setShown(scramble(value, progress));
      if (progress >= 1) clearInterval(timer);
    }, FRAME_MS);
    return () => clearInterval(timer);
  }, [value, enabled]);

  return shown;
}
