import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import daisyThemes from 'daisyui/theme/object';
import { fetchUserRows } from '../../src/services/libraryData.js';
import { createGameForm, buildGameUpdate } from '../../src/services/gameForm.js';
import { validateBackup } from '../../src/services/backupValidation.js';
import { getGamerCardStats, PLAYER_TITLES } from '../../src/services/gamerCard.js';
import { getProfileAchievements } from '../../src/services/profileAchievements.js';
import { cardDisplayPalette, CARD_THEMES, signatureForGenre, cardColorValue, loadCardColor, saveCardColor, loadCardTheme, saveCardTheme } from '../../src/services/cardAppearance.js';
const require = createRequire(import.meta.url);
const { appApi } = require('../../netlify/functions/lib/_appApi.js');
const { allowRequest } = require('../../netlify/functions/lib/_requestSafety.js');
const { avatarImage } = require('../../netlify/functions/lib/_avatarImage.js');
const { publicAddress, publicImageUrl, publicImageAddresses } = require('../../netlify/functions/lib/_publicImage.js');

test('postignuća koriste pragove mobilne aplikacije', () => {
  assert.equal(getProfileAchievements([]).some(achievement => achievement.unlocked), false);
  const achievement = (games, id) => getProfileAchievements(games).find(item => item.id === id);
  assert.equal(achievement([{}], 'beginner').unlocked, true);
  assert.equal(achievement(Array.from({ length: 49 }, () => ({})), 'collector').unlocked, false);
  assert.equal(achievement(Array.from({ length: 50 }, () => ({})), 'collector').unlocked, true);
  const completed = Array.from({ length: 24 }, () => ({ status: 'completed' }));
  assert.equal(achievement([...completed, { status: 'playing' }], 'completion').unlocked, false);
  assert.equal(achievement([...completed, { status: 'completed' }], 'completion').unlocked, true);
  for (const [id, hours] of [['speed', 100], ['hardcore', 1000], ['legend', 3000]]) {
    assert.equal(achievement([{ play_time: hours - 0.5 }], id).unlocked, false);
    assert.equal(achievement([{ play_time: hours / 2 }, { play_time: String(hours / 2) }], id).unlocked, true);
  }
  const topRated = Array.from({ length: 9 }, () => ({ rating: 5 }));
  assert.equal(achievement([...topRated, { rating: 4.9 }, { rating: 6 }], 'goty').unlocked, false);
  assert.equal(achievement([...topRated, { rating: '5', status: 'backlog' }], 'goty').unlocked, true);
});

test('Platinum zahtijeva sva ostala postignuća, uključujući GOTY', () => {
  const games = Array.from({ length: 50 }, (_, index) => ({
    status: index < 25 ? 'completed' : 'backlog',
    rating: index < 10 ? 5 : null,
    play_time: 60,
  }));
  const platinum = games => getProfileAchievements(games).find(achievement => achievement.id === 'platinum').unlocked;
  assert.equal(getProfileAchievements(games).length, 8);
  assert.equal(platinum(games), true);
  assert.equal(platinum(games.slice(0, 49)), false);
  assert.equal(platinum(games.map((game, index) => index === 24 ? { ...game, status: 'playing' } : game)), false);
  assert.equal(platinum(games.map((game, index) => index === 0 ? { ...game, play_time: 59 } : game)), false);
  assert.equal(platinum(games.map((game, index) => index === 0 ? { ...game, rating: 4 } : game)), false);
});

