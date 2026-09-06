import './Characters.css';

import CastChip from './CastChip';

import { Media } from 'graphql/types';
import { titleCase } from 'helpers';

/** The shape this component actually reads off an edge's voiceActors. */
/** The part of a character edge this section reads. */
type CharacterCredit = {
  id?: number | null;
  role?: string | null;
  node: { name: { userPreferred: string }; image?: { large?: string | null } | null };
  voiceActors?: VoiceActor[] | null;
};

type VoiceActor = {
  language?: string | null;
  name?: { userPreferred?: string | null } | null;
  image?: { large?: string | null } | null;
};

function Characters({ characters }: Media) {
  return (
    <div className="characters">
      {characters && characters.edges && characters.edges.length > 0 && (
        <>
          <h3>Characters</h3>
          <div className="characters__container">
            {(characters.edges as CharacterCredit[]).map((character) => {
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
