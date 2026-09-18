import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import Avatar from '@mui/material/Avatar';

import './Drawer.css';

import Pill from 'components/Pill';
import { NavSection, getDrawerItems } from 'layout/nav-items';
import { User } from 'context/types';

interface Props {
  open: boolean;
  sections: NavSection[];
  user: User | null;
  onClose: () => void;
  onLogout: () => void;
}

/**
 * The More drawer: a frosted sheet that springs up from behind the tab bar.
 * Holds what the bar does not — Favorites, the Library items, the account row.
 */
function Drawer({ open, sections, user, onClose, onLogout }: Props) {
  const listRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const items = getDrawerItems(sections);
  const settings = sections.flatMap((section) => section.items).find((item) => item.id === 'settings');
  const accountName = user?.displayName || user?.email || 'Account';
  const firstLibrary = items.findIndex((item) => item.group === 'library');

  // Escape closes, the page behind stops scrolling, focus moves in.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    listRef.current?.querySelector<HTMLElement>('a, button')?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  const spring = reduceMotion
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 320, damping: 30, mass: 0.9 };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="drawer__dim"
            data-testid="drawer-dim"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.32 }}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="More"
            id="drawer"
            className="drawer"
            initial={{ y: '105%' }}
            animate={{ y: 0 }}
            exit={{ y: '105%' }}
            transition={spring}
          >
            <span className="drawer__grab" aria-hidden="true" />
            <h2 className="drawer__title">More</h2>
            <div className="drawer__list" ref={listRef}>
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: reduceMotion ? 0 : 0.06 * index, duration: 0.32 }}
                >
                  {index === firstLibrary && <div className="drawer__section">Library · AniList</div>}
                  <Pill label={item.label} to={item.to} end={item.end} icon={<item.Icon />} onClick={onClose} />
                </motion.div>
              ))}
            </div>
            {user ? (
              <div className="drawer__account">
                <Link to="/profile" className="drawer__who" onClick={onClose}>
                  <Avatar className="drawer__avatar" alt={accountName} src={user.photoURL ?? undefined}>
                    {accountName.charAt(0).toUpperCase()}
                  </Avatar>
                  <span>{accountName}</span>
                </Link>
                <span className="drawer__actions">
                  {settings && (
                    <Link to={settings.to} onClick={onClose} aria-label="Settings">
                      Settings
                    </Link>
                  )}
                  <span aria-hidden="true">·</span>
                  <button type="button" aria-label="Logout" onClick={onLogout}>
                    Log out
                  </button>
                </span>
              </div>
            ) : (
              <div className="drawer__account">
                <Link to="/login" onClick={onClose} className="drawer__who">
                  Log in
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default Drawer;
