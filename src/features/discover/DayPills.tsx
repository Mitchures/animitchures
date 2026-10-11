import './DayPills.css';

import DotNumber from 'components/DotNumber';
import { weekDots } from 'features/discover/derive';

interface Props {
  days: ReturnType<typeof weekDots>;
  onPick?: (index: number) => void;
}

/**
 * The phone replacement for TimeStrip: a day is a pill carrying its episode
 * count, which can actually be read and tapped at 390px.
 */
function DayPills({ days, onPick }: Props) {
  return (
    <div className="dayPills">
      {days.map(({ label, isToday, colors }, index) => (
        <button
          key={`${label}-${index}`}
          type="button"
          className={`dayPill${isToday ? ' is-on' : ''}`}
          aria-label={`${label}, ${colors.length} ${colors.length === 1 ? 'episode' : 'episodes'}`}
          onClick={() => onPick?.(index)}
        >
          {label}
          {colors.length > 0 && <DotNumber value={colors.length} size="xs" arrive="none" />}
        </button>
      ))}
    </div>
  );
}

export default DayPills;
