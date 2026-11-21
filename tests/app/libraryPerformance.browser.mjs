import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { expect } = require('@playwright/test');

export async function checkLibraryPerformance(browser, origin) {
  const rows = Array.from({ length: 320 }, (_, index) => ({
    id: String(index + 1),
    user_id: 'library-owner',
    title: 'Biblioteka ' + String(index + 1).padStart(3, '0'),
    status: 'backlog',
    platform: 'PC',
    created_at: '2025-01-01T00:00:00Z',
  }));
  const contexts = [];
  const open = async (path, width = 390) => {
    const context = await browser.newContext({ locale: 'hr-HR', viewport: { width, height: 844 } });
    contexts.push(context);
    await context.addInitScript(path => { window.startupOptions = { path }; }, path);
    await context.route('**/*', async route => {
      const request = route.request();
      const url = new URL(request.url());
      if (url.pathname === '/rest/v1/games') {
        if (request.method() === 'POST') {
          rows.push(request.postDataJSON());
          return route.fulfill({ status: 201, json: [] });
        }
        const id = url.searchParams.get('id')?.slice(3);
        if (id) return route.fulfill({ json: rows.find(row => row.id === id) });
        const offset = Number(url.searchParams.get('offset') || 0);
        const data = rows.slice(offset, offset + 1000);
        return route.fulfill({ json: data, headers: { 'content-range': `${offset}-${offset + data.length - 1}/${rows.length}` } });
      }
      if (url.pathname.startsWith('/rest/v1/')) return route.fulfill({ json: [], headers: { 'content-range': '*/0' } });
      if (url.origin === new URL(origin).origin && !url.pathname.startsWith('/.netlify/functions/')) return route.continue();
      return route.fulfill({ json: { results: [], items: [] } });
    });
    const page = await context.newPage();
    await page.goto(origin + '__startup');
    await page.waitForFunction(() => window.startupMounted);
    await page.evaluate(async () => {
      const { supabase } = await import('/src/supabase.js');
      window.libraryRealtime = {};
      supabase.channel = () => ({
        on(type, options, handler) {
          window.libraryRealtime[options.event] = { options, handler };
          return this;
        },
        subscribe(handler) { queueMicrotask(() => handler('SUBSCRIBED')); return this; },
      });
      supabase.removeChannel = async () => {};
      window.startupControl.release({ userId: 'library-owner' });
    });
    return page;
  };

  try {
    const library = await open('/library');
    const cards = library.locator('.game-card');
    await expect(cards).toHaveCount(40);
    for (const count of [80, 120]) {
      await library.getByRole('button', { name: 'Prikaži još' }).locator('..')
        .evaluate(element => element.scrollIntoView({ block: 'center' }));
      await expect(cards).toHaveCount(count);
    }
    const deepCard = cards.nth(75);
    await deepCard.scrollIntoViewIfNeeded();
    const position = await library.evaluate(() => window.scrollY);
    assert.ok(position > 1000);
    await deepCard.locator('.card-open-link').click();
    await expect(library).toHaveURL(/\/game\//);
    await library.evaluate(() => history.back());
    await expect(library).toHaveURL(/\/library$/);
    await expect.poll(() => library.evaluate(() => window.scrollY)).toBeCloseTo(position, -1);

    const second = await open('/profile', 1440);
    await expect(second.getByRole('heading', { name: 'Dvostruka autentikacija (TOTP)' })).toBeVisible();
    const inserted = { id: 'mobile-added', user_id: 'library-owner', title: 'Dodano s drugog uređaja', status: 'backlog', platform: 'PC', created_at: '2026-11-21T00:00:00Z' };
    await second.evaluate(async row => {
      const { supabase } = await import('/src/supabase.js');
      const { error } = await supabase.from('games').insert(row);
      if (error) throw error;
    }, inserted);
    const filter = await library.evaluate(row => {
      const event = window.libraryRealtime.INSERT;
      event.handler({ new: row });
      return event.options.filter;
    }, inserted);
    assert.equal(filter, 'user_id=eq.library-owner');
    await expect(cards.first()).toContainText(inserted.title, { timeout: 2_000 });
    console.log('✓ Biblioteka dodaje kartice u serijama, vraća duboki scroll i osvježava drugu sesiju');
  } finally {
    for (const context of contexts) await context.close();
  }
}
