import { useEffect, useRef, useState } from 'react';
import { useMutation } from '@apollo/client';
import {
  Check,
  Close,
  PlaylistAdd,
  RemoveRedEye,
  Repeat,
  Replay,
  TurnedIn,
} from '@mui/icons-material';

import './ListStatusAction.css';

import { SAVE_MEDIA_LIST_ENTRY_SIMPLE_MUTATION } from 'graphql/mutations';
import { authHeader } from 'helpers';

/**
 * AniList's list statuses, in the order a viewer wants them.
 *
 * Its own enum order puts REPEATING second, which nobody wants second.
 */
const STATUSES = [
  { id: 'CURRENT', label: 'Watching', icon: <RemoveRedEye /> },
  { id: 'COMPLETED', label: 'Completed', icon: <Check /> },
  { id: 'PLANNING', label: 'Plan to watch', icon: <TurnedIn /> },
  { id: 'PAUSED', label: 'Paused', icon: <Replay /> },
  { id: 'DROPPED', label: 'Dropped', icon: <Close /> },
  { id: 'REPEATING', label: 'Rewatching', icon: <Repeat /> },
] as const;

/** Roughly the widest label plus the icon and the padding. */
const OPEN_WIDTH = 176;

/**
 * List status, as a glass squircle on the hero that grows into a pill.
 *
 * It is the odd one out among the hero's actions: favourite, trailer and share
 * are verbs, and this holds a value. So it is square at rest, which keeps the
 * row uniform, and widens to name the status as the pointer arrives or it takes
 * focus — both readings, in sequence.
 *
 * **The icon is the status.** A tick for completed, an eye for watching, a
 * bookmark for planned, and a list icon when the title is not on the list at
 * all, which is also when the button stays translucent rather than going solid.
 *
 * The menu opens **upward**: the actions sit at the bottom of the banner, so a
 * menu dropping down would fall behind the glass sheet and be clipped.
 *
 * It still does not reflect server state back — a refused mutation leaves the
 * button claiming a change that did not happen. That is the outstanding `TODO`
 * on this feature and it predates the redesign.
 */
function ListStatusAction({ value, mediaId }: { value?: string | null; mediaId: number }) {
  const [status, setStatus] = useState<string | undefined>(value ?? undefined);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [saveMediaListEntry] = useMutation(SAVE_MEDIA_LIST_ENTRY_SIMPLE_MUTATION);

  useEffect(() => {
    if (!open) return;
    const away = (event: PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', away);
    document.addEventListener('keydown', key);
    return () => {
      document.removeEventListener('pointerdown', away);
      document.removeEventListener('keydown', key);
    };
  }, [open]);

  const current = STATUSES.find((entry) => entry.id === status);
  const label = current ? current.label : 'Add to your list';

  const choose = (next: string) => {
    setStatus(next);
    setOpen(false);
    saveMediaListEntry({
      variables: { mediaId, status: next },
      context: { headers: authHeader() },
    });
  };

  return (
    <div className="listStatus" ref={wrapRef}>
      {open && (
        <ul className="listStatus__menu" role="listbox" aria-label="List status">
          {STATUSES.map((entry) => (
            <li key={entry.id}>
              <button
                type="button"
                role="option"
                aria-selected={entry.id === status}
                className={`listStatus__option${
                  entry.id === status ? ' listStatus__option--on' : ''
                }`}
                onClick={() => choose(entry.id)}
              >
                {entry.icon}
                <span>{entry.label}</span>
                {entry.id === status && <Check className="listStatus__tick" />}
              </button>
            </li>
          ))}
        </ul>
      )}
      <button
        type="button"
        className={`listStatus__trigger${current ? ' listStatus__trigger--set' : ''}`}
        style={{ '--open-width': `${OPEN_WIDTH}px` } as React.CSSProperties}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={current ? `On your list as ${label}` : label}
        title={current ? `On your list as ${label}` : label}
        onClick={() => setOpen((was) => !was)}
      >
        {current ? current.icon : <PlaylistAdd />}
        <b>{label}</b>
      </button>
    </div>
  );
}

export default ListStatusAction;
