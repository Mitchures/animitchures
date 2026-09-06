import { ChangeEventHandler } from 'react';

import './ToggleSwitch.css';

function ToggleSwitch({
  isToggled,
  onToggle,
}: {
  isToggled: boolean;
  onToggle: ChangeEventHandler<HTMLInputElement>;
}) {
  return (
    <label className="toggleSwitch">
      <input type="checkbox" checked={isToggled} onChange={onToggle} />
      <span className="toggleSwitch__switch" />
    </label>
  );
}

export default ToggleSwitch;
