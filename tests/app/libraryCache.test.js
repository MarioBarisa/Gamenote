import test from 'node:test';
import assert from 'node:assert/strict';
import { getCachedGames, invalidateGames } from '../../src/services/libraryCache.js';

function database(load) {
  return {
    from(table) {
      assert.equal(table, 'games');
      return {
        select() { return this; },
        eq() { return this; },
        order() { return this; },
        range() { return this; },
        abortSignal() { return load(); },
      };
    },
  };
}

const result = id => ({ data: [{ id }], count: 1, error: null });

test('Cache istječe i invalidira se po korisniku', async context => {
  let now = 1_000;
  let reads = 0;
  context.mock.method(Date, 'now', () => now);
  const supabase = database(() => Promise.resolve(result(++reads)));
  assert.deepEqual(await getCachedGames(supabase, 'cache-user'), [{ id: 1 }]);
  assert.deepEqual(await getCachedGames(supabase, 'cache-user'), [{ id: 1 }]);
  assert.deepEqual(await getCachedGames(supabase, 'other-user'), [{ id: 2 }]);
  invalidateGames('cache-user');
  assert.deepEqual(await getCachedGames(supabase, 'other-user'), [{ id: 2 }]);
  assert.deepEqual(await getCachedGames(supabase, 'cache-user'), [{ id: 3 }]);
  now += 300_000;
  assert.deepEqual(await getCachedGames(supabase, 'cache-user'), [{ id: 4 }]);
});

test('Promjena tijekom dohvata odbacuje stari rezultat i dijeli ponovljeni zahtjev', async () => {
  let reads = 0;
  let finishFirst;
  const supabase = database(() => {
    reads++;
    if (reads === 1) return new Promise(resolve => { finishFirst = resolve; });
    return Promise.resolve(result('new'));
  });
  const first = getCachedGames(supabase, 'parallel-user');
  const parallel = getCachedGames(supabase, 'parallel-user', { force: true });
  assert.equal(first, parallel);
  assert.equal(reads, 1);
  invalidateGames('parallel-user');
  finishFirst(result('old'));
  assert.deepEqual(await first, [{ id: 'new' }]);
  assert.deepEqual(await parallel, [{ id: 'new' }]);
  assert.equal(reads, 2);
});
