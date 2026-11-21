import { t } from '../i18n/index.js';
export function validateBackup(data) {
  if (!data || data.version !== 1 || !Array.isArray(data.games) || !Array.isArray(data.groups) || !Array.isArray(data.gameGroups)) throw new Error(t('backupValidation.invalidBackupFormatOrUnsupported'));
  const gameIds = new Set();
  const groupIds = new Set();
  for (const game of data.games) {
    if (!game || typeof game.id !== 'string' || !game.id || gameIds.has(game.id) || typeof game.title !== 'string' || !game.title.trim()) throw new Error(t('backupValidation.theBackupHasAnInvalid'));
    gameIds.add(game.id);
    for (const field of ['play_time', 'rating', 'achievement_percent', 'metacritic_score', 'progress_value', 'progress_total']) {
      if (game[field] != null && (!Number.isFinite(Number(game[field])) || Number(game[field]) < 0)) throw new Error(t('backupValidation.theBackupHasInvalidNumbers'));
    }
  }
  for (const group of data.groups) {
    if (!group || typeof group.id !== 'string' || !group.id || groupIds.has(group.id) || typeof group.name !== 'string' || !group.name.trim()) throw new Error(t('backupValidation.theBackupHasAnInvalidOrDuplicateGroup'));
    groupIds.add(group.id);
  }
  const links = new Set();
  for (const link of data.gameGroups) {
    if (!link || !gameIds.has(link.game_id) || !groupIds.has(link.group_id)) throw new Error(t('backupValidation.linksInTheBackupMust'));
    const key = link.game_id + ':' + link.group_id;
    if (links.has(key)) throw new Error(t('backupValidation.theBackupHasADuplicate'));
    links.add(key);
  }
  return data;
}
