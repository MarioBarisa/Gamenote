import assert from 'node:assert/strict';
import { expect } from '@playwright/test';
import { GAME_STATUS } from '../../src/constants/gameStatus.js';
import { PROGRESS_MODES } from '../../src/constants/progressModes.js';

export async function checkFrontend(browser, origin, artifacts) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const rows = Array.from({ length: 8 }, (_, index) => ({
    id: `frontend-${index}`, user_id: 'user-a', title: `Igra ${index}`, platform: 'PC',
    status: 'playing', rating: 4, genre: 'RPG', notes: index === 0 ? 'Bilješka' : '',
    progress_mode: index === 2 ? 'leaderboard_rank' : 'achievements_steam',
    progress_value: index === 1 ? 199 : index === 2 ? 5 : 0,
    progress_total: index === 1 ? 200 : index === 2 ? null : 40,
    created_at: '2025-01-01T00:00:00', play_time: index, screenshot_urls: '[]', series_games: '[]',
  }));
  const poster = 'https://images.frontend.test/poster.svg';
  const screenshots = Array.from({ length: 20 }, (_, index) => `https://images.frontend.test/${index + 1}.svg`);
  for (const row of rows) { row.image_url = poster; row.screenshot_urls = JSON.stringify(screenshots); }
  rows[3].progress_value = 40;
  rows[4].rating = 5;
  rows[5].progress_value = 40; rows[5].rating = 5;
  const catalog = { id: 42, name: 'Katalog igra', background_image: poster, released: '2025-01-01', platforms: [{ platform: { name: 'PC' } }], genres: [] };
  let gameReads = 0;
  let iconRequests = 0;
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await context.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.hostname.includes('iconify')) iconRequests++;
    if (url.hostname === 'images.frontend.test') return route.fulfill({ contentType: 'image/svg+xml', body: `<svg xmlns="http://www.w3.org/2000/svg" width="${url.pathname === '/2.svg' ? 800 : url.pathname === '/3.svg' ? 1600 : 1200}" height="${url.pathname === '/2.svg' ? 1200 : 800}"><rect width="100%" height="100%" fill="#0f766e"/></svg>` });
    if (url.origin === new URL(origin).origin) {
      if (url.pathname.includes('/deps/') && url.pathname.includes('hover-tilt')) {
        return route.fulfill({ status: 504, contentType: 'text/javascript', body: 'Outdated Optimize Dep' });
      }
      if (url.pathname === '/.netlify/functions/app-api') {
        const input = route.request().postDataJSON();
        if (input.path === '/games') return route.fulfill({ json: { results: [catalog], count: 1 } });
        if (input.path === '/games/42') return route.fulfill({ json: catalog });
        if (input.path === '/games/42/screenshots') return route.fulfill({ json: { results: screenshots.map(image => ({ image })) } });
        return route.fulfill({ json: { results: [], count: 0 } });
      }
      if (url.pathname.startsWith('/.netlify/')) return route.fulfill({ status: 503, json: {} });
      return route.continue();
    }
    if (url.hostname === 'supabase.audit.test') {
      const games = url.pathname.endsWith('/games');
      if (games) gameReads++;
      if (games && route.request().method() === 'POST') return route.fulfill({ status: 400, json: { message: 'Testna greška spremanja' } });
      if (url.pathname.endsWith('/groups') && url.searchParams.get('id') === 'eq.frontend-group') return route.fulfill({ json: { id: 'frontend-group', name: 'Testna grupa', type: 'collection' } });
      if (url.pathname.endsWith('/game_groups') && url.searchParams.get('group_id') === 'eq.frontend-group') return route.fulfill({ json: [{ id: 'frontend-link', games: rows[0] }] });
      const id = url.searchParams.get('id')?.replace('eq.', '');
      const data = games ? id ? rows.find(row => row.id === id) : url.searchParams.has('game_api_id') ? [] : rows : [];
      return route.fulfill({ json: data, headers: { 'content-range': games ? '0-7/8' : '0-0/0' } });
    }
    return route.abort();
  });
  try {
    await page.goto(origin + '__audit?smoke');
    await page.waitForFunction(() => window.auditReady);
    const navigate = path => page.evaluate(path => window.auditRouter.push(path), path);
    await navigate('/library');
    await expect(page.locator('.game-card')).toHaveCount(8);
    await expect(page.locator('.game-card').nth(0)).toContainText('0/40');
    await expect(page.locator('.game-card').nth(1)).toContainText('99%');
    await expect(page.locator('.game-card').nth(1)).not.toContainText('100%');
    await expect(page.locator('.game-card').nth(2)).toContainText('#5');
    await expect(page.locator('.platform-icon svg, svg.platform-icon').first()).toBeVisible();
    assert.equal(iconRequests, 0);
    await expect(page.locator('.card-open-link').first()).toHaveAttribute('href', '/game/frontend-0');
    await expect(page.locator('.game-card img').nth(6)).toHaveAttribute('loading', 'lazy');
    await page.evaluate(async () => {
      const { useThemeStore } = await import('/src/stores/theme.js');
      useThemeStore().setTcgMode(true);
    });
    await expect.poll(() => page.evaluate(() => !!customElements.get('hover-tilt'))).toBe(true);
    for (const index of [0, 3, 4, 5]) {
      const card = page.locator('hover-tilt').nth(index);
      await card.scrollIntoViewIfNeeded();
      const bounds = await card.boundingBox();
      const tilt = card.locator('[part="tilt"]');
      await card.hover({ position: { x: bounds.width * .2, y: bounds.height * .2 } });
      await expect.poll(() => tilt.evaluate(element => Number(getComputedStyle(element).getPropertyValue('--hover-tilt-x')))).toBeLessThan(.35);
      const left = await tilt.evaluate(element => {
        const matrix = new DOMMatrixReadOnly(getComputedStyle(element).transform);
        return { x: matrix.m13, y: matrix.m23 };
      });
      await expect.poll(() => tilt.evaluate(element => Number(getComputedStyle(element, '::before').opacity))).toBeGreaterThan(.5);
      await card.hover({ position: { x: bounds.width * .8, y: bounds.height * .8 } });
      await expect.poll(() => tilt.evaluate(element => Number(getComputedStyle(element).getPropertyValue('--hover-tilt-x')))).toBeGreaterThan(.65);
      const right = await tilt.evaluate(element => {
        const matrix = new DOMMatrixReadOnly(getComputedStyle(element).transform);
        return { x: matrix.m13, y: matrix.m23 };
      });
      assert.ok(left.x < 0 && right.x > 0 && left.y < 0 && right.y > 0, `TCG ${index}: stvarni nagib prati miš u oba smjera`);
      await page.mouse.move(0, 0);
      await expect(card.locator('[part="container"]')).toHaveAttribute('data-is-active', 'false');
    }
    await page.setViewportSize({ width: 390, height: 1000 });
    const touch = await context.newCDPSession(page);
    await touch.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 });
    const touchCard = page.locator('hover-tilt').first();
    await touchCard.scrollIntoViewIfNeeded();
    const touchBounds = await touchCard.boundingBox();
    await touch.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: touchBounds.x + touchBounds.width * .2, y: touchBounds.y + touchBounds.height * .2 }] });
    await expect.poll(() => touchCard.locator('[part="tilt"]').evaluate(element => new DOMMatrixReadOnly(getComputedStyle(element).transform).m13)).toBeLessThan(-.01);
    await touch.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: touchBounds.x + touchBounds.width * .8, y: touchBounds.y + touchBounds.height * .6 }] });
    await expect.poll(() => touchCard.locator('[part="tilt"]').evaluate(element => new DOMMatrixReadOnly(getComputedStyle(element).transform).m13)).toBeGreaterThan(.01);
    await expect.poll(() => touchCard.locator('[part="tilt"]').evaluate(element => Number(getComputedStyle(element, '::before').opacity))).toBeGreaterThan(.5);
    await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await expect(touchCard.locator('[part="container"]')).toHaveAttribute('data-is-active', 'false');
    await expect(page).toHaveURL(/\/library$/);
    await touch.send('Emulation.setTouchEmulationEnabled', { enabled: false });
    await touch.detach();
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const theme of ['dark', 'cupcake', 'cyberpunk']) {
        for (const tcg of [false, true]) {
          await page.evaluate(async ({ theme, tcg }) => {
            const { useThemeStore } = await import('/src/stores/theme.js');
            useThemeStore().setTheme(theme); useThemeStore().setTcgMode(tcg);
          }, { theme, tcg });
          await expect.poll(() => page.locator('hover-tilt').count()).toBe(tcg ? 8 : 0);
          const corners = await page.locator('.game-card-host:not([part])').evaluateAll(hosts => {
            const reference = document.createElement('div');
            reference.className = 'card'; document.body.append(reference);
            const expected = getComputedStyle(reference).borderTopLeftRadius;
            reference.remove();
            return hosts.map(host => {
              const card = host.querySelector('.game-card');
              const poster = card.querySelector('figure');
              const style = getComputedStyle(card), image = getComputedStyle(poster);
              const part = host.shadowRoot?.querySelector('[part="container"]');
              return { expected, top: style.borderTopLeftRadius, bottom: style.borderBottomLeftRadius, poster: image.borderTopLeftRadius, right: style.borderTopRightRadius, posterRight: image.borderTopRightRadius, part: part ? getComputedStyle(part).borderTopLeftRadius : null };
            });
          });
          for (const corner of corners) {
            assert.equal(corner.top, corner.expected, `${theme}/${width}: kartica prati temu`);
            assert.equal(corner.top, corner.bottom);
            assert.equal(corner.poster, corner.top);
            assert.equal(corner.posterRight, corner.right);
            if (tcg) assert.equal(corner.part, corner.top);
          }
        }
      }
    }
    await page.evaluate(async () => {
      const { useThemeStore } = await import('/src/stores/theme.js');
      useThemeStore().setTheme('dark'); useThemeStore().setTcgMode(true);
    });
    for (const tcg of [false, true]) {
      await page.evaluate(async tcg => {
        const { useThemeStore } = await import('/src/stores/theme.js');
        useThemeStore().setTcgMode(tcg);
      }, tcg);
      for (const name of ['PC', 'RPG']) {
        const card = page.locator('.game-card').first();
        const badge = card.locator(`[data-tip="${name}"]`);
        await badge.hover();
        await expect.poll(() => badge.evaluate(element => element.matches(':hover'))).toBe(true);
        await expect.poll(() => badge.evaluate(element => getComputedStyle(element, '::before').opacity)).toBe('1');
        await badge.click();
        await expect(page).toHaveURL(/\/game\/frontend-0$/);
        await navigate('/library');
        await expect(page.locator('.game-card')).toHaveCount(8);
      }
    }
    const readsBeforeSort = gameReads;
    await page.getByText('Sortiraj', { exact: true }).click();
    await page.keyboard.press('Escape');
    await expect(page.locator('.library-toolbar details')).not.toHaveAttribute('open', '');
    await page.getByText('Sortiraj', { exact: true }).click();
    await page.getByRole('button', { name: 'Vrijeme igranja (najviše)', exact: true }).click();
    await expect(page.locator('.game-card').first()).toContainText('Igra 7');
    assert.equal(gameReads, readsBeforeSort);
    const search = page.getByRole('textbox', { name: 'Pretraži igre' });
    await search.fill('nema-ove-igre');
    await expect(page.getByText('Nema rezultata pretrage', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Očisti pretragu', exact: true }).click();
    await expect(page.locator('.game-card')).toHaveCount(8);
    const notes = page.getByRole('button', { name: 'Prikaži bilješke: Igra 0', exact: true });
    await notes.click();
    await expect(page.getByRole('dialog', { name: 'Bilješke', exact: true })).toBeVisible();
    assert.equal(await page.evaluate(() => document.activeElement.closest('dialog')?.matches(':modal')), true);
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog', { name: 'Bilješke', exact: true })).toHaveCount(0);
    await expect(notes).toBeFocused();
    await notes.click();
    await page.mouse.click(5, 5);
    await expect(page.getByRole('dialog', { name: 'Bilješke', exact: true })).toHaveCount(0);

    for (const width of [320, 390, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `Širina ${width}: nema horizontalnog prelijevanja`);
      await page.evaluate(() => { document.activeElement?.blur(); window.scrollTo(0, 0); });
      await page.screenshot({ path: `${artifacts}/frontend-library-${width}.png`, fullPage: true });
    }
    async function checkRating(dialog, name) {
      for (const width of [320, 640, 1024, 1440]) {
        await page.setViewportSize({ width, height: 1000 });
        const group = dialog.getByRole('radiogroup', { name: 'Ocjena (1-5)', exact: true });
        const layout = await group.evaluate(element => {
          const label = document.getElementById(element.getAttribute('aria-labelledby')).getBoundingClientRect();
          const bounds = element.getBoundingClientRect();
          const field = element.parentElement.getBoundingClientRect();
          return { label: { right: label.right, center: label.y + label.height / 2 }, stars: { left: bounds.x, right: bounds.right, center: bounds.y + bounds.height / 2 }, right: field.right };
        });
        assert.ok(layout.stars.left >= layout.label.right, `${name}/${width}: oznaka i zvjezdice u redu`);
        assert.ok(Math.abs(layout.stars.center - layout.label.center) < 1, `${name}/${width}: okomito poravnanje`);
        assert.ok(layout.stars.right <= layout.right + 1, `${name}/${width}: nema prelijevanja`);
        await expect.poll(() => dialog.getByLabel('Status', { exact: true }).evaluate((element, width) => {
          const form = element.closest('form');
          const status = element.getBoundingClientRect();
          const platform = form.querySelector('select[id$="-2"]').getBoundingClientRect();
          const playtime = form.querySelector('input[id$="-3"]').getBoundingClientRect();
          return Math.abs(status.width - playtime.width) < 1 && Math.abs(status.y - playtime.y) < 1 && (width < 640 || Math.abs(status.x - platform.x) < 1);
        }, width)).toBe(true);
        const dates = await dialog.locator('input[type="date"]').evaluateAll(elements => elements.map(element => {
          const bounds = element.getBoundingClientRect();
          const form = element.closest('form').getBoundingClientRect();
          return { top: bounds.top, fits: bounds.left >= form.left && bounds.right <= form.right };
        }));
        assert.ok(dates.every(date => date.fits && Math.abs(date.top - dates[0].top) < 1), `${name}/${width}: datumi u istom redu bez prelijevanja`);
        const progress = dialog.getByRole('group', { name: 'Napredak igre', exact: true });
        await expect(dialog.getByText('Brojevi iz RAWG baze mogu biti neprecizni!', { exact: true })).toHaveCount(0);
        for (const mode of PROGRESS_MODES) {
          await progress.getByLabel('Vrsta napretka', { exact: true }).selectOption(mode.key);
          const unit = progress.getByLabel('Jedinica', { exact: true });
          await expect(unit).toHaveText(mode.defaultUnit);
          assert.equal(await unit.evaluate(element => element.tagName === 'OUTPUT' && element.tabIndex === -1 && !!element.querySelector('code')), true);
          assert.equal(await progress.evaluate(element => element.scrollWidth <= element.clientWidth + 1), true, `${name}/${width}/${mode.key}: napredak stane u sekciju`);
          const fieldsFit = await progress.locator('input, select, output').evaluateAll(elements => elements.every(element => {
            const field = element.closest('fieldset').getBoundingClientRect();
            const bounds = element.getBoundingClientRect();
            return bounds.left >= field.left && bounds.right <= field.right;
          }));
          assert.equal(fieldsFit, true, `${name}/${width}/${mode.key}: polja bez prelijevanja`);
          const row = await progress.locator('input, output').evaluateAll(elements => elements.map(element => element.getBoundingClientRect().top));
          assert.ok(row.every(top => Math.abs(top - row[0]) < 1), `${name}/${width}/${mode.key}: sva polja u istom redu`);
          assert.equal(await dialog.getByLabel('Datum početka', { exact: true }).evaluate(element => {
            const progress = element.closest('form').querySelector('fieldset');
            return element.getBoundingClientRect().top >= progress.getBoundingClientRect().bottom && !!(progress.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING);
          }), true, `${name}/${width}: datumi iza napretka`);
        }
        const status = dialog.getByLabel('Status', { exact: true });
        await expect(status.locator('option[value=""]')).toHaveText(width < 640 ? 'Odaberi' : 'Odaberi status');
        for (const option of GAME_STATUS) {
          await status.selectOption(option.key);
          const colors = await status.evaluate((element, key) => {
            const badge = document.createElement('span');
            const colors = { playing: 'primary', completed: 'success', paused: 'warning', dropped: 'error', wishlist: 'accent' };
            badge.className = key === 'backlog' ? 'text-base-content' : `text-${colors[key]}`;
            document.body.append(badge);
            const result = [getComputedStyle(element).color, getComputedStyle(badge).color];
            badge.remove();
            return result;
          }, option.key);
          assert.equal(colors[0], colors[1], `${name}/${width}/${option.key}: boja prati status`);
          const pickerColors = await status.evaluate(element => {
            const neutral = document.createElement('span');
            neutral.className = 'bg-base-100 text-base-content';
            document.body.append(neutral);
            const expected = getComputedStyle(neutral);
            const background = getComputedStyle(element).backgroundColor;
            const neutralOptions = [...element.options].every(option => {
              const style = getComputedStyle(option);
              return style.backgroundColor === expected.backgroundColor && style.color === expected.color;
            });
            const result = neutralOptions && background === expected.backgroundColor;
            neutral.remove();
            return result;
          });
          assert.equal(pickerColors, true, `${name}/${width}/${option.key}: podloga i opcije ostaju neutralne`);
        }
        await progress.getByLabel('Vrsta napretka', { exact: true }).selectOption('achievements_steam');
        if (width === 320) await dialog.screenshot({ animations: 'disabled', path: `${artifacts}/form-mobile-${name}.png` });
        if (width === 320 || width === 1440) await progress.screenshot({ animations: 'disabled', path: `${artifacts}/progress-${name}-${width}.png` });
      }
      await dialog.screenshot({ animations: 'disabled', path: `${artifacts}/rating-${name}.png` });
      await page.keyboard.press('Escape');
      await expect(dialog).toHaveCount(0);
    }
    async function checkScreenshot(open) {
      for (const width of [320, 1440]) {
        await page.setViewportSize({ width, height: width === 320 ? 640 : 1000 });
        await open();
        const dialog = page.getByRole('dialog', { name: 'Pregled screenshotova', exact: true });
        await dialog.locator('.screenshot-viewer').evaluate(async element => { await Promise.all(element.getAnimations().map(animation => animation.finished)); });
        const close = dialog.getByRole('button', { name: 'Zatvori screenshot', exact: true });
        const buttonBounds = await close.boundingBox(), imageBounds = await dialog.locator('.screenshot-main').boundingBox();
        assert.ok(buttonBounds.y + buttonBounds.height <= imageBounds.y, 'X je iznad slike');
        const hittable = await close.evaluate(button => {
          const bounds = button.getBoundingClientRect();
          return button.contains(document.elementFromPoint(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2));
        });
        assert.equal(hittable, true, 'Slika ne prekriva X');
        const thumbnails = dialog.getByRole('group', { name: 'Odabir screenshota', exact: true });
        await expect(thumbnails.getByRole('button')).toHaveCount(screenshots.length);
        await thumbnails.getByRole('button', { name: 'Prikaži screenshot 2', exact: true }).click();
        await expect(dialog.locator('.screenshot-main')).toHaveAttribute('src', screenshots[1]);
        for (const index of [1, 2, 3, 2]) {
          await thumbnails.getByRole('button', { name: `Prikaži screenshot ${index}`, exact: true }).click();
          await expect(dialog.locator('.screenshot-main')).toHaveAttribute('src', screenshots[index - 1]);
          await expect.poll(() => dialog.locator('.screenshot-main').evaluate(image => {
            if (!image.complete || !image.naturalWidth) return false;
            const bounds = image.getBoundingClientRect();
            const frame = image.closest('.screenshot-stage').getBoundingClientRect();
            const ratio = image.naturalWidth / image.naturalHeight;
            return Math.abs(bounds.width / bounds.height - ratio) < 0.01 && Math.abs(frame.width / frame.height - ratio) < 0.01;
          })).toBe(true);
          if (index === 3) await dialog.screenshot({ animations: 'disabled', path: `${artifacts}/screenshot-18-9-${width}.png` });
        }
        const stage = dialog.locator('.screenshot-stage');
        const stageBounds = await stage.boundingBox();
        const controlBounds = await close.boundingBox();
        assert.ok(await close.evaluate(element => parseFloat(getComputedStyle(element).borderTopLeftRadius) >= element.getBoundingClientRect().width / 2), 'X je okrugao kao u ostalim modalima');
        if (width < 768) {
          assert.ok(controlBounds.width <= 36 && controlBounds.height <= 36, 'Kompaktan mobilni gumb');
          await expect(dialog.getByRole('button', { name: 'Uvećaj screenshot', exact: true })).toHaveCount(0);
          await expect(dialog.getByRole('link', { name: 'Preuzmi screenshot', exact: true })).toHaveAttribute('href', screenshots[1]);
          const touch = await context.newCDPSession(page);
          const start = stageBounds.x + stageBounds.width - 30;
          const end = stageBounds.x + 30;
          const y = stageBounds.y + 40;
          await touch.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: start, y }] });
          for (let step = 1; step <= 4; step++) {
            await touch.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: start + (end - start) * step / 4, y }] });
          }
          await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
          await touch.detach();
          await expect(dialog.locator('.screenshot-counter')).toHaveText(`3 / ${screenshots.length}`);
          await dialog.getByRole('button', { name: 'Prethodni screenshot', exact: true }).click();
        } else {
          const link = dialog.getByRole('link', { name: 'Preuzmi screenshot', exact: true });
          await expect(link).toHaveAttribute('href', screenshots[1]);
          await expect(link).toHaveAttribute('target', '_blank');
          await expect(link).toHaveAttribute('download', '');
          await dialog.getByRole('button', { name: 'Uvećaj screenshot', exact: true }).click();
          await expect(dialog.locator('.screenshot-zoom')).toHaveValue('1.25');
          const minimap = dialog.getByRole('button', { name: 'Premjesti vidljivo područje slike', exact: true });
          await expect(minimap).toBeVisible();
          await expect.poll(() => dialog.locator('.screenshot-viewport').evaluate(element => parseFloat(element.style.width))).toBeLessThan(100);
          const beforePan = await stage.evaluate(element => ({ left: element.scrollLeft, top: element.scrollTop }));
          await page.mouse.move(stageBounds.x + stageBounds.width * 0.55, stageBounds.y + stageBounds.height * 0.55);
          await page.mouse.down();
          await expect(stage).toHaveClass(/is-dragging/);
          await page.mouse.move(stageBounds.x + stageBounds.width * 0.55 - 100, stageBounds.y + stageBounds.height * 0.55 - 80, { steps: 5 });
          await expect.poll(() => stage.evaluate(element => element.scrollLeft)).toBeGreaterThan(beforePan.left);
          await expect.poll(() => stage.evaluate(element => element.scrollTop)).toBeGreaterThan(beforePan.top);
          await expect.poll(() => dialog.locator('.screenshot-viewport').evaluate(element => parseFloat(element.style.left))).toBeGreaterThan(0);
          await page.mouse.move(stageBounds.x - 20, stageBounds.y - 20, { steps: 3 });
          await expect(stage).toHaveClass(/is-dragging/);
          await page.mouse.up();
          await expect(stage).not.toHaveClass(/is-dragging/);
          await minimap.click({ position: { x: 4, y: 4 } });
          await expect.poll(() => stage.evaluate(element => element.scrollLeft + element.scrollTop)).toBe(0);
          const mapBounds = await minimap.boundingBox();
          await minimap.click({ position: { x: mapBounds.width - 4, y: mapBounds.height - 4 } });
          await expect.poll(() => stage.evaluate(element => element.scrollLeft)).toBeGreaterThan(0);
          const beforeKey = await stage.evaluate(element => element.scrollLeft);
          await stage.focus();
          await page.keyboard.press('ArrowLeft');
          await expect.poll(() => stage.evaluate(element => element.scrollLeft)).toBeLessThan(beforeKey);
          const previousBounds = await dialog.getByRole('button', { name: 'Prethodni screenshot', exact: true }).boundingBox();
          const nextBounds = await dialog.getByRole('button', { name: 'Sljedeći screenshot', exact: true }).boundingBox();
          assert.ok(previousBounds.y >= stageBounds.y && nextBounds.y >= stageBounds.y, 'Desktop strelice su preko slike');
          await dialog.screenshot({ animations: 'disabled', path: `${artifacts}/screenshot-zoom.png` });

          assert.equal(await stage.evaluate(element => element.scrollWidth > element.clientWidth && element.scrollHeight > element.clientHeight), true, 'Uvećana slika pomiče se u oba smjera');
          await dialog.getByRole('button', { name: 'Umanji screenshot', exact: true }).click();
          await expect(dialog.locator('.screenshot-zoom')).toHaveValue('1');
          await expect(minimap).toHaveCount(0);
          const presets = dialog.getByRole('combobox', { name: 'Povećanje slike', exact: true });
          await expect(presets.locator('option')).toHaveCount(9);
          await presets.selectOption('2.5');
          await expect(presets).toHaveValue('2.5');
          await expect(minimap).toBeVisible();
          await presets.selectOption('1');
          await stage.dblclick();
          await expect(presets).toHaveValue('2');
          await expect(minimap).toBeVisible();
          await stage.dblclick();
          await expect(presets).toHaveValue('1');
          await expect(minimap).toHaveCount(0);
          await dialog.getByRole('button', { name: 'Uvećaj screenshot', exact: true }).click();
        }

        await expect(dialog.locator('.screenshot-counter')).toHaveText(`2 / ${screenshots.length}`);
        const first = thumbnails.getByRole('button', { name: 'Prikaži screenshot 1', exact: true });
        await first.focus();
        await page.keyboard.press('Space');
        await expect(first).toHaveAttribute('aria-current', 'true');
        if (width >= 768) await expect(dialog.locator('.screenshot-zoom')).toHaveValue('1');
        await dialog.getByRole('button', { name: 'Prethodni screenshot', exact: true }).click();
        const last = thumbnails.getByRole('button').last();
        await expect(last).toHaveAttribute('aria-current', 'true');
        await expect(dialog.locator('.screenshot-main')).toHaveAttribute('src', screenshots.at(-1));
        await expect.poll(() => last.evaluate(element => {
          const bounds = element.getBoundingClientRect();
          const strip = element.parentElement.getBoundingClientRect();
          return bounds.left >= strip.left - 1 && bounds.right <= strip.right + 1;
        })).toBe(true);
        await expect(thumbnails).toHaveCSS('scrollbar-width', 'none');
        await thumbnails.evaluate(element => { element.scrollLeft = 0; });
        await thumbnails.hover();
        await page.mouse.wheel(0, 120);
        await expect.poll(() => thumbnails.evaluate(element => element.scrollLeft)).toBeGreaterThan(0);
        const stripBounds = await thumbnails.boundingBox();
        const currentImageBounds = await dialog.locator('.screenshot-main').boundingBox();
        assert.ok(stripBounds.y >= currentImageBounds.y + currentImageBounds.height - 1, 'Minijature su ispod slike');
        assert.ok(stripBounds.y + stripBounds.height <= (width === 320 ? 640 : 1000), 'Minijature stanu u zaslon');
        await dialog.screenshot({ animations: 'disabled', path: `${artifacts}/screenshot-${width}.png` });
        await close.click();
        await expect(dialog).toHaveCount(0);
      }
    }
    async function checkIndependentPanels(root) {
      await page.setViewportSize({ width: 1440, height: 1000 });
      const left = root.locator('[class*="lg:col-span-2"]').first();
      const right = root.locator('[class*="lg:col-span-3"]').first();
      await expect(left).toBeVisible();
      for (const [changed, other] of [[right, left], [left, right]]) {
        const before = await other.boundingBox();
        await changed.evaluate(element => {
          const extra = document.createElement('div');
          extra.dataset.heightFixture = 'true'; extra.style.height = '1400px';
          element.append(extra);
        });
        const after = await other.boundingBox();
        if (changed === right) assert.ok(Math.abs(before.height - after.height) < 1, 'Korisnički podaci ne rastu uz API karticu');
        else assert.ok(after.height >= (await changed.boundingBox()).height - 1, 'Informacije su barem visoke kao korisnički podaci');
        await changed.locator('[data-height-fixture]').evaluate(element => element.remove());
      }
    }
    await navigate('/game/frontend-0');
    await checkIndependentPanels(page.locator('.game-details'));
    await page.getByRole('button', { name: 'Uredi', exact: true }).click();
    await checkRating(page.getByRole('dialog', { name: 'Uredi igru', exact: true }), 'edit');
    await page.getByRole('tab', { name: 'Slike igre', exact: true }).click();
    await checkScreenshot(() => page.locator('.game-details [role="tabpanel"]').filter({ visible: true }).getByRole('img', { name: 'Screenshot 1', exact: true }).first().click());
    await navigate('/api-games/42');
    await checkIndependentPanels(page.locator('.api-game-details'));
    await page.getByRole('button', { name: 'Dodaj u Gamenote', exact: true }).click();
    await checkRating(page.getByRole('dialog', { name: 'Dodaj u Gamenote', exact: true }), 'catalog');
    await page.getByRole('tab', { name: 'Slike igre', exact: true }).click();
    await checkScreenshot(() => page.locator('.api-game-details [role="tabpanel"]').filter({ visible: true }).getByRole('img', { name: 'Screenshot 1', exact: true }).first().click());
    await navigate('/add-game');
    await page.getByRole('textbox', { name: 'Unesite naziv igre...', exact: true }).fill('Katalog');
    await page.getByRole('button', { name: 'Pretraži', exact: true }).click();
    await page.locator('.search-results').getByRole('button', { name: 'Dodaj u Gamenote', exact: true }).click();
    await checkRating(page.getByRole('dialog', { name: 'Dodaj u Gamenote', exact: true }), 'search');
    for (const path of ['/api-games/42', '/add-game']) {
      await navigate(path);
      if (path === '/add-game') {
        await page.getByRole('textbox', { name: 'Unesite naziv igre...', exact: true }).fill('Katalog');
        await page.getByRole('button', { name: 'Pretraži', exact: true }).click();
        await page.locator('.search-results').getByRole('button', { name: 'Dodaj u Gamenote', exact: true }).click();
      } else {
        await page.getByRole('button', { name: 'Dodaj u Gamenote', exact: true }).click();
      }
      const dialog = page.getByRole('dialog', { name: 'Dodaj u Gamenote', exact: true });
      await dialog.getByLabel('Platforma', { exact: true }).selectOption('PC');
      await dialog.getByRole('button', { name: 'Dodaj u Gamenote', exact: true }).click();
      await expect(dialog.getByRole('alert')).toHaveText('Testna greška spremanja');
      await expect(dialog).toBeVisible();
      await expect(page.getByRole('alert')).toHaveCount(1);
      await page.keyboard.press('Escape');
      await expect(dialog).toHaveCount(0);
    }
    await navigate('/groups/frontend-group');
    await page.getByRole('button', { name: 'Odaberi', exact: true }).click();
    const selection = page.getByRole('button', { name: 'Odaberi igru: Igra 0', exact: true });
    const indicator = selection.locator('..').locator('span[aria-hidden="true"]').last();
    for (const selected of ['true', 'false']) {
      const bounds = await indicator.boundingBox();
      await page.mouse.click(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
      await expect(selection).toHaveAttribute('aria-pressed', selected);
    }
    await navigate('/theme-settings');
    const light = page.getByRole('radio', { name: '☀️ Light', exact: true });
    await light.focus();
    await page.keyboard.press('Space');
    await expect(light).toBeChecked();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await page.getByRole('radio', { name: 'Mala veličina kartica', exact: true }).check();
    await expect(page.getByRole('radio', { name: 'Mala veličina kartica', exact: true })).toBeChecked();
    await navigate('/importers');
    const psnTab = page.getByRole('tab', { name: 'PlayStation', exact: true });
    await psnTab.focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('tab', { name: 'Steam', exact: true })).toBeFocused();
    await expect(page.getByRole('tab', { name: 'Steam', exact: true })).toHaveAttribute('aria-selected', 'true');
    rows[7].created_at = '2025-02-01T00:00:00';
    await navigate('/stats');
    await expect(page.locator('canvas').first()).toHaveAttribute('aria-label', 'Igre kroz vrijeme');
    await page.getByText('Podaci grafova', { exact: true }).click();
    await expect(page.getByRole('table').first()).toBeVisible();
    const timelineTable = page.getByRole('table', { name: 'Igre kroz vrijeme', exact: true });
    const periodCount = page.locator('.stat').filter({ hasText: 'Igara u razdoblju' }).locator('.stat-value');
    await timelineTable.getByRole('button', { name: 'Sij 2025.', exact: true }).click();
    await expect(page.getByRole('combobox', { name: 'Godina', exact: true })).toHaveValue('2025');
    await expect(page.getByRole('combobox', { name: 'Mjesec', exact: true })).toHaveValue('1');
    await expect(periodCount).toHaveText('7');
    await timelineTable.getByRole('button', { name: '1. Sij 2025.', exact: true }).click();
    await expect(page.getByRole('combobox', { name: 'Godina', exact: true })).toHaveValue('2025');
    await expect(page.getByRole('combobox', { name: 'Mjesec', exact: true })).toHaveValue('1');
    await expect(periodCount).toHaveText('7');
    await page.getByRole('button', { name: 'Poništi filter', exact: true }).click();
    await expect(periodCount).toHaveText('8');
    await navigate('/privacy');
    const profileTrigger = page.getByLabel('Izbornik profila', { exact: true });
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.evaluate(() => { window.auditSession = null; window.auditStore.clearUser(); });
      await expect(profileTrigger).toHaveCount(0);
      await page.evaluate(() => {
        window.auditSession = { user: { id: 'user-a', email: 'fixture@example.test' }, access_token: 'fixture' };
        window.auditStore.setUser(window.auditSession.user);
      });
      await profileTrigger.focus();
      await page.keyboard.press('Enter');
      const profileDropdown = page.locator('details').filter({ has: profileTrigger });
      await expect(profileDropdown).toHaveJSProperty('open', true);
      await profileDropdown.getByRole('link', { name: 'Profil', exact: true }).focus();
      await page.keyboard.press('Escape');
      await expect(profileDropdown).toHaveJSProperty('open', false);
      await expect(profileTrigger).toBeFocused();
      await profileTrigger.click();
      await expect(profileDropdown).toHaveJSProperty('open', true);
      await page.getByRole('heading', { level: 1 }).click();
      await expect(profileDropdown).toHaveJSProperty('open', false);
    }
    await page.evaluate(() => { window.auditSession = null; window.auditStore.clearUser(); });
    await navigate('/shared?id=42');
    await checkIndependentPanels(page.locator('.shared-game-view'));
    await page.getByRole('tab', { name: 'Slike igre', exact: true }).click();
    await checkScreenshot(() => page.locator('.shared-game-view [role="tabpanel"]').filter({ visible: true }).getByRole('img', { name: 'Screenshot 1', exact: true }).first().click());
    await navigate('/login');
    await page.getByRole('button', { name: 'Zaboravio si lozinku?', exact: true }).click();
    await expect(page.getByRole('dialog', { name: 'Resetiranje lozinke', exact: true })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Zaboravio si lozinku?', exact: true })).toBeFocused();
    await page.getByRole('button', { name: 'Zaboravio si lozinku?', exact: true }).click();
    await page.getByRole('dialog').getByRole('textbox', { name: 'E-mail adresa', exact: true }).fill('fixture@example.test');
    await page.evaluate(() => {
      window.auditDb.auth.resetPasswordForEmail = () => new Promise(resolve => { window.finishFrontendReset = () => resolve({ error: null }); });
    });
    await page.getByRole('button', { name: 'Pošalji link', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Pošalji link', exact: true })).toBeDisabled();
    await page.keyboard.press('Escape');
    await page.mouse.click(5, 5);
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.evaluate(() => window.finishFrontendReset());
    await expect(page.getByRole('dialog').getByRole('status')).toContainText('poslan');
    await page.getByRole('button', { name: 'Zatvori resetiranje lozinke', exact: true }).click();
    await navigate('/game/frontend-0');
    assert.equal(await page.evaluate(() => window.auditRouter.currentRoute.value.query.redirect), '/game/frontend-0');
    await page.evaluate(async () => {
      window.auditRouter.addRoute({ path: '/frontend-failure', component: () => Promise.reject(new Error('Testni prekid učitavanja')) });
      await window.auditRouter.push('/frontend-failure').catch(() => {});
    });
    await expect(page.getByRole('alert')).toContainText('Stranicu nije moguće učitati.');
    await expect(page.getByRole('button', { name: 'Pokušaj ponovno', exact: true })).toBeEnabled();
    assert.deepEqual(errors, []);
    console.log('✓ Frontend: TCG miš/dodir, napredak, tipkovnica, modali, teme, ocjena, galerija, sortiranje, ikone, pretraga i grafovi');
  } finally { await context.close(); }
}
