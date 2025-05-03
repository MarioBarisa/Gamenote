<!-- src/views/AddGame.vue -->
<template>
  <div class="add-game">
    <h1 class="text-4xl font-bold mb-8 text-center">Dodaj novu igru</h1>
    
    <div class="card bg-base-200 shadow-xl">
      <div class="card-body">
        <div class="mb-6">
          <h2 class="text-2xl font-bold mb-4">Pretraži igru</h2>
          <div class="flex gap-3">
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="Unesite naziv igre..." 
              class="input input-bordered input-lg flex-grow"
              @keyup.enter="searchGames" 
            />
            <button @click="searchGames" class="btn btn-primary btn-lg" :disabled="searchLoading">
              <span v-if="searchLoading" class="loading loading-spinner"></span>
              <span v-else>Pretraži</span>
            </button>
          </div>
        </div>
        
        <div v-if="searchResults.length > 0" class="search-results mb-8">
          <h3 class="text-xl font-bold mb-4">Rezultati pretrage</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div 
              v-for="game in searchResults" 
              :key="game.id" 
              class="card bg-base-100 cursor-pointer transition-all duration-300 hover:bg-base-300 hover:shadow-lg"
              @click="selectGame(game)"
            >
              <figure v-if="game.background_image" class="h-40">
                <img :src="game.background_image" :alt="game.name" class="w-full h-full object-cover" />
              </figure>
              <div class="card-body p-4">
                <h4 class="card-title text-lg">{{ game.name }}</h4>
                <p class="text-sm opacity-70">{{ formatReleaseDate(game.released) }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <form v-if="selectedGame" @submit.prevent="saveGame" class="game-form">
          <h3 class="text-2xl font-bold mb-6 text-center">Informacije o igri</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="form-control">
              <label class="label font-medium">Naziv</label>
              <input type="text" v-model="gameForm.title" class="input input-bordered" required />
            </div>
            
            <div class="form-control">
              <label class="label font-medium">Platforma</label>
              <select v-model="gameForm.platform" class="select select-bordered" required>
                <option value="" disabled selected>Odaberi platformu</option>
                <option v-for="platform in platforms" :key="platform" :value="platform">
                  {{ platform }}
                </option>
              </select>
            </div>
            
            <div class="form-control">
              <label class="label font-medium">Žanr</label>
              <input type="text" v-model="gameForm.genre" class="input input-bordered" />
            </div>
            
            <div class="form-control">
              <label class="label font-medium">Izdavač</label>
              <input type="text" v-model="gameForm.publisher" class="input input-bordered" />
            </div>
            
            <div class="form-control">
              <label class="label font-medium">Vrijeme igranja (sati)</label>
              <input type="number" v-model="gameForm.play_time" class="input input-bordered" min="0" />
            </div>
            
            <div class="form-control">
              <label class="label font-medium">Ocjena</label>
              <div class="rating rating-lg">
                <input type="radio" name="rating" class="mask mask-star-2 bg-orange-400" value="1" v-model="gameForm.rating" />
                <input type="radio" name="rating" class="mask mask-star-2 bg-orange-400" value="2" v-model="gameForm.rating" />
                <input type="radio" name="rating" class="mask mask-star-2 bg-orange-400" value="3" v-model="gameForm.rating" />
                <input type="radio" name="rating" class="mask mask-star-2 bg-orange-400" value="4" v-model="gameForm.rating" />
                <input type="radio" name="rating" class="mask mask-star-2 bg-orange-400" value="5" v-model="gameForm.rating" />
              </div>
            </div>
            
            <div class="form-control">
              <label class="label font-medium">Postotak ostvarenih achievementa (%)</label>
              <input type="number" v-model="gameForm.achievement_percent" class="input input-bordered" min="0" max="100" />
            </div>
            
            <div class="form-control">
              <label class="label font-medium">Datum početka igranja</label>
              <input type="date" v-model="gameForm.start_date" class="input input-bordered" />
            </div>
            
            <div class="form-control">
              <label class="label font-medium">Datum završetka igranja</label>
              <input type="date" v-model="gameForm.end_date" class="input input-bordered" />
            </div>
            
            <div class="form-control">
              <label class="flex items-center cursor-pointer mt-8">
                <input type="checkbox" v-model="gameForm.currently_playing" class="checkbox checkbox-primary" />
                <span class="label-text ml-2 text-lg">Trenutno igram</span>
              </label>
            </div>
          </div>
          
          <div class="form-control mt-6">
            <label class="label font-medium">Bilješke</label>
            <textarea v-model="gameForm.notes" class="textarea textarea-bordered h-32"></textarea>
          </div>
          
          <div class="form-control mt-8">
            <button type="submit" class="btn btn-primary btn-lg mx-auto w-full md:w-1/2" :disabled="saveLoading">
              <span v-if="saveLoading" class="loading loading-spinner"></span>
              <span v-else>Spremi igru</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';
import { useGamesApi } from '../services/gamesApi';
import { supabase } from '../supabase';

export default {
  setup() {
    const userStore = useUserStore();
    const router = useRouter();
    const gamesApi = useGamesApi();
    
    const searchQuery = ref('');
    const searchResults = ref([]);
    const searchLoading = ref(false);
    const selectedGame = ref(null);
    const saveLoading = ref(false);
    
    const platforms = [
      'PC', 'PlayStation 5', 'PlayStation 4', 'Xbox Series X/S', 'Xbox One', 
      'Nintendo Switch', 'iOS', 'Android', 'Other'
    ];
    
    const gameForm = reactive({
      title: '',
      platform: '',
      play_time: 0,
      genre: '',
      publisher: '',
      rating: 0,
      achievement_percent: 0,
      notes: '',
      start_date: '',
      end_date: '',
      currently_playing: false,
      game_api_id: '',
      image: ''
    });
    
    const searchGames = async () => {
      if (!searchQuery.value.trim()) return;
      
      searchLoading.value = true;
      
      try {
        const data = await gamesApi.searchGames(searchQuery.value);
        searchResults.value = data.results || [];
      } catch (error) {
        console.error('Greška pri pretraživanju igara:', error);
      } finally {
        searchLoading.value = false;
      }
    };
    
    const selectGame = async (game) => {
      selectedGame.value = game;
      
      // Dohvati više detalja o igri
      const gameDetails = await gamesApi.getGameDetails(game.id);
      
      // Popuni formu s detaljima
      gameForm.title = game.name;
      gameForm.genre = gameDetails?.genres?.map(g => g.name).join(', ') || '';
      gameForm.publisher = gameDetails?.publishers?.map(p => p.name).join(', ') || '';
      gameForm.game_api_id = game.id.toString();
      gameForm.image = game.background_image;
    };
    
    const formatReleaseDate = (date) => {
      if (!date) return 'Nepoznat datum';
      return new Date(date).toLocaleDateString('hr-HR');
    };
    
    const saveGame = async () => {
      if (!userStore.user.value) {
        router.push('/login');
        return;
      }
      
      saveLoading.value = true;
      
      try {
        const { data, error } = await supabase
          .from('games')
          .insert({
            user_id: userStore.user.value.id,
            title: gameForm.title,
            platform: gameForm.platform,
            play_time: parseInt(gameForm.play_time) || 0,
            genre: gameForm.genre,
            publisher: gameForm.publisher,
            rating: parseInt(gameForm.rating) || 0,
            achievement_percent: parseInt(gameForm.achievement_percent) || 0,
            notes: gameForm.notes,
            start_date: gameForm.start_date || null,
            end_date: gameForm.end_date || null,
            currently_playing: gameForm.currently_playing,
            game_api_id: gameForm.game_api_id,
            image: gameForm.image
          })
          .select();
          
        if (error) throw error;
        
        // ISPRAVAK GREŠKE - pravilno dohvaća prvi element niza
        if (data && data.length > 0) {
          router.push(`/games/${data[0].id}`);
        } else {
          router.push('/');
        }
      } catch (error) {
        console.error('Greška pri spremanju igre:', error);
      } finally {
        saveLoading.value = false;
      }
    };
    
    return {
      searchQuery,
      searchResults,
      searchLoading,
      selectedGame,
      saveLoading,
      platforms,
      gameForm,
      searchGames,
      selectGame,
      formatReleaseDate,
      saveGame
    };
  }
};
</script>
