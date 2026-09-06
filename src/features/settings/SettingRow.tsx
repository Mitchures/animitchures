import { ReactNode } from 'react';

import './SettingRow.css';

interface Props {
  label: string;
  /** One line on what the setting does, when the label alone is not enough. */
  note?: string;
  /** Marks a control that writes to AniList rather than staying in this app. */
  syncs?: boolean;
  children: ReactNode;
}

function SettingRow({ label, note, syncs, children }: Props) {
  return (
    <div className="settingRow">
      <div className="settingRow__label">
        <b>{label}</b>
        {/* Worth showing, not hiding: this one leaves the app. */}
        {syncs && <span className="settingRow__syncs">AniList</span>}
        {note && <span className="settingRow__note">{note}</span>}
      </div>
      <div className="settingRow__control">{children}</div>
    </div>
  );
}

export default SettingRow;
