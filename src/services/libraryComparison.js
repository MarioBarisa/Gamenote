import { t } from '../i18n/index.js';
import { GAME_STATUS_MAP, statusFromLegacy } from '../constants/gameStatus.js';
import { cardProgress } from './cardProgress.js';

export const COMPARISON_COLUMNS = 'id,title,platform,play_time,genre,rating,status,currently_playing,end_date,game_api_id,website_url,image_url,background_image,screenshot_urls,metacritic_score,progress_mode,progress_value,progress_total,achievement_percent';

function firstScreenshot(game) {
  try {
    const images = typeof game?.screenshot_urls === 'string' ? JSON.parse(game.screenshot_urls) : game?.screenshot_urls;
    if (Array.isArray(images)) return images.find(url => typeof url === 'string' && /^https?:\/\//i.test(url)) || '';
  } catch { return ''; }
  return '';
}

function titleKey(game) {
  return String(game.title || '').normalize('NFKC').toLowerCase().replace(/[™®]/g, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}
function platformKey(game) { return String(game.platform || '').trim().toLowerCase(); }
function sourceKey(game) {
  if (game.game_api_id) return 'catalog:' + game.game_api_id;
  const steam = String(game.website_url || '').match(/^https?:\/\/store\.steampowered\.com\/app\/(\d+)(?:\/|$)/i);
  return steam ? 'steam:' + steam[1] : '';
}
function indexGames(games, keyFor) {
  const index = new Map();
  for (const game of games) {
    const identity = keyFor(game);
    if (!identity) continue;
    const key = platformKey(game) + ':' + identity;
    if (!index.has(key)) index.set(key, []);
    index.get(key).push(game);
  }
  return index;
}
function hours(game) {
  if (!game || game.play_time == null || game.play_time === '') return null;
  const value = Number(game.play_time);
  return Number.isFinite(value) && value >= 0 ? value : null;
}
function progressKind(game) {
  if (!game) return '';
  const mode = game.progress_mode || '';
  if (mode.startsWith('achievements') || mode.startsWith('trophies')) return 'achievements';
  if (mode.startsWith('completion')) return 'completion';
  if (mode === 'pokedex') return 'pokedex';
  return !mode && game.achievement_percent != null ? 'achievements' : '';
}
function leader(left, right) {
  if (left == null || right == null) return null;
  if (left === right) return 'tie';
  return left > right ? 'left' : 'right';
}
export function comparisonStatus(game) {
  return game ? game.status || statusFromLegacy(game) : '';
}
export function comparisonRow(left, right) {
  const game = left || right;
  const leftProgress = left ? cardProgress(left) : null;
  const rightProgress = right ? cardProgress(right) : null;
  const comparableProgress = progressKind(left) && progressKind(left) === progressKind(right) && leftProgress?.percent != null && rightProgress?.percent != null;
  const leftHours = hours(left), rightHours = hours(right);
  return {
    key: `${left?.id || ''}:${right?.id || ''}`, left, right,
    title: String(game.title || t('common.untitled')), platform: String(game.platform || '').trim() || '—',
    image: game.image_url || game.background_image || '/game-placeholder.svg',
    background: firstScreenshot(left) || firstScreenshot(right) || game.background_image || game.image_url || '',
    leftHours, rightHours, leftProgress, rightProgress,
    hoursLeader: leader(leftHours, rightHours),
    progressLeader: comparableProgress ? leader(leftProgress.percent, rightProgress.percent) : null,
    hoursDifference: leftHours != null && rightHours != null ? Math.abs(leftHours - rightHours) : -1,
    progressDifference: comparableProgress ? Math.abs(leftProgress.percent - rightProgress.percent) : -1
  };
}

export function compareLibraries(leftGames, rightGames) {
  const pairs = new Map();
  const usedRight = new Set();
  // Nejasni duplikati ostaju zasebni unosi.
  for (const keyFor of [sourceKey, titleKey]) {
    const leftIndex = indexGames(leftGames, keyFor);
    const rightIndex = indexGames(rightGames, keyFor);
    for (const [key, left] of leftIndex) {
      const right = rightIndex.get(key);
      if (left.length !== 1 || right?.length !== 1) continue;
      if (pairs.has(left[0]) || usedRight.has(right[0])) continue;
      const leftId = sourceKey(left[0]), rightId = sourceKey(right[0]);
      if (leftId && rightId && leftId.split(':')[0] === rightId.split(':')[0] && leftId !== rightId) continue;
      pairs.set(left[0], right[0]); usedRight.add(right[0]);
    }
  }
  const rows = [];
  for (const game of leftGames) rows.push(comparisonRow(game, pairs.get(game) || null));
  for (const game of rightGames) if (!usedRight.has(game)) rows.push(comparisonRow(null, game));
  return rows;
}

export function filterComparison(rows, filters) {
  const result = [];
  const query = String(filters.search || '').trim().toLocaleLowerCase('hr');
  for (const row of rows) {
    if (query && !row.title.toLocaleLowerCase('hr').includes(query)) continue;
    if (filters.platform && row.platform !== filters.platform) continue;
    if (filters.status && comparisonStatus(row.left) !== filters.status && comparisonStatus(row.right) !== filters.status) continue;
    if (filters.membership === 'shared' && (!row.left || !row.right)) continue;
    if (filters.membership === 'left' && (!row.left || row.right)) continue;
    if (filters.membership === 'right' && (!row.right || row.left)) continue;
    if (filters.leader === 'hours-left' && row.hoursLeader !== 'left') continue;
    if (filters.leader === 'hours-right' && row.hoursLeader !== 'right') continue;
    if (filters.leader === 'progress-left' && row.progressLeader !== 'left') continue;
    if (filters.leader === 'progress-right' && row.progressLeader !== 'right') continue;
    result.push(row);
  }
  result.sort((a, b) => {
    let difference = 0;
    if (filters.sort === 'hours') difference = Math.max(b.leftHours ?? -1, b.rightHours ?? -1) - Math.max(a.leftHours ?? -1, a.rightHours ?? -1);
    else if (filters.sort === 'hours-gap') difference = b.hoursDifference - a.hoursDifference;
    else if (filters.sort === 'progress-gap') difference = b.progressDifference - a.progressDifference;
    else if (filters.sort === 'platform') difference = a.platform.localeCompare(b.platform, 'hr');
    else if (filters.sort === 'status') difference = (GAME_STATUS_MAP[comparisonStatus(a.left || a.right)]?.label || '').localeCompare(GAME_STATUS_MAP[comparisonStatus(b.left || b.right)]?.label || '');
    return difference || a.title.localeCompare(b.title, 'hr') || a.platform.localeCompare(b.platform, 'hr') || a.key.localeCompare(b.key);
  });
  return result;
}

export function comparisonSummary(games) {
  let hoursTotal = 0, knownHours = 0, completed = 0, ratings = 0, rated = 0, perfected = 0;
  const platforms = new Map();
  for (const game of games) {
    const time = hours(game);
    if (time != null) { hoursTotal += time; knownHours++; }
    if (comparisonStatus(game) === 'completed') completed++;
    if (game.rating > 0 && game.rating <= 5) { ratings += Number(game.rating); rated++; }
    if (cardProgress(game).complete) perfected++;
    if (game.platform) platforms.set(game.platform, (platforms.get(game.platform) || 0) + 1);
  }
  let topPlatform = '—', platformCount = 0;
  for (const [name, count] of platforms) if (count > platformCount) { topPlatform = name; platformCount = count; }
  return { total: games.length, hours: knownHours || !games.length ? hoursTotal : null, completed, rating: rated ? ratings / rated : null, perfected, topPlatform };
}

export function comparisonRatingPairs(rows) {
  const points = [];
  for (const row of rows) {
    if (!row.left || !row.right) continue;
    const left = Number(row.left.rating), right = Number(row.right.rating);
    const metacritic = Number(row.right.metacritic_score || row.left.metacritic_score);
    if (!(left > 0 && left <= 5 && right > 0 && right <= 5 && metacritic > 0 && metacritic <= 100)) continue;
    points.push({ key: row.key, title: row.title, platform: row.platform, left, right, metacritic });
  }
  points.sort((a, b) => Math.abs(b.left - b.right) - Math.abs(a.left - a.right) || a.title.localeCompare(b.title, 'hr'));
  return points.slice(0, 12);
}

export function comparisonPlatforms(leftGames, rightGames) {
  const platforms = new Map();
  for (const [index, games] of [leftGames, rightGames].entries()) {
    for (const game of games) {
      const key = platformKey(game) || '—';
      if (!platforms.has(key)) platforms.set(key, { platform: String(game.platform || '').trim() || '—', left: null, right: null });
      const value = hours(game), side = index === 0 ? 'left' : 'right';
      if (value != null) platforms.get(key)[side] = (platforms.get(key)[side] || 0) + value;
    }
  }
  const rows = [...platforms.values()];
  rows.sort((a, b) => ((b.left || 0) + (b.right || 0)) - ((a.left || 0) + (a.right || 0)) || a.platform.localeCompare(b.platform, 'hr'));
  return rows.slice(0, 5);
}
