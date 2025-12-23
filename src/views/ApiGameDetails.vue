<template>
  <div class="api-game-details">
    <div v-if="loading" class="flex justify-center my-8">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <div v-else-if="error" class="text-center my-8">
      <div class="alert alert-error shadow-lg max-w-md mx-auto">
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l-2-2m0 0l-2-2m2 2l2-2m-2 2l-2 2m2-2l2 2" />
        </svg>
        <div>
          <h3 class="font-bold">Greška</h3>
          <div class="text-sm">{{ error }}</div>
        </div>
      </div>
      <router-link to="/" class="btn btn-primary mt-4">Natrag na početnu</router-link>
    </div>

    <div v-else-if="!game" class="text-center my-8">
      <p class="text-xl">Igra nije pronađena</p>
      <router-link to="/" class="btn btn-primary mt-4">Natrag na početnu</router-link>
    </div>

    <div v-else>
      <div class="flex flex-col md:flex-row gap-4 mb-6">
        <div class="flex-none">
          <div class="card bg-base-200 shadow-xl" style="width: 300px;">
            <figure>
              <img :src="game.background_image || 'https://placehold.co/600x400?text=No+Image'" :alt="game.name" class="w-full h-auto" />
            </figure>
            <div class="card-body">
              <h2 class="card-title">{{ game.name }}</h2>
              <p><strong>Platforma:</strong> {{ getPlatforms() }}</p>
              <p><strong>Žanr:</strong> {{ getGenres() }}</p>
              <p><strong>Izdavač:</strong> {{ getPublishers() }}</p>

              <div class="mt-2">
                <p><strong>Metacritic ocjena:</strong></p>
                <div class="radial-progress font-bold m-2" 
                  :class="getMetacriticColorClass(game.metacritic)"
                  :style="`--value:${game.metacritic || 0}`" 
                  :aria-valuenow="game.metacritic" 
                  role="progressbar">{{ game.metacritic || 'N/A' }} / 100</div>
              </div>

              <div class="mt-2">
                <p><strong>ESRB ocjena:</strong></p>
                <img v-if="game.esrb_rating?.name == 'Mature'" src="https://www.esrb.org/wp-content/uploads/2019/05/M.svg" alt="Mature 17+" class="inline w-auto h-auto p-4" />
                <img v-else-if="game.esrb_rating?.name == 'Everyone'" src="https://www.esrb.org/wp-content/uploads/2019/05/E.svg" alt="Everyone" class="inline w-auto h-auto p-4" />
                <img v-else-if="game.esrb_rating?.name == 'Teen'" src="https://www.esrb.org/wp-content/uploads/2019/05/T.svg" alt="Teen" class="inline w-auto h-auto p-4" />
                <img v-else-if="game.esrb_rating?.name == 'Everyone 10+'" src="https://www.esrb.org/wp-content/uploads/2019/05/E10plus.svg" alt="Everyone 10+" class="inline w-auto h-auto p-4" />
                <img v-else-if="game.esrb_rating?.name == 'Adults Only'" src="https://www.esrb.org/wp-content/uploads/2019/05/AO.svg" alt="Adults Only 18+" class="inline w-auto h-auto p-4" />
                <span v-else class="text-gray-500">N/A</span>
              </div>

              <div class="mt-2">
                <p><strong>Datum izdavanja:</strong> {{ formatDate(game.released) }}</p>
              </div>

              <div class="mt-2">
                <p><strong>Službena web stranica:</strong>
                  <a v-if="game.website" :href="game.website" target="_blank" class="link link-primary">
                    Otvori
                  </a>
                  <span v-else>N/A</span>
                </p>
              </div>

              <div class="card-actions justify-end mt-4">
                <button @click="openAddToCollectionModal" class="btn btn-primary">
                  Dodaj u kolekciju
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="flex-1">
          <div class="card bg-base-200 shadow-xl h-full">
            <div class="mt-8">
              <h2 class="text-2xl font-bold mb-4 ml-4">Dodatne informacije</h2>

              <div class="card bg-base-200 shadow-xl">
                <div class="card-body">
                  <div class="grid grid-cols-1 gap-4">
                    <div>
                      <h3 class="text-lg font-bold">Opis</h3>
                      <p>{{ game.description_raw || 'Nema opisa.' }}</p>
                    </div>
                  </div>

                  <div class="mt-6" v-if="gameSeries.length > 0">
                    <h3 class="text-lg font-bold mb-2">Serija igara</h3>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
                      <!-- prijašnja igra -->
                      <div v-if="previousGame" class="card bg-base-100 shadow-sm hover:shadow-md transition-shadow">
                        <figure class="px-4 pt-4">
                          <img 
                            :src="previousGame.background_image || 'https://placehold.co/300x200?text=No+Image'" 
                            :alt="previousGame.name" 
                            class="rounded-lg w-full h-32 object-cover"
                          />
                        </figure>
                        <div class="card-body p-4">
                          <h4 class="card-title text-sm">{{ previousGame.name }}</h4>
                          <p class="text-xs text-gray-500">Prethodna igra • {{ formatDate(previousGame.released) }}</p>
                          <div class="card-actions justify-end mt-2">
                            <router-link 
                              :to="`/api-games/${previousGame.id}`" 
                              class="btn btn-xs btn-primary"
                            >
                              Pogledaj
                            </router-link>
                          </div>
                        </div>
                      </div>
                      
                      <!-- sljedeca igra -->
                      <div v-if="nextGame" class="card bg-base-100 shadow-sm hover:shadow-md transition-shadow">
                        <figure class="px-4 pt-4">
                          <img 
                            :src="nextGame.background_image || 'https://placehold.co/300x200?text=No+Image'" 
                            :alt="nextGame.name" 
                            class="rounded-lg w-full h-32 object-cover"
                          />
                        </figure>
                        <div class="card-body p-4">
                          <h4 class="card-title text-sm">{{ nextGame.name }}</h4>
                          <p class="text-xs text-gray-500">Sljedeća igra • {{ formatDate(nextGame.released) }}</p>
                          <div class="card-actions justify-end mt-2">
                            <router-link 
                              :to="`/api-games/${nextGame.id}`" 
                              class="btn btn-xs btn-primary"
                            >
                              Pogledaj
                            </router-link>
                          </div>
                        </div>
                      </div>
                      
                      <!-- nema igara prije -->
                      <div v-if="!previousGame" class="card bg-base-100 shadow-sm">
                        <div class="card-body p-4 text-center">
                          <p class="text-sm text-gray-500">Nema prethodne igre u seriji</p>
                        </div>
                      </div>
                      
                      <!--nema igara poslje -->
                      <div v-if="!nextGame" class="card bg-base-100 shadow-sm">
                        <div class="card-body p-4 text-center">
                          <p class="text-sm text-gray-500">Ova igra je najnovija u seriji! 😊</p>
                        </div>
                      </div>
                    </div>
                    
                    <!-- ako je nered pokaži bilo šta -->
                    <div v-if="!previousGame && !nextGame && !isLatestGame && gameSeries.length > 1" class="mt-4">
                      <h4 class="text-md font-semibold mb-2">Sve igre u seriji:</h4>
                      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div v-for="seriesGame in filteredSeriesGames" :key="seriesGame.id" class="card bg-base-100 shadow-sm hover:shadow-md transition-shadow">
                          <figure class="px-4 pt-4">
                            <img 
                              :src="seriesGame.background_image || 'https://placehold.co/300x200?text=No+Image'" 
                              :alt="seriesGame.name" 
                              class="rounded-lg w-full h-32 object-cover"
                            />
                          </figure>
                          <div class="card-body p-4">
                            <h4 class="card-title text-sm">{{ seriesGame.name }}</h4>
                            <p class="text-xs text-gray-500">{{ formatDate(seriesGame.released) }}</p>
                            <div class="card-actions justify-end mt-2">
                              <router-link 
                                :to="`/api-games/${seriesGame.id}`" 
                                class="btn btn-xs btn-primary"
                              >
                                Pogledaj
                              </router-link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="mt-6" v-if="screenshots.length > 0">
                    <h3 class="text-lg font-bold mb-2">Slike igre</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div v-for="(screenshot, index) in screenshots" :key="index" class="relative">
                        <img 
                          :src="screenshot.image" 
                          :alt="`Screenshot ${index + 1}`" 
                          class="w-full h-auto rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                          @click="openScreenshotModal(index)"
                        />
                      </div>
                    </div>
                  </div>

                  <div v-if="selectedScreenshotIndex !== null" class="modal modal-open">
                    <div class="modal-box max-w-5xl">
                      <div class="relative">
                        <img :src="screenshots[selectedScreenshotIndex].image" alt="Enlarged Screenshot" class="w-full h-auto rounded-lg" />
                        
                        <button 
                          v-if="screenshots.length > 1"
                          @click="previousScreenshot" 
                          class="absolute left-2 top-1/2 transform -translate-y-1/2 btn btn-circle btn-ghost bg-black bg-opacity-50 text-white hover:bg-opacity-75"
                        >
                          ❮
                        </button>
                        
                        <button 
                          v-if="screenshots.length > 1"
                          @click="nextScreenshot" 
                          class="absolute right-2 top-1/2 transform -translate-y-1/2 btn btn-circle btn-ghost bg-black bg-opacity-50 text-white hover:bg-opacity-75"
                        >
                          ❯
                        </button>
                        
                        <div class="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded">
                          {{ selectedScreenshotIndex + 1 }} / {{ screenshots.length }}
                        </div>
                      </div>
                      
                      <div class="modal-action">
                        <button @click="closeScreenshotModal" class="btn">Zatvori</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- dodaj kolekciju -->
    <div v-if="showAddModal" class="modal modal-open">
      <div class="modal-box max-w-2xl">
        <h3 class="font-bold text-2xl mb-4">Dodaj igru u kolekciju</h3>
        
        <div v-if="game" class="mb-6">
          <div class="flex gap-4 mb-4">
            <img 
              :src="game.background_image || 'https://placehold.co/150x200?text=No+Image'" 
              :alt="game.name" 
              class="w-24 h-32 object-cover rounded"
            />
            <div>
              <h4 class="text-xl font-bold">{{ game.name }}</h4>
              <p class="text-sm opacity-70">{{ formatDate(game.released) }}</p>
              <p class="text-sm"><strong>Žanr:</strong> {{ getGenres() }}</p>
              <p class="text-sm"><strong>Izdavač:</strong> {{ getPublishers() }}</p>
            </div>
          </div>
        </div>

        <form @submit.prevent="saveToCollection" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-control">
              <label class="label font-medium">Naziv</label>
              <input type="text" v-model="collectionForm.title" class="input input-bordered" required />
            </div>
            
            <div class="form-control">
              <label class="label font-medium">Platforma</label>
              <select v-model="collectionForm.platform" class="select select-bordered" required>
                <option value="" disabled>Odaberi platformu</option>
                <option v-for="platform in platforms" :key="platform" :value="platform">
                  {{ platform }}
                </option>
              </select>
            </div>
            
            <div class="form-control">
              <label class="label font-medium">Vrijeme igranja (sati)</label>
              <input type="number" v-model="collectionForm.play_time" class="input input-bordered" min="0" />
            </div>
            
            <div class="form-control">
              <label class="label font-medium">Ocjena (1-5)</label>
              <div class="rating rating-lg">
                <input type="radio" name="collection-rating" class="mask mask-star-2 bg-orange-400" value="1" v-model="collectionForm.rating" />
                <input type="radio" name="collection-rating" class="mask mask-star-2 bg-orange-400" value="2" v-model="collectionForm.rating" />
                <input type="radio" name="collection-rating" class="mask mask-star-2 bg-orange-400" value="3" v-model="collectionForm.rating" />
                <input type="radio" name="collection-rating" class="mask mask-star-2 bg-orange-400" value="4" v-model="collectionForm.rating" />
                <input type="radio" name="collection-rating" class="mask mask-star-2 bg-orange-400" value="5" v-model="collectionForm.rating" />
              </div>
            </div>
            
            <div class="form-control">
              <label class="label font-medium">Postotak achievementa (%)</label>
              <input type="number" v-model="collectionForm.achievement_percent" class="input input-bordered" min="0" max="100" />
            </div>
            
            <div class="form-control">
              <label class="label font-medium">Datum početka</label>
              <input type="date" v-model="collectionForm.start_date" class="input input-bordered" />
            </div>
            
            <div class="form-control">
              <label class="label font-medium">Datum završetka</label>
              <input type="date" v-model="collectionForm.end_date" class="input input-bordered" />
            </div>
            
            <div class="form-control">
              <label class="flex items-center cursor-pointer">
                <input type="checkbox" v-model="collectionForm.currently_playing" class="checkbox checkbox-primary" />
                <span class="label-text ml-2">Trenutno igram</span>
              </label>
            </div>
          </div>
          
          <div class="form-control">
            <label class="label font-medium">Bilješke</label>
            <textarea v-model="collectionForm.notes" class="textarea textarea-bordered h-24"></textarea>
          </div>
          
          <div class="modal-action">
            <button type="submit" class="btn btn-primary" :disabled="saveLoading">
              <span v-if="saveLoading" class="loading loading-spinner"></span>
              <span v-else>Dodaj igru</span>
            </button>
            <button type="button" @click="closeAddModal" class="btn btn-secondary">
              Odustani
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, watch, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useGamesApi } from '../services/gamesApi';
import { useUserStore } from '../stores/user';
import { supabase } from '../supabase';

