import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { motion } from 'framer-motion';

import './PersonPage.css';

import EntityHero from 'components/EntityHero';
import SectionHeading from 'components/SectionHeading';
import RolePair from './RolePair';
import PersonSkeleton from './PersonSkeleton';

import { STAFF_QUERY } from 'graphql/queries';
import { characterPath, titleCase } from 'helpers';
import { StaffEntity } from './types';

function StaffPage() {
  const { id } = useParams();
  const { data, loading, error, fetchMore } = useQuery(STAFF_QUERY, {
    variables: { id: Number(id), page: 1 },
    skip: !id,
  });

  const staff: StaffEntity | undefined = data?.Staff;

  if (loading && !staff) return <PersonSkeleton />;
  if (error || !staff) {
    return <p className="person__empty">We could not find that person.</p>;
  }

  const roles = staff.characters?.edges ?? [];
  const page = staff.characters?.pageInfo;
  const years = staff.yearsActive?.length
    ? `${staff.yearsActive[0]}–${staff.yearsActive[1] ?? ''}`
    : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="person"
    >
      <EntityHero
        image={staff.image?.large}
        name={staff.name.full}
        native={staff.name.native}
        facts={[
          <>
            <b>{staff.favourites.toLocaleString()}</b> favourites
          </>,
          ...(staff.primaryOccupations?.length
            ? [<b key="occ">{titleCase(staff.primaryOccupations[0])}</b>]
            : []),
          ...(staff.homeTown
            ? [
                <>
                  from <b>{staff.homeTown}</b>
                </>,
              ]
            : []),
          ...(years
            ? [
                <>
                  active <b>{years}</b>
                </>,
              ]
            : []),
        ]}
      />

      <div className="person__body">
        {!!roles.length && (
          <>
            <SectionHeading title="Best known for" detail="most loved roles first" />
            <div className="person__roles">
              {roles.map((edge) => (
                <RolePair
                  key={edge.id}
                  faceImage={edge.node.image?.large ?? ''}
                  faceName={edge.node.name.full}
                  faceTo={characterPath(edge.node.id, edge.node.name.full)}
                  media={
                    edge.media?.[0]
                      ? {
                          id: edge.media[0].id,
                          title: edge.media[0].title.userPreferred,
                          cover: edge.media[0].coverImage.large,
                        }
                      : null
                  }
                />
              ))}
            </div>

            {page?.hasNextPage && (
              <button
                type="button"
                className="person__more"
                onClick={() =>
                  fetchMore({
                    variables: { page: page.currentPage + 1 },
                    // Roles append; the default would replace the page with
                    // the new one and the list would appear to jump.
                    updateQuery: (prev, { fetchMoreResult }) => {
                      if (!fetchMoreResult?.Staff) return prev;
                      return {
                        Staff: {
                          ...fetchMoreResult.Staff,
                          characters: {
                            ...fetchMoreResult.Staff.characters,
                            edges: [
                              ...prev.Staff.characters.edges,
                              ...fetchMoreResult.Staff.characters.edges,
                            ],
                          },
                        },
                      };
                    },
                  })
                }
              >
                Show more roles
              </button>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}

export default StaffPage;
