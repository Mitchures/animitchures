import { ComponentType } from 'react';
import {
  Explore,
  Favorite,
  PlaylistPlay,
  InsightsOutlined,
  CalendarMonthOutlined,
  PeopleOutlined,
  Settings as SettingsIcon,
  Logout,
  Login,
} from '@mui/icons-material';

import { User, AnilistUser } from 'context/types';

export interface NavItem {
  id: string;
  label: string;
  to: string;
  Icon: ComponentType;
  /** Match this route exactly. Needed for '/' so it is not active everywhere. */
  end?: boolean;
  /** Signs the user out on click instead of just navigating. */
  isLogout?: boolean;
}

export interface NavSection {
  id: string;
  heading: string;
  items: NavItem[];
}

interface Args {
  user: User | null;
  anilistUser: AnilistUser | null;
}

/**
 * Single source of truth for the navigation. Rendered by both the desktop
 * sidebar (Navigation) and the mobile overlay (MobileMenu), so a link added
 * here appears in both.
 */
export function getNavSections({ user, anilistUser }: Args): NavSection[] {
  const sections: NavSection[] = [
    {
      id: 'menu',
      heading: 'Menu',
      items: [
        { id: 'discover', label: 'Discover', to: '/', Icon: Explore, end: true },
        // Public: the schedule is worth having without an account.
        { id: 'calendar', label: 'Calendar', to: '/calendar', Icon: CalendarMonthOutlined },
        ...(user
          ? [{ id: 'favorites', label: 'Favorites', to: '/favorites', Icon: Favorite }]
          : []),
      ],
    },
    {
      id: 'anilist',
      heading: 'Anilist',
      items:
        user && anilistUser
          ? [
              {
                id: 'watchlist',
                label: 'Watchlist',
                to: '/anilist-watchlist',
                Icon: PlaylistPlay,
              },
              {
                id: 'taste',
                label: 'Taste',
                to: '/taste',
                Icon: InsightsOutlined,
              },
              {
                id: 'social',
                label: 'Social',
                to: '/social',
                Icon: PeopleOutlined,
              },
            ]
          : [],
    },
    {
      id: 'general',
      heading: 'General',
      items: user
        ? [
            { id: 'settings', label: 'Settings', to: '/settings', Icon: SettingsIcon },
            { id: 'logout', label: 'Logout', to: '/', Icon: Logout, isLogout: true },
          ]
        : [{ id: 'login', label: 'Login', to: '/login', Icon: Login }],
    },
  ];

  return sections.filter((section) => section.items.length > 0);
}
