import './DetailsSkeleton.css';

import Skeleton from 'components/Skeleton';

/**
 * Stands in for the Details page while the query is in flight, shaped like the
 * real hero and Overview so the layout does not jump when data lands.
 *
 * Deliberately does NOT reuse the real `details__*` class names: the e2e suite
 * waits on `.details__hero` to know the page has loaded, and a skeleton wearing
 * that class would satisfy the wait before any data existed.
 */
function DetailsSkeleton() {
  return (
    <div className="detailsSkeleton">
      <div className="detailsSkeleton__banner">
        <div className="detailsSkeleton__hero">
          <Skeleton className="skeleton--onDark" width="320px" height="452px" radius="20px" />
          <div className="detailsSkeleton__body">
            {/* Ranking badges sit above the title. */}
            <div className="detailsSkeleton__row">
              {[0, 1].map((n) => (
                <Skeleton
                  key={n}
                  className="skeleton--onDark"
                  width="150px"
                  height="24px"
                  radius="999px"
                />
              ))}
            </div>
            <Skeleton className="skeleton--onDark" width="min(420px, 60%)" height="44px" />
            <Skeleton className="skeleton--onDark" width="min(260px, 40%)" height="13px" />
            <div className="detailsSkeleton__row">
              {[0, 1, 2].map((n) => (
                <Skeleton key={n} className="skeleton--onDark" width="86px" height="25px" />
              ))}
            </div>
            <div className="detailsSkeleton__row">
              {[0, 1, 2, 3].map((n) => (
                <Skeleton
                  key={n}
                  className="skeleton--onDark"
                  width="92px"
                  height="42px"
                  radius="10px"
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="detailsSkeleton__bar">
        {[0, 1, 2, 3].map((n) => (
          <Skeleton key={n} width="74px" height="14px" />
        ))}
      </div>

      <div className="detailsSkeleton__panel">
        <div className="detailsSkeleton__main">
          <Skeleton width="120px" height="20px" />
          <Skeleton height="13px" />
          <Skeleton height="13px" />
          <Skeleton width="70%" height="13px" />

          {/* Characters — the cast chip grid, three across. */}
          <Skeleton width="140px" height="20px" />
          <div className="detailsSkeleton__chips">
            {[0, 1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="detailsSkeleton__chip">
                <Skeleton width="72px" height="72px" radius="16px" />
                <div className="detailsSkeleton__chipBody">
                  <Skeleton height="12px" />
                  <Skeleton width="55%" height="10px" />
                  <Skeleton width="70%" height="10px" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Facts, links and tags share the right column. */}
        <div className="detailsSkeleton__side">
          <Skeleton height="240px" radius="20px" />
          <Skeleton width="130px" height="18px" />
          <div className="detailsSkeleton__row">
            {[74, 96, 120, 64].map((width, n) => (
              <Skeleton key={n} width={`${width}px`} height="32px" radius="12px" />
            ))}
          </div>
          <Skeleton width="60px" height="18px" />
          <div className="detailsSkeleton__row">
            {[70, 58, 92, 66, 80, 54, 88, 72].map((width, n) => (
              <Skeleton key={n} width={`${width}px`} height="26px" radius="10px" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetailsSkeleton;
