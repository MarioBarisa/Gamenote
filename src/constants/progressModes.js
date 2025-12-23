// Central definition of supported progress tracking modes
// Each mode defines how to capture and display progress

export const PROGRESS_MODES = [
  {
    key: 'completion_standard',
    label: 'Completion rate (Standard)',
    kind: 'percent',
    requiresTotal: true,
    defaultUnit: '%',
    badgeSource: 'standard'
  },
  {
    key: 'completion_nintendo',
    label: 'Completion rate (Nintendo)',
    kind: 'percent',
    requiresTotal: true,
    defaultUnit: '%',
    badgeSource: 'nintendo'
  },
  {
    key: 'achievements_steam',
    label: 'Achievements (Steam)',
    kind: 'ratio',
    requiresTotal: true,
    defaultUnit: 'achv',
    badgeSource: 'steam'
  },
  {
    key: 'achievements_xbox',
    label: 'Achievements (Xbox)',
    kind: 'ratio',
    requiresTotal: true,
    defaultUnit: 'achv',
    badgeSource: 'xbox'
  },
  {
    key: 'achievements_gamecentre',
    label: 'Achievements (Game Centre)',
    kind: 'ratio',
    requiresTotal: true,
    defaultUnit: 'achv',
    badgeSource: 'apple'
  },
  {
    key: 'trophies_psn',
    label: 'Trophies (PSN)',
    kind: 'count',
    requiresTotal: false,
    defaultUnit: 'trophies',
    badgeSource: 'psn'
  },
  {
    key: 'trophies_supercell',
    label: 'Trophies (Supercell)',
    kind: 'count',
    requiresTotal: false,
    defaultUnit: 'trophies',
    badgeSource: 'supercell'
  },
  {
    key: 'leaderboard_rank',
    label: 'Leaderboard rank (MP)',
    kind: 'rank',
    requiresTotal: false,
    defaultUnit: '#',
    badgeSource: 'rank'
  },
  {
    key: 'pokedex',
    label: 'Pokédex (caught/total)',
    kind: 'ratio',
    requiresTotal: true,
    defaultUnit: 'caught',
    badgeSource: 'nintendo'
  }
];

export const PROGRESS_MODE_MAP = PROGRESS_MODES.reduce((acc, m) => {
  acc[m.key] = m;
  return acc;
}, {});

export function computePercent({ progress_mode, progress_value, progress_total, achievement_percent }) {
  // Prefer new fields when available; fallback to legacy achievement_percent
  const mode = PROGRESS_MODE_MAP[progress_mode];
  if (mode && (mode.kind === 'percent' || mode.kind === 'ratio')) {
    const v = Number(progress_value) || 0;
    const t = Number(progress_total) || 0;
    if (t > 0) return Math.max(0, Math.min(100, Math.round((v / t) * 100)));
  }
  if (typeof achievement_percent === 'number') {
    return Math.max(0, Math.min(100, Math.round(achievement_percent)));
  }
  return null;
}

export function progressLabel(game) {
  const mode = PROGRESS_MODE_MAP[game.progress_mode];
  if (!mode) return null;
  const v = game.progress_value;
  const t = game.progress_total;
  switch (mode.kind) {
    case 'count':
      return `${v ?? 0} ${mode.defaultUnit}`;
    case 'rank':
      return v ? `#${v}` : null;
    case 'ratio':
      return (v != null && t != null) ? `${v}/${t}` : null;
    case 'percent': {
      const p = computePercent(game);
      return p != null ? `${p}%` : null;
    }
    default:
      return null;
  }
}
