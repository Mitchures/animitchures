import './ToggleSwitch.css';

function ToggleSwitch({ isToggled, onToggle }: any) {
  return (
    <label className="toggleSwitch">
      <input type="checkbox" checked={isToggled} onChange={onToggle} />
      <span className="toggleSwitch__switch" />
    </label>
  );
}

export default ToggleSwitch;
