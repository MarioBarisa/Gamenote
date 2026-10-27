import { chromium, expect } from '@playwright/test';
import { createServer } from 'vite';
import { fileURLToPath } from 'node:url';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import { importers, existingRow, catalogGame, sourcePoster, userId, steamId } from './fixtures.js';

const root = fileURLToPath(new URL('../../', import.meta.url));
const cacheDir = await mkdtemp(join(tmpdir(), 'gamenote-importers-'));
const screenshots = process.argv.includes('--screenshots') ? await mkdtemp(join(tmpdir(), 'gamenote-importer-previews-')) : null;
const html = `<!doctype html><html><body><div id="app" class="p-4"></div><script type="module">
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createRouter, createMemoryHistory } from 'vue-router';
import Importers from '/src/views/Importers.vue';
import { useUserStore } from '/src/stores/user.js';
import { supabase } from '/src/supabase.js';
import '/src/assets/main.css';
supabase.auth.getSession = async () => ({ data: { session: { access_token: 'fixture-token', user: { id: '${userId}' } } }, error: null });
const app = createApp(Importers); app.use(createPinia());
app.use(createRouter({ history: createMemoryHistory(), routes: [{ path: '/', component: { template: '<div />' } }, { path: '/library', component: { template: '<div />' } }] }));
useUserStore().setUser({ id: '${userId}' }); app.mount('#app');
</script></body></html>`;

const server = await createServer({
  root, cacheDir, configFile: join(root, 'vite.config.js'),
  server: { host: '127.0.0.1', port: 0, strictPort: false },
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify('https://supabase.importers.test'),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify('fixture-anon-key'),
    'import.meta.env.VITE_RAWG_API_KEY': JSON.stringify('fixture-games-key'),
  },
  plugins: [{ name: 'importer-tests', configureServer(vite) {
    vite.middlewares.use('/importer-tests', async (req, res) => {
      res.setHeader('content-type', 'text/html');
      res.end(await vite.transformIndexHtml('/importer-tests', html));
    });
  } }],
});
let browser;

