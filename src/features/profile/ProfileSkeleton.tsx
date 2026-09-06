import './ProfileSkeleton.css';

import Skeleton from 'components/Skeleton';

const VITALS = 4;
const HEATMAP_WEEKS = 53;
const GENRES = 5;
const FAVOURITES = 6;

/**
 * Stands in for the profile while the AniList query is in flight.
 *
 * Sized from the real page's metrics — 112px avatar, 13px heatmap cells on the
 * same 53-week track — so the swap is not a jump. Deliberately avoids the real
 * `profile__*` class names: the e2e suite waits on `.profile__lede` to know the
 * data arrived, and a placeholder wearing that class would satisfy the wait
 * before anything had loaded.
 */
function ProfileSkeleton() {
  return (
    <div className="profileSkeleton">
      <div className="profileSkeleton__identity">
        <Skeleton width="112px" height="112px" radius="28px" />
        <div className="profileSkeleton__name">
          <Skeleton width="min(260px, 55vw)" height="30px" />
          <Skeleton width="150px" height="12px" />
        </div>
      </div>

      <Skeleton width="min(300px, 70vw)" height="60px" />
      <Skeleton width="min(420px, 85vw)" height="14px" />

      <div className="profileSkeleton__vitals">
        {Array.from({ length: VITALS }, (_, index) => (
          <div key={index}>
            <Skeleton width="64px" height="20px" />
            <Skeleton width="86px" height="11px" />
          </div>
        ))}
      </div>

      <Skeleton width="110px" height="20px" />
      <div className="profileSkeleton__heatmap">
        {Array.from({ length: HEATMAP_WEEKS }, (_, index) => (
          <Skeleton key={index} width="13px" height="103px" radius="3px" />
        ))}
      </div>

      <Skeleton width="150px" height="20px" />
      <div className="profileSkeleton__genres">
        {Array.from({ length: GENRES }, (_, index) => (
          <Skeleton key={index} height="52px" radius="10px" />
        ))}
      </div>

      <Skeleton width="120px" height="20px" />
      <div className="profileSkeleton__favourites">
        {Array.from({ length: FAVOURITES }, (_, index) => (
          <Skeleton key={index} width="96px" height="144px" radius="12px" />
        ))}
      </div>
    </div>
  );
}

export default ProfileSkeleton;
