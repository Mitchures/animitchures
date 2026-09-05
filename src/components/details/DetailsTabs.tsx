import { ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';

import './DetailsTabs.css';

export interface DetailsTab {
  id: string;
  label: string;
  content: ReactNode;
}

/**
 * Tab state lives in `?tab=` rather than component state, so a refresh keeps the
 * tab, back steps between tabs, and a Characters view is linkable.
 *
 * No transition on switching — instant swaps were an explicit design decision.
 */
function DetailsTabs({ tabs, trailing }: { tabs: DetailsTab[]; trailing?: ReactNode }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const requested = searchParams.get('tab');
  // An unknown ?tab= value falls back to the first tab rather than rendering
  // nothing at all.
  const active = tabs.find((tab) => tab.id === requested) ?? tabs[0];

  const select = (id: string) => {
    const next = new URLSearchParams(searchParams);
    next.set('tab', id);
    // replace: switching tabs should not stack a history entry per click, but
    // back should still leave the page.
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="detailsTabs">
      <div className="detailsTabs__bar" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={tab.id === active.id}
            className={`detailsTabs__tab${tab.id === active.id ? ' detailsTabs__tab--active' : ''}`}
            onClick={() => select(tab.id)}
          >
            {tab.label}
          </button>
        ))}
        {trailing}
      </div>
      <div className="detailsTabs__panel" role="tabpanel">
        {active.content}
      </div>
    </div>
  );
}

export default DetailsTabs;
