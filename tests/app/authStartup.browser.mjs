import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { join } from 'node:path';

const require = createRequire(import.meta.url);
const { expect } = require('@playwright/test');

export const startupHtml = `<!doctype html><html lang="hr"><body><div id="app"></div><script type="module">
const options = window.startupOptions;
history.replaceState({}, '', options.path || '/');
const { supabase } = await import('/src/supabase.js');
const { handleRecoveryEvent } = await import('/src/services/recoveryState.js');
const listeners = new Set();
let response = null;
let pending = [];
const sessionFor = id => id ? {user:{id,email:id+'@example.test',user_metadata:{name:'Audit'}},access_token:'fixture-token'} : null;
function emit(event, userId) {
  const session = sessionFor(userId);
  handleRecoveryEvent(event, session);
  for (const listener of listeners) listener(event, session);
}
window.startupControl = {
  calls: 0,
  landingSeen: false,
  frames: [],
  pause() { response = null; },
  emit,
  release({userId='startup-user',error=false,initial=true}={}) {
    response = {data:{session:sessionFor(error ? null : userId)},error:error ? new Error('Testni prekid provjere') : null};
    if (initial) emit('INITIAL_SESSION',error ? null : userId);
    const waiting = pending;
    pending = [];
    for (const resolve of waiting) resolve(response);
  },
  snapshot() {
    return {path:location.pathname,ready:window.startupStore?.authReady,loggedIn:window.startupStore?.isLoggedIn,
      userId:window.startupStore?.user?.id,error:window.startupStore?.authError,calls:this.calls,
      landing:!!document.querySelector('.hero-marquee'),dashboard:[...document.querySelectorAll('h2')].some(h=>h.textContent.trim()==='Trenutno igraš')};
  },
};
supabase.auth.getSession = () => {
  window.startupControl.calls++;
  if (response) return Promise.resolve(response);
  return new Promise(resolve => pending.push(resolve));
};
supabase.auth.onAuthStateChange = listener => {
  listeners.add(listener);
  return {data:{subscription:{unsubscribe(){listeners.delete(listener);}}}};
};
supabase.auth.signOut = async () => { emit('SIGNED_OUT',null); return {error:null}; };
function record() {
  const state = window.startupControl.snapshot();
  if (state.landing) window.startupControl.landingSeen = true;
  const frames = window.startupControl.frames;
  if (!frames.length || JSON.stringify(frames.at(-1)) !== JSON.stringify(state)) frames.push(state);
}
new MutationObserver(record).observe(document.getElementById('app'),{subtree:true,childList:true});
function frame() { record(); requestAnimationFrame(frame); }
requestAnimationFrame(frame);
await import('/src/main.js');
const { useUserStore } = await import('/src/stores/user.js');
window.startupStore = useUserStore();
window.startupMounted = true;
</script></body></html>`;

