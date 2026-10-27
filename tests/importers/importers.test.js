import './steam-relay.checks.js';
import './steam-library.checks.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { buildSteamRow, buildSteamPatch } from '../../src/services/steamImport.js';
import { buildPsnRow, buildPsnPatch, buildPsnIndex, matchPsnGame, findPsnTrophyTitle } from '../../src/services/psnImport.js';
import { matchSteamGame } from '../../src/services/steamImport.js';
import { otherPlatforms, relatedGameTitles } from '../../src/services/importerMatching.js';
import { resolveImporterGame } from '../../src/services/importerResolution.js';
import { loadImporterMetadata } from '../../src/services/importerMetadata.js';
import { loadImporterPoster } from '../../src/services/importerPosters.js';
import { importers, existingRow, catalogGame, userId } from './fixtures.js';

const builders = {
  steam: {
    row: (game, extras, achievements = { earned: 1, total: 4 }) => buildSteamRow(userId, game, extras, achievements),
    patch: game => buildSteamPatch(game, null),
    match: (rows, game) => matchSteamGame(rows, game).row,
  },
  psn: {
    row: (game, extras, achievements) => buildPsnRow(userId, achievements ? { ...game, trophiesEarned: achievements.earned, trophiesTotal: achievements.total } : game, extras),
    patch: game => buildPsnPatch(game),
    match: (rows, game) => matchPsnGame(buildPsnIndex(rows), game),
  },
};

