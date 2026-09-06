import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { motion } from 'framer-motion';

import './PersonPage.css';

import EntityHero from 'components/EntityHero';
import SectionHeading from 'components/SectionHeading';
import RolePair from './RolePair';
import PersonSkeleton from './PersonSkeleton';

import { CHARACTER_QUERY } from 'graphql/queries';
import { staffPath, titleCase } from 'helpers';
import { CharacterEntity } from './types';

function CharacterPage() {
  const { id } = useParams();
  const { data, loading, error } = useQuery(CHARACTER_QUERY, {
    variables: { id: Number(id), page: 1 },
    skip: !id,
  });

  const character: CharacterEntity | undefined = data?.Character;

  if (loading && !character) return <PersonSkeleton />;
  if (error || !character) {
    return <p className="person__empty">We could not find that character.</p>;
  }

  const appearances = character.media?.edges ?? [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="person"
    >
      <EntityHero
        image={character.image?.large}
        name={character.name.full}
        native={character.name.native}
        facts={[
          <>
            <b>{character.favourites.toLocaleString()}</b> favourites
          </>,
          ...(character.age
            ? [
                <>
                  age <b>{character.age}</b>
                </>,
              ]
            : []),
          ...(character.gender ? [<b key="gender">{character.gender}</b>] : []),
          <>
            in <b>{appearances.length}</b> title{appearances.length === 1 ? '' : 's'}
          </>,
        ]}
      />

      <div className="person__body">
        {!!appearances.length && (
          <>
            <SectionHeading title="Appears in" detail="voiced by" />
            <div className="person__roles">
              {appearances.map((edge) => {
                const voice = edge.voiceActors?.[0];
                return (
                  <RolePair
                    key={edge.id}
                    // On a character page the actor is the new information —
                    // you already know who the character is, that is why you
                    // are here — so the actor takes the leading face.
                    faceImage={voice?.image?.large ?? character.image?.large ?? ''}
                    faceName={voice?.name.full ?? 'Voice unknown'}
                    faceTo={voice ? staffPath(voice.id, voice.name.full) : '#'}
                    media={{
                      id: edge.node.id,
                      title: edge.node.title.userPreferred,
                      cover: edge.node.coverImage.large,
                    }}
                    note={edge.characterRole ? titleCase(edge.characterRole) : null}
                  />
                );
              })}
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}

export default CharacterPage;
