import './TasteSkeleton.css';

import Skeleton from 'components/Skeleton';

const BARS = 14;
const RANKS = 6;
const FACES = 6;
const YEARS = 15;
const FORMATS = 5;

/**
 * Stands in for Taste while the statistics query runs.
 *
 * The curve is the page's centrepiece, so the placeholder draws bars at
 * varying heights rather than one flat block — a flat rectangle reads as a
 * broken chart rather than a loading one.
 */
function TasteSkeleton() {
  const heights = [18, 26, 34, 48, 62, 78, 92, 100, 88, 70, 54, 40, 28, 20];

  return (
    <div className="tasteSkeleton">
      <div className="tasteSkeleton__hero">
        <div className="tasteSkeleton__lede">
          <Skeleton width="min(280px, 62vw)" height="32px" />
          <Skeleton width="100%" height="13px" />
          <Skeleton width="82%" height="13px" />
        </div>
        <div className="tasteSkeleton__plot">
          {Array.from({ length: BARS }, (_, index) => (
            <span
              key={index}
              className="tasteSkeleton__bar"
              style={{ height: `${heights[index]}%` }}
            >
              <Skeleton height="100%" radius="3px 3px 0 0" />
            </span>
          ))}
        </div>
      </div>

      <div className="tasteSkeleton__body">
        <div className="tasteSkeleton__columns">
          <div className="tasteSkeleton__block">
            <Skeleton width="170px" height="20px" />
            {Array.from({ length: RANKS }, (_, index) => (
              <div key={index} className="tasteSkeleton__rank">
                <Skeleton width="110px" height="12px" />
                <Skeleton height="6px" radius="3px" />
                <Skeleton width="26px" height="12px" />
              </div>
            ))}
          </div>

          <div className="tasteSkeleton__block">
            <Skeleton width="150px" height="20px" />
            <div className="tasteSkeleton__faces">
              {Array.from({ length: FACES }, (_, index) => (
                <div key={index} className="tasteSkeleton__face">
                  <Skeleton width="58px" height="58px" radius="50%" />
                  <Skeleton width="52px" height="10px" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <Skeleton width="230px" height="20px" />
        <div className="tasteSkeleton__years">
          {Array.from({ length: YEARS }, (_, index) => (
            <Skeleton key={index} height={`${30 + ((index * 37) % 60)}px`} radius="3px 3px 0 0" />
          ))}
        </div>

        <Skeleton width="90px" height="20px" />
        <div className="tasteSkeleton__formats">
          {Array.from({ length: FORMATS }, (_, index) => (
            <Skeleton key={index} height="62px" radius="10px" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default TasteSkeleton;
