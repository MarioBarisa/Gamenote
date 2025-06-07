import { ref } from 'vue';

const useNewsApi = () => {
  const loading = ref(false);
  const error = ref(null);

  // RSS feedovi -LISTA DODATI ILI UKLONITI PO POTREBI
const RSS_FEEDS = [
  'https://www.gamespot.com/feeds/mashup/',
  'https://www.ign.com/articles?format=rss',
  'https://www.polygon.com/rss/index.xml',
  'https://www.pcgamer.com/rss/',
  'https://kotaku.com/rss',
  'https://www.vg247.com/feed',
  'https://www.rockpapershotgun.com/feed',
  'https://www.dualshockers.com/feed',
  'https://toucharcade.com/feed',
  'https://www.gamingonlinux.com/article_rss.php'
]

  const API_KEY = ''; // nterba za sad

  const fetchNews = async () => {
    loading.value = true;
    error.value = null;

    try {
      const allNews = [];
      
      for (const feedUrl of RSS_FEEDS) {
        try {
          const apiUrl = API_KEY 
            ? `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}&api_key=${API_KEY}&count=5`
            : `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}&count=5`;
          
          const response = await fetch(apiUrl);
          
          if (response.ok) {
            const data = await response.json();
            if (data.status === 'ok' && data.items) {
              allNews.push(...data.items.map(item => ({
                ...item,
                source: data.feed?.title || 'Gaming News',
                sourceUrl: data.feed?.link || '#'
              })));
            }
          }
        } catch (feedError) {
          console.warn(`Greška s feedom ${feedUrl}:`, feedError);
        }
      }

      // korinsniku daj samo najnovije vjesti 
      allNews.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
      return allNews.slice(0, 20);

    } catch (err) {
      error.value = err.message || 'Greška pri dohvaćanju vijesti';
      console.error('News API error:', err);
      return [];
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    error,
    fetchNews
  };
};

export { useNewsApi };