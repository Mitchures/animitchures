import './StudioSkeleton.css';

import Skeleton from 'components/Skeleton';

const YEARS = [3, 2, 4, 2];

/** Stands in for a studio page: hero, then year rows of poster placeholders. */
function StudioSkeleton() {
  return (
    <div className="studioSkeleton">
      <div className="studioSkeleton__hero">
        <Skeleton width="min(300px, 62vw)" height="34px" />
        <Skeleton width="min(340px, 70vw)" height="13px" />
      </div>
      <div className="studioSkeleton__body">
        <Skeleton width="130px" height="20px" />
        {YEARS.map((count, index) => (
          <div key={index} className="studioSkeleton__year">
            <Skeleton width="42px" height="16px" />
            <div className="studioSkeleton__works">
              {Array.from({ length: count }, (_, i) => (
                <div key={i} className="studioSkeleton__work">
                  <Skeleton width="108px" height="162px" radius="9px" />
                  <Skeleton width="80px" height="11px" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default StudioSkeleton;
