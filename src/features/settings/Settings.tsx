import { motion } from 'framer-motion';

import './Settings.css';

import ToggleSwitch from 'components/ToggleSwitch';
import SettingsGroup from './SettingsGroup';
import SettingRow from './SettingRow';
import Segmented from './Segmented';
import AnilistLink from './AnilistLink';

import { usePreferences } from './usePreferences';
import { useAnilistSettings } from './useAnilistSettings';
import { useStateValue } from 'context';
import { updateProfile } from 'api';
import { User } from 'context/types';
import { Density, StaffLanguage, Theme, TitleLanguage } from './preferences';

const START_PAGES = [
  { value: '/', label: 'Discover' },
  { value: '/anilist-watchlist', label: 'Watchlist' },
  { value: '/favorites', label: 'Favorites' },
  { value: '/calendar', label: 'Calendar' },
];

const SCORE_FORMATS = [
  { value: 'POINT_100', label: '100 point' },
  { value: 'POINT_10_DECIMAL', label: '10 point decimal' },
  { value: 'POINT_10', label: '10 point' },
  { value: 'POINT_5', label: '5 star' },
  { value: 'POINT_3', label: '3 smiley' },
];

const ROW_ORDERS = [
  { value: 'score', label: 'Score' },
  { value: 'title', label: 'Title' },
  { value: 'updatedAt', label: 'Last updated' },
  { value: 'id', label: 'Last added' },
];

const MERGE_TIMES = [
  { value: 0, label: 'No merging' },
  { value: 30, label: '30 minutes' },
  { value: 60, label: '1 hour' },
  { value: 1440, label: '1 day' },
];

const PROFILE_COLORS = ['blue', 'purple', 'green', 'orange', 'red', 'pink', 'gray'];