async function fixturePage(provider, viewport) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  const foreign = { ...existingRow(provider), id: 'other-platform', title: provider.newName, platform: provider.id === 'steam' ? 'PlayStation 4' : 'PC', website_url: 'https://store.steampowered.com/app/220/', psn_title_id: 'CUSA00001', psn_np_communication_id: 'NPWR00001' };
  const state = { rows: [existingRow(provider), foreign], writes: [], libraryFailed: false, insertFailed: false, gameDataMissing: false, earned: 1, total: 4, errors: [] };
  page.on('pageerror', error => state.errors.push(error.message));
  const jwt = `fixture.${Buffer.from(JSON.stringify({ sub: '1234567890', online_id: 'FixturePSN' })).toString('base64url')}.fixture`;
  await context.route('**/*', async route => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.hostname === '127.0.0.1') {
      if (url.pathname === '/.netlify/functions/app-api') {
        const payload = request.postDataJSON();
        const title = payload.params?.title || (payload.path.endsWith('-existing') ? provider.existingName : provider.newName);
        const details = catalogGame(provider, title);
        if (state.catalogCanonicalName && title === provider.newName) details.name = state.catalogCanonicalName;
        if (state.metadataMissing) return route.fulfill({ json: payload.path === '/games/match' ? null : { results: [] } });
        if (payload.path === '/games/match') return route.fulfill({ json: details });
        if (payload.path.endsWith('/screenshots')) return route.fulfill({ json: { results: [{ image: 'https://images.importers.test/catalog-screen.jpg' }] } });
        if (payload.path.endsWith('/game-series')) return route.fulfill({ json: { results: [{ id: 'series-game', name: 'Nastavak' }] } });
        return route.fulfill({ json: details });
      }
      if (url.pathname === '/.netlify/functions/steam') {
        const body = request.postDataJSON();
        if (body.action === 'achievements') return route.fulfill({ json: { achievements: state.gameDataMissing ? null : { earned: state.earned, total: state.total } } });
        if (body.profile === 'private-login-name') return route.fulfill({ status: 404, json: { error: 'Javno Steam ime nije pronađeno. Koristi ime iza /id/, ne ime za prijavu.' } });
        if (state.libraryFailed) return route.fulfill({ status: 403, json: { error: 'Detalji igara nisu javni.' } });
        return route.fulfill({ json: {
          profile: { steamId, name: 'FixtureSteam' },
          games: [{ appid: 220, name: provider.newName, playtime_forever: 125 }, { appid: 620, name: provider.existingName, playtime_forever: 180 }],
        } });
      }
      if (url.pathname === '/.netlify/functions/psn-auth') return route.fulfill({ json: { accessToken: jwt, idToken: jwt, refreshToken: 'fixture-refresh', expiresIn: 3600 } });
      if (url.pathname.startsWith('/.netlify/functions/psn-relay')) {
        if (url.pathname.endsWith('/trophySummary')) return route.fulfill({ json: { trophyLevel: 100 } });
        const trophyTitles = state.gameDataMissing ? [] : [1, 2].map((number) => ({
          trophyTitleName: number === 1 ? provider.newName : provider.existingName,
          npCommunicationId: `NPWR0000${number}`, earnedTrophies: { bronze: state.earned }, definedTrophies: { bronze: state.total }, progress: Math.round(state.earned / state.total * 100),
        }));
        return route.fulfill({ json: { trophyTitles, totalItemCount: trophyTitles.length } });
      }
      return route.continue();
    }
    if (url.hostname === 'supabase.importers.test') {
      if (request.method() === 'OPTIONS') return route.fulfill({ status: 204 });
      if (request.method() === 'GET') return route.fulfill({ json: url.pathname.endsWith('/groups') ? [{ id: 'group-1', name: 'Klasici' }] : state.rows });
      const payload = request.postDataJSON();
      if (request.method() === 'PATCH') {
        assert.equal(url.searchParams.get('user_id'), `eq.${userId}`);
        const id = url.searchParams.get('id')?.replace('eq.', '');
        const row = state.rows.find(row => row.id === id);
        assert.ok(row);
        Object.assign(row, payload);
        state.writes.push({ table: 'games', method: 'PATCH', payload });
        return route.fulfill({ json: [{ id }] });
      }
      const rows = Array.isArray(payload) ? payload : [payload];
      if (url.pathname.endsWith('/game_groups')) {
        state.writes.push({ table: 'game_groups', method: 'POST', payload: rows });
        return route.fulfill({ json: [] });
      }
      if (state.insertFailed) return route.fulfill({ status: 500, json: { message: 'Testna greška uvoza' } });
      const inserted = [];
      for (const row of rows) {
        assert.equal(row.user_id, userId);
        const id = `new-${state.rows.length}`;
        state.rows.push({ ...row, id }); inserted.push({ id });
      }
      state.writes.push({ table: 'games', method: 'POST', payload: rows });
      return route.fulfill({ json: Array.isArray(payload) ? inserted : inserted[0] });
    }
    if (url.hostname === 'm.np.playstation.com') {
      if (url.pathname.includes('/userProfile/')) return route.fulfill({ json: { onlineId: 'FixturePSN', avatars: [] } });
      if (state.libraryFailed) return route.fulfill({ json: { error: { message: 'Testna greška PSN dohvaćanja' } } });
      return route.fulfill({ json: { titles: [1, 2].map(number => ({
        titleId: `CUSA0000${number}`, localizedName: number === 1 ? provider.newName : provider.existingName,
        localizedImageUrl: 'https://images.importers.test/cover.svg',
        category: 'ps4_game', playDuration: 'PT3H',
      })), totalItemCount: 2 } });
    }
    if (url.hostname === 'api.gamenote.eu') return route.fulfill({ json: { results: [] } });
    if (request.resourceType() === 'image') {
      const originalPoster = url.hostname.endsWith('steamstatic.com') || url.pathname.endsWith('/cover.svg');
      if ((state.posterBroken && (originalPoster || url.pathname.endsWith('/catalog-cover.jpg'))) || (state.nativePosterBroken && originalPoster)) return route.fulfill({ status: 404, body: '' });
      return route.fulfill({ contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="180"><rect width="120" height="180" fill="#292566"/><circle cx="60" cy="65" r="28" fill="#776bea"/><text x="60" y="125" text-anchor="middle" fill="white" font-size="18">IGRA</text></svg>' });
    }
    // Test ne smije dohvaćati stvarne servise.
    return route.fulfill({ status: 404, body: '' });
  });
  await page.goto(`${server.resolvedUrls.local[0]}importer-tests`);
  await page.getByRole('tab', { name: provider.tab, exact: true }).click();
  return { page, context, state };
}

