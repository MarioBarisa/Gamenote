import { findImporterCatalogGame } from './importerMetadata.js';
import { normalizeTitle } from './importerMatching.js';
import { httpUrl } from './safeContent.js';

const posters = new Map();

export async function loadImporterPoster(api, title) {
  const key = normalizeTitle(title);
  if (!key) return null;
  const cached = posters.get(key);
  if (cached?.expiresAt > Date.now()) return cached.promise;
  if (posters.size >= 300) posters.delete(posters.keys().next().value);
  const promise = findImporterCatalogGame(api, title).then(game => httpUrl(game?.background_image));
  posters.set(key, { promise, expiresAt: Date.now() + 300000 });
  try {
    return await promise;
  } catch (error) {
    if (posters.get(key)?.promise === promise) posters.delete(key);
    throw error;
  }
}
