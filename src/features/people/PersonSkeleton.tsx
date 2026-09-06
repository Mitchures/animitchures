import './PersonSkeleton.css';

import Skeleton from 'components/Skeleton';

const ROLES = 8;

/**
 * Stands in for a staff or character page.
 *
 * Sized to the real hero — a 132px portrait, a 56px round face per role — so
 * the swap does not shift. Uses its own class names rather than `person__*`,
 * the same rule the other skeletons follow.
 */
function PersonSkeleton() {
  return (
    <div className="personSkeleton">
      <div className="personSkeleton__hero">
        <Skeleton width="132px" height="198px" radius="12px" />
        <div className="personSkeleton__id">
          <Skeleton width="min(280px, 60vw)" height="30px" />
          <Skeleton width="120px" height="13px" />
          <Skeleton width="min(360px, 78vw)" height="13px" />
        </div>
      </div>

      <div className="personSkeleton__body">
        <Skeleton width="150px" height="20px" />
        <div className="personSkeleton__roles">
          {Array.from({ length: ROLES }, (_, index) => (
            <div key={index} className="personSkeleton__role">
              <Skeleton width="56px" height="56px" radius="50%" />
              <div className="personSkeleton__roleBody">
                <Skeleton width={`${72 - (index % 3) * 12}%`} height="13px" />
                <Skeleton width={`${56 - (index % 4) * 8}%`} height="11px" />
              </div>
              <Skeleton width="36px" height="54px" radius="5px" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PersonSkeleton;
