import './Characters.css';

import CastChip from './CastChip';

import { Media } from 'graphql/types';

/** The shape this component actually reads off an edge's voiceActors. */
type VoiceActor = {
  language?: string | null;
  name?: { userPreferred?: string | null } | null;
  image?: { large?: string | null } | null;
};

// Convert text that may come back UpperCase.
const convertText = (text: string) => {
  // Only return text as is if its suspected to be an acronym. ex: OVA or TV
  if (text.length <= 3) return text;
  if (text.includes('_')) text = text.replace(/_/g, ' ');
  return text.charAt(0).toUpperCase() + text.substring(1).toLowerCase();
};

function Characters({ characters }: Media) {
  return (
    <div className="characters">
      {characters && characters.edges && characters.edges.length > 0 && (
        <>
          <h3>Characters</h3>
          <div className="characters__container">
            {characters.edges.map((character: any) => {
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
                  meta={convertText(character.role)}
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
