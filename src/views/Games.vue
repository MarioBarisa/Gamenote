<template>
  <div class="games-list">
    <div v-if="isApiGame && apiGameDetails">
      <div class="flex items-center mb-6">
        <button @click="goBack" class="btn btn-ghost mr-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          {{ $t('games.back') }}
        </button>
        <h1 class="text-4xl font-bold">{{ apiGameDetails.name }}</h1>
      </div>

      <div v-if="existingGameId" class="alert alert-info shadow-lg mb-6 flex flex-col sm:flex-row items-center justify-between">
        <div class="flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 class="font-bold text-sm sm:text-base">{{ $t('games.thisGameIsAlreadyIn') }}</h3>
          </div>
        </div>
        <button @click="navigateToGame(existingGameId)" class="btn btn-sm btn-primary w-full sm:w-auto mt-2 sm:mt-0 shadow-sm">{{ $t('games.openInCollection') }}</button>
      </div>

      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <div class="flex flex-col lg:flex-row gap-6">
            <div class="flex-none">
              <img v-if="apiGameDetails.background_image" :src="apiGameDetails.background_image"
                :alt="apiGameDetails.name" class="w-full lg:w-80 h-auto rounded-lg">
            </div>
            <div class="flex-1">
              <h2 class="text-2xl font-bold mb-4">{{ apiGameDetails.name }}</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <p><strong>{{ $t('games.releaseDate') }}</strong> {{ apiGameDetails.released || 'N/A' }}</p>
                  <p><strong>{{ $t('games.metacriticScore') }}</strong> {{ apiGameDetails.metacritic || 'N/A' }}</p>
                  <div class="mt-4">
                    <img v-if="apiGameDetails.esrb_rating?.name === 'Mature'" src="https://www.esrb.org/wp-content/uploads/2019/05/M.svg" alt="Mature 17+" class="inline w-12 h-auto" />
                    <img v-else-if="apiGameDetails.esrb_rating?.name === 'Everyone'" src="https://www.esrb.org/wp-content/uploads/2019/05/E.svg" alt="Everyone" class="inline w-12 h-auto" />
                    <img v-else-if="apiGameDetails.esrb_rating?.name === 'Teen'" src="https://www.esrb.org/wp-content/uploads/2019/05/T.svg" alt="Teen" class="inline w-12 h-auto" />
                    <img v-else-if="apiGameDetails.esrb_rating?.name === 'Everyone 10+'" src="https://www.esrb.org/wp-content/uploads/2019/05/E10plus.svg" alt="Everyone 10+" class="inline w-12 h-auto" />
                    <img v-else-if="apiGameDetails.esrb_rating?.name === 'Adults Only'" src="https://www.esrb.org/wp-content/uploads/2019/05/AO.svg" alt="Adults Only 18+" class="inline w-12 h-auto" />
                    <p v-else-if="apiGameDetails.esrb_rating?.name"><strong>{{ $t('games.esrb') }}</strong> {{ apiGameDetails.esrb_rating.name }}</p>
                  </div>
                </div>
                <div>
                  <p><strong>{{ $t('games.genres') }}</strong> {{ apiGameDetails.genres?.map(g => g.name).join(', ') || 'N/A' }}</p>
                  <p><strong>{{ $t('games.platforms') }}</strong> {{ apiGameDetails.platforms?.map(p => p.platform.name).join(', ') ||
                    'N/A' }}</p>
                </div>
              </div>
              <div class="mb-6">
                <h3 class="text-lg font-bold mb-2">{{ $t('common.description') }}</h3>
                <p class="text-sm">{{ apiGameDetails.description_raw || $t('common.noDescription') }}</p>
              </div>
              <div class="card-actions">
                <button @click="navigateToAddGame(apiGameDetails.id)" class="btn btn-primary">
                  {{ $t('common.addToGamenote') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else>
      <div class="flex flex-col gap-4 mb-6 sm:mb-8">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold">{{ $t('common.myGames') }}</h1>
        </div>

        <!-- Filter Tabs -->
        <div class="library-status-actions flex flex-col-reverse lg:flex-row lg:items-start gap-3 min-w-0">
          <LibraryStatusFilters class="min-w-0 lg:flex-1" :model-value="activeFilter" ratings @update:model-value="filterGames" />
          <div class="shrink-0"><LibraryShareButton /></div>
        </div>

        <!-- Toolbar -->
        <LibraryToolbar v-model="searchQuery" :sort-value="sortField + ':' + sortOrder" @sort="changeSort">
          <div class="library-toolbar-actions flex items-center gap-3 w-full md:w-auto">
            <TcgShareToggle class="btn-sm sm:btn-md" :model-value="themeStore.tcgMode" @update:model-value="themeStore.setTcgMode($event)" />
          <router-link to="/add-game" class="btn btn-primary btn-sm sm:btn-md flex-1 md:flex-none shadow">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {{ $t('common.addToGamenote') }}
          </router-link>
          </div>
        </LibraryToolbar>
      </div>

      <LoadingCardGrid v-if="loading" :layout="cardSizeStore.getSizeConfig(cardSizeStore.cardSize)" />

      <div v-else-if="error" class="alert alert-error shadow-lg mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none"
          viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{{ error }}</span>
      </div>

      <div v-else-if="!userStore.isLoggedIn" class="text-center py-12">
        <div class="mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-400" fill="none"
            viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 class="text-xl font-bold mb-2">{{ $t('games.signInRequired') }}</h3>
        <p class="text-gray-400 mb-6">{{ $t('games.signInToSeeYour') }}</p>
        <router-link to="/login" class="btn btn-primary">
          {{ $t('common.signInLabel') }}
        </router-link>
      </div>

      <div v-else-if="filteredGames.length > 0"
        :class="`grid ${cardSizeStore.getSizeConfig(cardSizeStore.cardSize).container} ${cardSizeStore.getSizeConfig(cardSizeStore.cardSize).gap}`">
        <div v-for="(game, index) in visibleGames" :key="game.id" class="relative cursor-pointer">
          <GameCard :game="game" :to="`/game/${game.id}`" :lazy="index >= 6" @open="rememberScroll" />
        </div>
      </div>

      <div v-else class="text-center py-12">
        <div class="mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-400" fill="none"
            viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 2a10 10 0 110 20 10 10 0 010-20z" />
          </svg>
        </div>
        <h3 class="text-xl font-bold mb-2">
          {{ searchQuery.trim() ? $t('games.noSearchResults') : activeFilter !== 'all' ? $t('games.noGamesMatchTheSelected') : $t('games.noGamesToShow') }}
        </h3>
        <p class="text-gray-400 mb-6">
          {{ searchQuery.trim() ? $t('games.tryADifferentTitle') : activeFilter !== 'all' ? $t('games.tryChangingTheFilter') : $t('games.addYourFirstGameTo') }}
        </p>
        <button v-if="searchQuery.trim()" class="btn btn-outline mr-2" @click="searchQuery = ''">{{ $t('common.clearSearch') }}</button>
        <button v-if="activeFilter !== 'all'" @click="filterGames('all')" class="btn btn-outline mr-2">
          {{ $t('common.clearFilter') }}
        </button>
        <router-link to="/add-game" class="btn btn-primary">
          {{ $t('common.addToGamenote') }}
        </router-link>
      </div>
      <div v-if="!isApiGame && !loading && !error && visibleGames.length < filteredGames.length" ref="gridEnd" class="relative h-px">
        <button type="button" class="btn btn-sm sr-only focus:not-sr-only" @click="showMoreGames">{{ $t('libraryComparison.showMore') }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import { t } from '../i18n/index.js';
import LibraryToolbar from '../components/LibraryToolbar.vue';
import LibraryStatusFilters from '../components/LibraryStatusFilters.vue';
import LibraryShareButton from '../components/LibraryShareButton.vue';
import TcgShareToggle from '../components/TcgShareToggle.vue';
import LoadingCardGrid from '../components/LoadingCardGrid.vue';
import { getCachedGames, getFreshGames, onGamesInvalidated } from '../services/libraryCache.js';
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router';
import { useUserStore } from '../stores/user';
import { useCardSizeStore } from '../stores/cardSize';
import { useThemeStore } from '../stores/theme';
import { useLibraryUiStore } from '../stores/libraryUi';
import { useGamesApi } from '../services/gamesApi';
import { supabase } from '../supabase';
import GameCard from '../components/GameCard.vue';

export default {
  components: { LibraryToolbar, LibraryStatusFilters, LibraryShareButton, TcgShareToggle, LoadingCardGrid,
    GameCard
  },
  setup() {
    const userStore = useUserStore();
    const cardSizeStore = useCardSizeStore();
    const themeStore = useThemeStore();
    const libraryUiStore = useLibraryUiStore();
    const route = useRoute();
    const router = useRouter();
    const gamesApi = useGamesApi();

    const loading = ref(true);
    const error = ref(null);
    const games = ref([]);
    const apiGameDetails = ref(null);
    const sortField = ref(libraryUiStore.sortField);
    const sortOrder = ref(libraryUiStore.sortOrder);
    const activeFilter = ref(libraryUiStore.activeFilter);
    const filterDropdownLabel = ref(null);
    const searchQuery = ref(libraryUiStore.searchQuery);
    const existingGameId = ref(null);
    const gridEnd = ref(null);
    const visibleCount = ref(40);
    let requestId = 0;

    const isApiGame = computed(() => !!route.query.api_id);

    const fetchApiGameDetails = async (apiId) => {
      loading.value = true;
      error.value = null;
      existingGameId.value = null;
      try {
        apiGameDetails.value = await gamesApi.getGameDetails(apiId);

        if (userStore.isLoggedIn && userStore.user?.id) {
          const { data } = await supabase
            .from('games')
            .select('id')
            .eq('user_id', userStore.user.id)
            .eq('game_api_id', apiId)
            .single();
            
          if (data) {
            existingGameId.value = data.id;
          }
        }
      } catch (err) {
        console.error('Greška pri dohvaćanju API igre:', err);
        error.value = t('games.couldntLoadTheGameDetails');
      } finally {
        loading.value = false;
      }
    };

    const fetchGames = async (force = false) => {
      if (!userStore.isLoggedIn || !userStore.user?.id) {
        loading.value = false;
        return;
      }

      const userId = userStore.user.id;
      const id = ++requestId;
      const cached = !force && getFreshGames(userId);
      if (cached) games.value = cached;
      loading.value = !cached && (!force || loading.value);
      error.value = null;

      try {
        const data = cached || await getCachedGames(supabase, userId, { force: true });
        if (id === requestId && userId === userStore.user?.id && !isApiGame.value) games.value = data;
      } catch (err) {
        if (id !== requestId || userId !== userStore.user?.id || isApiGame.value) return;
        console.error('Greška pri dohvaćanju igara:', err);
        error.value = t('games.couldntLoadTheGamesTry');
        games.value = [];
      } finally {
        if (id === requestId && !isApiGame.value) {
          loading.value = false;
          restoreScrollIfNeeded();
        }
      }
    };

    const changeSort = (value) => {
      const [field, order] = value.split(':');
      sortGames(field, order);
    };

    const sortGames = (field, order) => {
      sortField.value = field;
      sortOrder.value = order;
      libraryUiStore.saveViewState({ field, order });
    };

    const filterGames = (filter) => {
      activeFilter.value = filter;
      libraryUiStore.saveViewState({ filter });
    };

    const filteredGames = computed(() => {
      let filtered;

      // Filtriraj po statusu/ocjeni
      switch (activeFilter.value) {
        case 'playing':
        case 'current':
          filtered = games.value.filter(game => game.status === 'playing');
          break;
        case 'completed':
          filtered = games.value.filter(game => game.status === 'completed');
          break;
        case 'backlog':
          filtered = games.value.filter(game => game.status === 'backlog');
          break;
        case 'dropped':
          filtered = games.value.filter(game => game.status === 'dropped');
          break;
        case 'paused':
          filtered = games.value.filter(game => game.status === 'paused');
          break;
        case 'wishlist':
          filtered = games.value.filter(game => game.status === 'wishlist');
          break;
        case 'rated-5':
          filtered = games.value.filter(game => game.rating === 5);
          break;
        case 'rated-4':
          filtered = games.value.filter(game => game.rating >= 4);
          break;
        default:
          filtered = games.value;
      }

      // Filtriraj po search query
      if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase();
        filtered = filtered.filter(game => 
          game.title.toLowerCase().includes(query) ||
          game.genre?.toLowerCase().includes(query) ||
          game.publisher?.toLowerCase().includes(query) ||
          game.platform?.toLowerCase().includes(query)
        );
      }

      filtered = [...filtered].sort((a, b) => {
        const field = sortField.value;
        if (a[field] == null && b[field] != null) return 1;
        if (a[field] != null && b[field] == null) return -1;
        let result;
        if (field === 'title') result = String(a.title).localeCompare(String(b.title), 'hr', { numeric: true });
        else if (field === 'created_at') result = String(a[field] || '').localeCompare(String(b[field] || ''));
        else result = (Number(a[field]) || 0) - (Number(b[field]) || 0);
        if (result === 0) return String(a.id).localeCompare(String(b.id));
        return sortOrder.value === 'desc' ? -result : result;
      });

      return filtered;
    });
    const visibleGames = computed(() => libraryUiStore.shouldRestore || typeof IntersectionObserver === 'undefined'
      ? filteredGames.value
      : filteredGames.value.slice(0, visibleCount.value));
    const showMoreGames = () => { visibleCount.value += 40; };

    watch([activeFilter, searchQuery, sortField, sortOrder], () => { visibleCount.value = 40; });
    watch(gridEnd, (element, oldElement, onCleanup) => {
      if (!element || typeof IntersectionObserver === 'undefined') return;
      const observer = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) showMoreGames();
      }, { rootMargin: '240px' });
      observer.observe(element);
      onCleanup(() => observer.disconnect());
    }, { flush: 'post' });

    const refreshOnVisible = () => {
      const userId = userStore.user?.id;
      if (document.visibilityState === 'visible' && !isApiGame.value && userId
        && !getFreshGames(userId, { maxAge: 60_000, requireRealtime: false })) {
        void fetchGames(true);
      }
    };
    const stopInvalidation = onGamesInvalidated(userId => {
      if (!isApiGame.value && userStore.user?.id === userId) void fetchGames(true);
    });

    const rememberScroll = () => libraryUiStore.markForRestore(window.scrollY);

    const navigateToGame = (id) => {
      libraryUiStore.markForRestore(window.scrollY);
      router.push(`/game/${id}`);
    };

    const goBack = () => {
      router.push('/games');
    };

    const navigateToAddGame = (apiId) => {
      router.push({
        path: '/add-game',
        query: { api_id: apiId }
      });
    };

    watch(() => route.query.api_id, (newApiId) => {
      if (newApiId) {
        fetchApiGameDetails(newApiId);
      } else {
        apiGameDetails.value = null;
        fetchGames();
      }
    }, { immediate: false });

    watch(() => route.query.filter, (newFilter) => {
      if (newFilter && newFilter !== activeFilter.value) {
        activeFilter.value = newFilter;
        libraryUiStore.saveViewState({ filter: newFilter });
      }
    }, { immediate: false });

    watch(searchQuery, (newQuery) => {
      libraryUiStore.saveViewState({ search: newQuery });
    });

    // Vrati scroll nakon povratka iz detalja igre (tek kad je lista renderirana)
    const restoreScrollIfNeeded = () => {
      if (!libraryUiStore.shouldRestore) return;
      if (libraryUiStore.savedScrollY) visibleCount.value = Math.max(visibleCount.value, filteredGames.value.length);
      const y = libraryUiStore.consumeRestore();
      if (isApiGame.value || !y) return;
      nextTick(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            window.scrollTo(0, y);
          });
        });
      });
    };

    // Spremi scroll ako se ide u detalje igre (pokriva i browser back/geste)
    onBeforeRouteLeave((to) => {
      if (['game-details', 'edit-game', 'api-game-details'].includes(to.name)) {
        libraryUiStore.markForRestore(window.scrollY);
      }
    });

    onMounted(() => {
      document.addEventListener('visibilitychange', refreshOnVisible);
      if (route.query.filter) {
        activeFilter.value = route.query.filter;
        libraryUiStore.saveViewState({ filter: route.query.filter });
      }
      if (route.query.api_id) {
        fetchApiGameDetails(route.query.api_id);
      } else {
        fetchGames();
      }
    });
    onUnmounted(() => {
      requestId++;
      stopInvalidation();
      document.removeEventListener('visibilitychange', refreshOnVisible);
    });

    return {
      loading,
      error,
      games,
      apiGameDetails,
      isApiGame,
      sortField,
      sortOrder,
      activeFilter,
      filteredGames,
      visibleGames,
      gridEnd,
      showMoreGames,
      sortGames,
      changeSort,
      filterGames,
      navigateToGame,
      rememberScroll,
      navigateToAddGame,
      goBack,
      userStore,
      cardSizeStore,
      themeStore,
      libraryUiStore,
      filterDropdownLabel,
      searchQuery,
      existingGameId
    };
  }
};
</script>
