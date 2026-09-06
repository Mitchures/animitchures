import './WatchlistSkeleton.css';

import Skeleton from 'components/Skeleton';
import { PREVIEW_COUNT } from './WatchlistSection';

const LEDGER_SECTIONS = 2;

/**
 * Stands in for the watchlist while the collection loads.
 *
 * Shaped to what the page actually shows first — one band of up-next cards at
 * their real 92px poster width, then ledger sections at the same preview count
 * the real sections use. Avoids the real `watchlist__*` and `wlSection__*`
 * class names so the e2e suite's waits are not satisfied by the placeholder.
 */
function WatchlistSkeleton() {
  return (
    <div className="wlSkeleton">
      <Skeleton width="110px" height="20px" />
      <div className="wlSkeleton__band">
        {Array.from({ length: PREVIEW_COUNT }, (_, index) => (
          <div key={index} className="wlSkeleton__card">
            <Skeleton width="132px" height="198px" radius="10px" />
            <div className="wlSkeleton__cardBody">
              <Skeleton width="80%" height="14px" />
              <Skeleton height="7px" radius="3.5px" />
              <Skeleton width="45%" height="16px" />
            </div>
          </div>
        ))}
      </div>

      {Array.from({ length: LEDGER_SECTIONS }, (_, section) => (
        <div key={section} className="wlSkeleton__section">
          <Skeleton width="140px" height="20px" />
          {Array.from({ length: PREVIEW_COUNT }, (_, row) => (
            <div key={row} className="wlSkeleton__row">
              <Skeleton width="54px" height="81px" radius="6px" />
              <Skeleton width={`${52 - row * 6}%`} height="12px" />
              <Skeleton width="110px" height="5px" radius="3px" className="wlSkeleton__rowStrip" />
              <Skeleton width="46px" height="12px" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default WatchlistSkeleton;
