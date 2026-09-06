import { Check } from '@mui/icons-material';

import './AnilistLink.css';

import SettingsGroup from './SettingsGroup';
import AnilistLogoImage from 'images/anilist-logo.png';

import { useStateValue } from 'context';

const AUTHORIZE_URL =
  `https://anilist.co/api/v2/oauth/authorize` +
  `?client_id=${import.meta.env.VITE_ANILIST_CLIENT_ID}` +
  `&redirect_uri=${import.meta.env.VITE_ANILIST_CALLBACK_URI}` +
  `&response_type=code`;

/**
 * The link/unlink state for an AniList account.
 *
 * Its own group rather than a row inside another: linked, it is a status; not
 * linked, it is the thing standing between you and half the app, and it says
 * what those things are instead of leaving you to guess.
 */
function AnilistLink() {
  const [{ anilist_user }] = useStateValue();

  if (anilist_user) {
    return (
      <SettingsGroup title="AniList account" detail="Connected">
        <div className="anilistLink__linked">
          <Check />
          <span>
            Linked as <b>{anilist_user.name}</b>
          </span>
        </div>
      </SettingsGroup>
    );
  }

  return (
    <SettingsGroup title="AniList account" detail="Not linked">
      <p className="anilistLink__pitch">
        Linking an account adds your watchlist, your taste breakdown, and the settings below — score
        format, list order, airing notifications and your profile colour.
      </p>
      <a className="anilistLink__cta" href={AUTHORIZE_URL}>
        <img src={AnilistLogoImage} alt="" />
        <span>Link an AniList account</span>
      </a>
    </SettingsGroup>
  );
}

export default AnilistLink;
