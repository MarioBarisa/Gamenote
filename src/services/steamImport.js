import { fetchUserRows } from './libraryData.js';
import { normalizeTitle, canonicalPlatform } from './importerMatching.js';
import { importerStatus } from './importerStatus.js';

export function normalizeSteamTitle(value) {
  return normalizeTitle(value);
}

function steamAppIdFromUrl(value) {
  try {
    const url = new URL(value);
    if (url.hostname !== 'store.steampowered.com') return null;
    const match = url.pathname.match(/^\/app\/(\d+)(?:\/|$)/);
    return match ? Number(match[1]) : null;
  } catch {
    return null;
  }
}

export function normalizeSteamGames(games) {
  const result = [];
  const seen = new Set();
  for (const game of games) {
    if (!Number.isInteger(game.appid) || game.appid < 1 || !game.name || seen.has(game.appid)) continue;
    seen.add(game.appid);
    result.push({
      appId: game.appid,
      name: game.name,
      minutesPlayed: Number.isFinite(game.playtime_forever) ? Math.max(0, game.playtime_forever) : null,
      lastPlayed: game.rtime_last_played > 0 ? new Date(game.rtime_last_played * 1000).toISOString() : null,
      imageUrl: `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${game.appid}/library_600x900.jpg`,
    });
  }
  result.sort((a, b) => (b.minutesPlayed || 0) - (a.minutesPlayed || 0) || a.name.localeCompare(b.name));
  return result;
}

export async function loadSteamLibraryRows(database, userId, signal) {
  return fetchUserRows(database, 'games', userId, { columns: 'id,title,platform,website_url', signal });
}

export function matchSteamGame(rows, game) {
  for (const row of rows) {
    if (canonicalPlatform(row.platform) !== 'pc') continue;
    if (steamAppIdFromUrl(row.website_url) === game.appId) return { row, ambiguous: false };
  }
  const matches = [];
  const title = normalizeSteamTitle(game.name);
  for (const row of rows) {
    if (canonicalPlatform(row.platform) !== 'pc') continue;
    if (steamAppIdFromUrl(row.website_url)) continue;
    if (title && normalizeSteamTitle(row.title) === title) matches.push(row);
  }
  return { row: matches.length === 1 ? matches[0] : null, ambiguous: matches.length > 1 };
}

export function buildSteamPatch(game, achievements) {
  const patch = { updated_at: new Date().toISOString() };
  if (game.minutesPlayed != null) patch.play_time = Math.round(game.minutesPlayed / 60);
  // Nedostupna postignuća čuvaju postojeći napredak.
  if (achievements && achievements.total > 0) {
    patch.progress_mode = 'achievements_steam';
    patch.progress_unit = 'achv';
    patch.progress_source = 'Steam';
    patch.progress_value = achievements.earned;
    patch.progress_total = achievements.total;
    patch.achievement_percent = Math.round(achievements.earned / achievements.total * 100);
  }
  return patch;
}

export function buildSteamRow(userId, game, extras, achievements) {
  const status = importerStatus(extras, achievements?.earned, achievements?.total);
  return {
    ...buildSteamPatch(game, achievements),
    user_id: userId,
    title: game.name,
    platform: 'PC',
    image_url: null,
    background_image: null,
    website_url: `https://store.steampowered.com/app/${game.appId}/`,
    game_api_id: null,
    status,
    currently_playing: status === 'playing',
    rating: extras.rating > 0 ? extras.rating : null,
    notes: extras.notes || '',
  };
}
