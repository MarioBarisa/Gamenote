// src/views/Profile.vue
<template>
  <div class="profile">
    <h1 class="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Profil</h1>
    
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
      <div class="col-span-1">
        <div class="card bg-base-200">
          <div class="card-body p-4 sm:p-6">
            <h2 class="text-lg sm:text-xl mb-4">Osobni podaci</h2>
            
            <!-- Profilna slika -->
            <div class="avatar mb-4 flex justify-center">
              <div class="w-24 rounded-full ring ring-primary ring-offset-2">
                <img :src="profileImageUrl" alt="Profile" @error="handleImageError" />
              </div>
            </div>
            
            <!-- Forma za ažuriranje profila -->
            <form @submit.prevent="updateProfile">
              <div class="form-control">
                <label class="label">Ime</label>
                <input 
                  type="text" 
                  v-model="profileForm.name" 
                  class="input input-bordered" 
                  placeholder="Vaše ime"
                  required 
                />
              </div>
              
              <div class="form-control mt-2">
                <label class="label">Email</label>
                <input 
                  type="email" 
                  :value="userStore.user?.email" 
                  class="input input-bordered opacity-50" 
                  disabled 
                />
              </div>
              
              <div class="form-control mt-2">
                <label class="label">Profilna slika</label>
                <input 
                  type="file" 
                  @change="handleFileUpload"
                  accept="image/*"
                  class="file-input file-input-bordered w-full"
                  :disabled="uploading"
                />
                <div class="label">
                  <span class="label-text-alt">Maksimalno 2MB (JPG, PNG, WebP)</span>
                  <span v-if="uploading" class="label-text-alt text-info">Uploadam...</span>
                </div>
              </div>
              
              <div class="form-control mt-4">
                <button type="submit" class="btn btn-primary" :disabled="updating">
                  <span v-if="updating" class="loading loading-spinner"></span>
                  <span v-else>Spremi promjene</span>
                </button>
              </div>
            </form>
            
            <!--Pass -->
            <div class="divider">Sigurnost</div>
            
            <form @submit.prevent="updatePassword">
              <div class="form-control">
                <label class="label">Nova lozinka</label>
                <input 
                  type="password" 
                  v-model="passwordForm.newPassword" 
                  class="input input-bordered" 
                  placeholder="Minimalno 6 znakova"
                  minlength="6"
                />
              </div>
              
              <div class="form-control mt-2">
                <label class="label">Potvrdi lozinku</label>
                <input 
                  type="password" 
                  v-model="passwordForm.confirmPassword" 
                  class="input input-bordered" 
                  placeholder="Ponovite lozinku"
                />
              </div>
              
              <div class="form-control mt-4">
                <button 
                  type="submit" 
                  class="btn btn-secondary" 
                  :disabled="updatingPassword || !passwordsMatch"
                >
                  <span v-if="updatingPassword" class="loading loading-spinner"></span>
                  <span v-else>Promijeni lozinku</span>
                </button>
              </div>
              
              <div v-if="passwordForm.newPassword && !passwordsMatch" class="text-error text-sm mt-1">
                Lozinke se ne poklapaju
              </div>
            </form>
            
            <!-- Odjava -->
            <div class="divider">Sesija</div>
            <button @click="logout" class="btn btn-outline btn-error w-full">
              Odjavi se
            </button>
          </div>
        </div>
      </div>
      
      <div class="col-span-1 lg:col-span-2">
      <!-- Gaming card export -->
        <div class="card bg-base-200 mb-4 sm:mb-6">
          <div class="card-body p-4 sm:p-6">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
              <h2 class="text-lg sm:text-xl font-semibold">Tvoja Gamenote kartica</h2>
              <div class="dropdown dropdown-end">
                <label tabindex="0" class="btn btn-sm btn-primary">
                  📸 Izvezi karticu
                </label>
                <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                  <li><a @click="exportCard('png')">💾 Spremi kao PNG</a></li>
                  <li><a @click="exportCard('jpg')">💾 Spremi kao JPG</a></li>
                </ul>
              </div>
            </div>
            <!-- Gaming Card -->
            <div ref="gamingCardRef" id="gaming-card" class="bg-gradient-to-br from-slate-800 to-amber-600/80 p-4 sm:p-8 rounded-2xl text-white relative overflow-hidden border border-amber-500/30 shadow-xl">
              <!-- Background pattern -->
              <div class="absolute inset-0 opacity-5">
                <div class="absolute top-4 right-4 text-6xl">🎮</div>
                <div class="absolute bottom-4 left-4 text-4xl">🏆</div>
                <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-8xl opacity-20">⭐</div>
              </div>
              
              <!-- Subtle overlay for better text readability -->
              <div class="absolute inset-0 bg-gradient-to-br from-black/10 to-black/5"></div>
              
              <!-- Header s logom -->
              <div class="relative z-10 flex justify-between items-start mb-8">
                <div class="flex items-center gap-4">
                  <div class="avatar">
                    <div class="w-16 rounded-full ring-2 ring-amber-400/60 shadow-lg">
                      <img :src="profileImageUrl" alt="Profile" />
                    </div>
                  </div>
                  <div>
                    <h3 class="text-2xl font-bold drop-shadow-sm">{{ userStore.user?.user_metadata?.name || 'Gaming Entuzijast' }}</h3>
                    <p class="text-amber-200/90 drop-shadow-sm">{{ userLevel }}</p>
                  </div>
                </div>
                
                <!-- GameNote Logo -->
                <div class="text-right">
                  <div class="flex items-center gap-2 text-white/95">
                    <span class="text-xl bg-white/15 px-3 py-1 rounded-lg backdrop-blur-md border border-amber-400/30 shadow-sm">
                      <span class="font-bold font-italic drop-shadow-sm text-white text-transparent">GameNote</span>
                    </span>
                  </div>
                  <p class="text-xs text-amber-200/70 mt-1 drop-shadow-sm">Gaming Tracker</p>
                </div>
              </div>
              
              <!-- Stats Grid -->
              <div class="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
                <div class="bg-white/15 backdrop-blur-md rounded-lg p-2 sm:p-4 text-center border border-amber-400/20 shadow-sm">
                  <div class="text-lg sm:text-2xl font-bold drop-shadow-sm text-amber-100">{{ statistics.totalGames }}</div>
                  <div class="text-xs text-amber-200/90">Ukupno igara</div>
                </div>
                <div class="bg-white/15 backdrop-blur-md rounded-lg p-2 sm:p-4 text-center border border-amber-400/20 shadow-sm">
                  <div class="text-lg sm:text-2xl font-bold drop-shadow-sm text-amber-100">{{ statistics.totalPlayTime }}</div>
                  <div class="text-xs text-amber-200/90">Ukupno sati</div>
                </div>
                <div class="bg-white/15 backdrop-blur-md rounded-lg p-2 sm:p-4 text-center border border-amber-400/20 shadow-sm">
                  <div class="text-lg sm:text-2xl font-bold drop-shadow-sm text-amber-100">{{ statistics.completed }}</div>
                  <div class="text-xs text-amber-200/90">Završene</div>
                </div>
                <div class="bg-white/15 backdrop-blur-md rounded-lg p-4 text-center border border-amber-400/20 shadow-sm">
                  <div class="text-2xl font-bold drop-shadow-sm text-amber-100">{{ completionRate }}%</div>
                  <div class="text-xs text-amber-200/90">Completion Rate</div>
                </div>
              </div>
              
              <!-- Omiljena igra i žanr -->
              <div class="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div class="bg-white/15 backdrop-blur-md rounded-lg p-4 border border-amber-400/20 shadow-sm">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="text-amber-300">🏆</span>
                    <span class="text-sm font-semibold drop-shadow-sm text-amber-100">Omiljena igra</span>
                  </div>
                  <div v-if="favoriteGame">
                    <p class="font-bold drop-shadow-sm text-white">{{ favoriteGame.title }}</p>
                    <p class="text-xs text-amber-200/90">{{ favoriteGame.play_time }}h odigrano</p>
                  </div>
                  <div v-else class="text-amber-200/70 text-sm">Dodaj prvu igru!</div>
                </div>
                
                <div class="bg-white/15 backdrop-blur-md rounded-lg p-4 border border-amber-400/20 shadow-sm">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="text-amber-300">🎯</span>
                    <span class="text-sm font-semibold drop-shadow-sm text-amber-100">Omiljeni žanr</span>
                  </div>
                  <div v-if="favoriteGenre">
                    <p class="font-bold drop-shadow-sm text-white">{{ favoriteGenre.name }}</p>
                    <p class="text-xs text-amber-200/90">{{ favoriteGenre.count }} igara</p>
                  </div>
                  <div v-else class="text-amber-200/70 text-sm">Dodaj igre za analizu</div>
                </div>
              </div>
              
              <!-- propaganda (reklama) -->
              <div class="relative z-10 mt-6 pt-4 border-t border-amber-400/30 flex justify-between items-center text-xs text-amber-200/80">
                <span class="drop-shadow-sm">Član od {{ formatDate(userStore.user?.created_at) }}</span>
                <span class="drop-shadow-sm">{{ totalPlayDays }} dana igranja <br>gamenote.io</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Gamenote achivments -->
        <div class="card bg-base-200 mt-6">
          <div class="card-body">
            <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
              <span class="text-yellow-500">🏅</span> Postignuća
            </h3>
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div v-for="achievement in achievements" :key="achievement.id"
                   class="flex flex-col items-center p-4 bg-base-100 rounded-lg"
                   :class="achievement.unlocked ? 'opacity-100' : 'opacity-50'">
                <div class="text-2xl mb-2">{{ achievement.emoji }}</div>
                <p class="font-medium text-sm text-center">{{ achievement.title }}</p>
                <p class="text-xs text-base-content/70 text-center">{{ achievement.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    
    <div v-if="toast.show" class="toast toast-top toast-end">
      <div class="alert" :class="toast.type === 'success' ? 'alert-success' : 'alert-error'">
        <span>{{ toast.message }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';
import { supabase } from '../supabase';
import Chart from 'chart.js/auto';

export default {
  setup() {
    const router = useRouter();
    const userStore = useUserStore();
    const games = ref([]);
    const loading = ref(false);
    const updating = ref(false);
    const updatingPassword = ref(false);
    const uploading = ref(false);
    const genreChartRef = ref(null);
    const platformChartRef = ref(null);
    const gamingCardRef = ref(null);
    let genreChart = null;
    let platformChart = null;
    
    
    const profileForm = reactive({
      name: userStore.user?.user_metadata?.name || '',
      avatarUrl: userStore.user?.user_metadata?.avatar_url || ''
    });
    
    const passwordForm = reactive({
      newPassword: '',
      confirmPassword: ''
    });
    
    
    const toast = reactive({
      show: false,
      message: '',
      type: 'success'
    });
    
    
    const profileImageUrl = computed(() => {
      return profileForm.avatarUrl || 'https://i.pravatar.cc/300?u=' + (userStore.user?.email || 'default');
    });
    
    const passwordsMatch = computed(() => {
      return passwordForm.newPassword === passwordForm.confirmPassword && passwordForm.newPassword.length >= 6;
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
    
    const recentGames = computed(() => {
      return games.value.slice(0, 6).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    });
    
    const averagePlayTime = computed(() => {
      if (statistics.value.totalGames === 0) return '0';
      return Math.round(statistics.value.totalPlayTime / statistics.value.totalGames);
    });
    
    const genreData = computed(() => {
      const genreCount = {};
      games.value.forEach(game => {
        if (game.genre) {
          game.genre.split(',').forEach(g => {
            const genre = g.trim();
            genreCount[genre] = (genreCount[genre] || 0) + 1;
          });
        }
      });
      return genreCount;
    });
    
    const platformData = computed(() => {
      const platformCount = {};
      games.value.forEach(game => {
        if (game.platform) {
          platformCount[game.platform] = (platformCount[game.platform] || 0) + 1;
        }
      });
      return platformCount;
    });
    
    
    const showToast = (message, type = 'success') => {
      toast.message = message;
      toast.type = type;
      toast.show = true;
      setTimeout(() => toast.show = false, 3000);
    };
    
    const handleImageError = () => {
      profileForm.avatarUrl = 'https://i.pravatar.cc/300?u=' + (userStore.user?.email || 'default');
    };
    
    // pošalji na imgBB
    const handleFileUpload = async (event) => {
      const file = event.target.files[0];
      if (!file) return;
      
      // sprijeci velike slike
      if (file.size > 2 * 1024 * 1024) {
        showToast('Slika je prevelika. Maksimalno 2MB.', 'error');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        showToast('Molimo odaberite sliku.', 'error');
        return;
      }
      
      uploading.value = true;
      
      try {
        // API ->> ENV
        const apiKey = import.meta.env.VITE_IMGBB_API_KEY;
        
        if (!apiKey) {
          throw new Error('API key nije konfiguriran');
        }
        
        const formData = new FormData();
        formData.append('image', file);
        
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
          method: 'POST',
          body: formData
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error?.message || 'Upload neuspješan');
        }
        
        if (data.success && data.data) {
          profileForm.avatarUrl = data.data.url;
          showToast('Slika uspješno uploadana!');
        } else {
          throw new Error('Upload servis greška');
        }
      } catch (error) {
        console.error('Greška pri uploadu:', error);
        showToast(error.message || 'Greška pri uploadu slike', 'error');
      } finally {
        uploading.value = false;
        event.target.value = '';
      }
    };
    
    const updateProfile = async () => {
      updating.value = true;
      
      try {
        const { error } = await supabase.auth.updateUser({
          data: {
            name: profileForm.name,
            avatar_url: profileForm.avatarUrl
          }
        });
        
        if (error) throw error;
        
        await userStore.fetchUser();
        showToast('Profil uspješno ažuriran!');
      } catch (error) {
        console.error('Greška pri ažuriranju profila:', error);
        showToast('Greška pri ažuriranju profila', 'error');
      } finally {
        updating.value = false;
      }
    };
    
    const updatePassword = async () => {
      if (!passwordsMatch.value) return;
      
      updatingPassword.value = true;
      
      try {
        const { error } = await supabase.auth.updateUser({
          password: passwordForm.newPassword
        });
        
        if (error) throw error;
        
        passwordForm.newPassword = '';
        passwordForm.confirmPassword = '';
        showToast('Lozinka uspješno promijenjena!');
      } catch (error) {
        console.error('Greška pri mijenjanju lozinke:', error);
        showToast('Greška pri mijenjanju lozinke', 'error');
      } finally {
        updatingPassword.value = false;
      }
    };
    
    const logout = async () => {
      try {
        await userStore.logout();
        router.push('/login');
      } catch (error) {
        console.error('Greška pri odjavi:', error);
      }
    };
    
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('hr-HR');
    };
    
    const renderCharts = () => {
      if (games.value.length === 0) return;
      
      // Grafikon žanrova --> MAKNUO SAM
      if (genreChartRef.value && Object.keys(genreData.value).length) {
        if (genreChart) genreChart.destroy();
        
        genreChart = new Chart(genreChartRef.value, {
          type: 'doughnut',
          data: {
            labels: Object.keys(genreData.value),
            datasets: [{
              data: Object.values(genreData.value),
              backgroundColor: [
                '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', 
                '#FF9F40', '#8C9EFF', '#69F0AE', '#FFD54F', '#7986CB'
              ]
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false
          }
        });
      }
      
      // Grafikon platforma  --> MAKNUO SAM
      if (platformChartRef.value && Object.keys(platformData.value).length) {
        if (platformChart) platformChart.destroy();
        
        platformChart = new Chart(platformChartRef.value, {
          type: 'bar',
          data: {
            labels: Object.keys(platformData.value),
            datasets: [{
              label: 'Broj igara',
              data: Object.values(platformData.value),
              backgroundColor: '#36A2EB'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                ticks: { precision: 0 }
              }
            }
          }
        });
      }
    };
    
    const fetchGames = async () => {
      if (!userStore.user) return;
      
      loading.value = true;
      
      try {
        const { data, error } = await supabase
          .from('games')
          .select('*')
          .eq('user_id', userStore.user.id);
          
        if (error) throw error;
        
        games.value = data || [];
        renderCharts();
      } catch (error) {
        console.error('Greška pri dohvaćanju igara:', error);
      } finally {
        loading.value = false;
      }
    };
    
    onMounted(() => {
      fetchGames();
    });
    
    onUnmounted(() => {
      if (genreChart) genreChart.destroy();
      if (platformChart) platformChart.destroy();
    });
    
    const userLevel = computed(() => {
      const totalHours = statistics.value.totalPlayTime;
      if (totalHours < 10) return 'Početnik';
      if (totalHours < 50) return 'Casual Gamer';
      if (totalHours < 200) return 'Entuzijast';
      if (totalHours < 500) return 'Hardcore Gamer';
      return 'Gaming Legend';
    });

    const totalPlayDays = computed(() => {
      return Math.floor(statistics.value.totalPlayTime / 24);
    });

    const completionRate = computed(() => {
      if (statistics.value.totalGames === 0) return 0;
      return Math.round((statistics.value.completed / statistics.value.totalGames) * 100);
    });

    const activePlayers = computed(() => {
      return Math.floor(Math.random() * 1000) + 500;
    });

    const gamingStreak = computed(() => {
      const recent = recentGames.value.slice(0, 7);
      return recent.length;
    });

    const favoriteGame = computed(() => {
      if (games.value.length === 0) return null;
      return games.value.reduce((prev, current) => 
        (current.play_time || 0) > (prev.play_time || 0) ? current : prev
      );
    });

    const favoriteGenre = computed(() => {
      if (Object.keys(genreData.value).length === 0) return null;
      const genres = Object.entries(genreData.value);
      const [name, count] = genres.reduce((prev, current) => 
        current[1] > prev[1] ? current : prev
      );
      return { name, count };
    });

    const achievements = computed(() => [ // TREBA DODATI JOŠ!!!
      {
        id: 1,
        emoji: '🎮',
        title: 'Prvi korak',
        description: 'Dodaj prvu igru',
        unlocked: statistics.value.totalGames > 0
      },
      {
        id: 2,
        emoji: '⭐',
        title: 'Kolekcionar',
        description: '10+ igara',
        unlocked: statistics.value.totalGames >= 10
      },
      {
        id: 3,
        emoji: '🏆',
        title: 'Završivač',
        description: 'Završi 5 igara',
        unlocked: statistics.value.completed >= 5
      },
      {
        id: 4,
        emoji: '⚡',
        title: 'Brzinski',
        description: '100+ sati',
        unlocked: statistics.value.totalPlayTime >= 100
      },
      {
        id: 5,
        emoji: '🔥',
        title: 'Hardcore',
        description: '500+ sati',
        unlocked: statistics.value.totalPlayTime >= 500
      },
      {
        id: 6,
        emoji: '👑',
        title: 'Legend',
        description: '1000+ sati',
        unlocked: statistics.value.totalPlayTime >= 1000
      }
    ]);

    // Dodaj genre emoji mapper -> Neda mi se zezati sa SVG od prije
    const getGenreEmoji = (genre) => {
      const emojiMap = {
        'Action': '⚔️',
        'Adventure': '🗺️',
        'RPG': '🧙‍♂️',
        'Strategy': '🧠',
        'Simulation': '🏗️',
        'Racing': '🏎️',
        'Sports': '⚽',
        'Puzzle': '🧩',
        'Horror': '👻',
        'Shooter': '🔫'
      };
      return emojiMap[genre] || '🎮';
    };
    
    // Export funkcionalnost koristeći Canvas API
    const exportCard = async (format = 'png') => {
      if (!gamingCardRef.value) return;
      
      try {
        showToast('Pripremam karticu za export...', 'info');
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = 800;
        canvas.height = 600;
        
        // Tamnji gradient sa zlatnim akcentom
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#1e293b'); // slate-800
        gradient.addColorStop(1, '#d97706'); // amber-600
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Dodaj subtle overlay
        const overlayGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        overlayGradient.addColorStop(0, 'rgba(0, 0, 0, 0.1)');
        overlayGradient.addColorStop(1, 'rgba(0, 0, 0, 0.05)');
        ctx.fillStyle = overlayGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        
        ctx.fillStyle = '#fbbf24'; // amber-400
        ctx.font = 'bold 32px Arial';
        ctx.fillText(userStore.user?.user_metadata?.name || 'Gaming Entuzijast', 80, 80);
        
        ctx.font = '18px Arial';
        ctx.fillStyle = '#fcd34d'; // amber-300
        ctx.fillText(userLevel.value, 80, 110);
        
        // GameNote logo
        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = '#fbbf24'; // amber-400
        ctx.fillText('GameNote', canvas.width - 200, 50);
        
        ctx.font = '12px Arial';
        ctx.fillStyle = '#fcd34d'; // amber-300
        ctx.fillText('Gaming Tracker', canvas.width - 150, 70);
        
        // Statistike s amber bojama
        const stats = [
          { label: 'Ukupno igara', value: statistics.value.totalGames, x: 80, y: 200 },
          { label: 'Ukupno sati', value: statistics.value.totalPlayTime, x: 280, y: 200 },
          { label: 'Završene', value: statistics.value.completed, x: 480, y: 200 },
          { label: 'Completion Rate', value: `${completionRate.value}%`, x: 680, y: 200 }
        ];
        
        stats.forEach(stat => {
          
          ctx.fillStyle = 'rgba(251, 191, 36, 0.2)'; // amber-400/20
          ctx.strokeStyle = 'rgba(251, 191, 36, 0.3)'; // amber-400/30
          ctx.lineWidth = 1;
          ctx.fillRect(stat.x - 20, stat.y - 40, 120, 80);
          ctx.strokeRect(stat.x - 20, stat.y - 40, 120, 80);
          
          
          ctx.fillStyle = '#fef3c7'; // amber-100
          ctx.font = 'bold 24px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(stat.value, stat.x + 40, stat.y - 10);
          
          
          ctx.font = '12px Arial';
          ctx.fillStyle = '#fcd34d'; // amber-300
          ctx.fillText(stat.label, stat.x + 40, stat.y + 10);
        });
        
        // Reset text align
        ctx.textAlign = 'left';
        
        // omiljeno
        if (favoriteGame.value) {
          ctx.fillStyle = 'rgba(251, 191, 36, 0.2)'; // amber-400/20
          ctx.fillRect(60, 320, 320, 120);
          
          ctx.fillStyle = 'white';
          ctx.font = 'bold 16px Arial';
          ctx.fillText('🏆 Omiljena igra', 80, 350);
          
          ctx.font = 'bold 20px Arial';
          ctx.fillText(favoriteGame.value.title, 80, 380);
          
          ctx.font = '14px Arial';
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.fillText(`${favoriteGame.value.play_time || 0}h odigrano`, 80, 405);
        }
        
        if (favoriteGenre.value) {
          ctx.fillStyle = 'rgba(251, 191, 36, 0.2)'; // amber-400/20
          ctx.fillRect(420, 320, 320, 120);
          
          ctx.fillStyle = 'white';
          ctx.font = 'bold 16px Arial';
          ctx.fillText('🎯 Omiljeni žanr', 440, 350);
          
          ctx.font = 'bold 20px Arial';
          ctx.fillText(favoriteGenre.value.name, 440, 380);
          
          ctx.font = '14px Arial';
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.fillText(`${favoriteGenre.value.count} igara`, 440, 405);
        }
        
        // footer
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.3)'; // amber-400/30
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(60, 480);
        ctx.lineTo(740, 480);
        ctx.stroke();
        
        ctx.fillStyle = '#fcd34d'; // amber-300
        ctx.font = '12px Arial';
        ctx.fillText(`Član od ${formatDate(userStore.user?.created_at)}`, 60, 510);
        ctx.fillText(`${totalPlayDays.value} dana igranja - gamenote.io`, 600, 510);
        
        // izvezivanje
        const link = document.createElement('a');
        link.download = `gamenote-kartica-${userStore.user?.user_metadata?.name || 'user'}.${format}`;
        
        if (format === 'jpg') {
          link.href = canvas.toDataURL('image/jpeg', 0.9);
        } else {
          link.href = canvas.toDataURL('image/png');
        }
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showToast(`Kartica spremljena kao ${format.toUpperCase()}!`);
        
      } catch (error) {
        console.error('Export greška:', error);
        showToast('Greška pri exportu kartice', 'error');
      }
    };
    
    return {
      userStore,
      loading,
      updating,
      updatingPassword,
      uploading,
      profileForm,
      passwordForm,
      profileImageUrl,
      passwordsMatch,
      toast,
      updateProfile,
      updatePassword,
      logout,
      handleImageError,
      handleFileUpload,
      formatDate,
      statistics,
      recentGames,
      averagePlayTime,
      genreData,
      platformData,
      genreChartRef,
      platformChartRef,
      gamingCardRef,
      userLevel,
      totalPlayDays,
      completionRate,
      activePlayers,
      gamingStreak,
      favoriteGame,
      favoriteGenre,
      achievements,
      getGenreEmoji,
      exportCard
    };
  }
};
</script>

<style scoped>
.profile {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.card {
  border-radius: 12px;
  overflow: hidden;
}

.card-body {
  padding: 24px;
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
}

.stat {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
}

.stat-title {
  font-size: 14px;
  color: #666;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
}

.badge {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 12px;
}

.toast {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 1000;
}

.loading {
  display: inline-block;
  width: 24px;
  height: 24px;
  border: 4px solid transparent;
  border-top-color: #007bff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

#gaming-card {
  min-height: 400px;
  position: relative;
  transition: all 0.3s ease;
}

#gaming-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 25px -5px rgba(217, 119, 6, 0.2), 0 10px 10px -5px rgba(217, 119, 6, 0.1);
  border-color: rgba(251, 191, 36, 0.5);
}

/* Export optimizacija (nekuzim) */
@media print {
  #gaming-card {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
    -webkit-print-color-adjust: exact;
    color-adjust: exact;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
