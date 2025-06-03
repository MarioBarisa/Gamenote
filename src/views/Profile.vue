// src/views/Profile.vue
<template>
  <div class="profile">
    <h1 class="text-3xl font-bold mb-6">Profil</h1>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="col-span-1">
        <div class="card bg-base-200">
          <div class="card-body">
            <h2 class="text-xl mb-4">Osobni podaci</h2>
            
            <div class="avatar mb-4 flex justify-center">
              <div class="w-24 rounded-full">
                <img :src="profileImageUrl" alt="Profile" />
              </div>
            </div>
            
            <form @submit.prevent="updateProfile">
              <div class="form-control">
                <label class="label">Ime</label>
                <input type="text" v-model="profileForm.name" class="input input-bordered" required />
              </div>
              
              <div class="form-control mt-2">
                <label class="label">Email</label>
                <input type="email" :value="userStore.user?.email" class="input input-bordered" disabled />
              </div>
              
              <div class="form-control mt-4">
                <button type="submit" class="btn btn-primary" :disabled="updating">
                  <span v-if="updating" class="loading loading-spinner"></span>
                  <span v-else>Spremi promjene</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <div class="col-span-1 md:col-span-2">
        <div class="card bg-base-200">
          <div class="card-body">
            <h2 class="text-xl mb-4">Statistika</h2>
            
            <div v-if="loading" class="flex justify-center my-8">
              <span class="loading loading-spinner loading-lg"></span>
            </div>
            
            <div v-else>
              <div class="stats stats-vertical lg:stats-horizontal shadow w-full">
                <div class="stat">
                  <div class="stat-title">Ukupno igara</div>
                  <div class="stat-value">{{ statistics.totalGames }}</div>
                </div>
                
                <div class="stat">
                  <div class="stat-title">Trenutno igram</div>
                  <div class="stat-value">{{ statistics.currentlyPlaying }}</div>
                </div>
                
                <div class="stat">
                  <div class="stat-title">Završene igre</div>
                  <div class="stat-value">{{ statistics.completed }}</div>
                </div>
                
                <div class="stat">
                  <div class="stat-title">Ukupno vrijeme</div>
                  <div class="stat-value">{{ statistics.totalPlayTime }}h</div>
                </div>
              </div>
              
              <div class="mt-6">
                <h3 class="text-lg mb-2">Omiljeni žanrovi</h3>
                <canvas ref="genreChartRef" width="400" height="200"></canvas>
              </div>
              
              <div class="mt-6">
                <h3 class="text-lg mb-2">Igre po platformama</h3>
                <canvas ref="platformChartRef" width="400" height="200"></canvas>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue';
import { useUserStore } from '../stores/user';
import { supabase } from '../supabase';
import Chart from 'chart.js/auto';

export default {
  setup() {
    const userStore = useUserStore();
    const games = ref([]);
    const loading = ref(false);
    const updating = ref(false);
    const genreChartRef = ref(null);
    const platformChartRef = ref(null);
    let genreChart = null;
    let platformChart = null;
    
    const profileForm = reactive({
      name: userStore.user.value?.user_metadata?.name || ''
    });
    
    const profileImageUrl = computed(() => {
      return userStore.user.value?.user_metadata?.avatar_url || 'https://i.pravatar.cc/300';
    });
    
    const statistics = computed(() => {
      if (!games.value.length) {
        return {
          totalGames: 0,
          currentlyPlaying: 0,
          completed: 0,
          totalPlayTime: 0
        };
      }
      
      return {
        totalGames: games.value.length,
        currentlyPlaying: games.value.filter(g => g.currently_playing).length,
        completed: games.value.filter(g => !g.currently_playing && g.end_date).length,
        totalPlayTime: games.value.reduce((sum, game) => sum + (game.play_time || 0), 0)
      };
    });
    
    const fetchGames = async () => {
      if (!userStore.user || !userStore.user.value) return;
      
      loading.value = true;
      
      try {
        const { data, error } = await supabase
          .from('games')
          .select('*')
          .eq('user_id', userStore.user.value.id);
          
        if (error) throw error;
        
        games.value = data || [];
        
        renderCharts();
      } catch (error) {
        console.error('Greška pri dohvaćanju igara:', error);
      } finally {
        loading.value = false;
      }
    };
    
    const updateProfile = async () => {
      if (!userStore.user.value) return;
      
      updating.value = true;
      
      try {
        const { error } = await supabase.auth.updateUser({
          data: {
            name: profileForm.name
          }
        });
        
        if (error) throw error;
        
        // Osvježi korisnika u store-u
        await userStore.fetchUser();
      } catch (error) {
        console.error('Greška pri ažuriranju profila:', error);
      } finally {
        updating.value = false;
      }
    };
    
    const renderCharts = () => {
      if (games.value.length === 0) return;
      
      // Pripremi podatke za žanrove
      const genreCount = {};
      games.value.forEach(game => {
        if (game.genre) {
          game.genre.split(',').forEach(g => {
            const genre = g.trim();
            genreCount[genre] = (genreCount[genre] || 0) + 1;
          });
        }
      });
      
      // Pripremi podatke za platforme
      const platformCount = {};
      games.value.forEach(game => {
        if (game.platform) {
          platformCount[game.platform] = (platformCount[game.platform] || 0) + 1;
        }
      });
      
      // Kreiraj grafikon za žanrove
      if (genreChartRef.value) {
        if (genreChart) genreChart.destroy();
        
        genreChart = new Chart(genreChartRef.value, {
          type: 'pie',
          data: {
            labels: Object.keys(genreCount),
            datasets: [{
              data: Object.values(genreCount),
              backgroundColor: [
                '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', 
                '#FF9F40', '#8C9EFF', '#69F0AE', '#FFD54F', '#7986CB'
              ]
            }]
          }
        });
      }
      
      // Kreiraj grafikon za platforme
      if (platformChartRef.value) {
        if (platformChart) platformChart.destroy();
        
        platformChart = new Chart(platformChartRef.value, {
          type: 'bar',
          data: {
            labels: Object.keys(platformCount),
            datasets: [{
              label: 'Broj igara',
              data: Object.values(platformCount),
              backgroundColor: '#36A2EB'
            }]
          },
          options: {
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  precision: 0
                }
              }
            }
          }
        });
      }
    };
    
    onMounted(() => {
      fetchGames();
    });
    
    return {
      userStore,
      games,
      loading,
      updating,
      profileForm,
      profileImageUrl,
      statistics,
      genreChartRef,
      platformChartRef,
      updateProfile
    };
  }
};
</script>
