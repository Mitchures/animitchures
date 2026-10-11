import { Add } from '@mui/icons-material';

import './LinkTile.css';

import FrostedTile from 'components/FrostedTile';
import { PALETTES } from 'helpers';
import { useStateValue } from 'context';

/** "Link your AniList account" — signed in, not linked. Otherwise nothing. */
function LinkTile() {
  const [{ user, anilist_user }] = useStateValue();
  if (!user || anilist_user) return null;
  return (
    <FrostedTile treatment="core" palette={PALETTES.link} to="/settings" className="linkTile">
      <span className="linkTile__label">
        Link your
        <br />
        AniList account
      </span>
      <span className="linkTile__plus" aria-hidden="true">
        <Add />
      </span>
    </FrostedTile>
  );
}

export default LinkTile;
