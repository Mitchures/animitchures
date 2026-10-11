import { CSSProperties, useMemo } from 'react';

import './NextEpisodeTile.css';

import DotNumber from 'components/DotNumber';
import FrostedTile from 'components/FrostedTile';
import { prefersReducedMotion } from 'components/useSettle';
import {
  EPISODE_GAP,
  NextEpisode,
  displayTitle,
  waitLabel,
} from 'features/discover/derive';
import { mediaPath, paletteFromColor, PALETTES } from 'helpers';

/** The ring's radius inside a 300-unit square. */
const R = 104;
/**
 * One tick an hour across the gap.
 *
 * 168 of them on a 208px circle is a dotted ring, which is the texture the
 * reference has. A ring of seven day-ticks looked like a pie chart.
 */
const TICKS = Math.round(EPISODE_GAP / 3600);
const CENTRE = 150;

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const onCircle = (fraction: number, radius: number) => {
  const angle = fraction * Math.PI * 2 - Math.PI / 2;
  return { x: CENTRE + Math.cos(angle) * radius, y: CENTRE + Math.sin(angle) * radius };
};

const airsLabel = (airingAt: number) => {
  const date = new Date(airingAt * 1000);
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${DAYS[date.getDay()]} at ${hours % 12 === 0 ? 12 : hours % 12}:${minutes}${
    hours < 12 ? 'am' : 'pm'
  }`;
};

/**
 * The tile above Discover's season card: a dotted ring closing on the next
 * episode, the wait as one figure, and what you are waiting for at the foot.
 *
 * It takes `LinkTile`'s slot whenever there is nothing to link — signed out, or
 * signed in with AniList already connected — which is what left a 300px square
 * of the right-hand column empty.
 *
 * **The ring is the wait; the card below keeps the season countdown.** Both
 * counting down would have repeated the mistake the three widgets made before
 * they became decks.
 *
 * **The ring goes white, not the cover colour.** The tile already carries the
 * show's colour, and a coloured ring on a coloured ground competes with it. The
 * unlit run is a shadow rather than faint white: at 30% white over a mid-tone
 * tile it was indistinguishable from the lit run, so the ring read as one
 * uniform dotted circle and showed no progress at all — which is the only thing
 * it is for.
 */
function NextEpisodeTile({ next, now }: { next: NextEpisode; now: Date }) {
  const { media, wait, elapsed, mine } = next;
  const { value, unit } = waitLabel(wait);
  const reduced = prefersReducedMotion();

  /**
   * The lit run is the wait that *remains*, not the part that has gone.
   *
   * Filling as time passed meant that at three hours out the ring was 165 of
   * 168 ticks white with a three-tick gap — which reads as a damaged ring, not
   * as "almost here". Depleting inverts it: a long wait is a full ring, an
   * imminent episode is a short arc, and there is never a notch.
   */
  const remaining = 1 - elapsed;
  const ticks = useMemo(
    () => {
      const lastLit = Math.max(0, Math.round(remaining * TICKS) - 1);
      return Array.from({ length: TICKS }, (_, index) => {
        const lit = index / TICKS < remaining;
        // The lit run reaches a little further in as well as being brighter, so
        // the boundary has a length cue and not only a weight one.
        const inner = onCircle(index / TICKS, R - (lit ? 8 : 5));
        const outer = onCircle(index / TICKS, R + 1);
        return { lit, head: lit && index === lastLit, ...inner, x2: outer.x, y2: outer.y, index };
      });
    },
    [remaining],
  );

  return (
    <FrostedTile
      // Centred discs. The offset arc put a pale left and a saturated right
      // behind a circular ring, so the same tick read differently depending
      // where on the circle it sat.
      treatment="core"
      palette={paletteFromColor(media.coverImage.color, PALETTES.night)}
      to={mediaPath(media.id, media.title.userPreferred)}
      className="nextEpisode"
    >
      <span className="nextEpisode__eyebrow">{mine ? 'Your next episode' : 'Airing next'}</span>

      <span className="nextEpisode__dial">
        <svg className="nextEpisode__svg" viewBox="0 0 300 300" aria-hidden="true">
          <g className="nextEpisode__ticks">
            {ticks.map((tick) => (
              <line
                key={tick.index}
                className={
                  // The lime lives on the last lit tick, not on a dot floating
                  // over the band: a dot there covered the ticks either side of
                  // the boundary and left a gap in the ring.
                  [tick.lit ? 'is-lit' : '', tick.head ? 'is-head' : ''].filter(Boolean).join(' ') ||
                  undefined
                }
                x1={tick.x.toFixed(1)}
                y1={tick.y.toFixed(1)}
                x2={tick.x2.toFixed(1)}
                y2={tick.y2.toFixed(1)}
                style={
                  reduced || !tick.lit
                    ? undefined
                    : ({ '--delay': `${300 + (tick.index / TICKS) * 700}ms` } as CSSProperties)
                }
              />
            ))}
          </g>
        </svg>
        <span className="nextEpisode__centre">
          <DotNumber className="nextEpisode__figure" value={value} size="xl" arrive="none" />
          <small>{unit}</small>
        </span>
      </span>

      <span className="nextEpisode__foot">
        <img
          className="nextEpisode__poster"
          src={media.coverImage.large ?? undefined}
          alt=""
          loading="lazy"
        />
        <span>
          <span className="nextEpisode__title">{displayTitle(media)}</span>
          <span className="nextEpisode__sub">
            {media.nextAiringEpisode.episode === 1
              ? 'premieres'
              : `episode ${media.nextAiringEpisode.episode}${
                  media.episodes ? ` of ${media.episodes}` : ''
                }`}
            , {airsLabel(media.nextAiringEpisode.airingAt)}
          </span>
        </span>
      </span>
      {/* `now` is not read directly — it is the prop that makes the parent
          re-render every minute, which is what keeps the figure honest. */}
      <span hidden data-at={now.getTime()} />
    </FrostedTile>
  );
}

export default NextEpisodeTile;
