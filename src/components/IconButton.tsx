import { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';

import './IconButton.css';

interface Props {
  label: string;
  onClick?: () => void;
  to?: string;
  active?: boolean;
  /**
   * `glass` is the larger squircle that floats on artwork — the details page's
   * hero actions. It is **dark-tinted, not white**: a white translucent button
   * over a bright banner bleaches to a flat blob and the icon inside it
   * disappears. `active` on a glass button goes lime.
   */
  variant?: 'round' | 'glass';
  children: ReactNode;
}

/** The 36px round grey button: search, notifications, close, the + on a tile. */
function IconButton({ label, onClick, to, active, variant = 'round', children }: Props) {
  const cls = [
    'iconButton',
    variant === 'glass' ? 'iconButton--glass' : '',
    active ? 'iconButton--active' : '',
  ]
    .filter(Boolean)
    .join(' ');
  if (to) {
    return (
      <NavLink to={to} aria-label={label} className={cls}>
        {children}
      </NavLink>
    );
  }
  return (
    <button type="button" aria-label={label} onClick={onClick} className={cls}>
      {children}
    </button>
  );
}

export default IconButton;
