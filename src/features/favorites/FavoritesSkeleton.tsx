import './FavoritesSkeleton.css';

import Skeleton from 'components/Skeleton';

const FACTS = 4;

/**
 * Holds the same slots in the same order as the real page — heading, the
 * collection tile with its facts, then the shelf — so nothing jumps when the
 * list arrives. Deliberately avoids the real `favorites__*` class names: the
 * signed-in e2e specs wait on `.favorites__shelf` to know data arrived.
 */
function FavoritesSkeleton({ count }: { count: number }) {
  return (
    <div className="favoritesSkeleton" aria-hidden="true">
      <div className="favoritesSkeleton__heading">
        <Skeleton width="160px" height="30px" radius="var(--r-pill)" />
        <Skeleton width="220px" height="14px" radius="var(--r-pill)" />
      </div>
      <div className="favoritesSkeleton__collection">
        <Skeleton height="252px" radius="var(--r-card)" />
        <div className="favoritesSkeleton__facts">
          {Array.from({ length: FACTS }, (_, index) => (
            <Skeleton key={index} height="118px" radius="26px" />
          ))}
        </div>
      </div>
      <div className="favoritesSkeleton__heading">
        <Skeleton width="140px" height="26px" radius="var(--r-pill)" />
      </div>
      <div className="favoritesSkeleton__shelf">
        {Array.from({ length: Math.min(count, 8) }, (_, index) => (
          <Skeleton key={index} height="418px" radius="var(--r-card)" />
        ))}
      </div>
    </div>
  );
}

export default FavoritesSkeleton;
