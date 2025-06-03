// src/views/GameDetails.vue
<template>
  <div class="game-details">
    <div v-if="loading" class="flex justify-center my-8">
      <span class="loading loading-spinner loading-lg"></span>
    </div>
    
    <div v-else-if="!game" class="text-center my-8">
      <p class="text-xl">Igra nije pronađena</p>
      <router-link to="/" class="btn btn-primary mt-4">Natrag na početnu</router-link>
    </div>
    
    <div v-else>
      <div class="flex flex-col md:flex-row gap-4 mb-6">
        <div class="flex-none">
          <div class="card bg-base-200 shadow-xl" style="width: 300px;">
            <figure>
              <img :src="getGameImage(game)" :alt="game.title" class="w-full h-auto" />
            </figure>
            <div class="card-body">
              <h2 class="card-title">
                {{ game.title }}
                <div v-if="game.currently_playing" class="badge badge-primary">Trenutno igram</div>
              </h2>
              <p><strong>Platforma:</strong> {{ game.platform }}</p>
              <p><strong>Žanr:</strong> {{ game.genre }}</p>
              <p><strong>Izdavač:</strong> {{ game.publisher }}</p>
              
              <div class="mt-2">
                <p><strong>Ocjena:</strong></p>
                <div class="rating">
                  <input type="radio" name="rating" class="mask mask-star-2 bg-orange-400" :checked="game.rating >= 1" disabled />
                  <input type="radio" name="rating" class="mask mask-star-2 bg-orange-400" :checked="game.rating >= 2" disabled />
                  <input type="radio" name="rating" class="mask mask-star-2 bg-orange-400" :checked="game.rating >= 3" disabled />
                  <input type="radio" name="rating" class="mask mask-star-2 bg-orange-400" :checked="game.rating >= 4" disabled />
                  <input type="radio" name="rating" class="mask mask-star-2 bg-orange-400" :checked="game.rating >= 5" disabled />
                </div>
              </div>
              
              <div class="mt-2">
                <p><strong>Vrijeme igranja:</strong> {{ game.play_time || 0 }} sati</p>
              </div>
              
              <div class="mt-2">
                <p><strong>Achievement completion:</strong> {{ game.achievement_percent || 0 }}%</p>
                <progress
                  class="progress progress-primary w-full" 
                  :value="game.achievement_percent || 0" 
                  max="100"
                ></progress>
              </div>
              
              <div class="mt-2">
                <p><strong>Datum početka:</strong> {{ formatDate(game.start_date) }}</p>
                <p><strong>Datum završetka:</strong> {{ formatDate(game.end_date) }}</p>
              </div>
              
              <div class="card-actions justify-end mt-4">
                <button @click="confirmDelete" class="btn btn-error">Izbriši</button>
                <button @click="showEditModal = true" class="btn btn-primary">Uredi</button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="flex-1">
          <div class="card bg-base-200 shadow-xl h-full">
            <div class="card-body">
              <h2 class="text-xl mb-4">Bilješke</h2>
              <div class="prose max-w-none">
                <p v-if="game.notes">{{ game.notes }}</p>
                <p v-else class="text-gray-500">Nema bilješki.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="apiGameDetails" class="mt-8">
        <h2 class="text-2xl font-bold mb-4">Dodatne informacije</h2>
        
        <div class="card bg-base-200 shadow-xl">
          <div class="card-body">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 class="text-lg font-bold">Opis</h3>
                <p>{{ apiGameDetails.description_raw }}</p>
              </div>
              
              <div>
                <h3 class="text-lg font-bold">Informacije</h3>
                <p><strong>Datum izdavanja:</strong> {{ formatDate(apiGameDetails.released) }}</p>
                <p><strong>Metacritic ocjena:</strong> {{ apiGameDetails.metacritic || 'N/A' }}</p>
                <p><strong>ESRB ocjena:</strong> {{ apiGameDetails.esrb_rating?.name || 'N/A' }}</p>
                <p><strong>Službena web stranica:</strong> 
                  <a v-if="apiGameDetails.website" :href="apiGameDetails.website" target="_blank" class="link link-primary">
                    {{ apiGameDetails.website }}
                  </a>
                  <span v-else>N/A</span>
                </p>
              </div>
            </div>
            
            <div class="mt-6" v-if="screenshots.length > 0">
              <h3 class="text-lg font-bold mb-2">Slike igre</h3>
              <div class="carousel carousel-center rounded-box">
                <div 
                  v-for="(screenshot, index) in screenshots" 
                  :key="index" 
                  class="carousel-item"
                >
                  <img :src="screenshot.image" :alt="`Screenshot ${index + 1}`" class="h-64" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Edit Modal -->
    <div v-if="showEditModal" class="modal modal-open">
      <div class="modal-box max-w-2xl">
        <h3 class="font-bold text-lg">Uredi informacije o igri</h3>
        
        <form @submit.prevent="updateGame" class="mt-4">
          <div class="form-control">
            <label class="label">Naziv</label>
            <input type="text" v-model="editForm.title" class="input input-bordered" required />
          </div>
          
          <div class="form-control mt-2">
            <label class="label">Platforma</label>
            <select v-model="editForm.platform" class="select select-bordered" required>
              <option value="" disabled>Odaberi platformu</option>
              <option v-for="platform in platforms" :key="platform" :value="platform">
                {{ platform }}
              </option>
            </select>
          </div>
          
          <div class="form-control mt-2">
            <label class="label">Žanr</label>
            <input type="text" v-model="editForm.genre" class="input input-bordered" />
          </div>
          
          <div class="form-control mt-2">
            <label class="label">Izdavač</label>
            <input type="text" v-model="editForm.publisher" class="input input-bordered" />
          </div>
          
          <div class="form-control mt-2">
            <label class="label">Vrijeme igranja (sati)</label>
            <input type="number" v-model="editForm.play_time" class="input input-bordered" min="0" />
          </div>
          
          <div class="form-control mt-2">
            <label class="label">Ocjena</label>
            <div class="rating">
              <input type="radio" name="edit-rating" class="mask mask-star-2 bg-orange-400" value="1" v-model="editForm.rating" />
              <input type="radio" name="edit-rating" class="mask mask-star-2 bg-orange-400" value="2" v-model="editForm.rating" />
              <input type="radio" name="edit-rating" class="mask mask-star-2 bg-orange-400" value="3" v-model="editForm.rating" />
              <input type="radio" name="edit-rating" class="mask mask-star-2 bg-orange-400" value="4" v-model="editForm.rating" />
              <input type="radio" name="edit-rating" class="mask mask-star-2 bg-orange-400" value="5" v-model="editForm.rating" />
            </div>
          </div>
          
          <div class="form-control mt-2">
            <label class="label">Postotak ostvarenih achievementa (%)</label>
            <input type="number" v-model="editForm.achievement_percent" class="input input-bordered" min="0" max="100" />
          </div>
          
          <div class="form-control mt-2">
            <label class="label">Bilješke</label>
            <textarea v-model="editForm.notes" class="textarea textarea-bordered h-24"></textarea>
          </div>
          
          <div class="form-control mt-2">
            <label class="label">Datum početka igranja</label>
            <input type="date" v-model="editForm.start_date" class="input input-bordered" />
          </div>
          
          <div class="form-control mt-2">
            <label class="label">Datum završetka igranja</label>
            <input type="date" v-model="editForm.end_date" class="input input-bordered" />
          </div>
          
          <div class="form-control mt-2">
            <label class="flex items-center cursor-pointer">
              <input type="checkbox" v-model="editForm.currently_playing" class="checkbox checkbox-primary" />
              <span class="label-text ml-2">Trenutno igram</span>
            </label>
          </div>
          
          <div class="modal-action">
            <button type="button" @click="showEditModal = false" class="btn">Odustani</button>
            <button type="submit" class="btn btn-primary" :disabled="updating">
              <span v-if="updating" class="loading loading-spinner"></span>
              <span v-else>Spremi promjene</span>
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal modal-open">
      <div class="modal-box">
        <h3 class="font-bold text-lg">Potvrda brisanja</h3>
        <p class="py-4">Jeste li sigurni da želite izbrisati igru "{{ game.title }}"?</p>
        <div class="modal-action">
          <button @click="showDeleteModal = false" class="btn">Odustani</button>
          <button @click="deleteGame" class="btn btn-error" :disabled="deleting">
            <span v-if="deleting" class="loading loading-spinner"></span>
            <span v-else>Izbriši</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useGamesApi } from '../services/gamesApi';
