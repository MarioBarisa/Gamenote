<template>
  <div class="shared-game-view min-h-screen bg-base-100 pb-12">
    <!-- Kompaktni banner bez gradijenta s logom -->
    <div class="bg-base-100 text-base-content border-b border-base-300 shadow-sm sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div class="flex items-center justify-between w-full sm:w-auto">
          <div class="flex items-center gap-2">
            <img src="/apple-touch-icon.png" alt="Gamenote Logo" class="w-6 h-6 rounded" />
            <span class="font-bold text-sm sm:text-base">Gamenote</span>
          </div>
          <div class="flex gap-2 sm:hidden">
            <router-link to="/register" class="btn btn-xs btn-primary">Registracija</router-link>
            <router-link to="/login" class="btn btn-xs btn-outline">Prijava</router-link>
          </div>
        </div>
        <p class="text-sm sm:text-base font-medium opacity-90 text-center sm:text-left w-full sm:w-auto mt-1 sm:mt-0">
          Napravi profil ili se prijavi kako bi dobio puno iskustvo!
        </p>
        <div class="hidden sm:flex gap-2">
          <router-link to="/register" class="btn btn-sm btn-primary">Napravi profil</router-link>
          <router-link to="/login" class="btn btn-sm btn-outline">Prijavi se</router-link>
        </div>
      </div>
    </div>

    <div v-if="error" class="text-center my-12">
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

    <div v-else-if="isLoadingApi" class="flex justify-center my-12">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <div v-else-if="apiGame" class="max-w-7xl mx-auto px-4 mt-6">
      <div class="flex flex-col md:flex-row gap-4 mb-6">
        <div class="flex-none">
          <div class="card bg-base-200 shadow-xl w-full md:w-[300px]">
            <figure>
              <img :src="apiGame.background_image || 'https://placehold.co/600x400?text=No+Image'" :alt="apiGame.name" class="w-full h-auto" />
            </figure>
            <div class="card-body">
              <h2 class="card-title">{{ apiGame.name }}</h2>
              <p><strong>Platforma:</strong> {{ getPlatforms() }}</p>
              <p><strong>Žanr:</strong> {{ getGenres() }}</p>
              <p><strong>Izdavač:</strong> {{ getPublishers() }}</p>

              <div class="mt-2">
                <p><strong>Metacritic ocjena:</strong></p>
                <div class="radial-progress font-bold m-2" 
                  :class="getMetacriticColorClass(apiGame.metacritic)"
                  :style="`--value:${apiGame.metacritic || 0}`" 
                  :aria-valuenow="apiGame.metacritic" 
                  role="progressbar">{{ apiGame.metacritic || 'N/A' }} / 100</div>
              </div>

              <div class="mt-2">
                <p><strong>ESRB ocjena:</strong></p>
                <img v-if="apiGame.esrb_rating?.name == 'Mature'" src="https://www.esrb.org/wp-content/uploads/2019/05/M.svg" alt="Mature 17+" class="inline w-auto h-auto p-4" />
                <img v-else-if="apiGame.esrb_rating?.name == 'Everyone'" src="https://www.esrb.org/wp-content/uploads/2019/05/E.svg" alt="Everyone" class="inline w-auto h-auto p-4" />
                <img v-else-if="apiGame.esrb_rating?.name == 'Teen'" src="https://www.esrb.org/wp-content/uploads/2019/05/T.svg" alt="Teen" class="inline w-auto h-auto p-4" />
                <img v-else-if="apiGame.esrb_rating?.name == 'Everyone 10+'" src="https://www.esrb.org/wp-content/uploads/2019/05/E10plus.svg" alt="Everyone 10+" class="inline w-auto h-auto p-4" />
                <img v-else-if="apiGame.esrb_rating?.name == 'Adults Only'" src="https://www.esrb.org/wp-content/uploads/2019/05/AO.svg" alt="Adults Only 18+" class="inline w-auto h-auto p-4" />
                <span v-else class="text-gray-500">N/A</span>
              </div>

              <div class="mt-2">
                <p><strong>Datum izdavanja:</strong> {{ formatDate(apiGame.released) }}</p>
              </div>

              <div class="mt-2">
                <p><strong>Službena web stranica:</strong>
                  <a v-if="apiGame.website" :href="apiGame.website" target="_blank" class="link link-primary">
                    Otvori
                  </a>
                  <span v-else>N/A</span>
                </p>
              </div>

              <div class="card-actions justify-end mt-4">
                <button @click="goToApp" class="btn btn-primary w-full shadow-md">Dodaj u svoju biblioteku</button>
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
                      <p>{{ apiGame.description_raw || 'Nema opisa.' }}</p>
                    </div>
                  </div>

                  <div class="mt-6" v-if="gameSeries.length > 0">
                    <h3 class="text-lg font-bold mb-2">Serija igara</h3>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
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
                        </div>
                      </div>
                      
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
                        </div>
                      </div>
                      
                      <div v-if="!previousGame" class="card bg-base-100 shadow-sm">
                        <div class="card-body p-4 text-center">
                          <p class="text-sm text-gray-500">Nema prethodne igre u seriji</p>
                        </div>
                      </div>
                      
                      <div v-if="!nextGame" class="card bg-base-100 shadow-sm">
                        <div class="card-body p-4 text-center">
                          <p class="text-sm text-gray-500">Ova igra je najnovija u seriji! 😊</p>
                        </div>
                      </div>
                    </div>
                    
                    <div v-if="!previousGame && !nextGame && gameSeries.length > 1" class="mt-4">
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
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';
import { useGamesApi } from '../services/gamesApi';

