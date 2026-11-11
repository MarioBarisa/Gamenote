export const SHARE_SCOPES = [
  { key: 'none', label: 'Ne dijeli ništa', description: 'Gamenote ostaje privatan.' },
  { key: 'library', label: 'Igre i grupe', description: 'Tvoje igre i grupe.' },
  { key: 'all', label: 'Sve', description: 'Gamenote i svi grafovi statistike.' },
];

export const RESERVED_USERNAMES = ['library', 'games', 'groups', 'stats', 'profile', 'login', 'register', 'shared', 'privacy', 'tos', 'about', 'contact', 'add-game', 'game', 'edit-game', 'api-games', 'theme-settings', 'reset-password', 'importers', 'u', 'api', 'assets', 'admin', 'support', 'www', 'app'];

export function normalizeUsername(value) {
  return String(value || '').trim().toLowerCase();
}

export function usernameError(value) {
  if (!/^[a-z0-9][a-z0-9_-]{2,29}$/.test(value)) return 'Koristi 3–30 znakova: slova a–z, brojeve, crticu ili podvlaku. Počni slovom ili brojem.';
  if (RESERVED_USERNAMES.includes(value)) return 'Ovo korisničko ime je rezervirano.';
  return '';
}
