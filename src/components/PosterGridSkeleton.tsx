import './PosterGridSkeleton.css';

import Skeleton from './Skeleton';

interface Props {
  count?: number;
  /** Class of the real grid, so the placeholder inherits its exact tracks. */
  gridClassName?: string;
}

/**
 * A grid of poster-shaped placeholders.
 *
 * Takes the real grid's class rather than redefining its columns, so the two
 * cannot drift apart — the whole point of a skeleton is that nothing moves
 * when the content arrives.
 */
function PosterGridSkeleton({ count = 12, gridClassName = '' }: Props) {
  return (
    <div className={`posterGridSkeleton ${gridClassName}`.trim()}>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="posterGridSkeleton__cell">
          <Skeleton
            height="100%"
            radius="var(--border-radius)"
            className="posterGridSkeleton__art"
          />
          <Skeleton width={`${85 - (index % 4) * 12}%`} height="12px" />
        </div>
      ))}
    </div>
  );
}

export default PosterGridSkeleton;
