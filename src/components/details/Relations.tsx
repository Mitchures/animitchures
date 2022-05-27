import './Relations.css';

import Card from '../Card';

import { Maybe, MediaConnection, MediaEdge } from 'graphql/types';

// Determine if media has related anime, no book related relations.
const getRelations = (relations: any) => {
  return relations.edges.filter((relation: any) => relation.node.type === 'ANIME');
};

function Relations({ relations }: { relations: Maybe<MediaConnection> | undefined }) {
  return (
    <div className="relations">
      {relations && relations.edges && getRelations(relations).length > 0 && (
        <>
          <h3>Relations</h3>
          <div className="relations__container">
            {getRelations(relations).map((relation: MediaEdge) => (
              <Card key={relation.id} {...relation.node} relationType={relation.relationType} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Relations;
