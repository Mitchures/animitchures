import './Relations.css';

import Card from 'components/Card';

import { Media } from 'graphql/types';
import { CardMedia } from 'components/Card';

/** The part of a relation edge this section reads. */
type Relation = {
  id?: number | null;
  relationType?: string | null;
  node: CardMedia & { type?: string | null };
};

// Anime only — the relations list mixes in manga, which nothing here can open.
const getRelations = (relations: Media['relations']): Relation[] =>
  ((relations?.edges ?? []) as unknown as Relation[]).filter(
    (relation) => relation?.node?.type === 'ANIME',
  );

function Relations({ relations }: Media) {
  return (
    <div className="relations">
      {relations && relations.edges && getRelations(relations).length > 0 && (
        <>
          <div className="relations__container">
            {getRelations(relations).map((relation) => (
              <Card key={relation.id} {...relation.node} relationType={relation.relationType} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Relations;
