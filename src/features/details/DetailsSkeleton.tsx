import './DetailsSkeleton.css';

import Skeleton from 'components/Skeleton';

/**
 * Stands in for the Details page while the query is in flight, shaped like the
 * real stacked-glass hero and Overview so the layout does not jump when data
 * lands: a 340px band, a sheet pulled up over it with the poster crossing the
 * seam, four fact tiles, the pill tabs, then the panels.
 *
 * Deliberately does NOT reuse the real `details__*` class names: the e2e suite
 * waits on `.details__sheet` to know the page has loaded, and a skeleton
 * wearing that class would satisfy the wait before any data existed.
 */
function DetailsSkeleton() {
  return (
    <div className="detailsSkeleton">
      <div className="detailsSkeleton__banner">
        <Skeleton className="skeleton--onDark detailsSkeleton__back" width="46px" height="46px" radius="20px" />
        <div className="detailsSkeleton__actions">
          {[0, 1, 2].map((n) => (
            <Skeleton key={n} className="skeleton--onDark" width="46px" height="46px" radius="20px" />
          ))}
        </div>
      </div>

      <div className="detailsSkeleton__sheet">
        <div className="detailsSkeleton__sheetRow">
          <Skeleton className="detailsSkeleton__poster" width="168px" height="252px" radius="26px" />
          <div className="detailsSkeleton__body">
            <Skeleton width="min(380px, 60%)" height="34px" />
            <Skeleton width="min(200px, 32%)" height="13px" />
            <div className="detailsSkeleton__row">
              {[72, 92, 64, 70].map((width, n) => (
                <Skeleton key={n} width={`${width}px`} height="30px" radius="999px" />
              ))}
            </div>
            <div className="detailsSkeleton__facts">
              {[0, 1, 2, 3].map((n) => (
                <Skeleton key={n} height="112px" radius="26px" />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="detailsSkeleton__bar">
        {[104, 120, 108, 132].map((width, n) => (
          <Skeleton key={n} width={`${width}px`} height="38px" radius="999px" />
        ))}
      </div>

      <div className="detailsSkeleton__panel">
        <div className="detailsSkeleton__main">
          <Skeleton height="190px" radius="34px" />
          <Skeleton height="260px" radius="34px" />
        </div>
        <div className="detailsSkeleton__side">
          <Skeleton height="320px" radius="34px" />
          <Skeleton height="180px" radius="34px" />
        </div>
      </div>
    </div>
  );
}

export default DetailsSkeleton;
