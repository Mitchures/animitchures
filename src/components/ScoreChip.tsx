import './ScoreChip.css';

import DotNumber from 'components/DotNumber';

/** Frosted dark chip for a score over artwork — survives the busiest banner. */
function ScoreChip({ score, rank }: { score: number; rank?: string }) {
  return (
    <div className="scoreChip">
      <DotNumber value={score} size="lg" />
      {rank && <small className="scoreChip__rank">{rank}</small>}
    </div>
  );
}

export default ScoreChip;
