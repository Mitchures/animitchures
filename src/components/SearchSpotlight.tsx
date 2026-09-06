import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLazyQuery } from '@apollo/client';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Search as SearchIcon } from '@mui/icons-material';

import './SearchSpotlight.css';

import Skeleton from 'components/Skeleton';

import { Media } from 'graphql/types';
import { SEARCH_QUERY } from 'graphql/queries';
import { mediaPath } from 'helpers';

const DEBOUNCE_MS = 250;
const RESULT_COUNT = 6;

const IS_MAC = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);
export const SEARCH_SHORTCUT = IS_MAC ? '⌘K' : 'Ctrl K';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Global search. Replaces the desktop header, which was 116px of translucent
 * bar holding a single input.
 *
 * Results are posters rather than a list of strings: this is an anime app, and
 * cover art is how people recognise a title. The old header search had no live
 * results at all — it only navigated on submit.
 *
 * The trigger lives at the top of the rail, so open state is owned by AppShell
 * and this component is controlled. Below 960px the rail is hidden and the
 * header returns with its own inline Search.
 */
function SearchSpotlight({ open, onOpenChange }: Props) {
  const [term, setTerm] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const returnFocusTo = useRef<HTMLElement | null>(null);
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();

  const [runSearch, { data, loading }] = useLazyQuery(SEARCH_QUERY);
  const query = term.trim();
  // Gated on the current term, not just on `data`: Apollo keeps the last
  // response, so without this the previous search's posters were still sitting
  // there the next time the spotlight opened.
  const results: Media[] = query ? (data?.Page?.media ?? []).slice(0, RESULT_COUNT) : [];

  const close = useCallback(() => {
    onOpenChange(false);
    setTerm('');
    setActive(0);
  }, [onOpenChange]);

  const goToResults = useCallback(() => {
    if (!query) return;
    navigate(`/search/anime?search=${encodeURIComponent(query)}`);
    close();
  }, [query, navigate, close]);

  const openMedia = useCallback(
    (media: Media) => {
      navigate(mediaPath(media.id, media.title?.userPreferred ?? ''));
      close();
    },
    [navigate, close],
  );

  // ⌘K / Ctrl+K anywhere, and "/" when the caret is not already in a field.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping =
        !!target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        if (open) close();
        else onOpenChange(true);
      } else if (event.key === '/' && !isTyping && !open) {
        event.preventDefault();
        onOpenChange(true);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onOpenChange, close]);

  // Focus the field on open and hand focus back to whatever opened it on close,
  // so the shortcut does not strand keyboard users at the top of the document.
  useEffect(() => {
    if (open) {
      returnFocusTo.current = document.activeElement as HTMLElement;
      inputRef.current?.focus();
    } else {
      returnFocusTo.current?.focus?.();
    }
  }, [open]);

  useEffect(() => {
    if (!query) return;
    const timer = setTimeout(() => {
      runSearch({ variables: { search: query, type: 'ANIME', page: 1, perPage: RESULT_COUNT } });
      setActive(0);
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query, runSearch]);

  const onFieldKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      if (event.shiftKey || !results.length) goToResults();
      else openMedia(results[active]);
      return;
    }

    if (!results.length) return;

    // Left/right as well as up/down: the results read as a row, so the arrows
    // that match what is on screen should both work.
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      setActive((index) => (index + 1) % results.length);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((index) => (index - 1 + results.length) % results.length);
    }
  };

  const showSkeletons = loading && !results.length;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="spotlight__scrim"
          onClick={close}
          initial={reduceMotion ? undefined : { opacity: 0 }}
          animate={reduceMotion ? undefined : { opacity: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          transition={{ duration: 0.16 }}
        >
          <motion.div
            className="spotlight__panel"
            role="dialog"
            aria-modal="true"
            aria-label="Search anime"
            onClick={(event) => event.stopPropagation()}
            initial={reduceMotion ? undefined : { opacity: 0, y: -12 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -12 }}
            transition={{ duration: 0.18, ease: [0.2, 0.7, 0.3, 1] }}
          >
            <div className="spotlight__field">
              <SearchIcon />
              <input
                ref={inputRef}
                value={term}
                onChange={(event) => setTerm(event.target.value)}
                onKeyDown={onFieldKeyDown}
                placeholder="Search anime"
                aria-label="Search anime"
                autoComplete="off"
                spellCheck={false}
              />
              <button type="button" className="spotlight__esc" onClick={close}>
                esc
              </button>
            </div>

            {!query && <p className="spotlight__empty">Start typing to find something to watch.</p>}

            {query && showSkeletons && (
              <div className="spotlight__results" aria-hidden="true">
                {Array.from({ length: RESULT_COUNT }, (_, index) => (
                  <div key={index} className="spotlight__result">
                    <Skeleton height="0" radius="10px" className="spotlight__posterSkeleton" />
                    <Skeleton height="9px" />
                  </div>
                ))}
              </div>
            )}

            {query && !showSkeletons && !results.length && (
              <p className="spotlight__empty">Nothing matches “{query}”.</p>
            )}

            {!!results.length && (
              <div className="spotlight__results" role="listbox" aria-label="Search results">
                {results.map((media, index) => (
                  <button
                    type="button"
                    key={media.id}
                    role="option"
                    aria-selected={index === active}
                    className={`spotlight__result${
                      index === active ? ' spotlight__result--active' : ''
                    }`}
                    onMouseEnter={() => setActive(index)}
                    onClick={() => openMedia(media)}
                  >
                    <img
                      src={media.coverImage?.large ?? media.bannerImage ?? ''}
                      alt=""
                      loading="lazy"
                    />
                    <span className="spotlight__resultTitle">
                      {media.title?.english ?? media.title?.userPreferred}
                    </span>
                    <span className="spotlight__resultMeta">
                      {[media.format, media.seasonYear].filter(Boolean).join(' · ')}
                    </span>
                  </button>
                ))}
              </div>
            )}

            <div className="spotlight__foot">
              <span>
                <kbd>↑</kbd>
                <kbd>↓</kbd> move
              </span>
              <span>
                <kbd>↵</kbd> open
              </span>
              {query && (
                <button type="button" className="spotlight__all" onClick={goToResults}>
                  See all results for “{query}”
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default SearchSpotlight;
