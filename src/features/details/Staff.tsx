import './Staff.css';

import CastChip from './CastChip';

import { staffPath } from 'helpers';

import { Media } from 'graphql/types';

/** The part of a staff edge this section reads. */
type StaffCredit = {
  id?: number | null;
  role?: string | null;
  node: { id: number; name: { userPreferred: string }; image?: { large?: string | null } | null };
};

function Staff({ staff }: Media) {
  return (
    <div className="staff">
      {staff && staff.edges && staff.edges.length > 0 && (
        <>
          <h3>Staff</h3>
          <div className="staff__container">
            {(staff.edges as StaffCredit[]).map((member) => (
              // No inset: a crew credit is one person, not a pairing.
              <CastChip
                key={member.id}
                image={member.node.image?.large}
                name={member.node.name.userPreferred}
                meta={member.role}
                to={staffPath(member.node.id, member.node.name.userPreferred)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Staff;
