import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';

import './AuthShell.css';

import { FEATURED_QUERY } from 'graphql/queries';
import { FeaturedMedia } from 'graphql/featured';
import Logo from '../images/animitchures-logo.svg';

const WALL_COUNT = 28;

interface Props {
  title: string;
  subtitle: string;
  children: ReactNode;
}

/**
 * The frame both auth pages sit in: a wall of cover art, a scrim, and a card.
 *
 * The wall runs the same `Featured` query Discover does, with no variables —
 * every argument is optional and only the `trending` page is read. Two reasons
 * to reuse it rather than write a leaner one: Apollo caches by query, so
 * arriving at Discover after signing in costs nothing, and the e2e suite
 * already has a `Featured` fixture, so the auth pages need no new capture.
 *
 * The wall is decoration and is treated as such — `errorPolicy: 'all'` keeps a
 * partial response usable, and if the query fails or is still in flight the
 * page renders complete on the gradient alone. Sign-in never waits on it.
 */
function AuthShell({ title, subtitle, children }: Props) {
  const { data } = useQuery(FEATURED_QUERY, { errorPolicy: 'all' });

  const posters: string[] = (data?.trending?.media ?? [])
    .map((media: FeaturedMedia) => media?.coverImage?.extraLarge ?? media?.coverImage?.large)
    .filter((src: string | null | undefined): src is string => !!src);

  // The row is repeated rather than fetched deeper: 15 trending titles is what
  // the query returns, and a wall wants roughly twice that.
  const wall = posters.length
    ? Array.from({ length: WALL_COUNT }, (_, i) => posters[i % posters.length])
    : [];

  return (
    <div className="auth">
      {!!wall.length && (
        <div className="auth__wall" aria-hidden="true">
          <div className="auth__wallGrid">
            {wall.map((src, i) => (
              <img key={i} src={src} alt="" loading="lazy" decoding="async" />
            ))}
          </div>
        </div>
      )}
      <div className="auth__scrim" aria-hidden="true" />

      <main className="auth__card">
        <Link to="/" className="auth__brand">
          <img src={Logo} alt="" />
          <span>animitchures</span>
        </Link>
        <h1>{title}</h1>
        <p className="auth__sub">{subtitle}</p>
        {children}
      </main>
    </div>
  );
}

export default AuthShell;
