import './Settings.css';

function Settings() {
  return (
    <div className="settings">
      <div className="settings__header">
        <h1>Settings</h1>
      </div>
      <div className="settings__container">
        <a href="https://anilist.co/api/v2/oauth/authorize?client_id=7024&redirect_uri=http://localhost:3000/callback&response_type=code">
          Login with AniList
        </a>
      </div>
    </div>
  );
}

export default Settings;
