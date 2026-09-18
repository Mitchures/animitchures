import { useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { MenuRounded } from '@mui/icons-material';

import './TabBar.css';

import { NavSection, getBarItems, getDrawerItems } from 'layout/nav-items';
import { useSlidingIndicator } from 'layout/useSlidingIndicator';

interface Props {
  sections: NavSection[];
  moreOpen: boolean;
  onMore: () => void;
}

/** The phone navigation: one floating frosted pill with four destinations and More. */
function TabBar({ sections, moreOpen, onMore }: Props) {
  const ref = useRef<HTMLElement>(null);
  // Signed out every public destination already has a slot in the bar, so More
  // would open on nothing. Signed in it always has a reason to exist: the
  // account row with Settings and Log out lives in the drawer.
  const signedIn = sections.some((section) => section.items.some((item) => item.id === 'logout'));
  const showMore = signedIn || getDrawerItems(sections).length > 0;
  const indicator = useSlidingIndicator(ref, '.tabBar__item--active, .tabBar__more.is-open', 'x', [
    moreOpen,
  ]);

  return (
    <nav className="tabBar" aria-label="Main" ref={ref}>
      <span
        className={`tabBar__indicator${indicator.visible ? '' : ' is-hidden'}`}
        style={indicator.style}
        aria-hidden="true"
      />
      {getBarItems(sections).map(({ id, label, to, Icon, end }) => (
        <NavLink
          key={id}
          to={to}
          end={end}
          aria-label={label}
          className={({ isActive }) =>
            `tabBar__item${isActive && !moreOpen ? ' tabBar__item--active' : ''}`
          }
        >
          <Icon />
          <span>{label}</span>
        </NavLink>
      ))}
      {showMore && (
        <button
          type="button"
          className={`tabBar__item tabBar__more${moreOpen ? ' is-open' : ''}`}
          aria-label="More"
          aria-expanded={moreOpen}
          aria-controls="drawer"
          onClick={onMore}
        >
          <MenuRounded />
          <span>More</span>
        </button>
      )}
    </nav>
  );
}

export default TabBar;
