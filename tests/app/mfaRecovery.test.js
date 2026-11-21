import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { createHandler } = require('../../netlify/functions/mfa-recovery.js');
const fixtureFactors = [{ id: 'factor', factor_type: 'totp', status: 'verified' }];
const token = aal => 'header.' + Buffer.from(JSON.stringify({ aal })).toString('base64url') + '.signature';

function fixture() {
  let row = null;
  let factors = fixtureFactors;
  let authDeletes = 0;
  let failDeletion = false;
  const client = {
    auth: {
      async getUser() { return { data: { user: { id: 'user', factors } } }; },
      admin: {
        mfa: {
          async deleteFactor({ userId, id }) {
            assert.equal(userId, 'user');
            assert.equal(id, 'factor');
            if (failDeletion) return { error: new Error('Privremena greška') };
            authDeletes++;
            factors = [];
            return {};
          },
        },
      },
    },
    from(table) {
      assert.equal(table, 'mfa_recovery_codes');
      let action = 'read';
      let patch;
      const conditions = {};
      const query = {
        select() { return this; },
        eq(key, value) { conditions[key] = value; return this; },
        update(values) { action = 'update'; patch = values; return this; },
        delete() { action = 'delete'; return this; },
        async upsert(value) { row = value; return {}; },
        async maybeSingle() {
          if (!row || Object.entries(conditions).some(([key, value]) => row[key] !== value)) return { data: null };
          if (action === 'update') row = { ...row, ...patch };
          if (action === 'delete') row = null;
          return { data: row };
        },
        then(resolve, reject) { return this.maybeSingle().then(resolve, reject); },
      };
      return query;
    },
  };
  const handler = createHandler({
    SUPABASE_URL: 'https://supabase.test',
    SUPABASE_SERVICE_ROLE_KEY: 'fixture',
    MFA_RECOVERY_KEY: Buffer.alloc(32, 19).toString('base64'),
  }, () => client);
  return {
    async call(aal, action, params = {}) {
      const result = await handler({ httpMethod: 'POST', headers: { authorization: 'Bearer ' + token(aal) },
        body: JSON.stringify({ action, ...params }) });
      assert.equal(result.headers['cache-control'], 'no-store');
      return { status: result.statusCode, data: JSON.parse(result.body) };
    },
    stored: () => row?.payload,
    deletions: () => authDeletes,
    failDelete(value) { failDeletion = value; },
  };
}

test('Kodovi se izdaju samo uz AAL2 i pohranjuju kao kompaktan šifrat', async () => {
  const app = fixture();
  assert.equal((await app.call('aal1', 'issue', { factorId: 'factor' })).status, 403);
  assert.equal((await app.call('aal2', 'issue', { factorId: 'other' })).status, 403);
  const issued = await app.call('aal2', 'issue', { factorId: 'factor' });
  assert.equal(issued.status, 200);
  assert.equal(new Set(issued.data.codes).size, 10);
  assert.match(issued.data.codes[0], /^[A-F0-9]{4}(?:-[A-F0-9]{4}){7}$/);
  assert.equal(app.stored().startsWith('\\x'), true);
  assert.ok(Buffer.from(app.stored().slice(2), 'hex').length < 200);
  for (const code of issued.data.codes) {
    assert.equal(app.stored().includes(code.replaceAll('-', '').toLowerCase()), false);
  }
});

test('Pogrešan i ponovno iskorišten kod ne uklanjaju TOTP', async () => {
  const app = fixture();
  const { data } = await app.call('aal2', 'issue', { factorId: 'factor' });
  assert.equal((await app.call('aal1', 'recover', { code: 'F'.repeat(32) })).status, 400);
  assert.equal(app.deletions(), 0);
  const results = await Promise.all([
    app.call('aal1', 'recover', { code: data.codes[0].toLowerCase() }),
    app.call('aal1', 'recover', { code: data.codes[0].replaceAll('-', '') }),
  ]);
  assert.equal(results.filter(result => result.status === 200).length, 1);
  assert.equal(app.deletions(), 1);
  assert.equal((await app.call('aal1', 'recover', { code: data.codes[0] })).status, 400);
  assert.equal(app.stored(), undefined);
});

test('Privremena greška Auth API-ja vraća pravo na ponovni pokušaj', async () => {
  const app = fixture();
  const { data } = await app.call('aal2', 'issue', { factorId: 'factor' });
  app.failDelete(true);
  assert.equal((await app.call('aal1', 'recover', { code: data.codes[0] })).status, 503);
  app.failDelete(false);
  assert.equal((await app.call('aal1', 'recover', { code: data.codes[0] })).status, 200);
});
