<template>
  <div class="games-list">
    <div v-if="isApiGame && apiGameDetails">
      <div class="flex items-center mb-6">
        <button @click="goBack" class="btn btn-ghost mr-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Natrag
        </button>

        <h1 class="text-4xl font-bold">{{ apiGameDetails.name }}</h1>
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
                  <p><strong>Datum izdavanja:</strong> {{ apiGameDetails.released || 'N/A' }}</p>
                  <p><strong>Metacritic ocjena:</strong> {{ apiGameDetails.metacritic || 'N/A' }}</p>
                  <p><strong>ESRB:</strong> {{ apiGameDetails.esrb_rating?.name || 'N/A' }}</p>
                </div>
                <div>
                  <p><strong>Žanrovi:</strong> {{ apiGameDetails.genres?.map(g => g.name).join(', ') || 'N/A' }}</p>
                  <p><strong>Platforme:</strong> {{ apiGameDetails.platforms?.map(p => p.platform.name).join(', ') ||
                    'N/A' }}</p>
                </div>
              </div>
              <div class="mb-6">
                <h3 class="text-lg font-bold mb-2">Opis</h3>
                <p class="text-sm">{{ apiGameDetails.description_raw || 'Nema opisa.' }}</p>
              </div>
              <div class="card-actions">
                <button @click="navigateToAddGame(apiGameDetails.id)" class="btn btn-primary">
                  Dodaj u moju kolekciju
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
          <h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold">Moje igre</h1>
        </div>

        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Pretraži svoju zbirku" 
          class="input input-bordered input-sm sm:input-md w-full md:w-80"
        />

        <div class="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full">
          <div class="dropdown dropdown-start w-full sm:w-auto">
            <label tabindex="0" class="btn btn-outline w-full sm:w-auto" ref="sortDropdownLabel">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:h-5 sm:w-5 mr-2" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
              Sortiraj
            </label>
            <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-200 rounded-box w-52"
              @click="closeDropdown('sort')">
              <li><a @click="sortGames('title', 'asc')">Naziv (A-Ž)</a></li>
              <li><a @click="sortGames('title', 'desc')">Naziv (Ž-A)</a></li>
              <li><a @click="sortGames('rating', 'desc')">Ocjena (najviša)</a></li>
              <li><a @click="sortGames('rating', 'asc')">Ocjena (najniža)</a></li>
              <li><a @click="sortGames('play_time', 'desc')">Vrijeme igranja (najviše)</a></li>
              <li><a @click="sortGames('created_at', 'desc')">Nedavno dodano</a></li>
            </ul>
          </div>

          <div class="dropdown dropdown-end w-full sm:w-auto">
            <label tabindex="0" class="btn btn-outline w-full sm:w-auto" ref="filterDropdownLabel">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:h-5 sm:w-5 mr-2" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Filtriraj
            </label>
            <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-200 rounded-box w-52"
              @click="closeDropdown('filter')">
              <li><a @click="filterGames('all')">Sve igre</a></li>
              <li><a @click="filterGames('current')">Trenutno igram</a></li>
              <li><a @click="filterGames('completed')">Završene</a></li>
              <li><a @click="filterGames('rated-5')">Ocjena 5/5</a></li>
              <li><a @click="filterGames('rated-4')">Ocjena 4/5 ili više</a></li>
            </ul>
          </div>

          <router-link to="/add-game" class="btn btn-primary w-full sm:w-auto">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Dodaj igru
          </router-link>
        </div>
      </div>

      <div v-if="loading" class="flex justify-center py-12">
        <span class="loading loading-spinner loading-lg"></span>
      </div>

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
        <h3 class="text-xl font-bold mb-2">Potrebna prijava</h3>
        <p class="text-gray-400 mb-6">Prijavi se da bi vidio svoje igre</p>
        <router-link to="/login" class="btn btn-primary">
          Prijavi se
        </router-link>
      </div>

      <div v-else-if="filteredGames.length > 0"
        :class="`grid ${cardSizeStore.getSizeConfig(cardSizeStore.cardSize).container} ${cardSizeStore.getSizeConfig(cardSizeStore.cardSize).gap}`">
        <div v-for="game in filteredGames" :key="game.id" @click="navigateToGame(game.id)" class="cursor-pointer">
          <GameCard :game="game" />
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
          {{ activeFilter.value !== 'all' ? 'Nema igara za odabrani filter' : 'Nema igara za prikaz' }}
        </h3>
        <p class="text-gray-400 mb-6">
          {{ activeFilter.value !== 'all' ? 'Pokušaj promijeniti filter' : 'Dodaj svoju prvu igru da bi se prikazala ovdje' }}
        </p>
        <button v-if="activeFilter.value !== 'all'" @click="filterGames('all')" class="btn btn-outline mr-2">
          Poništi filter
        </button>
        <router-link to="/add-game" class="btn btn-primary">
          Dodaj igru
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';
import { useCardSizeStore } from '../stores/cardSize';
import { useGamesApi } from '../services/gamesApi';
import { supabase } from '../supabase';
import GameCard from '../components/GameCard.vue';

