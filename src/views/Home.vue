<!-- src/views/Home.vue -->
<template>
  <div class="home">
  <!-- Hero dio -->
  <section v-if="!userStore.isLoggedIn" class="hero py-8 sm:py-12 bg-base-300 rounded-box mb-6 sm:mb-10">
      <div class="text-center px-4">
        <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">Gamenote</h1>
        <p class="text-lg sm:text-xl mb-6">Prati, dijeli i otkrivaj svoje omiljene videoigre</p>
        <router-link to="/add-game" class="btn btn-primary btn-md sm:btn-lg">Dodaj svoju prvu igru</router-link>
      </div>
    </section>

    <section v-if="userStore.isLoggedIn" class="hero py-8 sm:py-12 bg-base-300 rounded-box mb-6 sm:mb-10">
      <gameN></gameN>
    </section>
    <!-- Trenutno igraš -> samo za ulogirane -->
    <section v-if="userStore.isLoggedIn && currentlyPlaying.length > 0" class="mb-8 sm:mb-12">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-2">
        <h2 class="text-2xl sm:text-3xl font-bold">Trenutno igraš</h2>
        <router-link to="/library?filter=current" class="btn btn-sm btn-ghost">Prikaži sve</router-link>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6">
        <div v-for="game in currentlyPlaying.slice(0, 5)" :key="game.id" @click="navigateToUserGame(game.id)" class="cursor-pointer">
          <GameCard :game="game" />
        </div>
      </div>
    </section>
    <!-- Popularne igre - za sve korisnike , RAWG API 
    <section class="mb-8 sm:mb-12">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-2">
        <h2 class="text-2xl sm:text-3xl font-bold">Popularne igre (zadnja godina)</h2>
        <a href="https://rawg.io" target="_blank" class="btn btn-sm btn-ghost">Powered by RAWG</a>
      </div>
      <div v-if="loading" class="flex justify-center py-8 sm:py-12">
        <span class="loading loading-spinner loading-lg"></span>
      </div>
      <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-4 md:gap-6">
        <div v-for="game in popularGames" :key="game.id" class="cursor-pointer" @click="navigateToApiGame(game.id)">
          <div class="card bg-base-100 shadow-xl h-full">
            <figure v-if="game.background_image" class="h-32 sm:h-40">
              <img :src="game.background_image" :alt="game.name" class="w-full h-full object-cover">
            </figure>
            <div class="card-body p-2 sm:p-4">
              <h3 class="card-title text-sm sm:text-md">{{ game.name }}</h3>
              <p class="text-xs sm:text-sm opacity-70">
                <span v-if="game.metacritic" class="badge badge-success text-xs">{{ game.metacritic }}% Metacritic</span>
                <span v-else>Bez ocene</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>-->

    <!-- Nedavno objavljene - za sve korisnike, RAWG API 
    <section class="mb-12">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-3xl font-bold">Nedavno objavljene</h2>
        <a href="https://rawg.io" target="_blank" class="btn btn-sm btn-ghost">Powered by RAWG</a>
      </div>
      <div v-if="loading" class="flex justify-center py-12">
        <span class="loading loading-spinner loading-lg"></span>
      </div>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
        <div v-for="game in recentGames" :key="game.id" class="cursor-pointer" @click="navigateToApiGame(game.id)">
          <div class="card bg-base-100 shadow-xl h-full">
            <figure v-if="game.background_image" class="h-40">
              <img :src="game.background_image" :alt="game.name" class="w-full h-full object-cover">
            </figure>
            <div class="card-body p-4">
              <h3 class="card-title text-md">{{ game.name }}</h3>
              <p class="text-sm opacity-70">Objavljeno: {{ formatDate(game.released) }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>-->
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../supabase';
import { useUserStore } from '../stores/user';
import { useGamesApi } from '../services/gamesApi';
import GameCard from '../components/GameCard.vue';
import gameN from '../components/gameN.vue';

export default {
  components: {
    GameCard,
    gameN
  },
  setup() {
    const userStore = useUserStore();
    const router = useRouter();
    const gamesApi = useGamesApi();
    
    const loading = ref(true);
    const currentlyPlaying = ref([]);
    const popularGames = ref([]);
    const recentGames = ref([]);
    
    const fetchUserGames = async () => {
      // Ako korisnik nije prijavljen, ne dohvaćaj korisničke igre
      if (!userStore.isLoggedIn || !userStore.user) {
        return;
      }
      
      try {
        const userId = userStore.user.id;
        
        // Dohvati samo trenutno igrane igre iz baze
        const { data: currentGames, error } = await supabase
          .from('games')
          .select('*')
          .eq('user_id', userId)
          .eq('currently_playing', true)
          .order('updated_at', { ascending: false });
        
        currentlyPlaying.value = currentGames || [];
      } catch (error) {
        console.error('Greška pri dohvaćanju korisničkih igara:', error);
      }
    };
    
    const fetchApiGames = async () => {
      loading.value = true;
      
      try {
        // Dohvati popularne igre s RAWG API-ja -> NERADI DOBRO ZATO COMMENT
        const popularnigre = await gamesApi.getPopularGames();
        popularGames.value = popularnigre;
        
        // Dohvati nedavno objavljene igre s RAWG API-ja -> NERADI DOBRO ZATO COMMENT
        const nedavnigre = await gamesApi.getRecentGames();
        recentGames.value = nedavnigre;
      } catch (error) {
        console.error('Greška pri dohvaćanju API igara:', error);
      } finally {
        loading.value = false;
      }
    };
    
    const navigateToUserGame = (id) => {
      router.push(`/game/${id}`);
    };
    
    const navigateToApiGame = (id) => {
      // Preusmjeri na API game details view
      router.push(`/api-games/${id}`);
    };
    
    const formatDate = (dateString) => {
      if (!dateString) return 'Nepoznat datum';
      return new Date(dateString).toLocaleDateString('hr-HR');
    };
    
    onMounted(async () => {
      await fetchUserGames();
      await fetchApiGames();
    });
    
    return {
      userStore,
      loading,
      currentlyPlaying,
      popularGames,
      recentGames,
      navigateToUserGame,
      navigateToApiGame,
      formatDate
    };
  }
};
</script>
