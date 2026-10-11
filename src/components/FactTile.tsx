import { CSSProperties, ReactNode } from 'react';
import { Link } from 'react-router-dom';

import './FactTile.css';

import DotNumber from 'components/DotNumber';

interface Props {
  /** The icon in the circular chip — what kind of figure this is. */
  icon: ReactNode;
  label: string;
  value: number | string;
  /** The word beside the figure that a numeral cannot carry: "of 100". */
  unit?: string;
  /** Lime chip. One per set at most — it marks the figure that leads. */
  accent?: boolean;
  to?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * One figure in a squircle: a circular icon chip, a label, then the number.
 *
 * The reference's biomarker card. It reads as a tile rather than a stat line
 * because a set of four of them is something you scan, and the icon chip is
 * what makes each one findable without reading its label.
 *
 * Translucent on purpose — see `FactTile.css`. Nested inside a glass sheet or
 * laid directly on artwork, it takes its ground from whatever is behind it.
 */
function FactTile({ icon, label, value, unit, accent, to, className = '', style }: Props) {
  const cls = `factTile${accent ? ' factTile--accent' : ''} ${className}`.trim();
  const inner = (
    <>
      <span className="factTile__top">
        <span className="factTile__chip" aria-hidden="true">
          {icon}
        </span>
        <span className="factTile__label">{label}</span>
      </span>
      <span className="factTile__value">
        <DotNumber value={value} size="md" arrive="none" />
        {unit && <small>{unit}</small>}
      </span>
    </>
  );
  if (to) {
    return (
      <Link to={to} className={cls} style={style}>
        {inner}
      </Link>
    );
  }
  return (
    <div className={cls} style={style}>
      {inner}
    </div>
  );
}

export default FactTile;