for (const provider of importers) {
  test(`${provider.id}: spremljena veza preživi preimenovanje cilja`, () => {
    const target = { ...existingRow(provider), title: 'Moj promijenjeni naslov', website_url: 'https://publisher.test/game', psn_title_id: null, psn_np_communication_id: null };
    const other = { ...target, id: 'other', title: provider.game.name };
    const choice = { mode: 'link', targetId: target.id };
    const resolved = resolveImporterGame([target, other], provider.id, provider.game, choice);
    assert.equal(resolved.row.id, target.id);
    assert.equal(resolved.blocked, false);
    assert.equal(resolved.candidates.find(row => row.id === target.id).title, target.title);
    const foreign = { ...target, platform: provider.id === 'psn' ? 'PC' : 'PlayStation 5' };
    assert.equal(resolveImporterGame([foreign, other], provider.id, provider.game, choice).blocked, true);
    assert.equal(resolveImporterGame([other], provider.id, provider.game, choice).blocked, true);
  });
  test(`${provider.id}: obljetnica traži izbor, a izvorni ID ostaje prvi izbor`, () => {
    const title = 'Genshin Impact 6th Anniversary';
    const game = { ...provider.game, name: title };
    const original = { ...existingRow(provider), title: 'Genshin Impact' };
    const pending = resolveImporterGame([original], provider.id, game);
    assert.equal(pending.blocked, true);
    assert.equal(pending.row, null);
    const linked = resolveImporterGame([original], provider.id, game, { mode: 'link', targetId: original.id });
    assert.equal(linked.row.id, original.id);
    const separate = resolveImporterGame([original], provider.id, game, { mode: 'separate' });
    assert.equal(separate.row, null);
    assert.equal(separate.blocked, false);
    const added = { ...original, id: 'separate', title };
    const repeated = resolveImporterGame([original, added], provider.id, game, { mode: 'separate', entryId: 'separate' });
    assert.equal(repeated.row.id, 'separate');
    const identified = { ...original, website_url: 'https://store.steampowered.com/app/220/', psn_title_id: 'CUSA00001', psn_np_communication_id: 'NPWR00001' };
    assert.equal(resolveImporterGame([identified], provider.id, game).row.id, original.id);
    const foreign = { ...identified, platform: provider.id === 'psn' ? 'PC' : 'PlayStation 5' };
    assert.equal(resolveImporterGame([foreign], provider.id, game).row, null);
    assert.equal(resolveImporterGame([foreign], provider.id, game, { mode: 'link', targetId: foreign.id }).blocked, true);
  });
  test(`${provider.id}: Completed zahtijeva sva postignuća`, () => {
    for (const [achievements, expected] of [
      [{ earned: 4, total: 4 }, 'completed'],
      [{ earned: 3, total: 4 }, 'backlog'],
      [{ earned: 199, total: 200 }, 'backlog'],
      [{ earned: 0, total: 0 }, 'backlog'],
      [{ earned: null, total: null }, 'backlog'],
    ]) {
      for (const extras of [{ status: 'backlog', statusAutomatic: true }, { status: 'completed', statusAutomatic: false }]) {
        const row = builders[provider.id].row(provider.game, extras, achievements);
        assert.equal(row.status, expected);
        assert.equal(row.currently_playing, false);
        if (expected === 'backlog') assert.ok(!row.end_date);
      }
    }
    const row = builders[provider.id].row(provider.game, { status: 'paused', statusAutomatic: false }, { earned: 4, total: 4 });
    assert.equal(row.status, 'paused');
  });
  test(`${provider.id}: svi metapodaci dolaze iz zajedničkog kataloga`, async () => {
    const details = catalogGame(provider);
    const api = {
      matchGame: async () => ({ id: details.id, name: details.name }),
      getGameDetails: async () => details,
      getGameScreenshots: async () => [{ image: 'catalog-screen' }],
      getGameSeries: async () => ({ results: [{ id: 'next', name: 'Nastavak' }] }),
    };
    const metadata = await loadImporterMetadata(api, provider.newName);
    const row = { ...builders[provider.id].row(provider.game, {}), ...metadata };
    assert.equal(row.game_api_id, String(details.id));
    assert.equal(row.image_url, details.background_image);
    assert.equal(row.background_image, details.background_image);
    assert.equal(row.description, details.description_raw);
    assert.equal(row.title, details.name);
    assert.equal(row.publisher, 'Izdavač');
    assert.deepEqual(JSON.parse(row.screenshot_urls), ['catalog-screen']);
    assert.equal(JSON.parse(row.series_games)[0].name, 'Nastavak');
  });
  test(`${provider.id}: nedostupne slike ili serijal ne blokiraju valjane detalje`, async () => {
    const details = catalogGame(provider);
    for (const [screenshotsFail, seriesFail] of [[true, false], [false, true], [true, true]]) {
      const api = {
        matchGame: async () => ({ id: details.id, name: details.name }),
        getGameDetails: async () => details,
        getGameScreenshots: async () => { if (screenshotsFail) throw new Error('Nedostupne snimke'); return [{ image: 'catalog-screen' }]; },
        getGameSeries: async () => { if (seriesFail) throw new Error('Nedostupan serijal'); return { results: [{ id: 'next', name: 'Nastavak' }] }; },
      };
      const metadata = await loadImporterMetadata(api, provider.newName);
      assert.equal(metadata.game_api_id, String(details.id));
      assert.equal(metadata.description, details.description_raw);
      assert.deepEqual(JSON.parse(metadata.screenshot_urls), screenshotsFail ? [] : ['catalog-screen']);
      assert.equal(JSON.parse(metadata.series_games).length, seriesFail ? 0 : 1);
      api.getGameDetails = async () => { throw new Error('Nedostupni detalji'); };
      await assert.rejects(loadImporterMetadata(api, provider.newName), /Nedostupni detalji/);
    }
  });
  test(`${provider.id}: druga platforma je novi unos s informacijom`, () => {
    const row = builders[provider.id].row(provider.game, {});
    const foreign = { ...row, id: 'foreign', platform: provider.id === 'steam' ? 'PlayStation 4' : 'PC' };
    const original = structuredClone(foreign);
    assert.equal(builders[provider.id].match([foreign], provider.game), null);
    assert.deepEqual(otherPlatforms([foreign], provider.newName, row.platform), [foreign.platform]);
    const same = { ...row, id: 'same' };
    assert.equal(builders[provider.id].match([foreign, same], provider.game).id, 'same');
    assert.deepEqual(foreign, original);
  });
  test(`${provider.id}: novi unos čuva odabrana osobna polja`, () => {
    assert.ok(builders[provider.id], 'Novi importer treba dodati u zajedničke provjere.');
    const row = builders[provider.id].row(provider.game, { status: 'playing', rating: 4, notes: 'Moja bilješka' });
    assert.equal(row.user_id, userId);
    assert.equal(row.title, provider.newName);
    assert.equal(row.rating, 4);
    assert.equal(row.status, 'playing');
    assert.equal(row.currently_playing, true);
    assert.equal(row.notes, 'Moja bilješka');
    assert.equal(row.play_time, 2);
    assert.equal(row.progress_value, 1);
    assert.equal(row.progress_total, 4);
    assert.equal(row.achievement_percent, 25);
  });

  test(`${provider.id}: nedostupan napredak i vrijeme ne brišu podatke`, () => {
    const original = existingRow(provider);
    const patch = builders[provider.id].patch(provider.unavailableGame);
    const updated = { ...original, ...patch };
    for (const field of ['title', 'rating', 'notes', 'status', 'platform', 'achievement_percent', 'progress_value', 'progress_total', 'play_time']) {
      assert.equal(updated[field], original[field]);
    }
  });
}

