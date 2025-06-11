<!-- src/views/AddGame.vue -->
<template>
  <div class="add-game">
    <h1 class="text-4xl font-bold mb-8 text-center">Pretraži igre</h1>
    
    <div class="card bg-base-200 shadow-xl">
      <div class="card-body">
        <div class="mb-6">
          <h2 class="text-2xl font-bold mb-4"></h2>
          <div class="flex gap-3">
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="Unesite naziv igre..." 
              class="input input-bordered input-lg flex-grow"
              @keyup.enter="searchGames" 
            />
            <button @click="searchGames" class="btn btn-primary btn-lg" :disabled="searchLoading">
              <span v-if="searchLoading" class="loading loading-spinner"></span>
              <span v-else>Pretraži</span>
            </button>
          </div>
        </div>
        
        <div v-if="searchResults.length > 0" class="search-results mb-8">
          <h3 class="text-xl font-bold mb-4">Rezultati pretrage</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div 
              v-for="game in searchResults" 
              :key="game.id" 
              class="card bg-base-100 cursor-pointer transition-all duration-300 hover:bg-base-300 hover:shadow-lg"
              @click="navigateToGameDetails(game)"
            >
              <figure v-if="game.background_image" class="h-40">
                <img :src="game.background_image" :alt="game.name" class="w-full h-full object-cover" />
              </figure>
              <div class="card-body p-4">
                <h4 class="card-title text-lg">{{ game.name }}</h4>
                <p class="text-sm opacity-70">{{ formatReleaseDate(game.released) }}</p>
                <div class="card-actions justify-end mt-2">
                  <button 
                    @click.stop="selectGameForCollection(game)" 
                    class="btn btn-sm btn-primary"
                  >
                    Dodaj u kolekciju
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <form v-if="selectedGame" @submit.prevent="saveGame" class="game-form">
          <h3 class="text-2xl font-bold mb-6 text-center">Informacije o igri</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="form-control">
              <label class="label font-medium">Naziv</label>
              <input type="text" v-model="gameForm.title" class="input input-bordered" required />
            </div>
            
            <div class="form-control">
              <label class="label font-medium">Platforma</label>
              <select v-model="gameForm.platform" class="select select-bordered" required>
                <option value="" disabled selected>Odaberi platformu</option>
                <option v-for="platform in platforms" :key="platform" :value="platform">
                  {{ platform }}
                </option>
              </select>
            </div>
            
            <div class="form-control">
              <label class="label font-medium">Žanr</label>
              <input type="text" v-model="gameForm.genre" class="input input-bordered" />
            </div>
            
            <div class="form-control">
              <label class="label font-medium">Izdavač</label>
              <input type="text" v-model="gameForm.publisher" class="input input-bordered" />
            </div>
            
            <div class="form-control">
              <label class="label font-medium">Vrijeme igranja (sati)</label>
              <input type="number" v-model="gameForm.play_time" class="input input-bordered" min="0" />
            </div>
            
            <div class="form-control">
              <label class="label font-medium">Ocjena</label>
              <div class="rating rating-lg">
                <input type="radio" name="rating" class="mask mask-star-2 bg-orange-400" value="1" v-model="gameForm.rating" />
                <input type="radio" name="rating" class="mask mask-star-2 bg-orange-400" value="2" v-model="gameForm.rating" />
                <input type="radio" name="rating" class="mask mask-star-2 bg-orange-400" value="3" v-model="gameForm.rating" />
                <input type="radio" name="rating" class="mask mask-star-2 bg-orange-400" value="4" v-model="gameForm.rating" />
                <input type="radio" name="rating" class="mask mask-star-2 bg-orange-400" value="5" v-model="gameForm.rating" />
              </div>
            </div>
            
            <div class="form-control">
              <label class="label font-medium">Postotak ostvarenih achievementa (%)</label>
              <input type="number" v-model="gameForm.achievement_percent" class="input input-bordered" min="0" max="100" />
            </div>
            
            <div class="form-control">
              <label class="label font-medium">Datum početka igranja</label>
              <input type="date" v-model="gameForm.start_date" class="input input-bordered" />
            </div>
            
            <div class="form-control">
              <label class="label font-medium">Datum završetka igranja</label>
              <input type="date" v-model="gameForm.end_date" class="input input-bordered" />
            </div>
            
            <div class="form-control">
              <label class="flex items-center cursor-pointer mt-8">
                <input type="checkbox" v-model="gameForm.currently_playing" class="checkbox checkbox-primary" />
                <span class="label-text ml-2 text-lg">Trenutno igram</span>
              </label>
            </div>
          </div>
          
          <div class="form-control mt-6">
            <label class="label font-medium">Bilješke</label>
            <textarea v-model="gameForm.notes" class="textarea textarea-bordered h-32"></textarea>
          </div>
          
          <div class="form-control mt-8">
            <button type="submit" class="btn btn-primary btn-lg mx-auto w-full md:w-1/2" :disabled="saveLoading">
              <span v-if="saveLoading" class="loading loading-spinner"></span>
              <span v-else>Spremi igru</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- API dodaj igru -->
    <div v-if="showApiGameModal" class="modal modal-open">
      <div class="modal-box max-w-2xl">
        <h3 class="font-bold text-2xl mb-4">Dodaj igru u kolekciju</h3>
        
        <div v-if="apiGameDetails" class="mb-6">
          <div class="flex gap-4 mb-4">
            <img 
              :src="apiGameDetails.background_image || 'https://placehold.co/150x200?text=No+Image'" 
              :alt="apiGameDetails.name" 
              class="w-24 h-32 object-cover rounded"
            />
            <div>
              <h4 class="text-xl font-bold">{{ apiGameDetails.name }}</h4>
              <p class="text-sm opacity-70">{{ formatReleaseDate(apiGameDetails.released) }}</p>
              <p class="text-sm"><strong>Žanr:</strong> {{ apiGameDetails.genres?.map(g => g.name).join(', ') || 'N/A' }}</p>
              <p class="text-sm"><strong>Izdavač:</strong> {{ apiGameDetails.publishers?.map(p => p.name).join(', ') || 'N/A' }}</p>
            </div>
          </div>
        </div>

        <form @submit.prevent="saveApiGame" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-control">
              <label class="label font-medium">Naziv</label>
              <input type="text" v-model="apiGameForm.title" class="input input-bordered" required />
            </div>
            
            <div class="form-control">
              <label class="label font-medium">Platforma</label>
              <select v-model="apiGameForm.platform" class="select select-bordered" required>
                <option value="" disabled>Odaberi platformu</option>
                <option v-for="platform in platforms" :key="platform" :value="platform">
                  {{ platform }}
                </option>
              </select>
            </div>
            
            <div class="form-control">
              <label class="label font-medium">Vrijeme igranja (sati)</label>
              <input type="number" v-model="apiGameForm.play_time" class="input input-bordered" min="0" />
            </div>
            
            <div class="form-control">
              <label class="label font-medium">Ocjena (1-5)</label>
              <div class="rating rating-lg">
                <input type="radio" name="api-rating" class="mask mask-star-2 bg-orange-400" value="1" v-model="apiGameForm.rating" />
                <input type="radio" name="api-rating" class="mask mask-star-2 bg-orange-400" value="2" v-model="apiGameForm.rating" />
                <input type="radio" name="api-rating" class="mask mask-star-2 bg-orange-400" value="3" v-model="apiGameForm.rating" />
                <input type="radio" name="api-rating" class="mask mask-star-2 bg-orange-400" value="4" v-model="apiGameForm.rating" />
                <input type="radio" name="api-rating" class="mask mask-star-2 bg-orange-400" value="5" v-model="apiGameForm.rating" />
              </div>
            </div>
            
            <div class="form-control">
              <label class="label font-medium">Postotak achievementa (%)</label>
              <input type="number" v-model="apiGameForm.achievement_percent" class="input input-bordered" min="0" max="100" />
            </div>
            
            <div class="form-control">
              <label class="label font-medium">Datum početka</label>
              <input type="date" v-model="apiGameForm.start_date" class="input input-bordered" />
            </div>
            
            <div class="form-control">
              <label class="label font-medium">Datum završetka</label>
              <input type="date" v-model="apiGameForm.end_date" class="input input-bordered" />
            </div>
            
            <div class="form-control">
              <label class="flex items-center cursor-pointer">
                <input type="checkbox" v-model="apiGameForm.currently_playing" class="checkbox checkbox-primary" />
                <span class="label-text ml-2">Trenutno igram</span>
              </label>
            </div>
          </div>
          
          <div class="form-control">
            <label class="label font-medium">Bilješke</label>
            <textarea v-model="apiGameForm.notes" class="textarea textarea-bordered h-24"></textarea>
          </div>
          
          <div class="modal-action">
            <button type="submit" class="btn btn-primary" :disabled="saveLoading">
              <span v-if="saveLoading" class="loading loading-spinner"></span>
              <span v-else>Dodaj igru</span>
            </button>
            <button type="button" @click="closeApiGameModal" class="btn btn-secondary">
              Odustani
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '../stores/user';
import { useGamesApi } from '../services/gamesApi';
import { supabase } from '../supabase';

