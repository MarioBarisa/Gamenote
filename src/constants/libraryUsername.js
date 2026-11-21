export const RESERVED_USERNAMES = ['library', 'games', 'groups', 'stats', 'profile', 'login', 'register', 'shared', 'privacy', 'tos', 'about', 'contact', 'add-game', 'game', 'edit-game', 'api-games', 'theme-settings', 'reset-password', 'importers', 'u', 'api', 'assets', 'admin', 'support', 'www', 'app'];

export function normalizeUsername(value) {
  return String(value || '').trim().toLowerCase();
}

export function usernameErrorKey(value) {
  if (!/^[a-z0-9][a-z0-9_-]{2,29}$/.test(value)) return 'libraryShare.use330CharactersLetters';
  if (RESERVED_USERNAMES.includes(value)) return 'libraryShare.thisUsernameIsReserved';
  return '';
}
