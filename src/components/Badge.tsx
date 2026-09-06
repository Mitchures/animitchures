import { ReactNode } from 'react';

import './Badge.css';

import { ScoreTier } from 'helpers';

/**
 * `gold` for an accolade, `neutral` for a plain fact, or a score tier to colour
 * by severity. Every tone but `neutral` shares one tinted treatment and differs
 * only in its colour — see Badge.css.
 */
export type BadgeTone = 'gold' | 'neutral' | ScoreTier;

interface Props {
  tone?: BadgeTone;
  /** The emphasised half — a rank, a score, an episode number. */
  value?: ReactNode;
  /** The quieter half that says what the value means. */
  children?: ReactNode;
}

/**
 * A small two-part pill: an emphasised value beside a quieter label.
 *
 * Extracted because the Details ranking badges and the Discover hero badges had
 * arrived at the same design independently and were maintained twice. They are
 * literally the same object — an accolade or a fact, stated compactly over
 * artwork — so they should not be able to drift apart.
 */
function Badge({ tone = 'neutral', value, children }: Props) {
  return (
    <span className={`badge badge--${tone}`}>
      {value !== undefined && <b>{value}</b>}
      {children !== undefined && <span>{children}</span>}
    </span>
  );
}

export default Badge;