export async function checkAuthStartup(browser, origin, artifacts) {
  const errors = [];
  let checks = 0;
  const open = async (path = '/', width = 390) => {
    const context = await browser.newContext({ viewport: { width, height: 844 } });
    await context.addInitScript(options => { window.startupOptions = options; }, { path });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/*', route => {
      const request = route.request();
      const url = new URL(request.url());
      if (url.origin === new URL(origin).origin && !url.pathname.startsWith('/.netlify/functions/')) return route.continue();
      if (request.resourceType() === 'image') return route.abort();
      if (url.pathname.startsWith('/rest/v1/')) return route.fulfill({ json: [], headers: { 'content-range': '*/0' } });
      return route.fulfill({ json: { results: [], items: [], icons: {} } });
    });
    await page.goto(origin + '__startup');
    await page.waitForFunction(() => window.startupMounted);
    return { page, context };
  };
  const loading = page => page.getByRole('status').filter({ hasText: 'Učitavam Gamenote' });
  const dashboard = page => page.getByRole('heading', { name: 'Trenutno igraš', exact: true });
  const noLanding = async page => assert.equal(await page.evaluate(() => window.startupControl.landingSeen), false, 'Landing se nije pojavio ni u međukoraku');

  for (const width of [320, 390, 1440]) {
    const { page, context } = await open('/', width);
    await expect(loading(page)).toBeVisible();
    assert.equal(await page.evaluate(() => window.startupControl.calls), 1, 'Bootstrap i router dijele provjeru');
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    await noLanding(page);
    await page.screenshot({ path: join(artifacts, 'auth-loading-' + width + '.png') });
    await page.evaluate(() => window.startupControl.release());
    await expect(dashboard(page)).toBeVisible();
    await noLanding(page);
    assert.equal(new URL(page.url()).pathname, '/');
    await context.close();
    checks++;
  }

  {
    const { page, context } = await open();
    await expect(loading(page)).toBeVisible();
    await noLanding(page);
    await page.evaluate(() => window.startupControl.release({ userId: null }));
    await expect(page.locator('.hero-marquee')).toBeVisible();
    assert.equal(await page.evaluate(() => window.startupStore.authReady), true);
    await context.close();
    checks++;
  }

  for (const guest of [false, true]) {
    const { page, context } = await open('/profile');
    await expect(loading(page)).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Osobni podaci', exact: true })).toHaveCount(0);
    assert.equal(await page.evaluate(() => window.startupControl.calls), 1);
    await page.evaluate(guest => window.startupControl.release({ userId: guest ? null : 'startup-user' }), guest);
    if (guest) {
      await expect(page.getByRole('heading', { name: 'Prijavi se', exact: true })).toBeVisible();
      assert.equal(new URL(page.url()).pathname, '/login');
    } else {
      await expect(page.getByRole('heading', { name: 'Osobni podaci', exact: true })).toBeVisible();
      assert.equal(new URL(page.url()).pathname, '/profile');
    }
    await noLanding(page);
    await context.close();
    checks++;
  }

  for (const { path, guest } of [{ path: '/', guest: false }, { path: '/profile', guest: false }, { path: '/profile', guest: true }]) {
    const { page, context } = await open(path);
    await expect(loading(page)).toBeVisible();
    await page.evaluate(() => window.startupControl.release({ error: true }));
    await expect(page.getByRole('alert')).toContainText('Prijavu nije moguće provjeriti');
    assert.equal(new URL(page.url()).pathname, path, 'Greška ne preusmjerava na prijavu');
    assert.equal(await page.evaluate(() => window.startupStore.authReady), false);
    await noLanding(page);
    await page.screenshot({ path: join(artifacts, 'auth-error-' + (path === '/' ? 'home' : 'profile') + '.png') });
    await page.evaluate(() => window.startupControl.pause());
    await page.getByRole('button', { name: 'Pokušaj ponovno', exact: true }).click();
    await expect(loading(page)).toBeVisible();
    assert.equal(await page.evaluate(() => window.startupControl.calls), 2);
    await page.evaluate(guest => window.startupControl.release({ userId: guest ? null : 'startup-user' }), guest);
    if (guest) await expect(page.getByRole('heading', { name: 'Prijavi se', exact: true })).toBeVisible();
    else if (path === '/') await expect(dashboard(page)).toBeVisible();
    else await expect(page.getByRole('heading', { name: 'Osobni podaci', exact: true })).toBeVisible();
    await noLanding(page);
    await context.close();
    checks++;
  }

  for (const event of ['SIGNED_OUT', 'SIGNED_IN']) {
    const { page, context } = await open();
    await expect(loading(page)).toBeVisible();
    await page.evaluate(event => window.startupControl.emit(event, event === 'SIGNED_IN' ? 'new-user' : null), event);
    await page.evaluate(() => window.startupControl.release({ userId: 'old-user' }));
    if (event === 'SIGNED_OUT') {
      await expect(page.locator('.hero-marquee')).toBeVisible();
      assert.equal(await page.evaluate(() => window.startupStore.user), null, 'Zakašnjela sesija ne vraća odjavljenog korisnika');
    } else {
      await expect(dashboard(page)).toBeVisible();
      assert.equal(await page.evaluate(() => window.startupStore.user.id), 'new-user');
      await noLanding(page);
    }
    await context.close();
    checks++;
  }

  {
    const { page, context } = await open();
    await expect(loading(page)).toBeVisible();
    await page.evaluate(() => {
      window.startupControl.emit('SIGNED_IN', 'new-user');
      window.startupControl.release({ error: true });
    });
    await expect(dashboard(page)).toBeVisible();
    assert.equal(await page.evaluate(() => window.startupStore.user.id), 'new-user');
    assert.equal(await page.evaluate(() => window.startupStore.authError), '');
    await noLanding(page);
    await context.close();
    checks++;
  }

  for (const path of ['/privacy', '/tos']) {
    const { page, context } = await open(path);
    await expect(page.locator('h1')).toBeVisible();
    await expect(loading(page)).toHaveCount(0);
    assert.equal(await page.evaluate(() => window.startupStore.authReady), false);
    await page.evaluate(() => window.startupControl.release({ error: true }));
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Pokušaj ponovno', exact: true })).toHaveCount(0);
    await noLanding(page);
    await context.close();
    checks++;
  }

  {
    const { page, context } = await open('/reset-password');
    await page.evaluate(() => {
      window.startupControl.emit('PASSWORD_RECOVERY', 'startup-user');
      window.startupControl.release();
    });
    await expect(page.getByLabel('Nova lozinka', { exact: true })).toBeVisible();
    await noLanding(page);
    await context.close();
    checks++;
  }

  assert.deepEqual(errors, []);
  console.log('✓ ' + checks + ' provjera pokretanja: čekanje sesije, gost, greška i ponavljanje, rute, utrke i oporavak lozinke');
}
