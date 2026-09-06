import { Link } from 'react-router-dom';

import './UpcomingSeason.css';

import Badge from 'components/Badge';
import SectionHeading from 'components/SectionHeading';

import { mediaPath, seasonLabel } from 'helpers';

const COUNT = 6;

/**
 * What is coming next season.
 *
 * Nothing here has aired, so a poster wall would be asking you to judge shows on
 * cover art alone. These do have banner art — unlike the current season — so the
 * cards use it, with the season itself as the badge. Titles without a banner
 * fall back to their cover, which crops acceptably at this aspect.
 */
function UpcomingSeason({ media }: { media: any[] }) {
  const entries = (media ?? []).slice(0, COUNT);
  if (!entries.length) return null;

  return (
    <section className="upcoming">
      <SectionHeading title="Upcoming next season" />
      <div className="upcoming__grid">
        {entries.map((item) => {
          const season = seasonLabel(item.season);
          const year = item.startDate?.year;
          return (
            <Link
              key={item.id}
              className="upcoming__card"
              to={mediaPath(item.id, item.title.userPreferred)}
              style={{
                backgroundImage: `url(${item.bannerImage ?? item.coverImage?.extraLarge ?? item.coverImage?.large})`,
              }}
            >
              <span className="upcoming__scrim" />
              <span className="upcoming__body">
                <span className="upcoming__title">
                  {item.title.english ?? item.title.userPreferred}
                </span>
                {season && <Badge tone="gold" value={year ? `${season} ${year}` : season} />}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default UpcomingSeason;
