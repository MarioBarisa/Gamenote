import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { expect } = require('@playwright/test');

export const mfaHtml = `<!doctype html><html><body><div id="app"></div><script type="module">
const { supabase } = await import('/src/supabase.js');
history.replaceState({}, '', '/profile');
const user = {id:'mfa-user', email:'mfa@example.test', user_metadata:{name:'MFA korisnik'}, factors:[]};
const factor = {id:'fixture-factor', factor_type:'totp', friendly_name:'Gamenote', status:'verified'};
const listeners = new Set();
const pack = aal => ({user: structuredClone(user), access_token:'header.'+btoa(JSON.stringify({aal}))+'.signature'});
let session = pack('aal1');
const emit = (event, next) => {
  session = next;
  for (const handler of listeners) handler(event, next);
};
window.mfaControl = { removed:0, enrolled:0, passwordChanges:0, verified:[], recover() { user.factors = []; } };
supabase.auth.getSession = async () => ({data:{session},error:null});
supabase.auth.refreshSession = async () => {
  emit('TOKEN_REFRESHED', pack('aal1'));
  return {data:{session}};
};
supabase.auth.onAuthStateChange = handler => {
  listeners.add(handler);
  return {data:{subscription:{unsubscribe:()=>listeners.delete(handler)}}};
};
supabase.auth.signInWithPassword = async () => {
  emit('SIGNED_IN', pack('aal1'));
  return {data:{session}};
};
supabase.auth.signOut = async () => { emit('SIGNED_OUT', null); return {}; };
supabase.auth.updateUser = async ({ password }) => {
  if (password) window.mfaControl.passwordChanges++;
  return {};
};
supabase.auth.mfa.listFactors = async () => ({data:{all:user.factors,totp:user.factors}});
supabase.auth.mfa.enroll = async () => {
  window.mfaControl.enrolled++;
  return {data:{id:factor.id,totp:{secret:'FIXTURESECRET',qr_code:'data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22/%3E'}}};
};
supabase.auth.mfa.challenge = async () => ({data:{id:'fixture-challenge'}});
supabase.auth.mfa.verify = async ({code, factorId, challengeId}) => {
  window.mfaControl.verified.push({code,factorId,challengeId});
  if (code !== '042136') return {error:{code:'mfa_verification_failed'}};
  user.factors = [factor];
  emit('MFA_CHALLENGE_VERIFIED', pack('aal2'));
  return {data:session};
};
supabase.auth.mfa.unenroll = async () => {
  window.mfaControl.removed++;
  user.factors = [];
  emit('USER_UPDATED', pack('aal1'));
  return {};
};
await import('/src/main.js');
window.mfaRouter = (await import('/src/router/index.js')).default;
</script></body></html>`;

