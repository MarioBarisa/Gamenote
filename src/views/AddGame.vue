<!-- src/views/AddGame.vue -->
<template>
  <div class="add-game">
    <h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-8 text-center">Pretraži igre</h1>
    
    <div class="card bg-base-200 shadow-xl">
      <div class="card-body p-4 sm:p-6">
        <div class="mb-4 sm:mb-6">
          <h2 class="text-xl sm:text-2xl font-bold mb-2 sm:mb-4"></h2>
          <div class="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="Unesite naziv igre..." 
              class="input input-bordered input-md sm:input-lg flex-grow"
              @keyup.enter="searchGames" 
            />
            <button @click="searchGames" class="btn btn-primary btn-md sm:btn-lg whitespace-nowrap" :disabled="searchLoading">
              <span v-if="searchLoading" class="loading loading-spinner"></span>
              <span v-else>Pretraži</span>
            </button>
          </div>
        </div>
        
        <div v-if="searchResults.length > 0" class="search-results mb-6 sm:mb-8">
          <h3 class="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Rezultati pretrage</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div 
              v-for="game in searchResults" 
              :key="game.id" 
              class="card bg-base-100 cursor-pointer transition-all duration-300 hover:bg-base-300 hover:shadow-lg"
              @click="navigateToGameDetails(game)"
            >
              <figure v-if="game.background_image" class="h-32 sm:h-40">
                <img :src="game.background_image" :alt="game.name" class="w-full h-full object-cover" />
              </figure>
              <div class="card-body p-3 sm:p-4">
                <h4 class="card-title text-md sm:text-lg">{{ game.name }}</h4>
                <p class="text-sm opacity-70">{{ formatReleaseDate(game.released) }}</p>
                <div class="card-actions justify-end mt-2">
                  <button 
                    @click.stop="selectGameForCollection(game)" 
                    class="btn btn-xs sm:btn-sm btn-primary"
                  >
                    Dodaj u kolekciju
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
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
          <div class="grid grid-cols-1 gap-4">
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
              <div class="rating rating-sm sm:rating-md lg:rating-lg">
                <input type="radio" name="api-rating" class="mask mask-star-2 bg-orange-400" value="1" v-model="apiGameForm.rating" />
                <input type="radio" name="api-rating" class="mask mask-star-2 bg-orange-400" value="2" v-model="apiGameForm.rating" />
                <input type="radio" name="api-rating" class="mask mask-star-2 bg-orange-400" value="3" v-model="apiGameForm.rating" />
                <input type="radio" name="api-rating" class="mask mask-star-2 bg-orange-400" value="4" v-model="apiGameForm.rating" />
                <input type="radio" name="api-rating" class="mask mask-star-2 bg-orange-400" value="5" v-model="apiGameForm.rating" />
              </div>
            </div>
            
            <div class="form-control">
              <label class="label font-medium">Status</label>
              <select v-model="apiGameForm.status" class="select select-bordered">
                <option value="" disabled>Odaberi status</option>
                <option v-for="s in GAME_STATUS" :key="s.key" :value="s.key">{{ s.label }}</option>
              </select>
            </div>

            <div class="form-control">
              <label class="label font-medium">Game Progression</label>
              <select v-model="apiGameForm.progress_mode" class="select select-bordered">
                <option value="" disabled>Odaberi način praćenja</option>
                <option v-for="mode in PROGRESS_MODES" :key="mode.key" :value="mode.key">{{ mode.label }}</option>
              </select>
              <p v-if="selectedApiProgressMode" class="text-xs opacity-70 mt-1">
                {{ selectedApiProgressMode.key.includes('achievements') || selectedApiProgressMode.key.includes('trophies') 
                  ? '✨ Ukupan broj achievement/trofeja automatski dohvaćen iz RAWG API baze.' 
                  : 'Popuni vrijednost za odabrani način (npr. 0-100 za postotak, vrijednost/ukupno za omjer, #rang za leaderboard).' }}
              </p>
            </div>
            <template v-if="selectedApiProgressMode">
              <div class="form-control" v-if="selectedApiProgressMode.kind === 'count' || selectedApiProgressMode.kind === 'rank'">
                <label class="label font-medium">Vrijednost</label>
                <input type="number" v-model.number="apiGameForm.progress_value" class="input input-bordered" min="0" />
              </div>
              <div class="form-control" v-if="selectedApiProgressMode.requiresTotal">
                <label class="label font-medium">Ukupno</label>
                <input type="number" v-model.number="apiGameForm.progress_total" class="input input-bordered" min="0" />
              </div>
              <div class="form-control">
                <label class="label font-medium">Jedinica</label>
                <input type="text" v-model="apiGameForm.progress_unit" class="input input-bordered" :placeholder="selectedApiProgressMode.defaultUnit || 'unit'" readonly />
              </div>
            </template>
            
            <div class="form-control">
              <label class="label font-medium">Datum početka</label>
              <input type="date" v-model="apiGameForm.start_date" class="input input-bordered" />
            </div>
            
            <div class="form-control">
              <label class="label font-medium">Datum završetka</label>
              <input type="date" v-model="apiGameForm.end_date" class="input input-bordered" />
            </div>
            
            <!-- Uklonjeno: Trenutno igram (koristi Status) -->
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
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '../stores/user';
import { useGamesApi } from '../services/gamesApi';
import { supabase } from '../supabase';
import { PROGRESS_MODES, PROGRESS_MODE_MAP } from '../constants/progressModes';
import { GAME_STATUS } from '../constants/gameStatus';

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
      notes: '',
      start_date: '',
      end_date: '',
      status: '',
      progress_mode: 'completion_standard',
      progress_value: null,
      progress_total: null,
      progress_unit: '%',
      progress_source: '',
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
      notes: '',
      start_date: '',
      end_date: '',
      status: '',
      progress_mode: 'completion_standard',
      progress_value: null,
      progress_total: null,
      progress_unit: '%',
      progress_source: ''
    });

    const selectedProgressMode = computed(() => PROGRESS_MODE_MAP[gameForm.progress_mode] || null);
    const selectedApiProgressMode = computed(() => PROGRESS_MODE_MAP[apiGameForm.progress_mode] || null);

    // Watch za automatsko postavljanje jedinice iz progress_mode
    watch(() => gameForm.progress_mode, (newMode) => {
      const mode = PROGRESS_MODE_MAP[newMode];
      if (mode && mode.defaultUnit) {
        gameForm.progress_unit = mode.defaultUnit;
        gameForm.progress_source = gameForm.platform || mode.badgeSource || '';
      }
    });

    watch(() => apiGameForm.progress_mode, (newMode) => {
      const mode = PROGRESS_MODE_MAP[newMode];
      if (mode && mode.defaultUnit) {
        apiGameForm.progress_unit = mode.defaultUnit;
        apiGameForm.progress_source = apiGameForm.platform || mode.badgeSource || '';
      }
    });

    // Auto-set progress mode based on selected platform
    watch(() => gameForm.platform, (newPlatform) => {
      if (!newPlatform) return;
      const platformLower = newPlatform.toLowerCase();
      
      if (platformLower.includes('playstation')) {
        gameForm.progress_mode = 'trophies_psn';
      } else if (platformLower.includes('xbox')) {
        gameForm.progress_mode = 'achievements_xbox';
      } else if (platformLower.includes('steam') || platformLower === 'pc') {
        gameForm.progress_mode = 'achievements_steam';
      } else if (platformLower.includes('nintendo')) {
        gameForm.progress_mode = 'completion_nintendo';
      } else if (platformLower.includes('ios')) {
        gameForm.progress_mode = 'achievements_gamecenter';
      } else {
        gameForm.progress_mode = 'completion_standard';
      }
    });

    watch(() => apiGameForm.platform, (newPlatform) => {
      if (!newPlatform) return;
      const platformLower = newPlatform.toLowerCase();
      
      if (platformLower.includes('playstation')) {
        apiGameForm.progress_mode = 'trophies_psn';
      } else if (platformLower.includes('xbox')) {
        apiGameForm.progress_mode = 'achievements_xbox';
      } else if (platformLower.includes('steam') || platformLower === 'pc') {
        apiGameForm.progress_mode = 'achievements_steam';
      } else if (platformLower.includes('nintendo')) {
        apiGameForm.progress_mode = 'completion_nintendo';
      } else if (platformLower.includes('ios')) {
        apiGameForm.progress_mode = 'achievements_gamecenter';
      } else {
        apiGameForm.progress_mode = 'completion_standard';
      }
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
      
      const gameDetails = await gamesApi.getGameDetails(game.id);
      apiGameDetails.value = gameDetails;
      
      // Popuni formu s detaljima
      apiGameForm.title = game.name;
      apiGameForm.genre = gameDetails?.genres?.map(g => g.name).join(', ') || '';
      apiGameForm.publisher = gameDetails?.publishers?.map(p => p.name).join(', ') || '';
      apiGameForm.game_api_id = game.id.toString();
      apiGameForm.image = game.background_image;
      
      // fetchaj achv sa api
      try {
        const achievements = await gamesApi.getGameAchievements(game.id);
        if (achievements && achievements.count > 0) {
          const firstPlatform = gameDetails?.platforms?.[0]?.platform?.name?.toLowerCase() || '';
          if (firstPlatform.includes('playstation') || firstPlatform.includes('ps')) {
            apiGameForm.progress_mode = 'trophies_psn';
          } else if (firstPlatform.includes('xbox')) {
            apiGameForm.progress_mode = 'achievements_xbox';
          } else if (firstPlatform.includes('steam') || firstPlatform.includes('pc')) {
            apiGameForm.progress_mode = 'achievements_steam';
          }
          apiGameForm.progress_total = achievements.count;
          apiGameForm.progress_value = 0; 
        }
      } catch (err) {
        console.warn('Could not fetch achievements:', err);
      }
      showApiGameModal.value = true;
      
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
          notes: gameForm.notes,
          start_date: gameForm.start_date || null,
          end_date: gameForm.end_date || null,
          status: gameForm.status || null,
          progress_mode: gameForm.progress_mode || 'completion_standard',
          progress_value: gameForm.progress_value,
          progress_total: gameForm.progress_total,
          progress_unit: gameForm.progress_unit || null,
          progress_source: gameForm.progress_source || gameForm.platform || null,
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
          notes: apiGameForm.notes,
          start_date: apiGameForm.start_date || null,
          end_date: apiGameForm.end_date || null,
          status: apiGameForm.status || null,
          progress_mode: apiGameForm.progress_mode || 'completion_standard',
          progress_value: apiGameForm.progress_value,
          progress_total: apiGameForm.progress_total,
          progress_unit: apiGameForm.progress_unit || null,
          progress_source: apiGameForm.progress_source || apiGameForm.platform || null,
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
      PROGRESS_MODES,
      GAME_STATUS,
      selectedProgressMode,
      selectedApiProgressMode,
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
