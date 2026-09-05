import { useState, MouseEvent } from 'react';
import { useReducedMotion } from 'framer-motion';

/**
 * Tilts an element toward the pointer.
 *
 * Read the pointer against the wrapper's box rather than the tilting element's,
 * so the rotation cannot feed back into the next measurement. Pair with a
 * `perspective` on that wrapper — without one the rotation is invisible.
 *
 * Returns zero rotation under prefers-reduced-motion: the effect is absent, not
 * merely smaller.
 */
export function useTilt(maxDegrees = 12) {
  const reduceMotion = useReducedMotion();
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const onMouseMove = (event: MouseEvent<HTMLElement>) => {
    if (reduceMotion) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - bounds.left) / bounds.width - 0.5;
    const py = (event.clientY - bounds.top) / bounds.height - 0.5;
    setTilt({ x: -py * maxDegrees, y: px * maxDegrees });
  };

  return {
    tilt,
    /** Spread onto the perspective wrapper. */
    tiltProps: { onMouseMove, onMouseLeave: () => setTilt({ x: 0, y: 0 }) },
    tiltTransition: { type: 'spring' as const, stiffness: 220, damping: 18 },
  };
}
