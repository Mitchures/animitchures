import { Check } from '@mui/icons-material';
import { motion } from 'framer-motion';

import './Settings.css';

import ToggleSwitch from 'components/ToggleSwitch';

import AnilistLogoImage from 'images/anilist-logo.png';

import { useStateValue } from 'context';
import { updateProfile } from 'api';
import { User } from 'context/types';

function Settings() {
  const [{ user, anilist_user }, dispatch] = useStateValue();

  const updateIsAdult = (isAdult: boolean) => {
    const updatedUser = { ...user, isAdult } as User;
    updateProfile(updatedUser)
      .then((user) => {
        dispatch({
          type: 'set_user',
          user: user as User,
        });
      })
      .then(() => {
        // Clear to refresh content based on isAdult setting.
        dispatch({
          type: 'clear_featured',
        });
      });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="settings"
    >
      <div className="settings__header">
        <h1>Settings</h1>
      </div>
      <div className="settings__container">
        {user && (
          <>
            <h2>Profile</h2>
            <div className="settings__row">
              <div className="settings__column">
                <h4>Show Explicit Content</h4>
                <p>Enable or disable 18+ content.</p>
              </div>
              <div className="settings__column">
                <ToggleSwitch
                  isToggled={user.isAdult}
                  onToggle={() => updateIsAdult(!user.isAdult)}
                />
              </div>
            </div>
            <div className="settings__row">
              <div className="settings__column">
                <h4>Link Anilist Account</h4>
                <p>Connect your Anilist account to enable more features.</p>
                <p>
                  <em>
                    Note: Once you've linked your Anilist account, your Anilist settings will take
                    precedence over your Animitchures settings.
                  </em>
                </p>
              </div>
              <div className="settings__column">
                {anilist_user ? (
                  <div className="settings__success">
                    <Check />
                    <span>Account Linked</span>
                  </div>
                ) : (
                  <a
                    className="settings__loginWithAnilist"
                    href={`https://anilist.co/api/v2/oauth/authorize?client_id=${process.env.REACT_APP_ANILIST_CLIENT_ID}&redirect_uri=${process.env.REACT_APP_ANILIST_CALLBACK_URI}&response_type=code`}
                  >
                    <div>
                      <img src={AnilistLogoImage} alt="Anilist" />
                      <span>Link with Anilist</span>
                    </div>
                  </a>
                )}
              </div>
            </div>
            {/* TODO: Implement this ... maybe ... */}
            {/* {anilist_user && (
              <>
                <h2>Anilist</h2>
                <div className="settings__row">
                  <div className="settings__column">
                    <h4>Preferred Watchlist</h4>
                    <p>
                      Switch between which Watchlist you prefer using. If Enabled, your Anilist
                      Watchlist will be used. If Disabled, your Animitchures Watchlist will be used.
                    </p>
                    <p>
                      <em>
                        Note: Once your Anilist account is linked, your preferred Watchlist defaults
                        to your Anilist Watchlist.
                      </em>
                    </p>
                  </div>
                  <div className="settings__column">
                    <ToggleSwitch isToggled={true} onToggle={() => {}} />
                  </div>
                </div>
              </>
            )} */}
          </>
        )}
      </div>
    </motion.div>
  );
}

export default Settings;