export default {
  setup() {
    const userStore = useUserStore();
    const router = useRouter();
    const route = useRoute();
    const gamesApi = useGamesApi();
    
    const searchQuery = ref('');
    const searchResults = ref([]);
    const searchLoading = ref(false);
    const selectedGame = ref(null);
    const saveLoading = ref(false);
    const showApiGameModal = ref(false);
    const apiGameDetails = ref(null);
    
    const platforms = [
      'PC', 'PlayStation 5', 'PlayStation 4', 'Xbox Series X/S', 'Xbox One', 
      'Nintendo Switch', 'iOS', 'Android', 'Other'
    ];
    
    const gameForm = reactive({
      title: '',
      platform: '',
      play_time: 0,
      genre: '',
      publisher: '',
      rating: 0,
      achievement_percent: 0,
      notes: '',
      start_date: '',
      end_date: '',
      currently_playing: false,
      game_api_id: '',
      image: ''
    });
    
    const apiGameForm = reactive({
      title: '',
      platform: '',
      play_time: 0,
      genre: '',
      publisher: '',
      rating: 0,
      achievement_percent: 0,
      notes: '',
      start_date: '',
      end_date: '',
      currently_playing: false
    });

    const searchGames = async () => {
      if (!searchQuery.value.trim()) return;
      
      searchLoading.value = true;
      
      try {
        const data = await gamesApi.searchGames(searchQuery.value);
        searchResults.value = data.results || [];
      } catch (error) {
        console.error('Greška pri pretraživanju igara:', error);
      } finally {
        searchLoading.value = false;
      }
    };
    
    const navigateToGameDetails = (game) => {
      // idi na API game details 
      router.push(`/api-games/${game.id}`);
    };
    
    const selectGameForCollection = async (game) => {
      selectedGame.value = game;
      
      // Dohvati više detalja o igri
      const gameDetails = await gamesApi.getGameDetails(game.id);
      
      // Popuni formu s detaljima
      gameForm.title = game.name;
      gameForm.genre = gameDetails?.genres?.map(g => g.name).join(', ') || '';
      gameForm.publisher = gameDetails?.publishers?.map(p => p.name).join(', ') || '';
      gameForm.game_api_id = game.id.toString();
      
      // Sačuvaj URL slike - potreban za prikaz u GameCard i GameDetails
      gameForm.image = game.background_image;
      
      // treba maknuti jer se ne korsiti treuto
      setTimeout(() => {
        const formElement = document.querySelector('.game-form');
        if (formElement) {
          formElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    };
    
    const formatReleaseDate = (date) => {
      if (!date) return 'Nepoznat datum';
      return new Date(date).toLocaleDateString('hr-HR');
    };
    
    const saveGame = async () => {
      if (!gameForm.title || !gameForm.platform) {
        return;
      }

      if (!userStore.user) {
        return;
      }

      try {
        saveLoading.value = true;
        
        let gameData = {
          user_id: userStore.user.id,
          title: gameForm.title,
          platform: gameForm.platform,
          play_time: gameForm.play_time || null,
          genre: gameForm.genre,
          publisher: gameForm.publisher,
          rating: gameForm.rating || null,
          achievement_percent: gameForm.achievement_percent || null,
          notes: gameForm.notes,
          start_date: gameForm.start_date || null,
          end_date: gameForm.end_date || null,
          currently_playing: gameForm.currently_playing,
          game_api_id: gameForm.game_api_id || null,
          image_url: gameForm.image
        };
        if (selectedGame.value) {
          try {
            const gameDetails = await gamesApi.getGameDetails(selectedGame.value.id);
            
            gameData = {
              ...gameData,
              description: gameDetails.description_raw,
              metacritic_score: gameDetails.metacritic,
              esrb_rating: gameDetails.esrb_rating?.name,
              release_date: gameDetails.released,
              website_url: gameDetails.website,
              background_image: gameDetails.background_image,
              developers: JSON.stringify(gameDetails.developers?.map(d => d.name) || []),
              genres_list: JSON.stringify(gameDetails.genres?.map(g => g.name) || []),
              platforms_list: JSON.stringify(gameDetails.platforms?.map(p => p.platform.name) || []),
              publishers_list: JSON.stringify(gameDetails.publishers?.map(p => p.name) || [])
            };

            
            try {
              const screenshots = await gamesApi.getGameScreenshots(selectedGame.value.id);
              gameData.screenshot_urls = JSON.stringify(screenshots?.map(s => s.image) || []);
            } catch (error) {
              console.warn('Could not fetch screenshots:', error);
            }

            
            try {
              const seriesData = await gamesApi.getGameSeries(selectedGame.value.id);
              if (seriesData?.results?.length > 0) {
                const seriesGames = seriesData.results.map(game => ({
                  id: game.id,
                  name: game.name,
                  released: game.released,
                  background_image: game.background_image
                }));
                gameData.series_games = JSON.stringify(seriesGames);
              }
            } catch (error) {
              console.warn('Could not fetch series data:', error);
            }
          } catch (error) {
            console.warn('Could not fetch detailed game data:', error);
          }
        }

        const { data, error } = await supabase
          .from('games')
          .insert([gameData])
          .select();

        if (error) throw error;

        // resetiraj popunjavanje
        selectedGame.value = null;
        Object.keys(gameForm).forEach(key => {
          if (typeof gameForm[key] === 'boolean') {
            gameForm[key] = false;
          } else if (typeof gameForm[key] === 'number') {
            gameForm[key] = 0;
          } else {
            gameForm[key] = '';
          }
        });

        router.push('/library');
      } catch (error) {
        console.error('Error saving game:', error);
      } finally {
        saveLoading.value = false;
      }
    };
    
    const closeApiGameModal = () => {
      showApiGameModal.value = false;
      apiGameDetails.value = null;
    
      Object.keys(apiGameForm).forEach(key => {
        if (typeof apiGameForm[key] === 'boolean') {
          apiGameForm[key] = false;
        } else if (typeof apiGameForm[key] === 'number') {
          apiGameForm[key] = 0;
        } else {
          apiGameForm[key] = '';
        }
      });
      
      router.replace({ path: '/add-game' });
    };

    const saveApiGame = async () => {
      if (!apiGameForm.title || !apiGameForm.platform) {
        return;
      }

      if (!userStore.user) {
        return;
      }

      try {
        saveLoading.value = true;
        
        let gameData = {
          user_id: userStore.user.id,
          title: apiGameForm.title,
          platform: apiGameForm.platform,
          play_time: apiGameForm.play_time || null,
          genre: apiGameDetails.value?.genres?.map(g => g.name).join(', ') || '',
          publisher: apiGameDetails.value?.publishers?.map(p => p.name).join(', ') || '',
          rating: apiGameForm.rating || null,
          achievement_percent: apiGameForm.achievement_percent || null,
          notes: apiGameForm.notes,
          start_date: apiGameForm.start_date || null,
          end_date: apiGameForm.end_date || null,
          currently_playing: apiGameForm.currently_playing,
          game_api_id: apiGameDetails.value?.id?.toString() || null,
          image_url: apiGameDetails.value?.background_image,
          description: apiGameDetails.value?.description_raw,
          metacritic_score: apiGameDetails.value?.metacritic,
          esrb_rating: apiGameDetails.value?.esrb_rating?.name,
          release_date: apiGameDetails.value?.released,
          website_url: apiGameDetails.value?.website,
          background_image: apiGameDetails.value?.background_image,
          developers: JSON.stringify(apiGameDetails.value?.developers?.map(d => d.name) || []),
          genres_list: JSON.stringify(apiGameDetails.value?.genres?.map(g => g.name) || []),
          platforms_list: JSON.stringify(apiGameDetails.value?.platforms?.map(p => p.platform.name) || []),
          publishers_list: JSON.stringify(apiGameDetails.value?.publishers?.map(p => p.name) || [])
        };

        try {
          const screenshots = await gamesApi.getGameScreenshots(apiGameDetails.value.id);
          gameData.screenshot_urls = JSON.stringify(screenshots?.map(s => s.image) || []);
        } catch (error) {
          console.warn('Could not fetch screenshots:', error);
        }

        try {
          const seriesData = await gamesApi.getGameSeries(apiGameDetails.value.id);
          if (seriesData?.results?.length > 0) {
            const seriesGames = seriesData.results.map(game => ({
              id: game.id,
              name: game.name,
              released: game.released,
              background_image: game.background_image
            }));
            gameData.series_games = JSON.stringify(seriesGames);
          }
        } catch (error) {
          console.warn('Could not fetch series data:', error);
        }

        const { error } = await supabase
          .from('games')
          .insert([gameData]);

        if (error) throw error;

        closeApiGameModal();
        router.push('/library');
      } catch (error) {
        console.error('Error saving game:', error);
      } finally {
        saveLoading.value = false;
      }
    };
    
    const loadGameFromApiId = async () => {
      const apiId = route.query.api_id;
      if (apiId) {
        try {
          saveLoading.value = true;
          const gameDetails = await gamesApi.getGameDetails(apiId);
          
          apiGameDetails.value = gameDetails;
          apiGameForm.title = gameDetails.name;
          showApiGameModal.value = true;
        } catch (error) {
          console.error('Error loading game from API ID:', error);
          alert('Greška pri učitavanju igre. Pokušajte ponovo.');
        } finally {
          saveLoading.value = false;
        }
      }
    };
    
    onMounted(() => {
      loadGameFromApiId();
    });
    
    return {
      searchQuery,
      searchResults,
      searchLoading,
      selectedGame,
      saveLoading,
      showApiGameModal,
      apiGameDetails,
      platforms,
      gameForm,
      apiGameForm,
      searchGames,
      navigateToGameDetails,
      selectGameForCollection,
      formatReleaseDate,
      saveGame,
      closeApiGameModal,
      saveApiGame
    };
  }
};
</script>
