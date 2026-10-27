import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { fetchUserRows } from '../../src/services/libraryData.js';
import { createGameForm, buildGameUpdate } from '../../src/services/gameForm.js';
import { validateBackup } from '../../src/services/backupValidation.js';
const require = createRequire(import.meta.url);
const { appApi } = require('../../netlify/functions/lib/_appApi.js');
const { allowRequest } = require('../../netlify/functions/lib/_requestSafety.js');

test('paginacija poštuje manji serverski limit', async () => {
  const source = Array.from({ length: 1005 }, (_, id) => ({ id }));
  const offsets = [];
  const database = { from() { return {
    select() { return this; }, eq() { return this; }, order() { return this; },
    range(offset) { offsets.push(offset); return { count: source.length, data: source.slice(offset, offset + 400) }; },
  }; } };
  assert.deepEqual(await fetchUserRows(database, 'games', 'user'), source);
  assert.deepEqual(offsets, [0, 400, 800]);
});

test('paginacija odbija promjenu broja i prekinuti dohvat', async () => {
  let calls = 0;
  const database = { from() { return {
    select() { return this; }, eq() { return this; }, order() { return this; },
    range() { calls++; return { count: calls === 1 ? 2 : 3, data: [{ id: calls }] }; },
  }; } };
  await assert.rejects(fetchUserRows(database, 'games', 'user'), /promijenjeni/);
  const signal = AbortSignal.abort();
  await assert.rejects(fetchUserRows(database, 'games', 'user', { signal }), { name: 'AbortError' });
});

test('obrazac čuva nulu i usklađuje PSN postotak', () => {
  const form = createGameForm({ title: 'Igra', platform: 'PC', play_time: 0, progress_mode: 'trophies_psn', progress_value: 4, progress_total: 4, achievement_percent: 25 });
  assert.equal(form.progress_mode, 'trophies_psn');
  const update = buildGameUpdate(form);
  assert.equal(update.play_time, 0);
  assert.equal(update.achievement_percent, 100);
  assert.equal(createGameForm({ notes: null }).notes, '');
  assert.throws(() => buildGameUpdate({ ...form, play_time: -1 }), /Vrijeme/);
  assert.throws(() => buildGameUpdate({ ...form, progress_value: 5 }), /Napredak/);
  assert.throws(() => buildGameUpdate({ ...form, start_date: '2026-02-01', end_date: '2026-01-01' }), /Datum/);
});

test('backup provjerava verziju i sve veze', () => {
  const data = { version: 1, games: [{ id: 'game', title: 'Igra' }], groups: [{ id: 'group', name: 'Grupa' }], gameGroups: [{ game_id: 'game', group_id: 'group' }] };
  assert.equal(validateBackup(data), data);
  assert.throws(() => validateBackup({ ...data, version: 2 }), /verzija/);
  assert.throws(() => validateBackup({ ...data, gameGroups: [{ game_id: 'foreign-game', group_id: 'group' }] }), /Veze/);
  assert.throws(() => validateBackup({ ...data, gameGroups: [data.gameGroups[0], data.gameGroups[0]] }), /ponovljenu/);
});

test('serverski katalog kodira pretragu i skriva ključ', async () => {
  let target;
  const response = await appApi({ action: 'games', path: '/games', params: { search: 'Ratchet & Clank' } }, null, {
    ip: 'catalog-test', env: { GAMES_API_KEY: 'fixture-secret' }, fetch: async url => { target = new URL(url); return Response.json({ results: [] }); },
  });
  assert.equal(response.status, 200);
  assert.equal(target.searchParams.get('search'), 'Ratchet & Clank');
  assert.equal(target.searchParams.get('key'), 'fixture-secret');
  assert.equal(JSON.stringify(response).includes('fixture-secret'), false);
});

test('proxy odbija druge izvore i prijenos bez prijave', async () => {
  let requests = 0;
  const options = { ip: 'invalid-test', fetch: () => { requests++; throw new Error(); } };
  assert.equal((await appApi({ action: 'games', path: '/games/../../private' }, null, options)).status, 400);
  assert.equal((await appApi({ action: 'news', feed: 'https://private.test' }, null, options)).status, 400);
  assert.equal((await appApi({ action: 'avatar', image: 'AAAA' }, null, options)).status, 401);
  assert.equal(requests, 0);
});

test('prijenos odbija SVG i preveliku sliku', async () => {
  let requests = 0;
  const options = { ip: 'upload-test', env: { VITE_SUPABASE_URL: 'https://supabase.test', VITE_SUPABASE_ANON_KEY: 'anon', IMGBB_API_KEY: 'secret' }, fetch: async () => { requests++; return Response.json({ id: 'upload-test' }); } };
  for (const image of [Buffer.from('<svg onload="alert(1)"/>').toString('base64'), 'A'.repeat(4200001)]) {
    assert.equal((await appApi({ action: 'avatar', image }, 'Bearer fixture', options)).status, 400);
  }
  assert.equal(requests, 2);
});

test('ograničenje zahtjeva odvaja korisnike', () => {
  assert.equal(allowRequest('limit-test:a', 1), true);
  assert.equal(allowRequest('limit-test:a', 1), false);
  assert.equal(allowRequest('limit-test:b', 1), true);
});

test('OG metapodaci ne umeću HTML i čuvaju odgovor', async () => {
  const { default: ogShared } = await import('../../netlify/edge-functions/og-shared.js');
  const originalFetch = globalThis.fetch;
  const originalDeno = globalThis.Deno;
  globalThis.Deno = { env: { get: () => 'fixture-key' } };
  globalThis.fetch = async () => Response.json({ name: '"><script>alert(1)</script>', description_raw: 'Opis & citat "', background_image: 'https://images.test/image.jpg' });
  try {
    const response = await ogShared(new Request('https://gamenote.test/shared?id=123', { headers: { 'user-agent': 'Discordbot' } }), {
      next: async () => new Response('<html><head></head><body></body></html>', { status: 203, headers: { 'content-type': 'text/html', 'x-fixture': 'preserved' } }),
    });
    assert.equal(response.status, 203);
    assert.equal(response.headers.get('x-fixture'), 'preserved');
    const html = await response.text();
    assert.equal(html.includes('<script>'), false);
    assert.ok(html.includes('&quot;&gt;&lt;script&gt;'));
  } finally {
    globalThis.fetch = originalFetch;
    globalThis.Deno = originalDeno;
  }
});
