import './SocialSkeleton.css';

import Skeleton from 'components/Skeleton';

const FACES = 8;
const ROWS = 7;

/** Stands in for the feed: the following strip, then rows. */
function SocialSkeleton() {
  return (
    <div className="socialSkeleton">
      <Skeleton width="130px" height="20px" />
      <div className="socialSkeleton__faces">
        {Array.from({ length: FACES }, (_, index) => (
          <div key={index} className="socialSkeleton__face">
            <Skeleton width="50px" height="50px" radius="50%" />
            <Skeleton width="46px" height="10px" />
          </div>
        ))}
      </div>

      <Skeleton width="90px" height="20px" />
      <div className="socialSkeleton__feed">
        {Array.from({ length: ROWS }, (_, index) => (
          <div key={index} className="socialSkeleton__row">
            <Skeleton width="38px" height="38px" radius="50%" />
            <div className="socialSkeleton__body">
              <Skeleton width={`${68 - (index % 4) * 9}%`} height="12px" />
              <Skeleton width="200px" height="5px" radius="3px" />
            </div>
            <Skeleton width="32px" height="48px" radius="4px" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default SocialSkeleton;
