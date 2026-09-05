import { createContext, useContext, ReactNode, RefObject } from 'react';

/**
 * The element that actually scrolls.
 *
 * `.app__body` is a fixed-height, overflow-y:auto box, so the window never
 * scrolls and window scroll events never fire. Anything driving an animation
 * from scroll position has to read this element instead — which means it needs
 * a handle on it from wherever it is in the tree.
 */
const ScrollContainerContext = createContext<RefObject<HTMLDivElement | null> | null>(null);

export function ScrollContainerProvider({
  value,
  children,
}: {
  value: RefObject<HTMLDivElement | null>;
  children: ReactNode;
}) {
  return (
    <ScrollContainerContext.Provider value={value}>{children}</ScrollContainerContext.Provider>
  );
}

export const useScrollContainer = () => useContext(ScrollContainerContext);
