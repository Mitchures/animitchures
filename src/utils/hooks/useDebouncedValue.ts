import { useEffect, useState } from 'react';

/**
 * The value as it was `delay` ms ago, once it stops changing.
 *
 * Used to keep a query from firing on every intermediate state while someone is
 * still making up their mind. Browse drives its filters through the URL, so each
 * change re-renders immediately — good, the controls stay responsive and the
 * back button still steps through every change — but the *request* waits until
 * the changes stop. Four filters adjusted in a row cost one request rather than
 * four, against a budget of 30 a minute.
 */
export const useDebouncedValue = <T>(value: T, delay: number): T => {
  const [settled, setSettled] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setSettled(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return settled;
};