test('promotivni dodatak nije nastavak, DLC ili novo izdanje', () => {
  assert.equal(relatedGameTitles('Genshin Impact', 'Genshin Impact 6th Anniversary'), true);
  assert.equal(relatedGameTitles('Genshin Impact', 'Genshin Impact (Version 6.0)'), true);
  for (const title of ['Genshin Impact 2', 'Genshin Impact DLC', 'Genshin Impact Remastered', 'Genshin Impact Anniversary Edition']) {
    assert.equal(relatedGameTitles('Genshin Impact', title), false);
  }
});

test('Gamenote metapodaci prepoznaju izvorni naziv s obljetnicom', async () => {
  const api = {
    matchGame: async () => ({ id: 'genshin', name: 'Genshin Impact' }),
    getGameDetails: async () => ({ id: 'genshin', name: 'Genshin Impact' }),
    getGameScreenshots: async () => [], getGameSeries: async () => ({ results: [] }),
  };
  const metadata = await loadImporterMetadata(api, 'Genshin Impact 6th Anniversary');
  assert.equal(metadata.title, 'Genshin Impact');
  assert.equal(metadata.game_api_id, 'genshin');
});

test('PSN naziv s obljetnicom zadržava trofeje odgovarajuće platforme', () => {
  const ps4 = { trophyTitleName: 'Genshin Impact', trophyTitlePlatform: 'PS4', npCommunicationId: 'ps4' };
  const ps5 = { ...ps4, trophyTitlePlatform: 'PS5', npCommunicationId: 'ps5' };
  const game = { localizedName: 'Genshin Impact 6th Anniversary', category: 'ps5_native_game' };
  assert.equal(findPsnTrophyTitle(game, [ps4, ps5]), ps5);
  assert.equal(findPsnTrophyTitle(game, [ps4]), null);
  assert.equal(findPsnTrophyTitle(game, [ps5, { ...ps5, npCommunicationId: 'duplicate' }]), null);
});

test('poster koristi katalog prije importa i dijeli isti dohvat', async () => {
  let requests = 0;
  const title = 'Poster fixture';
  const api = {
    matchGame: async () => { requests++; return { id: 'poster', name: title }; },
    getGameDetails: async () => { requests++; return { id: 'poster', name: title, background_image: 'https://catalog.test/poster.jpg' }; },
  };
  const result = await Promise.all([loadImporterPoster(api, title), loadImporterPoster(api, title)]);
  assert.deepEqual(result, ['https://catalog.test/poster.jpg', 'https://catalog.test/poster.jpg']);
  assert.equal(requests, 2);
});

test('nepouzdani i višestruki rezultati ne preuzimaju tuđe metapodatke', async () => {
  let detailsRequests = 0;
  const api = {
    matchGame: async () => ({ id: 'wrong', name: 'Druga igra' }),
    searchGames: async () => ({ results: [{ id: 'a', name: 'Igra' }, { id: 'b', name: 'Igra' }] }),
    getGameDetails: async () => { detailsRequests++; },
  };
  assert.equal(await loadImporterMetadata(api, 'Igra'), null);
  assert.equal(detailsRequests, 0);
});

test('PSN relay odbija nepoznate putove i neprijavljene zahtjeve', async () => {
  const require = createRequire(import.meta.url);
  const { psnRelay } = require('../../netlify/functions/lib/_psnRelay.js');
  assert.equal((await psnRelay('/api/private', 'Bearer test')).status, 403);
  assert.equal((await psnRelay('/api/trophy/v1/test', null)).status, 401);
  assert.equal((await psnRelay('/api/trophy/v1/test', 'Bearer test', { method: 'POST' })).status, 405);
  for (const path of ['/api/trophy/v1/../../private', '/api/trophy/v1/%2e%2e/private', '//evil.test/api/trophy/v1/test', '/api/trophy/v1/..\\private']) {
    assert.equal((await psnRelay(path, 'Bearer test')).status, 403);
  }
});

test('svaka aktivna platforma ima zajedničke fixtures', () => {
  const source = readFileSync(new URL('../../src/views/Importers.vue', import.meta.url), 'utf8');
  const tabs = [...source.matchAll(/<button role="tab"[^>]*@click="activeTab = '(\w+)'"/g)]
    .map(match => match[1]).filter(tab => !['migrate', 'backup', 'refresh'].includes(tab));
  assert.ok(tabs.length >= 2);
  for (const tab of new Set(tabs)) assert.ok(importers.some(provider => provider.id === tab), `Dodaj ${tab} u fixtures.`);
});
