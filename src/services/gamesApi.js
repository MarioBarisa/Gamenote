import { ref, computed } from 'vue';

const API_KEY = 'API';
const BASE_URL = 'https://api.rawg.io/api';

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

  return {
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    searchGames,
    getGameDetails,
    getGameScreenshots
  };
};
