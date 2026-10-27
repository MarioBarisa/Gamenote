import { createRequire } from 'node:module';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import assert from 'node:assert/strict';
const require = createRequire(process.cwd() + '/package.json');
const { createServer } = await import(require.resolve('vite'));
const { chromium, expect } = require('@playwright/test');
const cacheDir = await mkdtemp(join(tmpdir(), 'gamenote-audit-cache-'));
const html = `<!doctype html><html><body><div id="app"></div><script type="module">
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
  await context.route('**/*', async (route) => {
    const req = route.request(),
      url = new URL(req.url());
    if (url.hostname === '127.0.0.1') {
      if (url.pathname === '/.netlify/functions/app-api') {
        searchUrl = req.postDataJSON();
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
    const text = stripHtml(
      '<img src="https://audit.invalid/image" onerror="window.auditXss=true"><script>window.auditXss=true</script><b>Opis</b>',
    );
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
  assert.deepEqual(pageErrors, []);
  console.log(
    `✓ ${findings.length + 6} provjera aplikacije: obrasci, napredak, grupe, sesije, PSN ponavljanje, backup, reset lozinke, RSS`,
  );
  await context.close();
} finally {
  await browser?.close();
  await server.close();
  await rm(cacheDir, { recursive: true, force: true });
}
