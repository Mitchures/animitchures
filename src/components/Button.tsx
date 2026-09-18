import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import './Button.css';

interface Props {
  tone?: 'nested' | 'ink' | 'lime';
  to?: string;
  onClick?: () => void;
  children: ReactNode;
}

/** Pill button. "View details", "See all", "Preview". */
function Button({ tone = 'nested', to, onClick, children }: Props) {
  const cls = `button button--${tone}`;
  if (to) {
    return (
      <Link to={to} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={cls}>
      {children}
    </button>
  );
}

export default Button;
