<!-- src/views/Games.vue -->
<template>
    <div class="games-list">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 class="text-4xl font-bold">Moje igre</h1>
        
        <div class="flex flex-col sm:flex-row gap-3">
          <div class="dropdown dropdown-end">
            <label tabindex="0" class="btn btn-outline">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
              Sortiraj
            </label>
            <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-200 rounded-box w-52">
              <li><a @click="sortGames('title', 'asc')">Naziv (A-Ž)</a></li>
              <li><a @click="sortGames('title', 'desc')">Naziv (Ž-A)</a></li>
              <li><a @click="sortGames('rating', 'desc')">Ocjena (najviša)</a></li>
              <li><a @click="sortGames('rating', 'asc')">Ocjena (najniža)</a></li>
              <li><a @click="sortGames('play_time', 'desc')">Vrijeme igranja (najviše)</a></li>
              <li><a @click="sortGames('created_at', 'desc')">Nedavno dodano</a></li>
            </ul>
          </div>
          
          <div class="dropdown dropdown-end">
            <label tabindex="0" class="btn btn-outline">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Filtriraj
            </label>
            <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-200 rounded-box w-52">
              <li><a @click="filterGames('all')">Sve igre</a></li>
              <li><a @click="filterGames('current')">Trenutno igram</a></li>
              <li><a @click="filterGames('completed')">Završene</a></li>
              <li><a @click="filterGames('rated-5')">Ocjena 5/5</a></li>
              <li><a @click="filterGames('rated-4')">Ocjena 4/5 ili više</a></li>
            </ul>
          </div>
          
          <router-link to="/add-game" class="btn btn-primary">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Dodaj igru
          </router-link>
        </div>
      </div>
      
      <div v-if="loading" class="flex justify-center py-12">
        <span class="loading loading-spinner loading-lg"></span>
      </div>
      
      <div v-else-if="filteredGames.length > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        <div v-for="game in filteredGames" :key="game.id" @click="navigateToGame(game.id)" class="cursor-pointer">
          <GameCard :game="game" />
        </div>
      </div>
      
      <div v-else class="text-center py-12">
        <div class="mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 2a10 10 0 110 20 10 10 0 010-20z" />
          </svg>
        </div>
        <h3 class="text-xl font-bold mb-2">Nema igara za prikaz</h3>
        <p class="text-gray-400 mb-6">Dodaj svoju prvu igru da bi se prikazala ovdje</p>
        <router-link to="/add-game" class="btn btn-primary">
          Dodaj igru
        </router-link>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, computed, onMounted, watch } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useUserStore } from '../stores/user';
  import { supabase } from '../supabase';
  import GameCard from '../components/GameCard.vue';
  
  export default {
    components: {
      GameCard
    },
    setup() {
      const userStore = useUserStore();
      const route = useRoute();
      const router = useRouter();
      
      const loading = ref(true);
      const games = ref([]);
      const sortField = ref('created_at');
      const sortOrder = ref('desc');
      const activeFilter = ref('all');
      
      const fetchGames = async () => {
        loading.value = true;
        
        if (!userStore.user.value) {
          loading.value = false;
          return;
        }
        
        try {
          const { data, error } = await supabase
            .from('games')
            .select('*')
            .eq('user_id', userStore.user.value.id)
            .order(sortField.value, { ascending: sortOrder.value === 'asc' });
            
          if (error) throw error;
          
          games.value = data || [];
        } catch (error) {
          console.error('Greška pri dohvaćanju igara:', error);
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
      
      const filteredGames = computed(() => {
        if (activeFilter.value === 'all') {
          return games.value;
        } else if (activeFilter.value === 'current') {
          return games.value.filter(game => game.currently_playing);
        } else if (activeFilter.value === 'completed') {
          return games.value.filter(game => game.end_date && !game.currently_playing);
        } else if (activeFilter.value === 'rated-5') {
          return games.value.filter(game => game.rating === 5);
        } else if (activeFilter.value === 'rated-4') {
          return games.value.filter(game => game.rating >= 4);
        }
        return games.value;
      });
      
      const navigateToGame = (id) => {
        router.push(`/games/${id}`);
      };
      
      // Provjeri URL parametre za filtriranje
      watch(route, (newRoute) => {
        if (newRoute.query.filter) {
          activeFilter.value = newRoute.query.filter;
        }
      });
      
      onMounted(() => {
        if (route.query.filter) {
          activeFilter.value = route.query.filter;
        }
        fetchGames();
      });
      
      return {
        loading,
        games,
        sortField,
        sortOrder,
        activeFilter,
        filteredGames,
        sortGames,
        filterGames,
        navigateToGame
      };
    }
  };
  </script>
  