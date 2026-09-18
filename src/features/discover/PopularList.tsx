import { CSSProperties } from 'react';
import { Link } from 'react-router-dom';

import './PopularList.css';

import DotNumber from 'components/DotNumber';
import { displayTitle, compactCount } from 'features/discover/derive';
import { FeaturedMedia } from 'graphql/featured';
import { mediaPath } from 'helpers';

/**
 * One dot per this many members, and how many slots the block holds.
 *
 * Chosen so the top of the list actually separates: at 25,000 a dot, Attack on
 * Titan fills all forty-two and Hunter x Hunter thirty-four. Scaled from zero
 * instead, the same six read 100, 94, 92, 91, 83 and 80 per cent — six bars of
 * identical length, because everything in an all-time top fifteen is popular.
 */
const PER_DOT = 25_000;
const SLOTS = 42;
/** How many of the leader's dots go lime. Only the leader gets any. */
const LIME_TAIL = 4;

const studioOf = (media: FeaturedMedia) =>
  media.studios?.edges?.find((edge) => edge?.isMain)?.node?.name ?? '';

/**
 * The most-listed titles on AniList, compared by the reference's dotted matrix.
 *
 * The matrix quantises — two titles ten thousand members apart get the same
 * number of dots — so the exact figure is printed beside it. What it buys is a
 * comparison you can read at a glance without a chart that misrepresents its
 * own scale.
 */
function PopularList({ media }: { media: FeaturedMedia[] }) {
  if (!media.length) return null;

  return (
    <div className="popularList">
      {media.map((item, index) => {
        const members = item.popularity ?? 0;
        const lit = Math.min(SLOTS, Math.round(members / PER_DOT));
        const colour = item.coverImage.color;
        const isLeader = index === 0;

        return (
          <Link
            key={item.id}
            className={`popularRow${isLeader ? ' popularRow--leader' : ''}`}
            to={mediaPath(item.id, item.title.userPreferred)}
            /* The cover colour arrives as a custom property rather than as a
               colour, because the CSS has to mix a contrast floor into it: half
               of an all-time top six have pale covers (#f1c9ae, #f1d643) that
               disappear on the row's own near-white surface. */
            style={colour ? ({ ['--tone' as string]: colour } as CSSProperties) : undefined}
          >
            <span className="popularRow__rank">
              <DotNumber value={index + 1} arrive="none" />
            </span>
            <span className="popularRow__body">
              <span className="popularRow__title">{displayTitle(item)}</span>
              <span className="popularRow__meta">
                {[studioOf(item), item.startDate?.year, item.episodes ? `${item.episodes} episodes` : null]
                  .filter(Boolean)
                  .join(' · ')}
              </span>
            </span>
            <span className="popularRow__matrix" aria-hidden="true">
              {Array.from({ length: SLOTS }, (_, slot) => {
                if (slot >= lit) return <i key={slot} />;
                const lime = isLeader && slot >= lit - LIME_TAIL;
                return <i key={slot} className={lime ? 'is-on is-lime' : 'is-on'} />;
              })}
            </span>
            <span className="popularRow__count">
              <DotNumber value={compactCount(members)} size="sm" />
              <small>members</small>
            </span>
            <span className="popularRow__badge">
              {isLeader && <span className="popularRow__leaderChip">Most listed</span>}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

export default PopularList;
