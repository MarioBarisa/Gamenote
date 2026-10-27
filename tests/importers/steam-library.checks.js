import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeSteamGames, matchSteamGame, buildSteamPatch, buildSteamRow, loadSteamLibraryRows } from '../../src/services/steamImport.js';

test('AppID ima prednost pred promijenjenim naslovom', () => {
  const row = { id: 'steam', title: 'Stari naslov', platform: 'PC', website_url: 'https://store.steampowered.com/app/620/' };
  const rows = [{ id: 'manual', title: 'Portal 2', platform: 'PC' }, row];
  assert.equal(matchSteamGame(rows, { appId: 620, name: 'Portal 2' }).row.id, 'steam');
});

test('naslov prepoznaje postojeće igre kao PSN', () => {
  const game = { appId: 620, name: 'Portal™ 2' };
  const row = { id: 'pc', title: 'Portal 2', platform: 'PC' };
  const consoleRow = { id: 'psn', title: 'Portal 2', platform: 'PlayStation 4' };
  assert.equal(matchSteamGame([row, consoleRow], game).row.id, 'pc');
  assert.equal(matchSteamGame([consoleRow], game).row, null);
  assert.equal(matchSteamGame([{ ...consoleRow, website_url: 'https://store.steampowered.com/app/620/' }], game).row, null);
  assert.equal(matchSteamGame([row, { ...row, id: 'duplicate' }], game).ambiguous, true);
  assert.equal(matchSteamGame([{ ...row, website_url: 'https://store.steampowered.com/app/999/' }], game).row, null);
  assert.equal(matchSteamGame([{ ...row, title: 'Portal 2 Remastered' }], game).row, null);
});

test('vrijeme, nedostupni podaci i dupli AppID-jevi', () => {
  const games = normalizeSteamGames([
    { appid: 620, name: 'Portal 2', playtime_forever: 125, rtime_last_played: 1700000000 },
    { appid: 620, name: 'Duplikat', playtime_forever: 1 },
    { appid: 400, name: 'Portal' },
    { appid: 0, name: 'Neispravno' },
  ]);
  assert.equal(games.length, 2);
  assert.equal(games[0].minutesPlayed, 125);
  assert.equal(games[0].lastPlayed, '2023-11-14T22:13:20.000Z');
  assert.equal(games[1].minutesPlayed, null);
});

test('sinkronizacija čuva osobne podatke i nedostupan napredak', () => {
  const original = { title: 'Moj naslov', status: 'paused', notes: 'Bilješke', rating: 5, platform: 'PC', achievement_percent: 75, progress_value: 3, progress_total: 4, play_time: 10 };
  for (const achievements of [null, { earned: 0, total: 0 }]) {
    const patch = buildSteamPatch({ appId: 620, minutesPlayed: null }, achievements);
    const updated = { ...original, ...patch };
    for (const key of Object.keys(original)) assert.equal(updated[key], original[key]);
    assert.equal(updated.steam_app_id, undefined);
  }
  const updated = { ...original, ...buildSteamPatch({ appId: 620, minutesPlayed: 125 }, { earned: 1, total: 3 }) };
  assert.equal(updated.play_time, 2);
  assert.equal(updated.achievement_percent, 33);
  assert.equal(updated.status, 'paused');
  assert.equal(updated.notes, 'Bilješke');
  assert.equal(updated.rating, 5);
});

test('novi uvoz ima korisnikov status i ne izmišlja datume završetka', () => {
  const row = buildSteamRow('user', { appId: 620, name: 'Portal 2', minutesPlayed: 0, lastPlayed: '2026-01-01', imageUrl: 'cover' }, { status: 'playing', rating: 4, notes: 'Test' }, { earned: 0, total: 10 });
  assert.equal(row.user_id, 'user');
  assert.equal(row.platform, 'PC');
  assert.equal(row.currently_playing, true);
  assert.equal(row.rating, 4);
  assert.equal(row.achievement_percent, 0);
  assert.equal(row.progress_mode, 'achievements_steam');
  assert.equal(row.end_date, undefined);
});

test('provjera biblioteke čita i više od 1000 igara', async () => {
  const ranges = [];
  const database = {
    from(table) {
      assert.equal(table, 'games');
      return {
        select() { return this; },
        eq(column, value) { assert.equal(column, 'user_id'); assert.equal(value, 'user'); return this; },
        order() { return this; },
        async range(start, end) {
          ranges.push([start, end]);
          return { data: Array.from({ length: start === 0 ? 1000 : 5 }, (_, i) => ({ id: start + i })), error: null };
        },
      };
    },
  };
  assert.equal((await loadSteamLibraryRows(database, 'user')).length, 1005);
  assert.deepEqual(ranges, [[0, 999], [1000, 1999]]);
});

test('greška baze zaustavlja provjeru duplikata', async () => {
  const failure = new Error('Baza nije dostupna');
  const query = { select() { return this; }, eq() { return this; }, order() { return this; }, range() { return { error: failure }; } };
  await assert.rejects(loadSteamLibraryRows({ from() { return query; } }, 'user'), failure);
});
