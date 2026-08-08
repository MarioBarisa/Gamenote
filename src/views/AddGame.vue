<!-- src/views/AddGame.vue -->
<template>
  <div class="add-game">
    <h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-8 text-center">Pretraži igre</h1>

    <div class="card bg-base-200 shadow-xl">
      <div class="card-body p-4 sm:p-6">
        <div class="mb-4 sm:mb-6">
          <h2 class="text-xl sm:text-2xl font-bold mb-2 sm:mb-4"></h2>
          <div class="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <div class="relative flex-1 w-full sm:flex-grow">
              <input 
                type="text" 
                v-model="searchQuery" 
                placeholder="Unesite naziv igre..." 
                class="input input-bordered input-md sm:input-lg w-full pr-10"
                @keyup.enter="searchGames" 
              />
              <button 
                v-if="searchQuery"
                @click="clearSearch"
                class="absolute inset-y-0 right-1 sm:right-2 flex items-center justify-center w-8 sm:w-9 text-base-content/60 hover:text-base-content"
                title="Očisti pretragu"
                aria-label="Očisti pretragu"
                type="button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <button @click="searchGames" class="btn btn-primary btn-md sm:btn-lg whitespace-nowrap w-full sm:w-auto" :disabled="searchLoading">
              <span v-if="searchLoading" class="loading loading-spinner"></span>
              <span v-else>Pretraži</span>
            </button>
          </div>
        </div>
        
        <div v-if="searchResults.length > 0" class="search-results mb-6 sm:mb-8">
          <h3 class="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Rezultati pretrage</h3>
          <div :class="`grid ${cardConfig.container} ${cardConfig.gap}`">
            <div 
              v-for="game in searchResults" 
              :key="game.id" 
              class="game-card card bg-base-100 shadow-xl h-full transform transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer"
              @click="navigateToGameDetails(game)"
            >
              <figure :class="`relative ${cardConfig.imageHeight} overflow-hidden`">
                <img :src="game.background_image || 'https://placehold.co/600x400?text=No+Image'" :alt="game.name" class="w-full h-full object-cover" />
                <div v-if="isGameInLibrary(game)" class="absolute top-0 left-0 m-1 sm:m-2">
                  <span
                      class="badge bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-600 text-white font-bold text-xs sm:text-sm p-2 sm:p-3 shadow-lg border-2 border-emerald-300">
                      <svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 20 20">
                        <path d="M0 0h20v20H0z" fill="none" />
                        <path fill="currentColor" fill-rule="evenodd" d="M3.213 5.8c.015.759-.398 1.785-.935 2.321a2.66 2.66 0 0 0 0 3.76c.53.528.92 1.444.935 2.192c.014.662.273 1.32.778 1.824a2.65 2.65 0 0 0 1.748.775c.791.04 1.827.5 2.387 1.06a2.66 2.66 0 0 0 3.759 0c.56-.56 1.596-1.02 2.387-1.06a2.65 2.65 0 0 0 1.748-.775a2.65 2.65 0 0 0 .777-1.826c.015-.746.4-1.656.929-2.184a2.663 2.663 0 0 0 .006-3.766c-.536-.535-.95-1.562-.934-2.32a2.65 2.65 0 0 0-.778-1.932a2.65 2.65 0 0 0-2.015-.775c-.714.036-1.615-.31-2.12-.816a2.66 2.66 0 0 0-3.76 0c-.504.505-1.406.852-2.12.816a2.65 2.65 0 0 0-2.014.775A2.65 2.65 0 0 0 3.213 5.8m9.828.826a1 1 0 0 1 .389 1.36l-2.768 4.982a1 1 0 0 1-.298.343a1 1 0 0 1-1.23-.045l-2.759-2.207a1 1 0 1 1 1.25-1.562l1.853 1.483l2.203-3.966a1 1 0 0 1 1.36-.388" clip-rule="evenodd" />
                      </svg>
                    U kolekciji
                  </span>
                </div>
              </figure>
              <div :class="`card-body ${cardConfig.cardBody} flex flex-col`">
                <h4 :class="`card-title ${cardConfig.titleSize} font-bold mb-1 line-clamp-1`">{{ game.name }}</h4>
                <div v-show="game.metacritic || getPlatformNames(game).length" class="flex items-center flex-wrap gap-1.5 mb-1">
                  <span v-if="game.metacritic" class="badge badge-outline font-bold text-xs sm:text-sm" :class="getMetacriticBadgeColor(game.metacritic)">
                    Metacritic: {{ game.metacritic }}
                  </span>
                  <span 
                    v-for="platform in getPlatformNames(game).slice(0, 3)" 
                    :key="platform" 
                    class="badge badge-outline p-2 h-auto tooltip tooltip-top"
                    :data-tip="platform"
                  >
                    <PlatformIcon :name="platform" class="w-6 h-6" />
                  </span>
                  <span v-if="getPlatformNames(game).length > 3" class="badge badge-neutral p-2 h-auto">
                    +{{ getPlatformNames(game).length - 3 }}
                  </span>
                </div>
                <p class="text-sm opacity-70">{{ formatReleaseDate(game.released) }}</p>
                <div class="card-actions justify-end mt-3 pt-1">
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
          <div ref="searchSentinelRef" class="flex justify-center mt-4 py-2">
            <span v-if="searchLoadingMore" class="loading loading-spinner loading-lg"></span>
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

        <form @submit.prevent="saveApiGame" class="space-y-6">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <div class="rating rating-sm sm:rating-md lg:rating-lg pt-3">
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
            </div>

            <div class="form-control">
              <label class="label font-medium">Datum početka</label>
              <input type="date" v-model="apiGameForm.start_date" class="input input-bordered" />
            </div>
            
            <div class="form-control">
              <label class="label font-medium">Datum završetka</label>
              <input type="date" v-model="apiGameForm.end_date" class="input input-bordered" />
            </div>
          </div>

          <template v-if="selectedApiProgressMode">
            <!-- SAMO ZA ACHIEVEMENTS/TROPHIES -->
            <div v-if="selectedApiProgressMode.key.includes('achievements') || selectedApiProgressMode.key.includes('trophies')" class="card bg-base-300/50 border border-warning/30 p-4 space-y-4">
              <div class="alert alert-warning text-sm mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" class="shrink-0 h-6 w-6"><path fill="currentColor" d="M8.15 21.75L6.7 19.3l-2.75-.6q-.375-.075-.6-.387t-.175-.688L3.45 14.8l-1.875-2.15q-.25-.275-.25-.65t.25-.65L3.45 9.2l-.275-2.825q-.05-.375.175-.688t.6-.387l2.75-.6l1.45-2.45q.2-.325.55-.438t.7.038l2.6 1.1l2.6-1.1q.35-.15.7-.038t.55.438L17.3 4.7l2.75.6q.375.075.6.388t.175.687L20.55 9.2l1.875 2.15q.25.275.25.65t-.25.65L20.55 14.8l.275 2.825q.05.375-.175.688t-.6.387l-2.75.6l-1.45 2.45q-.2.325-.55.438t-.7-.038l-2.6-1.1l-2.6 1.1q-.35.15-.7.038t-.55-.438m1.3-1.8l2.55-1.1l2.6 1.1l1.4-2.4l2.75-.65l-.25-2.8l1.85-2.1l-1.85-2.15l.25-2.8l-2.75-.6l-1.45-2.4L12 5.15l-2.6-1.1L8 6.45l-2.75.6l.25 2.8L3.65 12l1.85 2.1l-.25 2.85l2.75.6zM12 17q.425 0 .713-.288T13 16t-.288-.712T12 15t-.712.288T11 16t.288.713T12 17m0-4q.425 0 .713-.288T13 12V8q0-.425-.288-.712T12 7t-.712.288T11 8v4q0 .425.288.713T12 13"/></svg>
                <div>
                  <h3 class="font-bold">Brojevi iz RAWG baze mogu biti neprecizni!</h3>
                  <div class="text-xs">Provjerite ukupan broj {{ selectedApiProgressMode.defaultUnit }}.</div>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <!-- UKUPAN BROJ TROFEJA/ACHIEVEMENTA -->
                <div class="form-control">
                  <label class="label font-medium text-sm">
                    Ukupan broj {{ selectedApiProgressMode.defaultUnit }}
                  </label>
                  <input 
                    type="number" 
                    v-model.number="apiGameForm.progress_total" 
                    class="input input-bordered font-bold" 
                    min="0"
                    placeholder="npr. 50"
                  />
                </div>

                <!-- BROJ KOJI JE KORISNIK OSTVARIO -->
                <div class="form-control">
                  <label class="label font-medium text-sm">
                    Ostvareni {{ selectedApiProgressMode.defaultUnit }}
                  </label>
                  <input 
                    type="number" 
                    v-model.number="apiGameForm.progress_value" 
                    class="input input-bordered font-bold text-success" 
                    min="0"
                    :max="apiGameForm.progress_total || undefined"
                    placeholder="npr. 25"
                  />
                  <label class="label">
                    <span class="text-xs opacity-70">
                      Napredak: 
                      <strong v-if="apiGameForm.progress_total > 0">
                        {{ Math.round((apiGameForm.progress_value / apiGameForm.progress_total) * 100) }}%
                      </strong>
                      <span v-else class="text-warning">postavi ukupno</span>
                    </span>
                  </label>
                </div>

                <!-- JEDINICA -->
                <div class="form-control">
                  <label class="label font-medium text-sm">Jedinica</label>
                  <input type="text" v-model="apiGameForm.progress_unit" class="input input-bordered" readonly />
                </div>
              </div>
            </div>

            <!-- POKEDEX -->
            <div v-else-if="selectedApiProgressMode.key === 'pokedex'" class="card bg-base-300/50 border border-info/30 p-4 space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <!-- KOLIKO POKEMONA IMA U IGRI -->
                <div class="form-control">
                  <label class="label font-medium text-sm">
                    Ukupno pokemona u igri
                  </label>
                  <input 
                    type="number" 
                    v-model.number="apiGameForm.progress_total" 
                    class="input input-bordered font-bold" 
                    min="0"
                    placeholder="npr. 251"
                  />
                </div>
                
                <!-- KOLIKO POKEMONA JE KORISNIK UHVATIO -->
                <div class="form-control">
                  <label class="label font-medium text-sm">
                    Uhvaćenih pokemona
                  </label>
                  <input 
                    type="number" 
                    v-model.number="apiGameForm.progress_value" 
                    class="input input-bordered font-bold text-success" 
                    min="0"
                    :max="apiGameForm.progress_total || undefined"
                    placeholder="npr. 150"
                  />
                  <label class="label">
                    <span class="text-xs opacity-70">
                      Napredak: 
                      <strong v-if="apiGameForm.progress_total > 0">
                        {{ Math.round((apiGameForm.progress_value / apiGameForm.progress_total) * 100) }}%
                      </strong>
                      <span v-else class="text-warning">postavi ukupno</span>
                    </span>
                  </label>
                </div>

                <!-- JEDINICA -->
                <div class="form-control">
                  <label class="label font-medium text-sm">Jedinica</label>
                  <input type="text" v-model="apiGameForm.progress_unit" class="input input-bordered" readonly />
                </div>
              </div>
            </div>

            <!-- ZA OSTALE PROGRESS MODE-OVE -->
            <div v-else class="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-base-300/30 p-4 rounded-box border border-base-300">
              <div class="form-control" v-if="selectedApiProgressMode.kind === 'count' || selectedApiProgressMode.kind === 'rank'">
                <label class="label font-medium text-sm">Vrijednost</label>
                <input type="number" v-model.number="apiGameForm.progress_value" class="input input-bordered" min="0" />
              </div>
              <div class="form-control" v-if="selectedApiProgressMode.requiresTotal">
                <label class="label font-medium text-sm">Ukupno</label>
                <input type="number" v-model.number="apiGameForm.progress_total" class="input input-bordered" min="0" />
              </div>
              <div class="form-control">
                <label class="label font-medium text-sm">Jedinica</label>
                <input type="text" v-model="apiGameForm.progress_unit" class="input input-bordered" :placeholder="selectedApiProgressMode.defaultUnit || 'unit'" readonly />
              </div>
            </div>
          </template>

          <!-- GRUPE / KOLEKCIJE -->
          <div class="form-control bg-base-200/50 p-4 rounded-box border border-base-300" v-if="apiGameStoresList.length > 0">
            <label class="label font-medium text-base mb-2">Dodaj u kolekcije</label>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              <label v-for="group in apiGameStoresList" :key="group.id" class="flex items-center gap-2 cursor-pointer p-3 rounded-lg border border-base-300 bg-base-100 hover:border-primary transition-colors">
                <input 
                  type="checkbox" 
                  :checked="apiGameForm.group_ids.includes(group.id)"
                  @change="toggleApiGroupId(group.id)"
                  class="checkbox checkbox-primary checkbox-sm"
                />
                <span class="text-sm font-medium">{{ group.name }}</span>
              </label>
            </div>
          </div>
          
          <div class="form-control">
            <label class="label font-medium">Bilješke</label>
            <textarea v-model="apiGameForm.notes" class="textarea textarea-bordered h-24 w-full"></textarea>
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
import { ref, reactive, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '../stores/user';
import { useCardSizeStore } from '../stores/cardSize';
import { useGamesApi } from '../services/gamesApi';
import { addGameToGroup } from '../services/groupsApi';
import { supabase } from '../supabase';
import { PROGRESS_MODES, PROGRESS_MODE_MAP } from '../constants/progressModes';
import { GAME_STATUS } from '../constants/gameStatus';
import PlatformIcon from '../components/PlatformIcon.vue';

const PAGE_SIZE = 20;

export default {
  components: { PlatformIcon },
  setup() {
    const userStore = useUserStore();
    const cardSizeStore = useCardSizeStore();
    const router = useRouter();
    const route = useRoute();
    const gamesApi = useGamesApi();
    
    const searchQuery = ref('');
    const searchResults = ref([]);
    const searchLoading = ref(false);
    const searchLoadingMore = ref(false);
    const searchPage = ref(1);
    const hasMoreResults = ref(false);
    const searchSentinelRef = ref(null);
    const libraryGameApiIds = ref(new Set());
    const selectedGame = ref(null);
    const saveLoading = ref(false);
    const showApiGameModal = ref(false);
    const apiGameDetails = ref(null);
    const apiGameStoresList = ref([]);
    
    const cardConfig = computed(() => cardSizeStore.getSizeConfig(cardSizeStore.cardSize));
    
    const platforms = [
      'PC', 'PlayStation 5', 'PlayStation 4', 'Xbox Series X/S', 'Xbox One', 
      'Nintendo Switch', 'Nintendo Switch 2', 'iOS', 'Android', 'Other'
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
      progress_source: '',
      group_ids: []
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

    const loadLibraryGameApiIds = async () => {
      if (!userStore.user?.id) return;
      try {
        const { data } = await supabase
          .from('games')
          .select('game_api_id')
          .eq('user_id', userStore.user.id)
          .not('game_api_id', 'is', null);
        libraryGameApiIds.value = new Set((data || []).map(g => g.game_api_id).filter(Boolean));
      } catch (error) {
        console.error('Greška pri učitavanju kolekcije:', error);
      }
    };

    const isGameInLibrary = (game) => {
      if (!game?.id) return false;
      return libraryGameApiIds.value.has(game.id.toString());
    };

    const clearSearch = () => {
      searchQuery.value = '';
      searchResults.value = [];
      searchPage.value = 1;
      hasMoreResults.value = false;
      sessionStorage.removeItem('addGameSearchQuery');
      sessionStorage.removeItem('addGameSearchResults');
    };

    const getPlatformNames = (game) => {
      if (!game) return [];
      const extract = (list) => (list || []).map(p => {
        if (!p) return '';
        if (typeof p === 'string') return p;
        return p?.platform?.name || p?.name || p?.slug || '';
      }).filter(Boolean);
      return [...new Set([...extract(game.platforms), ...extract(game.parent_platforms)])];
    };

    const getMetacriticBadgeColor = (score) => {
      if (!score) return 'text-gray-400';
      if (score >= 75) return 'text-green-500 border-green-500';
      if (score >= 50) return 'text-yellow-500 border-yellow-500';
      return 'text-red-500 border-red-500';
    };

    const computeHasMore = (data, resultsLength) => {
      if (data && data.next) return true;
      if (data && typeof data.count === 'number') return data.count > resultsLength;
      return resultsLength >= PAGE_SIZE;
    };

    const searchGames = async () => {
      if (!searchQuery.value.trim()) return;
      
      searchLoading.value = true;
      
      try {
        const data = await gamesApi.searchGames(searchQuery.value, 1);
        searchResults.value = data.results || [];
        searchPage.value = 1;
        hasMoreResults.value = computeHasMore(data, searchResults.value.length);
        sessionStorage.setItem('addGameSearchQuery', searchQuery.value);
        sessionStorage.setItem('addGameSearchResults', JSON.stringify(searchResults.value));
        window.scrollTo({ top: 0 });
      } catch (error) {
        console.error('Greška pri pretraživanju igara:', error);
      } finally {
        searchLoading.value = false;
      }
    };
    
    const loadMoreResults = async () => {
      if (searchLoadingMore.value || searchLoading.value || !hasMoreResults.value) return;
      if (showApiGameModal.value) return;
      if (!searchQuery.value.trim()) return;
      
      searchLoadingMore.value = true;
      
      try {
        const data = await gamesApi.searchGames(searchQuery.value, searchPage.value + 1);
        const newResults = data.results || [];
        const existingIds = new Set(searchResults.value.map(g => g.id));
        const uniqueNew = newResults.filter(g => !existingIds.has(g.id));
        
        searchPage.value += 1;
        searchResults.value = [...searchResults.value, ...uniqueNew];
        hasMoreResults.value = computeHasMore(data, searchResults.value.length);
        sessionStorage.setItem('addGameSearchResults', JSON.stringify(searchResults.value));
      } catch (error) {
        console.error('Greška pri učitavanju dodatnih rezultata:', error);
      } finally {
        searchLoadingMore.value = false;
      }
    };
    
    let sentinelObserver = null;
    const setupSentinelObserver = () => {
      if (sentinelObserver) {
        sentinelObserver.disconnect();
        sentinelObserver = null;
      }
      nextTick(() => {
        const target = searchSentinelRef.value;
        if (!target) return;
        sentinelObserver = new IntersectionObserver((entries) => {
          if (entries.some(e => e.isIntersecting)) {
            loadMoreResults();
          }
        }, { rootMargin: '300px 0px' });
        sentinelObserver.observe(target);
      });
    };
    
    const navigateToGameDetails = (game) => {
      // idi na API game details 
      router.push(`/api-games/${game.id}`);
    };
    
    const selectGameForCollection = async (game) => {
      selectedGame.value = game;
      apiGameForm.group_ids = [];
      
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

      // Load groups
      await loadApiGameStores();
      
      showApiGameModal.value = true;
      
      setTimeout(() => {
        const formElement = document.querySelector('.game-form');
        if (formElement) {
          formElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    };

    const loadApiGameStores = async () => {
      try {
        const { data: groups } = await supabase
          .from('groups')
          .select('id, name')
          .eq('user_id', userStore.user?.id);
        
        apiGameStoresList.value = groups || [];
      } catch (error) {
        console.error('Error loading groups:', error);
      }
    };

    const toggleApiGroupId = (groupId) => {
      const index = apiGameForm.group_ids.indexOf(groupId);
      if (index > -1) {
        apiGameForm.group_ids.splice(index, 1);
      } else {
        apiGameForm.group_ids.push(groupId);
      }
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

        const { error } = await supabase
          .from('games')
          .insert([gameData])
          .select();

        if (error) {
          console.error('Error saving game:', error);
          return;
        }

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
        if (key === 'group_ids') {
          apiGameForm[key] = [];
        } else if (typeof apiGameForm[key] === 'boolean') {
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

        const { data: insertedGame, error } = await supabase
          .from('games')
          .insert([gameData])
          .select()
          .single();

        if (error) {
          console.error('Error saving game:', error);
          return;
        }

        const newGameId = insertedGame?.id;
        
        // Dodaj igru u odabrane grupe - isti način kao u GameDetails
        if (newGameId && apiGameForm.group_ids.length > 0) {
          for (const groupId of apiGameForm.group_ids) {
            try {
              await addGameToGroup({ 
                user_id: userStore.user.id, 
                group_id: groupId, 
                game_id: newGameId 
              });
            } catch (groupError) {
              console.error(`Greška pri dodavanju igre u grupu ${groupId}:`, groupError);
            }
          }
        }

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
    
    watch(() => searchResults.value.length > 0, (hasResults) => {
      if (hasResults) {
        setupSentinelObserver();
      } else if (sentinelObserver) {
        sentinelObserver.disconnect();
        sentinelObserver = null;
      }
    });

    onMounted(() => {
      const savedQuery = sessionStorage.getItem('addGameSearchQuery');
      const savedResults = sessionStorage.getItem('addGameSearchResults');
      if (savedQuery) {
        searchQuery.value = savedQuery;
      }
      if (savedResults) {
        try {
          searchResults.value = JSON.parse(savedResults);
        } catch (e) {
          searchResults.value = [];
        }
      }
      if (searchResults.value.length > 0) {
        searchPage.value = 1;
        hasMoreResults.value = true;
        setupSentinelObserver();
      }
      loadLibraryGameApiIds();
      loadGameFromApiId();
    });

    onUnmounted(() => {
      if (sentinelObserver) {
        sentinelObserver.disconnect();
        sentinelObserver = null;
      }
    });
    
    return {
      PROGRESS_MODES,
      GAME_STATUS,
      selectedProgressMode,
      selectedApiProgressMode,
      searchQuery,
      searchResults,
      searchLoading,
      searchLoadingMore,
      hasMoreResults,
      selectedGame,
      saveLoading,
      showApiGameModal,
      apiGameDetails,
      platforms,
      gameForm,
      apiGameForm,
      apiGameStoresList,
      cardSizeStore,
      cardConfig,
      searchSentinelRef,
      searchGames,
      clearSearch,
      loadMoreResults,
      navigateToGameDetails,
      selectGameForCollection,
      isGameInLibrary,
      getPlatformNames,
      getMetacriticBadgeColor,
      toggleApiGroupId,
      formatReleaseDate,
      saveGame,
      closeApiGameModal,
      saveApiGame
    };
  }
};
</script>
