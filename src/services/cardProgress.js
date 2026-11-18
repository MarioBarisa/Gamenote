import { PROGRESS_MODE_MAP } from '../constants/progressModes.js';

export function cardProgress(game) {
  const mode = PROGRESS_MODE_MAP[game.progress_mode];
  const value = game.progress_value == null || game.progress_value === '' ? null : Number(game.progress_value);
  const total = Number(game.progress_total);
  const validValue = value != null && Number.isFinite(value) && value >= 0;
  const hasTotal = Number.isFinite(total) && total > 0;
  if (mode?.kind === 'rank') {
    return { available: validValue && value > 0, text: value > 0 ? `#${value}` : '—', percent: null, complete: false };
  }
  if (validValue && hasTotal) {
    const current = Math.min(value, total);
    const complete = value === total;
    // Oznaka 100% traži stvarnu dovršenost.
    const percent = complete ? 100 : Math.min(99, Math.round(current / total * 100));
    return { available: true, text: mode?.kind === 'percent' ? `${percent}%` : `${current}/${total}`, percent, complete };
  }
  if (mode?.kind === 'count' && validValue) {
    return { available: true, text: String(value), percent: null, complete: false };
  }
  const legacy = game.achievement_percent;
  if (typeof legacy === 'number' && Number.isFinite(legacy)) {
    const percent = Math.max(0, Math.min(100, Math.round(legacy)));
    return { available: true, text: `${percent}%`, percent, complete: false };
  }
  return { available: false, text: '—', percent: null, complete: false };
}
