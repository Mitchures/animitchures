import { People } from '@mui/icons-material';

import './Characters.css';

import CastChip from './CastChip';

import { characterPath, staffPath } from 'helpers';

import { Media } from 'graphql/types';
import { titleCase } from 'helpers';

/** The shape this component actually reads off an edge's voiceActors. */
/** The part of a character edge this section reads. */
type CharacterCredit = {
  id?: number | null;
  role?: string | null;
  node: { id: number; name: { userPreferred: string }; image?: { large?: string | null } | null };
  voiceActors?: VoiceActor[] | null;
};

type VoiceActor = {
  id: number;
  language?: string | null;
  name?: { userPreferred?: string | null } | null;
  image?: { large?: string | null } | null;
};

function Characters({ characters }: Media) {
  const credits = (characters?.edges ?? []) as CharacterCredit[];
  // Nothing at all rather than a panel holding only its heading: the wrapper
  // carries the card's background, so an empty one is a grey block.
  if (!credits.length) return null;

  return (
    <div className="characters">
      {credits.length > 0 && (
        <>
          <h3>
            <People />
            Characters
          </h3>
          <div className="characters__container">
            {credits.map((character) => {
              // Japanese where there is one — the original performance for
              // almost everything here.
              const actor =
                (character.voiceActors as VoiceActor[])?.find(
                  (voice) => voice?.language === 'Japanese',
                ) ?? character.voiceActors?.[0];
              return (
                <CastChip
                  key={character.id}
                  image={character.node.image?.large}
                  name={character.node.name.userPreferred}
                  meta={character.role ? titleCase(character.role) : undefined}
                  insetImage={actor?.image?.large}
                  insetName={actor?.name?.userPreferred}
                  to={characterPath(character.node.id, character.node.name.userPreferred)}
                  insetTo={actor ? staffPath(actor.id, actor.name?.userPreferred ?? '') : undefined}
                />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default Characters;