export default {
  name: 'SharedGameView',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const userStore = useUserStore();
    const gamesApi = useGamesApi();
    
    const sharedData = ref(null);
    const error = ref(null);
    const apiGame = ref(null);
    const screenshots = ref([]);
    const gameSeries = ref([]);
    const isLoadingApi = ref(false);
    const selectedScreenshotIndex = ref(null);

    onMounted(async () => {
      try {
        const idParam = route.query.id;
        const dataParam = route.query.data;
        
        let apiIdToFetch = null;

        if (idParam) {
          apiIdToFetch = idParam;
          // Set a minimal sharedData object so redirectLoggedUser works properly
          sharedData.value = { apiId: idParam, isLibrary: false };
        } else if (dataParam) {
          // Decode base64
          const decodedString = decodeURIComponent(atob(dataParam));
          sharedData.value = JSON.parse(decodedString);
          apiIdToFetch = sharedData.value.apiId;
        } else {
          error.value = 'Nedostaju podaci u poveznici.';
          return;
        }

        // Fetch extra API info if we have apiId
        if (apiIdToFetch) {
          isLoadingApi.value = true;
          try {
            apiGame.value = await gamesApi.getGameDetails(apiIdToFetch);
            
            try {
              const screenshotsData = await gamesApi.getGameScreenshots(apiIdToFetch);
              screenshots.value = screenshotsData || [];
            } catch (screenshotError) {
              console.warn('Screenshots not available:', screenshotError);
            }

            try {
              const gameSeriesData = await gamesApi.getGameSeries(apiIdToFetch);
              gameSeries.value = gameSeriesData.results || [];
            } catch (seriesError) {
              console.warn('Game series data not available:', seriesError);
            }
            
          } catch(e) {
            console.error('Failed to load API data:', e);
            error.value = 'Greška pri dohvaćanju informacija o igri.';
          } finally {
            isLoadingApi.value = false;
          }
        }

        // Wait for store to be ready
        if (userStore.isLoggedIn) {
            redirectLoggedUser();
        } else {
            // Subscribe to store changes in case they log in
            userStore.fetchUser().then(() => {
                if(userStore.isLoggedIn) {
                    redirectLoggedUser();
                }
            });
        }
      } catch (err) {
        console.error('Error parsing shared data:', err);
        error.value = 'Poveznica je neispravna ili je oštećena.';
      }
    });

    const getPlatforms = () => {
      if (!apiGame.value || !apiGame.value.platforms) return '';
      return apiGame.value.platforms.map(p => p.platform.name).join(', ');
    };
    
    const getGenres = () => {
      if (!apiGame.value || !apiGame.value.genres) return '';
      return apiGame.value.genres.map(g => g.name).join(', ');
    };
    
    const getPublishers = () => {
      if (!apiGame.value || !apiGame.value.publishers || apiGame.value.publishers.length === 0) return '';
      return apiGame.value.publishers.map(p => p.name).join(', ');
    };
    
    const formatDate = (dateString) => {
      if (!dateString) return '';
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('hr-HR', options);
    };

    const getMetacriticColorClass = (score) => {
      if (!score) return 'text-gray-400';
      if (score >= 75) return 'text-success';
      if (score >= 50) return 'text-warning';
      return 'text-error';
    };

    const redirectLoggedUser = () => {
        if (!sharedData.value) return;
        
        if (sharedData.value.isLibrary && sharedData.value.id) {
            if(sharedData.value.apiId) {
                router.replace(`/api-games/${sharedData.value.apiId}`);
            } else {
                router.replace('/library');
            }
        } else if (sharedData.value.apiId) {
            router.replace(`/api-games/${sharedData.value.apiId}`);
        }
    };

    const goToApp = () => {
      if (userStore.isLoggedIn) {
        redirectLoggedUser();
      } else {
        router.push('/register');
      }
    };

    // Series logic copied from ApiGameDetails
    const previousGame = computed(() => {
      if (!apiGame.value || gameSeries.value.length === 0) return null;
      
      const otherGames = gameSeries.value.filter(seriesGame => 
        seriesGame.id !== apiGame.value.id && 
        seriesGame.released && 
        apiGame.value.released
      );
      
      if (otherGames.length === 0) return null;

      const sortedSeries = otherGames.sort((a, b) => new Date(a.released) - new Date(b.released));
      const currentGameDate = new Date(apiGame.value.released);

      let prev = null;
      for (const seriesGame of sortedSeries) {
        const seriesGameDate = new Date(seriesGame.released);
        if (seriesGameDate < currentGameDate) {
          prev = seriesGame;
        } else {
          break;
        }
      }
      return prev;
    });
    
    const nextGame = computed(() => {
      if (!apiGame.value || gameSeries.value.length === 0) return null;

      const otherGames = gameSeries.value.filter(seriesGame => 
        seriesGame.id !== apiGame.value.id && 
        seriesGame.released && 
        apiGame.value.released
      );
      
      if (otherGames.length === 0) return null;

      const sortedSeries = otherGames.sort((a, b) => new Date(a.released) - new Date(b.released));
      const currentGameDate = new Date(apiGame.value.released);

      for (const seriesGame of sortedSeries) {
        const seriesGameDate = new Date(seriesGame.released);
        if (seriesGameDate > currentGameDate) {
          return seriesGame;
        }
      }
      return null;
    });

    const filteredSeriesGames = computed(() => {
      if (!apiGame.value) return [];
      return gameSeries.value.filter(seriesGame => seriesGame.id !== apiGame.value.id);
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

    return {
      sharedData,
      error,
      apiGame,
      screenshots,
      gameSeries,
      isLoadingApi,
      selectedScreenshotIndex,
      goToApp,
      getPlatforms,
      getGenres,
      getPublishers,
      formatDate,
      getMetacriticColorClass,
      previousGame,
      nextGame,
      filteredSeriesGames,
      openScreenshotModal,
      closeScreenshotModal,
      previousScreenshot,
      nextScreenshot
    };
  }
}
</script>