test('dohvat profilne slike traži sesiju i vraća sliku za izvoz', async () => {
  const bytes = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64');
  const options = {
    ip: 'card-avatar-test',
    env: { VITE_SUPABASE_URL: 'https://supabase.test', VITE_SUPABASE_ANON_KEY: 'anon' },
    fetch: async url => {
      if (url.endsWith('/auth/v1/user')) return Response.json({ id: 'card-avatar-user' });
      throw new Error('Vanjske slike imaju zaseban dohvat');
    },
    fetchImage: async (url, init) => {
      assert.equal(url, 'https://i.ibb.co/fixture/avatar.png');
      assert.equal(init.redirect, 'manual');
      return new Response(bytes, { headers: { 'content-type': 'image/png' } });
    },
  };
  const payload = { action: 'avatar-image', url: 'https://i.ibb.co/fixture/avatar.png' };
  assert.equal((await appApi(payload, null, options)).status, 401);
  const result = await appApi(payload, 'Bearer fixture', options);
  assert.equal(result.status, 200);
  assert.equal(result.data.image, `data:image/png;base64,${bytes.toString('base64')}`);
});

test('profilna podržava oba ImgBB hosta i provjerava svako preusmjeravanje', async () => {
  const png = Buffer.from('89504e470d0a1a0a', 'hex');
  const calls = [];
  const result = await avatarImage('https://i.ibb.co/fixture/avatar.png', async url => {
    calls.push(url);
    if (calls.length === 1) return new Response(null, { status: 302, headers: { location: 'https://i.ibb.co.com/fixture/avatar.png' } });
    return new Response(png, { headers: { 'content-type': 'image/png' } });
  });
  assert.equal(result.status, 200);
  assert.deepEqual(calls, ['https://i.ibb.co/fixture/avatar.png', 'https://i.ibb.co.com/fixture/avatar.png']);
  let requests = 0;
  const rejected = await avatarImage('https://i.ibb.co/fixture/avatar.png', async () => {
    requests++;
    return new Response(null, { status: 302, headers: { location: 'https://127.0.0.1/private' } });
  });
  assert.equal(rejected.status, 502);
  assert.equal(requests, 1);
});

test('profilna prihvaća proizvoljan javni URL slike', async () => {
  const result = await avatarImage('https://photos.example.org/users/portrait.png', async url => {
    assert.equal(url, 'https://photos.example.org/users/portrait.png');
    return new Response(Buffer.from('89504e470d0a1a0a', 'hex'), { headers: { 'content-type': 'image/png' } });
  });
  assert.equal(result.status, 200);
  assert.ok(publicImageUrl('http://photos.example.org/users/portrait.png'));
});

test('DNS slike odbija privatne i miješane IP adrese', async () => {
  for (const ip of ['127.0.0.1', '10.1.2.3', '100.64.1.2', '169.254.1.2', '172.16.1.2', '192.168.1.2', '198.18.1.2', '0.0.0.0', '::1', '::', '::ffff:127.0.0.1', 'fc00::1', 'fe80::1', '2001:db8::1', '2002:7f00:1::']) assert.equal(publicAddress(ip), false, ip);
  for (const ip of ['1.1.1.1', '8.8.8.8', '2606:4700:4700::1111']) assert.equal(publicAddress(ip), true, ip);
  const url = new URL('https://photos.example.org/portrait.png');
  await assert.rejects(publicImageAddresses(url, async () => [{ address: '1.1.1.1', family: 4 }, { address: '127.0.0.1', family: 4 }]), /nije javna/);
  assert.deepEqual(await publicImageAddresses(url, async () => [{ address: '1.1.1.1', family: 4 }]), [{ address: '1.1.1.1', family: 4 }]);
});

