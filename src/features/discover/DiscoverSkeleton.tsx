import './DiscoverSkeleton.css';

import Skeleton from 'components/Skeleton';

const STATS = 4;
const WIDGETS = 3;
const CARDS = 4;

/**
 * Stands in for Discover while the one Featured query is in flight.
 *
 * Holds the same slots in the same order as the real page — stats, week strip,
 * slide, widgets, cards — so nothing jumps sideways when the data
 * lands. Deliberately avoids the real `discover__*` class names: the e2e suite
 * waits on `.slideHero` to know data arrived.
 */
function DiscoverSkeleton() {
  return (
    <div className="discoverSkeleton">
      <div className="discoverSkeleton__stats">
        {Array.from({ length: STATS }, (_, index) => (
          <Skeleton key={index} width="108px" height="30px" radius="var(--r-pill)" />
        ))}
      </div>

      <Skeleton height="86px" radius="var(--r-pill)" className="discoverSkeleton__strip" />

      <div className="discoverSkeleton__grid">
        <div className="discoverSkeleton__main">
          <Skeleton height="320px" radius="var(--r-card)" />
          <div className="discoverSkeleton__widgets">
            {Array.from({ length: WIDGETS }, (_, index) => (
              <Skeleton key={index} height="168px" radius="var(--r-card)" />
            ))}
          </div>
        </div>
        <div className="discoverSkeleton__side">
          <Skeleton height="150px" radius="var(--r-card)" />
          <Skeleton height="182px" radius="var(--r-card)" />
        </div>
      </div>

      <Skeleton width="220px" height="26px" radius="10px" className="discoverSkeleton__heading" />
      <div className="discoverSkeleton__cards">
        {Array.from({ length: CARDS }, (_, index) => (
          <Skeleton key={index} height="190px" radius="var(--r-card)" />
        ))}
      </div>
    </div>
  );
}

export default DiscoverSkeleton;
