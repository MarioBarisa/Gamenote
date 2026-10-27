import { normalizeTitle, canonicalPlatform, relatedGameTitles } from './importerMatching.js';
import { importerStatus } from './importerStatus.js';

export function platformName(category) {
  if (category === 'ps5_native_game') return 'PlayStation 5';
  if (category === 'ps4_game') return 'PlayStation 4';
  return 'PlayStation';
}

export function findPsnTrophyTitle(game, titles) {
  const name = game.localizedName || game.name;
  const platform = canonicalPlatform(platformName(game.category));
  const exact = [];
  const related = [];
  for (const title of titles) {
    const platforms = String(title.trophyTitlePlatform || '').split(',').filter(Boolean).map(canonicalPlatform);
    if (platforms.length && !platforms.includes(platform)) continue;
    if (normalizeTitle(title.trophyTitleName) === normalizeTitle(name)) exact.push(title);
    else if (relatedGameTitles(title.trophyTitleName, name)) related.push(title);
  }
  if (exact.length === 1) return exact[0];
  if (!exact.length && related.length === 1) return related[0];
  return null;
}

export function buildPsnIndex(rows) {
  const index = new Map();
  for (const row of rows) {
    const prefix = canonicalPlatform(row.platform) + '|';
    const keys = [prefix + 'name:' + normalizeTitle(row.title)];
    if (row.psn_np_communication_id) keys.unshift(prefix + 'npc:' + row.psn_np_communication_id);
    if (row.psn_title_id) keys.unshift(prefix + 'title:' + row.psn_title_id);
    for (const key of keys) if (!index.has(key)) index.set(key, row);
  }
  return index;
}

export function matchPsnGame(index, game) {
  const prefix = canonicalPlatform(platformName(game.platformCategory)) + '|';
  return (game.npCommunicationId && index.get(prefix + 'npc:' + game.npCommunicationId)) ||
    (game.psnTitleId && index.get(prefix + 'title:' + game.psnTitleId)) ||
    index.get(prefix + 'name:' + normalizeTitle(game.name)) || null;
}

export function buildPsnPatch(game, existing = {}) {
  const patch = { updated_at: new Date().toISOString() };
  if (game.hoursPlayed != null) patch.play_time = Math.round(game.hoursPlayed);
  if (game.trophiesTotal > 0 && game.trophiesEarned != null) {
    patch.achievement_percent = game.trophyPercent ?? Math.round(game.trophiesEarned / game.trophiesTotal * 100);
    patch.progress_value = game.trophiesEarned;
    patch.progress_total = game.trophiesTotal;
    patch.progress_mode = 'trophies_psn';
    patch.progress_unit = 'trophies';
    patch.progress_source = platformName(game.platformCategory);
  }
  if (!existing.psn_np_communication_id && game.npCommunicationId) patch.psn_np_communication_id = game.npCommunicationId;
  if (!existing.psn_title_id && game.psnTitleId != null) patch.psn_title_id = String(game.psnTitleId);
  return patch;
}

export function buildPsnRow(userId, game, extras) {
  const status = importerStatus(extras, game.trophiesEarned, game.trophiesTotal);
  return {
    ...buildPsnPatch(game),
    user_id: userId,
    title: game.name,
    platform: platformName(game.platformCategory),
    rating: extras.rating > 0 ? extras.rating : null,
    notes: extras.notes || '',
    start_date: game.firstPlayed || null,
    end_date: status === 'completed' ? game.lastPlayed || null : null,
    status,
    currently_playing: status === 'playing',
    game_api_id: null,
    image_url: null,
    background_image: null,
  };
}
