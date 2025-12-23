// helperi sa specificne platforme 100%

const PLATFORM_MATCHERS = [
  {
    key: 'playstation',
    keywords: ['playstation', 'ps5', 'ps4', 'ps3', 'ps vita'],
    label: 'Platinum (PlayStation)',
    className: 'badge-primary',
    icon: '🏆'
  },
  {
    key: 'xbox',
    keywords: ['xbox', 'series x', 'series s', 'xbox one'],
    label: '100% Achievements (Xbox)',
    className: 'badge-success',
    icon: '✳'
  },
  {
    key: 'steam',
    keywords: ['steam'],
    label: '100% Achievements (Steam)',
    className: 'badge-neutral',
    icon: '★'
  },
  {
    key: 'pc',
    keywords: ['pc', 'windows'],
    label: '100% Achievements',
    className: 'badge-neutral',
    icon: '★'
  },
  {
    key: 'nintendo',
    keywords: ['nintendo', 'switch'],
    label: '100% Clear (Nintendo)',
    className: 'badge-warning',
    icon: '⭐'
  },
  {
    key: 'supercell',
    keywords: ['brawl stars', 'supercell'],
    label: 'Max Trophies',
    className: 'badge-info',
    icon: '🌟'
  },
  {
    key: 'mobile',
    keywords: ['ios', 'android', 'mobile'],
    label: '100% Clear (Mobile)',
    className: 'badge-info',
    icon: '📱'
  }
];

export function getCompletionBadge(game) {
  const platformText = (game?.platform || '').toLowerCase();
  const sourceText = (game?.progress_source || '').toLowerCase();
  const titleText = (game?.title || '').toLowerCase();

  for (const matcher of PLATFORM_MATCHERS) {
    const hit = matcher.keywords.some(keyword =>
      platformText.includes(keyword) || sourceText.includes(keyword) || titleText.includes(keyword)
    );
    if (hit) {
      return {
        label: matcher.label,
        className: matcher.className,
        icon: matcher.icon
      };
    }
  }

  return {
    label: '100% dovršeno',
    className: 'badge-success',
    icon: '✔'
  };
}
