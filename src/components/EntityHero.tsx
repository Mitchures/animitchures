import { ReactNode } from 'react';

import './EntityHero.css';

interface Props {
  /** Portraits for people; studios have none, and the hero reflows without it. */
  image?: string | null;
  name: string;
  native?: string | null;
  /**
   * The line of small facts under the name. Whole nodes rather than
   * label/value pairs, because the label sits before the value on some
   * ("from Tokyo") and after it on others ("18,090 favourites").
   */
  facts: ReactNode[];
  /** Tints the wash behind the hero, so studios and people are distinguishable. */
  tone?: 'person' | 'studio';
}

/**
 * The head of a staff, character or studio page.
 *
 * One component for all three because they answer the same question — who or
 * what is this — and three near-identical heroes would drift apart on spacing
 * within a week.
 */
function EntityHero({ image, name, native, facts, tone = 'person' }: Props) {
  return (
    <header className={`entityHero entityHero--${tone}`}>
      {image && <img className="entityHero__portrait" src={image} alt="" />}
      <div className="entityHero__id">
        <h1>{name}</h1>
        {native && <p className="entityHero__native">{native}</p>}
        <div className="entityHero__facts">
          {facts.map((fact, index) => (
            <span key={index}>{fact}</span>
          ))}
        </div>
      </div>
    </header>
  );
}

export default EntityHero;
