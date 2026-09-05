import './Staff.css';

import CastChip from './CastChip';

import { Media } from 'graphql/types';

function Staff({ staff }: Media) {
  return (
    <div className="staff">
      {staff && staff.edges && staff.edges.length > 0 && (
        <>
          <h3>Staff</h3>
          <div className="staff__container">
            {staff.edges.map((member: any) => (
              // No inset: a crew credit is one person, not a pairing.
              <CastChip
                key={member.id}
                image={member.node.image?.large}
                name={member.node.name.userPreferred}
                meta={member.role}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Staff;
