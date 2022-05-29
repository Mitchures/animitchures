import './Characters.css';

import { Media } from 'graphql/types';

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
            {characters.edges.slice(0, 6).map((character: any) => (
              <div key={character.id} className="characters__block">
                <div className="characters__blockLeft">
                  <div className="characters__blockImageContainer">
                    <img src={character.node.image.large} alt={character.node.name.userPreferred} />
                  </div>
                  <div className="characters__blockBody">
                    <h5>{character.node.name.userPreferred}</h5>
                    <p>{convertText(character.role)}</p>
                  </div>
                </div>
                {character.voiceActors.length > 0 && (
                  <div className="characters__blockRight">
                    <div className="characters__blockBody">
                      <h5>{character.voiceActors[0].name.userPreferred}</h5>
                      <p>{character.voiceActors[0].language}</p>
                    </div>
                    <div className="characters__blockImageContainer">
                      <img
                        src={character.voiceActors[0].image.large}
                        alt={character.voiceActors[0].name.userPreferred}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Characters;
