import test from 'node:test';
import assert from 'node:assert/strict';
import { cardProgress } from '../../src/services/cardProgress.js';

test('kartica čuva nulu, rang i stvarnu dovršenost', () => {
  const base = { progress_mode: 'achievements_steam', progress_value: 0, progress_total: 40 };
  assert.deepEqual(cardProgress(base), { available: true, text: '0/40', percent: 0, complete: false });
  const partial = cardProgress({ ...base, progress_value: 199, progress_total: 200 });
  assert.equal(partial.percent, 99);
  assert.equal(partial.complete, false);
  assert.equal(cardProgress({ ...base, progress_value: 40 }).complete, true);
  assert.deepEqual(cardProgress({ progress_mode: 'leaderboard_rank', progress_value: 5 }), { available: true, text: '#5', percent: null, complete: false });
  assert.equal(cardProgress({ progress_mode: 'trophies_psn', progress_value: 0 }).text, '0');
  assert.equal(cardProgress({ progress_mode: 'completion_standard', progress_value: 25, progress_total: 100 }).text, '25%');
  assert.equal(cardProgress({ achievement_percent: 100 }).complete, false);
  assert.equal(cardProgress({}).available, false);
  assert.equal(cardProgress({ ...base, progress_value: -1 }).available, false);
  assert.equal(cardProgress({ ...base, progress_value: 'bad' }).available, false);
});
