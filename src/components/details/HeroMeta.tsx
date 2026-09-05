import './HeroMeta.css';

import { Media } from 'graphql/types';

/**
 * The four figures worth scanning, shown as chips in the hero. The remaining
 * fields live in the sidebar — putting all fourteen here would overload it.
 */
function HeroMeta({ media }: { media: Media }) {
  const chips = [
    media.format && { label: 'Format', value: String(media.format).replace(/_/g, ' ') },
    media.episodes && { label: 'Episodes', value: `${media.episodes}` },
    media.duration && { label: 'Runtime', value: `${media.duration}m` },
    media.status && { label: 'Status', value: String(media.status).replace(/_/g, ' ') },
  ].filter(Boolean) as { label: string; value: string }[];

  // Chips are filtered rather than rendered empty: not every title has an
  // episode count or a duration.
  return (
    <div className="heroMeta">
      {chips.map(({ label, value }) => (
        <div key={label} className="heroMeta__chip">
          <b>{value}</b>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}

export default HeroMeta;
