import './StatRow.css';

import DotNumber from 'components/DotNumber';
import Chip from 'components/Chip';

export interface Stat {
  value: number;
  label: string;
  tone?: 'neutral' | 'lime';
}

/** The row of figures under the greeting: a dot-matrix number and its label. */
function StatRow({ stats }: { stats: Stat[] }) {
  return (
    <div className="statRow">
      {stats.map(({ value, label, tone }) => (
        <div key={label} className="statRow__stat">
          <DotNumber value={value} size="md" />
          <Chip tone={tone ?? 'neutral'}>{label}</Chip>
        </div>
      ))}
    </div>
  );
}

export default StatRow;
