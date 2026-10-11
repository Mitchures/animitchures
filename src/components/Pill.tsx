import { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';

import './Pill.css';

interface Props {
  icon?: ReactNode;
  label: string;
  tail?: ReactNode;
  tailTone?: 'neutral' | 'lime';
  active?: boolean;
  to?: string;
  end?: boolean;
  onClick?: () => void;
  className?: string;
}

/**
 * The row-shaped control from the reference: icon, label, optional trailing
 * chip. Renders a NavLink for destinations and a button for actions. The
 * visible active fill is a sibling indicator in PillNav; `pill--active` only
 * lifts the text.
 */
function Pill({
  icon,
  label,
  tail,
  tailTone = 'neutral',
  active,
  to,
  end,
  onClick,
  className = '',
}: Props) {
  const body = (
    <>
      {icon && <span className="pill__icon">{icon}</span>}
      <span className="pill__label">{label}</span>
      {tail !== undefined && (
        <span className={`pill__tail${tailTone === 'lime' ? ' pill__tail--lime' : ''}`}>
          {tail}
        </span>
      )}
    </>
  );
  const classes = (isActive: boolean) =>
    `pill${isActive ? ' pill--active' : ''} ${className}`.trim();

  if (to) {
    return (
      <NavLink
        to={to}
        end={end}
        aria-label={label}
        onClick={onClick}
        className={({ isActive }) => classes(active ?? isActive)}
      >
        {body}
      </NavLink>
    );
  }
  return (
    <button type="button" aria-label={label} onClick={onClick} className={classes(Boolean(active))}>
      {body}
    </button>
  );
}

export default Pill;
