import './DotNumber.css';
import { useSettle } from './useSettle';

export type DotNumberSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface Props {
  value: number | string;
  /** `settle` (default) flickers digits into place; `none` renders at once. */
  arrive?: 'settle' | 'none';
  size?: DotNumberSize;
  className?: string;
}

/**
 * Every numeral in the app: scores, ranks, counts, episode numbers. Doto is a
 * dot-matrix face, so a number arriving looks like a display waking up. The
 * accessible name is always the real value.
 */
function DotNumber({ value, arrive = 'settle', size = 'md', className = '' }: Props) {
  const text = String(value);
  const shown = useSettle(text, arrive === 'settle');
  return (
    <span
      className={`dotNumber dotNumber--${size} ${className}`.trim()}
      aria-label={text}
      data-testid="dot-number"
    >
      {shown}
    </span>
  );
}

export default DotNumber;
