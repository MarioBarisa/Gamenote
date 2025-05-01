// src/views/Home.vue
<template>
  <div class="home">
    <div v-if="!userStore.isLoggedIn" class="hero min-h-[70vh] bg-base-200">
      <div class="hero-content text-center">
        <div class="max-w-md">
          <h1 class="text-5xl font-bold">Gamenote</h1>
          <p class="py-6">Dobrodošli u Gamenote - vašu osobnu biblioteku videoigara. Pratite igre koje ste odigrali, koliko vremena ste proveli igrajući, i pogledajte statistike vaše kolekcije.</p>
          <router-link to="/login" class="btn btn-primary">Započni</router-link>
        </div>
      </div>
    </div>
    
    <div v-else>
      <h1 class="text-3xl font-bold mb-6">Vaša kolekcija igara</h1>
      
      <div class="tabs tabs-boxed mb-4">
        <a class="tab" :class="{ 'tab-active': activeTab === 'all' }" 
           @click="activeTab = 'all'">Sve igre</a>
        <a class="tab" :class="{ 'tab-active': activeTab === 'playing' }" 
           @click="activeTab = 'playing'">Trenutno igram</a>
        <a class="tab" :class="{ 'tab-active': activeTab === 'completed' }" 
           @click="activeTab = 'completed'">Završene</a>
      </div>
      
      <div v-if="loading" class="flex justify-center my-8">
        <span class="loading loading-spinner loading-lg"></span>
      </div>
      
      <div v-else-if="games.length === 0" class="text-center my-8">
        <p class="text-xl">Nema igara za prikaz</p>
        <router-link to="/add-game" class="btn btn-primary mt-4">Dodaj prvu igru</router-link>
      </div>
      
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <GameCard 
          v-for="game in filteredGames" 
          :key="game.id" 
          :game="game" 
          @click="navigateToGameDetails(game.id)" 
        />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';
import { supabase } from '../supabase';
import GameCard from '../components/GameCard.vue';

export default {
  components: {
    GameCard
  },
  setup() {
    const userStore = useUserStore();
    const router = useRouter();
    const games = ref([]);
    const loading = ref(false);
    const activeTab = ref('all');
    
    const fetchGames = async () => {
      if (!userStore.user.value) return;
      
      loading.value = true;
      
      try {
        const { data, error } = await supabase
          .from('games')
          .select('*')
          .eq('user_id', userStore.user.value.id);
          
        if (error) throw error;
        
        games.value = data || [];
      } catch (error) {
        console.error('Greška pri dohvaćanju igara:', error);
      } finally {
        loading.value = false;
      }
    };
    
    const filteredGames = computed(() => {
      if (activeTab.value === 'all') {
        return games.value;
      } else if (activeTab.value === 'playing') {
        return games.value.filter(game => game.currently_playing);
      } else {
        return games.value.filter(game => !game.currently_playing && game.end_date);
      }
    });
    
    const navigateToGameDetails = (id) => {
      router.push(`/games/${id}`);
    };
    
    onMounted(fetchGames);
    
    return {
      userStore,
      games,
      loading,
      activeTab,
      filteredGames,
      navigateToGameDetails
    };
  }
};
</script>
