import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdtemp } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { tmpdir } from 'node:os';
import { chromium, expect } from '@playwright/test';
import { pageMetadata, metadataHtml } from '../../src/services/seo.js';
import sharedPreview from '../../netlify/edge-functions/og-shared.js';

const artifacts = await mkdtemp(join(tmpdir(), 'gamenote-landing-'));
const shell = await readFile('dist/index.html', 'utf8');
assert.match(shell, /Tvoj gaming dnevnik/);
assert.match(shell, /<title>Gamenote<\/title>/);
assert.match(shell, /Steam i PlayStation importeri/);
assert.doesNotMatch(shell, /milijune|IGDB|fixture-token/);
assert.equal(pageMetadata('/shared', { id: '42', tracking: 'ignore' }).canonical, 'https://gamenote.eu/shared?id=42');
assert.equal(pageMetadata('/privacy/').canonical, 'https://gamenote.eu/privacy');
assert.equal(pageMetadata('/privacy/').robots, 'index, follow');
for (const path of ['/profile', '/library', '/login', '/register', '/reset-password']) assert.equal(pageMetadata(path).robots, 'noindex, follow');
for (const [path, title] of Object.entries({ '/': 'Gamenote', '/library': 'Moje igre', '/groups': 'Grupe', '/stats': 'Gamenote Statistika', '/theme-settings': 'Postavke UI-ja', '/importers': 'Importer', '/add-game': 'Pretraži igre', '/login': 'Prijavi se', '/register': 'Registriraj se', '/reset-password': 'Resetiranje lozinke' })) assert.equal(pageMetadata(path).title, title);
const originalFetch = globalThis.fetch;
globalThis.Deno = { env: { get: () => '' } };
let requests = 0;
globalThis.fetch = async () => { requests++; return Response.json({ name: 'Test <game>', description_raw: 'Opis', background_image: 'https://image.test/game.jpg' }); };
for (const agent of ['Mozilla/5.0', 'Twitterbot']) {
  const response = await sharedPreview(new Request('https://gamenote.eu/shared?id=42&utm_source=test', { headers: { 'user-agent': agent } }), {
    next: async () => new Response(`<html><head>${metadataHtml(pageMetadata('/shared'))}</head></html>`, { headers: { 'content-type': 'text/html' } }),
  });
  const html = await response.text();
  assert.equal((html.match(/rel="canonical"/g) || []).length, 1);
  assert.equal((html.match(/property="og:title"/g) || []).length, 1);
  assert.equal((html.match(/name="twitter:description"/g) || []).length, 1);
  assert.match(html, /https:\/\/gamenote.eu\/shared\?id=42/);
  if (agent === 'Twitterbot') assert.match(html, /Test &lt;game&gt;/);
}
assert.equal(requests, 1);
globalThis.fetch = originalFetch;
delete globalThis.Deno;

