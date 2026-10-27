export function stripHtml(value) {
  if (!value) return '';
  const document = new DOMParser().parseFromString(String(value), 'text/html');
  for (const element of document.querySelectorAll('script, style, iframe, object')) element.remove();
  return document.body.textContent?.trim() || '';
}

export function httpUrl(value) {
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

export function localAvatar(name = '') {
  const initials = String(name).trim().split(/\s+/).slice(0, 2).map(word => word[0] || '').join('').toUpperCase();
  const text = initials.replace(/[<>&"']/g, '') || '🎮';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="50" fill="#4338ca"/><text x="50" y="54" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="34" fill="white">${text}</text></svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}
