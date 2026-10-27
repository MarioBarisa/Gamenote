import { normalizeTitle, baseGameTitle, relatedGameTitles } from './importerMatching.js';

export async function findImporterCatalogGame(api, title) {
  const normalized = normalizeTitle(title);
  let match = await api.matchGame(title);
  if (!match?.id || !relatedGameTitles(match.name, title)) {
    const search = await api.searchGames(title);
    let matches = (search.results || []).filter(game => normalizeTitle(game.name) === normalized);
    if (!matches.length) matches = (search.results || []).filter(game => relatedGameTitles(game.name, title));
    if (!matches.length && baseGameTitle(title) !== normalized) {
      const baseSearch = await api.searchGames(baseGameTitle(title));
      matches = (baseSearch.results || []).filter(game => relatedGameTitles(game.name, title));
    }
    if (matches.length !== 1) return null;
    match = matches[0];
  }
  const details = await api.getGameDetails(match.id);
  if (!details?.id || !relatedGameTitles(details.name, title)) return null;
  return details;
}

export async function loadImporterMetadata(api, title) {
  const details = await findImporterCatalogGame(api, title);
  if (!details) return null;
  const [screenshots, series] = await Promise.all([
    api.getGameScreenshots(details.id).catch(() => []),
    api.getGameSeries(details.id).catch(() => ({ results: [] })),
  ]);
  return {
    title: details.name,
    game_api_id: String(details.id),
    image_url: details.background_image || null,
    background_image: details.background_image || null,
    description: details.description_raw || null,
    genre: details.genres?.map(item => item.name).join(', ') || null,
    publisher: details.publishers?.map(item => item.name).join(', ') || null,
    release_date: details.released || null,
    metacritic_score: details.metacritic ?? null,
    esrb_rating: details.esrb_rating?.name || null,
    website_url: details.website || null,
    developers: JSON.stringify(details.developers?.map(item => item.name) || []),
    genres_list: JSON.stringify(details.genres?.map(item => item.name) || []),
    platforms_list: JSON.stringify(details.platforms?.map(item => item.platform.name) || []),
    publishers_list: JSON.stringify(details.publishers?.map(item => item.name) || []),
    screenshot_urls: JSON.stringify((screenshots || []).map(item => item.image)),
    series_games: JSON.stringify((series?.results || []).map(game => ({
      id: game.id, name: game.name, released: game.released, background_image: game.background_image,
    }))),
  };
}