export default {
  setup() {
    const route = useRoute();
    const router = useRouter();
    const gamesApi = useGamesApi();
    const userStore = useUserStore();
    
    const game = ref(null);
    const loading = ref(true);
    const error = ref(null);
    const screenshots = ref([]);
    const gameSeries = ref([]);
    const selectedScreenshotIndex = ref(null);
    const showAddModal = ref(false);
    const saveLoading = ref(false);

    const platforms = [
      'PC', 'PlayStation 5', 'PlayStation 4', 'Xbox Series X/S', 'Xbox One', 
      'Nintendo Switch', 'iOS', 'Android', 'Other'
    ];

    const collectionForm = reactive({
      title: '',
      platform: '',
      play_time: 0,
      rating: 0,
      achievement_percent: 0,
      notes: '',
      start_date: '',
      end_date: '',
      currently_playing: false
    });

    const fetchGame = async () => {
      const gameId = route.params.id;
      loading.value = true;
      error.value = null;
      
      try {
        const gameDetails = await gamesApi.getGameDetails(gameId);
        
        if (!gameDetails) {
          error.value = 'Igra nije pronađena na serveru';
          game.value = null;
          return;
        }
        
        game.value = gameDetails;
        
        try {
          const screenshotsData = await gamesApi.getGameScreenshots(gameId);
          screenshots.value = screenshotsData || [];
        } catch (screenshotError) {
          console.warn('Screenshots not available:', screenshotError);
          screenshots.value = [];
        }

        try {
          const gameSeriesData = await gamesApi.getGameSeries(gameId);
          gameSeries.value = gameSeriesData.results || [];
        } catch (seriesError) {
          console.warn('Game series data not available:', seriesError);
          gameSeries.value = [];
        }
      } catch (fetchError) {
        console.error('Greška pri dohvaćanju igre:', fetchError);
        error.value = 'Greška pri učitavanju igre. Pokušajte ponovno.';
        game.value = null;
      } finally {
        loading.value = false;
      }
    };
    
    // gledaj za promjene rute kada dodaješ igru
    watch(() => route.params.id, (newId, oldId) => {
      if (newId && newId !== oldId) {
        fetchGame();
      }
    });
    
    const previousGame = computed(() => {
      if (!game.value || gameSeries.value.length === 0) return null;
      
      const otherGames = gameSeries.value.filter(seriesGame => 
        seriesGame.id !== game.value.id && 
        seriesGame.released && 
        game.value.released
      );
      
      if (otherGames.length === 0) return null;

      const sortedSeries = otherGames.sort((a, b) => new Date(a.released) - new Date(b.released));
      
      const currentGameDate = new Date(game.value.released);

      let previousGame = null;
      for (const seriesGame of sortedSeries) {
        const seriesGameDate = new Date(seriesGame.released);
        if (seriesGameDate < currentGameDate) {
          previousGame = seriesGame;
        } else {
          break;
        }
      }
      
      return previousGame;
    });
    
    const nextGame = computed(() => {
      if (!game.value || gameSeries.value.length === 0) return null;

      const otherGames = gameSeries.value.filter(seriesGame => 
        seriesGame.id !== game.value.id && 
        seriesGame.released && 
        game.value.released
      );
      
      if (otherGames.length === 0) return null;

      const sortedSeries = otherGames.sort((a, b) => new Date(a.released) - new Date(b.released));
      
      const currentGameDate = new Date(game.value.released);

      for (const seriesGame of sortedSeries) {
        const seriesGameDate = new Date(seriesGame.released);
        if (seriesGameDate > currentGameDate) {
          return seriesGame;
        }
      }
      
      return null;
    });

    const filteredSeriesGames = computed(() => {
      if (!game.value) return [];
      return gameSeries.value.filter(seriesGame => seriesGame.id !== game.value.id);
    });

    const isLatestGame = computed(() => {
      if (!game.value || gameSeries.value.length === 0) return false;
      
      const gamesWithDates = gameSeries.value.filter(seriesGame => 
        seriesGame.released && game.value.released
      );
      
      if (gamesWithDates.length === 0) return false;
      

      const sortedSeries = gamesWithDates.sort((a, b) => new Date(b.released) - new Date(a.released));

      return sortedSeries[0].id === game.value.id;
    });
    
    const openScreenshotModal = (index) => {
      selectedScreenshotIndex.value = index;
    };
    
    const closeScreenshotModal = () => {
      selectedScreenshotIndex.value = null;
    };
    
    const previousScreenshot = () => {
      if (selectedScreenshotIndex.value > 0) {
        selectedScreenshotIndex.value--;
      } else {
        selectedScreenshotIndex.value = screenshots.value.length - 1;
      }
    };
    
    const nextScreenshot = () => {
      if (selectedScreenshotIndex.value < screenshots.value.length - 1) {
        selectedScreenshotIndex.value++;
      } else {
        selectedScreenshotIndex.value = 0;
      }
    };
    
    const getPlatforms = () => {
      if (!game.value?.platforms) return 'N/A';
      return game.value.platforms.map(p => p.platform.name).join(', ');
    };
    
    const getGenres = () => {
      if (!game.value?.genres) return 'N/A';
      return game.value.genres.map(g => g.name).join(', ');
    };
    
    const getPublishers = () => {
      if (!game.value?.publishers) return 'N/A';
      return game.value.publishers.map(p => p.name).join(', ');
    };
    
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleDateString('hr-HR');
    };
    
    const getMetacriticColorClass = (score) => {
      if (!score) return 'text-gray-400 border-gray-300';
      
      if (score >= 90) return 'text-green-700 [--size:7rem] [--thickness:0.6rem] bg-base-200 border-green-900';
      if (score >= 80) return 'text-green-600 [--size:7rem] [--thickness:0.6rem] bg-base-200 border-green-700';
      if (score >= 70) return 'text-green-500 [--size:7rem] [--thickness:0.6rem] bg-base-200 border-green-500';
      if (score >= 60) return 'text-yellow-500 [--size:7rem] [--thickness:0.6rem] bg-base-200 border-yellow-500';
      if (score >= 50) return 'text-yellow-600 [--size:7rem] [--thickness:0.6rem] bg-base-200 border-yellow-600';
      if (score >= 40) return 'text-orange-500 [--size:7rem] [--thickness:0.6rem] bg-base-200 border-orange-500';
      
      return 'text-red-500 [--size:7rem] [--thickness:0.8rem] bg-base-200 border-red-500';
    };
    
    const openAddToCollectionModal = () => {
      if (!userStore.user) {
        return;
      }
      
      // POPUNI FORMU SA PODACIMA
      collectionForm.title = game.value?.name || '';
      showAddModal.value = true;
    };

    const closeAddModal = () => {
      showAddModal.value = false;
      Object.keys(collectionForm).forEach(key => {
        if (typeof collectionForm[key] === 'boolean') {
          collectionForm[key] = false;
        } else if (typeof collectionForm[key] === 'number') {
          collectionForm[key] = 0;
        } else {
          collectionForm[key] = '';
        }
      });
    };

    const saveToCollection = async () => {
      if (!collectionForm.title || !collectionForm.platform) {
        return;
      }

      if (!userStore.user) {
        return;
      }

      try {
        saveLoading.value = true;
        
        let gameData = {
          user_id: userStore.user.id,
          title: collectionForm.title,
          platform: collectionForm.platform,
          play_time: collectionForm.play_time || null,
          genre: game.value?.genres?.map(g => g.name).join(', ') || '',
          publisher: game.value?.publishers?.map(p => p.name).join(', ') || '',
          rating: collectionForm.rating || null,
          achievement_percent: collectionForm.achievement_percent || null,
          notes: collectionForm.notes,
          start_date: collectionForm.start_date || null,
          end_date: collectionForm.end_date || null,
          currently_playing: collectionForm.currently_playing,
          game_api_id: game.value?.id?.toString() || null,
          image_url: game.value?.background_image,
          description: game.value?.description_raw,
          metacritic_score: game.value?.metacritic,
          esrb_rating: game.value?.esrb_rating?.name,
          release_date: game.value?.released,
          website_url: game.value?.website,
          background_image: game.value?.background_image,
          developers: JSON.stringify(game.value?.developers?.map(d => d.name) || []),
          genres_list: JSON.stringify(game.value?.genres?.map(g => g.name) || []),
          platforms_list: JSON.stringify(game.value?.platforms?.map(p => p.platform.name) || []),
          publishers_list: JSON.stringify(game.value?.publishers?.map(p => p.name) || [])
        };

        
        if (screenshots.value.length > 0) {
          gameData.screenshot_urls = JSON.stringify(screenshots.value?.map(s => s.image) || []);
        }

        if (gameSeries.value.length > 0) {
          const seriesGames = gameSeries.value.map(seriesGame => ({
            id: seriesGame.id,
            name: seriesGame.name,
            released: seriesGame.released,
            background_image: seriesGame.background_image
          }));
          gameData.series_games = JSON.stringify(seriesGames);
        }

        const { error } = await supabase
          .from('games')
          .insert([gameData]);

        if (error) throw error;

        closeAddModal();
        router.push('/library');
      } catch (error) {
        console.error('Error saving game:', error);
      } finally {
        saveLoading.value = false;
      }
    };
    
    onMounted(fetchGame);
    
    return {
      game,
      loading,
      error,
      screenshots,
      gameSeries,
      selectedScreenshotIndex,
      previousGame,
      nextGame,
      isLatestGame,
      filteredSeriesGames,
      openScreenshotModal,
      closeScreenshotModal,
      previousScreenshot,
      nextScreenshot,
      getPlatforms,
      getGenres,
      getPublishers,
      formatDate,
      getMetacriticColorClass,
      showAddModal,
      saveLoading,
      platforms,
      collectionForm,
      openAddToCollectionModal,
      closeAddModal,
      saveToCollection
    };
  }
};
</script>
