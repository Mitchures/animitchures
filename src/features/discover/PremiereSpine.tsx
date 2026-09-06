import { useRef, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import './PremiereSpine.css';

import SectionHeading from 'components/SectionHeading';

import { mediaPath, seasonLabel, mainStudio } from 'helpers';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
/** A break wider than this earns a visible gap rather than an even gutter. */
const GAP_DAYS = 7;

type Dated = { media: any; at: number | null; label: string };

const toDate = (media: any): number | null => {
  const { year, month, day } = media?.startDate ?? {};
  // A month without a day cannot be placed on the spine — AniList gives plenty
  // of those, and guessing the 1st would put a title on a date it does not have.
  if (!year || !month || !day) return null;
  return Date.UTC(year, month - 1, day);
};

/**
 * The season's premieres, laid out in the order they actually start.
 *
 * Of all the Discover buckets this one has the least to say — nothing here is
 * scored yet and most have no banner art, because they have barely aired. What
 * it does have is a date for nearly every title, and in order those dates have
 * a shape: a cluster at the top of the season, then stragglers. So the section
 * shows the shape. The next premiere is accented, because "what starts next" is
 * the question this list actually answers.
 *
 * Titles with only a month go in a final group rather than being guessed onto a
 * day they do not have.
 */
function PremiereSpine({ media }: { media: any[] }) {
  const scroller = useRef<HTMLDivElement>(null);
  // Read once on mount rather than during render: Date.now() is impure, and
  // premiere dates do not move while you are looking at them.
  const [today] = useState(() => Date.now());

  const { dated, undated, heading, nextIndex } = useMemo(() => {
    const all: Dated[] = (media ?? []).map((item) => {
      const at = toDate(item);
      return {
        media: item,
        at,
        label:
          at === null ? '' : `${MONTHS[new Date(at).getUTCMonth()]} ${new Date(at).getUTCDate()}`,
      };
    });

    const withDate = all.filter((entry) => entry.at !== null).sort((a, b) => a.at! - b.at!);
    const withoutDate = all.filter((entry) => entry.at === null);

    // The first premiere still to come — what the section is really for.
    const upcoming = withDate.findIndex((entry) => entry.at! >= today);

    const first = media?.[0];
    const season = seasonLabel(first?.season);
    const year = first?.startDate?.year;
    const count = media?.length ?? 0;

    return {
      dated: withDate,
      undated: withoutDate,
      nextIndex: upcoming,
      heading: [
        season && year ? `${season} ${year}` : season,
        `${count} ${count === 1 ? 'title' : 'titles'}`,
      ]
        .filter(Boolean)
        .join(', '),
    };
  }, [media, today]);

  if (!dated.length && !undated.length) return null;

  const gapBefore = (index: number) => {
    if (index === 0) return false;
    const days = (dated[index].at! - dated[index - 1].at!) / 86_400_000;
    return days > GAP_DAYS;
  };

  const poster = (entry: Dated) => (
    <Link
      className="spine__item"
      to={mediaPath(entry.media.id, entry.media.title.userPreferred)}
      key={entry.media.id}
    >
      <img
        src={entry.media.coverImage?.large ?? entry.media.coverImage?.extraLarge ?? ''}
        alt={entry.media.title.userPreferred}
        loading="lazy"
      />
      <span className="spine__title">
        {entry.media.title.english ?? entry.media.title.userPreferred}
      </span>
      <span className="spine__studio">{mainStudio(entry.media.studios)}</span>
    </Link>
  );

  return (
    <section className="spine">
      <SectionHeading title="Starting this season" detail={heading} />
      <div className="spine__scroller scrollerX" ref={scroller}>
        <div className="spine__inner">
          {/* Three rows that must stay in step: posters, the rule, and the
              dates. They share one track so a gap widens all three together. */}
          <div className="spine__row">
            {dated.map((entry, index) => (
              <div className="spine__cell" key={entry.media.id}>
                {gapBefore(index) && <span className="spine__gap" aria-hidden="true" />}
                {poster(entry)}
              </div>
            ))}
            {undated.length > 0 && (
              <div className="spine__cell spine__cell--rest">
                <span className="spine__gap" aria-hidden="true" />
                {undated.map(poster)}
              </div>
            )}
          </div>

          <div className="spine__rule" />

          <div className="spine__row spine__row--dates">
            {dated.map((entry, index) => (
              <div className="spine__cell" key={entry.media.id}>
                {gapBefore(index) && (
                  <span className="spine__gapLabel">
                    {Math.round((entry.at! - dated[index - 1].at!) / 86_400_000)} days
                  </span>
                )}
                <span className={`spine__date${index === nextIndex ? ' spine__date--next' : ''}`}>
                  {entry.label}
                </span>
              </div>
            ))}
            {undated.length > 0 && (
              <div className="spine__cell spine__cell--rest">
                <span className="spine__gapLabel" />
                <span className="spine__date spine__date--tbc">Date to come</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default PremiereSpine;
