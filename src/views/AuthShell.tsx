import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';

import './AuthShell.css';

import { FEATURED_QUERY } from 'graphql/queries';
import { FeaturedMedia, featuredVariables } from 'graphql/featured';
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
 * The wall runs the same `Featured` query Discover does, with **the same
 * variables** — which is the whole trick. Apollo caches by query *and*
 * variables, so this used to send no variables where Discover sends season ones,
 * and the sign-in path fetched 173 KB of Featured twice against a budget of 30
 * requests a minute. Sharing `featuredVariables` makes the two a single cache
 * entry, so signing in and landing on Discover costs nothing extra. Reusing the
 * query also means the e2e suite needs no new fixture.
 *
 * `isAdult` is false rather than read from a profile because nobody is signed in
 * on this page; Discover passes the real flag once there is one to read, and a
 * visitor who has it set simply refetches on arrival.
 *
 * The wall is decoration and is treated as such — `errorPolicy: 'all'` keeps a
 * partial response usable, and if the query fails or is still in flight the
 * page renders complete on the gradient alone. Sign-in never waits on it.
 */
function AuthShell({ title, subtitle, children }: Props) {
  const { data } = useQuery(FEATURED_QUERY, {
    variables: featuredVariables(false),
    errorPolicy: 'all',
  });

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
