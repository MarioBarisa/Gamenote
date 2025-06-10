import { ref, computed } from 'vue';

// API ključ za RAWG Games Database
// POSTAVITI -> VITE_RAWG_API_KEY u .env datoteci
const API_KEY = import.meta.env.VITE_RAWG_API_KEY;
const BASE_URL = 'https://api.rawg.io/api';

// RSS FEED LISTA IZVORA -> DODAJ ILI MAKNI PO POTREBI
const RSS_FEEDS = [
  { name: 'GameSpot', url: 'https://www.gamespot.com/feeds/mashup/', domain: 'gamespot.com' },
  { name: 'IGN', url: 'https://www.ign.com/rss/articles/feed?format=xml', domain: 'ign.com' },
  { name: 'Polygon', url: 'https://www.polygon.com/rss/index.xml', domain: 'polygon.com' },
  { name: 'PC Gamer', url: 'https://www.pcgamer.com/rss/', domain: 'pcgamer.com' },
  { name: 'Kotaku', url: 'https://kotaku.com/rss', domain: 'kotaku.com' },
  { name: 'VG247', url: 'https://www.vg247.com/feed', domain: 'vg247.com' },
  { name: 'Rock Paper Shotgun', url: 'https://www.rockpapershotgun.com/feed', domain: 'rockpapershotgun.com' },
  { name: 'DualShockers', url: 'https://www.dualshockers.com/feed', domain: 'dualshockers.com' },
  { name: 'TouchArcade', url: 'https://toucharcade.com/feed', domain: 'toucharcade.com' },
  { name: 'GamingOnLinux', url: 'https://www.gamingonlinux.com/article_rss.php', domain: 'gamingonlinux.com' }
];

// API ZA RSS FEEDOVE
// POSTAVITI -> VITE_RSS_API_KEY u .env datoteci
const NEWS_API_KEY = import.meta.env.VITE_RSS_API_KEY;

export const useGamesApi = () => {
  const isLoading = ref(false);
  const error = ref(null);

  const searchGames = async (query, page = 1) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await fetch(
        `${BASE_URL}/games?key=${API_KEY}&search=${query}&page=${page}&page_size=20`
      );
      
      if (!response.ok) {
        throw new Error('Greška pri dohvaćanju igara');
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      error.value = err.message;
      return { results: [] };
    } finally {
      isLoading.value = false;
    }
  };

  const getGameDetails = async (id) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await fetch(
        `${BASE_URL}/games/${id}?key=${API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error('Greška pri dohvaćanju detalja igre');
      }
      
      return await response.json();
    } catch (err) {
      error.value = err.message;
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  const getGameScreenshots = async (id) => {
    try {
      const response = await fetch(
        `${BASE_URL}/games/${id}/screenshots?key=${API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error('Greška pri dohvaćanju slika igre');
      }
      
      const data = await response.json();
      return data.results;
    } catch (err) {
      console.error(err);
      return [];
    }
  };
  
  const getPopularGames = async () => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const today = new Date();
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(today.getFullYear() - 1);
      
      const startDate = oneYearAgo.toISOString().split('T')[0]; // YYYY-MM-DD format
      const endDate = today.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      const response = await fetch(
        `${BASE_URL}/games?key=${API_KEY}&dates=${startDate},${endDate}&metacritic=75,100&ordering=-metacritic&page_size=10`
      );
      
      if (!response.ok) {
        throw new Error('Greška pri dohvaćanju popularnih igara');
      }
      
      const data = await response.json();
      return data.results;
    } catch (err) {
      error.value = err.message;
      return [];
    } finally {
      isLoading.value = false;
    }
  };
  
  const getRecentGames = async () => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await fetch(
        `${BASE_URL}/games?key=${API_KEY}&ordering=-released&page_size=10`
      );
      
      if (!response.ok) {
        throw new Error('Greška pri dohvaćanju nedavnih igara');
      }
      
      const data = await response.json();
      return data.results;
    } catch (err) {
      error.value = err.message;
      return [];
    } finally {
      isLoading.value = false;
    }
  };

  const getThisYearGames = async () => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const today = new Date();
      const currentYear = today.getFullYear();
      const startOfYear = `${currentYear}-01-01`;
      const todayFormatted = today.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      const response = await fetch(
        `${BASE_URL}/games?key=${API_KEY}&dates=${startOfYear},${todayFormatted}&ordering=-added&page_size=10`
      );
      
      if (!response.ok) {
        throw new Error('Greška pri dohvaćanju igara ove godine');
      }
      
      const data = await response.json();
      return data.results;
    } catch (err) {
      error.value = err.message;
      return [];
    } finally {
      isLoading.value = false;
    }
  };

  const getGameNews = async () => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const allNews = [];
      
      // treba koristi samo najbolje RRS-ove kako NEBI rate limit dosegnuo zbog free 10 000 API poziva ( nakon 10 000 radi ali sporo)
      for (const feed of RSS_FEEDS.slice(0, 6)) {
        try {
          const apiUrl = NEWS_API_KEY 
            ? `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}&api_key=${NEWS_API_KEY}&count=4`
            : `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}&count=4`;
          
          const response = await fetch(apiUrl);
          
          if (response.ok) {
            const data = await response.json();
            if (data.status === 'ok' && data.items) {
              data.items.forEach(item => {
                allNews.push({
                  ...item,
                  source: feed.name,
                  domain: feed.domain,
                  sourceUrl: data.feed?.link || '#'
                });
              });
            }
          }
        } catch (feedError) {
          console.warn(`Greška s feedom ${feed.name}:`, feedError);
        }
      }

      // DAJ NAJNOVIJE VIJESTI
      allNews.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
      
      return allNews.slice(0, 20); // max 20 shuffle
    } catch (err) {
      error.value = err.message || 'Greška pri dohvaćanju vijesti';
      console.error('News API error:', err);
      return [];
    } finally {
      isLoading.value = false;
    }
  };

  const getMockGameNews = () => {
    // Ako dosegnem rate limit korisniku reci da je ce vijesti uskoro bit dostupne
    return [
      {
        title: "Najnovije gaming vijesti dolaze uskoro!",
        description: "Trenutno radimo na tome da vam donesemo najnovije vijesti iz gaming svijeta.",
        link: "#",
        pubDate: new Date().toISOString(),
        source: "GameNote",
        domain: "gamenote.com"
      }
    ];
  };

  return {
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    searchGames,
    getGameDetails,
    getGameScreenshots,
    getPopularGames,
    getRecentGames,
    getThisYearGames,
    getGameNews,
    getMockGameNews
  };
};
