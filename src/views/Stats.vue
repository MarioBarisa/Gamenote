<!-- src/views/Stats.vue -->
<template>
    <div class="stats-page">
      <h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-8 text-center">Statistika igranja</h1>
      
      <div v-if="loading" class="flex justify-center py-8 sm:py-12">
        <span class="loading loading-spinner loading-lg"></span>
      </div>
      
      <div v-else>
      <!-- SAŽETAK STATS -->
        <div class="stats shadow w-full mb-6 sm:mb-8 text-center">
          <div class="stat">
            <div class="stat-title text-xs sm:text-sm">Ukupno igara</div>
            <div class="stat-value text-2xl sm:text-3xl">{{ games.length }}</div>
          </div>
          
          <div class="stat">
            <div class="stat-title text-xs sm:text-sm">Ukupno sati igranja</div>
            <div class="stat-value text-2xl sm:text-3xl">{{ totalPlayTime }}</div>
          </div>
          
          <div class="stat">
            <div class="stat-title text-xs sm:text-sm">Prosječna ocjena</div>
            <div class="stat-value text-2xl sm:text-3xl">{{ averageRating }}/5</div>
          </div>
          
          <div class="stat">
            <div class="stat-title text-xs sm:text-sm">Trenutno igram</div>
            <div class="stat-value text-2xl sm:text-3xl">{{ playingCount }}</div>
          </div>
          <div class="stat">
            <div class="stat-title text-xs sm:text-sm">Završene igre</div>
            <div class="stat-value text-2xl sm:text-3xl">{{ completedCount }}</div>
          </div>
          <div class="stat">
            <div class="stat-title text-xs sm:text-sm">Prosječan napredak (%)</div>
            <div class="stat-value text-2xl sm:text-3xl">{{ averageCompletion }}</div>
          </div>
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 mb-6 sm:mb-8">
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
              <table class="table table-compact w-full text-sm">
                <thead>
                  <tr>
                    <th class="text-xs sm:text-sm">Igra</th>
                    <th class="text-xs sm:text-sm">Ocjena</th>
                    <th class="hidden sm:table-cell text-xs sm:text-sm">Vrijeme igranja</th>
                    <th class="hidden md:table-cell text-xs sm:text-sm">Platforma</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="game in topRatedGames" :key="game.id" class="cursor-pointer hover:bg-base-300" @click="navigateToGame(game.id)">
                    <td class="text-xs sm:text-sm">
                      <div class="truncate max-w-32 sm:max-w-none">{{ game.title }}</div>
                      <div class="text-xs opacity-70 sm:hidden">{{ game.play_time }}h • {{ game.platform }}</div>
                    </td>
                    <td>
                      <div class="flex">
                        <template v-for="star in 5" :key="`top-${game.id}-${star}`">
                          <svg class="w-3 h-3" 
                               :class="star <= (game.rating || 0) ? 'text-orange-400' : 'text-gray-400'"
                               fill="currentColor" 
                               viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                          </svg>
                        </template>
                      </div>
                    </td>
                    <td class="hidden sm:table-cell text-xs sm:text-sm">{{ game.play_time }} sati</td>
                    <td class="hidden md:table-cell text-xs sm:text-sm">{{ game.platform }}</td>
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
              <table class="table table-compact w-full text-sm">
                <thead>
                  <tr>
                    <th class="text-xs sm:text-sm">Igra</th>
                    <th class="text-xs sm:text-sm">Vrijeme igranja</th>
                    <th class="hidden sm:table-cell text-xs sm:text-sm">Ocjena</th>
                    <th class="hidden md:table-cell text-xs sm:text-sm">Platforma</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="game in mostPlayedGames" :key="game.id" class="cursor-pointer hover:bg-base-300" @click="navigateToGame(game.id)">
                    <td class="text-xs sm:text-sm">
                      <div class="truncate max-w-32 sm:max-w-none">{{ game.title }}</div>
                      <div class="text-xs opacity-70 sm:hidden flex items-center gap-1">
                        <div class="flex">
                          <template v-for="star in 5" :key="`mobile-${game.id}-${star}`">
                            <svg class="w-2 h-2" 
                                 :class="star <= (game.rating || 0) ? 'text-orange-400' : 'text-gray-400'"
                                 fill="currentColor" 
                                 viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                            </svg>
                          </template>
                        </div>
                        <span>• {{ game.platform }}</span>
                      </div>
                    </td>
                    <td class="text-xs sm:text-sm">{{ game.play_time }} sati</td>
                    <td class="hidden sm:table-cell">
                      <div class="flex">
                        <template v-for="star in 5" :key="`played-${game.id}-${star}`">
                          <svg class="w-3 h-3" 
                               :class="star <= (game.rating || 0) ? 'text-orange-400' : 'text-gray-400'"
                               fill="currentColor" 
                               viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                          </svg>
                        </template>
                      </div>
                    </td>
                    <td class="hidden md:table-cell text-xs sm:text-sm">{{ game.platform }}</td>
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
  import { computePercent } from '../constants/progressModes';
  
  export default {
    setup() {
      const userStore = useUserStore();
      const router = useRouter();
      
      const loading = ref(true);
      const games = ref([]);
      
      const fetchGames = async () => {
        loading.value = true;
        if (!userStore.user) {
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
        } catch (error) {
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
      
      const playingCount = computed(() => {
        return games.value.filter(game => game.status === 'playing').length;
      });

      const completedCount = computed(() => {
        return games.value.filter(game => game.status === 'completed').length;
      });

      const gamePercent = (game) => {
        return computePercent({
          progress_mode: game.progress_mode,
          progress_value: game.progress_value,
          progress_total: game.progress_total,
          achievement_percent: game.achievement_percent
        });
      };

      const averageCompletion = computed(() => {
        const percents = games.value
          .map(gamePercent)
          .filter(p => typeof p === 'number');
        if (percents.length === 0) return 0;
        const sum = percents.reduce((a, b) => a + b, 0);
        return Math.round(sum / percents.length);
      });
      
      const genreCounts = computed(() => {
        const counts = {};
        
        games.value.forEach(game => {
          if (!game.genre) return;
          
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
        router.push(`/game/${id}`);
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
        playingCount,
        completedCount,
        averageCompletion,
        genreCounts,
        platformCounts,
        topRatedGames,
        mostPlayedGames,
        navigateToGame
      };
    }
  };
  </script>
