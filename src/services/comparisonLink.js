import { normalizeUsername, usernameError } from '../constants/libraryShare.js';

export function comparisonNames(left, right) {
  left = normalizeUsername(left); right = normalizeUsername(right);
  if (usernameError(left) || usernameError(right) || left === right) return null;
  return { left, right };
}

export function comparisonPath(left, right) {
  const names = comparisonNames(left, right);
  return names ? `/compare/${names.left}/${names.right}` : '';
}

export function comparisonFromPath(path) {
  const match = String(path).match(/^\/compare\/([^/]+)\/([^/]+)\/?$/);
  return match ? comparisonNames(match[1], match[2]) : null;
}

export function comparisonPreviewImage(left, right) {
  return `https://gamenote.eu/.netlify/functions/library-card?username=${encodeURIComponent(left)}&compare=${encodeURIComponent(right)}`;
}
