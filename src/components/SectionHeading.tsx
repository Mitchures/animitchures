import { ReactNode } from 'react';

import './SectionHeading.css';

interface Props {
  title: string;
  detail?: string;
  action?: ReactNode;
}

/**
 * Section title with an optional detail line and a right-aligned action
 * ("See all"). Shared so the sections cannot drift a few pixels apart.
 */
function SectionHeading({ title, detail, action }: Props) {
  return (
    <div className="sectionHeading">
      <div>
        <h2 className="sectionHeading__title">{title}</h2>
        {detail && <p className="sectionHeading__detail">{detail}</p>}
      </div>
      {action && <div className="sectionHeading__action">{action}</div>}
    </div>
  );
}

export default SectionHeading;
