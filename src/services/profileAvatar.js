export function normalizeAvatarUrl(value) {
  const text = String(value || '').trim();
  if (!text || text.length > 2048) throw new Error('Unesi izravnu HTTP ili HTTPS poveznicu na sliku.');
  let url;
  try { url = new URL(text); } catch { throw new Error('Unesi ispravnu poveznicu na sliku.'); }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error('Unesi javnu HTTP ili HTTPS poveznicu bez pristupnih podataka.');
  return url.href;
}