test('boja kartice čuva se po korisniku i prilagođava tekst', () => {
  const original = globalThis.localStorage;
  const saved = new Map();
  globalThis.localStorage = { getItem: key => saved.get(key), setItem: (key, value) => saved.set(key, value) };
  try {
    saveCardColor('user-a', '#174b92');
    assert.equal(loadCardColor('user-a'), '#174b92');
    assert.equal(loadCardColor('user-b'), 'signature');
    saveCardColor('user-a', 'url(https://invalid.test)');
    assert.equal(loadCardColor('user-a'), '#174b92');
    saveCardColor('user-a', 'signature');
    assert.equal(loadCardColor('user-a'), 'signature');
    for (const theme of CARD_THEMES) {
      saveCardColor('user-a', theme.value);
      assert.equal(loadCardColor('user-a'), theme.value);
      assert.equal(cardColorValue(theme.value, 'Action'), theme.color);
    }
    saved.set('gamenote.gamercard.color.user-a', 'auto');
    assert.equal(loadCardColor('user-a'), 'signature');
    saveCardTheme('user-a', 'theme:dim');
    assert.equal(loadCardTheme('user-a'), 'theme:dim');
    assert.equal(loadCardTheme('user-b'), '');
    saveCardColor('user-a', '#abcdef');
    assert.equal(loadCardTheme('user-a'), 'theme:dim');
  } finally { globalThis.localStorage = original; }
});

test('Gamenote signature bira daisyUI paletu prema omiljenom žanru', () => {
  assert.equal(signatureForGenre('Action').label, 'Autumn');
  assert.equal(signatureForGenre('RPG').label, 'Dracula');
  for (const genre of ['Horror', 'horor', 'Survival Horror']) assert.equal(signatureForGenre(genre).label, 'Halloween');
  assert.equal(signatureForGenre('  aDvEnTuRe  ').label, 'Dim');
  assert.equal(signatureForGenre('Strategy').label, 'Night');
  for (const genre of ['Puzzle', 'Funny', 'Edu', 'Educational']) assert.equal(signatureForGenre(genre).label, 'Winter');
  for (const genre of ['Indie', 'Arcade', 'Party', 'Gacha']) assert.equal(signatureForGenre(genre).label, 'Cyberpunk');
  assert.equal(signatureForGenre('Music').label, 'Synthwave');
  assert.equal(signatureForGenre('').label, 'Sunset');
  assert.equal(signatureForGenre('Unknown genre').label, 'Sunset');
  assert.equal(cardColorValue('signature', 'Action'), signatureForGenre('Action').color);
  assert.equal(cardColorValue('#abcdef', 'Action'), '#abcdef');
});

test('titule napreduju i nakon 500 sati', () => {
  const titles = new Set();
  for (let index = 0; index < PLAYER_TITLES.length; index++) {
    const tier = PLAYER_TITLES[index];
    assert.equal(getGamerCardStats([{ play_time: tier.hours }]).level, tier.label);
    if (index > 0) assert.equal(getGamerCardStats([{ play_time: tier.hours - 0.1 }]).level, PLAYER_TITLES[index - 1].label);
    titles.add(tier.label);
  }
  assert.equal(titles.size, 10);
  assert.equal(getGamerCardStats([{ play_time: 2500 }]).level, 'Spirit guide');
  assert.equal(getGamerCardStats([{ play_time: 5000 }]).level, 'Archon');
  assert.equal(getGamerCardStats([{ play_time: 10000 }]).level, 'Professional');
  assert.equal(getGamerCardStats([{ play_time: 20000 }]).level, 'Oblivion caster');
  assert.notEqual(getGamerCardStats([{ play_time: 500 }]).level, getGamerCardStats([{ play_time: 10000 }]).level);
});

test('svih 35 paleta koristi isključivo izvorne daisyUI tokene', () => {
  assert.equal(CARD_THEMES.length, Object.keys(daisyThemes).length);
  for (const theme of CARD_THEMES) {
    const original = daisyThemes[theme.value.slice(6)];
    const palette = cardDisplayPalette(theme.value, 'Action');
    assert.deepEqual(palette, {
      background: original['--color-base-100'],
      foreground: original['--color-base-content'],
      surface: original['--color-base-200'],
      surfaceContent: original['--color-base-content'],
      watermark: original['--color-base-300'],
      primary: original['--color-primary'],
      primaryContent: original['--color-primary-content'],
      secondary: original['--color-secondary'],
      accent: original['--color-accent'],
      success: original['--color-success'],
      info: original['--color-info'],
    });
    assert.ok(new Set(Object.values(palette)).size >= 4);
  }
  assert.equal(cardDisplayPalette('signature', 'Adventure').background, daisyThemes.dim['--color-base-100']);
  assert.equal(cardDisplayPalette('signature', 'Puzzle').background, daisyThemes.pastel['--color-base-100']);
  assert.equal(cardDisplayPalette('theme:cyberpunk', 'RPG').background, daisyThemes.cyberpunk['--color-base-100']);
});

