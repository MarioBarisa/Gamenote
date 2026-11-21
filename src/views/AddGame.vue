<!-- src/views/AddGame.vue -->
<template>
  <div v-if="operationError && !showApiGameModal" role="alert" class="alert alert-error mb-4">{{ operationError }}</div>
  <div class="add-game">
    <h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-8 text-center">{{ $t('common.searchGamesLabel') }}</h1>

    <div class="card bg-base-200 shadow-xl">
      <div class="card-body p-4 sm:p-6">
        <div class="mb-4 sm:mb-6">
          <h2 class="text-xl sm:text-2xl font-bold mb-2 sm:mb-4"></h2>
          <div class="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <div class="relative flex-1 w-full sm:flex-grow">
              <input 
                type="text" 
                v-model="searchQuery" 
                :placeholder="$t('addGame.enterAGameTitle')"
                class="input input-bordered input-md sm:input-lg w-full pr-10"
                @keyup.enter="searchGames" 
               :aria-label="$t('addGame.enterAGameTitle')" />
              <button 
                v-if="searchQuery"
                @click="clearSearch"
                class="absolute inset-y-0 right-1 sm:right-2 flex items-center justify-center w-8 sm:w-9 text-base-content/60 hover:text-base-content"
                :title="$t('common.clearSearch')"
                :aria-label="$t('common.clearSearch')"
                type="button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <button @click="searchGames" class="btn btn-primary btn-md sm:btn-lg whitespace-nowrap w-full sm:w-auto" :disabled="searchLoading">
              <span v-if="searchLoading" class="loading loading-spinner"></span>
              <span v-else>{{ $t('addGame.search') }}</span>
            </button>
          </div>
        </div>
        
        <div v-if="searchResults.length > 0" class="search-results mb-6 sm:mb-8">
          <h3 class="text-lg sm:text-xl font-bold mb-3 sm:mb-4">{{ $t('addGame.searchResults') }}</h3>
          <div :class="`grid ${cardConfig.container} ${cardConfig.gap}`">
            <div 
              v-for="game in searchResults" 
              :key="game.id" 
              class="game-card relative card bg-base-100 shadow-xl h-full transform transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer"

            >
              <router-link :to="`/api-games/${game.id}`" :aria-label="game.name" class="card-open-link absolute inset-0 z-10 rounded-box" />
              <figure :class="`relative w-full ${cardConfig.poster} overflow-hidden`">
                <img :src="game.background_image || 'https://placehold.co/600x400?text=No+Image'" :alt="game.name" class="w-full h-full object-cover" />
                <div v-if="isGameInLibrary(game)" class="absolute top-0 left-0 m-1 sm:m-2">
                  <span
                      class="badge bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-600 text-white font-bold text-xs sm:text-sm p-2 sm:p-3 shadow-lg border-2 border-emerald-300">
                      <svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 20 20">
                        <path d="M0 0h20v20H0z" fill="none" />
                        <path fill="currentColor" fill-rule="evenodd" d="M3.213 5.8c.015.759-.398 1.785-.935 2.321a2.66 2.66 0 0 0 0 3.76c.53.528.92 1.444.935 2.192c.014.662.273 1.32.778 1.824a2.65 2.65 0 0 0 1.748.775c.791.04 1.827.5 2.387 1.06a2.66 2.66 0 0 0 3.759 0c.56-.56 1.596-1.02 2.387-1.06a2.65 2.65 0 0 0 1.748-.775a2.65 2.65 0 0 0 .777-1.826c.015-.746.4-1.656.929-2.184a2.663 2.663 0 0 0 .006-3.766c-.536-.535-.95-1.562-.934-2.32a2.65 2.65 0 0 0-.778-1.932a2.65 2.65 0 0 0-2.015-.775c-.714.036-1.615-.31-2.12-.816a2.66 2.66 0 0 0-3.76 0c-.504.505-1.406.852-2.12.816a2.65 2.65 0 0 0-2.014.775A2.65 2.65 0 0 0 3.213 5.8m9.828.826a1 1 0 0 1 .389 1.36l-2.768 4.982a1 1 0 0 1-.298.343a1 1 0 0 1-1.23-.045l-2.759-2.207a1 1 0 1 1 1.25-1.562l1.853 1.483l2.203-3.966a1 1 0 0 1 1.36-.388" clip-rule="evenodd" />
                      </svg>
                    {{ $t('common.inCollection') }}
                  </span>
                </div>
              </figure>
              <div :class="`card-body ${cardConfig.cardBody} flex flex-col`">
                <h4 :class="`card-title ${cardConfig.titleSize} font-bold mb-1 line-clamp-1`">{{ game.name }}</h4>
                <div v-show="game.metacritic || getPlatformNames(game).length" class="flex items-center flex-wrap gap-1.5 mb-1">
                  <span v-if="game.metacritic" class="badge badge-outline font-bold text-xs sm:text-sm" :class="getMetacriticBadgeColor(game.metacritic)">
                    {{ $t('addGame.metacritic') }} {{ game.metacritic }}
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
                    {{ $t('common.addToGamenote') }}
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
    <AppModal v-if="showApiGameModal" :label="$t('common.addToGamenote')" :busy="saveLoading" @close="closeApiGameModal">
      <div class="modal-box max-w-2xl">
          <button type="button" class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 z-20" :aria-label="$t('common.close')" :disabled="saveLoading" @click.stop="closeApiGameModal">✕</button>
        <h3 class="font-bold text-2xl mb-4">{{ $t('common.addToGamenote') }}</h3>
        
        <div v-if="apiGameDetails" class="mb-6">
          <div class="flex gap-4 mb-4">
            <img 
              :src="apiGameDetails.background_image || 'https://placehold.co/150x200?text=No+Image'" 
              :alt="apiGameDetails.name" 
              class="w-24 h-32 object-cover rounded"
            />
            <div class="min-w-0">
              <h4 class="text-[1.375rem] font-bold [overflow-wrap:anywhere]">{{ apiGameDetails.name }}</h4>
              <p class="text-sm opacity-70">{{ formatReleaseDate(apiGameDetails.released) }}</p>
              <p class="text-sm"><strong>{{ $t('common.genreLabel') }}</strong> {{ apiGameDetails.genres?.map(g => g.name).join(', ') || 'N/A' }}</p>
              <p class="text-sm"><strong>{{ $t('common.publisher') }}</strong> {{ apiGameDetails.publishers?.map(p => p.name).join(', ') || 'N/A' }}</p>
            </div>
          </div>
        </div>

        <form @submit.prevent="saveApiGame" class="space-y-6">
          <div class="grid grid-cols-2 gap-4">
            <div class="form-control col-span-2 sm:col-span-1">
              <label class="label font-medium" :for="fieldId + '-1'">{{ $t('common.name') }}</label>
              <input type="text" v-model="apiGameForm.title" class="input input-bordered" required  :id="fieldId + '-1'" />
            </div>
            
            <div class="form-control col-span-2 sm:col-span-1">
              <label class="label font-medium" :for="fieldId + '-2'">{{ $t('common.platform') }}</label>
              <select v-model="apiGameForm.platform" class="select select-bordered" required :id="fieldId + '-2'">
                <option value="" disabled>{{ $t('common.chooseAPlatform') }}</option>
                <option v-for="platform in platforms" :key="platform" :value="platform">
                  {{ platform }}
                </option>
              </select>
            </div>
            
            <div class="form-control min-w-0">
              <label class="label font-medium text-sm sm:text-base" :for="fieldId + '-3'">{{ $t('common.playtime') }} <span class="sr-only sm:not-sr-only">{{ $t('common.hoursLabel') }}</span></label>
              <input type="number" v-model="apiGameForm.play_time" class="input input-bordered w-full min-w-0 min-h-11 sm:min-h-10" min="0"  :id="fieldId + '-3'" />
            </div>
            
            <div class="form-control min-w-0">
              <label class="label font-medium text-sm sm:text-base" :for="fieldId + '-4'">{{ $t('common.status') }}</label>
              <select v-model="apiGameForm.status" class="select select-bordered w-full min-w-0 font-semibold" :class="GAME_STATUS_SELECT_CLASS[apiGameForm.status]" :id="fieldId + '-4'">
                <option value="" disabled class="bg-base-100 text-base-content font-normal">{{ statusPlaceholder }}</option>
                <option v-for="s in GAME_STATUS" :key="s.key" :value="s.key" class="bg-base-100 text-base-content font-normal">{{ s.label }}</option>
              </select>
            </div>

            <div class="form-control col-span-2 flex items-center gap-2">
              <span :id="fieldId + '-rating-label'" class="label font-medium shrink-0">{{ $t('common.rating15') }}</span>
              <div class="rating rating-sm sm:rating-md shrink-0" role="radiogroup" :aria-labelledby="fieldId + '-rating-label'">
                <input type="radio" name="api-rating" class="mask mask-star-2 bg-orange-400" value="1" v-model="apiGameForm.rating"  :aria-label="$t('common.value1OutOf5')" />
                <input type="radio" name="api-rating" class="mask mask-star-2 bg-orange-400" value="2" v-model="apiGameForm.rating"  :aria-label="$t('common.value2OutOf5')" />
                <input type="radio" name="api-rating" class="mask mask-star-2 bg-orange-400" value="3" v-model="apiGameForm.rating"  :aria-label="$t('common.value3OutOf5')" />
                <input type="radio" name="api-rating" class="mask mask-star-2 bg-orange-400" value="4" v-model="apiGameForm.rating"  :aria-label="$t('common.value4OutOf5')" />
                <input type="radio" name="api-rating" class="mask mask-star-2 bg-orange-400" value="5" v-model="apiGameForm.rating"  :aria-label="$t('common.value5OutOf5')" />
              </div>
            </div>
          </div>

          <fieldset class="min-w-0 rounded-box border border-base-300 bg-base-300/30 p-4 space-y-4">
            <legend class="sr-only">{{ $t('common.gameProgress') }}</legend>
            <div class="form-control">
              <label class="label font-medium" :for="fieldId + '-5'">{{ $t('common.progressType') }}</label>
              <select v-model="apiGameForm.progress_mode" class="select select-bordered w-full" :id="fieldId + '-5'">
                <option value="" disabled>{{ $t('common.chooseHowToTrackProgress') }}</option>
                <option v-for="mode in PROGRESS_MODES" :key="mode.key" :value="mode.key">{{ mode.label }}</option>
              </select>
            </div>

            <template v-if="selectedApiProgressMode">
              <div v-if="selectedApiProgressMode.key.includes('achievements') || selectedApiProgressMode.key.includes('trophies')">
                <div class="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_max-content] gap-2 sm:gap-4">
                  <div class="form-control">
                    <label class="label font-medium text-sm" :for="fieldId + '-8'">
                      {{ $t('common.total') }}
                    </label>
                    <input
                      type="number"
                      v-model.number="apiGameForm.progress_total"
                      class="input input-bordered w-full min-w-0 font-bold"
                      min="0"
                      :placeholder="$t('common.eG50')"
                     :id="fieldId + '-8'" />
                  </div>

                  <div class="form-control">
                    <label class="label font-medium text-sm" :for="fieldId + '-9'">
                      {{ $t('common.earned') }}
                    </label>
                    <input
                      type="number"
                      v-model.number="apiGameForm.progress_value"
                      class="input input-bordered w-full min-w-0 font-bold text-success"
                      min="0"
                      :max="apiGameForm.progress_total || undefined"
                      :placeholder="$t('common.eG25')"
                     :id="fieldId + '-9'" />

                  </div>

                  <div class="form-control min-w-0">
                    <label class="label font-medium text-sm" :for="fieldId + '-10'">{{ $t('common.unit') }}</label>
                    <output class="flex min-h-10 items-center text-base-content/70" :id="fieldId + '-10'">
                      <code class="rounded bg-base-300 px-2 py-1 font-mono text-sm">{{ apiGameForm.progress_unit || selectedApiProgressMode.defaultUnit || '—' }}</code>
                    </output>
                  </div>
                  <div class="col-span-3">
                    <span class="text-xs opacity-70">
                      {{ $t('common.progressLabel') }}
                      <strong v-if="apiGameForm.progress_total > 0">
                        {{ Math.round((apiGameForm.progress_value / apiGameForm.progress_total) * 100) }}%
                      </strong>
                      <span v-else class="text-warning">{{ $t('common.setATotal') }}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div v-else-if="selectedApiProgressMode.key === 'pokedex'">
                <div class="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_max-content] gap-2 sm:gap-4">
                  <div class="form-control">
                    <label class="label font-medium text-sm" :for="fieldId + '-11'">
                      {{ $t('common.total') }}
                    </label>
                    <input
                      type="number"
                      v-model.number="apiGameForm.progress_total"
                      class="input input-bordered w-full min-w-0 font-bold"
                      min="0"
                      :placeholder="$t('common.eG251')"
                     :id="fieldId + '-11'" />
                  </div>

                  <div class="form-control">
                    <label class="label font-medium text-sm" :for="fieldId + '-12'">
                      {{ $t('common.caught') }}
                    </label>
                    <input
                      type="number"
                      v-model.number="apiGameForm.progress_value"
                      class="input input-bordered w-full min-w-0 font-bold text-success"
                      min="0"
                      :max="apiGameForm.progress_total || undefined"
                      :placeholder="$t('common.eG150')"
                     :id="fieldId + '-12'" />

                  </div>

                  <div class="form-control min-w-0">
                    <label class="label font-medium text-sm" :for="fieldId + '-13'">{{ $t('common.unit') }}</label>
                    <output class="flex min-h-10 items-center text-base-content/70" :id="fieldId + '-13'">
                      <code class="rounded bg-base-300 px-2 py-1 font-mono text-sm">{{ apiGameForm.progress_unit || selectedApiProgressMode.defaultUnit || '—' }}</code>
                    </output>
                  </div>
                  <div class="col-span-3">
                    <span class="text-xs opacity-70">
                      {{ $t('common.progressLabel') }}
                      <strong v-if="apiGameForm.progress_total > 0">
                        {{ Math.round((apiGameForm.progress_value / apiGameForm.progress_total) * 100) }}%
                      </strong>
                      <span v-else class="text-warning">{{ $t('common.setATotal') }}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div v-else class="grid grid-cols-2 gap-2 sm:gap-4">
                <div class="form-control" v-if="selectedApiProgressMode.kind === 'count' || selectedApiProgressMode.kind === 'rank'">
                  <label class="label font-medium text-sm" :for="fieldId + '-14'">{{ $t('common.value') }}</label>
                  <input type="number" v-model.number="apiGameForm.progress_value" class="input input-bordered w-full min-w-0" min="0"  :id="fieldId + '-14'" />
                </div>
                <div class="form-control" v-if="selectedApiProgressMode.requiresTotal">
                  <label class="label font-medium text-sm" :for="fieldId + '-15'">{{ $t('common.total') }}</label>
                  <input type="number" v-model.number="apiGameForm.progress_total" class="input input-bordered w-full min-w-0" min="0"  :id="fieldId + '-15'" />
                </div>
                <div class="form-control">
                  <label class="label font-medium text-sm" :for="fieldId + '-16'">{{ $t('common.unit') }}</label>
                  <output class="flex min-h-10 items-center text-base-content/70" :id="fieldId + '-16'">
                    <code class="rounded bg-base-300 px-2 py-1 font-mono text-sm">{{ apiGameForm.progress_unit || selectedApiProgressMode.defaultUnit || '—' }}</code>
                  </output>
                </div>
              </div>
            </template>
          </fieldset>

          <div class="grid grid-cols-2 gap-4">
            <div class="form-control min-w-0">
              <label class="label font-medium text-sm sm:text-base" :for="fieldId + '-6'">{{ $t('common.startDate') }}</label>
              <input type="date" v-model="apiGameForm.start_date" class="input input-bordered w-full min-w-0 px-2 sm:px-3"  :id="fieldId + '-6'" />
            </div>

            <div class="form-control min-w-0">
              <label class="label font-medium text-sm sm:text-base" :for="fieldId + '-7'">{{ $t('common.endDate') }}</label>
              <input type="date" v-model="apiGameForm.end_date" class="input input-bordered w-full min-w-0 px-2 sm:px-3"  :id="fieldId + '-7'" />
            </div>
          </div>


          <!-- GRUPE / KOLEKCIJE -->
          <div class="form-control bg-base-200/50 p-4 rounded-box border border-base-300" v-if="apiGameStoresList.length > 0">
            <label class="label font-medium text-base mb-2" :for="fieldId + '-17'">{{ $t('common.addToCollections') }}</label>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              <label v-for="group in apiGameStoresList" :key="group.id" class="flex items-center gap-2 cursor-pointer p-3 rounded-lg border border-base-300 bg-base-100 hover:border-primary transition-colors">
                <input 
                  type="checkbox" 
                  :checked="apiGameForm.group_ids.includes(group.id)"
                  @change="toggleApiGroupId(group.id)"
                  class="checkbox checkbox-primary checkbox-sm"
                 :id="fieldId + '-17'" />
                <span class="text-sm font-medium">{{ group.name }}</span>
              </label>
            </div>
          </div>
          
          <div class="form-control">
            <label class="label font-medium" :for="fieldId + '-18'">{{ $t('common.notes') }}</label>
            <textarea v-model="apiGameForm.notes" class="textarea textarea-bordered h-24 w-full" :id="fieldId + '-18'"></textarea>
          </div>
          
          <div v-if="operationError" role="alert" class="alert alert-error">{{ operationError }}</div>

          <div class="modal-action">
            <button type="submit" class="btn btn-primary" :disabled="saveLoading">
              <span v-if="saveLoading" class="loading loading-spinner"></span>
              <span v-else>{{ $t('common.addToGamenote') }}</span>
            </button>
            <button type="button" @click="closeApiGameModal" class="btn btn-secondary">
              {{ $t('common.cancel') }}
            </button>
          </div>
        </form>
      </div>
    </AppModal>
  </div>
