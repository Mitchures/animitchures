import { isAuthRefusal } from './anilist-session';

// The exact strings AniList returns, captured from the live API.
test('matches an expired or revoked token', () => {
  expect(isAuthRefusal('Invalid token')).toBe(true);
});

test('matches a request sent with no credentials', () => {
  expect(isAuthRefusal('Unauthorized.')).toBe(true);
});

test('is not fooled by ordinary query errors', () => {
  expect(isAuthRefusal('Not Found.')).toBe(false);
  expect(isAuthRefusal('Too Many Requests.')).toBe(false);
  expect(isAuthRefusal('Validation Error')).toBe(false);
  // The word appears mid-message in unrelated errors; only a rejection leads
  // with it, which is why this matches a prefix rather than a substring.
  expect(isAuthRefusal('Cannot query field "unauthorized" on type "Query".')).toBe(false);
});

test('tolerates a missing message', () => {
  expect(isAuthRefusal(undefined)).toBe(false);
  expect(isAuthRefusal(null)).toBe(false);
  expect(isAuthRefusal('')).toBe(false);
});