const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.xml': 'application/xml', '.txt': 'text/plain' };
const server = createServer(async (req, res) => {
  const path = new URL(req.url, 'http://localhost').pathname;
  let file = path === '/' ? 'index.html' : path.slice(1);
  if (['privacy', 'tos', 'login', 'register', 'reset-password', 'shared'].includes(file)) file += '/index.html';
  try {
    const body = await readFile(join('dist', file));
    res.setHeader('content-type', types[extname(file)] || 'application/octet-stream');
    res.end(body);
  } catch {
    res.setHeader('content-type', 'text/html');
    res.end(await readFile('dist/spa.html'));
  }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
let browser;
try {
  browser = await chromium.launch({ headless: true });
  for (const enabled of [false, true]) {
    const context = await browser.newContext({ javaScriptEnabled: enabled });
    await context.route('**/*', route => {
      const url = new URL(route.request().url());
      if (url.origin === origin && url.pathname === '/.netlify/functions/app-api') {
        const payload = route.request().postDataJSON();
        if (payload.path === '/games/134588') return route.fulfill({ json: { id: 134588, name: 'Katalog 134588', description_raw: 'Opis iz kataloga', genres: [], platforms: [], metacritic: 90, esrb_rating: { name: 'Teen' } } });
        return route.fulfill({ json: { results: [] } });
      }
      if (url.origin === origin) return route.continue();
      if (route.request().resourceType() === 'image') return route.abort();
      return route.fulfill({ status: 503, json: { error: 'Testni prekid' } });
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const width of [320, 390, 1440]) {
      await page.setViewportSize({ width, height: 950 });
      await page.goto(origin);
      await expect(page.locator('h1')).toHaveText('Tvoj gaming dnevnik.');
      await expect(page).toHaveTitle('Gamenote');
      await expect(page.locator('.hero-content')).not.toContainText('Steam');
      if (enabled) {
        const logo = page.locator('.hero-content img[alt="Gamenote"]');
        const before = await logo.boundingBox();
        await logo.hover();
        const after = await logo.boundingBox();
        assert.ok(Math.abs(after.width - before.width) < .1);
        assert.ok(Math.abs(after.height - before.height) < .1);
      }

      await expect(page.locator('.preview-game')).toHaveCount(3);
      await expect(page.locator('.preview-game').first()).toContainText('Completed');
      await expect(page.locator('.preview-game').nth(1)).toContainText('Playing');
      await expect(page.locator('a[href="#mogucnosti"]')).toHaveCount(0);
      await expect(page.locator('.preview-caption')).toHaveCount(0);
      await expect(page.locator('[aria-label="Statusi igara"]')).toHaveCount(0);
      await expect(page.locator('.preview-game').first()).toContainText('The Last of Us Part I');
      await expect(page.locator('.preview-game').first()).toContainText('112h');
      await expect(page.locator('.preview-game').first()).toContainText('PSN Trophies');
      await expect(page.locator('.preview-game').nth(2)).toContainText('DokeV');
      await expect(page.locator('.preview-game').nth(2)).toContainText('Wishlist');
      await expect(page.locator('.preview-game').nth(2)).toContainText('0/5');
      if (enabled) {
        await expect(page.locator('.preview-details .api-game-details')).toContainText('Katalog 134588');
        await expect(page).toHaveTitle('Gamenote');
        assert.deepEqual(await page.locator('.preview-details span.tooltip[title]').evaluateAll(elements => elements.map(el => el.title)), ['PlayStation 5', 'PC', 'Xbox Series X/S']);
        await expect(page.locator('.preview-details')).not.toContainText('Dodaj u kolekciju');
        await expect(page.locator('.preview-details').getByRole('button', { name: 'Podijeli', exact: true })).toHaveCount(0);
      }
      await expect(page.getByRole('heading', { name: 'Sve o igri, na jednom mjestu' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Bilješke uz svaku igru' })).toHaveCount(0);
      await expect(page.locator('.import-target')).toHaveText('');
      await expect(page.locator('.source-logo')).toHaveCount(4);
      await expect(page.locator('.source-xbox')).toContainText('Dolazi uskoro');
      await expect(page.locator('.source-nintendo')).toContainText('Dolazi uskoro');
      assert.equal(await page.locator('.source-nintendo').evaluate(el => getComputedStyle(el).opacity), '0.4');
      assert.equal(await page.locator('.import-target').evaluate(el => getComputedStyle(el).borderTopWidth), '0px');
      if (enabled) {
        await expect(page.locator('.preview-summary .gamer-card > svg')).toBeVisible();
        await expect(page.locator('.preview-summary .gamer-card desc')).toContainText('140 sati igranja');
        await expect(page.locator('.preview-shelf hover-tilt')).toHaveCount(width >= 1024 ? 3 : 0);
        if (width >= 1024) {
          await expect(page.locator('.preview-shelf .tcg-foil--prism')).toHaveCount(1);
          await expect(page.locator('.preview-shelf .tcg-foil--gold')).toHaveCount(1);
          assert.notEqual(await page.evaluate(() => JSON.parse(localStorage.getItem('gamenote-theme') || '{}').tcgMode), true);
          await page.evaluate(() => customElements.whenDefined('hover-tilt'));
          const thirdCard = page.locator('.preview-game').nth(2);
          await thirdCard.scrollIntoViewIfNeeded();
          const bounds = await thirdCard.boundingBox();
          for (const y of [12, bounds.height - 12]) {
            await page.mouse.move(bounds.x + bounds.width - 12, bounds.y + y);
            await expect(thirdCard.locator('[part="container"]')).toHaveAttribute('data-is-active', 'true');
            const scrolling = await page.locator('.preview-shelf').evaluate(el => {
              const style = getComputedStyle(el);
              return { x: style.overflowX, y: style.overflowY, barX: el.offsetHeight - el.clientHeight, barY: el.offsetWidth - el.clientWidth, left: el.scrollLeft };
            });
            assert.equal(scrolling.x, 'visible');
            assert.equal(scrolling.y, 'visible');
            assert.equal(scrolling.barX, 0);
            assert.equal(scrolling.barY, 0);
            await page.mouse.wheel(160, 0);
            assert.equal(await page.locator('.preview-shelf').evaluate(el => el.scrollLeft), 0);
          }
          await page.screenshot({ path: join(artifacts, 'landing-third-card-hover.png'), fullPage: true });
          await page.mouse.move(0, 0);

        }
      } else {
        await expect(page.locator('.summary-placeholder')).toBeVisible();
      }
      assert.equal(await page.locator('.preview-shelf').evaluate(el => getComputedStyle(el).display), 'flex');

      await expect(page.getByRole('heading', { name: 'Steam i PlayStation importeri' })).toBeVisible();
      await expect(page.locator('a[href="/register"]').first()).toBeVisible();
      await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      const layout = await page.evaluate(() => {
        const bounds = selector => document.querySelector(selector).getBoundingClientRect().toJSON();
        return { details: bounds('.feature-details'), importer: bounds('.feature-import'), summary: bounds('.feature-summary'), card: document.querySelector('.preview-summary .gamer-card')?.getBoundingClientRect().toJSON(), mask: getComputedStyle(document.querySelector('.import-flows')).maskImage };
      });
      assert.notEqual(layout.mask, 'none');
      const decoration = await page.evaluate(() => {
        const style = selector => getComputedStyle(document.querySelector(selector));
        return { steam: style('.connection-steam').stroke, psn: style('.connection-psn').stroke, mask: style('.import-flows').maskComposite,
          wrappers: [...document.querySelectorAll('.preview-unframed')].map(el => ({ padding: getComputedStyle(el).padding, background: getComputedStyle(el).backgroundColor })) };
      });
      assert.equal(decoration.steam, 'rgb(255, 255, 255)');
      assert.equal(decoration.psn, 'rgb(22, 139, 255)');
      assert.ok(decoration.mask.includes('intersect'));
      for (const wrapper of decoration.wrappers) {
        assert.equal(wrapper.padding, '0px');
        assert.equal(wrapper.background, 'rgba(0, 0, 0, 0)');
      }

      if (width >= 1024) {
        assert.ok(layout.details.bottom <= layout.importer.top);
        assert.ok(Math.abs(layout.importer.top - layout.summary.top) < 2);
        assert.ok(layout.summary.width > layout.importer.width * 1.9);
        if (enabled) assert.ok(layout.card.width >= 600);
      }

      if (enabled) {
        const speeds = await page.locator('.import-particle').evaluateAll(elements => elements.map(el => ({
          source: [...el.classList].find(name => name.startsWith('particle-')),
          speed: el.getTotalLength() / parseFloat(getComputedStyle(el).animationDuration),
          path: el.getAttribute('d'),
          basePath: el.parentElement.querySelector('.connection-' + [...el.classList].find(name => name.startsWith('particle-')).slice(9)).getAttribute('d'),
        })));
        assert.equal(speeds.length, 2);
        await expect(page.locator('.particle-nintendo, .particle-xbox')).toHaveCount(0);
        const ranges = { 'particle-steam': [50, 60], 'particle-psn': [38, 46], 'particle-xbox': [26, 32], 'particle-nintendo': [16, 22] };
        for (const pulse of speeds) {
          const [min, max] = ranges[pulse.source];
          assert.ok(pulse.speed >= min - .01 && pulse.speed <= max + .01);
          assert.equal(pulse.path, pulse.basePath);
        }
        if (width >= 1024) {
          const steamPulse = page.locator('.particle-steam');
          const initialPulse = await steamPulse.elementHandle();
          await expect.poll(() => initialPulse.evaluate(el => el.isConnected), { timeout: 7000 }).toBe(false);
          await expect(steamPulse).toHaveCount(1);
          for (const source of ['psn']) await expect(page.locator('.particle-' + source)).toHaveCount(1);
          await initialPulse.dispose();
        }

      }
      if (enabled) {
        const badge = page.getByRole('link', { name: 'Podrži me i daljnji razvoj Gamenotea putem Ko-fija' });
        await expect(badge).toBeVisible();
        await expect(badge).toHaveAttribute('href', 'https://ko-fi.com/mariobarisa');
        await expect(badge).toHaveAttribute('target', '_blank');
        await expect(badge).toHaveAttribute('rel', 'noopener noreferrer');
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      }
      if (enabled) await expect(page.locator('.hero-marquee')).toBeVisible();
      await page.screenshot({ path: join(artifacts, `landing-${width}-${enabled ? 'js' : 'static'}.png`), fullPage: true });
    }
    await page.emulateMedia({ reducedMotion: 'reduce' });
    assert.equal(await page.locator('.import-particle').first().evaluate(el => getComputedStyle(el).animationName), 'none');
    if (enabled) await expect(page.locator('.preview-shelf hover-tilt')).toHaveCount(0);
    if (enabled) {
      const badge = page.getByRole('link', { name: 'Podrži me i daljnji razvoj Gamenotea putem Ko-fija' });
      await page.route('https://ko-fi.com/mariobarisa/**', route => route.fulfill({ contentType: 'text/html', body: '<h1>Testni Ko-fi obrazac</h1>' }));
      assert.equal(await page.locator('iframe[title="Ko-fi donacijski obrazac"]').count(), 0);
      await badge.click();
      const dialog = page.getByRole('dialog', { name: 'Podrži Gamenote na Ko-fiju' });
      await expect(dialog).toBeVisible();
      await expect(dialog.locator('.modal-box')).toHaveCSS('opacity', '1');
      await page.screenshot({ path: join(artifacts, 'kofi-modal-desktop.png') });
      const frame = dialog.locator('iframe');
      await expect(frame).toHaveAttribute('src', 'https://ko-fi.com/mariobarisa/?hidefeed=true&widget=true&embed=true');
      await expect(page.frameLocator('iframe[title="Ko-fi donacijski obrazac"]').getByRole('heading', { name: 'Testni Ko-fi obrazac' })).toBeVisible();
      await expect(dialog.getByRole('link', { name: 'otvori Ko-fi stranicu' })).toHaveAttribute('href', 'https://ko-fi.com/mariobarisa');
      await page.keyboard.press('Escape');
      await expect(dialog).not.toBeVisible();
      await expect(frame).toHaveCount(0);
      await expect(badge).toBeFocused();
      await badge.click();
      await expect(dialog).toBeVisible();
      await dialog.getByRole('button', { name: 'Zatvori' }).click();
      await expect(dialog).not.toBeVisible();
      await page.setViewportSize({ width: 320, height: 568 });
      await badge.click();
      await expect(dialog).toBeVisible();
      const modalBounds = await dialog.locator('.modal-box').boundingBox();
      assert.ok(modalBounds.x >= 0 && modalBounds.x + modalBounds.width <= 320);
      assert.ok(modalBounds.y >= 0 && modalBounds.y + modalBounds.height <= 568);
      await expect(page.frameLocator('iframe[title="Ko-fi donacijski obrazac"]').getByRole('heading', { name: 'Testni Ko-fi obrazac' })).toBeVisible();
      await expect(dialog.locator('.modal-box')).toHaveCSS('opacity', '1');
      await page.screenshot({ path: join(artifacts, 'kofi-modal-320.png') });
      await dialog.getByRole('button', { name: 'Zatvori' }).click();
      await expect(badge).toBeFocused();
      await page.setViewportSize({ width: 1440, height: 950 });
      await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
      const light = await badge.evaluate(el => getComputedStyle(el).backgroundColor);
      await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dracula'));
      const dracula = await badge.evaluate(el => getComputedStyle(el).backgroundColor);
      assert.notEqual(light, dracula);
      await page.getByRole('link', { name: 'Pročitaj pravila privatnosti' }).click();
      await expect(page).toHaveURL(origin + '/privacy');
      await expect(page).toHaveTitle('Pravila privatnosti – Gamenote');
      await page.getByRole('button', { name: 'EN', exact: true }).click();
      await expect(page).toHaveTitle('Privacy Policy – Gamenote');
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://gamenote.eu/privacy');
      await page.goBack();
      await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://gamenote.eu/');
    }
    assert.deepEqual(errors, []);
    await context.close();
  }
  for (const path of ['/robots.txt', '/sitemap.xml', '/social-preview.png']) {
    const response = await fetch(origin + path);
    assert.equal(response.status, 200);
    assert.ok(!response.headers.get('content-type').includes('text/html'));
  }
  for (const path of ['/privacy', '/tos']) {
    const html = await (await fetch(origin + path)).text();
    assert.match(html, /<h1/);
    assert.match(html, new RegExp('href="https://gamenote.eu' + path + '"'));
  }
  console.log(`✓ Javni HTML bez JavaScripta, 320/390/1440 px, SEO, datoteke i dinamički shared preview; snimke: ${artifacts}`);
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
