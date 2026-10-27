import { canonicalPlatform, normalizeTitle, relatedGameTitles } from './importerMatching.js';
import { matchSteamGame } from './steamImport.js';
import { buildPsnIndex, matchPsnGame, platformName } from './psnImport.js';

export function resolveImporterGame(rows, source, game, choice, psnIndex) {
  const platform = source === 'steam' ? 'PC' : platformName(game.platformCategory);
  const automatic = source === 'steam' ? matchSteamGame(rows, game) : { row: matchPsnGame(psnIndex || buildPsnIndex(rows), game) };
  if (automatic.row && !choice && normalizeTitle(automatic.row.title) === normalizeTitle(game.name)) {
    return { row: automatic.row, blocked: false, candidates: [], needsChoice: false, resolution: `link:${automatic.row.id}` };
  }
  const compatible = rows.filter(row => canonicalPlatform(row.platform) === canonicalPlatform(platform));
  const candidates = [];
  for (const row of compatible) {
    if (relatedGameTitles(row.title, game.name)) candidates.push(row);
  }
  if (automatic.row && !candidates.some(row => row.id === automatic.row.id)) candidates.unshift(automatic.row);
  const changedTitle = automatic.row && normalizeTitle(automatic.row.title) !== normalizeTitle(game.name);
  const needsChoice = candidates.length > 0 && (!automatic.row || changedTitle || Boolean(choice));
  if (choice?.mode === 'separate') {
    const saved = compatible.find(row => row.id === choice.entryId);
    return { row: saved || null, blocked: false, separate: true, candidates, resolution: 'separate', needsChoice: true };
  }
  if (choice?.mode === 'link') {
    const target = compatible.find(row => row.id === choice.targetId);
    if (target && !candidates.some(candidate => candidate.id === target.id)) candidates.unshift(target);
    return { row: target || null, blocked: !target, candidates, needsChoice: true, resolution: target ? `link:${target.id}` : '' };
  }
  return {
    row: automatic.row || null,
    blocked: Boolean(automatic.ambiguous || (!automatic.row && candidates.length)),
    candidates, needsChoice,
    resolution: automatic.row ? `link:${automatic.row.id}` : '',
  };
}

const prefix = 'gamenote.importer.choices.';

export function loadImporterChoices(userId, source) {
  try {
    const value = JSON.parse(localStorage.getItem(prefix + userId + '.' + source));
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  } catch { return {}; }
}

export function saveImporterChoices(userId, source, choices) {
  try { localStorage.setItem(prefix + userId + '.' + source, JSON.stringify(choices)); }
  catch { /* Odabir vrijedi za otvorenu stranicu. */ }
}

export function clearImporterChoices(userId) {
  for (const source of ['psn', 'steam']) localStorage.removeItem(prefix + userId + '.' + source);
}
