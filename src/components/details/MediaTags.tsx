import { useState } from 'react';

import './MediaTags.css';

import { Media, MediaTag } from 'graphql/types';

/**
 * AniList's community tags — far more specific than the four or five genres in
 * the hero ("Episodic", "Ensemble Cast", "Philosophy" rather than "Drama").
 * Already fetched with the rest of the media and never rendered until now.
 *
 * Rank is the percentage of voters who agreed the tag applies, so it doubles as
 * a confidence score and as the sort order.
 *
 * Spoiler tags are withheld behind a click rather than shown dimmed: a spoiler
 * you can read is not hidden.
 */
function MediaTags({ tags }: Media) {
  const [showSpoilers, setShowSpoilers] = useState(false);

  const all = (tags ?? []).filter((tag): tag is MediaTag => !!tag?.name);
  if (!all.length) return null;

  const isSpoiler = (tag: MediaTag) => tag.isMediaSpoiler || tag.isGeneralSpoiler;
  const safe = all.filter((tag) => !isSpoiler(tag)).sort((a, b) => (b.rank ?? 0) - (a.rank ?? 0));
  const spoilers = all.filter(isSpoiler).sort((a, b) => (b.rank ?? 0) - (a.rank ?? 0));

  return (
    <div className="mediaTags">
      <h3>Tags</h3>
      <div className="mediaTags__row">
        {safe.map((tag) => (
          <span key={tag.id} className="mediaTags__tag" title={tag.description ?? undefined}>
            {tag.name}
            <b>{tag.rank}%</b>
          </span>
        ))}

        {spoilers.length > 0 &&
          (showSpoilers ? (
            spoilers.map((tag) => (
              <span
                key={tag.id}
                className="mediaTags__tag mediaTags__tag--spoiler"
                title={tag.description ?? undefined}
              >
                {tag.name}
                <b>{tag.rank}%</b>
              </span>
            ))
          ) : (
            <button
              type="button"
              className="mediaTags__reveal"
              onClick={() => setShowSpoilers(true)}
            >
              Show {spoilers.length} spoiler {spoilers.length === 1 ? 'tag' : 'tags'}
            </button>
          ))}
      </div>
    </div>
  );
}

export default MediaTags;
