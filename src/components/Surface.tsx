import { ElementType, ReactNode } from 'react';

import './Surface.css';

interface Props {
  tone?: 'card' | 'nested';
  radius?: 'card' | 'inner' | 'pill';
  as?: ElementType;
  className?: string;
  children: ReactNode;
}

/** The grey box everything sits on. No border, no shadow — tone is the depth. */
function Surface({ tone = 'card', radius = 'card', as: Tag = 'div', className = '', children }: Props) {
  return (
    <Tag className={`surface surface--${tone} surface--r-${radius} ${className}`.trim()}>
      {children}
    </Tag>
  );
}

export default Surface;