function Settings() {
  const [{ user, anilist_user }, dispatch] = useStateValue();
  const { preferences, update } = usePreferences();

  const options = anilist_user?.options;
  const listOptions = anilist_user?.mediaListOptions;
  const anilist = useAnilistSettings({
    scoreFormat: listOptions?.scoreFormat ?? 'POINT_100',
    rowOrder: listOptions?.rowOrder ?? 'score',
    airingNotifications: options?.airingNotifications ?? true,
    activityMergeTime: options?.activityMergeTime ?? 0,
    timezone: options?.timezone ?? '',
    profileColor: options?.profileColor ?? 'blue',
    splitCompletedSectionByFormat: listOptions?.animeList?.splitCompletedSectionByFormat ?? false,
  });

  /** Adult content stays on the user document — it gates what this app asks for. */
  const setAdult = (isAdult: boolean) => {
    if (!user) return;
    const updated = { ...user, isAdult } as User;
    dispatch({ type: 'update_user', user: updated });
    // Featured is cached per setting, so it has to be dropped or the change
    // is invisible until the next cold load.
    dispatch({ type: 'clear_featured' });
    updateProfile(updated).catch((error) => console.error('Could not save that setting', error));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="settings"
    >
      <h2 className="settings__title">Settings</h2>

      <SettingsGroup title="Appearance" detail="Everyone · saved to your account">
        <SettingRow label="Theme">
          <Segmented<Theme>
            label="Theme"
            value={preferences.theme}
            onChange={(value) => update('theme', value)}
            options={[
              { value: 'system', label: 'System' },
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
            ]}
          />
        </SettingRow>

        <SettingRow label="Poster size">
          <Segmented<Density>
            label="Poster size"
            value={preferences.density}
            onChange={(value) => update('density', value)}
            options={[
              { value: 'comfortable', label: 'Comfortable' },
              { value: 'compact', label: 'Compact' },
            ]}
          />
        </SettingRow>

        <SettingRow
          label="Reduce motion"
          note="Turns off parallax, poster tilt and the hero crossfade. Your system setting is always respected regardless."
        >
          <ToggleSwitch
            isToggled={preferences.reduceMotion}
            onToggle={() => update('reduceMotion', !preferences.reduceMotion)}
          />
        </SettingRow>
      </SettingsGroup>

      <SettingsGroup title="Titles and language" detail="Everyone">
        <SettingRow label="Show titles in">
          <Segmented<TitleLanguage>
            label="Title language"
            value={preferences.titleLanguage}
            onChange={(value) => update('titleLanguage', value)}
            options={[
              { value: 'ROMAJI', label: 'Romaji' },
              { value: 'ENGLISH', label: 'English' },
              { value: 'NATIVE', label: 'Native' },
            ]}
          />
        </SettingRow>

        <SettingRow label="Staff and character names in">
          <Segmented<StaffLanguage>
            label="Staff name language"
            value={preferences.staffLanguage}
            onChange={(value) => update('staffLanguage', value)}
            options={[
              { value: 'ROMAJI', label: 'Romaji' },
              { value: 'NATIVE', label: 'Native' },
            ]}
          />
        </SettingRow>

        <SettingRow label="Show adult content">
          <ToggleSwitch isToggled={!!user?.isAdult} onToggle={() => setAdult(!user?.isAdult)} />
        </SettingRow>
      </SettingsGroup>

      <SettingsGroup title="Start-up" detail="Everyone">
        <SettingRow label="Open on">
          <select
            className="settings__select"
            aria-label="Start page"
            value={preferences.startPage}
            onChange={(event) => update('startPage', event.target.value)}
          >
            {START_PAGES.map((page) => (
              <option key={page.value} value={page.value}>
                {page.label}
              </option>
            ))}
          </select>
        </SettingRow>
      </SettingsGroup>

      <AnilistLink />

      {user?.anilistLinked && anilist_user && (
        <SettingsGroup
          title="AniList"
          external
          detail={`Linked as ${anilist_user.name} · these write back to AniList`}
        >
          {anilist.error && <p className="settings__error">{anilist.error}</p>}

          <SettingRow label="Score format" syncs>
            <select
              className="settings__select"
              aria-label="Score format"
              value={anilist.settings.scoreFormat}
              onChange={(event) => anilist.update('scoreFormat', event.target.value)}
            >
              {SCORE_FORMATS.map((format) => (
                <option key={format.value} value={format.value}>
                  {format.label}
                </option>
              ))}
            </select>
          </SettingRow>

          <SettingRow label="List row order" syncs>
            <select
              className="settings__select"
              aria-label="List row order"
              value={anilist.settings.rowOrder}
              onChange={(event) => anilist.update('rowOrder', event.target.value)}
            >
              {ROW_ORDERS.map((order) => (
                <option key={order.value} value={order.value}>
                  {order.label}
                </option>
              ))}
            </select>
          </SettingRow>

          <SettingRow
            label="Airing notifications"
            note="AniList notifies you when something on your list airs."
            syncs
          >
            <ToggleSwitch
              isToggled={!!anilist.settings.airingNotifications}
              onToggle={() =>
                anilist.update('airingNotifications', !anilist.settings.airingNotifications)
              }
            />
          </SettingRow>

          <SettingRow
            label="Split completed by format"
            note="Keeps completed TV and completed films in separate lists."
            syncs
          >
            <ToggleSwitch
              isToggled={!!anilist.settings.splitCompletedSectionByFormat}
              onToggle={() =>
                anilist.update(
                  'splitCompletedSectionByFormat',
                  !anilist.settings.splitCompletedSectionByFormat,
                )
              }
            />
          </SettingRow>

          <SettingRow label="Merge activity within" syncs>
            <select
              className="settings__select"
              aria-label="Activity merge time"
              value={anilist.settings.activityMergeTime}
              onChange={(event) => anilist.update('activityMergeTime', Number(event.target.value))}
            >
              {MERGE_TIMES.map((time) => (
                <option key={time.value} value={time.value}>
                  {time.label}
                </option>
              ))}
            </select>
          </SettingRow>

          <SettingRow label="Profile colour" syncs>
            <div className="settings__swatches">
              {PROFILE_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  aria-label={color}
                  aria-pressed={anilist.settings.profileColor === color}
                  className={`settings__swatch${
                    anilist.settings.profileColor === color ? ' is-active' : ''
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => anilist.update('profileColor', color)}
                />
              ))}
            </div>
          </SettingRow>
        </SettingsGroup>
      )}
    </motion.div>
  );
}

export default Settings;
