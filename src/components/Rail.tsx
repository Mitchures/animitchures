import { useRef, useState, useEffect, ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

import './Rail.css';

import SectionHeading from 'components/SectionHeading';

/**
 * A horizontally scrolling row of cards.
 *
 * The rows already scrolled, but with no indication they could — the last card
 * was simply clipped at the edge of the page. This adds arrows that appear only
 * on the side there is more to see, snap points, and a reveal as the row comes
 * into view.
 */
function Rail({
  title,
  detail,
  children,
}: {
  title: string;
  detail?: string;
  children: ReactNode;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const [more, setMore] = useState({ before: false, after: false });

  useEffect(() => {
    const element = scroller.current;
    if (!element) return;

    // 8px of slack: sub-pixel scroll positions otherwise leave an arrow
    // pointing at a scroll of half a pixel.
    const measure = () =>
      setMore({
        before: element.scrollLeft > 8,
        after: element.scrollLeft + element.clientWidth < element.scrollWidth - 8,
      });

    measure();
    element.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);
    return () => {
      element.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
    };
  }, [children]);

  const page = (direction: 1 | -1) => {
    const element = scroller.current;
    if (!element) return;
    element.scrollBy({
      // Not a full width: leaving a card visible keeps your place in the row.
      left: direction * element.clientWidth * 0.8,
      behavior: reduceMotion ? 'auto' : 'smooth',
    });
  };

  return (
    <motion.section
      className="rail"
      initial={reduceMotion ? undefined : { opacity: 0, y: 26 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.45, ease: [0.2, 0.7, 0.3, 1] }}
    >
      <SectionHeading title={title} detail={detail} />
      <div className="rail__viewport">
        {more.before && (
          <button
            type="button"
            className="rail__arrow rail__arrow--before"
            aria-label={`Scroll ${title} backwards`}
            onClick={() => page(-1)}
          >
            ‹
          </button>
        )}
        <div className="rail__scroller" ref={scroller}>
          {children}
        </div>
        {more.after && (
          <button
            type="button"
            className="rail__arrow rail__arrow--after"
            aria-label={`Scroll ${title} forwards`}
            onClick={() => page(1)}
          >
            ›
          </button>
        )}
      </div>
    </motion.section>
  );
}

export default Rail;