import { supabase } from '../supabase';

export default {
  setup() {
    const route = useRoute();
    const router = useRouter();
    const gamesApi = useGamesApi();
    
    const game = ref(null);
    const loading = ref(true);
    const updating = ref(false);
    const deleting = ref(false);
    const showEditModal = ref(false);
    const showDeleteModal = ref(false);
    const apiGameDetails = ref(null);
    const screenshots = ref([]);
    
    const platforms = [
      'PC', 'PlayStation 5', 'PlayStation 4', 'Xbox Series X/S', 'Xbox One', 
      'Nintendo Switch', 'iOS', 'Android', 'Other'
    ];
    
    const editForm = reactive({
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
      currently_playing: false
    });
    
    const fetchGame = async () => {
      const gameId = route.params.id;
      
      try {
        const { data, error } = await supabase
          .from('games')
          .select('*')
          .eq('id', gameId)
          .single();
          
        if (error) throw error;
        
        game.value = data;
        
        // Popuni formu za uređivanje
        if (game.value) {
          Object.keys(editForm).forEach(key => {
            if (key === 'rating' || key === 'play_time' || key === 'achievement_percent') {
              editForm[key] = parseInt(game.value[key]) || 0;
            } else {
              editForm[key] = game.value[key] || '';
            }
          });
          
          // Dohvati dodatne informacije o igri ako postoji game_api_id
          if (game.value.game_api_id) {
            fetchGameAPIDetails(game.value.game_api_id);
          }
        }
      } catch (error) {
        console.error('Greška pri dohvaćanju igre:', error);
      } finally {
        loading.value = false;
      }
    };
    
    const fetchGameAPIDetails = async (gameApiId) => {
      try {
        const details = await gamesApi.getGameDetails(gameApiId);
        apiGameDetails.value = details;
        
        // Dohvati slike
        const screenshotsData = await gamesApi.getGameScreenshots(gameApiId);
        screenshots.value = screenshotsData;
      } catch (error) {
        console.error('Greška pri dohvaćanju detalja igre:', error);
      }
    };
    
    const updateGame = async () => {
      updating.value = true;
      
      try {
        const { error } = await supabase
          .from('games')
          .update({
            title: editForm.title,
            platform: editForm.platform,
            play_time: parseInt(editForm.play_time) || 0,
            genre: editForm.genre,
            publisher: editForm.publisher,
            rating: parseInt(editForm.rating) || 0,
            achievement_percent: parseInt(editForm.achievement_percent) || 0,
            notes: editForm.notes,
            start_date: editForm.start_date || null,
            end_date: editForm.end_date || null,
            currently_playing: editForm.currently_playing
          })
          .eq('id', game.value.id);
          
        if (error) throw error;
        
        // Zatvori modal i osvježi igru
        showEditModal.value = false;
        fetchGame();
      } catch (error) {
        console.error('Greška pri ažuriranju igre:', error);
      } finally {
        updating.value = false;
      }
    };
    
    const confirmDelete = () => {
      showDeleteModal.value = true;
    };
    
    const deleteGame = async () => {
      deleting.value = true;
      
      try {
        const { error } = await supabase
          .from('games')
          .delete()
          .eq('id', game.value.id);
          
        if (error) throw error;
        
        router.push('/');
      } catch (error) {
        console.error('Greška pri brisanju igre:', error);
      } finally {
        deleting.value = false;
        showDeleteModal.value = false;
      }
    };
    
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleDateString('hr-HR');
    };
    
    onMounted(fetchGame);
    
    // Funkcija za dobivanje odgovarajuće slike igre
    const getGameImage = (game) => {
      if (!game) return 'https://placehold.co/600x400?text=No+Image';
      
      
      if (game.image_url) return game.image_url;
      if (game.background_image) return game.background_image;
      if (game.image) return game.image;
      
      // Ako je dostupan RAWG API ID -> konstruirati URL
      if (game.game_api_id) {
        // Provjerimo radi li se o validnom ID-u
        const apiId = parseInt(game.game_api_id);
        if (!isNaN(apiId) && apiGameDetails.value?.background_image) {
          return apiGameDetails.value.background_image;
        }
      }
      
      // ako zaj*b -> placeholder
      return 'https://placehold.co/600x400?text=No+Image';
    };
    
    return {
      game,
      loading,
      updating,
      deleting,
      showEditModal,
      showDeleteModal,
      apiGameDetails,
      screenshots,
      platforms,
      editForm,
      updateGame,
      confirmDelete,
      deleteGame,
      formatDate,
      getGameImage
    };
  }
};
</script>
