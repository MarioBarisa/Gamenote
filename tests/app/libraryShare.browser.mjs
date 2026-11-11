import assert from 'node:assert/strict';
import { join } from 'node:path';
import { expect } from '@playwright/test';

export async function checkLibrarySharing(browser, origin, artifacts) {
  const context = await browser.newContext();
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  let scope = 'library';
  let saved = { username: 'player-a', share_scope: 'none' };
  const requests = [];
  const insertedGames = [];
  let ownGames = [];
  let failLibraryCheck = false;
  const libraryChecks = [];
  const avatarUploads = [];
  const avatarChecks = [];
  let lastShareSave;
  const avatarPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64');
  const screenshotUrls = ['https://screenshots.fixture.test/1.svg', 'https://screenshots.fixture.test/2.svg', 'https://screenshots.fixture.test/3.svg'];
  const description = `Opis vlasnikove igre.\n\n${'Istraži svijet igre, upoznaj likove i otkrij nove izazove kroz priču i različite zadatke. '.repeat(10)}`;
  const game = { release_date: '2021-01-01', series_games: JSON.stringify([{ id: 11, name: 'Prethodna iz serijala', released: '2020-01-01' }, { id: 13, name: 'Sljedeća iz serijala', released: '2022-01-01' }]), screenshot_urls: JSON.stringify(screenshotUrls), id: 'game-a', title: 'Javna igra', platform: 'PC', play_time: 25, rating: 5, status: 'completed', genre: 'RPG', description, image_url: '/favicon.svg', created_at: '2026-01-01', end_date: '2026-01-05' };
  Object.assign(game, { game_api_id: '12', publisher: 'Javni izdavač', developers: '["Javni studio"]', metacritic_score: 87, esrb_rating: 'Teen' });
  await context.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.hostname === 'screenshots.fixture.test') return route.fulfill({ contentType: 'image/svg+xml', body: `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720"><rect width="1280" height="720" fill="${url.pathname === '/2.svg' ? '#4338ca' : '#0f766e'}"/><text x="640" y="380" text-anchor="middle" fill="white" font-size="96">Screenshot ${url.pathname[1]}</text></svg>` });
    if (url.hostname === 'www.esrb.org') return route.fulfill({ contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="64"><rect width="48" height="64" fill="white"/><text x="8" y="48" font-size="48">T</text></svg>' });
    if (url.pathname === '/.netlify/functions/app-api') {
      const input = route.request().postDataJSON();
      if (input.action === 'avatar') { avatarUploads.push(input); return route.fulfill({ json: { url: 'https://avatars.fixture.test/upload.png' } }); }
      if (input.action === 'avatar-image') { avatarChecks.push(input.url); return route.fulfill({ json: { image: `data:image/png;base64,${avatarPng.toString('base64')}` } }); }
      if (input.path === '/games/13') return route.fulfill({ json: { id: 13, name: 'Sljedeća iz serijala', released: '2022-01-01', platforms: [{ platform: { name: 'PC' } }] } });
      if (input.path === '/games/13/game-series') return route.fulfill({ json: { results: [{ id: 11, name: 'Prethodna iz serijala', released: '2020-01-01' }] } });
      return route.fulfill({ json: { results: [] } });
    }
    if (url.pathname.startsWith('/rest/v1/')) {
      const payload = route.request().postData() ? route.request().postDataJSON() : {};
      if (url.pathname.endsWith('/rpc/get_public_library')) {
        requests.push(payload.p_section);
        let data = null;
        if (scope !== 'none') {
          if (payload.p_section === 'header') data = { username: payload.p_username, name: 'Javni igrač', created_at: '2025-01-01', avatar_url: '', share_scope: scope, platforms: ['PC'], genres: ['RPG'], card: { hours: 25, total: 49, completed: 1, playing: 0, favoriteGame: game, favoriteGenre: { name: 'RPG' } } };
          if (payload.p_section === 'games') data = { items: payload.p_options.search === 'nema' ? [] : [game], total: payload.p_options.search === 'nema' ? 0 : 49 };
          if (payload.p_section === 'groups') data = { items: [{ id: 'group-a', name: 'Javna grupa', type: 'collection', game_count: 1 }], total: 1 };
          if (payload.p_section === 'game') data = game;
          if (payload.p_section === 'stats' && scope === 'all') data = { items: [game], total: 1 };
        }
        return route.fulfill({ json: data });
      }
      if (url.pathname.endsWith('/rpc/check_library_username')) return route.fulfill({ json: { available: payload.p_username !== 'occupied' } });
      if (url.pathname.endsWith('/rpc/save_library_username')) {
        if (payload.p_username === 'race-name') return route.fulfill({ status: 409, json: { code: '23505' } });
        saved = { ...saved, username: payload.p_username };
        return route.fulfill({ json: saved });
      }
      if (url.pathname.endsWith('/rpc/save_library_share')) {
        lastShareSave = payload;
        if (payload.p_username === 'occupied') return route.fulfill({ status: 409, json: { code: '23505' } });
        saved = { username: saved.username || payload.p_username, share_scope: payload.p_scope };
        return route.fulfill({ json: saved });
      }
      if (url.pathname.endsWith('/games') && route.request().method() === 'POST') {
        insertedGames.push(payload[0]); ownGames.push({ ...payload[0], id: 'my-new-game' });
        return route.fulfill({ json: { id: 'my-new-game' } });
      }
      if (url.pathname.endsWith('/games') && route.request().method() === 'GET') {
        if (url.searchParams.get('select') === 'id') {
          libraryChecks.push(Object.fromEntries(url.searchParams));
          if (failLibraryCheck) return route.fulfill({ status: 400, json: { message: 'Testna greška' } });
          const matches = ownGames.filter(entry => url.searchParams.get('game_api_id') ? `eq.${entry.game_api_id}` === url.searchParams.get('game_api_id') : `eq.${entry.title}` === url.searchParams.get('title'));
          return route.fulfill({ json: matches.map(entry => ({ id: entry.id })) });
        }
        if (url.searchParams.get('id')) return route.fulfill({ json: ownGames.find(entry => `eq.${entry.id}` === url.searchParams.get('id')) || null });
      }
      if (url.pathname.endsWith('/library_shares')) return route.fulfill({ json: saved });
      return route.fulfill({ json: [], headers: { 'content-range': '0-0/0' } });
    }
    if (url.origin === origin.replace(/\/$/, '')) return route.continue();
    if (url.hostname === 'avatars.fixture.test') return route.fulfill({ contentType: 'image/png', body: avatarPng });
    if (route.request().resourceType() === 'image') return route.abort();
    return route.fulfill({ json: {} });
  });
  await page.goto(`${origin}__audit`);
  await page.waitForFunction(() => window.auditReady);
  await page.evaluate(async () => { window.auditSession = null; window.auditStore.clearUser(); await window.auditRouter.push('/player-a'); });
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await expect(page.locator('.gamer-card')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Gamenote · Javni igrač', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Gamenote · Javni igrač', exact: true })).toHaveCSS('text-align', 'left');
    await expect(page.locator('.card-email')).toHaveText('– @player-a');
    await expect(page.getByRole('link', { name: 'Statistika', exact: true })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Pogledaj igru: Javna igra' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Detalji', exact: true })).toHaveCount(0);
    if (width >= 1024) await expect(page.getByRole('checkbox', { name: 'TCG', exact: true })).toBeChecked();
    else await expect(page.getByRole('checkbox', { name: 'TCG', exact: true })).not.toBeChecked();
    const bounds = await page.locator('.gamer-card').boundingBox();
    assert.ok(bounds.width <= 576);
    await expect(page.locator('.gamer-card > svg')).toHaveAttribute('viewBox', width < 560 ? '0 0 600 880' : '0 0 960 600');
    const toolbar = page.locator('.public-library .library-toolbar');
    assert.ok((await toolbar.boundingBox()).height < 180);
    await expect(toolbar.getByRole('link', { name: 'Dodaj u Gamenote', exact: true })).toHaveCount(0);
    await expect(page.getByRole('note')).toBeVisible();
    assert.equal(await page.locator('header').getByText('Napravi profil ili se prijavi kako bi dobio puno iskustvo!').count(), 0);
    const position = await page.locator('.tcg-toggle').evaluate(el => !!el.closest('.library-toolbar') && !!el.parentElement.querySelector('input[type=text]') && !!el.parentElement.querySelector('select'));
    assert.equal(position, true);
    await expect(page.locator('.tcg-toggle svg')).toBeVisible();
    const starBounds = await page.locator('.tcg-toggle svg').boundingBox();
    const labelBounds = await page.locator('.tcg-label').boundingBox();
    assert.ok(starBounds.x + starBounds.width <= labelBounds.x);
    if (width >= 1024) {
      const tcgBounds = await page.locator('.tcg-toggle').boundingBox();
      const searchBounds = await page.getByRole('textbox', { name: 'Pretraži igre', exact: true }).boundingBox();
      const controlsBounds = await page.locator('.tcg-toggle').locator('..').boundingBox();
      assert.ok(tcgBounds.x > searchBounds.x + searchBounds.width);
      assert.ok(Math.abs(tcgBounds.x + tcgBounds.width - controlsBounds.x - controlsBounds.width) < 1);
    }
    await expect(page.getByRole('link', { name: width < 640 ? 'Registracija' : 'Napravi profil', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Playing', exact: true })).toBeVisible();
    const navStyle = await page.locator('nav[aria-label="Podijeljena zbirka"] a').first().evaluate(el => ({ size: getComputedStyle(el).fontSize, weight: getComputedStyle(el).fontWeight, icon: !!el.querySelector('svg') }));
    assert.deepEqual(navStyle, { size: '14px', weight: '500', icon: true });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: join(artifacts, `public-library-${width}.png`), fullPage: true });
    await page.getByRole('button', { name: 'Pogledaj igru: Javna igra' }).click();
    const detail = page.getByRole('dialog', { name: 'Javna igra', exact: true });
    await expect(detail.getByRole('heading', { name: 'Serijal', exact: true })).toBeVisible();
    const ordered = await detail.locator('.game-series').evaluate(el => el.previousElementSibling?.tagName === 'DL' && el.nextElementSibling?.classList.contains('game-screenshots'));
    const info = detail.locator('.shared-game-info');
    await expect(info.getByText('Početak igranja', { exact: true })).toHaveCount(0);
    await expect(info.getByText('Završetak igranja', { exact: true })).toHaveCount(0);
    await expect(info.getByRole('progressbar', { name: 'Metacritic' })).toHaveAttribute('aria-valuenow', '87');
    await expect(info.getByRole('progressbar', { name: 'Metacritic' })).toHaveClass(/text-green-600/);
    await expect(info.getByRole('img', { name: 'Teen', exact: true })).toHaveAttribute('src', 'https://www.esrb.org/wp-content/uploads/2019/05/T.svg');
    await expect(info.getByText('Razvojni studio', { exact: true })).toHaveCount(0);
    await expect(info.locator('dt svg')).toHaveCount(4);
    assert.equal(ordered, true);
    const seriesImages = detail.locator('.game-series button img');
    await expect(seriesImages).toHaveCount(2);
    for (const image of await seriesImages.all()) {
      await expect(image).toHaveCSS('object-fit', 'cover');
      const imageBounds = await image.boundingBox();
      const posterBounds = await image.locator('..').boundingBox();
      assert.ok(Math.abs(imageBounds.height - posterBounds.height) < 1);
      assert.ok(Math.abs(imageBounds.width - posterBounds.width) < 1);
    }
    await expect(detail.getByRole('button', { name: 'Podijeli igru', exact: true })).toHaveCount(0);
    await expect(detail.getByRole('link', { name: 'Napravi profil', exact: true })).toHaveCount(0);
    const gameDescription = detail.locator('.shared-game-description');
    await expect(gameDescription).toHaveText(description);
    const readDescription = detail.getByRole('button', { name: 'Pročitaj cijeli opis', exact: true });
    if (width < 640) {
      await expect(readDescription).toBeVisible();
      await expect(readDescription).toHaveAttribute('aria-expanded', 'false');
      await expect(gameDescription).toHaveCSS('-webkit-line-clamp', '3');
      const collapsedHeight = await gameDescription.evaluate(el => el.clientHeight);
      assert.ok(await gameDescription.evaluate(el => el.clientHeight <= Number.parseFloat(getComputedStyle(el).lineHeight) * 3 + 1 && el.scrollHeight > el.clientHeight));
      await readDescription.click();
      const collapseDescription = detail.getByRole('button', { name: 'Sažmi opis', exact: true });
      await expect(collapseDescription).toHaveAttribute('aria-expanded', 'true');
      assert.ok(await gameDescription.evaluate(el => el.clientHeight) > collapsedHeight);
      await collapseDescription.click();
      await expect(gameDescription).toHaveCSS('-webkit-line-clamp', '3');
    } else {
      await expect(readDescription).toBeHidden();
      await expect(gameDescription).toHaveCSS('-webkit-line-clamp', 'none');
    }
    await expect(detail.locator('.shared-game-actions').getByRole('button', { name: 'Zatvori igru', exact: true })).toHaveCount(0);
    if (width === 1440) {
      const strip = detail.locator('.game-screenshots');
      await strip.evaluate(element => { element.scrollLeft = 0; });
      await strip.hover();
      await page.mouse.wheel(0, 120);
      await expect.poll(() => strip.evaluate(element => element.scrollLeft)).toBeGreaterThan(0);
      const position = await strip.evaluate(element => element.scrollLeft);
      await page.mouse.wheel(0, -120);
      await expect.poll(() => strip.evaluate(element => element.scrollLeft)).toBeLessThan(position);
    }
    await detail.getByRole('button', { name: 'Otvori screenshot 2', exact: true }).click();
    const screenshotDialog = page.getByRole('dialog', { name: 'Pregled screenshotova', exact: true });
    await expect(screenshotDialog).toBeVisible();
    await expect(screenshotDialog.getByRole('img')).toHaveAttribute('src', screenshotUrls[1]);
    await expect(screenshotDialog.getByRole('img')).toHaveJSProperty('naturalWidth', 1280);
    await expect(screenshotDialog.locator('.screenshot-counter')).toHaveText('2 / 3');
    await screenshotDialog.getByRole('button', { name: 'Sljedeći screenshot', exact: true }).click();
    await screenshotDialog.getByRole('button', { name: 'Sljedeći screenshot', exact: true }).click();
    await expect(screenshotDialog.getByRole('img')).toHaveAttribute('src', screenshotUrls[0]);
    await screenshotDialog.getByRole('button', { name: 'Prethodni screenshot', exact: true }).click();
    await expect(screenshotDialog.getByRole('img')).toHaveAttribute('src', screenshotUrls[2]);
    await expect(screenshotDialog.locator('.screenshot-counter')).toHaveText('3 / 3');
    await page.screenshot({ path: join(artifacts, `shared-screenshot-${width}.png`) });
    await page.mouse.click(4, 4);
    await expect(screenshotDialog).toBeHidden();
    await expect(detail).toBeVisible();
    await detail.getByRole('button', { name: 'Otvori screenshot 1', exact: true }).click();
    await screenshotDialog.getByRole('button', { name: 'Zatvori screenshot', exact: true }).click();
    await expect(screenshotDialog).toBeHidden();
    await expect(detail).toBeVisible();
    await page.screenshot({ path: join(artifacts, `public-game-series-${width}.png`), fullPage: true });
    if (width < 640) await readDescription.click();
    if (width === 390) await page.mouse.click(4, 4);
    else await detail.getByRole('button', { name: 'Zatvori igru', exact: true }).first().click();
    await expect(page.locator('dialog[aria-labelledby="shared-game-title"]')).toHaveCSS('visibility', 'hidden');

  }
  game.screenshot_urls = JSON.stringify([screenshotUrls[0]]);
  await page.getByRole('button', { name: 'Pogledaj igru: Javna igra', exact: true }).click();
  await page.getByRole('button', { name: 'Otvori screenshot 1', exact: true }).click();
  const singleScreenshot = page.getByRole('dialog', { name: 'Pregled screenshotova', exact: true });
  await expect(singleScreenshot.locator('.screenshot-counter')).toHaveText('1 / 1');
  await expect(singleScreenshot.getByRole('button', { name: 'Prethodni screenshot', exact: true })).toHaveCount(0);
  await expect(singleScreenshot.getByRole('button', { name: 'Sljedeći screenshot', exact: true })).toHaveCount(0);
  await page.evaluate(() => window.auditRouter.push('/player-a?status=playing'));
  await expect(singleScreenshot).toBeHidden();
  await page.locator('dialog[aria-labelledby="shared-game-title"] .modal-box').getByRole('button', { name: 'Zatvori igru', exact: true }).click();
  game.screenshot_urls = JSON.stringify(screenshotUrls);
  await page.getByRole('button', { name: '5/5', exact: true }).click();
  await expect(page).toHaveURL(/status=rated-5/);
  await expect(page.getByRole('button', { name: '5/5', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: '5/5', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Sve', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('textbox', { name: 'Pretraži igre', exact: true }).fill('nema');
  await expect(page.getByText('Nema igara za prikaz.', { exact: true })).toBeVisible();
  await page.getByRole('textbox', { name: 'Pretraži igre', exact: true }).fill('');
  await expect(page.getByRole('button', { name: 'Pogledaj igru: Javna igra' })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 1000 });
  await page.getByRole('combobox', { name: 'Sortiranje igara' }).selectOption('title:desc');
  await expect(page).toHaveURL(/sort=title_desc/);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.getByRole('checkbox', { name: 'TCG', exact: true }).click();
  await expect(page.locator('hover-tilt')).toHaveCount(0);
  await page.getByRole('checkbox', { name: 'TCG', exact: true }).click();
  await expect(page.locator('.tcg-sparkles')).toBeAttached();
  await expect(page.locator('.tcg-toggle')).toHaveCSS('outline-style', 'none');
  await expect.poll(() => page.locator('.tcg-sparkles').evaluate(el => Array.from(el.children).some(spark => Number.parseFloat(getComputedStyle(spark).opacity) > 0.5))).toBe(true);
  const sparkleBounds = await page.locator('.tcg-toggle').boundingBox();
  await page.screenshot({ path: join(artifacts, 'tcg-sparkles.png'), clip: { x: sparkleBounds.x - 16, y: sparkleBounds.y - 16, width: sparkleBounds.width + 32, height: sparkleBounds.height + 32 } });
  await expect.poll(() => page.locator('.tcg-sparkles').evaluate(el => el.getAnimations({ subtree: true }).every(animation => animation.playState === 'finished'))).toBe(true);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByRole('checkbox', { name: 'TCG', exact: true }).click();
  await page.getByRole('checkbox', { name: 'TCG', exact: true }).click();
  await expect(page.locator('.tcg-sparkles')).toBeHidden();
  await expect(page.getByRole('checkbox', { name: 'TCG', exact: true })).toBeChecked();
  await page.getByRole('checkbox', { name: 'TCG', exact: true }).click();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.getByRole('button', { name: 'Sljedeća' }).click();
  await expect(page).toHaveURL(/page=2/);
  let before = page.url();
  await page.getByRole('button', { name: 'Pogledaj igru: Javna igra' }).click();
  await expect(page.getByText('Opis vlasnikove igre')).toBeVisible();
  assert.equal(page.url(), before);
  const gameDialog = page.getByRole('dialog', { name: 'Javna igra', exact: true });
  await gameDialog.getByRole('button', { name: 'Sljedeća igra: Sljedeća iz serijala' }).click();
  const related = page.getByRole('dialog', { name: 'Sljedeća iz serijala', exact: true });
  await expect(related).toBeVisible();
  await expect(related.getByRole('button', { name: 'Pročitaj cijeli opis', exact: true })).toHaveCount(0);
  await expect(related.getByText('Ova igra je najnovija u seriji! 😊', { exact: true })).toBeVisible();
  assert.equal(page.url(), before);
  await related.getByRole('button', { name: 'Zatvori igru', exact: true }).first().click();
  await page.getByRole('button', { name: 'Pogledaj igru: Javna igra' }).click();
  await expect(gameDialog).toBeVisible();
  await gameDialog.getByRole('button', { name: 'Zatvori igru', exact: true }).first().click();
  await page.locator('nav[aria-label="Podijeljena zbirka"]').getByRole('link', { name: 'Grupe', exact: true }).click();
  await expect(page.getByRole('checkbox', { name: 'TCG', exact: true })).toHaveCount(0);
  before = page.url();
  const sharedGroup = page.getByRole('button', { name: 'Otvori grupu: Javna grupa' });
  await sharedGroup.scrollIntoViewIfNeeded();
  await expect(sharedGroup.locator('img')).toHaveAttribute('src', game.image_url);
  await sharedGroup.click();
  const groupDialog = page.getByRole('dialog', { name: 'Javna grupa', exact: true });
  await expect(groupDialog).toBeVisible();
  assert.equal(page.url(), before);
  await groupDialog.getByRole('button', { name: 'Pogledaj igru: Javna igra' }).click();
  await expect(gameDialog).toBeVisible();
  await gameDialog.getByRole('button', { name: 'Zatvori igru', exact: true }).first().click();
  await expect(groupDialog).toBeVisible();
  await groupDialog.getByRole('button', { name: 'Zatvori grupu', exact: true }).first().click();
  await page.evaluate(() => window.auditRouter.push('/player-a?tab=stats'));
  await expect(page).toHaveURL(/\/player-a$/);
  assert.equal(requests.includes('stats'), false);
  scope = 'all';
  await page.evaluate(() => window.auditRouter.push('/player-a?tab=stats'));
  await expect(page.getByRole('heading', { name: 'Gamenote Statistika' })).toBeVisible();
  await expect(page.locator('canvas').first()).toBeVisible();
  await expect(page.getByRole('checkbox', { name: 'TCG', exact: true })).toHaveCount(0);
  await page.evaluate(async () => { window.auditSession = { user: { id: 'user-a', email: 'private@example.test' }, access_token: 'fixture' }; window.auditStore.setUser(window.auditSession.user); });
  await expect(page).toHaveURL(/\/u\/player-a/);
  await expect(page.locator('.gamer-card')).toBeVisible();
  await page.evaluate(async () => {
    const { useThemeStore } = await import('/src/stores/theme.js');
    const { useCardSizeStore } = await import('/src/stores/cardSize.js');
    useThemeStore().setTcgMode(true);
    useCardSizeStore().saveCardSize('large');
    await window.auditRouter.push('/u/player-a');
  });
  await expect(page.getByRole('checkbox', { name: 'TCG', exact: true })).toBeChecked();
  await expect(page.locator('.tcg-toggle')).toHaveCSS('background-image', /linear-gradient/);
  await expect(page.locator('.public-library hover-tilt')).toHaveCount(1);
  await expect(page.locator('.public-library .grid').last()).toHaveClass(/lg:grid-cols-4/);
  assert.equal(libraryChecks.length, 0);
  ownGames = [{ ...game, id: 'my-existing-game', title: 'Moj promijenjeni naslov' }];
  failLibraryCheck = true;
  await page.getByRole('button', { name: 'Pogledaj igru: Javna igra' }).click();
  await expect(gameDialog.getByRole('alert')).toContainText('Nije moguće provjeriti tvoj Gamenote');
  await expect(gameDialog.getByRole('button', { name: 'Dodaj u Gamenote', exact: true })).toHaveCount(0);
  failLibraryCheck = false;
  await gameDialog.getByRole('button', { name: 'Ponovi provjeru', exact: true }).click();
  const ownGameButton = gameDialog.getByRole('button', { name: 'Već u Gamenoteu', exact: true });
  await expect(ownGameButton).toHaveClass(/btn-success/);
  assert.equal(libraryChecks.at(-1).user_id, 'eq.user-a');
  assert.equal(libraryChecks.at(-1).game_api_id, 'eq.12');
  await ownGameButton.click();
  await expect(page).toHaveURL(/\/game\/my-existing-game$/);
  ownGames = [];
  await page.evaluate(() => window.auditRouter.push('/u/player-a'));
  await page.getByRole('button', { name: 'Pogledaj igru: Javna igra' }).click();
  const gameActions = gameDialog.locator('.shared-game-actions');
  await expect(gameDialog.getByRole('button', { name: 'Podijeli igru', exact: true })).toHaveCount(0);
  await expect(gameDialog.getByRole('link', { name: 'Napravi profil', exact: true })).toHaveCount(0);
  await expect(gameActions.getByRole('button', { name: 'Zatvori igru', exact: true })).toHaveCount(0);
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await gameActions.getByRole('button', { name: 'Dodaj u Gamenote' }).scrollIntoViewIfNeeded();
    assert.equal(await gameActions.evaluate(el => el.scrollWidth <= el.clientWidth), true);
    const positions = await gameActions.locator('button').evaluateAll(buttons => buttons.map(el => el.getBoundingClientRect().top));
    assert.ok(Math.max(...positions) - Math.min(...positions) < 1);
    await page.screenshot({ path: join(artifacts, `shared-game-actions-${width}.png`), fullPage: true });
  }
  await gameDialog.getByRole('button', { name: 'Dodaj u Gamenote' }).click();
  const addDialog = page.getByRole('dialog', { name: 'Dodaj u Gamenote', exact: true });
  await expect(addDialog).toBeVisible();
  await expect(addDialog.getByLabel('Status', { exact: true })).toHaveValue('backlog');
  await expect(addDialog.getByLabel('Ocjena', { exact: true })).toHaveValue('0');
  await expect(addDialog.getByLabel('Sati igranja', { exact: true })).toHaveValue('');
  await addDialog.getByLabel('Platforma', { exact: true }).fill('PlayStation 5');
  await addDialog.getByRole('button', { name: 'Dodaj u Gamenote', exact: true }).click();
  await expect(addDialog.getByRole('status')).toContainText('Igra je dodana');
  assert.equal(insertedGames.length, 1);
  assert.equal(insertedGames[0].user_id, 'user-a');
  assert.equal(insertedGames[0].progress_unit, 'trophies');
  assert.equal(insertedGames[0].rating, null);
  assert.equal(insertedGames[0].play_time, null);
  assert.equal(insertedGames[0].status, 'backlog');
  await addDialog.getByRole('button', { name: 'Zatvori dodavanje igre', exact: true }).click();
  await expect(ownGameButton).toHaveClass(/btn-success/);
  await gameDialog.getByRole('button', { name: 'Zatvori igru', exact: true }).first().click();
  await page.getByRole('button', { name: 'Pogledaj igru: Javna igra' }).click();
  await expect(ownGameButton).toHaveClass(/btn-success/);
  await ownGameButton.click();
  await expect(page).toHaveURL(/\/game\/my-new-game$/);
  await page.evaluate(() => window.auditRouter.push('/profile'));
  await page.evaluate(() => {
    window.avatarUpdates = [];
    window.auditDb.auth.updateUser = async payload => {
      window.avatarUpdates.push(payload);
      window.auditSession.user.user_metadata = { ...window.auditSession.user.user_metadata, ...payload.data };
      return { data: { user: window.auditSession.user }, error: null };
    };
  });
  const infoButton = page.getByRole('button', { name: 'Uredi info', exact: true });
  await expect(infoButton.locator('svg')).toHaveCount(1);
  await expect(page.getByRole('button', { name: 'Promijeni profilnu sliku', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Promjeni korisničko ime', exact: true })).toHaveCount(0);
  await page.getByLabel('Ime', { exact: true }).fill('Nespremljeno ime');
  await infoButton.click();
  const infoDialog = page.getByRole('dialog', { name: 'Uredi info', exact: true });
  const avatarSection = infoDialog.getByRole('region', { name: 'Profilna slika', exact: true });
  const usernameSection = infoDialog.getByRole('region', { name: 'Korisničko ime', exact: true });
  const avatarLink = avatarSection.getByRole('textbox', { name: 'Izravna poveznica na sliku' });
  const avatarFile = avatarSection.getByLabel('Odaberi sliku s uređaja', { exact: true });
  await avatarLink.fill('javascript:alert(1)');
  await avatarSection.getByRole('button', { name: 'Spremi sliku', exact: true }).click();
  await expect(avatarSection.getByRole('alert')).toContainText('HTTP ili HTTPS');
  assert.equal((await page.evaluate(() => window.avatarUpdates)).length, 0);
  await avatarLink.fill('https://avatars.fixture.test/direct.png');
  await avatarSection.getByRole('button', { name: 'Spremi sliku', exact: true }).click();
  await expect(avatarSection.getByRole('status')).toContainText('Profilna slika je spremljena');
  await expect(infoDialog).toBeVisible();
  assert.deepEqual(await page.evaluate(() => window.avatarUpdates[0]), { data: { avatar_url: 'https://avatars.fixture.test/direct.png' } });
  await expect(page.getByLabel('Ime', { exact: true })).toHaveValue('Nespremljeno ime');
  await expect(page.getByAltText('Profilna slika', { exact: true })).toHaveAttribute('src', 'https://avatars.fixture.test/direct.png');
  await infoDialog.getByRole('button', { name: 'Zatvori uređivanje informacija', exact: true }).click();
  await expect(infoDialog).toBeHidden();
  await infoButton.click();
  await avatarLink.fill('https://avatars.fixture.test/cancelled.png');
  await page.mouse.click(4, 4);
  await expect(infoDialog).toBeHidden();
  assert.equal((await page.evaluate(() => window.avatarUpdates)).length, 1);
  await infoButton.click();
  await avatarFile.setInputFiles({ name: 'large.png', mimeType: 'image/png', buffer: Buffer.alloc(3 * 1024 * 1024 + 1) });
  await expect(avatarSection.getByRole('alert')).toContainText('3 MB');
  await avatarFile.setInputFiles({ name: 'invalid.svg', mimeType: 'image/svg+xml', buffer: Buffer.from('<svg/>') });
  await expect(avatarSection.getByRole('alert')).toContainText('JPG, PNG, GIF ili WebP');
  assert.equal(avatarUploads.length, 0);
  await avatarFile.setInputFiles({ name: 'avatar.png', mimeType: 'image/png', buffer: avatarPng });
  await expect(avatarSection.getByRole('status')).toContainText('Slika je prenesena');
  await expect(avatarLink).toHaveValue('https://avatars.fixture.test/upload.png');
  await avatarSection.getByRole('button', { name: 'Spremi sliku', exact: true }).click();
  await expect(avatarSection.getByRole('status')).toContainText('Profilna slika je spremljena');
  assert.equal(avatarUploads.length, 1);
  assert.ok(avatarChecks.includes('https://avatars.fixture.test/direct.png'));
  assert.deepEqual(await page.evaluate(() => window.avatarUpdates[1]), { data: { avatar_url: 'https://avatars.fixture.test/upload.png' } });
  assert.equal(await infoDialog.evaluate(el => el.closest('.profile-form') === null), true);
  const usernameInput = usernameSection.getByRole('textbox', { name: 'Korisničko ime', exact: true });
  const check = usernameSection.getByRole('button', { name: 'Provjeri dostupnost', exact: true });
  const saveUsername = usernameSection.getByRole('button', { name: 'Spremi korisničko ime', exact: true });
  await usernameInput.fill('occupied');
  await check.click();
  await expect(usernameSection.getByRole('status')).toContainText('zauzeto');
  await expect(saveUsername).toBeDisabled();
  await usernameInput.fill('race-name');
  await check.click();
  await expect(saveUsername).toBeEnabled();
  await saveUsername.click();
  await expect(usernameSection.getByRole('alert')).toContainText('zauzeto');
  await usernameInput.fill('NEW-PROFILE');
  await check.click();
  await expect(usernameSection.getByRole('status')).toContainText('dostupno');
  await saveUsername.click();
  await expect(usernameSection.getByRole('status')).toContainText('spremljeno');
  assert.equal(saved.username, 'new-profile');
  assert.equal(saved.share_scope, 'none');
  await expect(page.locator('dialog[open]')).toHaveCount(1);
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    assert.equal(await infoDialog.evaluate(el => el.querySelector('.modal-box').scrollWidth <= el.querySelector('.modal-box').clientWidth), true);
    await page.screenshot({ path: join(artifacts, `profile-info-${width}.png`) });
  }
  await expect(infoDialog.locator('.modal-box').getByRole('button', { name: 'Zatvori', exact: true })).toHaveCount(0);
  await infoDialog.getByRole('button', { name: 'Zatvori uređivanje informacija', exact: true }).click();
  await expect(infoDialog).toBeHidden();
  await page.setViewportSize({ width: 390, height: 1000 });
  for (const name of ['Uredi info', 'Podijeli Gamenote', 'Uredi karticu', 'Preuzmi karticu', 'Spremi promjene', 'Odjavi se']) {
    const action = page.getByRole('button', { name, exact: true });
    await expect(action.locator('svg')).toHaveCount(['Uredi info', 'Preuzmi karticu', 'Podijeli Gamenote'].includes(name) ? 1 : 0);
    if (name !== 'Preuzmi karticu') assert.equal((await action.innerText()).trim(), name);
  }
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    const infoBounds = await infoButton.boundingBox();
    const profileShareBounds = await page.getByRole('button', { name: 'Podijeli Gamenote', exact: true }).boundingBox();
    const profileSaveBounds = await page.getByRole('button', { name: 'Spremi promjene', exact: true }).boundingBox();
    assert.ok(Math.abs(infoBounds.y - profileShareBounds.y) < 1);
    assert.ok(profileShareBounds.x >= infoBounds.x + infoBounds.width);
    assert.ok(profileSaveBounds.y >= profileShareBounds.y + profileShareBounds.height);
  }
  await page.setViewportSize({ width: 390, height: 1000 });
  await page.getByRole('button', { name: 'Spremi promjene', exact: true }).click();
  await expect.poll(() => page.evaluate(() => window.avatarUpdates.at(-1)?.data)).toEqual({ name: 'Nespremljeno ime' });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: join(artifacts, 'profile-mobile-actions.png'), fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.evaluate(() => window.auditRouter.push('/stats'));
  for (const path of ['/profile', '/library', '/groups', '/stats']) {
    await page.evaluate(path => window.auditRouter.push(path), path);
    const shareButton = page.getByRole('button', { name: 'Podijeli Gamenote', exact: true });
    if (path === '/groups' || path === '/stats') { await expect(shareButton).toHaveCount(0); continue; }
    await expect(shareButton).toHaveClass(/btn-primary/);
    await expect(shareButton.locator('svg')).toHaveCount(1);
    await expect(shareButton.locator('svg path').first()).toHaveAttribute('d', path === '/profile' ? /^M12\.004 21/ : /^M7 10H6/);
    if (path === '/library') {
      for (const label of ['Paused', '5/5']) {
        const filter = page.getByRole('button', { name: label, exact: true });
        await filter.click();
        await expect(filter).toHaveAttribute('aria-pressed', 'true');
        await filter.click();
        await expect(page.getByRole('button', { name: 'Sve', exact: true })).toHaveAttribute('aria-pressed', 'true');
      }
      const filterBounds = await page.getByRole('button', { name: 'Sve', exact: true }).boundingBox();
      const shareBounds = await shareButton.boundingBox();
      assert.ok(Math.abs(filterBounds.y - shareBounds.y) < 4);
      const libraryTcg = page.locator('.library-toolbar-actions').getByRole('checkbox', { name: 'TCG', exact: true });
      await expect(libraryTcg).toBeChecked();
      await libraryTcg.click();
      await expect(libraryTcg).not.toBeChecked();
      assert.equal(await page.evaluate(async () => (await import('/src/stores/theme.js')).useThemeStore().tcgMode), false);
      for (const width of [320, 390, 1440]) {
        await page.setViewportSize({ width, height: 1000 });
        const tcgBounds = await page.locator('.library-toolbar-actions .tcg-toggle').boundingBox();
        const addBounds = await page.locator('.library-toolbar-actions').getByRole('link', { name: 'Dodaj u Gamenote', exact: true }).boundingBox();
        assert.ok(tcgBounds.x + tcgBounds.width < addBounds.x);
        assert.ok(Math.abs(tcgBounds.y - addBounds.y) < 1);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
        const differentBackground = await page.locator('.tcg-toggle').evaluate(el => getComputedStyle(el).backgroundColor !== getComputedStyle(el.closest('.library-toolbar')).backgroundColor);
        assert.equal(differentBackground, true);
        await page.screenshot({ path: join(artifacts, `library-tcg-${width}.png`), fullPage: true });
      }

    }
    const iconIsFirst = await shareButton.evaluate(el => el.firstElementChild.tagName.toLowerCase() === 'svg' && el.lastElementChild.textContent === 'Podijeli Gamenote');
    assert.equal(iconIsFirst, true);
  }
  await page.evaluate(() => window.auditRouter.push('/library'));
  await expect(page.getByRole('checkbox', { name: 'TCG', exact: true })).not.toBeChecked();
  await page.getByRole('button', { name: 'Podijeli Gamenote' }).click();
  const shareDialog = page.getByRole('dialog', { name: 'Dijeljenje Gamenotea', exact: true });
  await expect(shareDialog).toBeVisible();
  for (const text of ['Gamenote ostaje privatan.', 'Tvoje igre i grupe.', 'Gamenote i svi grafovi statistike.']) await expect(shareDialog.getByText(text, { exact: true })).toBeVisible();
  await expect(shareDialog.getByRole('textbox', { name: 'Javno korisničko ime', exact: true })).toHaveCount(0);
  await expect(shareDialog.getByRole('radio')).toHaveCount(3);
  await expect(shareDialog.getByRole('radio', { name: 'Sve', exact: true })).toBeVisible();
  await shareDialog.getByRole('radio', { name: 'Sve', exact: true }).check();
  await shareDialog.getByRole('button', { name: 'Spremi', exact: true }).click();
  await expect(shareDialog.getByRole('button', { name: 'Kopiraj poveznicu' })).toBeVisible();
  await expect(shareDialog.locator('code.share-link')).toHaveText('https://gamenote.eu/new-profile');
  await expect(shareDialog.locator('.modal-box').getByRole('button', { name: 'Zatvori', exact: true })).toHaveCount(0);
  assert.equal(saved.username, 'new-profile');
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    assert.equal(await shareDialog.evaluate(el => el.querySelector('.modal-box').scrollWidth <= el.querySelector('.modal-box').clientWidth), true);
    assert.equal(await shareDialog.locator('code.share-link').evaluate(el => el.scrollWidth <= el.clientWidth), true);
    const shareActions = shareDialog.locator('.library-share-actions');
    const actionTops = await shareActions.locator('button, a').evaluateAll(elements => elements.map(el => el.getBoundingClientRect().top));
    assert.ok(Math.max(...actionTops) - Math.min(...actionTops) < 1);
    assert.equal(await shareActions.evaluate(el => el.scrollWidth <= el.clientWidth), true);
    for (const action of [shareActions.getByRole('button', { name: 'Kopiraj poveznicu' }), shareActions.getByRole('link', { name: 'Otvori pregled' })]) {
      await expect(action.locator('svg')).toBeVisible();
      if (width < 640) await expect(action.locator('span')).toBeHidden();
      else await expect(action.locator('span')).toBeVisible();
    }
    await page.screenshot({ path: join(artifacts, `share-options-${width}.png`), fullPage: true });
  }
  await shareDialog.getByRole('button', { name: 'Zatvori dijeljenje Gamenotea', exact: true }).click();
  saved = { username: '', share_scope: 'none' };
  await page.getByRole('button', { name: 'Podijeli Gamenote' }).click();
  await expect(shareDialog.getByLabel('Javno korisničko ime', { exact: true })).toBeVisible();
  await shareDialog.getByLabel('Javno korisničko ime', { exact: true }).fill('occupied');
  await shareDialog.getByRole('radio', { name: 'Sve', exact: true }).check();
  await shareDialog.getByRole('button', { name: 'Spremi', exact: true }).click();
  await expect(shareDialog.getByRole('alert')).toContainText('zauzeto');
  await shareDialog.getByLabel('Javno korisničko ime', { exact: true }).fill('new-player');
  await shareDialog.getByRole('button', { name: 'Spremi', exact: true }).click();
  await expect(shareDialog.getByRole('button', { name: 'Kopiraj poveznicu' })).toBeVisible();
  await expect(shareDialog.getByRole('textbox', { name: 'Javno korisničko ime', exact: true })).toHaveCount(0);
  assert.equal(saved.username, 'new-player');
  await shareDialog.getByRole('button', { name: 'Zatvori dijeljenje Gamenotea', exact: true }).click();
  await page.getByRole('button', { name: 'Podijeli Gamenote' }).click();
  saved = { username: 'renamed-in-another-tab', share_scope: 'all' };
  await shareDialog.getByRole('radio', { name: 'Igre i grupe', exact: true }).check();
  await shareDialog.getByRole('button', { name: 'Spremi', exact: true }).click();
  await expect(shareDialog.locator('code.share-link')).toHaveText('https://gamenote.eu/renamed-in-another-tab');
  assert.equal(lastShareSave.p_username, null);
  await shareDialog.getByRole('button', { name: 'Zatvori dijeljenje Gamenotea', exact: true }).click();
  scope = 'none';
  await page.evaluate(() => window.auditRouter.push('/u/player-a'));
  await expect(page.getByRole('alert')).toContainText('Zbirka nije dostupna');
  await expect(page.locator('.gamer-card')).toHaveCount(0);
  assert.deepEqual(errors, []);
  await context.close();
  console.log('✓ Dijeljenje: zajednički navbar/filteri, kompaktna kartica, modali, dodavanje, TCG, stats i 320/390/1440 px');
}
