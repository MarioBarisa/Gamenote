import daisyThemes from 'daisyui/theme/object';

export const CARD_THEMES = [];
for (const name of Object.keys(daisyThemes).sort()) {
  const tokens = daisyThemes[name];
  CARD_THEMES.push({
    value: 'theme:' + name,
    label: name[0].toUpperCase() + name.slice(1),
    color: tokens['--color-base-100'],
    content: tokens['--color-base-content'],
    surface: tokens['--color-base-200'],
    watermark: tokens['--color-base-300'],
    primary: tokens['--color-primary'],
    primaryContent: tokens['--color-primary-content'],
    secondary: tokens['--color-secondary'],
    accent: tokens['--color-accent'],
    success: tokens['--color-success'],
    info: tokens['--color-info'],
    tokens,
  });
}

export const SIGNATURE_THEMES = CARD_THEMES.filter(theme => ['theme:autumn', 'theme:cyberpunk', 'theme:dim', 'theme:dracula', 'theme:forest', 'theme:halloween', 'theme:night', 'theme:winter'].includes(theme.value));
export const EXTRA_CARD_THEMES = CARD_THEMES.filter(theme => !SIGNATURE_THEMES.some(signature => signature.value === theme.value));

export const GENRE_THEMES = [
  { genres: ['action', 'shooter', 'first-person shooter', 'fighting', 'racing'], theme: 'autumn' },
  { genres: ['rpg', 'role-playing', 'roleplaying', 'survival', 'mmo', 'massively multiplayer'], theme: 'dracula' },
  { genres: ['horror', 'horor', 'survival horror', 'survival-horror'], theme: 'halloween' },
  { genres: ['adventure'], theme: 'dim' },
  { genres: ['platformer', 'platform', 'simulation', 'simulator'], theme: 'forest' },
  { genres: ['strategy', 'sports', 'sport', 'board games', 'card games', 'moba'], theme: 'night' },
  { genres: ['puzzle', 'funny', 'comedy', 'edu', 'education', 'educational', 'casual', 'family'], theme: 'winter' },
  { genres: ['indie', 'arcade', 'party', 'gacha'], theme: 'cyberpunk' },
  { genres: ['music'], theme: 'synthwave' },
];

function selectedTheme(value) {
  return CARD_THEMES.find(theme => theme.value === value);
}

export function signatureForGenre(genre) {
  const normalized = String(genre || '').trim().toLowerCase();
  let themeName = 'sunset';
  for (const entry of GENRE_THEMES) {
    if (entry.genres.includes(normalized)) {
      themeName = entry.theme;
      break;
    }
  }
  return { ...selectedTheme('theme:' + themeName), genre: String(genre || '').trim() };
}

export function cardColorValue(selection, genre) {
  if (validCardColor(selection)) return selection;
  return (selectedTheme(selection) || signatureForGenre(genre)).color;
}

export function cardColorHex(color) {
  if (validCardColor(color)) return color;
  // Samo izvorni birač zahtijeva HEX zapis.
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1;
  const context = canvas.getContext('2d');
  context.fillStyle = color;
  context.fillRect(0, 0, 1, 1);
  const pixel = context.getImageData(0, 0, 1, 1).data;
  let hex = '#';
  for (let index = 0; index < 3; index++) hex += pixel[index].toString(16).padStart(2, '0');
  return hex;
}

export function validCardColor(value) {
  return typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value);
}

function luminance(color) {
  const channels = [];
  for (let index = 1; index < 7; index += 2) {
    const value = parseInt(color.slice(index, index + 2), 16) / 255;
    channels.push(value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  }
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

function contrastRatio(firstLevel, secondLevel) {
  return (Math.max(firstLevel, secondLevel) + 0.05) / (Math.min(firstLevel, secondLevel) + 0.05);
}

function themeContentOnCustomColor(background, theme) {
  const level = luminance(background);
  let bestColor = theme.content;
  let bestContrast = contrastRatio(level, luminance(cardColorHex(bestColor)));
  if (bestContrast >= 4.5) return bestColor;
  for (const [key, candidate] of Object.entries(theme.tokens)) {
    if (!key.startsWith('--color-')) continue;
    const candidateLevel = luminance(cardColorHex(candidate));
    const contrast = contrastRatio(level, candidateLevel);
    if (contrast > bestContrast) {
      bestContrast = contrast;
      bestColor = candidate;
    }
  }
  return bestColor;
}

export function cardDisplayPalette(selection, genre, customTheme = '') {
  const custom = validCardColor(selection);
  const theme = selectedTheme(selection) || (custom && selectedTheme(customTheme)) || signatureForGenre(genre);
  const palette = {
    background: custom ? selection : theme.color,
    foreground: custom ? themeContentOnCustomColor(selection, theme) : theme.content,
    surface: theme.surface,
    surfaceContent: theme.content,
    watermark: theme.watermark,
    primary: theme.primary,
    primaryContent: theme.primaryContent,
    secondary: theme.secondary,
    accent: theme.accent,
    success: theme.success,
    info: theme.info,
  };
  if (custom) {
    const backgroundLevel = luminance(selection);
    const foregroundContrast = contrastRatio(backgroundLevel, luminance(cardColorHex(palette.foreground)));
    for (const key of ['primary', 'accent', 'success', 'info']) {
      const contrast = contrastRatio(backgroundLevel, luminance(cardColorHex(palette[key])));
      if (contrast < 4.5 && foregroundContrast > contrast) palette[key] = palette.foreground;
    }
  }
  return palette;
}

export function loadCardColor(userId) {
  try {
    const saved = localStorage.getItem('gamenote.gamercard.color.' + userId);
    if (saved === 'auto') return 'signature';
    if (saved === 'signature' || validCardColor(saved) || selectedTheme(saved)) return saved;
  } catch { /* Privatni način može onemogućiti spremnik. */ }
  return 'signature';
}

export function saveCardColor(userId, value) {
  if (!userId || (value !== 'signature' && !validCardColor(value) && !selectedTheme(value))) return;
  try { localStorage.setItem('gamenote.gamercard.color.' + userId, value); }
  catch { /* Odabir ostaje aktivan bez spremnika. */ }
}

export function loadCardTheme(userId) {
  try {
    const saved = localStorage.getItem('gamenote.gamercard.theme.' + userId);
    if (selectedTheme(saved)) return saved;
  } catch { /* Privatni način može onemogućiti spremnik. */ }
  return '';
}

export function saveCardTheme(userId, value) {
  if (!userId || !selectedTheme(value)) return;
  try { localStorage.setItem('gamenote.gamercard.theme.' + userId, value); }
  catch { /* Odabir ostaje aktivan bez spremnika. */ }
}
