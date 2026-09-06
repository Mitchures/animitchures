import './DiscoverSkeleton.css';

import Skeleton from 'components/Skeleton';

const RAIL_CARDS = 7;

/**
 * Stands in for Discover while the one Featured query is in flight.
 *
 * Shaped to what is actually above the fold — the hero, then the first rail —
 * rather than the whole page. Everything below is off screen on arrival, so
 * drawing it costs DOM for something nobody sees.
 */
function DiscoverSkeleton() {
  return (
    <div className="discoverSkeleton">
      <div className="discoverSkeleton__hero">
        <Skeleton width="150px" height="24px" radius="999px" />
        <Skeleton width="min(520px, 70%)" height="46px" />
        <Skeleton width="min(680px, 85%)" height="14px" />
        <Skeleton width="min(600px, 78%)" height="14px" />
        <div className="discoverSkeleton__cta">
          <Skeleton width="150px" height="44px" radius="999px" />
          <Skeleton width="130px" height="44px" radius="999px" />
        </div>
      </div>

      <div className="discoverSkeleton__rail">
        <Skeleton width="170px" height="22px" />
        <div className="discoverSkeleton__cards">
          {Array.from({ length: RAIL_CARDS }, (_, index) => (
            <div key={index} className="discoverSkeleton__card">
              <Skeleton
                height="100%"
                radius="var(--border-radius)"
                className="discoverSkeleton__art"
              />
              <Skeleton width={`${88 - (index % 3) * 14}%`} height="12px" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DiscoverSkeleton;
