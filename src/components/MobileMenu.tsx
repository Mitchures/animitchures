import { useEffect, useRef } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Close } from '@mui/icons-material';

import './MobileMenu.css';

import { NavSection } from './nav-items';
import { User } from 'context/types';
import Logo from '../images/animitchures-logo.svg';

interface Props {
  open: boolean;
  sections: NavSection[];
  user: User | null;
  onClose: () => void;
  onLogout: () => void;
}

function MobileMenu({ open, sections, user, onClose, onLogout }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();

  // Escape closes.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  // Lock body scroll so the page behind does not move under the finger.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Move focus into the dialog when it opens.
  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);

  const duration = reduceMotion ? 0 : 0.2;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="mobileMenu"
          role="dialog"
          aria-modal="true"
          aria-label="Main menu"
          id="mobile-menu"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration }}
        >
          <div className="mobileMenu__top">
            <img className="mobileMenu__logo" src={Logo} alt="animitchures" />
            <button
              ref={closeRef}
              type="button"
              className="mobileMenu__close"
              aria-label="Close menu"
              onClick={onClose}
            >
              <Close />
            </button>
          </div>

          <nav className="mobileMenu__nav">
            {sections.map((section) => (
              <div key={section.id} className="mobileMenu__section">
                <h5>{section.heading}</h5>
                <ul>
                  {section.items.map(({ id, label, to, end, isLogout }) => (
                    <li key={id}>
                      {isLogout ? (
                        <Link
                          to={to}
                          className="mobileMenu__item mobileMenu__item--logout"
                          onClick={onLogout}
                        >
                          {label}
                        </Link>
                      ) : (
                        <NavLink to={to} end={end} className="mobileMenu__item" onClick={onClose}>
                          {label}
                        </NavLink>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          {user && (
            <div className="mobileMenu__user">
              {user.photoURL && <img src={user.photoURL} alt="" />}
              <span>
                Signed in as
                <b>{user.displayName ? user.displayName : user.email}</b>
              </span>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default MobileMenu;
