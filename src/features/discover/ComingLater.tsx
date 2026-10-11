import { Link } from 'react-router-dom';

import './ComingLater.css';

import DotNumber from 'components/DotNumber';
import FrostedTile from 'components/FrostedTile';
import PosterArt from 'components/PosterArt';
import { ComingLater as Model, displayTitle, compactCount } from 'features/discover/derive';
import { FeaturedMedia } from 'graphql/featured';
import { mediaPath, paletteFromColor, PALETTES, seasonChip } from 'helpers';

/** Ticks in a runner-up's reach strip. */
const REACH_TICKS = 20;

const studioOf = (media: FeaturedMedia) =>
  media.studios?.edges?.find((edge) => edge?.isMain)?.node?.name ?? '';

function SeasonTag({ media }: { media: FeaturedMedia }) {
  const chip = seasonChip(media.season);
  if (!chip) return null;
  return (
    <span
      className="comingLater__season"
      style={{ background: chip.background, color: chip.color }}
    >
      {chip.label}
    </span>
  );
}

/**
 * What is announced for after this season, lead first.
 *
 * Asymmetric on purpose: the title most people are waiting for gets a frosted
 * tile in its own cover colour, and the runners-up get quiet rows. A row of
 * equal cards said nothing about which of them matters.
 */
function ComingLater({ lead, rest, total }: Model) {
  if (!lead) return null;

  const leadWaiting = lead.popularity ?? 0;

  return (
    <div className="comingLater">
      <FrostedTile
        treatment="core"
        live
        palette={paletteFromColor(lead.coverImage.color, PALETTES.night)}
        to={mediaPath(lead.id, lead.title.userPreferred)}
        className="comingLater__lead"
      >
        <span className="comingLater__leadTop">
          {/* The only lime in the section: it marks one thing. */}
          <span className="comingLater__badge">Most awaited</span>
          <SeasonTag media={lead} />
        </span>
        <img className="comingLater__leadPoster" src={lead.coverImage.large ?? undefined} alt="" />
        <span className="comingLater__leadTitle">{displayTitle(lead)}</span>
        <span className="comingLater__leadMeta">
          {[studioOf(lead), lead.episodes ? `${lead.episodes} episodes` : null]
            .filter(Boolean)
            .join(' · ')}
        </span>
        <span className="comingLater__leadCount">
          <DotNumber value={compactCount(leadWaiting)} size="lg" />
          <small>people waiting</small>
        </span>
      </FrostedTile>

      <div className="comingLater__stack">
        {rest.map((media) => {
          const waiting = media.popularity ?? 0;
          const lit = leadWaiting ? Math.round((waiting / leadWaiting) * REACH_TICKS) : 0;
          const colour = media.coverImage.color ?? undefined;
          return (
            <Link
              key={media.id}
              className="comingLater__row"
              to={mediaPath(media.id, media.title.userPreferred)}
            >
              <span className="comingLater__art">
                <PosterArt src={media.coverImage.large} color={media.coverImage.color} />
              </span>
              <span className="comingLater__body">
                <span className="comingLater__title">{displayTitle(media)}</span>
                <span className="comingLater__meta">
                  {studioOf(media)} · <DotNumber value={compactCount(waiting)} size="xs" /> waiting
                </span>
                {/* How far this reaches against the lead. */}
                <span className="comingLater__reach" aria-hidden="true">
                  {Array.from({ length: REACH_TICKS }, (_, index) => (
                    <i
                      key={index}
                      className={index < lit ? 'is-on' : undefined}
                      style={index < lit && colour ? { background: colour } : undefined}
                    />
                  ))}
                </span>
              </span>
              <SeasonTag media={media} />
            </Link>
          );
        })}
      </div>

      {total > rest.length + 1 && (
        <p className="comingLater__rest">
          and <DotNumber value={total - rest.length - 1} size="xs" /> more announced
        </p>
      )}
    </div>
  );
}

export default ComingLater;
