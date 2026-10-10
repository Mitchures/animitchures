import { Layers } from '@mui/icons-material';

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
  const related = getRelations(relations);
  // Nothing rather than an empty panel: the wrapper is the card's background.
  if (!related.length) return null;

  return (
    <div className="relations">
      <h3>
        <Layers />
        Related
      </h3>
      <div className="relations__container">
        {related.map((relation) => (
          <Card key={relation.id} {...relation.node} relationType={relation.relationType} />
        ))}
      </div>
    </div>
  );
}

export default Relations;
