import './Staff.css';

import { Media } from 'graphql/types';

function Staff({ staff }: Media) {
  return (
    <div className="staff">
      {staff && staff.edges && staff.edges.length > 0 && (
        <>
          <h3>Staff</h3>
          <div className="staff__container">
            {staff.edges.slice(0, 6).map((staff: any) => (
              <div key={staff.id} className="staff__block">
                <div className="staff__blockLeft">
                  <div className="staff__blockImageContainer">
                    <img src={staff.node.image.large} alt={staff.node.name.userPreferred} />
                  </div>
                  <div className="staff__blockBody">
                    <h5>{staff.node.name.userPreferred}</h5>
                    <p>{staff.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Staff;
