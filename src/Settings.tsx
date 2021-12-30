import './Settings.css';
import AnilistLogoImage from './images/anilist-logo.png';
import { Check } from '@mui/icons-material';
import { useStateValue } from 'context';
import { userActions } from 'actions';
import ToggleSwitch from 'components/ToggleSwitch';

function Settings() {
  const [{ user }, dispatch] = useStateValue();

  const updateIsAdult = (isAdult: boolean) => {
    const updatedUser = {
      ...user,
      isAdult,
    };
    userActions.updateProfile(updatedUser, dispatch).then(() => {
      // Clear featured to refresh content based on isAdult setting.
      dispatch({
        type: 'clear_featured',
      });
    });
  };

  return (
    <div className="settings">
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
                <p>Enabled or disable explicit content.</p>
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
                <p>
                  Connect your Anilist account to enable more features. Keep in mind, once you've
                  linked your Anilist account with Animitchures, your Anilist settings will take
                  precedence over your Animitchures settings.
                </p>
              </div>
              <div className="settings__column">
                {user.anilistLinked ? (
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
          </>
        )}
      </div>
    </div>
  );
}

export default Settings;
