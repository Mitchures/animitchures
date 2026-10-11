import { Link } from 'react-router-dom';

import './SeasonWeeks.css';

import DotNumber from 'components/DotNumber';
import PosterArt from 'components/PosterArt';
import { FeaturedMedia } from 'graphql/featured';
import { SeasonWeek, displayTitle } from 'features/discover/derive';
import { mediaPath } from 'helpers';

/** How many posters a card shows before it counts the rest. */
const POSTERS = 3;

interface Props {
  weeks: SeasonWeek[];
  undated: FeaturedMedia[];
}

const poster = (media: FeaturedMedia) => (
  <Link
    key={media.id}
    className="seasonWeek__poster"
    to={mediaPath(media.id, media.title.userPreferred)}
    aria-label={displayTitle(media)}
  >
    <PosterArt src={media.coverImage.large} color={media.coverImage.color} />
  </Link>
);

/**
 * The season's premieres, a card per week.
 *
 * Built on the reference's biomarker card — quiet label, the count as the big
 * figure, a line of prose, then a tick strip — because that stack answers the
 * two questions in order: how much is starting, and which days. A poster rail
 * alone answers neither.
 *
 * The seven ticks are Monday to Sunday, lit in the cover colour of whatever
 * premieres that day, so a card carries its own small distribution.
 */
function SeasonWeeks({ weeks, undated }: Props) {
  if (!weeks.length && !undated.length) return null;

  return (
    <div className="seasonWeeks">
      {weeks.map(({ start, label, isCurrent, premieres, days, lede }) => (
        <div
          key={start}
          className={`seasonWeek${isCurrent ? ' seasonWeek--current' : ''}${
            premieres.length ? '' : ' seasonWeek--empty'
          }`}
        >
          {premieres.length === 0 ? (
            <p className="seasonWeek__nothing">
              Nothing premieres
              <br />
              the week of {new Date(start * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
          ) : (
            <>
              <span className="seasonWeek__label">
                <i aria-hidden="true" />
                {label}
              </span>
              <span className="seasonWeek__count">
                <DotNumber value={premieres.length} size="lg" />
                <small>{premieres.length === 1 ? 'premiere' : 'premieres'}</small>
              </span>
              <p className="seasonWeek__lede">{lede}</p>
              <span className="seasonWeek__days" aria-hidden="true">
                {days.map((colors, index) => (
                  <i
                    key={index}
                    className={colors.length ? 'is-on' : undefined}
                    style={colors.length ? { background: colors[0] } : undefined}
                  />
                ))}
              </span>
              <span className="seasonWeek__posters">
                {premieres.slice(0, POSTERS).map(poster)}
                {premieres.length > POSTERS && (
                  <span className="seasonWeek__more">+{premieres.length - POSTERS}</span>
                )}
              </span>
            </>
          )}
        </div>
      ))}

      {undated.length > 0 && (
        <div className="seasonWeek seasonWeek--undated">
          <span className="seasonWeek__label">
            <i aria-hidden="true" />
            Not yet dated
          </span>
          <span className="seasonWeek__count">
            <DotNumber value={undated.length} size="lg" />
            <small>{undated.length === 1 ? 'announced' : 'announced'}</small>
          </span>
          <p className="seasonWeek__lede">
            {/* Named rather than hidden: one of these is usually a headline show. */}
            {undated.map(displayTitle).slice(0, 2).join(', ')}
            {undated.length > 2 && ` and ${undated.length - 2} more`}
          </p>
          <span className="seasonWeek__days seasonWeek__days--none" aria-hidden="true">
            {Array.from({ length: 7 }, (_, index) => (
              <i key={index} />
            ))}
          </span>
          <span className="seasonWeek__posters">{undated.slice(0, POSTERS).map(poster)}</span>
        </div>
      )}
    </div>
  );
}

export default SeasonWeeks;
