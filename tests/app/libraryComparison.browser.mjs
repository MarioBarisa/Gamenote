import assert from 'node:assert/strict';
import { expect } from '@playwright/test';

export async function checkLibraryComparison(browser, origin, artifacts) {
  const context = await browser.newContext({ locale: 'hr-HR' });
  const page = await context.newPage();
  const errors = [], requests = [], external = [];
  page.on('pageerror', error => errors.push(error.message));
  let ownScope = 'none';
  let scope = 'library', failOwn = false, repeatPage = false, holdOwn = false, releaseOwn;
  let sharedActive = 0, maxSharedActive = 0;
  const own = [
    { id: 'own-a', title: 'Astra', description: 'Tvoj opis Astre', game_api_id: '1', platform: 'PC', genre: 'Action', status: 'playing', play_time: 120, rating: 4, metacritic_score: 85, screenshot_urls: JSON.stringify(['https://comparison-avatars.test/screenshot.svg']), image_url: 'https://comparison-avatars.test/poster.svg', progress_mode: 'achievements_steam', progress_value: 40, progress_total: 100 },
    { id: 'own-b', title: 'Bridge', game_api_id: '2', platform: 'PlayStation 5', genre: 'Action', status: 'completed', play_time: 5, rating: 5, metacritic_score: 72, progress_mode: 'trophies_psn', progress_value: 10, progress_total: 10 },
    { id: 'own-c', title: 'Orbit', game_api_id: '3', platform: 'PlayStation 4', genre: 'Action', status: 'backlog', play_time: null }
  ];
  const remote = [
    { ...own[0], id: 'remote-a', description: 'Tuđi opis Astre', genre: 'RPG', status: 'completed', rating: 2, play_time: 20, progress_value: 80 },
    { ...own[1], id: 'remote-b', genre: 'RPG', status: 'paused', rating: 3, play_time: 50, progress_value: 2 },
    { ...own[2], id: 'remote-c', genre: 'RPG', platform: 'PlayStation 5' }
  ];
  for (let index = 0; index < 147; index++) remote.push({ id: `extra-${index}`, title: `Nova igra ${String(index).padStart(2, '0')}`, game_api_id: String(index + 100), platform: 'PC', genre: 'RPG', description: 'Opis iz podijeljene zbirke', status: 'backlog', play_time: null });
  const fixtureRoute = async route => {
    const url = new URL(route.request().url());
    if (url.hostname === 'comparison-avatars.test' && url.pathname !== '/avatar.svg') return route.fulfill({ contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900"><defs><linearGradient id="sky" x2="0" y2="1"><stop offset="0" stop-color="#25468a"/><stop offset="1" stop-color="#eaa478"/></linearGradient></defs><path fill="url(#sky)" d="M0 0h1600v900H0z"/><circle cx="480" cy="260" r="120" fill="#ffe4ad"/><path fill="#254153" d="M0 800 480 400 800 650 1200 200 1600 550v350H0z"/><path fill="#142b35" d="m0 800 400-200 350 220 500-170 350 200v50H0z"/></svg>' });
    if (url.hostname === 'comparison-avatars.test') return route.fulfill({ contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" fill="#64748b"/><circle cx="40" cy="30" r="15" fill="white"/><path d="M12 80a28 28 0 0 1 56 0" fill="white"/></svg>' });
    if (url.hostname === 'supabase.audit.test') {
      requests.push({ path: url.pathname, method: route.request().method(), search: url.search, payload: route.request().postDataJSON() });
      if (url.pathname.endsWith('/library_shares')) return route.fulfill({ json: { username: 'local-player', share_scope: ownScope } });
      if (url.pathname.endsWith('/games')) {
        if (holdOwn) await new Promise(resolve => { releaseOwn = resolve; });
        if (failOwn) return route.fulfill({ status: 500, json: { message: 'Testna greška usporedbe' } });
        let rows = own;
        for (const field of ['id', 'game_api_id', 'platform', 'title']) {
          const value = url.searchParams.get(field);
          if (value?.startsWith('eq.')) rows = rows.filter(game => String(game[field]) === value.slice(3));
        }
        if (url.searchParams.has('limit')) rows = rows.slice(0, Number(url.searchParams.get('limit')));
        const columns = url.searchParams.get('select');
        if (columns && columns !== '*') rows = rows.map(game => {
          const selected = {};
          for (const column of columns.split(',')) if (Object.hasOwn(game, column)) selected[column] = game[column];
          return selected;
        });
        return route.fulfill({ json: rows, headers: { 'content-range': rows.length ? `0-${rows.length - 1}/${rows.length}` : '*/0' } });
      }
      if (url.pathname.endsWith('/rpc/get_public_library')) {
        const input = route.request().postDataJSON();
        const local = input.p_username === 'local-player';
        const sourceGames = local ? own : remote;
        if (input.p_section === 'header' && local && ownScope === 'none') return route.fulfill({ json: null });
        if (input.p_section === 'header') return route.fulfill({ json: { username: input.p_username, name: local ? 'Lokalni igrač' : 'Udaljeni igrač', share_scope: local ? ownScope : scope, avatar_url: 'https://comparison-avatars.test/avatar.svg', platforms: ['PC', 'PlayStation 5'], card: { total: sourceGames.length, hours: local ? 125 : 70, completed: 1, playing: local ? 1 : 0, favoriteGenre: { name: local ? 'Action' : 'RPG' } } } });
        if (input.p_section === 'game') return route.fulfill({ json: sourceGames.find(game => game.id === input.p_options.game) || null });
        if ((input.p_options.page || 1) > 1) {
          sharedActive++; maxSharedActive = Math.max(maxSharedActive, sharedActive);
          await new Promise(resolve => setTimeout(resolve, 30));
          sharedActive--;
        }
        const start = repeatPage ? 0 : ((input.p_options.page || 1) - 1) * 48;
        return route.fulfill({ json: { items: local ? own.slice(start, start + 48) : remote.slice(start, start + 48), total: sourceGames.length } });
      }
      return route.fulfill({ json: [] });
    }
    if (url.pathname.startsWith('/.netlify/')) return route.fulfill({ status: 503, json: {} });
    if (url.origin === new URL(origin).origin) return route.continue();
    external.push(url.hostname); return route.abort();
  };
  await context.route('**/*', fixtureRoute);
  try {
    await page.goto(origin + '__audit');
    await page.waitForFunction(() => window.auditReady);
    await page.evaluate(async () => {
      const user = { id: 'viewer', user_metadata: { name: 'Lokalni igrač', avatar_url: 'https://comparison-avatars.test/avatar.svg' } };
      window.auditSession = { user, access_token: 'fixture' }; window.auditStore.setSession(window.auditSession);
      await window.auditRouter.push('/u/remote-player');
    });
    const trigger = page.getByRole('button', { name: 'Usporedi Gamenote', exact: true });
    await expect(trigger).toBeVisible();
    await expect(page.getByRole('button', { name: 'Pogledaj igru: Astra', exact: true })).toBeVisible();
    const initialPageReads = requests.filter(request => request.payload?.p_section === 'games' && (request.payload.p_options.page || 1) === 1).length;
    for (const width of [320, 390, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await trigger.click();
      const dialog = page.getByRole('dialog', { name: 'Gamenote usporedba', exact: true });
      await expect(dialog.locator('.comparison-hero')).toBeVisible();
      await expect(dialog.locator('.identity-wave')).toHaveCount(6);
      await expect(dialog.locator('.identity-left .identity-wave')).toHaveCount(3);
      await expect(dialog.locator('.identity-right .identity-wave')).toHaveCount(3);
      assert.equal(await dialog.locator('.identity-wave path').evaluateAll(paths => new Set(paths.map(path => path.getAttribute('d'))).size), 6, 'Svi valovi imaju vlastitu putanju');
      const curveScale = await dialog.locator('.identity-wave path').first().evaluate(element => new DOMMatrixReadOnly(getComputedStyle(element).transform).m22);
      assert.equal(Math.abs(curveScale - (width < 640 ? .38 : 1)) < .001, true, 'Krivulje su pliće na mobitelu');
      await expect(dialog.locator('.identity-avatar').first()).toHaveCSS('width', width < 640 ? '48px' : '72px');
      await expect(dialog.locator('.wave-intro').first()).toHaveCSS('animation-duration', /^1\.2s,/);
      await expect(dialog.locator('.identity-left .identity-name p').first()).toHaveText('Lokalni igrač');
      await expect(dialog.locator('.identity-left .identity-name p').last()).toHaveText('@local-player');
      await expect(dialog.locator('.identity-right .identity-name p').first()).toHaveText('Udaljeni igrač');
      await expect(dialog.locator('.identity-right .identity-name p').last()).toHaveText('@remote-player');
      assert.equal(await dialog.locator('.identity-left .identity-wave').evaluateAll(elements => new Set(elements.map(element => getComputedStyle(element).getPropertyValue('--wave-top'))).size), 3, 'Valovi imaju tri odvojene visine');
      if (width === 320) {
        const flows = await dialog.locator('.identity-wave').evaluateAll(elements => elements.map(element => {
          const intro = element.parentElement;
          const surge = intro.getAnimations()[0], flow = element.getAnimations()[0];
          surge.pause(); flow.pause();
          surge.currentTime = 0; flow.currentTime = 0;
          const profile = element.closest('.comparison-identity');
          const bounds = profile.getBoundingClientRect();
          const sign = profile.classList.contains('identity-left') ? 1 : -1;
          const crests = [150, 750, 1350].map(x => new DOMPoint(x, 0).matrixTransform(element.getScreenCTM()).x);
          const crest = crests.find(x => x >= bounds.left && x <= bounds.right);
          const distance = sign === 1 ? (bounds.right - crest) / bounds.width : (crest - bounds.left) / bounds.width;
          const positions = [], opacity = [];
          const timing = flow.effect.getTiming();
          const boundary = timing.duration + timing.delay;
          for (const time of [0, 600, 1199, 1200, 1201, 1800, boundary - 1, boundary + 1]) {
            surge.currentTime = time; flow.currentTime = time;
            const style = getComputedStyle(element);
            const iteration = flow.effect.getComputedTiming().currentIteration || 0;
            const period = Number.parseFloat(style.width) / 3;
            positions.push(new DOMMatrixReadOnly(style.transform).m41 + new DOMMatrixReadOnly(getComputedStyle(intro).transform).m41 + iteration * period * sign);
            opacity.push(Number(style.opacity));
          }
          function speedAt(time) {
            const samples = [];
            for (const offset of [-10, 10]) {
              flow.currentTime = time + offset;
              const style = getComputedStyle(element);
              const iteration = flow.effect.getComputedTiming().currentIteration || 0;
              samples.push(new DOMMatrixReadOnly(style.transform).m41 + iteration * Number.parseFloat(style.width) / 3 * sign);
            }
            return (samples[1] - samples[0]) * sign / .02 / bounds.width;
          }
          const timeSpeeds = [2000, 4000, 6000, 8000, 12000, 18000, 26000, 40000].map(speedAt);
          const cycleSpeeds = [.05, .25, .5, .75, .95].map(phase => speedAt((2 + phase) * timing.duration + timing.delay));
          surge.currentTime = 0; flow.currentTime = 0; surge.play(); flow.play();
          return { timeSpeeds, cycleSpeeds, sign, distance, positions, opacity, duration: timing.duration, speed: (positions[5] - positions[3]) * sign / .6 / bounds.width, openingSpeed: (positions[1] - positions[0]) * sign / .6 / bounds.width };
        }));
        for (let index = 0; index < flows.length; index++) {
          const flow = flows[index];
          assert.equal(Math.abs(flow.distance - (.18 + (index % 3) * .22)) < .06, true, 'Tri vala odmah imaju različit razmak od VS-a');
          assert.equal(flow.opacity.every(value => value >= .1), true, 'Val ostaje vidljiv pri usporavanju i na rubu ciklusa');
          assert.equal((flow.positions[1] - flow.positions[0]) * flow.sign > 0 && (flow.positions[5] - flow.positions[3]) * flow.sign > 0, true, 'Isti val nastavlja prema VS-u');
          assert.equal(Math.abs(flow.positions[4] - flow.positions[2]) < 1, true, 'Prijelaz nakon 1,2 s nema skoka');
        }
        for (const profile of [flows.slice(0, 3), flows.slice(3)]) {
          for (let time = 0; time < profile[0].timeSpeeds.length; time++) {
            assert.equal(profile[0].timeSpeeds[time] > profile[1].timeSpeeds[time] && profile[1].timeSpeeds[time] > profile[2].timeSpeeds[time], true, 'Red brzina ostaje isti tijekom vremena');
          }
          for (const wave of profile) assert.equal(Math.max(...wave.cycleSpeeds) > Math.min(...wave.cycleSpeeds) * 1.1, true, 'Svaki val ubrzava i usporava');
          assert.equal(profile[0].openingSpeed > profile[1].openingSpeed && profile[1].openingSpeed > profile[2].openingSpeed, true, 'Početni nalet također čuva red brzina');
        }
      }
      if (width < 640) assert.equal(await dialog.locator('.comparison-game').first().getByText('Sati', { exact: true }).evaluateAll(labels => Math.abs(labels[0].getBoundingClientRect().top - labels[1].getBoundingClientRect().top) < 1), true, 'Vrijednosti igrača ostaju poravnate');
      await expect(dialog.locator('.gamer-card')).toHaveCount(0);
      await expect(dialog.locator('.versus-mark defs > path')).toHaveCount(3);
      await expect(dialog.locator('.versus-brush')).toHaveCSS('animation-duration', '0.65s');
      await expect(dialog.locator('.versus-mark')).toHaveCSS('animation-duration', '1.05s');
      await expect(dialog.locator('.comparison-hero .identity-banner')).toHaveCount(0);
      await expect(dialog.getByRole('img', { name: 'Oboje imate ovu igru', exact: true })).toHaveCount(0);
      await expect(dialog.locator('.comparison-game').first().locator('strong.text-success')).toHaveCount(2);
      await expect(dialog.locator('.versus-spark')).toHaveCount(8);
      assert.equal(requests.filter(request => request.payload?.p_section === 'games' && (request.payload.p_options.page || 1) === 1).length, initialPageReads, 'Prva stranica se ponovno koristi');
      if (width === 1440) {
        for (const time of [350, 780, 900]) {
          await dialog.locator('.comparison-hero').evaluate((element, time) => {
            for (const animation of element.getAnimations({ subtree: true })) { animation.pause(); animation.currentTime = time; }
          }, time);
          await dialog.locator('.comparison-hero').screenshot({ path: `${artifacts}/comparison-draw-${time}.png` });
        }
        await dialog.locator('.comparison-hero').evaluate(element => { for (const animation of element.getAnimations({ subtree: true })) { if (animation.effect.getTiming().iterations === Infinity) animation.play(); else animation.finish(); } });
      }
      await expect(dialog.locator('.identity-avatar img')).toHaveCount(2);
      await expect.poll(() => dialog.locator('.identity-avatar img').evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0))).toBe(true);
      assert.equal(await dialog.locator('.versus-mark').evaluate(svg => getComputedStyle(svg.querySelector('.versus-ink use')).fill !== getComputedStyle(svg.querySelectorAll('.versus-ink use')[1]).fill), true);
      await dialog.screenshot({ animations: 'disabled', path: `${artifacts}/comparison-initial-${width}.png` });
      assert.equal(await dialog.locator('.library-comparison').evaluate(element => element.scrollWidth <= element.clientWidth + 1), true, `Usporedba ${width}: nema prelijevanja`);
      await expect(dialog.getByRole('tab', { name: 'Statistika', exact: true })).toBeDisabled();
      const share = dialog.getByRole('button', { name: 'Podijeli usporedbu', exact: true });
      assert.equal(await share.evaluate(element => Math.abs(element.getBoundingClientRect().y + element.clientHeight / 2 - (element.previousElementSibling.getBoundingClientRect().y + element.previousElementSibling.clientHeight / 2)) < 2), true, 'Dijeljenje je u istom redu s kategorijama');
      if (width === 320) {
        await share.click();
        const sharing = page.getByRole('dialog', { name: 'Podijeli usporedbu', exact: true });
        await expect(sharing).toContainText('Oba Gamenotea moraju biti javno podijeljena.');
        await page.keyboard.press('Escape');
        await expect(sharing).toHaveCount(0);
        await expect(dialog).toBeVisible();
      }
      await expect(dialog.getByRole('combobox')).toHaveCount(1);
      await expect(dialog.getByRole('tab', { name: 'Igre', exact: true }).locator('svg')).toHaveCount(1);
      assert.deepEqual(await dialog.getByRole('tab', { name: 'Igre', exact: true }).evaluate(element => { const style = getComputedStyle(element); return [style.backgroundColor, style.color, style.borderRadius, style.padding, style.fontSize, style.fontWeight]; }), await page.getByRole('navigation', { name: 'Podijeljena zbirka', exact: true }).getByRole('link', { name: 'Igre', exact: true }).evaluate(element => { const style = getComputedStyle(element); return [style.backgroundColor, style.color, style.borderRadius, style.padding, style.fontSize, style.fontWeight]; }), 'Kategorije imaju isti izgled kao share');
      await dialog.getByRole('button', { name: 'Filtri', exact: true }).click();
      const reads = requests.length;
      if (width === 1440) {
        await expect(dialog.locator('.comparison-game')).toHaveCount(24);
        await dialog.locator('.comparison-game').first().evaluate(element => { window.firstComparisonRow = element; });
        for (const count of [48, 72]) {
          await dialog.locator('.library-comparison').evaluate(element => { element.scrollTop = element.scrollHeight; });
          await expect(dialog.locator('.comparison-game')).toHaveCount(count);
        }
        assert.equal(await dialog.locator('.comparison-game').first().evaluate(element => element === window.firstComparisonRow), true, 'Infinite scroll dodaje kartice bez zamjene');
        assert.equal(requests.length, reads, 'Skrolanje koristi već dohvaćene podatke');
        await dialog.getByRole('searchbox', { name: 'Pretraži usporedbu', exact: true }).fill('Nova igra 146');
        await expect(dialog.locator('.comparison-game')).toHaveCount(1);
        await expect(dialog.locator('.comparison-game')).toContainText('Nova igra 146');
      }
      await dialog.getByRole('searchbox', { name: 'Pretraži usporedbu', exact: true }).fill('nema-takve-igre');
      await expect(dialog.locator('.comparison-game')).toHaveCount(0);
      await dialog.getByRole('searchbox', { name: 'Pretraži usporedbu', exact: true }).fill('');
      await dialog.getByRole('group', { name: 'Pripadnost igre', exact: true }).getByRole('button', { name: 'Zajedničke', exact: true }).click();
      await expect(dialog.locator('.comparison-game')).toHaveCount(2);
      await dialog.getByRole('group', { name: 'Prednost igrača', exact: true }).getByRole('button', { name: 'Više sati · Ti', exact: true }).click();
      await expect(dialog.locator('.comparison-game')).toHaveCount(1);
      await expect(dialog.locator('.comparison-game')).toContainText('Astra');
      await dialog.getByRole('group', { name: 'Prednost igrača', exact: true }).getByRole('button', { name: 'Više sati · @remote-player', exact: true }).click();
      await expect(dialog.locator('.comparison-game')).toContainText('Bridge');
      await dialog.getByRole('group', { name: 'Prednost igrača', exact: true }).getByRole('button', { name: 'Veći napredak · @remote-player', exact: true }).click();
      await expect(dialog.locator('.comparison-game')).toContainText('Astra');
      await dialog.getByRole('group', { name: 'Prednost igrača', exact: true }).getByRole('button', { name: 'Veći napredak · Ti', exact: true }).click();
      await expect(dialog.locator('.comparison-game')).toContainText('Bridge');
      await dialog.getByRole('group', { name: 'Prednost igrača', exact: true }).getByRole('button', { name: 'Sve', exact: true }).click();
      await dialog.getByRole('group', { name: 'Filteri statusa', exact: true }).getByRole('button', { name: 'Playing', exact: true }).click();
      await expect(dialog.locator('.comparison-game')).toContainText('Playing');
      await expect(dialog.locator('.comparison-game')).toContainText('Completed');
      assert.equal(requests.length, reads, 'Filtri ne dohvaćaju ponovno zbirke');
      await dialog.screenshot({ animations: 'disabled', path: `${artifacts}/comparison-${width}.png` });
      await dialog.getByRole('button', { name: 'Očisti filtre', exact: true }).click();
      await dialog.getByRole('button', { name: 'Platforma: PlayStation 4', exact: true }).click();
      await expect(dialog.locator('.comparison-game')).toHaveCount(1);
      await expect(dialog.locator('.comparison-game')).toContainText('Nema u zbirci');
      await page.keyboard.press('Escape');
      await expect(dialog).toHaveCount(0);
      await expect(trigger).toBeFocused();
    }
    assert.equal(requests.some(request => request.payload?.p_options?.page === 4), true, 'Čitaju se sve stranice');
    assert.equal(maxSharedActive, 3, 'Dohvat ima najviše tri istodobne stranice');
    assert.equal(requests.some(request => request.payload?.p_section === 'stats'), false, 'Privatna statistika se ne dohvaća');
    scope = 'all';
    await page.evaluate(() => window.auditRouter.push('/u/remote-player?refresh=1'));
    await trigger.click();
    const dialog = page.getByRole('dialog', { name: 'Gamenote usporedba', exact: true });
    await dialog.getByRole('tab', { name: 'Statistika', exact: true }).click();
    await expect(dialog.getByText('Ocjene i Metacritic', { exact: true })).toBeVisible();
    await expect(dialog.getByText('Sati po platformama', { exact: true })).toBeVisible();
    await expect(dialog.locator('.chart-point')).toHaveCount(4);
    await dialog.locator('.chart-point').first().focus();
    await expect(dialog.locator('.chart-point').first()).toHaveAttribute('aria-pressed', 'true');
    await page.keyboard.press('Enter');
    await expect(dialog.getByRole('img', { name: 'Action', exact: true })).toBeVisible();
    await expect(dialog.getByRole('img', { name: 'RPG', exact: true })).toBeVisible();
    for (const width of [320, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      assert.equal(await dialog.locator('.library-comparison').evaluate(element => element.scrollWidth <= element.clientWidth + 1), true);
      await expect(dialog.locator('.comparison-summary').first().getByText('Completed', { exact: true })).toBeVisible();
      await dialog.screenshot({ animations: 'disabled', path: `${artifacts}/comparison-stats-${width}.png` });
      await dialog.locator('.ratings-chart').scrollIntoViewIfNeeded();
      await expect(dialog.locator('.comparison-heading')).toHaveCSS('position', 'static');
      await dialog.screenshot({ animations: 'disabled', path: `${artifacts}/comparison-charts-${width}.png` });
      assert.equal(await dialog.locator('.chart-axis-title').evaluate(element => Number.parseFloat(getComputedStyle(element).fontSize) >= 12), true, 'Oznake grafa ostaju čitljive');
      const ratingData = dialog.locator('details').first();
      await ratingData.locator('summary').click();
      await expect(ratingData.getByRole('table')).toBeVisible();
      await expect(ratingData.getByRole('rowheader', { name: 'Astra · PC', exact: true })).toBeVisible();
      await ratingData.locator('summary').click();
    }
    await expect(dialog.locator('.identity-wave')).toHaveCount(6);
    await expect(dialog.locator('.identity-left .identity-wave')).toHaveCount(3);
    await expect(dialog.locator('.identity-right .identity-wave')).toHaveCount(3);
    await expect(dialog.getByRole('button', { name: /animaciju bannera/ })).toHaveCount(0);
    await dialog.locator('.comparison-hero').scrollIntoViewIfNeeded();
    await expect(dialog.locator('.identity-wave').first()).toHaveCSS('animation-play-state', 'running');
    assert.equal(await dialog.locator('.identity-wave').evaluateAll(elements => elements.every(element => {
      const style = getComputedStyle(element);
      const duration = Number.parseFloat(style.animationDuration);
      const width = Number.parseFloat(style.getPropertyValue('--wave-width'));
      return duration >= 4.5 && duration <= 18.5 && width >= 145 && width <= 185 && style.animationDirection === 'normal' && style.animationTimingFunction === 'cubic-bezier(0.3, 0.24, 0.7, 0.76)';
    })), true, 'Svaki val ima veličinu i tempo unutar zadanog raspona');
    const beforeWave = await dialog.locator('.identity-wave').first().evaluate(element => getComputedStyle(element).transform);
    await expect.poll(() => dialog.locator('.identity-wave').first().evaluate(element => getComputedStyle(element).transform)).not.toBe(beforeWave);
    await dialog.locator('.library-comparison').evaluate(element => { element.scrollTop = element.scrollHeight; });
    await expect(dialog.locator('.identity-wave').first()).toHaveCSS('animation-play-state', 'paused');
    const preservedReads = requests.length;
    await dialog.locator('.comparison-hero').evaluate(element => { window.comparisonHero = element; });
    await page.evaluate(() => {
      window.auditSession = { ...window.auditSession, user: { ...window.auditSession.user } };
      window.emitAuth('TOKEN_REFRESHED');
      window.auditStore.setSession(window.auditSession);
      window.dispatchEvent(new Event('focus'));
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await expect(dialog.getByRole('tab', { name: 'Statistika', exact: true })).toHaveAttribute('aria-selected', 'true');
    assert.equal(await dialog.locator('.comparison-hero').evaluate(element => element === window.comparisonHero), true, 'Isti korisnik čuva hero i animaciju');
    await dialog.getByRole('tab', { name: 'Igre', exact: true }).click();
    await dialog.getByRole('searchbox', { name: 'Pretraži usporedbu', exact: true }).fill('Astra');
    await page.evaluate(() => window.auditStore.setSession({ ...window.auditSession, user: { ...window.auditSession.user } }));
    await expect(dialog.getByRole('searchbox', { name: 'Pretraži usporedbu', exact: true })).toHaveValue('Astra');
    await expect(dialog.locator('.comparison-game')).toHaveCount(1);
    await expect(dialog.locator('.comparison-game-background')).toHaveAttribute('src', 'https://comparison-avatars.test/screenshot.svg');
    await expect(dialog.getByRole('img', { name: 'Oboje imate ovu igru', exact: true })).toHaveCount(0);
    assert.equal(requests.length, preservedReads, 'Obnova iste sesije ne čita zbirke ponovno');
    const firstRow = dialog.locator('.comparison-game').first();
    await firstRow.getByRole('button', { name: 'Otvori igru: Astra', exact: true }).focus();
    await page.keyboard.press('Enter');
    const gameModal = page.getByRole('dialog', { name: 'Astra', exact: true });
    await expect(gameModal).toBeVisible();
    await expect(gameModal).toContainText('Tvoj opis Astre');
    await expect(gameModal.locator('.card').first()).toContainText('120h igranja');
    await expect(gameModal.locator('.card').first()).toContainText('4/5');
    await expect(gameModal.locator('.card').first()).toContainText('Playing');
    await expect(gameModal.locator('.card').first()).toContainText('40/100');
    await gameModal.screenshot({ animations: 'disabled', path: `${artifacts}/comparison-own-game.png` });
    await expect(gameModal.getByRole('button', { name: 'Već u Gamenoteu', exact: true })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(gameModal).not.toBeVisible();
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('searchbox', { name: 'Pretraži usporedbu', exact: true })).toHaveValue('Astra');
    await firstRow.getByRole('button', { name: 'Otvori poster igre: Astra', exact: true }).click();
    await expect(gameModal).toBeVisible();
    await gameModal.getByLabel('Zatvori igru', { exact: true }).click();
    await dialog.getByRole('searchbox', { name: 'Pretraži usporedbu', exact: true }).fill('Nova igra 00');
    await dialog.getByRole('button', { name: 'Otvori igru: Nova igra 00', exact: true }).click();
    const sharedModal = page.getByRole('dialog', { name: 'Nova igra 00', exact: true });
    await expect(sharedModal).toContainText('Opis iz podijeljene zbirke');
    await expect(sharedModal.getByRole('button', { name: 'Dodaj u Gamenote', exact: true })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(sharedModal).not.toBeVisible();
    await expect(dialog).toBeVisible();
    await dialog.getByRole('searchbox', { name: 'Pretraži usporedbu', exact: true }).fill('Astra');
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
    await page.setViewportSize({ width: 390, height: 900 });
    await dialog.screenshot({ animations: 'disabled', path: `${artifacts}/comparison-dark-390.png` });
    assert.equal(await dialog.locator('.library-comparison').evaluate(element => element.scrollWidth <= element.clientWidth + 1), true);
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
    await dialog.getByRole('button', { name: 'Zatvori usporedbu', exact: true }).click();
    failOwn = true;
    await trigger.click();
    await expect(dialog.getByRole('alert')).toContainText('Usporedbu nije moguće učitati.');
    failOwn = false;
    await dialog.getByRole('button', { name: 'Pokušaj ponovno', exact: true }).click();
    await expect(dialog.locator('.comparison-hero')).toBeVisible();
    await dialog.getByRole('button', { name: 'Zatvori usporedbu', exact: true }).click();
    repeatPage = true;
    await trigger.click();
    await expect(dialog.getByRole('alert')).toBeVisible();
    await expect(dialog.locator('.comparison-game')).toHaveCount(0);
    repeatPage = false;
    await dialog.getByRole('button', { name: 'Pokušaj ponovno', exact: true }).click();
    await expect(dialog.locator('.comparison-hero')).toBeVisible();
    await page.evaluate(() => window.auditRouter.push('/u/local-player'));
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toHaveCount(0);
    ownScope = 'all';
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.evaluate(() => window.auditRouter.push('/u/remote-player'));
    await trigger.click();
    await expect(dialog.locator('.versus-mark')).toHaveCSS('animation-name', 'none');
    await expect(dialog.locator('.identity-wave').first()).toHaveCSS('animation-name', 'none');
    await expect(dialog.locator('.wave-intro').first()).toHaveCSS('animation-name', 'none');
    await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async text => { window.copiedComparison = text; } } }));
    await dialog.getByRole('button', { name: 'Podijeli usporedbu', exact: true }).click();
    const sharing = page.getByRole('dialog', { name: 'Podijeli usporedbu', exact: true });
    await expect(sharing.getByRole('link', { name: 'Otvori pregled', exact: true })).toHaveAttribute('href', 'https://gamenote.eu/compare/local-player/remote-player');
    await sharing.getByRole('button', { name: 'Kopiraj poveznicu', exact: true }).click();
    await expect(sharing.getByRole('status')).toContainText('Poveznica je kopirana.');
    assert.equal(await page.evaluate(() => window.copiedComparison), 'https://gamenote.eu/compare/local-player/remote-player');
    await page.evaluate(() => { navigator.clipboard.writeText = async () => { throw new Error('Testna zabrana'); }; });
    await sharing.getByRole('button', { name: 'Kopiraj poveznicu', exact: true }).click();
    await expect(sharing.getByRole('status')).toContainText('Kopiranje nije uspjelo.');
    await page.keyboard.press('Escape');
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('.versus-brush')).toHaveCSS('animation-name', 'none');
    await expect(dialog.locator('.versus-brush')).toHaveCSS('stroke-dashoffset', '0px');
    await dialog.getByRole('button', { name: 'Zatvori usporedbu', exact: true }).click();
    await page.evaluate(() => { window.savedIntersectionObserver = window.IntersectionObserver; window.IntersectionObserver = undefined; window.savedCommandEvent = window.CommandEvent; delete window.CommandEvent; window.copyCalls = 0; navigator.clipboard.writeText = async () => { window.copyCalls++; }; });
    await trigger.click();
    await expect(dialog.locator('.comparison-hero')).toBeVisible();
    await expect(dialog.locator('.comparison-game')).toHaveCount(24);
    await dialog.getByRole('button', { name: 'Prikaži još', exact: true }).focus();
    await page.keyboard.press('Enter');
    await expect(dialog.locator('.comparison-game')).toHaveCount(48);
    await dialog.getByRole('button', { name: 'Podijeli usporedbu', exact: true }).click();
    await sharing.getByRole('button', { name: 'Kopiraj poveznicu', exact: true }).click();
    await expect(sharing.getByRole('status')).toContainText('Poveznica je kopirana.');
    assert.equal(await page.evaluate(() => window.copyCalls), 1, 'Fallback kopira samo jednom');
    await page.keyboard.press('Escape');
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await page.evaluate(() => { window.IntersectionObserver = window.savedIntersectionObserver; window.CommandEvent = window.savedCommandEvent; });
    holdOwn = true;
    await trigger.click();
    await expect(dialog.getByRole('progressbar', { name: 'Učitavam usporedbu', exact: true })).toHaveCount(1);
    await expect(dialog.locator('.comparison-loader .versus-mark')).toBeVisible();
    await expect(dialog.locator('.skeleton')).toHaveCount(0);
    await expect(dialog.locator('.versus-shimmer rect')).toHaveCSS('animation-duration', '6s');
    assert.equal(await dialog.locator('.versus-ink use').evaluateAll(nodes => nodes.every(node => getComputedStyle(node).fill === getComputedStyle(nodes[0]).fill)), true, 'VS učitavanja je jednobojan');
    await dialog.screenshot({ animations: 'disabled', path: `${artifacts}/comparison-loading.png` });
    await expect.poll(() => Boolean(releaseOwn)).toBe(true);
    await page.evaluate(() => { window.auditSession = null; window.auditStore.clearUser(); });
    await expect(dialog).toHaveCount(0); await expect(trigger).toHaveCount(0);
    holdOwn = false; releaseOwn();
    await expect(page.locator('.comparison-hero')).toHaveCount(0);
    assert.equal(external.some(host => host.includes('onlinewebfonts')), false, 'VS nema vanjski fetch');
    assert.equal(requests.some(request => request.method !== 'GET' && !request.path.endsWith('/rpc/get_public_library')), false, 'Usporedba nema upise');
    await page.evaluate(() => window.auditRouter.push('/compare/local-player/remote-player'));
    const publicContent = page.locator('.public-comparison-content');
    await expect(publicContent.locator('.comparison-hero')).toBeVisible();
    const thirdReads = requests.length;
    await page.evaluate(() => { const user = { id: 'third-viewer', user_metadata: { name: 'Treći igrač' } }; window.auditSession = { user, access_token: 'fixture' }; window.auditStore.setSession(window.auditSession); });
    await expect(publicContent.locator('.identity-left .identity-name')).toContainText('Lokalni igrač');
    await expect(publicContent.locator('.identity-right .identity-name')).toContainText('Udaljeni igrač');
    assert.equal(requests.slice(thirdReads).some(request => request.path.endsWith('/games') || request.path.endsWith('/library_shares')), false, 'Treći korisnik čita samo javne izvore');
    const guestContext = await browser.newContext({ locale: 'hr-HR' });
    await guestContext.route('**/*', fixtureRoute);
    const guest = await guestContext.newPage();
    guest.on('pageerror', error => errors.push(error.message));
    try {
      const guestReads = requests.length;
      await guest.goto(origin + 'compare/local-player/remote-player');
      const content = guest.locator('.public-comparison-content');
      await expect(content.locator('.comparison-hero')).toBeVisible();
      await expect(guest).toHaveTitle('Gamenote: local-player vs remote-player');
      await expect(guest.getByRole('heading', { name: 'Gamenote usporedba', exact: true })).toHaveClass('sr-only');
      await expect(content.locator('.identity-left .identity-name')).toContainText('Lokalni igrač');
      await expect(content.getByRole('link', { name: 'Pogledaj Gamenote @local-player', exact: true })).toBeVisible();
      await expect(content.locator('.identity-avatar img')).toHaveCount(2);
      assert.equal(requests.slice(guestReads).some(request => request.path.endsWith('/games') || request.path.endsWith('/library_shares')), false, 'Gost nikad ne čita privatne tablice');
      for (const width of [320, 390, 1440]) {
        await guest.setViewportSize({ width, height: 1000 });
        assert.equal(await guest.locator('body').evaluate(element => element.scrollWidth <= innerWidth + 1), true, 'Javna usporedba ne prelijeva ekran');
        await guest.screenshot({ animations: 'disabled', path: `${artifacts}/comparison-public-${width}.png` });
      }
      await content.getByRole('tab', { name: 'Statistika', exact: true }).click();
      await expect(content.getByText('Ocjene i Metacritic', { exact: true })).toBeVisible();
      await content.getByRole('tab', { name: 'Igre', exact: true }).click();
      await content.getByRole('button', { name: 'Otvori igru: Astra', exact: true }).click();
      const game = guest.getByRole('dialog', { name: 'Astra', exact: true });
      await expect(game).toContainText('Tvoj opis Astre');
      await expect(game.getByRole('button', { name: 'Dodaj u Gamenote', exact: true })).toHaveCount(0);
      await guest.keyboard.press('Escape');
      scope = 'library';
      await guest.reload();
      await expect(content.getByRole('tab', { name: 'Statistika', exact: true })).toBeDisabled();
      ownScope = 'none';
      await guest.reload();
      await expect(content.getByRole('alert')).toContainText('Usporedba nije dostupna.');
      await expect(content.locator('.comparison-hero')).toHaveCount(0);
      await expect(content.locator('.comparison-game')).toHaveCount(0);
    } finally { await guestContext.close(); }
    assert.deepEqual(errors, []);
    console.log('✓ Usporedba: vlasnik/gost, privatnost, paralelni dohvat, infinite scroll, modali igara, prednost igrača, 320/390/1440 px, statistika i reduced motion');
  } finally { releaseOwn?.(); await context.close(); }
}
