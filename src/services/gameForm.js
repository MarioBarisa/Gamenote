import { computePercent, PROGRESS_MODE_MAP } from '../constants/progressModes.js';
import { statusFromLegacy } from '../constants/gameStatus.js';

export function progressModeForPlatform(platform) {
  const value = String(platform || '').toLowerCase();
  if (value.includes('playstation')) return 'trophies_psn';
  if (value.includes('xbox')) return 'achievements_xbox';
  if (value === 'pc' || value.includes('steam')) return 'achievements_steam';
  if (value.includes('nintendo')) return 'completion_nintendo';
  if (value.includes('ios')) return 'achievements_gamecentre';
  return 'completion_standard';
}

export function createGameForm(game = {}, groupIds = []) {
  return {
    title: game.title ?? '', platform: game.platform ?? '', play_time: game.play_time ?? '',
    genre: game.genre ?? '', publisher: game.publisher ?? '', rating: game.rating ?? 0,
    notes: game.notes ?? '', start_date: game.start_date?.slice(0, 10) || '', end_date: game.end_date?.slice(0, 10) || '',
    status: game.status || statusFromLegacy(game),
    progress_mode: game.progress_mode || 'completion_standard',
    progress_value: game.progress_value ?? null, progress_total: game.progress_total ?? null,
    progress_unit: game.progress_unit ?? '%', progress_source: game.progress_source ?? '',
    achievement_percent: game.achievement_percent ?? null, group_ids: [...groupIds],
  };
}

export function progressFields(form) {
  const value = form.progress_value === '' || form.progress_value == null ? null : Number(form.progress_value);
  const total = form.progress_total === '' || form.progress_total == null ? null : Number(form.progress_total);
  for (const number of [value, total]) {
    if (number != null && (!Number.isFinite(number) || number < 0)) throw new Error('Napredak mora biti pozitivan broj ili nula.');
  }
  if (total > 0 && value > total && PROGRESS_MODE_MAP[form.progress_mode]?.kind !== 'rank') throw new Error('Napredak ne može biti veći od ukupnog broja.');
  const fields = {
    progress_mode: form.progress_mode || null, progress_value: value, progress_total: total,
    progress_unit: form.progress_unit || null, progress_source: form.progress_source || null,
  };
  fields.achievement_percent = computePercent({ ...fields, achievement_percent: form.achievement_percent });
  return fields;
}

export function buildGameUpdate(form) {
  if (!form.title?.trim() || !form.platform) throw new Error('Unesi naziv i platformu igre.');
  if (form.start_date && form.end_date && form.start_date > form.end_date) throw new Error('Datum završetka ne može biti prije početka.');
  const hours = form.play_time === '' || form.play_time == null ? null : Number(form.play_time);
  if (hours != null && (!Number.isFinite(hours) || hours < 0)) throw new Error('Vrijeme igranja mora biti pozitivan broj ili nula.');
  if (form.rating && (!Number.isInteger(Number(form.rating)) || form.rating < 1 || form.rating > 5)) throw new Error('Ocjena mora biti između 1 i 5.');
  return {
    title: form.title.trim(), platform: form.platform, play_time: hours,
    genre: form.genre || null, publisher: form.publisher || null, rating: Number(form.rating) || null,
    notes: form.notes || '', start_date: form.start_date || null, end_date: form.end_date || null,
    status: form.status || 'backlog', currently_playing: form.status === 'playing',
    ...progressFields(form), updated_at: new Date().toISOString(),
  };
}