</template>

<script>
import { formatLocale, t } from '../i18n/index.js';
import { useStatusPlaceholder } from '../composables/useStatusPlaceholder.js';
import { useId } from 'vue';
import AppModal from '../components/AppModal.vue';
import { buildGameUpdate, progressFields } from '../services/gameForm';
import { fetchUserRows } from '../services/libraryData';
import { invalidateGames } from '../services/libraryCache.js';
import { ref, reactive, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '../stores/user';
import { useCardSizeStore } from '../stores/cardSize';
import { useGamesApi } from '../services/gamesApi';
import { addGameToGroup } from '../services/groupsApi';
import { supabase } from '../supabase';
import { PROGRESS_MODES, PROGRESS_MODE_MAP } from '../constants/progressModes';
import { GAME_STATUS, GAME_STATUS_SELECT_CLASS } from '../constants/gameStatus';
import PlatformIcon from '../components/PlatformIcon.vue';

const PAGE_SIZE = 20;

export default {
  components: { AppModal, PlatformIcon },
  setup() {
    const statusPlaceholder = useStatusPlaceholder();
    const fieldId = useId();
    const operationError = ref('');
    let searchVersion = 0;
    let searchController;
    let disposed = false;
    let detailVersion = 0;
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
        gameForm.progress_mode = 'achievements_gamecentre';
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
        apiGameForm.progress_mode = 'achievements_gamecentre';
      } else {
        apiGameForm.progress_mode = 'completion_standard';
      }
    });

    const loadLibraryGameApiIds = async () => {
      if (!userStore.user?.id) return;
      try {
        const data = await fetchUserRows(supabase, 'games', userStore.user.id, { columns: 'game_api_id' });
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
      
      const version = ++searchVersion;
      const query = searchQuery.value.trim();
      searchController?.abort();
      searchController = new AbortController();
      operationError.value = '';
      searchLoading.value = true;
      
      try {
        const data = await gamesApi.searchGames(query, 1, { signal: searchController.signal });
        if (disposed || version !== searchVersion) return;
        searchResults.value = data.results || [];
        searchPage.value = 1;
        hasMoreResults.value = computeHasMore(data, searchResults.value.length);
        sessionStorage.setItem('addGameSearchQuery', searchQuery.value);
        sessionStorage.setItem('addGameSearchResults', JSON.stringify(searchResults.value));
        window.scrollTo({ top: 0 });
      } catch (error) {
        if (version === searchVersion && error.name !== 'AbortError') operationError.value = error.message || t('addGame.searchFailed');
      } finally {
        if (version === searchVersion) searchLoading.value = false;
      }
    };
    
    const loadMoreResults = async () => {
      if (searchLoadingMore.value || searchLoading.value || !hasMoreResults.value) return;
      if (showApiGameModal.value) return;
      if (!searchQuery.value.trim()) return;
      
      const version = searchVersion;
      searchLoadingMore.value = true;
      
      try {
        const data = await gamesApi.searchGames(searchQuery.value, searchPage.value + 1);
        if (disposed || version !== searchVersion) return;
        const newResults = data.results || [];
        const existingIds = new Set(searchResults.value.map(g => g.id));
        const uniqueNew = newResults.filter(g => !existingIds.has(g.id));
        
        searchPage.value += 1;
        searchResults.value = [...searchResults.value, ...uniqueNew];
        hasMoreResults.value = computeHasMore(data, searchResults.value.length);
        sessionStorage.setItem('addGameSearchResults', JSON.stringify(searchResults.value));
      } catch (error) {
        if (version === searchVersion) operationError.value = error.message || t('addGame.couldntFetchTheData');
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
      const version = ++detailVersion;
      operationError.value = '';
      try {
      selectedGame.value = game;
      apiGameForm.group_ids = [];
      
      const gameDetails = await gamesApi.getGameDetails(game.id);
      if (disposed || version !== detailVersion) return;
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
      
      if (disposed || version !== detailVersion) return;
      showApiGameModal.value = true;
      
      setTimeout(() => {
        const formElement = document.querySelector('.game-form');
        if (formElement) {
          formElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      } catch (failure) {
        if (version === detailVersion) operationError.value = failure.message || t('addGame.detailsCouldntBeLoaded');
      }
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
      if (!date) return t('common.unknownDate');
      return new Date(date).toLocaleDateString(formatLocale.value);
    };
    
    const saveGame = async () => {
      if (saveLoading.value) return;
      operationError.value = '';
      const ownerId = userStore.user?.id;
      if (!gameForm.title || !gameForm.platform) {
        return;
      }

      if (!userStore.user) {
        return;
      }

      try {
        saveLoading.value = true;
        
        buildGameUpdate(gameForm);
        let gameData = {
          user_id: userStore.user.id,
          title: gameForm.title,
          platform: gameForm.platform,
          play_time: gameForm.play_time === '' ? null : Number(gameForm.play_time),
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
        Object.assign(gameData, progressFields(gameForm), { title: gameForm.title.trim(), currently_playing: gameForm.status === 'playing' });
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

        if (disposed || userStore.user?.id !== ownerId) return;
        const { error } = await supabase
          .from('games')
          .insert([gameData])
          .select();

        if (error) {
          operationError.value = error.message || t('addGame.couldntSaveTheGame');
          return;
        }

        invalidateGames(ownerId);
        // resetiraj popunjavanje
        selectedGame.value = null;
        Object.keys(gameForm).forEach(key => {
          if (Array.isArray(gameForm[key])) gameForm[key] = [];
          else if (typeof gameForm[key] === 'boolean') {
            gameForm[key] = false;
          } else if (typeof gameForm[key] === 'number') {
            gameForm[key] = 0;
          } else {
            gameForm[key] = '';
          }
        });

        router.push('/library');
      } catch (error) {
        operationError.value = error.message || t('addGame.couldntSaveTheGame');
      } finally {
        saveLoading.value = false;
      }
    };
    
    const closeApiGameModal = () => {
      operationError.value = '';
      detailVersion++;
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
      if (saveLoading.value) return;
      operationError.value = '';
      const ownerId = userStore.user?.id;
      if (!apiGameForm.title || !apiGameForm.platform) {
        return;
      }

      if (!userStore.user) {
        return;
      }

      try {
        saveLoading.value = true;
        
        buildGameUpdate(apiGameForm);
        let gameData = {
          user_id: userStore.user.id,
          title: apiGameForm.title,
          platform: apiGameForm.platform,
          play_time: apiGameForm.play_time === '' ? null : Number(apiGameForm.play_time),
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
        Object.assign(gameData, progressFields(apiGameForm), { title: apiGameForm.title.trim(), currently_playing: apiGameForm.status === 'playing' });

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

        if (disposed || userStore.user?.id !== ownerId) return;
        const { data: insertedGame, error } = await supabase
          .from('games')
          .insert([gameData])
          .select()
          .single();

        if (error) {
          operationError.value = error.message || t('addGame.couldntSaveTheGame');
          return;
        }

        invalidateGames(ownerId);
        const newGameId = insertedGame?.id;
        let groupFailed = false;
        
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
              groupFailed = true;
            }
          }
        }

        if (groupFailed) alert(t('addGame.theGameWasAddedBut'));
        closeApiGameModal();
        router.push('/library');
      } catch (error) {
        operationError.value = error.message || t('addGame.couldntSaveTheGame');
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
          alert(t('addGame.couldntLoadTheGameTry'));
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
      disposed = true;
      searchVersion++;
      searchController?.abort();
      if (sentinelObserver) {
        sentinelObserver.disconnect();
        sentinelObserver = null;
      }
    });
    
    return { fieldId,
      operationError, PROGRESS_MODES,
      statusPlaceholder, GAME_STATUS, GAME_STATUS_SELECT_CLASS,
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
