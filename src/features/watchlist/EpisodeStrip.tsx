import './EpisodeStrip.css';

interface Props {
  progress: number;
  /** Null while a series is still airing and has no announced total. */
  episodes: number | null;
  /**
   * How many ticks may be drawn before the strip collapses to a bar. Below
   * roughly 4px a tick stops reading as a tick and the strip turns into a
   * hairline texture, so the budget is set by how wide the strip is rendered:
   * the up-next band affords far more than a ledger row.
   */
  maxTicks?: number;
  label?: string;
}

/**
 * How far into a series you are, drawn as the series itself.
 *
 * One tick per episode, filled to your progress — "two left" reads before any
 * number does. Three shapes, chosen by what the data supports:
 *
 * - ticks, when every episode can be drawn wide enough to see;
 * - a bar, when there are too many episodes for that (366 ticks is noise);
 * - an open bar fading out at the right, when the total is unknown. Nothing
 *   should imply an ending the API has not announced.
 */
function EpisodeStrip({ progress, episodes, maxTicks = 48, label }: Props) {
  const shared = {
    role: 'img' as const,
    'aria-label': label ?? `${progress} of ${episodes ?? 'an unknown number of'} episodes watched`,
  };

  if (episodes && episodes <= maxTicks) {
    return (
      <span className="episodeStrip" {...shared}>
        {Array.from({ length: episodes }, (_, index) => (
          <i key={index} className={index < progress ? 'is-watched' : ''} />
        ))}
      </span>
    );
  }

  if (episodes) {
    const percent = Math.min(100, Math.round((progress / episodes) * 100));
    return (
      <span className="episodeStrip episodeStrip--bar" {...shared}>
        <i style={{ width: `${percent}%` }} />
      </span>
    );
  }

  // No total to divide by. Show the run so far against a horizon that never
  // arrives, rather than a percentage of a number nobody has published.
  return (
    <span className="episodeStrip episodeStrip--open" {...shared}>
      <i style={{ width: progress > 0 ? '58%' : '0%' }} />
    </span>
  );
}

export default EpisodeStrip;
