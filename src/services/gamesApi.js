import { ref, computed } from 'vue';
import { requestAppApi } from './appApi.js';

const NEWS_SOURCES = [
  ['GameSpot', 'gamespot.com'], ['IGN', 'ign.com'], ['Polygon', 'polygon.com'],
  ['PC Gamer', 'pcgamer.com'], ['VG247', 'vg247.com'], ['Rock Paper Shotgun', 'rockpapershotgun.com'],
];

export const useGamesApi = () => {
  const pending = ref(0);
  const error = ref(null);

  async function request(path, params = {}, options = {}) {
    pending.value++;
    error.value = null;
    try {
      const strings = {};
      for (const [key, value] of Object.entries(params)) strings[key] = String(value);
      return await requestAppApi({ action: 'games', path, params: strings }, options);
    } catch (failure) {
      if (failure.name !== 'AbortError') error.value = failure.message;
      throw failure;
    } finally { pending.value--; }
  }

  async function searchGames(query, page = 1, options = {}) {
    return request('/games', { search: query.trim(), page, page_size: 20 }, options);
  }
  async function getGameDetails(id, options = {}) {
    const data = await request(`/games/${encodeURIComponent(id)}`, {}, options);
    if (data && !data.description_raw) data.description_raw = data.description || null;
    return data;
  }
  async function getGameScreenshots(id) {
    return (await request(`/games/${encodeURIComponent(id)}/screenshots`)).results || [];
  }
  async function getGameSeries(id) {
    return request(`/games/${encodeURIComponent(id)}/game-series`);
  }
  async function getGameAchievements(id) {
    const data = await getGameDetails(id);
    return { count: data.achievements_count || data.parent_achievements?.length || 0, results: data.parent_achievements || [] };
  }
  async function getPopularGames() {
    const today = new Date();
    const lastYear = new Date();
    lastYear.setFullYear(today.getFullYear() - 1);
    return (await request('/games', { dates: `${lastYear.toISOString().slice(0,10)},${today.toISOString().slice(0,10)}`, metacritic: '75,100', ordering: '-metacritic', page_size: 10 })).results || [];
  }
  async function getRecentGames() {
    return (await request('/games', { ordering: '-released', page_size: 10 })).results || [];
  }
  async function getThisYearGames() {
    const today = new Date();
    return (await request('/games', { dates: `${today.getFullYear()}-01-01,${today.toISOString().slice(0,10)}`, ordering: '-added', page_size: 10 })).results || [];
  }
  async function getGameNews() {
    const news = [];
    for (let feed = 0; feed < NEWS_SOURCES.length; feed++) {
      try {
        const data = await requestAppApi({ action: 'news', feed });
        if (data.status !== 'ok') continue;
        for (const item of data.items || []) news.push({ ...item, source: NEWS_SOURCES[feed][0], domain: NEWS_SOURCES[feed][1], sourceUrl: data.feed?.link || '#' });
      } catch (failure) { error.value = failure.message; }
    }
    news.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
    return news.slice(0, 20);
  }
  const getMockGameNews = () => [];
  const matchGame = (title, year) => request('/games/match', { title: title || '', ...(year ? { year } : {}) });

  return { isLoading: computed(() => pending.value > 0), error: computed(() => error.value), searchGames,
    getGameDetails, getGameScreenshots, getGameAchievements, getPopularGames, getRecentGames,
    getThisYearGames, getGameNews, getMockGameNews, getGameSeries, matchGame };
};
