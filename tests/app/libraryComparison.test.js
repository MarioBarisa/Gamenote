import test from 'node:test';
import assert from 'node:assert/strict';
import { compareLibraries, filterComparison, comparisonSummary, comparisonRatingPairs, comparisonPlatforms } from '../../src/services/libraryComparison.js';
const game = (id, patch = {}) => ({ id, title: 'Igra', platform: 'PC', game_api_id: '10', status: 'playing', play_time: 10, progress_mode: 'achievements_steam', progress_value: 4, progress_total: 10, ...patch });

test('usporedba povezuje isti ID i platformu unatoč promjeni naslova', () => {
  const rows = compareLibraries([game('a')], [game('b', { title: 'Drugi naziv', play_time: 4, progress_value: 8 })]);
  assert.equal(rows.length, 1); assert.equal(rows[0].hoursLeader, 'left'); assert.equal(rows[0].progressLeader, 'right');
});
test('usporedba odvaja platforme, nastavke i konfliktne ID-jeve', () => {
  for (const patch of [{ platform: 'PS5' }, { game_api_id: '20' }, { game_api_id: null, title: 'Igra 2' }]) assert.equal(compareLibraries([game('a')], [game('b', patch)]).length, 2);
});
test('usporedba ne pogađa duplikate i ne zbraja njihove sate', () => {
  const rows = compareLibraries([game('a'), game('b')], [game('c')]);
  assert.equal(rows.length, 3); assert.equal(rows.some(row => row.left && row.right), false);
});
test('jednoznačan naslov radi bez ID-ja, uz očuvanje izdanja', () => {
  assert.equal(compareLibraries([game('a', { game_api_id: null })], [game('b')]).length, 1);
  assert.equal(compareLibraries([game('a', { game_api_id: null })], [game('b', { title: 'Igra Remastered' })]).length, 2);
});
test('nepoznati sati, rank i različito praćenje ne proglašavaju pobjednika', () => {
  for (const patch of [{ progress_mode: 'leaderboard_rank' }, { progress_mode: 'pokedex' }]) {
    const row = compareLibraries([game('a', { play_time: null })], [game('b', patch)])[0];
    assert.equal(row.hoursLeader, null); assert.equal(row.progressLeader, null);
  }
});
test('nula je stvaran podatak, a zaokruženih 100% nije dovršenost', () => {
  const row = compareLibraries([game('a', { play_time: 0, progress_value: 0 })], [game('b')])[0];
  assert.equal(row.hoursLeader, 'right'); assert.equal(row.progressLeader, 'right');
  const summary = comparisonSummary([game('a', { progress_value: 199, progress_total: 200, rating: 5 }), game('b', { progress_value: 10, rating: null })]);
  assert.equal(summary.perfected, 1); assert.equal(summary.rating, 5);
  assert.equal(comparisonSummary([game('unknown', { play_time: null })]).hours, null);
  assert.equal(comparisonSummary([game('zero', { play_time: 0 })]).hours, 0);
});
test('globalni filtri čuvaju oba statusa, a prednost radi za oba igrača', () => {
  const rows = compareLibraries([game('a')], [game('b', { status: 'completed', play_time: 20, progress_value: 2 })]);
  assert.equal(filterComparison(rows, { status: 'completed' }).length, 1);
  assert.equal(filterComparison(rows, { leader: 'hours-right' }).length, 1);
  assert.equal(filterComparison(rows, { leader: 'progress-left' }).length, 1);
  assert.equal(filterComparison(rows, { leader: 'hours-left' }).length, 0);
  assert.equal(filterComparison(rows, { membership: 'right' }).length, 0);
  assert.equal(rows[0].left.status, 'playing');
});
test('sortiranje ne mijenja izvorne igre ni redoslijed', () => {
  const own = [game('a', { title: 'Z' }), game('b', { title: 'A', game_api_id: '20' })];
  const rows = compareLibraries(own, []);
  assert.equal(filterComparison(rows, { sort: 'title' })[0].title, 'A');
  assert.equal(own[0].title, 'Z'); assert.equal(rows[0].title, 'Z');
});

test('različite vrste ID-ja dopuštaju samo jednoznačan naslov', () => {
  const row = compareLibraries([game('a')], [game('b', { game_api_id: null, website_url: 'https://store.steampowered.com/app/123/' })]);
  assert.equal(row.length, 1);
});

test('pozadina usporedbe bira prvi screenshot i podnosi neispravan JSON', () => {
  const own = game('a', { screenshot_urls: '["https://images.test/first.jpg","https://images.test/second.jpg"]', background_image: 'fallback' });
  assert.equal(compareLibraries([own], [game('b')])[0].background, 'https://images.test/first.jpg');
  const remote = game('b', { screenshot_urls: ['https://images.test/remote.jpg'] });
  assert.equal(compareLibraries([{ ...own, screenshot_urls: 'broken' }], [remote])[0].background, 'https://images.test/remote.jpg');
  assert.equal(compareLibraries([{ ...own, screenshot_urls: null }], [game('b')])[0].background, 'fallback');
});

test('graf ocjena uključuje samo zajedničke valjane ocjene i Metacritic', () => {
  const rows = compareLibraries([
    game('a', { rating: 5, metacritic_score: 90 }), game('c', { game_api_id: '20', title: 'Druga', rating: 4, metacritic_score: 80 })
  ], [game('b', { rating: 2 }), game('d', { game_api_id: '20', title: 'Druga', rating: 4, metacritic_score: 75 })]);
  const points = comparisonRatingPairs(rows);
  assert.equal(points[0].left, 5); assert.equal(points[0].right, 2); assert.equal(points[0].metacritic, 90);
  assert.equal(points[1].metacritic, 75);
  for (const patch of [{ rating: null }, { rating: 0 }, { rating: 6 }, { rating: NaN }, { metacritic_score: null }]) {
    assert.equal(comparisonRatingPairs(compareLibraries([game('a', { rating: 4, metacritic_score: 80, ...patch })], [game('b', { rating: 3 })])).length, 0);
  }
  assert.equal(rows[0].title, 'Igra');
});

test('platformski graf zbraja sate po platformi i razlikuje nulu od nepoznatog', () => {
  const own = [game('a', { play_time: null }), game('b', { platform: 'PlayStation 5', play_time: 0 }), game('c', { platform: ' pc ', play_time: 5 })];
  const other = [game('d', { play_time: 7 }), game('e', { platform: 'PlayStation 4', play_time: null })];
  assert.deepEqual(comparisonPlatforms(own, other), [
    { platform: 'PC', left: 5, right: 7 }, { platform: 'PlayStation 4', left: null, right: null }, { platform: 'PlayStation 5', left: 0, right: null }
  ]);
  assert.equal(own[0].play_time, null);
});
