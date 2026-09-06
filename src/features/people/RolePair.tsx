import { Link } from 'react-router-dom';

import './RolePair.css';

import { mediaPath, characterPath } from 'helpers';

interface Props {
  /** The face that leads — the character on a staff page, the actor on a character page. */
  faceImage: string;
  faceName: string;
  faceTo: string;
  /** The title this credit belongs to. */
  media?: { id: number; title: string; cover: string } | null;
  note?: string | null;
}

/**
 * One credit, drawn as a pairing.
 *
 * The face leads and the title follows as a small poster, because you
 * recognise a character before you recognise a credit line. Same reasoning as
 * the paired chips on Details, and deliberately the same visual language.
 */
function RolePair({ faceImage, faceName, faceTo, media, note }: Props) {
  return (
    <div className="rolePair">
      <span className="rolePair__face">
        <img src={faceImage} alt="" loading="lazy" />
      </span>
      <div className="rolePair__body">
        {/* Stretched over the whole pair — see CastChip for why the secondary
            destination is a sibling rather than a nested anchor. */}
        <Link className="rolePair__name" to={faceTo}>
          {faceName}
        </Link>
        {media && (
          <Link className="rolePair__show" to={mediaPath(media.id, media.title)}>
            {media.title}
          </Link>
        )}
        {note && <span className="rolePair__note">{note}</span>}
      </div>
      {media && (
        <Link className="rolePair__poster" to={mediaPath(media.id, media.title)} tabIndex={-1}>
          <img src={media.cover} alt="" loading="lazy" />
        </Link>
      )}
    </div>
  );
}

export { characterPath };
export default RolePair;
