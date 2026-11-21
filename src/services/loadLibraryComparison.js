import { t } from '../i18n/index.js';
import { supabase } from '../supabase.js';
import { fetchUserRows } from './libraryData.js';
import { loadPublicLibrary } from './libraryShare.js';
import { COMPARISON_COLUMNS } from './libraryComparison.js';
import { comparisonNames } from './comparisonLink.js';

const PAGE_SIZE = 48;
const COMPARISON_FIELDS = COMPARISON_COLUMNS.split(',');

async function loadSharedGames(username, signal, initialPage) {
  const games = [];
  const seen = new Set();
  const reuseFirst = initialPage && Number.isInteger(initialPage.total) && initialPage.total >= 0 && Array.isArray(initialPage.items) && initialPage.items.length === Math.min(PAGE_SIZE, initialPage.total);
  signal.throwIfAborted();
  const first = reuseFirst ? initialPage : await loadPublicLibrary(username, 'games', { page: 1, sort: 'title' }, signal);
  const total = first.total;
  if (!Number.isInteger(total) || total < 0) throw new Error(t('loadLibraryComparison.theComparisonCouldntBeLoaded'));

  function appendPage(result, page) {
    signal.throwIfAborted();
    const expected = Math.min(PAGE_SIZE, total - (page - 1) * PAGE_SIZE);
    if (result.total !== total || !Array.isArray(result.items) || result.items.length !== expected) throw new Error(t('loadLibraryComparison.theLibraryChangedRunThe'));
    for (const game of result.items) {
      if (!game.id || seen.has(game.id)) throw new Error(t('loadLibraryComparison.theLibraryChangedRunThe'));
      seen.add(game.id);
      // Detalje igre učitavamo tek pri otvaranju.
      const entry = {};
      for (const field of COMPARISON_FIELDS) entry[field] = game[field];
      games.push(entry);
    }
  }
  appendPage(first, 1);
  // Najviše tri stranice dohvaćamo istodobno.
  const pageCount = Math.ceil(total / PAGE_SIZE);
  for (let page = 2; page <= pageCount; page += 3) {
    signal.throwIfAborted();
    const pending = [];
    for (let next = page; next <= Math.min(page + 2, pageCount); next++) {
      pending.push(loadPublicLibrary(username, 'games', { page: next, sort: 'title' }, signal));
    }
    const results = await Promise.all(pending);
    for (let index = 0; index < results.length; index++) appendPage(results[index], page + index);
  }
  return games;
}

export async function loadLibraryComparison(userId, username, signal, initialPage = null) {
  const [own, shared] = await Promise.all([
    fetchUserRows(supabase, 'games', userId, { columns: COMPARISON_COLUMNS, signal }),
    loadSharedGames(username, signal, initialPage)
  ]);
  return { own, shared };
}

export async function loadPublicComparison(left, right, signal) {
  const names = comparisonNames(left, right);
  if (!names) throw new Error(t('common.theComparisonIsUnavailable'));
  const [leftHeader, rightHeader] = await Promise.all([
    loadPublicLibrary(names.left, 'header', {}, signal),
    loadPublicLibrary(names.right, 'header', {}, signal)
  ]);
  for (const [index, header] of [leftHeader, rightHeader].entries()) {
    if (!['library', 'all'].includes(header.share_scope) || header.username !== [names.left, names.right][index]) throw new Error(t('common.theComparisonIsUnavailable'));
  }
  const [own, shared] = await Promise.all([
    loadSharedGames(names.left, signal), loadSharedGames(names.right, signal)
  ]);
  return { own, shared, leftHeader, rightHeader };
}
