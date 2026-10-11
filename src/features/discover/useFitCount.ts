import { useEffect, useState } from 'react';

/**
 * How many items of at least `min` px, `gap` apart, fit across the element on
 * the returned ref, in one row. For the rows on Discover that fill the width
 * of the screen: the page used to stop at 1180px and leave the rest of a wide
 * display empty, and a row that simply stretched its four cards would stretch
 * them past what a card should be. More items instead, as many as fit.
 *
 * `floor` keeps the phone layouts honest — below 960px the stylesheet fixes the
 * columns itself and this count only decides how many items are rendered.
 * `ceil` caps the count at what the data can fill. Measured with a
 * `ResizeObserver`, so a resize recomputes; `fallback` is what renders before
 * the first measure and wherever the observer does not exist (jsdom).
 *
 * The ref is a callback, not a ref object: the rows mount after the skeleton,
 * and an effect keyed on a ref object would have run once against null and
 * never again.
 */
export function useFitCount(
  min: number,
  gap: number,
  floor: number,
  ceil: number,
  fallback = floor,
) {
  const [element, setElement] = useState<HTMLDivElement | null>(null);
  const [count, setCount] = useState(fallback);

  useEffect(() => {
    if (!element || typeof ResizeObserver === 'undefined') return undefined;
    const read = () =>
      setCount(
        Math.min(ceil, Math.max(floor, Math.floor((element.clientWidth + gap) / (min + gap)))),
      );
    read();
    const observer = new ResizeObserver(read);
    observer.observe(element);
    return () => observer.disconnect();
  }, [element, min, gap, floor, ceil]);

  return [setElement, count] as const;
}
