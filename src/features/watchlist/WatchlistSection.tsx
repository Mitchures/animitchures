import { ReactNode, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import './WatchlistSection.css';

/** How much of a list is worth showing before it stops being a summary. */
export const PREVIEW_COUNT = 4;

interface Props<T> {
  title: string;
  tone: string;
  items: T[];
  render: (item: T) => ReactNode;
  /** Sections whose list is the point of the page start open. */
  defaultExpanded?: boolean;
}

/**
 * A status group that shows the first few entries and hides the rest behind a
 * count.
 *
 * A finished list runs to hundreds of titles; rendering all of them puts a
 * three-screen scroll between "Completed" and everything after it. The button
 * says how many are hidden rather than just "show more", because the number is
 * the useful part — "Show all 128" tells you whether it is worth the tap.
 */
function WatchlistSection<T extends { id: number }>({
  title,
  tone,
  items,
  render,
  defaultExpanded = false,
}: Props<T>) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  if (!items.length) return null;

  const hidden = items.length - PREVIEW_COUNT;
  const visible = expanded ? items : items.slice(0, PREVIEW_COUNT);

  return (
    <section className="wlSection">
      <div className="wlSection__head">
        <span className={`wlSection__dot wlSection__dot--${tone}`} />
        <h3>{title}</h3>
        <span className="wlSection__count">{items.length}</span>
      </div>

      <div className="wlSection__items">
        <AnimatePresence initial={false}>
          {visible.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              {render(item)}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {hidden > 0 && (
        <button type="button" className="wlSection__toggle" onClick={() => setExpanded(!expanded)}>
          {expanded ? 'Show fewer' : `Show all ${items.length}`}
        </button>
      )}
    </section>
  );
}

export default WatchlistSection;