test('dohvat profilne slike odbija lokalne adrese i aktivni sadržaj', async () => {
  for (const url of ['file:///etc/passwd', 'http://localhost/a.png', 'http://0x7f000001/a.png', 'http://2130706433/a.png', 'https://i.ibb.co@127.0.0.1/a.png', 'https://user:pass@example.org/a.png', 'http://169.254.169.254/latest/', 'https://[::1]/a.png', 'https://[::ffff:127.0.0.1]/a.png', 'http://192.168.1.2/a.png', 'data:image/png;base64,AA']) {
    const result = await avatarImage(url, () => { throw new Error('Nedopušten vanjski poziv'); });
    assert.equal(result.status, 400);
  }
  for (const type of ['text/html', 'image/svg+xml', 'image/png']) {
    const result = await avatarImage('https://i.ibb.co/fixture/avatar.png', async () => new Response('<svg onload="alert(1)"/>', { headers: { 'content-type': type } }));
    assert.notEqual(result.status, 200);
  }
});

test('dohvat profilne slike prekida prevelik stream', async () => {
  let cancelled = false;
  const body = new ReadableStream({
    start(controller) {
      controller.enqueue(new Uint8Array(2 * 1024 * 1024));
      controller.enqueue(new Uint8Array(2 * 1024 * 1024));
    },
    cancel() { cancelled = true; },
  });
  const result = await avatarImage('https://i.ibb.co/fixture/avatar.png', async () => new Response(body, { headers: { 'content-type': 'image/png' } }));
  assert.equal(result.status, 413);
  assert.equal(cancelled, true);
});

test('kartica računa sate, omiljene podatke i statuse', () => {
  const stats = getGamerCardStats([
    { title: 'A', play_time: '12.5', genre: 'RPG, RPG,  ', status: 'completed' },
    { title: 'B', play_time: 30, genre: 'RPG, Action', status: 'playing' },
    { title: 'C', play_time: -10, genre: '  ', status: 'playing' },
    { title: 'D', play_time: 'invalid', status: 'wishlist' },
  ]);
  assert.equal(stats.hours, 42.5);
  assert.equal(stats.total, 4);
  assert.equal(stats.completed, 1);
  assert.equal(stats.playing, 2);
  assert.equal(stats.completionRate, 25);
  assert.equal(stats.favoriteGame.title, 'B');
  assert.deepEqual(stats.favoriteGenre, { name: 'RPG', count: 2 });
  assert.equal(stats.dominant.label, 'Playing');
});

test('kartica ima prazno stanje i prepoznaje vodeći status', () => {
  const empty = getGamerCardStats([]);
  assert.equal(empty.completionRate, 0);
  assert.equal(empty.favoriteGame, null);
  assert.equal(empty.favoriteGenre, null);
  assert.equal(empty.dominant, null);
  assert.equal(getGamerCardStats([{ title: 'Bez sati', play_time: 0 }]).favoriteGame, null);
  for (const status of ['backlog', 'playing', 'completed', 'paused', 'dropped', 'wishlist']) {
    const stats = getGamerCardStats([{ status }]);
    assert.equal(stats.dominant.key, status);
  }
  const tied = getGamerCardStats([{ status: 'completed' }, { status: 'playing' }]);
  assert.equal(tied.dominant.label, 'Playing');
});

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
      next: async () => new Response('<html lang="hr"><head></head><body></body></html>', { status: 203, headers: { 'content-type': 'text/html', 'x-fixture': 'preserved' } }),
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