export async function checkMfa(browser, origin) {
  const context = await browser.newContext({ locale: 'hr-HR', viewport: { width: 390, height: 844 } });
  try {
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', failure => errors.push(failure.message));
    const recoveryCode = 'ABCD-ABCD-ABCD-ABCD-ABCD-ABCD-ABCD-ABCD';
    await context.route('**/*', async route => {
      const request = route.request();
      const url = new URL(request.url());
      if (url.pathname.startsWith('/auth/v1/token')) {
        if (request.postDataJSON().password !== 'fixture-password') {
          return route.fulfill({ status: 400, json: { error_code: 'invalid_credentials', message: 'Invalid login credentials' } });
        }
        return route.fulfill({ json: {
          user: { id: 'mfa-user', email: 'mfa@example.test' }, access_token: 'fixture-token',
          refresh_token: 'fixture-refresh', expires_in: 3600, token_type: 'bearer',
        } });
      }
      if (url.pathname.startsWith('/auth/v1/logout')) return route.fulfill({ status: 204 });
      if (url.pathname.startsWith('/rest/v1/')) return route.fulfill({ json: [], headers: { 'content-range': '*/0' } });
      if (url.pathname === '/.netlify/functions/mfa-recovery') {
        const body = request.postDataJSON();
        if (body.action === 'issue') return route.fulfill({ json: { codes: [recoveryCode] } });
        if (body.action === 'recover') {
          assert.equal(body.code, recoveryCode);
          await page.evaluate(() => window.mfaControl.recover());
        }
        return route.fulfill({ json: {} });
      }
      if (url.origin === new URL(origin).origin && !url.pathname.startsWith('/.netlify/functions/')) return route.continue();
      return route.fulfill({ json: { results: [], items: [] } });
    });
    await page.goto(origin + '__mfa');
    const settings = page.getByRole('button', { name: 'TOTP postavke', exact: true });
    await expect(settings.locator('svg')).toHaveAttribute('viewBox', '0 0 24 24');
    assert.equal(await settings.evaluate(button => button.offsetWidth === button.parentElement.offsetWidth), true);
    assert.equal(await settings.evaluate(button => Boolean(
      button.compareDocumentPosition(document.getElementById('profile-new-password')) & Node.DOCUMENT_POSITION_FOLLOWING)), true);
    const modal = page.locator('dialog[open]');
    const otp = modal.locator('input[name=totp]');
    const checkCenteredCode = async (width) => {
      await page.setViewportSize({ width, height: 844 });
      await expect(otp).toBeVisible();
      const offset = await otp.evaluate(input => {
        const field = input.closest('label').getBoundingClientRect();
        const box = input.closest('.modal-box').getBoundingClientRect();
        return Math.abs(field.left + field.width / 2 - box.left - box.width / 2);
      });
      assert.ok(offset < 2, `TOTP je centriran na širini ${width}px`);
    };
    const reauth = async (action, password = 'fixture-password') => {
      await settings.click();
      await modal.getByRole('button', { name: action, exact: true }).click();
      await modal.getByLabel('Potvrdi trenutnu lozinku').fill(password);
      await modal.getByRole('button', { name: 'Nastavi', exact: true }).click();
    };
    await reauth('Uključi TOTP', 'bad-password');
    await expect(page.getByText('Trenutna lozinka nije točna.')).toBeVisible();
    await expect(modal).toHaveCount(1);
    await expect(modal.locator('img')).toHaveCount(0);
    assert.equal(await page.evaluate(() => window.mfaControl.enrolled), 0);
    await page.getByLabel('Potvrdi trenutnu lozinku').fill('fixture-password');
    await page.getByRole('button', { name: 'Nastavi', exact: true }).click();
    await expect(modal.getByText('FIXTURESECRET')).toBeVisible();
    await modal.getByRole('button', { name: 'zatvori', exact: true }).click();
    await expect.poll(() => page.evaluate(() => window.mfaControl.removed)).toBe(1);
    await reauth('Uključi TOTP');
    await expect(otp).toHaveAttribute('autocomplete', 'one-time-code');
    await expect(modal.locator('.otp > span')).toHaveCount(6);
    await checkCenteredCode(320);
    await otp.fill('123456');
    await modal.getByRole('button', { name: 'Potvrdi i uključi' }).click();
    await expect(modal.getByRole('alert')).toHaveText(/Kod nije točan/);
    await otp.evaluate(input => {
      const clipboardData = new DataTransfer();
      clipboardData.setData('text/plain', '042 136');
      input.dispatchEvent(new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData }));
    });
    await expect(otp).toHaveValue('042136');
    await modal.getByRole('button', { name: 'Potvrdi i uključi' }).click();
    await expect(modal.getByText(recoveryCode)).toBeVisible();
    await modal.getByRole('button', { name: 'zatvori', exact: true }).click();
    await expect(page.getByText('Zaštićen račun')).toBeVisible();
    await expect(page.getByText('Dvostruka autentikacija je uključena.')).toHaveClass(/text-success/);
    await page.locator('#profile-new-password').fill('fixture-new-password');
    await page.locator('#profile-confirm-password').fill('fixture-new-password');
    await page.getByRole('button', { name: 'Promijeni lozinku', exact: true }).click();
    await expect(modal.getByRole('heading', { name: 'Potvrdi promjenu lozinke' })).toBeVisible();
    await checkCenteredCode(1440);
    await otp.fill('123456');
    await modal.getByRole('button', { name: 'Potvrdi kod' }).click();
    await expect(modal.getByRole('alert')).toHaveText(/Kod nije točan/);
    assert.equal(await page.evaluate(() => window.mfaControl.passwordChanges), 0);
    await otp.fill('042136');
    await modal.getByRole('button', { name: 'Potvrdi kod' }).click();
    await expect.poll(() => page.evaluate(() => window.mfaControl.passwordChanges)).toBe(1);

    const login = async () => {
      await page.evaluate(async () => {
        const { supabase } = await import('/src/supabase.js');
        await supabase.auth.signOut();
      });
      await expect(page).toHaveURL(/\/login/);
      await page.locator('#signin-email').fill('mfa@example.test');
      await page.locator('#signin-password').fill('fixture-password');
      await page.locator('form').filter({ has: page.locator('#signin-password') }).getByRole('button', { name: 'Prijava', exact: true }).click();
      await expect(modal.getByRole('heading', { name: 'Potvrdi prijavu' })).toBeVisible();
    };
    await login();
    await checkCenteredCode(390);
    await page.evaluate(() => window.mfaRouter.push('/library'));
    await expect(page).toHaveURL(/\/login/);
    await expect(modal).toBeVisible();
    await otp.fill('042136');
    await modal.getByRole('button', { name: 'Potvrdi kod' }).click();
    await expect(page).toHaveURL(/\/library$/);
    await expect(page.getByRole('heading', { name: 'Moje igre', exact: true })).toBeVisible();
    await login();
    await modal.getByRole('button', { name: 'Upotrijebi kod za oporavak' }).click();
    await modal.getByLabel('Kod za oporavak', { exact: true }).fill(recoveryCode);
    await modal.getByRole('button', { name: 'Potvrdi kod' }).click();
    await expect(page).toHaveURL(/\/profile\?mfa=recovered/);
    await expect(page.getByText('Pristup je vraćen.', { exact: false })).toBeVisible();

    await reauth('Uključi TOTP');
    await otp.fill('042136');
    await modal.getByRole('button', { name: 'Potvrdi i uključi' }).click();
    await expect(modal.getByText(recoveryCode)).toBeVisible();
    await modal.getByRole('button', { name: 'zatvori', exact: true }).click();
    await reauth('Isključi TOTP');
    await modal.getByRole('button', { name: 'Isključi TOTP', exact: true }).click();
    await expect(modal.getByText('Dvostruka autentikacija je isključena.')).toBeVisible();
    assert.deepEqual(errors, []);
    console.log('✓ TOTP ponovno traži lozinku, prihvaća lijepljenje, štiti rute i podržava oporavak i isključivanje');
  } finally {
    await context.close();
  }
}
