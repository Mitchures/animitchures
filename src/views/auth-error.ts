/**
 * Firebase auth error codes, in words a person can act on.
 *
 * These used to reach the user through `alert(error.message)`, which shows
 * strings like "Firebase: Error (auth/invalid-credential)." — the code, the
 * product name, and no indication of what to do next.
 *
 * `invalid-credential` deliberately does not distinguish a wrong password from
 * an unknown address: Firebase collapses them on purpose so the form cannot be
 * used to discover which addresses have accounts.
 */
const MESSAGES: Record<string, string> = {
  'auth/invalid-email': 'That email address does not look right.',
  'auth/invalid-credential': 'That email and password do not match an account.',
  'auth/wrong-password': 'That email and password do not match an account.',
  'auth/user-not-found': 'That email and password do not match an account.',
  'auth/user-disabled': 'That account has been disabled.',
  'auth/email-already-in-use': 'An account already exists with that email.',
  'auth/weak-password': 'Passwords need to be at least six characters.',
  'auth/too-many-requests': 'Too many attempts. Wait a minute and try again.',
  'auth/network-request-failed': 'Could not reach the server. Check your connection.',
  'auth/popup-closed-by-user': '',
  'auth/cancelled-popup-request': '',
  'auth/popup-blocked': 'Your browser blocked the sign-in window.',
};

export const authErrorMessage = (error: unknown): string => {
  const code = (error as { code?: string })?.code ?? '';
  if (code in MESSAGES) return MESSAGES[code];
  return 'Something went wrong. Try again.';
};
