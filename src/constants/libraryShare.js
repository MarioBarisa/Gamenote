import { t } from '../i18n/index.js';
import { usernameErrorKey } from './libraryUsername.js';

export { normalizeUsername, RESERVED_USERNAMES } from './libraryUsername.js';

export const SHARE_SCOPES = [
  { key: 'none', labelKey: 'libraryShare.shareNothing', descriptionKey: 'libraryShare.yourGamenoteStaysPrivate' },
  { key: 'library', labelKey: 'libraryShare.gamesAndGroups', descriptionKey: 'libraryShare.yourGamesAndGroups' },
  { key: 'all', labelKey: 'common.all', descriptionKey: 'libraryShare.gamenoteAndAllStatsCharts' },
];

export function usernameError(value) {
  const key = usernameErrorKey(value);
  return key ? t(key) : '';
}
