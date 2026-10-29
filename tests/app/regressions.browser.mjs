import { createRequire } from 'node:module';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { startupHtml, checkAuthStartup } from './authStartup.browser.mjs';
import { checkCardContrast } from './cardContrast.browser.mjs';
const cardArtifacts = await mkdtemp(join(tmpdir(), 'gamenote-card-preview-'));
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
const { createServer } = await import(require.resolve('vite'));
const { chromium, expect } = require('@playwright/test');
const { appApi } = require('../../netlify/functions/lib/_appApi.js');
const avatarPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64');
const cacheDir = await mkdtemp(join(tmpdir(), 'gamenote-audit-cache-'));
const html = `<!doctype html><html lang="hr"><body><div id="app"></div><script type="module">
import {createApp,ref,h} from 'vue'; import {createPinia} from 'pinia'; import {RouterView} from 'vue-router';
import App from '/src/App.vue'; import router from '/src/router/index.js'; import {useUserStore} from '/src/stores/user.js'; import {supabase} from '/src/supabase.js';
import '/src/assets/main.css';
window.auditSession={user:{id:'user-a',email:'fixture@example.test'},access_token:'fixture'};
const listeners=new Set(); supabase.auth.getSession=async()=>({data:{session:window.auditSession},error:null});
supabase.auth.onAuthStateChange=cb=>{listeners.add(cb);queueMicrotask(()=>cb('INITIAL_SESSION',window.auditSession));return{data:{subscription:{unsubscribe:()=>listeners.delete(cb)}}}};
window.emitAuth=(event)=>{for(const cb of listeners)cb(event,window.auditSession)};
const smoke=new URLSearchParams(location.search).has('smoke');const app=createApp(smoke?App:{setup(){const view=ref();window.auditView=()=>view.value;return()=>h(RouterView,null,{default:({Component})=>Component?h(Component,{ref:view}):null})}});
app.use(createPinia()); app.use(router); const store=useUserStore();store.setUser(window.auditSession.user);
window.auditStore=store; window.auditRouter=router; window.auditDb=supabase;app.mount('#app');window.auditReady=true;
</script></body></html>`;
const server = await createServer({
  root: process.cwd(),
  configFile: join(process.cwd(), 'vite.config.js'),
  cacheDir,
  server: { host: '127.0.0.1', port: 0 },
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(
      'https://supabase.audit.test',
    ),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify('fixture'),
    'import.meta.env.VITE_RAWG_API_KEY': JSON.stringify('fixture'),
  },
  plugins: [
    {
      name: 'audit',
      configureServer(vite) {
        vite.middlewares.use('/__startup', async (req, res) => {
          res.setHeader('content-type', 'text/html');
          res.end(await vite.transformIndexHtml('/__startup', startupHtml));
        });
        vite.middlewares.use('/__audit', async (req, res) => {
          res.setHeader('content-type', 'text/html');
          res.end(await vite.transformIndexHtml('/__audit', html));
        });
      },
    },
  ],
});
let browser;
const findings = [];
try {
  await server.listen();
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', (failure) => pageErrors.push(failure.message));
  const base = {
    user_id: 'user-a',
    platform: 'PC',
    title: 'Game A',
    notes: 'Note A',
    publisher: null,
    genre: null,
    rating: 5,
    start_date: '2024-01-01T00:00:00',
    end_date: null,
    status: 'playing',
    progress_mode: 'pokedex',
    progress_value: 1,
    progress_total: 4,
    achievement_percent: 25,
    series_games: '[]',
    screenshot_urls: '[]',
    created_at: '2024-01-01T00:00:00',
  };
  let rows = [
    { ...base, id: 'a' },
    {
      ...base,
      id: 'b',
      title: 'Game B',
      status: 'wishlist',
      notes: null,
      start_date: null,
      rating: null,
      publisher: null,
    },
  ];
  let writes = [];
  let insertNumber = 0;
  let failSecondInsert = false;
  let searchUrl;
  const avatarRequests = [];
  let failAvatarProxy = false;
  await context.route('**/*', async (route) => {
    const req = route.request(),
      url = new URL(req.url());
    if (url.hostname === 'avatar.invalid' || url.hostname === 'i.ibb.co' || url.hostname === 'i.ibb.co.com' || url.hostname === 'photos.example.org' || url.hostname === 'i.pinimg.com') {
      if (req.headers().origin) return route.abort();
      if (url.pathname.includes('/missing')) return route.abort();
      return route.fulfill({ contentType: 'image/png', body: avatarPng });
    }
    if (url.hostname === '127.0.0.1') {
      if (url.pathname === '/.netlify/functions/app-api') {
        searchUrl = req.postDataJSON();
        if (searchUrl.action === 'avatar-image') {
          avatarRequests.push(searchUrl.url);
          if (failAvatarProxy) return route.fulfill({ status: 502, json: { error: 'Testni prekid dohvata slike.' } });
          const result = await appApi(searchUrl, req.headers().authorization, {
            ip: 'browser-avatar-fixture',
            env: { VITE_SUPABASE_URL: 'https://supabase.audit.test', VITE_SUPABASE_ANON_KEY: 'fixture' },
            fetch: async target => {
              if (target.endsWith('/auth/v1/user')) return Response.json({ id: 'avatar-browser-user' });
              throw new Error('Vanjske slike imaju zaseban dohvat');
            },
            fetchImage: async target => {
              assert.ok(['i.ibb.co', 'i.ibb.co.com', 'photos.example.org', 'i.pinimg.com'].includes(new URL(target).hostname));
              return new Response(avatarPng, { headers: { 'content-type': 'image/png' } });
            },
          });
          return route.fulfill({ status: result.status, json: result.data });
        }
        if (searchUrl.path === '/games/match') {
          const title = searchUrl.params.title;
          return route.fulfill({
            json: { id: Buffer.from(title).toString('base64url'), name: title },
          });
        }
        if (
          searchUrl.path.startsWith('/games/') &&
          !/screenshots|game-series/.test(searchUrl.path)
        ) {
          const id = searchUrl.path.slice(7);
          return route.fulfill({
            json: {
              id,
              name: Buffer.from(id, 'base64url').toString(),
              description_raw: 'Opis iz kataloga',
            },
          });
        }
        return route.fulfill({ json: { results: [] } });
      }
      return route.continue();
    }
    if (url.hostname === 'supabase.audit.test') {
      const table = url.pathname.split('/').pop();
      if (req.method() === 'GET') {
        if (table === 'games') {
          const id = url.searchParams.get('id')?.replace('eq.', '');
          const start = Number(url.searchParams.get('offset') || 0);
          const owner = url.searchParams.get('user_id')?.replace('eq.', '');
          const owned = owner
            ? rows.filter((row) => row.user_id === owner)
            : rows;
          const data = id
            ? owned.find((r) => r.id === id)
            : owned.slice(
                start,
                start +
                  Math.min(1000, Number(url.searchParams.get('limit') || 1000)),
              );
          return route.fulfill({
            json: data,
            headers: {
              'content-range': `0-${Math.max(0, (data?.length || 1) - 1)}/${owned.length}`,
            },
          });
        }
        if (table === 'groups') {
          const id = url.searchParams.get('id')?.replace('eq.', '');
          return route.fulfill({
            json: id
              ? { id, name: 'Group ' + id, rating: 4 }
              : [{ id: 'g1', name: 'Group g1' }],
          });
        }
        if (table === 'game_groups')
          return route.fulfill({
            json: [
              {
                id: 'link-1',
                group_id: 'g1',
                game_id: 'a',
                groups: { id: 'g1', name: 'Group g1' },
                games: rows[0],
              },
            ],
          });
        return route.fulfill({ json: [] });
      }
      const data = req.postDataJSON();
      writes.push({ method: req.method(), table, data });
      if (req.method() === 'PATCH') {
        const id = url.searchParams.get('id')?.replace('eq.', '');
        Object.assign(rows.find((r) => r.id === id) || {}, data);
        return route.fulfill({ json: [{ id }] });
      }
      if (req.method() === 'POST' && table === 'games') {
        insertNumber++;
        if (failSecondInsert && insertNumber === 2)
          return route.fulfill({
            status: 500,
            json: { message: 'fixture second batch failure' },
          });
        const list = Array.isArray(data) ? data : [data];
        const inserted = list.map((r, i) => ({
          ...r,
          id: 'inserted-' + rows.length + '-' + i,
        }));
        rows.push(...inserted);
        return route.fulfill({ json: inserted.map((r) => ({ id: r.id })) });
      }
      return route.fulfill({ json: [] });
    }
    if (url.hostname === 'api.gamenote.eu') {
      searchUrl = url.toString();
      return route.fulfill({ json: { results: [] } });
    }
    return route.fulfill({ json: { results: [], items: [], status: 'ok' } });
  });
  await page.goto(server.resolvedUrls.local[0] + '__audit');
  await page.waitForFunction(() => window.auditReady);
  const navigate = async (path) => {
    await page.evaluate((path) => window.auditRouter.push(path), path);
  };
  const originalRows = rows;
  rows = [
    { ...base, id: 'card-a', title: 'The Legend of Zelda: Tears of the Kingdom', play_time: 183.5, genre: 'Adventure, RPG', status: 'completed' },
    { ...base, id: 'card-b', title: 'Hades', play_time: 74, genre: 'Action, RPG', status: 'completed' },
    { ...base, id: 'card-c', title: 'Stardew Valley', play_time: 42.5, genre: 'RPG', status: 'playing' },
  ];
  await page.evaluate(() => {
    window.auditStore.user.user_metadata = { name: 'Leo', avatar_url: 'https://i.ibb.co/fixture/avatar.png' };
    window.auditStore.user.created_at = '2024-01-01T00:00:00Z';
  });
  await navigate('/profile');
  const card = page.locator('#gaming-card');
  await expect(card).toBeVisible();
  await expect(card).toContainText('Leo');
  await expect(card).toContainText('300');
  const achievementCards = page.locator('.profile-achievements .grid > div');
  await expect(achievementCards).toHaveCount(8);
  await expect(achievementCards.locator('svg[fill="currentColor"]')).toHaveCount(8);
  await expect(achievementCards.locator('svg[stroke]')).toHaveCount(0);
  await expect(achievementCards.filter({ hasText: 'Gamenote Platinum' })).toContainText('100% Gamenote Completion');
  await expect(achievementCards.filter({ hasText: 'GOTY enjoyer' })).toContainText('10+ igara s ocjenom 5/5');
  await expect(card).toContainText('Iskusni igrač');
  await expect(card.getByText('Gamenote', { exact: true })).toHaveCount(0);
  await expect(card.getByText('gamenote.eu', { exact: true }).locator('..').locator('svg')).toHaveAttribute('viewBox', '0 0 896 722');
  const metricColors = await card.locator('.card-metric text:first-child').evaluateAll(texts => texts.map(text => text.getAttribute('fill')));
  const expectedColors = await page.evaluate(async () => {
    const { signatureForGenre } = await import('/src/services/cardAppearance.js');
    const theme = signatureForGenre('RPG');
    return [theme.primary, theme.success, theme.info];
  });
  assert.deepEqual(metricColors, expectedColors, 'Brojevi koriste primary, success i info');
  await expect(card.locator('.card-playtime')).toContainText('300');
  await expect(card.locator('.card-summary')).not.toContainText('Sati igranja');
  await expect(card.locator('.card-summary rect')).toHaveCount(0);
  await expect(card.locator('.card-summary .card-metric')).toHaveCount(3);
  await expect(card.getByText('Udio Completed', { exact: true })).toHaveCount(0);
  await expect(card.locator('.card-metric').last()).toContainText('Playing');
  await expect(card.locator('.card-metric').last().locator('text').first()).toHaveText('1');
  await expect(card.getByText('3 igara u biblioteci', { exact: true })).toHaveCount(0);

  await expect(card).not.toContainText('Completed · 2 igara');
  await expect(card.locator('.card-email')).toHaveText('fixture@example.test');
  await expect(card.locator('.card-email')).toHaveAttribute('fill-opacity', '0.6');
  await expect(card).toContainText('gamenote.eu');
  await expect(card.locator('image')).toHaveCount(1);
  assert.deepEqual(avatarRequests, ['https://i.ibb.co/fixture/avatar.png']);
  await expect(card.locator('text').filter({ hasText: /^L$/ })).toHaveCount(0);
  const chooseCardTheme = async (editor, name) => {
    await editor.getByRole('button', { name: 'Sve daisyUI teme', exact: true }).click();
    const picker = editor.locator('.card-theme-menu');
    await picker.getByRole('button', { name, exact: true }).click();
    await expect(picker).toBeHidden();
  };
  for (const screenWidth of [320, 390, 1440]) {
    await page.setViewportSize({ width: screenWidth, height: 1000 });
    const compact = screenWidth < 560;
    await expect(card).toHaveAttribute('viewBox', compact ? '0 0 600 880' : '0 0 960 600');
    assert.ok((await card.boundingBox()).width > (compact ? 250 : 600), 'Kartica koristi širinu spremnika');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await page.evaluate(() => { window.auditView().toast.show = false; });
    await page.locator('.profile').screenshot({ path: join(cardArtifacts, `profile-${screenWidth}.png`), animations: 'disabled' });
    await page.locator('.profile-achievements').screenshot({ path: join(cardArtifacts, `achievements-${screenWidth}.png`), animations: 'disabled' });
    await card.screenshot({ path: join(cardArtifacts, `card-${screenWidth}.png`) });
    const exportButton = page.getByRole('button', { name: 'Preuzmi karticu', exact: true });
    await expect(exportButton).toHaveCount(1);
    await expect(exportButton.locator('svg')).toBeVisible();
    assert.equal((await exportButton.innerText()).trim(), screenWidth < 640 ? 'PNG' : 'Preuzmi karticu');
    const signatureFill = await card.locator('g > rect').first().getAttribute('fill');
    await page.getByRole('button', { name: 'Uredi karticu', exact: true }).click();
    const editor = page.getByRole('dialog', { name: 'Uredi Gamenote karticu', exact: true });
    const preview = editor.locator('#gaming-card-preview');
    await expect(editor).toBeVisible();
    await expect(editor.getByRole('button', { name: /Gamenote signature/ })).toHaveAttribute('aria-pressed', 'true');
    await expect(editor.getByRole('button', { name: /Gamenote signature/ })).toContainText('RPG');
    await expect(editor.getByRole('button', { name: /Gamenote signature/ })).not.toContainText('daisyUI');
    await expect(editor.getByRole('button', { name: /Gamenote signature/ })).not.toContainText('Dracula');
    const signatureSwatch = await editor.locator('.signature-swatch').evaluate(node => getComputedStyle(node).backgroundColor);
    const previewBackground = await preview.locator('g > rect').first().evaluate(node => getComputedStyle(node).fill);
    const signaturePrimary = await editor.getByRole('button', { name: 'Dracula', exact: true }).locator('.theme-swatch').evaluate(node => getComputedStyle(node).backgroundColor);
    assert.equal(signatureSwatch, signaturePrimary, 'Signature uzorak koristi primarnu boju teme');
    assert.notEqual(signatureSwatch, previewBackground);

    await expect(preview.locator('g > rect').first()).toHaveAttribute('fill', signatureFill);
    await expect(preview.locator('image')).toHaveAttribute('href', /^data:image\/png/);
    assert.equal(await page.evaluate(() => {
      const ids = [...document.querySelectorAll('[id]')].map(node => node.id);
      return new Set(ids).size === ids.length;
    }), true, 'Pregled i kartica imaju zasebne ID-jeve');
    await editor.getByRole('button', { name: 'Autumn', exact: true }).click();
    assert.notEqual(await preview.locator('g > rect').first().getAttribute('fill'), signatureFill);
    await expect(card.locator('g > rect').first()).toHaveAttribute('fill', signatureFill);
    await expect(editor.locator('.theme-swatch > *')).toHaveCount(0);
    const choices = editor.getByRole('group', { name: 'daisyUI palete', exact: true });
    await expect(choices.getByLabel('Vlastita boja kartice')).toBeVisible();
    const pickerButton = choices.getByRole('button', { name: 'Sve daisyUI teme', exact: true });
    await expect(pickerButton).toBeVisible();
    await expect(pickerButton.locator('.theme-preview > span')).toHaveCount(4);
    const colorButtonBounds = await choices.locator('.card-color-choice').boundingBox();
    const pickerButtonBounds = await pickerButton.boundingBox();
    assert.ok(Math.abs(colorButtonBounds.y + colorButtonBounds.height / 2 - pickerButtonBounds.y - pickerButtonBounds.height / 2) <= 1, 'Vlastita boja i popis tema uvijek ostaju u istom redu');
    await expect(choices.locator('.card-color-choice').getByText('Vlastita boja', { exact: true })).toBeVisible();
    await expect(choices.locator('.card-quick-themes').getByRole('button', { name: 'Winter', exact: true })).toHaveCount(1);
    await expect(choices.locator('.card-quick-themes').getByRole('button', { name: 'Pastel', exact: true })).toHaveCount(0);
    if (screenWidth < 640) {
      await expect(choices.locator('.theme-choice').first().getByText('Autumn', { exact: true })).toBeVisible();
      await expect(pickerButton.getByText('Sve teme', { exact: true })).toBeVisible();
      const quickThemes = await choices.locator('.card-quick-themes').evaluate(strip => ({
        overflow: strip.scrollWidth > strip.clientWidth,
        centers: [...strip.children].map(button => button.getBoundingClientRect().y),
      }));
      assert.equal(quickThemes.overflow, true, 'Nazivi tema pomiču se vodoravno');
      assert.equal(new Set(quickThemes.centers).size, 1, 'Predefinirane teme ostaju u jednom redu');
    }
    const controlBounds = await choices.evaluate(group => [...group.children].map(control => {
      const bounds = control.getBoundingClientRect();
      return { left: bounds.left, right: bounds.right, center: bounds.y + bounds.height / 2, height: bounds.height };
    }));
    const groupBounds = await choices.boundingBox();
    for (const bounds of controlBounds) {
      assert.ok(bounds.left >= groupBounds.x && bounds.right <= groupBounds.x + groupBounds.width + 1, 'Selektori ne prelaze širinu grupe');
    }
    if (screenWidth === 1440) {
      assert.ok(controlBounds.every(bounds => Math.abs(bounds.center - controlBounds[0].center) <= 1), 'Sve teme, vlastita boja i druge teme u istom su redu');
      assert.ok(controlBounds.every(bounds => bounds.height <= 34), 'Selektori imaju kompaktnu visinu');
    }
    const appTheme = await page.locator('html').getAttribute('data-theme');
    await pickerButton.click();
    const picker = editor.locator('.card-theme-menu');
    await expect(picker).toBeVisible();
    await expect(picker).toHaveCSS('opacity', '1');
    await expect(picker.getByRole('button')).toHaveCount(35);
    await expect(picker.getByRole('button', { name: 'Autumn', exact: true })).toHaveAttribute('aria-pressed', 'true');
    const pickerBounds = await picker.boundingBox();
    assert.ok(pickerBounds.x >= 0 && pickerBounds.x + pickerBounds.width <= screenWidth, 'Popis tema stane u zaslon');
    await page.screenshot({ path: join(cardArtifacts, `themes-${screenWidth}.png`), animations: 'disabled' });
    await page.keyboard.press('Escape');
    await expect(picker).toBeHidden();
    await expect(editor).toBeVisible();
    await chooseCardTheme(editor, 'Autumn');
    assert.equal(await page.locator('html').getAttribute('data-theme'), appTheme, 'Odabir mijenja samo Gamercard');
    const emailCenterOffset = await card.evaluate(svg => {
      const name = svg.querySelector('.card-username').getBoundingClientRect();
      const email = svg.querySelector('.card-email').getBoundingClientRect();
      return Math.abs(name.y + name.height / 2 - email.y - email.height / 2);
    });
    assert.ok(emailCenterOffset <= 1.5, 'Email je vertikalno centriran uz ime');
    const panel = editor.locator('.card-editor-box');
    assert.ok((await panel.boundingBox()).width <= screenWidth);
    await panel.screenshot({ path: join(cardArtifacts, `editor-${screenWidth}.png`) });
    await editor.getByRole('button', { name: 'Odustani', exact: true }).click();
    await expect(editor).toBeHidden();
    await expect(card.locator('g > rect').first()).toHaveAttribute('fill', signatureFill);
    const downloadReady = page.waitForEvent('download');
    await exportButton.click();
    const download = await downloadReady;
    assert.equal(await download.failure(), null);
    assert.equal(download.suggestedFilename(), 'gamenote-kartica-Leo.png');
    await download.saveAs(join(cardArtifacts, `export-${screenWidth}.png`));
    await expect(exportButton).toBeEnabled();
    const pixels = await page.evaluate(async () => {
      const blob = await window.auditView().gamingCardRef.exportImage();
      const bitmap = await createImageBitmap(blob);
      const canvas = document.createElement('canvas');
      canvas.width = bitmap.width; canvas.height = bitmap.height;
      const ctx = canvas.getContext('2d'); ctx.drawImage(bitmap, 0, 0);
      const compact = bitmap.width === 1200;
      const logo = ctx.getImageData((compact ? 426 : 750) * 2, (compact ? 646 : 358) * 2, 1, 1).data;
      const background = ctx.getImageData((compact ? 406 : 730) * 2, (compact ? 646 : 358) * 2, 1, 1).data;
      const avatar = ctx.getImageData(92 * 2, 80 * 2, 1, 1).data;
      return { width: bitmap.width, height: bitmap.height, logo: [...logo], background: [...background], avatar: [...avatar] };
    });
    assert.deepEqual([pixels.width, pixels.height], compact ? [1200, 1760] : [1920, 1200]);
    assert.ok(pixels.logo.slice(0, 3).reduce((sum, value, index) => sum + Math.abs(value - pixels.background[index]), 0) > 12, 'Izvoz sadrži pozadinski logotip');
    assert.deepEqual(pixels.avatar, [0, 0, 0, 255], 'Izvoz sadrži sliku nakon CORS greške');
  }
  await page.evaluate(() => { window.auditView().handleImageError(); });
  assert.equal(await page.evaluate(() => window.auditView().profileForm.avatarUrl), 'https://i.ibb.co/fixture/avatar.png');
  await expect(card.locator('image')).toHaveCount(1);
  await page.evaluate(() => { window.auditView().profileForm.avatarUrl = 'https://i.ibb.co.com/fixture/avatar.png'; });
  await expect.poll(() => avatarRequests.at(-1)).toBe('https://i.ibb.co.com/fixture/avatar.png');
  await expect(card.locator('image')).toHaveAttribute('href', /^data:image\/png/);
  failAvatarProxy = true;
  await page.evaluate(() => { window.auditView().profileForm.avatarUrl = 'https://i.ibb.co/fixture/avatar.png'; });
  await expect(page.getByText('Fotografija se prikazuje, ali nije spremna za izvoz.')).toBeVisible();
  await expect(card.locator('image')).toHaveAttribute('href', 'https://i.ibb.co/fixture/avatar.png');
  await expect(card.locator('text').filter({ hasText: /^L$/ })).toHaveCount(0);
  failAvatarProxy = false;
  await page.getByRole('button', { name: 'Ponovno učitaj sliku', exact: true }).click();
  await expect(card.locator('image')).toHaveAttribute('href', /^data:image\/png/);
  for (const source of ['https://photos.example.org/portrait.png', 'https://i.pinimg.com/fixture/avatar.jpg']) {
    await page.evaluate(source => { window.auditView().profileForm.avatarUrl = source; }, source);
    await expect.poll(() => avatarRequests.at(-1)).toBe(source);
    await expect(card.locator('image')).toHaveAttribute('href', /^data:image\/png/);
    const downloadReady = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Preuzmi karticu', exact: true }).click();
    assert.equal(await (await downloadReady).failure(), null);
  }
  const cardInfo = page.getByRole('dialog', { name: 'Gamenote signature i titule', exact: true });
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: width < 640 ? 780 : 1000 });
    await page.getByRole('button', { name: 'O Gamenote signature boji i titulama', exact: true }).click();
    const panel = cardInfo.locator('.card-info-copy');
    const content = cardInfo.locator('.card-info-scroll');
    const title = cardInfo.getByRole('heading', { name: 'Gamenote signature i titule', exact: true });
    const close = cardInfo.getByRole('button', { name: 'Razumijem', exact: true });
    await expect(cardInfo).toBeVisible();
    await expect(panel).toHaveCSS('scale', '1');
    const bounds = await panel.boundingBox();
    assert.equal(bounds.height, width < 640 ? 560 : 720, 'Info modal ima fiksnu visinu prilagođenu uređaju');
    assert.equal(bounds.width, width < 640 ? width - 32 : 800, 'Modal koristi dostupnu širinu na mobitelu i veću širinu na računalu');
    assert.ok(bounds.width <= (width < 640 ? 640 : 800) && bounds.height < (width < 640 ? 780 : 1000) - 96);
    await content.evaluate(body => { body.scrollTop = 0; });
    await panel.screenshot({ path: join(cardArtifacts, `info-${width}.png`) });
    const before = { title: await title.boundingBox(), close: await close.boundingBox() };
    const scrollTop = await content.evaluate(body => {
      body.scrollTop = body.scrollHeight;
      return body.scrollTop;
    });
    assert.ok(scrollTop > 0, 'Sadržaj modala može se pomicati');
    assert.equal((await title.boundingBox()).y, before.title.y, 'Naslov ostaje na mjestu');
    assert.equal((await close.boundingBox()).y, before.close.y, 'Gumb ostaje na mjestu');
    await expect(cardInfo.getByText('Omiljena igra je ona s najviše zabilježenih sati.', { exact: false })).toBeInViewport();
    await close.click();
  }
  await page.getByRole('button', { name: 'O Gamenote signature boji i titulama', exact: true }).click();
  await expect(cardInfo).toBeVisible();
  await expect(cardInfo).toContainText('najviše igara');
  await expect(cardInfo).toContainText('Od 500 h');
  await expect(cardInfo).toContainText('Oblivion caster');
  await expect(cardInfo.getByRole('row').filter({ hasText: 'adventure' })).toContainText('dim');
  await expect(cardInfo.getByRole('row').filter({ hasText: 'puzzle' })).toContainText('winter');
  await expect(cardInfo.getByRole('row').filter({ hasText: 'survival-horror' })).toContainText('halloween');
  await expect(cardInfo.getByRole('row').filter({ hasText: 'gacha' })).toContainText('cyberpunk');
  await expect(cardInfo.locator('p').first()).toHaveCSS('text-align', 'justify');
  assert.ok(await cardInfo.locator('.card-info-copy').evaluate(panel => parseFloat(getComputedStyle(panel).paddingLeft) >= 28));
  await expect(cardInfo.locator('tbody').first().locator('.theme-preview')).toHaveCount(9);
  await expect(cardInfo.locator('tbody').first().locator('.theme-preview > span')).toHaveCount(36);
  await cardInfo.getByRole('button', { name: 'Razumijem', exact: true }).click();
  await expect(cardInfo).toBeHidden();
  const openEditor = async () => {
    await page.getByRole('button', { name: 'Uredi karticu', exact: true }).click();
    return page.getByRole('dialog', { name: 'Uredi Gamenote karticu', exact: true });
  };
  await checkCardContrast(page, card, openEditor, chooseCardTheme, cardArtifacts);
  let editor = await openEditor();
  await editor.getByRole('button', { name: 'Night', exact: true }).click();
  const nightFill = await editor.locator('#gaming-card-preview g > rect').first().getAttribute('fill');
  await editor.getByRole('button', { name: 'Spremi izgled', exact: true }).click();
  await expect(card.locator('g > rect').first()).toHaveAttribute('fill', nightFill);
  await navigate('/library');
  await navigate('/profile');
  await expect(card).toBeVisible();
  await expect(card.locator('g > rect').first()).toHaveAttribute('fill', nightFill);
  editor = await openEditor();
  await editor.getByLabel('Vlastita boja kartice', { exact: true }).fill('#fff3d0');
  await expect(editor.locator('#gaming-card-preview g > rect').first()).toHaveAttribute('fill', '#fff3d0');
  await editor.getByRole('button', { name: 'Spremi izgled', exact: true }).click();
  await expect(card.locator('g > rect').first()).toHaveAttribute('fill', '#fff3d0');
  await expect(card).toHaveAttribute('fill', /^oklch\(/);
  await expect(card.locator('image')).toHaveAttribute('href', /^data:image\/png/);
  const customPixels = await page.evaluate(async () => {
    const blob = await window.auditView().gamingCardRef.exportImage();
    const bitmap = await createImageBitmap(blob);
    const canvas = document.createElement('canvas'); canvas.width = bitmap.width; canvas.height = bitmap.height;
    const ctx = canvas.getContext('2d'); ctx.drawImage(bitmap, 0, 0);
    return [...ctx.getImageData(500, 60, 1, 1).data];
  });
  assert.deepEqual(customPixels, [255, 243, 208, 255], 'Izvoz koristi odabranu punu boju');
  await page.locator('.gamer-card').screenshot({ path: join(cardArtifacts, 'card-custom-light.png') });
  editor = await openEditor();
  await chooseCardTheme(editor, 'Sunset');
  await expect(editor.locator('#gaming-card-preview g > rect').first()).toHaveAttribute('fill', '#fff3d0');
  await editor.getByRole('button', { name: 'Spremi izgled', exact: true }).click();
  assert.equal(await page.evaluate(() => window.auditView().cardTheme), 'theme:sunset');
  await navigate('/library');
  await navigate('/profile');
  await expect(card.locator('g > rect').first()).toHaveAttribute('fill', '#fff3d0');
  assert.equal(await page.evaluate(() => window.auditView().cardTheme), 'theme:sunset');
  editor = await openEditor();
  await editor.getByRole('button', { name: /Gamenote signature/ }).click();
  for (const value of ['theme:dim', 'theme:winter', 'theme:cyberpunk', 'theme:sunset', 'theme:halloween']) {
    if (value === 'theme:sunset') await chooseCardTheme(editor, 'Sunset');
    else await editor.getByRole('button', { name: value.slice(6)[0].toUpperCase() + value.slice(7), exact: true }).click();
    const exact = await page.evaluate(async value => {
      const { CARD_THEMES } = await import('/src/services/cardAppearance.js');
      const theme = CARD_THEMES.find(theme => theme.value === value);
      const svg = document.querySelector('#gaming-card-preview');
      const declared = [...svg.querySelectorAll('[fill], [color]')].map(node => node.getAttribute('fill') || node.getAttribute('color')).filter(color => color?.startsWith('oklch('));
      const originals = new Set(Object.values(theme.tokens));
      return { background: theme.color, allOriginal: declared.every(color => originals.has(color)), distinct: new Set(declared).size };
    }, value);
    await expect(editor.locator('#gaming-card-preview g > rect').first()).toHaveAttribute('fill', exact.background);
    assert.equal(exact.allOriginal, true);
    assert.ok(exact.distinct >= 4);
    await editor.locator('.card-editor-box').screenshot({ path: join(cardArtifacts, `palette-${value.slice(6)}.png`) });
  }
  await editor.getByRole('button', { name: 'Odustani', exact: true }).click();

  editor = await openEditor();
  await editor.getByRole('button', { name: /Gamenote signature/ }).click();
  await page.keyboard.press('Escape');
  await expect(editor).toBeHidden();
  await expect(card.locator('g > rect').first()).toHaveAttribute('fill', '#fff3d0');
  editor = await openEditor();
  await editor.getByRole('button', { name: /Gamenote signature/ }).click();
  await editor.getByRole('button', { name: 'Spremi izgled', exact: true }).click();
  const previousColor = await card.locator('g > rect').first().getAttribute('fill');
  await page.evaluate(() => {
    const view = window.auditView();
    view.games = [{ ...view.games[0], status: 'playing', title: 'W'.repeat(150), genre: 'Action' }];
    window.auditStore.user.user_metadata.name = 'W'.repeat(100);
  });
  await expect(card).not.toContainText('Playing · 1 igara');
  await expect(card.locator('.card-metric').last().locator('text').first()).toHaveText('1');
  assert.notEqual(await card.locator('g > rect').first().getAttribute('fill'), previousColor);
  await expect(card.locator('linearGradient, radialGradient')).toHaveCount(0);
  assert.equal(await card.evaluate(svg => [...svg.querySelectorAll('text')].every(text => text.getBBox().x + text.getBBox().width <= 961)), true);
  await page.evaluate(() => { window.auditView().profileForm.avatarUrl = 'https://avatar.invalid/missing.png'; });
  await expect(page.getByText(/Profilna slika nije dostupna za karticu/)).toBeVisible();
  const fallbackDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Preuzmi karticu', exact: true }).click();
  assert.equal(await (await fallbackDownload).failure(), null);
  await page.evaluate(() => {
    window.originalToBlob = HTMLCanvasElement.prototype.toBlob;
    HTMLCanvasElement.prototype.toBlob = function(callback) { callback(null); };
  });
  await page.getByRole('button', { name: 'Preuzmi karticu', exact: true }).click();
  await expect(page.getByText('Slika nije spremljena. Pokušaj ponovno.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Preuzmi karticu', exact: true })).toBeEnabled();
  await page.evaluate(() => {
    HTMLCanvasElement.prototype.toBlob = window.originalToBlob;
    window.auditView().games = [];
  });
  await expect(card.locator('.card-metric').first().locator('text').first()).toHaveText('0');
  await expect(card).toContainText('Još nema podataka');
  console.log(`✓ Gamercard: mobitel/računalo, PNG, profilna slika, logotip, boje, greške; snimke: ${cardArtifacts}`);
  rows = originalRows;
  await navigate('/game/a');
  await page.waitForFunction(
    () => window.auditView()?.game?.id === 'a' && !window.auditView()?.loading,
  );
  const hydrated = await page.evaluate(
    () => window.auditView().editForm.progress_mode,
  );
  assert.equal(hydrated, 'pokedex');
  findings.push({
    fixed: 'saved-progress-mode-preserved',
    stored: 'pokedex',
    form: hydrated,
  });
  await page.evaluate(async () => {
    const v = window.auditView();
    v.editForm.publisher = 'Unsaved publisher';
    await v.cancelEdit();
  });
  assert.equal(
    await page.evaluate(() => window.auditView().editForm.publisher),
    '',
  );
  findings.push({ fixed: 'cancel-restores-empty-field' });
  writes = [];
  await page.evaluate(async () => {
    const v = window.auditView();
    v.editForm.group_ids = [];
    await v.saveGame();
  });
  assert.equal(writes.filter((w) => w.method === 'DELETE').length, 1);
  findings.push({ fixed: 'last-group-removed' });
  await navigate('/game/b');
  await page.waitForFunction(
    () => window.auditView()?.game?.id === 'b' && !window.auditView()?.loading,
  );
  const carried = await page.evaluate(() => ({
    notes: window.auditView().editForm.notes,
    rating: window.auditView().editForm.rating,
    start: window.auditView().editForm.start_date,
  }));
  await expect(page.locator('.badge').filter({ hasText: /^Wishlist$/ })).toBeVisible();
  assert.equal(carried.notes, '');
  assert.equal(carried.rating, 0);
  assert.equal(carried.start, '');
  findings.push({ fixed: 'game-change-resets-empty-fields', form: carried });
  await page.evaluate(async () => {
    const v = window.auditView();
    v.editForm.progress_mode = 'trophies_psn';
    v.editForm.progress_value = 4;
    v.editForm.progress_total = 4;
    await v.saveGame();
  });
  const saved = rows.find((r) => r.id === 'b');
  assert.equal(saved.achievement_percent, 100);
  assert.equal(saved.progress_value, 4);
  findings.push({
    fixed: 'progress-percent-updated',
    earned: saved.progress_value,
    total: saved.progress_total,
    legacyPercent: saved.achievement_percent,
  });
  await navigate('/groups/g1');
  await page.waitForFunction(() => window.auditView()?.group?.id === 'g1');
  await navigate('/groups/g2');
  await expect
    .poll(() =>
      page.evaluate(() => window.auditRouter.currentRoute.value.params.id),
    )
    .toBe('g2');
  await page.waitForFunction(() => window.auditView()?.group?.id === 'g2');
  findings.push({ fixed: 'group-route-reloads-data' });
  await page.evaluate(async () => {
    window.auditSession = null;
    await window.auditStore.fetchUser();
  });
  assert.equal(await page.evaluate(() => window.auditStore.isLoggedIn), false);
  findings.push({ fixed: 'expired-session-clears-user' });
  await page.evaluate(() => {
    localStorage.setItem(
      'gamenote.psn.tokens',
      JSON.stringify({ accessToken: 'fixture' }),
    );
    localStorage.setItem(
      'gamenote.psn.snapshot',
      JSON.stringify({ profile: { onlineId: 'OldUserPSN' }, games: [] }),
    );
    window.auditStore.setUser({ id: 'user-b' });
  });
  const leak = await page.evaluate(async () => {
    const psn = await import('/src/services/psnService.js');
    return {
      profile: psn.loadSnapshot()?.profile?.onlineId ?? null,
      connected: psn.hasPsnConnection(),
    };
  });
  assert.equal(leak.profile, null);
  assert.equal(leak.connected, false);
  findings.push({ fixed: 'psn-isolated-between-users', ...leak });
  await page.evaluate(async () => {
    const psn = await import('/src/services/psnService.js');
    const { seal } = await import('/src/services/tokenVault.js');
    window.auditStore.setUser({ id: 'user-a' });
    const envelope = await seal(
      { accessToken: 'fixture-secret-token' },
      'psn.user-a',
    );
    localStorage.setItem(
      'gamenote.psn.tokens.user-a',
      JSON.stringify(envelope),
    );
    psn.saveSnapshot({ profile: { onlineId: 'FixtureA' }, games: [] });
    if (!psn.hasPsnConnection()) throw new Error('Nedostaje veza korisnika A');
    window.auditStore.setUser({ id: 'user-b' });
    if (psn.hasPsnConnection() || psn.loadSnapshot())
      throw new Error('PSN veza je prešla na drugog korisnika');
    window.auditStore.setUser({ id: 'user-a' });
    if (psn.loadSnapshot()?.profile.onlineId !== 'FixtureA')
      throw new Error('Vlastiti snapshot nije dostupan');
    await psn.disconnectPsn();
  });
  await page.evaluate(async () => {
    const { useGamesApi } = await import('/src/services/gamesApi.js');
    await useGamesApi().searchGames('Ratchet & Clank');
  });
  assert.equal(searchUrl.params.search, 'Ratchet & Clank');
  findings.push({
    fixed: 'search-keeps-ampersand',
    decodedSearch: searchUrl.params.search,
  });
  await page.evaluate(() => {
    window.auditSession = { user: { id: 'user-a' }, access_token: 'fixture' };
    window.auditStore.setUser(window.auditSession.user);
  });
  await navigate('/login');
  await navigate('/importers');
  await page.waitForFunction(
    () => typeof window.auditView()?.exportBackup === 'function',
  );
  const source = Array.from({ length: 30 }, (_, i) => ({
    name: 'Fixture ' + i,
    psnTitleId: 'CUSA' + i,
    npCommunicationId: 'NPWR' + i,
    platformCategory: 'ps4_game',
    hoursPlayed: 1,
    _key: 'CUSA' + i,
    _exists: false,
  }));
  await page.evaluate((source) => {
    const v = window.auditView();
    v.psnGames = source;
    v.selectedMap = Object.fromEntries(source.map((g) => [g._key, true]));
  }, source);
  rows = [];
  writes = [];
  insertNumber = 0;
  failSecondInsert = true;
  await page.evaluate(() => window.auditView().importSelected());
  assert.equal(rows.length, 1);
  failSecondInsert = false;
  await page.evaluate(() => window.auditView().importSelected());
  assert.equal(rows.length, 30);
  findings.push({
    fixed: 'psn-partial-retry-without-duplicates',
    uniqueGames: 30,
    storedRows: rows.length,
  });
  rows = Array.from({ length: 1005 }, (_, i) => ({
    ...base,
    id: 'backup-' + i,
  }));
  await page.evaluate(async () => {
    URL.createObjectURL = (blob) => {
      window.auditBlob = blob;
      return 'blob:fixture';
    };
    await window.auditView().exportBackup();
  });
  const backupCount = await page.evaluate(
    async () => JSON.parse(await window.auditBlob.text()).games.length,
  );
  assert.equal(backupCount, 1005);
  findings.push({
    fixed: 'backup-includes-all-pages',
    source: rows.length,
    exported: backupCount,
  });
  await page.evaluate(async () => {
    const recovery = await import('/src/services/recoveryState.js');
    recovery.handleRecoveryEvent('PASSWORD_RECOVERY', window.auditSession);
  });
  await navigate('/reset-password');
  await expect(page.getByLabel('Nova lozinka', { exact: true })).toBeVisible();
  findings.push({ fixed: 'recovery-event-before-mount-shows-form' });
  await page.evaluate(async () => {
    const { stripHtml } = await import('/src/services/safeContent.js');
    window.auditXss = false;
    const payload = document.createElement('template');
    payload.innerHTML = '<img alt="" src="https://audit.invalid/image"><script>window.auditXss=true</script><b>Opis</b>';
    payload.content.querySelector('img').setAttribute('onerror', 'window.auditXss=true');
    const text = stripHtml(payload.innerHTML);
    if (text !== 'Opis') throw new Error('Nesiguran opis');
    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve)),
    );
  });
  assert.equal(await page.evaluate(() => window.auditXss), false);
  findings.push({ fixed: 'rss-html-is-inert' });
  await navigate('/login');
  await page.evaluate(async () => {
    const { clearRecovery } = await import('/src/services/recoveryState.js');
    clearRecovery();
    window.auditSession = null;
    window.auditStore.clearUser();
  });
  await navigate('/reset-password');
  await expect(page.getByText(/Poveznica je neispravna/)).toBeVisible();
  rows = [{ ...base, id: 'a' }];
  await page.goto(server.resolvedUrls.local[0] + '__audit?smoke=1');
  await page.waitForFunction(() => window.auditReady);
  for (const path of [
    '/library',
    '/groups',
    '/profile',
    '/stats',
    '/theme-settings',
    '/importers',
    '/add-game',
  ]) {
    await navigate(path);
    await page.waitForLoadState('networkidle');
  }
  const desktopNav = page.getByRole('navigation', { name: 'Glavna navigacija', exact: true });
  await expect(desktopNav).toBeVisible();
  for (const label of ['Moje igre', 'Statistika', 'Grupe']) {
    await desktopNav.getByRole('link', { name: label, exact: true }).click();
    await page.mouse.move(0, 0);
    const styles = await desktopNav.locator('a').evaluateAll(links => links.map(link => {
      const style = getComputedStyle(link);
      return { background: style.backgroundColor, weight: style.fontWeight, padding: style.padding };
    }));
    assert.ok(styles.every(style => style.background === 'rgba(0, 0, 0, 0)' && style.weight === styles[0].weight && style.padding === styles[0].padding), 'Desktop navigacija ne označava trenutnu stranicu');
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await navigate('/library');
  const nativeSort = page.getByRole('combobox', { name: 'Sortiranje igara', exact: true });
  await expect(nativeSort).toBeVisible();
  await expect(nativeSort).toHaveCSS('appearance', 'auto');
  await nativeSort.selectOption('title:asc');
  await expect(nativeSort).toHaveValue('title:asc');
  await navigate('/stats');
  for (const select of await page.locator('select').filter({ visible: true }).all()) {
    await expect(select).toHaveCSS('appearance', 'auto');
    assert.ok((await select.boundingBox()).height >= 44);
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await navigate('/library');
  await expect(page.getByText('Game A', { exact: true })).toBeVisible();
  await page.evaluate(() => {
    window.auditSession = { user: { id: 'user-b' }, access_token: 'fixture-b' };
    window.emitAuth('SIGNED_IN');
  });
  await expect(page.getByText('Game A', { exact: true })).toBeHidden();
  await page.evaluate(() => {
    window.auditSession = null;
    window.emitAuth('SIGNED_OUT');
  });
  await expect
    .poll(() => page.evaluate(() => window.auditRouter.currentRoute.value.path))
    .toBe('/login');
  await navigate('/game/a');
  assert.equal(
    await page.evaluate(() => window.auditRouter.currentRoute.value.path),
    '/login',
  );
  await navigate('/register');
  await page.evaluate(() => {
    window.auditDb.auth.signUp = async () => ({
      data: { user: { id: 'pending' }, session: null },
      error: null,
    });
  });
  await page.getByLabel('Korisničko ime', { exact: true }).fill('CatWarrior99');
  await page
    .getByLabel('E-mail adresa', { exact: true })
    .fill('fixture@example.test');
  await page.getByLabel('Lozinka', { exact: true }).fill('FixturePassword!1');
  await page
    .getByLabel('Potvrdi lozinku', { exact: true })
    .fill('FixturePassword!1');
  await page.getByRole('button', { name: 'Stvori račun', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('potvrdi adresu');
  assert.equal(await page.evaluate(() => window.auditStore.isLoggedIn), false);
  await page.evaluate(() => {
    window.auditDb.auth.signUp = async () => {
      throw new Error('Testni prekid mreže');
    };
  });
  await page.getByRole('button', { name: 'Stvori račun', exact: true }).click();
  await expect(
    page.getByText('Testni prekid mreže', { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Stvori račun', exact: true }),
  ).toBeEnabled();
  await navigate('/shared?id=1');
  await expect(page.locator('a[href="https://gamenote.eu"] svg')).toHaveAttribute('viewBox', '0 0 896 722');
  await expect(page.locator('img[src="/apple-touch-icon.png"]')).toHaveCount(0);
  const sharedBrand = page.locator('a[href="https://gamenote.eu"]');
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    if (width < 1024) {
      await expect(sharedBrand.locator('svg')).toBeVisible();
      await expect(sharedBrand.locator('img')).toBeHidden();
    } else {
      await expect(sharedBrand.locator('img')).toBeVisible();
      await expect(sharedBrand.locator('svg')).toBeHidden();
    }
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await sharedBrand.screenshot({ path: join(cardArtifacts, `share-brand-${width}.png`) });
  }
  await page.evaluate(async () => {
    const { useThemeStore } = await import('/src/stores/theme.js');
    useThemeStore().setTheme('dark');
  });
  await expect(sharedBrand.locator('img')).toHaveAttribute('src', /GamenoteBannerDarkMode/);

  assert.deepEqual(pageErrors, []);
  console.log(
    `✓ ${findings.length + 6} provjera aplikacije: obrasci, napredak, grupe, sesije, PSN ponavljanje, backup, reset lozinke, RSS`,
  );
  await context.close();
  await checkAuthStartup(browser, server.resolvedUrls.local[0], cardArtifacts);
} finally {
  await browser?.close();
  await server.close();
  await rm(cacheDir, { recursive: true, force: true });
}
