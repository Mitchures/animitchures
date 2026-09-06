import { Link } from 'react-router-dom';

import './PopularityList.css';

import SectionHeading from 'components/SectionHeading';

import { FeaturedMedia } from 'graphql/featured';
import { mediaPath } from 'helpers';

const COUNT = 8;

/** 1,050,648 people is the point; the exact digits are not. */
const compact = (value: number) =>
  value >= 1_000_000 ? `${(value / 1_000_000).toFixed(2)}M` : `${Math.round(value / 1000)}K`;

const FORMAT_LABEL: Record<string, string> = { TV: 'TV', MOVIE: 'Film', ONA: 'ONA', OVA: 'OVA' };

/**
 * The all-time list, led by the figure.
 *
 * A progress bar was the obvious treatment and the wrong one: the top titles run
 * 1,050,648 down to about 711,951, so every bar sat between 68% and 100% full
 * and compared values that barely differ. The count itself is the interesting
 * thing — a million people watched this — so it is set large and the bar is
 * gone.
 */
function PopularityList({ media }: { media: FeaturedMedia[] }) {
  // filter() cannot narrow the element type, so restate what it guarantees.
  const entries = (media ?? [])
    .filter((item): item is FeaturedMedia & { popularity: number } => Boolean(item?.popularity))
    .slice(0, COUNT);
  if (!entries.length) return null;

  return (
    <section className="popularity">
      <SectionHeading title="All time popular" />
      <div className="popularity__grid">
        {entries.map((item) => (
          <Link
            key={item.id}
            className="popularity__row"
            to={mediaPath(item.id, item.title.userPreferred)}
          >
            <img src={item.coverImage?.large ?? ''} alt={item.title.userPreferred} loading="lazy" />
            <span className="popularity__body">
              <span className="popularity__title">
                {item.title.english ?? item.title.userPreferred}
              </span>
              <span className="popularity__meta">
                {[(item.format && FORMAT_LABEL[item.format]) ?? item.format, item.startDate?.year]
                  .filter(Boolean)
                  .join(', ')}
              </span>
            </span>
            <span className="popularity__count">
              {compact(item.popularity)}
              <em>members</em>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default PopularityList;
