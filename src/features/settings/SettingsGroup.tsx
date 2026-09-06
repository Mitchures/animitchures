import { ReactNode } from 'react';

import './SettingsGroup.css';

interface Props {
  title: string;
  /** Who the group applies to, and where its values are kept. */
  detail?: string;
  /** Tints the group and marks it as writing outside this app. */
  external?: boolean;
  children: ReactNode;
}

function SettingsGroup({ title, detail, external, children }: Props) {
  return (
    <section className={`settingsGroup${external ? ' settingsGroup--external' : ''}`}>
      <header>
        <h3>{title}</h3>
        {detail && <span>{detail}</span>}
      </header>
      {children}
    </section>
  );
}

export default SettingsGroup;
