export function getSeriesNavigation(game) {
  let series = game?.series_games || [];
  if (typeof series === 'string') {
    try { series = JSON.parse(series); } catch { series = []; }
  }
  if (!Array.isArray(series)) series = [];
  const others = [];
  const seen = new Set();
  for (const entry of series) {
    if (!entry || entry.id == null || !entry.name || String(entry.id) === String(game?.game_api_id) || seen.has(String(entry.id))) continue;
    seen.add(String(entry.id));
    others.push(entry);
  }
  const currentDate = new Date(game?.release_date || '').getTime();
  const dated = [];
  for (const entry of others) {
    const timestamp = new Date(entry.released || '').getTime();
    if (Number.isFinite(timestamp)) dated.push({ ...entry, timestamp });
  }
  dated.sort((a, b) => a.timestamp - b.timestamp);
  let previous = null;
  let next = null;
  if (Number.isFinite(currentDate)) {
    for (const entry of dated) {
      if (entry.timestamp < currentDate) previous = entry;
      if (entry.timestamp > currentDate) { next = entry; break; }
    }
  }
  return { previous, next, others, hasData: series.length > 0 };
}

export function catalogGameDetails(data, screenshots = [], series = []) {
  return {
    id: String(data.id), game_api_id: String(data.id), title: data.name,
    platform: data.platforms?.[0]?.platform?.name || '', release_date: data.released,
    description: data.description_raw || data.description || '', image_url: data.background_image,
    background_image: data.background_image, genre: data.genres?.map(item => item.name).join(', ') || '',
    publisher: data.publishers?.map(item => item.name).join(', ') || '', metacritic_score: data.metacritic,
    esrb_rating: data.esrb_rating?.name, website_url: data.website,
    developers: JSON.stringify(data.developers?.map(item => item.name) || []),
    genres_list: JSON.stringify(data.genres?.map(item => item.name) || []),
    publishers_list: JSON.stringify(data.publishers?.map(item => item.name) || []),
    platforms_list: JSON.stringify(data.platforms?.map(item => item.platform.name) || []),
    screenshot_urls: JSON.stringify(screenshots.map(item => item.image)), series_games: JSON.stringify(series),
  };
}