export default {
  components: {
    GameCard
  },
  setup() {
    const userStore = useUserStore();
    const cardSizeStore = useCardSizeStore();
    const route = useRoute();
    const router = useRouter();
    const gamesApi = useGamesApi();

    const loading = ref(true);
    const error = ref(null);
    const games = ref([]);
    const apiGameDetails = ref(null);
    const sortField = ref('created_at');
    const sortOrder = ref('desc');
    const activeFilter = ref('all');
    const sortDropdownLabel = ref(null);
    const filterDropdownLabel = ref(null);
    const searchQuery = ref('');

    const isApiGame = computed(() => !!route.query.api_id);

    const fetchApiGameDetails = async (apiId) => {
      loading.value = true;
      error.value = null;
      try {
        const details = await gamesApi.getGameDetails(apiId);
        apiGameDetails.value = details;
      } catch (err) {
        console.error('Greška pri dohvaćanju API igre:', err);
        error.value = 'Greška pri učitavanju detalja igre. Pokušaj ponovno.';
      } finally {
        loading.value = false;
      }
    };

    const fetchGames = async () => {
      if (!userStore.isLoggedIn || !userStore.user?.id) {
        loading.value = false;
        return;
      }

      loading.value = true;
      error.value = null;

      try {
        const userId = userStore.user.id;

        const { data, error: fetchError } = await supabase
          .from('games')
          .select('*')
          .eq('user_id', userId)
          .order(sortField.value, { ascending: sortOrder.value === 'asc' });

        if (fetchError) throw fetchError;

        games.value = data || [];
      } catch (err) {
        console.error('Greška pri dohvaćanju igara:', err);
        error.value = 'Greška pri učitavanju igara. Pokušaj ponovno.';
        games.value = [];
      } finally {
        loading.value = false;
      }
    };

    const sortGames = (field, order) => {
      sortField.value = field;
      sortOrder.value = order;
      fetchGames();
    };

    const filterGames = (filter) => {
      activeFilter.value = filter;
    };

    const closeDropdown = (type) => {
      const labelRef = type === 'sort' ? sortDropdownLabel : filterDropdownLabel;
      if (labelRef.value) {
        labelRef.value.blur();
        document.activeElement?.blur();
      }
    };

    const filteredGames = computed(() => {
      let filtered = games.value;

      // Filtriraj po statusu/ocjeni
      switch (activeFilter.value) {
        case 'playing':
        case 'current':
          filtered = games.value.filter(game => game.status === 'playing');
          break;
        case 'completed':
          filtered = games.value.filter(game => game.status === 'completed');
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

      return filtered;
    });

    const navigateToGame = (id) => {
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
      }
    }, { immediate: false });

  
    onMounted(() => {
      if (route.query.filter) {
        activeFilter.value = route.query.filter;
      }
      if (route.query.api_id) {
        fetchApiGameDetails(route.query.api_id);
      } else {
        fetchGames();
      }
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
      sortGames,
      filterGames,
      closeDropdown,
      navigateToGame,
      navigateToAddGame,
      goBack,
      userStore,
      cardSizeStore,
      sortDropdownLabel,
      filterDropdownLabel,
      searchQuery
    };
  }
};
</script>
