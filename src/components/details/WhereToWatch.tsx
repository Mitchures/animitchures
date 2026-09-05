import './WhereToWatch.css';

import { Media } from 'graphql/types';

/**
 * Sites AniList links to that actually stream the show. `externalLinks` mixes
 * these with official sites and social accounts, and the query does not request
 * the `type` field that would separate them — so match on the site name and
 * treat everything else as a plain link.
 */
const STREAMING = [
  'Crunchyroll',
  'Funimation',
  'Netflix',
  'Hulu',
  'Amazon Prime Video',
  'Amazon',
  'Disney Plus',
  'HIDIVE',
  'Adult Swim',
  'Tubi TV',
  'VRV',
  'Max',
  'AnimeLab',
  'Retrocrush',
  'Midnight Pulp',
  'Hoopla',
  'RetroCrush',
  'Youtube',
  'YouTube',
];

function WhereToWatch({ externalLinks }: Media) {
  const links = (externalLinks ?? []).filter((link) => link?.url && link?.site);
  if (!links.length) return null;

  const streaming = links.filter((link) => STREAMING.includes(link!.site));
  const other = links.filter((link) => !STREAMING.includes(link!.site));

  return (
    <div className="whereToWatch">
      {streaming.length > 0 && (
        <>
          <h3>Where to watch</h3>
          <div className="whereToWatch__row">
            {streaming.map((link) => (
              <a
                key={link!.url!}
                className="whereToWatch__link whereToWatch__link--stream"
                href={link!.url!}
                target="_blank"
                rel="noreferrer noopener"
              >
                {link!.site}
              </a>
            ))}
          </div>
        </>
      )}
      {other.length > 0 && (
        <>
          <h3>Links</h3>
          <div className="whereToWatch__row">
            {other.map((link) => (
              <a
                key={link!.url!}
                className="whereToWatch__link"
                href={link!.url!}
                target="_blank"
                rel="noreferrer noopener"
              >
                {link!.site}
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default WhereToWatch;
