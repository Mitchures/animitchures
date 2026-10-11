import { CSSProperties, RefObject, useLayoutEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * One indicator that slides between the active items instead of each item
 * lighting up. Measures the element matching `activeSelector` inside the
 * container and returns transform/height (vertical) or transform/width
 * (horizontal) for a sibling indicator positioned at the container origin.
 */
export function useSlidingIndicator(
  ref: RefObject<HTMLElement | null>,
  activeSelector: string,
  axis: 'y' | 'x' = 'y',
  /** Anything besides the route that moves the active item — an open drawer, a tab switch. */
  deps: unknown[] = [],
): { style: CSSProperties; visible: boolean } {
  const { pathname } = useLocation();
  const [style, setStyle] = useState<CSSProperties>({});
  const [visible, setVisible] = useState(false);

  useLayoutEffect(() => {
    const measure = () => {
      const el = ref.current?.querySelector<HTMLElement>(activeSelector);
      if (!el) {
        setVisible(false);
        return;
      }
      setVisible(true);
      setStyle(
        axis === 'y'
          ? { transform: `translateY(${el.offsetTop}px)`, height: el.offsetHeight }
          : { transform: `translateX(${el.offsetLeft}px)`, width: el.offsetWidth },
      );
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, activeSelector, axis, pathname, ...deps]);

  return { style, visible };
}
