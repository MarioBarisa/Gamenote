export function normalizeTitle(value) {
  return String(value || '').normalize('NFD').toLowerCase()
    .replace(/[™®©]/g, '').replace(/[:\-–—_]/g, ' ').replace(/\s+/g, ' ').trim();
}

export function baseGameTitle(value) {
  return normalizeTitle(value)
    .replace(/[()[\]]/g, ' ')
    .replace(/\s+\d+(?:st|nd|rd|th)?\s+(?:anniversary|obljetnica)(?:\s+(?:celebration|update|event))?\s*$/i, '')
    .replace(/\s+(?:version|ver\.?|v)\s*\d+(?:\.\d+)+(?:\s+update)?\s*$/i, '')
    .replace(/\s+/g, ' ').trim();
}

export function relatedGameTitles(first, second) {
  if (!normalizeTitle(first) || !normalizeTitle(second)) return false;
  if (normalizeTitle(first) === normalizeTitle(second)) return true;
  const base = baseGameTitle(first);
  return base.length >= 5 && base === baseGameTitle(second);
}

export function canonicalPlatform(value) {
  const name = String(value || '').trim().toLowerCase();
  if (['pc', 'steam', 'windows', 'pc (microsoft windows)'].includes(name)) return 'pc';
  if (['ps4', 'playstation 4'].includes(name)) return 'ps4';
  if (['ps5', 'playstation 5'].includes(name)) return 'ps5';
  return name;
}

export function otherPlatforms(rows, name, platform) {
  const result = new Set();
  for (const row of rows) {
    if (relatedGameTitles(row.title, name) && canonicalPlatform(row.platform) !== canonicalPlatform(platform)) {
      result.add(row.platform || 'Nepoznata platforma');
    }
  }
  return [...result];
}
