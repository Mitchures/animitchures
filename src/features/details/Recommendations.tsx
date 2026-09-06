import './Recommendations.css';

import Card from 'components/Card';

import { Media } from 'graphql/types';

/**
 * "If you liked this" — AniList's community recommendations, sorted by how many
 * people endorsed each one. Already fetched with the rest of the media and
 * never rendered.
 *
 * Filtered to anime: the recommendations mix in manga, which nothing else in
 * this app can open.
 */
function Recommendations({ recommendations }: Media) {
  const suggestions = (recommendations?.nodes ?? []).filter(
    (node) => node?.mediaRecommendation?.type === 'ANIME',
  );

  if (!suggestions.length) return null;

  return (
    <div className="recommendations">
      <div className="recommendations__container">
        {suggestions.map((node) => (
          <Card key={node!.id} {...node!.mediaRecommendation} />
        ))}
      </div>
    </div>
  );
}

export default Recommendations;
