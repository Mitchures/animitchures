import { Link } from 'react-router-dom';

import './RankChart.css';

import SectionHeading from 'components/SectionHeading';

import { FeaturedMedia } from 'graphql/featured';
import { mediaPath } from 'helpers';

const COUNT = 10;

/**
 * The top-ranked list as a chart.
 *
 * These scores cluster at 90–91, so printing them says almost nothing — the
 * position is what distinguishes them. The rank is set as a large outlined
 * numeral that the poster overlaps, which is the only place on Discover where
 * type is doing the work instead of artwork.
 */
function RankChart({ media }: { media: FeaturedMedia[] }) {
  const entries = (media ?? []).slice(0, COUNT);
  if (!entries.length) return null;

  return (
    <section className="rankChart">
      <SectionHeading title="Top ranked" />
      <div className="rankChart__scroller scrollerX">
        {entries.map((item, index) => (
          <Link
            key={item.id}
            className="rankChart__entry"
            to={mediaPath(item.id, item.title.userPreferred)}
            aria-label={`Number ${index + 1}, ${item.title.userPreferred}`}
          >
            <span className="rankChart__rank" aria-hidden="true">
              {index + 1}
            </span>
            <img src={item.coverImage?.large ?? ''} alt={item.title.userPreferred} loading="lazy" />
          </Link>
        ))}
      </div>
    </section>
  );
}

export default RankChart;
