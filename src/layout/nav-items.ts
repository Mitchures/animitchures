import { ComponentType } from 'react';
import {
  ExploreOutlined,
  FavoriteBorder,
  PlaylistPlayOutlined,
  InsightsOutlined,
  CalendarMonthOutlined,
  GridViewOutlined,
  PeopleOutlined,
  SettingsOutlined,
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
  /** Which of the pill column's big tabs the item sits under. */
  group: 'explore' | 'library' | 'account';
  /** 1–4: a fixed slot in the phone tab bar. More is the fifth slot. */
  barOrder?: number;
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
 * pill column (PillNav), the phone tab bar (TabBar) and the More drawer
 * (Drawer), so a link added here appears in all three.
 */
export function getNavSections({ user, anilistUser }: Args): NavSection[] {
  const sections: NavSection[] = [
    {
      id: 'menu',
      heading: 'Menu',
      items: [
        {
          id: 'discover',
          label: 'Discover',
          to: '/',
          Icon: ExploreOutlined,
          end: true,
          group: 'explore',
          barOrder: 1,
        },
        // Public: the schedule is worth having without an account.
        {
          id: 'calendar',
          label: 'Calendar',
          to: '/calendar',
          Icon: CalendarMonthOutlined,
          group: 'explore',
          barOrder: 2,
        },
        {
          id: 'browse',
          label: 'Browse',
          to: '/search/anime',
          Icon: GridViewOutlined,
          group: 'explore',
          barOrder: 3,
        },
        ...(user
          ? [
              {
                id: 'favorites',
                label: 'Favorites',
                to: '/favorites',
                Icon: FavoriteBorder,
                group: 'explore' as const,
              },
            ]
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
                Icon: PlaylistPlayOutlined,
                group: 'library' as const,
                barOrder: 4,
              },
              { id: 'taste', label: 'Taste', to: '/taste', Icon: InsightsOutlined, group: 'library' as const },
              { id: 'social', label: 'Social', to: '/social', Icon: PeopleOutlined, group: 'library' as const },
            ]
          : [],
    },
    {
      id: 'general',
      heading: 'General',
      items: user
        ? [
            {
              id: 'settings',
              label: 'Settings',
              to: '/settings',
              Icon: SettingsOutlined,
              group: 'account' as const,
            },
            {
              id: 'logout',
              label: 'Logout',
              to: '/',
              Icon: Logout,
              isLogout: true,
              group: 'account' as const,
            },
          ]
        : [{ id: 'login', label: 'Login', to: '/login', Icon: Login, group: 'account' as const }],
    },
  ];

  return sections.filter((section) => section.items.length > 0);
}

const BAR_SIZE = 4;

/**
 * The four phone tab-bar destinations. Slot 4 is Watchlist when AniList is
 * linked; otherwise Favorites when signed in, otherwise Login — so the bar is
 * always full.
 */
export function getBarItems(sections: NavSection[]): NavItem[] {
  const all = sections.flatMap((section) => section.items);
  const fixed = all
    .filter((item) => item.barOrder)
    .sort((a, b) => (a.barOrder ?? 0) - (b.barOrder ?? 0));
  if (fixed.length >= BAR_SIZE) return fixed.slice(0, BAR_SIZE);
  const fallback = all.find((item) => item.id === 'favorites') ?? all.find((item) => item.id === 'login');
  return fallback ? [...fixed, fallback] : fixed;
}

/** What the More drawer lists: everything the bar and the account row do not. */
export function getDrawerItems(sections: NavSection[]): NavItem[] {
  const bar = new Set(getBarItems(sections).map((item) => item.id));
  return sections
    .flatMap((section) => section.items)
    .filter((item) => !bar.has(item.id) && item.group !== 'account');
}
