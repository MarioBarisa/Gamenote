<!-- src/views/Home.vue -->
<template>
  <div class="home">
    <!-- Hero sekcija -->
    <section class="hero py-12 bg-base-300 rounded-box mb-10">
      <div class="text-center">
        <h1 class="text-5xl font-bold mb-4">Gamenote</h1>
        <p class="text-xl mb-6">Prati, dijeli i otkrivaj svoje omiljene videoigre</p>
        <router-link to="/add-game" class="btn btn-primary btn-lg">Dodaj svoju prvu igru</router-link>
      </div>
    </section>

    <!-- Trenutno igraš -->
    <section v-if="currentlyPlaying.length > 0" class="mb-12">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-3xl font-bold">Trenutno igraš</h2>
        <router-link to="/games?filter=current" class="btn btn-sm btn-ghost">Prikaži sve</router-link>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        <div v-for="game in currentlyPlaying.slice(0, 5)" :key="game.id" @click="navigateToGame(game.id)" class="cursor-pointer">
          <GameCard :game="game" />
        </div>
      </div>
    </section>

    <!-- Popularne igre -->
    <section class="mb-12">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-3xl font-bold">Popularne igre</h2>
        <router-link to="/games?filter=popular" class="btn btn-sm btn-ghost">Prikaži sve</router-link>
      </div>
      <div v-if="loading" class="flex justify-center py-12">
        <span class="loading loading-spinner loading-lg"></span>
      </div>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        <div v-for="game in popularGames.slice(0, 5)" :key="game.id" class="cursor-pointer" @click="navigateToGame(game.id)">
          <GameCard :game="game" />
        </div>
      </div>
    </section>

    <!-- Nedavno dodane -->
    <section class="mb-12">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-3xl font-bold">Nedavno dodane</h2>
        <router-link to="/games?filter=recent" class="btn btn-sm btn-ghost">Prikaži sve</router-link>
      </div>
      <div v-if="loading" class="flex justify-center py-12">
        <span class="loading loading-spinner loading-lg"></span>
      </div>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        <div v-for="game in recentGames.slice(0, 5)" :key="game.id" class="cursor-pointer" @click="navigateToGame(game.id)">
          <GameCard :game="game" />
        </div>
      </div>
    </section>

    <!-- Najbolje ocijenjene -->
    <section class="mb-12">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-3xl font-bold">Najbolje ocijenjene</h2>
        <router-link to="/games?filter=top-rated" class="btn btn-sm btn-ghost">Prikaži sve</router-link>
      </div>
      <div v-if="loading" class="flex justify-center py-12">
        <span class="loading loading-spinner loading-lg"></span>
      </div>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        <div v-for="game in topRatedGames.slice(0, 5)" :key="game.id" class="cursor-pointer" @click="navigateToGame(game.id)">
          <GameCard :game="game" />
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../supabase';
import { useUserStore } from '../stores/user';
import GameCard from '../components/GameCard.vue';

export default {
  components: {
    GameCard
  },
  setup() {
    const userStore = useUserStore();
    const router = useRouter();
    
    const loading = ref(true);
    const currentlyPlaying = ref([]);
    const popularGames = ref([]);
    const recentGames = ref([]);
    const topRatedGames = ref([]);
    
    const fetchGames = async () => {
      loading.value = true;
      
      if (!userStore.user.value) {
        loading.value = false;
        return;
      }
      
      try {
        // Dohvati trenutno igrane igre
        const { data: currentGames } = await supabase
          .from('games')
          .select('*')
          .eq('user_id', userStore.user.value.id)
          .eq('currently_playing', true)
          .order('updated_at', { ascending: false });
        
        currentlyPlaying.value = currentGames || [];
        
        // Dohvati nedavno dodane igre
        const { data: recent } = await supabase
          .from('games')
          .select('*')
          .eq('user_id', userStore.user.value.id)
          .order('created_at', { ascending: false })
          .limit(10);
        
        recentGames.value = recent || [];
        
        // Dohvati najbolje ocijenjene igre
        const { data: topRated } = await supabase
          .from('games')
          .select('*')
          .eq('user_id', userStore.user.value.id)
          .order('rating', { ascending: false })
          .limit(10);
        
        topRatedGames.value = topRated || [];
        
        // Dohvati popularne igre (po vremenu igranja)
        const { data: popular } = await supabase
          .from('games')
          .select('*')
          .eq('user_id', userStore.user.value.id)
          .order('play_time', { ascending: false })
          .limit(10);
        
        popularGames.value = popular || [];
      } catch (error) {
        console.error('Greška pri dohvaćanju igara:', error);
      } finally {
        loading.value = false;
      }
    };
    
    const navigateToGame = (id) => {
      router.push(`/games/${id}`);
    };
    
    onMounted(async () => {
      await fetchGames();
    });
    
    return {
      loading,
      currentlyPlaying,
      popularGames,
      recentGames,
      topRatedGames,
      navigateToGame
    };
  }
};
</script>
