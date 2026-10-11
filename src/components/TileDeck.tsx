import { CSSProperties, ReactNode, useEffect, useState } from 'react';

import './TileDeck.css';

import DotNumber, { DotNumberSize } from 'components/DotNumber';
import FrostedTile from 'components/FrostedTile';
import { prefersReducedMotion } from 'components/useSettle';
import { TilePalette, TileTreatment } from 'helpers';

export interface DeckSlide {
  /** The heading — what this figure is. */
  label: string;
  /** The figure itself, through `DotNumber`. */
  value: number | string;
  /** A word beside the figure, for a unit a numeral cannot carry — "pm". */
  unit?: string;
  caption: string;
  size?: DotNumberSize;
}

/** How long a slide holds, and how long it holds for a reduced-motion viewer. */
const HOLD_MS = 6000;
const HOLD_REDUCED_MS = 10_000;
/**
 * How far apart the decks start.
 *
 * Three tiles flipping together reads as a glitch rather than as three
 * independent readouts, so each deck waits `index * this` before its first
 * turn.
 */
export const DECK_STAGGER_MS = 2000;

interface Props {
  slides: DeckSlide[];
  treatment: TileTreatment;
  palette: TilePalette;
  to?: string;
  /** Position in the row, which sets the rotation offset. */
  order?: number;
  className?: string;
  style?: CSSProperties;
  /** Drawn instead of the pager when the deck holds a single slide. */
  footer?: ReactNode;
}

/**
 * A frosted tile that cycles a few figures on one theme rather than holding one.
 *
 * Discover's three widgets each had a single static fact, and two of them
 * repeated something the page already said — the season countdown was on the
 * card beside it almost word for word. Cycling turns each tile into three
 * readings of one horizon, which is both more to read and less repetition.
 *
 * **Rotation pauses on hover and on focus.** Auto-advancing content needs a way
 * to stop it, and hover alone leaves a keyboard user without one; the tile is a
 * link, so it already takes focus. The pager stays decorative rather than
 * becoming buttons, because buttons inside a link are invalid markup and a
 * click on one would navigate.
 *
 * **Reduced motion keeps the content and drops the movement:** slides swap with
 * no rise and hold for longer. Stopping the rotation outright would hide two
 * thirds of what the tile says.
 */
function TileDeck({
  slides,
  treatment,
  palette,
  to,
  order = 0,
  className = '',
  style,
  footer,
}: Props) {
  const [at, setAt] = useState(0);
  const [paused, setPaused] = useState(false);
  const cycles = slides.length > 1;

  useEffect(() => {
    if (!cycles || paused) return;
    const reduced = prefersReducedMotion();
    const hold = reduced ? HOLD_REDUCED_MS : HOLD_MS;
    // The offset is spent once, as a delay before the first turn.
    let interval: ReturnType<typeof setInterval>;
    const start = setTimeout(
      () => {
        setAt((index) => (index + 1) % slides.length);
        interval = setInterval(() => setAt((index) => (index + 1) % slides.length), hold);
      },
      hold + order * DECK_STAGGER_MS,
    );
    return () => {
      clearTimeout(start);
      clearInterval(interval);
    };
  }, [cycles, paused, slides.length, order]);

  // A deck whose slide count shrinks — tonight emptying out — must not be left
  // pointing past the end.
  const index = Math.min(at, slides.length - 1);
  const slide = slides[index];
  if (!slide) return null;

  return (
    <FrostedTile
      treatment={treatment}
      palette={palette}
      label={slide.label}
      caption={slide.caption}
      to={to}
      className={`tileDeck ${className}`.trim()}
      style={style}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      footer={
        cycles ? (
          <span className="tileDeck__pager" aria-hidden="true">
            {slides.map((entry, slot) => (
              <i key={entry.label} className={slot === index ? 'is-on' : undefined} />
            ))}
          </span>
        ) : (
          footer
        )
      }
    >
      {/* Keyed on the slide, so React remounts it and the swap animation runs. */}
      <span key={slide.label} className="tileDeck__value">
        <DotNumber value={slide.value} size={slide.size ?? 'lg'} arrive="none" />
        {slide.unit && <small>{slide.unit}</small>}
      </span>
    </FrostedTile>
  );
}

export default TileDeck;
