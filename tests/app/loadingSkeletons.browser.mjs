import assert from 'node:assert/strict';
import { join } from 'node:path';
import { expect } from '@playwright/test';

async function checkRows(grid, columns) {
  await expect(grid).toBeVisible();
  await expect.poll(() => grid.locator('.loading-card').evaluateAll(cards => {
    const rows = {};
    for (const card of cards) {
      const row = Math.round(card.getBoundingClientRect().top);
      rows[row] = (rows[row] || 0) + 1;
    }
    return Object.values(rows);
  })).toEqual([columns, columns]);
}

export async function checkLoadingSkeletons(browser, origin, artifacts) {
  const context = await browser.newContext();
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const gates = new Map();
  function hold(key) {
    let resume;
    const promise = new Promise(resolve => { resume = resolve; });
    const release = () => { gates.delete(key); resume(); };
    gates.set(key, { promise, release });
    return release;
  }
  const game = { id: 'loading-game', user_id: 'user-a', title: 'Učitana igra', platform: 'PC', status: 'backlog', image_url: '/game-placeholder.svg', rating: 5, end_date: '2025-01-02' };
  const secondGame = { ...game, id: 'loading-short-game', title: 'Igra bez ocjene', rating: null, end_date: null };
  const group = { id: 'loading-group', user_id: 'user-a', name: 'Učitana grupa', type: 'collection', game_count: 1 };
  await context.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.pathname === '/.netlify/functions/app-api') {
      const input = route.request().postDataJSON();
      if (input.path === '/games/13') {
        await gates.get('shared-game')?.promise;
        return route.fulfill({ json: { id: 13, name: 'Dijeljena igra', background_image: '/game-placeholder.svg', genres: [], platforms: [] } });
      }
      return route.fulfill({ json: { results: [] } });
    }
    if (url.hostname === 'supabase.audit.test' && url.pathname.startsWith('/rest/v1/')) {
      if (url.pathname.endsWith('/rpc/get_public_library')) {
        const { p_section, p_options } = route.request().postDataJSON();
        const section = p_section === 'games' && p_options.group ? 'group-games' : p_section;
        await gates.get(`public-${section}`)?.promise;
        if (p_section === 'header') return route.fulfill({ json: { username: 'loader-user', name: 'Učitan profil', share_scope: 'all', card: {} } });
        if (p_section === 'groups') return route.fulfill({ json: { items: [group], total: 1 } });
        return route.fulfill({ json: { items: [game], total: 1 } });
      }
      const table = url.pathname.split('/').at(-1);
      const single = table === 'groups' && url.searchParams.has('id');
      await gates.get(single ? 'group-detail' : table)?.promise;
      if (single) return route.fulfill({ json: group });
      let rows = [];
      if (table === 'games') rows = [game, secondGame];
      if (table === 'groups') rows = [group];
      if (table === 'game_groups') rows = [{ id: 'loading-link', group_id: group.id, game_id: game.id, games: game }];
      return route.fulfill({ json: rows, headers: { 'content-range': rows.length ? `0-${rows.length - 1}/${rows.length}` : '*/0' } });
    }
    if (url.origin === new URL(origin).origin) return route.continue();
    return route.abort();
  });
  const navigate = path => page.evaluate(path => window.auditRouter.push(path), path);
  try {
    await page.goto(`${origin}__audit`);
    await page.waitForFunction(() => window.auditReady);
    const releaseGames = hold('games');
    await navigate('/library');
    const libraryGrid = page.locator('.games-list .loading-card-grid');
    for (const [size, mobile, desktop] of [['small', 2, 7], ['medium', 2, 6], ['large', 1, 4]]) {
      await page.evaluate(async size => (await import('/src/stores/cardSize.js')).useCardSizeStore().saveCardSize(size), size);
      for (const [width, columns] of [[320, mobile], [390, mobile], [1440, desktop]]) {
        await page.setViewportSize({ width, height: 1000 });
        await checkRows(libraryGrid, columns);
        const poster = await libraryGrid.locator('.loading-card > .skeleton').first().boundingBox();
        assert.ok(Math.abs(poster.width / poster.height - 0.75) < 0.02);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
        if (size === 'medium') await page.screenshot({ path: join(artifacts, `library-loading-${width}.png`) });
      }
    }
    releaseGames();
    await expect(page.locator('.game-card').getByRole('heading', { name: game.title })).toBeVisible();
    await expect(libraryGrid).toHaveCount(0);
    const cards = page.locator('.games-list .game-card');
    const heights = await cards.evaluateAll(elements => elements.map(el => el.offsetHeight));
    assert.equal(heights.length, 2);
    assert.equal(heights[0], heights[1]);
    await page.getByRole('checkbox', { name: 'TCG', exact: true }).check();
    await expect(page.locator('hover-tilt').first().locator('[part="tilt"]')).toBeVisible();
    await expect.poll(() => cards.evaluateAll(elements => elements.map(el => el.offsetHeight))).toEqual(heights);

    const releaseGroups = hold('groups');
    await navigate('/groups');
    const groupGrid = page.locator('.groups-page .loading-card-grid');
    for (const [width, columns] of [[320, 1], [768, 2], [1440, 3]]) {
      await page.setViewportSize({ width, height: 1000 });
      await checkRows(groupGrid, columns);
    }
    await page.screenshot({ path: join(artifacts, 'groups-loading-1440.png') });
    releaseGroups();
    const privateGroup = page.getByRole('button', { name: `Otvori grupu: ${group.name}`, exact: true });
    await expect(privateGroup.locator('img')).toHaveAttribute('src', game.image_url);
    await expect(groupGrid).toHaveCount(0);

    const releaseDetail = hold('group-detail');
    await navigate(`/groups/${group.id}`);
    await checkRows(page.locator('.group-details .loading-card-grid'), 4);
    releaseDetail();
    await expect(page.locator('.group-details .game-card')).toBeVisible();

    await page.evaluate(() => { window.auditSession = null; window.auditStore.clearUser(); });
    const releaseHeader = hold('public-header');
    const releasePublicGames = hold('public-games');
    await navigate('/loader-user');
    const publicGrid = page.locator('.public-library .loading-card-grid');
    for (const [width, columns] of [[320, 2], [1440, 6]]) {
      await page.setViewportSize({ width, height: 1000 });
      await checkRows(publicGrid, columns);
      const card = await page.locator('.gamercard-skeleton').boundingBox();
      const ratio = width === 320 ? 600 / 880 : 960 / 600;
      assert.ok(Math.abs(card.width / card.height - ratio) < 0.02);
      await page.screenshot({ path: join(artifacts, `public-library-loading-${width}.png`) });
    }
    releaseHeader();
    await expect(page.locator('.gamer-card')).toBeVisible();
    await checkRows(publicGrid, 6);
    await expect(page.getByRole('navigation', { name: 'Podijeljena zbirka' })).toBeVisible();
    await expect(page.getByRole('group', { name: 'Filteri statusa' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Pretraži igre' })).toBeVisible();
    assert.equal(await page.locator('.public-library .skeleton').evaluateAll(elements =>
      elements.filter(element => !element.closest('.loading-card-grid')).length,
    ), 0);
    releasePublicGames();
    await expect(page.getByRole('button', { name: `Pogledaj igru: ${game.title}` })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Pretraži igre' })).toBeVisible();
    await expect(publicGrid).toHaveCount(0);

    await page.evaluate(() => {
      window.auditSession = { user: { id: 'user-a', email: 'fixture@example.test' }, access_token: 'fixture' };
      window.auditStore.setUser(window.auditSession.user);
    });
    await expect(page).toHaveURL(new URL('u/loader-user', origin).href);
    const releasePublicGroups = hold('public-groups');
    await navigate('/u/loader-user?tab=groups');
    await checkRows(publicGrid, 3);
    releasePublicGroups();
    const releaseGroupGames = hold('public-group-games');
    await page.getByRole('button', { name: `Otvori grupu: ${group.name}` }).click();
    const groupDialog = page.getByRole('dialog', { name: group.name });
    const groupSizes = [[320, 2, 125], [390, 2, 150], [1440, 5, 185], [1920, 5, 185]];
    const skeletonWidths = new Map();
    for (const [width, columns, minimum] of groupSizes) {
      await page.setViewportSize({ width, height: 1000 });
      await checkRows(groupDialog.locator('.loading-card-grid'), columns);
      const skeletonWidth = await groupDialog.locator('.loading-card').first().evaluate(card => card.offsetWidth);
      assert.ok(skeletonWidth >= minimum);
      skeletonWidths.set(width, skeletonWidth);
    }
    releaseGroupGames();
    await expect(groupDialog.getByRole('button', { name: `Pogledaj igru: ${game.title}` })).toBeVisible();
    await expect(groupDialog.locator('.game-card .card-body')).toHaveClass(/md:p-4/);
    await expect(groupDialog.locator('.game-card .badge').first()).toHaveClass(/badge-sm/);
    for (const [width, , minimum] of groupSizes) {
      await page.setViewportSize({ width, height: 1000 });
      const cardWidth = await groupDialog.locator('.game-card').evaluate(card => card.offsetWidth);
      assert.ok(cardWidth >= minimum);
      assert.ok(Math.abs(cardWidth - skeletonWidths.get(width)) <= 8);
    }
    await groupDialog.getByRole('button', { name: 'Zatvori grupu', exact: true }).first().click();

    await page.evaluate(() => { window.auditSession = null; window.auditStore.clearUser(); });
    await expect(page).toHaveURL(new URL('loader-user?tab=groups', origin).href);
    const releaseSharedGame = hold('shared-game');
    await navigate('/shared?id=13');
    await checkRows(page.locator('.shared-game-view .loading-card-grid'), 2);
    await page.setViewportSize({ width: 320, height: 1000 });
    await checkRows(page.locator('.shared-game-view .loading-card-grid'), 1);
    releaseSharedGame();
    await expect(page.getByRole('heading', { name: 'Dijeljena igra', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Dodaj u Gamenote', exact: true })).toBeVisible();
    await expect(page.locator('.loading-card-grid')).toHaveCount(0);
    assert.deepEqual(errors, []);
    const touchContext = await browser.newContext({ hasTouch: true, viewport: { width: 390, height: 850 } });
    try {
      const touchPage = await touchContext.newPage();
      await touchContext.route('**/*', route => {
        const url = new URL(route.request().url());
        if (url.hostname === 'supabase.audit.test') return route.fulfill({ json: [] });
        if (url.origin === new URL(origin).origin) return route.continue();
        return route.abort();
      });
      await touchPage.goto(`${origin}__audit`);
      await touchPage.waitForFunction(() => window.auditReady);
      await touchPage.evaluate(() => window.auditRouter.push('/library'));
      const toggle = touchPage.getByRole('checkbox', { name: 'TCG', exact: true });
      await toggle.click();
      const warning = touchPage.getByRole('dialog', { name: 'Mobilni uređaj otkriven', exact: true });
      await expect(warning).toBeVisible();
      await expect(toggle).not.toBeChecked();
      await warning.getByRole('button', { name: 'Zatvori TCG potvrdu' }).click();
      await expect(warning).toBeHidden();
      await toggle.click();
      await warning.getByRole('checkbox', { name: 'Ne prikazuj više ovu poruku' }).check();
      await warning.getByRole('button', { name: 'Ipak omogući' }).click();
      await expect(toggle).toBeChecked();
      await expect(warning).toBeHidden();
      await toggle.click();
      await toggle.click();
      await expect(toggle).toBeChecked();
      await expect(warning).toBeHidden();
    } finally { await touchContext.close(); }
    console.log('✓ Kosturi: dva puna reda, tri veličine kartica, grupe i dijeljenje na mobitelu i računalu');
  } finally {
    for (const gate of gates.values()) gate.release();
    await context.close();
  }
}
