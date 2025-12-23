export const GAME_STATUS = [
  { key: 'backlog', label: 'Backlog' },
  { key: 'playing', label: 'Playing' },
  { key: 'completed', label: 'Completed' },
  { key: 'paused', label: 'Paused' },
  { key: 'dropped', label: 'Dropped' }
];

export const GAME_STATUS_MAP = GAME_STATUS.reduce((acc, s) => {
  acc[s.key] = s;
  return acc;
}, {});

export function statusFromLegacy({ currently_playing, end_date }) {
  if (end_date) return 'completed';
  if (currently_playing) return 'playing';
  return 'backlog';
}
