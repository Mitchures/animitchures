import { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';

import './IconButton.css';

interface Props {
  label: string;
  onClick?: () => void;
  to?: string;
  active?: boolean;
  children: ReactNode;
}

/** The 36px round grey button: search, notifications, close, the + on a tile. */
function IconButton({ label, onClick, to, active, children }: Props) {
  const cls = `iconButton${active ? ' iconButton--active' : ''}`;
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