async function connect(page, provider) {
  await page.getByRole('button', { name: provider.connectButton, exact: true }).click();
  if (provider.id === 'steam') {
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText(/Ime za prijavu i prikazni nadimak/)).toBeVisible();
    await expect.poll(() => dialog.evaluate(element => getComputedStyle(element).opacity)).toBe('1');
    if (screenshots) await page.screenshot({ path: join(screenshots, `steam-modal-${page.viewportSize().width}.png`), animations: 'disabled' });
    await dialog.getByRole('textbox').fill('CatWarrior99');
    await dialog.getByRole('button', { name: 'Učitaj Steam igre' }).click();
    await expect(dialog).not.toBeVisible();
  } else {
    await page.locator('input[type="password"]').fill('fixture-npsso-abcdefghijklmnopqrstuvwxyz');
    await page.getByRole('button', { name: 'Poveži se', exact: true }).click();
  }
  await expect(page.getByTestId('importer-game-list')).toBeVisible({ timeout: 15000 });
}

try {
  await server.listen();
  browser = await chromium.launch({ headless: true });
  for (const provider of importers) {
    for (const viewport of [{ width: 320, height: 844 }, { width: 390, height: 844 }, { width: 1440, height: 1000 }]) {
      const { page, context, state } = await fixturePage(provider, viewport);
      try {
        if (provider.id === 'steam') state.rows[0].website_url = 'https://publisher.test/game';
        await expect(page.getByTestId(`${provider.id}-connected`)).toBeHidden();
        await connect(page, provider);
        await expect(page.getByTestId(`${provider.id}-connected`)).toBeVisible();
        const layout = page.locator(`[data-layout="${viewport.width < 1024 ? 'mobile' : 'desktop'}"]`).filter({ visible: true });
        const newGame = layout.locator(`[data-game-key="${provider.newKey}"]`);
        const existingGame = layout.locator(`[data-game-key="${provider.existingKey}"]`);
        await expect(newGame).toBeVisible();
        await expect(newGame.getByText('Postoji na drugoj platformi', { exact: true })).toBeVisible();
        const foreignBefore = structuredClone(state.rows[1]);
        await expect(existingGame).toBeVisible();
        for (const [element, title, key] of [[newGame, provider.newName, provider.newKey], [existingGame, provider.existingName, provider.existingKey]]) {
          await element.scrollIntoViewIfNeeded();
          const poster = element.getByRole('img', { name: `Poster igre ${title}`, exact: true });
          await expect(poster).toBeVisible();
          await expect(poster).toHaveAttribute('src', sourcePoster(provider, key));
          await expect.poll(() => poster.evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true);
          const size = await poster.boundingBox();
          assert.ok(Math.abs(size.height / size.width - 1.5) < 0.02);
        }
        await expect(newGame.getByLabel(`Status za ${provider.newName}`, { exact: true })).toHaveValue('backlog');
        await page.evaluate(() => window.scrollTo(0, 0));
        if (screenshots) await page.screenshot({ path: join(screenshots, `${provider.id}-${viewport.width}.png`), fullPage: true, animations: 'disabled' });
        if (viewport.width < 1024) assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
        for (const label of ['Sve nove', 'Poništi nove', 'Sve postojeće', 'Poništi postojeće']) {
          await expect(page.getByRole('button', { name: label, exact: true }).locator('svg')).toBeVisible();
        }
        await page.getByRole('button', { name: 'Informacije o importeru', exact: true }).click();
        const info = page.getByRole('dialog', { name: 'Kako radi importer', exact: true });
        await expect(info).toBeVisible();
        await expect(info.getByText('Metapodaci dolaze iz Gamenote kataloga, posteri prvenstveno s platforme.')).toBeVisible();
        await expect(info.getByText(/Automatski status je Completed/)).toBeVisible();
        await info.getByRole('button', { name: 'Razumijem', exact: true }).click();
        await expect(info).toBeHidden();
        await page.getByRole('button', { name: 'Poništi nove', exact: true }).click();
        await newGame.getByRole('checkbox').check();
        await newGame.getByLabel(`Status za ${provider.newName}`, { exact: true }).selectOption('playing');
        await newGame.getByLabel(`4 od 5 za ${provider.newName}`, { exact: true }).check();
        await newGame.getByLabel(`Grupa za ${provider.newName}`, { exact: true }).selectOption('group-1');
        await newGame.getByLabel(`Bilješka za ${provider.newName}`, { exact: true }).fill('Nova bilješka');
        state.metadataMissing = true;
        await page.getByRole('button', { name: 'Uvezi nove (1)', exact: true }).click();
        await expect(page.getByText(/Nisu dodane igre bez potvrđenog podudaranja/)).toBeVisible();
        assert.equal(state.writes.length, 0);
        state.metadataMissing = false;
        state.insertFailed = true;
        await page.getByRole('button', { name: 'Uvezi nove (1)', exact: true }).click();
        await expect(page.getByText(/Testna greška uvoza/)).toBeVisible();
        assert.equal(state.rows.length, 2);
        state.insertFailed = false;
        await page.getByRole('button', { name: 'Uvezi nove (1)', exact: true }).click();
        await expect(page.getByRole('button', { name: 'Uvezi nove (0)', exact: true })).toBeVisible();
        assert.equal(state.rows.length, 3);
        const row = state.rows.find(row => row.title === provider.newName && row.id !== 'other-platform');
        assert.equal(row.game_api_id, 'catalog-' + provider.id);
        assert.equal(row.image_url, sourcePoster(provider));
        assert.equal(row.background_image, catalogGame(provider).background_image);
        assert.equal(row.description, catalogGame(provider).description_raw);
        assert.equal(row.genre, 'Puzzle'); assert.equal(row.publisher, 'Izdavač');
        assert.deepEqual(JSON.parse(row.screenshot_urls), ['https://images.importers.test/catalog-screen.jpg']);
        assert.equal(JSON.parse(row.series_games)[0].name, 'Nastavak');
        assert.equal(row.status, 'playing'); assert.equal(row.rating, 4); assert.equal(row.notes, 'Nova bilješka');
        assert.equal(state.writes.filter(write => write.table === 'game_groups').length, 1);
        await page.getByRole('button', { name: 'Poništi postojeće', exact: true }).click();
        await existingGame.getByRole('checkbox').check();
        await page.getByRole('button', { name: 'Sinkroniziraj (1)', exact: true }).click();
        await expect.poll(() => state.writes.filter(write => write.method === 'PATCH').length).toBe(1);
        await expect(page.getByTestId('importer-game-list').getByRole('button', { name: /Osvježi/ })).toBeEnabled();
        const existing = state.rows[0];
        assert.equal(existing.rating, 5); assert.equal(existing.notes, 'Sačuvaj bilješku'); assert.equal(existing.status, 'paused');
        assert.equal(existing.progress_value, 1); assert.equal(existing.progress_total, 4);
        if (provider.id === 'steam') {
          assert.equal(existing.website_url, `https://store.steampowered.com/app/${provider.existingKey}/`);
          existing.title = 'Moj promijenjeni naslov';
        }
        await page.getByRole('searchbox', { name: 'Pretraži igre', exact: true }).fill(provider.newName);
        await expect(existingGame).toBeHidden();
        await page.reload();
        await page.getByRole('tab', { name: provider.tab, exact: true }).click();
        await expect(page.getByTestId('importer-game-list')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Uvezi nove (0)', exact: true })).toBeVisible();
        await expect(existingGame.getByText('Postoji', { exact: true })).toBeVisible();
        await expect(page.getByTestId(`${provider.id}-connected`)).toBeVisible();
        const other = importers.find(item => item.id !== provider.id);
        await page.getByRole('tab', { name: other.tab, exact: true }).click();
        await expect(page.getByTestId(`${provider.id}-connected`)).toBeVisible();
        await page.getByRole('tab', { name: provider.tab, exact: true }).click();
        await page.getByRole('button', { name: 'Odspoji', exact: true }).click();
        await expect(page.getByTestId(`${provider.id}-connected`)).toBeHidden();
        await expect(page.getByRole('button', { name: provider.connectButton, exact: true })).toBeVisible();
        assert.equal(state.rows.length, 3);
        assert.deepEqual(state.rows[1], foreignBefore);
        assert.deepEqual(state.errors, []);
        console.log(`✓ ${provider.id} ${viewport.width}px: povezivanje, prikaz, unos, grupe, greška, sync, pretraga, cache, odspajanje`);
      } finally {
        await context.close();
      }
    }
  }
  for (const provider of importers) {
    const { page, context, state } = await fixturePage(provider, { width: 390, height: 844 });
    try {
      state.earned = 4;
      state.posterBroken = true;
      await connect(page, provider);
      const game = page.locator('[data-layout="mobile"]').locator(`[data-game-key="${provider.newKey}"]`);
      await game.scrollIntoViewIfNeeded();
      await expect(game.getByRole('img', { name: `Poster nije dostupan za ${provider.newName}`, exact: true })).toBeVisible();
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      if (provider.id === 'psn') await expect(game.getByLabel(`Status za ${provider.newName}`, { exact: true })).toHaveValue('completed');
      await page.getByRole('button', { name: 'Sve nove', exact: true }).click();
      await page.getByRole('button', { name: 'Uvezi nove (1)', exact: true }).click();
      await expect(page.getByRole('button', { name: 'Uvezi nove (0)', exact: true })).toBeVisible();
      const added = state.rows.find(row => row.id !== 'other-platform' && row.title === provider.newName);
      assert.equal(added.status, 'completed');
      assert.equal(added.achievement_percent, 100);
      assert.deepEqual(state.errors, []);
      console.log(`✓ ${provider.id}: 100% postignuća daje Completed, nedostupan poster čuva prikaz`);
    } finally {
      await context.close();
    }
  }
  for (const original of importers) {
    const provider = { ...original, newName: 'Genshin Impact 6th Anniversary', existingName: 'Genshin Impact' };
    for (const mode of ['link', 'separate']) {
      const viewport = mode === 'link' ? { width: 320, height: 844 } : { width: 1440, height: 1000 };
      const { page, context, state } = await fixturePage(provider, viewport);
      try {
        state.catalogCanonicalName = 'Genshin Impact';
        await connect(page, provider);
        const layoutName = viewport.width < 1024 ? 'mobile' : 'desktop';
        const game = page.locator(`[data-layout="${layoutName}"]`).locator(`[data-game-key="${provider.newKey}"]`);
        await expect(game.getByRole('checkbox')).toBeDisabled();
        const choice = game.getByLabel(`Prepoznavanje za ${provider.newName}`, { exact: true });
        await expect(choice).toHaveValue('');
        await choice.scrollIntoViewIfNeeded();
        if (screenshots) await page.screenshot({ path: join(screenshots, `${provider.id}-genshin-${mode}.png`), fullPage: true, animations: 'disabled' });
        const selected = mode === 'link' ? 'link:existing-game' : 'separate';
        await choice.selectOption(selected);
        await expect(game.getByRole('checkbox')).toBeEnabled();
        if (mode === 'link') {
          await page.getByRole('button', { name: 'Poništi postojeće', exact: true }).click();
          await game.getByRole('checkbox').check();
          await page.getByRole('button', { name: 'Sinkroniziraj (1)', exact: true }).click();
          await expect.poll(() => state.writes.filter(write => write.method === 'PATCH').length).toBe(1);
          assert.equal(state.rows.length, 2);
          assert.equal(state.rows[0].title, 'Genshin Impact');
          assert.equal(state.rows[0].notes, 'Sačuvaj bilješku');
          assert.equal(state.rows[0].rating, 5);
        } else {
          await page.getByRole('button', { name: 'Uvezi nove (1)', exact: true }).click();
          await expect(page.getByRole('button', { name: 'Uvezi nove (0)', exact: true })).toBeVisible();
          assert.equal(state.rows.length, 3);
          const added = state.rows.find(row => row.id !== 'other-platform' && row.title === provider.newName);
          assert.ok(added);
          assert.equal(added.game_api_id, 'catalog-' + provider.id);
          assert.equal(state.rows[0].title, 'Genshin Impact');
        }
        await page.reload();
        await page.getByRole('tab', { name: provider.tab, exact: true }).click();
        await expect(choice).toHaveValue(selected);
        await expect(page.getByRole('button', { name: 'Uvezi nove (0)', exact: true })).toBeVisible();
        assert.equal(state.writes.filter(write => write.method === 'POST' && write.table === 'games').length, mode === 'link' ? 0 : 1);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
        assert.deepEqual(state.errors, []);
        console.log(`✓ ${provider.id}: Genshin ${mode}, izvorni naslov i izbor ostaju sačuvani nakon ponovnog otvaranja`);
      } finally {
        await context.close();
      }
    }
    const { page, context, state } = await fixturePage(original, { width: 390, height: 844 });
    try {
      state.nativePosterBroken = true;
      await connect(page, original);
      const game = page.locator('[data-layout="mobile"]').locator(`[data-game-key="${original.newKey}"]`);
      await game.scrollIntoViewIfNeeded();
      const poster = game.getByRole('img', { name: `Poster igre ${original.newName}`, exact: true });
      await expect(poster).toHaveAttribute('src', catalogGame(original).background_image);
      await expect.poll(() => poster.evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true);
      assert.deepEqual(state.errors, []);
      console.log(`✓ ${original.id}: Gamenote poster zamjenjuje nedostupan izvorni poster`);
    } finally {
      await context.close();
    }
  }
  const provider = importers.find(provider => provider.id === 'steam');
  const { page, context, state } = await fixturePage(provider, { width: 390, height: 844 });
  try {
    await page.getByRole('button', { name: provider.connectButton, exact: true }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('textbox').fill('private-login-name');
    await dialog.getByRole('button', { name: 'Učitaj Steam igre' }).click();
    await expect(dialog.getByRole('alert')).toContainText('ime za prijavu');
    state.libraryFailed = true;
    await dialog.getByRole('textbox').fill('https://steamcommunity.com/id/CatWarrior99/');
    await dialog.getByRole('button', { name: 'Učitaj Steam igre' }).click();
    await expect(dialog.getByRole('alert')).toContainText('nisu javni');
    assert.equal(state.writes.length, 0);
    await dialog.getByRole('button', { name: 'Odustani' }).click();
    await expect(dialog).toBeHidden();
    console.log('✓ Steam: privatno ime i privatna biblioteka imaju jasne upute u modalu');
  } finally {
    await context.close();
  }
  if (screenshots) console.log(`Pregled snimki: ${screenshots}`);
} finally {
  await browser?.close();
  await server.close();
  await rm(cacheDir, { recursive: true, force: true });
}
