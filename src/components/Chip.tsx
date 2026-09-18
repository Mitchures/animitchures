import { ReactNode } from 'react';

import './Chip.css';

export type ChipTone = 'neutral' | 'lime' | 'ink' | 'glass';

/** A small pill label. `lime` is the one accent and always carries ink text. */
function Chip({ tone = 'neutral', children }: { tone?: ChipTone; children: ReactNode }) {
  return <span className={`chip chip--${tone}`}>{children}</span>;
}

export default Chip;
