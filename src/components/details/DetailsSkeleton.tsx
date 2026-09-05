import './DetailsSkeleton.css';

import Skeleton from 'components/Skeleton';

/**
 * Stands in for the Details page while the query is in flight, shaped like the
 * real hero so the layout does not jump when data lands.
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
        </div>
        <Skeleton height="280px" radius="20px" />
      </div>
    </div>
  );
}

export default DetailsSkeleton;
