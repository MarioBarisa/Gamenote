<!-- src/views/Stats.vue -->
<template>
    <div class="stats-page">
      <h1 class="text-4xl font-bold mb-8 text-center">Statistika igranja</h1>
      
      <div v-if="loading" class="flex justify-center py-12">
        <span class="loading loading-spinner loading-lg"></span>
      </div>
      
      <div v-else>
        <!-- Sažetak statistike -->
        <div class="stats shadow w-full mb-8">
          <div class="stat">
            <div class="stat-title">Ukupno igara</div>
            <div class="stat-value">{{ games.length }}</div>
          </div>
          
          <div class="stat">
            <div class="stat-title">Ukupno sati igranja</div>
            <div class="stat-value">{{ totalPlayTime }}</div>
          </div>
          
          <div class="stat">
            <div class="stat-title">Prosječna ocjena</div>
            <div class="stat-value">{{ averageRating }}/5</div>
          </div>
          
          <div class="stat">
            <div class="stat-title">Trenutno igram</div>
            <div class="stat-value">{{ currentlyPlaying.length }}</div>
          </div>
        </div>
        
        <!-- Grafovi i statistika -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <!-- Žanrovi igara -->
          <div class="card bg-base-200 shadow-xl">
            <div class="card-body">
              <h2 class="card-title text-2xl mb-4">Žanrovi</h2>
              
              <div class="overflow-x-auto">
                <table class="table w-full">
                  <thead>
                    <tr>
                      <th>Žanr</th>
                      <th>Broj igara</th>
                      <th>Postotak</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(count, genre) in genreCounts" :key="genre">
                      <td>{{ genre }}</td>
                      <td>{{ count }}</td>
                      <td>{{ Math.round((count / games.length) * 100) }}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          <!-- Platforme -->
          <div class="card bg-base-200 shadow-xl">
            <div class="card-body">
              <h2 class="card-title text-2xl mb-4">Platforme</h2>
              
              <div class="overflow-x-auto">
                <table class="table w-full">
                  <thead>
                    <tr>
                      <th>Platforma</th>
                      <th>Broj igara</th>
                      <th>Postotak</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(count, platform) in platformCounts" :key="platform">
                      <td>{{ platform }}</td>
                      <td>{{ count }}</td>
                      <td>{{ Math.round((count / games.length) * 100) }}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Top igre -->
        <div class="card bg-base-200 shadow-xl mb-8">
          <div class="card-body">
            <h2 class="card-title text-2xl mb-4">Najbolje ocijenjene igre</h2>
            
            <div class="overflow-x-auto">
              <table class="table w-full">
                <thead>
                  <tr>
                    <th>Igra</th>
                    <th>Ocjena</th>
                    <th>Vrijeme igranja</th>
                    <th>Platforma</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="game in topRatedGames" :key="game.id" class="cursor-pointer hover:bg-base-300" @click="navigateToGame(game.id)">
                    <td>{{ game.title }}</td>
                    <td>
                      <div class="rating rating-sm">
                        <input type="radio" name="rating-id-1" class="mask mask-star-2 bg-orange-400" :checked="game.rating >= 1" disabled />
                        <input type="radio" name="rating-id-1" class="mask mask-star-2 bg-orange-400" :checked="game.rating >= 2" disabled />
                        <input type="radio" name="rating-id-1" class="mask mask-star-2 bg-orange-400" :checked="game.rating >= 3" disabled />
                        <input type="radio" name="rating-id-1" class="mask mask-star-2 bg-orange-400" :checked="game.rating >= 4" disabled />
                        <input type="radio" name="rating-id-1" class="mask mask-star-2 bg-orange-400" :checked="game.rating >= 5" disabled />
                      </div>
                    </td>
                    <td>{{ game.play_time }} sati</td>
                    <td>{{ game.platform }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <!-- Najigraniji naslovi -->
        <div class="card bg-base-200 shadow-xl">
          <div class="card-body">
            <h2 class="card-title text-2xl mb-4">Najviše igrani naslovi</h2>
            
            <div class="overflow-x-auto">
              <table class="table w-full">
                <thead>
                  <tr>
                    <th>Igra</th>
                    <th>Vrijeme igranja</th>
                    <th>Ocjena</th>
                    <th>Platforma</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="game in mostPlayedGames" :key="game.id" class="cursor-pointer hover:bg-base-300" @click="navigateToGame(game.id)">
                    <td>{{ game.title }}</td>
                    <td>{{ game.play_time }} sati</td>
                    <td>
                      <div class="rating rating-sm">
                        <input type="radio" name="rating-id-2" class="mask mask-star-2 bg-orange-400" :checked="game.rating >= 1" disabled />
                        <input type="radio" name="rating-id-2" class="mask mask-star-2 bg-orange-400" :checked="game.rating >= 2" disabled />
                        <input type="radio" name="rating-id-2" class="mask mask-star-2 bg-orange-400" :checked="game.rating >= 3" disabled />
                        <input type="radio" name="rating-id-2" class="mask mask-star-2 bg-orange-400" :checked="game.rating >= 4" disabled />
                        <input type="radio" name="rating-id-2" class="mask mask-star-2 bg-orange-400" :checked="game.rating >= 5" disabled />
                      </div>
                    </td>
                    <td>{{ game.platform }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, computed, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { useUserStore } from '../stores/user';
  import { supabase } from '../supabase';
  
  export default {
    setup() {
      const userStore = useUserStore();
      const router = useRouter();
      
      const loading = ref(true);
      const games = ref([]);
      
      const fetchGames = async () => {
        loading.value = true;
        
        console.log('User store state:', userStore.user);
        
        if (!userStore.user) {
          console.log('User not found in store, aborting fetch');
          loading.value = false;
          return;
        }
        
        try {
          console.log('Fetching games for user ID:', userStore.user.id);
          const { data, error } = await supabase
            .from('games')
            .select('*')
            .eq('user_id', userStore.user.id);
            
          if (error) throw error;
          
          games.value = data || [];
          console.log('Fetched games:', games.value.length, 'items');
        } catch (error) {
          console.error('Greška pri dohvaćanju igara:', error);
        } finally {
          loading.value = false;
        }
      };
      
      const totalPlayTime = computed(() => {
        return games.value.reduce((total, game) => total + (game.play_time || 0), 0);
      });
      
      const averageRating = computed(() => {
        const gamesWithRating = games.value.filter(game => game.rating > 0);
        if (gamesWithRating.length === 0) return 0;
        
        const sum = gamesWithRating.reduce((total, game) => total + game.rating, 0);
        return (sum / gamesWithRating.length).toFixed(1);
      });
      
      const currentlyPlaying = computed(() => {
        return games.value.filter(game => game.currently_playing);
      });
      
      const genreCounts = computed(() => {
        const counts = {};
        
        games.value.forEach(game => {
          if (!game.genre) return;
          
          // Handling comma-separated genres
          const genres = game.genre.split(',').map(g => g.trim());
          
          genres.forEach(genre => {
            if (!counts[genre]) {
              counts[genre] = 0;
            }
            counts[genre]++;
          });
        });
        
        return Object.fromEntries(
          Object.entries(counts)
            .sort(([,a], [,b]) => b - a)
        );
      });
      
      const platformCounts = computed(() => {
        const counts = {};
        
        games.value.forEach(game => {
          if (!game.platform) return;
          
          if (!counts[game.platform]) {
            counts[game.platform] = 0;
          }
          counts[game.platform]++;
        });
        
        return Object.fromEntries(
          Object.entries(counts)
            .sort(([,a], [,b]) => b - a)
        );
      });
      
      const topRatedGames = computed(() => {
        return [...games.value]
          .filter(game => game.rating > 0)
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 5);
      });
      
      const mostPlayedGames = computed(() => {
        return [...games.value]
          .filter(game => game.play_time > 0)
          .sort((a, b) => b.play_time - a.play_time)
          .slice(0, 5);
      });
      
      const navigateToGame = (id) => {
        router.push(`/games/${id}`);
      };
      
      onMounted(async () => {
        await userStore.fetchUser();
        fetchGames();
      });
      
      return {
        loading,
        games,
        totalPlayTime,
        averageRating,
        currentlyPlaying,
        genreCounts,
        platformCounts,
        topRatedGames,
        mostPlayedGames,
        navigateToGame
      };
    }
  };
  </script>
  