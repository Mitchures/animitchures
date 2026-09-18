import { useEffect, useState } from 'react';
import { DarkModeOutlined, LightModeOutlined } from '@mui/icons-material';

import IconButton from 'components/IconButton';
import { usePreferences } from 'features/settings/usePreferences';

const QUERY = '(prefers-color-scheme: dark)';

/**
 * Whether the OS is asking for dark right now.
 *
 * Live rather than read once: on the default "System" setting the button has to
 * relabel itself when the OS flips, which happens on a schedule for most people.
 */
function useSystemDark(): boolean {
  const [dark, setDark] = useState(
    () => typeof window.matchMedia === 'function' && window.matchMedia(QUERY).matches,
  );

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const media = window.matchMedia(QUERY);
    const onChange = (event: MediaQueryListEvent) => setDark(event.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  return dark;
}

/**
 * Flips the theme from the shell chrome.
 *
 * The preference stays three-valued — System is the default and Settings keeps
 * the full choice — but this button only ever flips light and dark. It decides
 * which way from **what is on screen**, not from the stored value, so the first
 * press while on System goes to the opposite of whatever the OS is doing rather
 * than appearing to do nothing.
 */
function ThemeToggle() {
  const { preferences, update } = usePreferences();
  const systemDark = useSystemDark();
  const showingDark =
    preferences.theme === 'dark' || (preferences.theme === 'system' && systemDark);

  return (
    <IconButton
      label={showingDark ? 'Switch to light theme' : 'Switch to dark theme'}
      onClick={() => update('theme', showingDark ? 'light' : 'dark')}
    >
      {showingDark ? <LightModeOutlined /> : <DarkModeOutlined />}
    </IconButton>
  );
}

export default ThemeToggle;
