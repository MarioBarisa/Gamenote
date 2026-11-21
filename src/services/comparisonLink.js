import { normalizeUsername, usernameErrorKey } from '../constants/libraryUsername.js';
import { siteUrl } from './metadataHtml.js';

export function comparisonNames(left, right) {
  left = normalizeUsername(left); right = normalizeUsername(right);
  if (usernameErrorKey(left) || usernameErrorKey(right) || left === right) return null;
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
  return `${siteUrl}/.netlify/functions/library-card?username=${encodeURIComponent(left)}&compare=${encodeURIComponent(right)}`;
}

export function comparisonMetadata({ left, right }, description) {
  return {
    title: `Gamenote: ${left} vs ${right}`,
    description,
    canonical: siteUrl + comparisonPath(left, right),
    robots: 'noindex, follow',
    image: comparisonPreviewImage(left, right),
  };
}
