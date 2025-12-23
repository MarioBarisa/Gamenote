// src/views/GameDetails.vue
<template>
  <div class="game-details">
    <div v-if="loading" class="flex justify-center my-8">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <div v-else-if="error" class="text-center my-8">
      <div class="alert alert-error shadow-lg max-w-md mx-auto">
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l-2-2m0 0l-2-2m2 2l2-2m-2 2l-2 2m2-2l2 2" />
        </svg>
        <div>
          <h3 class="font-bold">Greška</h3>
          <div class="text-sm">{{ error }}</div>
        </div>
      </div>
      <router-link to="/library" class="btn btn-primary mt-4">Natrag na biblioteku</router-link>
    </div>

    <div v-else-if="!game" class="text-center my-8">
      <p class="text-xl">Igra nije pronađena</p>
      <router-link to="/library" class="btn btn-primary mt-4">Natrag na biblioteku</router-link>
    </div>

    <div v-else-if="!editMode">
      <div class="flex flex-col lg:flex-row gap-4 mb-6">
        <div class="flex-none">
          <div class="card bg-base-200 shadow-xl w-full lg:w-80">
            <figure>
              <img :src="game.background_image || game.image_url || 'https://placehold.co/600x400?text=No+Image'" :alt="game.title" class="w-full h-auto" />
            </figure>
            <div class="card-body p-4">
              <h2 class="card-title text-lg sm:text-xl">{{ game.title }}</h2>
              <p><strong>Platforma:</strong> {{ getPlatforms() }}</p>
              <p><strong>Žanr:</strong> {{ getGenres() }}</p>
              <p><strong>Izdavač:</strong> {{ getPublishers() }}</p>

              <div class="mt-2" v-if="game.metacritic_score">
                <p><strong>Metacritic ocjena:</strong></p>
                <div class="radial-progress font-bold m-2" 
                  :class="getMetacriticColorClass(game.metacritic_score)"
                  :style="`--value:${game.metacritic_score || 0}`" 
                  :aria-valuenow="game.metacritic_score" 
                  role="progressbar">{{ game.metacritic_score }} / 100</div>
              </div>

              <div class="mt-2" v-if="game.rating">
                <p><strong>Vaša ocjena:</strong></p>
                <div class="rating rating-sm sm:rating-md lg:rating-lg">
                  <input type="radio" class="mask mask-star-2 bg-orange-400" :class="{ 'bg-orange-400': game.rating >= 1, 'bg-gray-300': game.rating < 1 }" disabled />
                  <input type="radio" class="mask mask-star-2 bg-orange-400" :class="{ 'bg-orange-400': game.rating >= 2, 'bg-gray-300': game.rating < 2 }" disabled />
                  <input type="radio" class="mask mask-star-2 bg-orange-400" :class="{ 'bg-orange-400': game.rating >= 3, 'bg-gray-300': game.rating < 3 }" disabled />
                  <input type="radio" class="mask mask-star-2 bg-orange-400" :class="{ 'bg-orange-400': game.rating >= 4, 'bg-gray-300': game.rating < 4 }" disabled />
                  <input type="radio" class="mask mask-star-2 bg-orange-400" :class="{ 'bg-orange-400': game.rating >= 5, 'bg-gray-300': game.rating < 5 }" disabled />
                </div>
              </div>

              <div class="mt-2" v-if="game.play_time">
                <p><strong>Vrijeme igranja:</strong> {{ game.play_time }} sati</p>
              </div>

              <div class="card-actions justify-between mt-4 flex-col sm:flex-row gap-2">
                <button @click="enterEditMode" class="btn btn-primary w-full sm:w-auto">Uredi</button>
                <button @click="confirmDelete" class="btn btn-error w-full sm:w-auto">Obriši</button>
              </div>
            </div>
          </div>
        </div>

        <div class="flex-1">
          <div class="card bg-base-200 shadow-xl h-full">
            <div class="mt-8">
              <h2 class="text-2xl font-bold mb-4 ml-4">Dodatne informacije</h2>

              <div class="card bg-base-200 shadow-xl">
                <div class="card-body">
                  <div class="grid grid-cols-1 gap-4">
                    <div>
                      <h3 class="text-lg font-bold">Opis</h3>
                      <p>{{ game.description || game.notes || 'Nema opisa.' }}</p>
                    </div>
                  </div>

                  <div class="mt-6" v-if="seriesGames.length > 0">
                    <h3 class="text-lg font-bold mb-2">Serija igara</h3>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
                      <div v-if="previousGame" class="card bg-base-100 shadow-sm">
                        <figure class="px-4 pt-4">
                          <img 
                            :src="previousGame.background_image || 'https://placehold.co/300x200?text=No+Image'" 
                            :alt="previousGame.name" 
                            class="rounded-lg w-full h-32 object-cover"
                          />
                        </figure>
                        <div class="card-body p-4">
                          <h4 class="card-title text-sm">{{ previousGame.name }}</h4>
                          <p class="text-xs text-gray-500">Prethodna igra • {{ formatDate(previousGame.released) }}</p>
                        </div>
                      </div>
                      
                      <div v-if="nextGame" class="card bg-base-100 shadow-sm">
                        <figure class="px-4 pt-4">
                          <img 
                            :src="nextGame.background_image || 'https://placehold.co/300x200?text=No+Image'" 
                            :alt="nextGame.name" 
                            class="rounded-lg w-full h-32 object-cover"
                          />
                        </figure>
                        <div class="card-body p-4">
                          <h4 class="card-title text-sm">{{ nextGame.name }}</h4>
                          <p class="text-xs text-gray-500">Sljedeća igra • {{ formatDate(nextGame.released) }}</p>
                        </div>
                      </div>

                      <div v-if="!previousGame" class="card bg-base-100 shadow-sm">
                        <div class="card-body p-4 text-center">
                          <p class="text-sm text-gray-500">Nema prethodne igre u seriji</p>
                        </div>
                      </div>
                      
                      <div v-if="!nextGame" class="card bg-base-100 shadow-sm">
                        <div class="card-body p-4 text-center">
                          <p class="text-sm text-gray-500">Ova igra je najnovija u seriji! 😊</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="mt-6" v-if="screenshots.length > 0">
                    <h3 class="text-lg font-bold mb-2">Slike igre</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div v-for="(screenshot, index) in screenshots" :key="index" class="relative">
                        <img 
                          :src="screenshot" 
                          :alt="`Screenshot ${index + 1}`" 
                          class="w-full h-auto rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                          @click="openScreenshotModal(index)"
                        />
                      </div>
                    </div>
                  </div>

                  <div v-if="selectedScreenshotIndex !== null" class="modal modal-open">
                    <div class="modal-box max-w-5xl">
                      <div class="relative">
                        <img :src="screenshots[selectedScreenshotIndex]" alt="Enlarged Screenshot" class="w-full h-auto rounded-lg" />
                        
                        <button 
                          v-if="screenshots.length > 1"
                          @click="previousScreenshot" 
                          class="absolute left-2 top-1/2 transform -translate-y-1/2 btn btn-circle btn-ghost bg-black bg-opacity-50 text-white hover:bg-opacity-75"
                        >
                          ❮
                        </button>
                        
                        <button 
                          v-if="screenshots.length > 1"
                          @click="nextScreenshot" 
                          class="absolute right-2 top-1/2 transform -translate-y-1/2 btn btn-circle btn-ghost bg-black bg-opacity-50 text-white hover:bg-opacity-75"
                        >
                          ❯
                        </button>
                        
                        <div class="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded">
                          {{ selectedScreenshotIndex + 1 }} / {{ screenshots.length }}
                        </div>
                      </div>
                      
                      <div class="modal-action">
                        <button @click="closeScreenshotModal" class="btn">Zatvori</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else>
      <div class="card bg-base-200 shadow-xl">
        <div class="card-body">
          <h2 class="text-2xl font-bold mb-6 text-center">Uredi igru</h2>
          
          <form @submit.prevent="saveGame" class="game-form">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="form-control">
                <label class="label font-medium">Naziv</label>
                <input type="text" v-model="editForm.title" class="input input-bordered" required />
              </div>
              
              <div class="form-control">
                <label class="label font-medium">Platforma</label>
                <select v-model="editForm.platform" class="select select-bordered" required>
                  <option value="" disabled>Odaberi platformu</option>
                  <option v-for="platform in platforms" :key="platform" :value="platform">
                    {{ platform }}
                  </option>
                </select>
              </div>
              
              <div class="form-control">
                <label class="label font-medium">Žanr</label>
                <input type="text" v-model="editForm.genre" class="input input-bordered" />
              </div>
              
              <div class="form-control">
                <label class="label font-medium">Izdavač</label>
                <input type="text" v-model="editForm.publisher" class="input input-bordered" />
              </div>
              
              <div class="form-control">
                <label class="label font-medium">Vrijeme igranja (sati)</label>
                <input type="number" v-model="editForm.play_time" class="input input-bordered" min="0" />
              </div>
              
              <div class="form-control">
                <label class="label font-medium">Ocjena (1-5)</label>
                <div class="rating rating-lg">
                  <input type="radio" name="edit-rating" class="mask mask-star-2 bg-orange-400" value="1" v-model="editForm.rating" />
                  <input type="radio" name="edit-rating" class="mask mask-star-2 bg-orange-400" value="2" v-model="editForm.rating" />
                  <input type="radio" name="edit-rating" class="mask mask-star-2 bg-orange-400" value="3" v-model="editForm.rating" />
                  <input type="radio" name="edit-rating" class="mask mask-star-2 bg-orange-400" value="4" v-model="editForm.rating" />
                  <input type="radio" name="edit-rating" class="mask mask-star-2 bg-orange-400" value="5" v-model="editForm.rating" />
                </div>
              </div>
              
              <div class="form-control">
                <label class="label font-medium">Postotak achievementa (%)</label>
                <input type="number" v-model="editForm.achievement_percent" class="input input-bordered" min="0" max="100" />
              </div>
              
              <div class="form-control">
                <label class="label font-medium">Datum početka</label>
                <input type="date" v-model="editForm.start_date" class="input input-bordered" />
              </div>
              
              <div class="form-control">
                <label class="label font-medium">Datum završetka</label>
                <input type="date" v-model="editForm.end_date" class="input input-bordered" />
              </div>
              
              <div class="form-control">
                <label class="flex items-center cursor-pointer mt-8">
                  <input type="checkbox" v-model="editForm.currently_playing" class="checkbox checkbox-primary" />
                  <span class="label-text ml-2 text-lg">Trenutno igram</span>
                </label>
              </div>
            </div>
            
            <div class="form-control mt-6">
              <label class="label font-medium">Bilješke</label>
              <textarea v-model="editForm.notes" class="textarea textarea-bordered h-32"></textarea>
            </div>
            
            <div class="flex gap-4 mt-8 justify-center">
              <button type="submit" class="btn btn-primary" :disabled="saveLoading">
                <span v-if="saveLoading" class="loading loading-spinner"></span>
                <span v-else>Spremi promjene</span>
              </button>
              <button type="button" @click="cancelEdit" class="btn btn-secondary">
                Odustani
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    <div v-if="showDeleteModal" class="modal modal-open">
      <div class="modal-box">
        <h3 class="font-bold text-lg">Potvrdi brisanje</h3>
        <p class="py-4">Jeste li sigurni da želite obrisati igru "{{ game.title }}"?</p>
        <div class="modal-action">
          <button @click="deleteGame" class="btn btn-error" :disabled="deleteLoading">
            <span v-if="deleteLoading" class="loading loading-spinner"></span>
            <span v-else>Obriši</span>
          </button>
          <button @click="showDeleteModal = false" class="btn">Odustani</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, reactive, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { supabase } from '../supabase';

export default {
  props: {
    editMode: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const route = useRoute();
    const router = useRouter();
    
    const game = ref(null);
    const loading = ref(true);
    const error = ref(null);
    const saveLoading = ref(false);
    const deleteLoading = ref(false);
    const editMode = ref(props.editMode);
    const showDeleteModal = ref(false);
    const selectedScreenshotIndex = ref(null);
    
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
      loading.value = true;
      error.value = null;
      
      try {
        const { data, error: fetchError } = await supabase
          .from('games')
          .select('*')
          .eq('id', gameId)
          .single();

        if (fetchError) {
          error.value = 'Igra nije pronađena u bazi podataka';
          throw fetchError;
        }
        
        game.value = data;

        if (data) {
          Object.keys(editForm).forEach(key => {
            if (data[key] !== null && data[key] !== undefined) {
              editForm[key] = data[key];
            }
          });

          if (data.start_date) {
            editForm.start_date = new Date(data.start_date).toISOString().split('T')[0];
          }
          if (data.end_date) {
            editForm.end_date = new Date(data.end_date).toISOString().split('T')[0];
          }
        }
      } catch (fetchError) {
        console.error('Error fetching game:', fetchError);
        error.value = error.value || 'Greška pri učitavanju igre';
      } finally {
        loading.value = false;
      }
    };

    const enterEditMode = () => {
      editMode.value = true;
    };

    const cancelEdit = () => {
      editMode.value = false;
      if (game.value) {
        Object.keys(editForm).forEach(key => {
          if (game.value[key] !== null && game.value[key] !== undefined) {
            editForm[key] = game.value[key];
          }
        });
      }
    };

    const saveGame = async () => {
      try {
        saveLoading.value = true;
        
        const updateData = {
          title: editForm.title,
          platform: editForm.platform,
          play_time: editForm.play_time || null,
          genre: editForm.genre,
          publisher: editForm.publisher,
          rating: editForm.rating || null,
          achievement_percent: editForm.achievement_percent || null,
          notes: editForm.notes,
          start_date: editForm.start_date || null,
          end_date: editForm.end_date || null,
          currently_playing: editForm.currently_playing,
          updated_at: new Date().toISOString()
        };

        const { error } = await supabase
          .from('games')
          .update(updateData)
          .eq('id', game.value.id);

        if (error) throw error;

        game.value = { ...game.value, ...updateData };
        editMode.value = false;
      } catch (error) {
        console.error('Error updating game:', error);
      } finally {
        saveLoading.value = false;
      }
    };

    const confirmDelete = () => {
      showDeleteModal.value = true;
    };

    const deleteGame = async () => {
      try {
        deleteLoading.value = true;
        
        const { error } = await supabase
          .from('games')
          .delete()
          .eq('id', game.value.id);

        if (error) throw error;

        router.push('/library');
      } catch (error) {
        console.error('Error deleting game:', error);
      } finally {
        deleteLoading.value = false;
        showDeleteModal.value = false;
      }
    };

    const screenshots = computed(() => {
      if (!game.value?.screenshot_urls) return [];
      try {
        return JSON.parse(game.value.screenshot_urls);
      } catch {
        return [];
      }
    });

    const seriesGames = computed(() => {
      if (!game.value?.series_games) return [];
      try {
        return JSON.parse(game.value.series_games);
      } catch {
        return [];
      }
    });

    const previousGame = computed(() => {
      if (!game.value?.release_date || seriesGames.value.length === 0) return null;
      
      const currentDate = new Date(game.value.release_date);
      const gamesWithDates = seriesGames.value.filter(g => g.released);
      const sortedGames = gamesWithDates.sort((a, b) => new Date(a.released) - new Date(b.released));
      
      let previous = null;
      for (const seriesGame of sortedGames) {
        const gameDate = new Date(seriesGame.released);
        if (gameDate < currentDate) {
          previous = seriesGame;
        } else {
          break;
        }
      }
      
      return previous;
    });

    const nextGame = computed(() => {
      if (!game.value?.release_date || seriesGames.value.length === 0) return null;
      
      const currentDate = new Date(game.value.release_date);
      const gamesWithDates = seriesGames.value.filter(g => g.released);
      const sortedGames = gamesWithDates.sort((a, b) => new Date(a.released) - new Date(b.released));
      
      for (const seriesGame of sortedGames) {
        const gameDate = new Date(seriesGame.released);
        if (gameDate > currentDate) {
          return seriesGame;
        }
      }
      
      return null;
    });
    
    const openScreenshotModal = (index) => {
      selectedScreenshotIndex.value = index;
    };
    
    const closeScreenshotModal = () => {
      selectedScreenshotIndex.value = null;
    };
    
    const previousScreenshot = () => {
      if (selectedScreenshotIndex.value > 0) {
        selectedScreenshotIndex.value--;
      } else {
        selectedScreenshotIndex.value = screenshots.value.length - 1;
      }
    };
    
    const nextScreenshot = () => {
      if (selectedScreenshotIndex.value < screenshots.value.length - 1) {
        selectedScreenshotIndex.value++;
      } else {
        selectedScreenshotIndex.value = 0;
      }
    };

    const getPlatforms = () => {
      if (!game.value?.platforms_list) return game.value?.platform || 'N/A';
      try {
        const platforms = JSON.parse(game.value.platforms_list);
        return platforms.join(', ') || game.value?.platform || 'N/A';
      } catch {
        return game.value?.platform || 'N/A';
      }
    };
    
    const getGenres = () => {
      if (!game.value?.genres_list) return game.value?.genre || 'N/A';
      try {
        const genres = JSON.parse(game.value.genres_list);
        return genres.join(', ') || game.value?.genre || 'N/A';
      } catch {
        return game.value?.genre || 'N/A';
      }
    };
    
    const getPublishers = () => {
      if (!game.value?.publishers_list) return game.value?.publisher || 'N/A';
      try {
        const publishers = JSON.parse(game.value.publishers_list);
        return publishers.join(', ') || game.value?.publisher || 'N/A';
      } catch {
        return game.value?.publisher || 'N/A';
      }
    };
    
    const getMetacriticColorClass = (score) => {
      if (!score) return 'text-gray-400 border-gray-300';
      
      if (score >= 90) return 'text-green-700 [--size:7rem] [--thickness:0.6rem] bg-base-200 border-green-900';
      if (score >= 80) return 'text-green-600 [--size:7rem] [--thickness:0.6rem] bg-base-200 border-green-700';
      if (score >= 70) return 'text-green-500 [--size:7rem] [--thickness:0.6rem] bg-base-200 border-green-500';
      if (score >= 60) return 'text-yellow-500 [--size:7rem] [--thickness:0.6rem] bg-base-200 border-yellow-500';
      if (score >= 50) return 'text-yellow-600 [--size:7rem] [--thickness:0.6rem] bg-base-200 border-yellow-600';
      if (score >= 40) return 'text-orange-500 [--size:7rem] [--thickness:0.6rem] bg-base-200 border-orange-500';
      
      return 'text-red-500 [--size:7rem] [--thickness:0.8rem] bg-base-200 border-red-500';
    };
    
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleDateString('hr-HR');
    };
    
    // Watch for route parameter changes (when user navigates to different game)
    watch(() => route.params.id, (newId, oldId) => {
      if (newId && newId !== oldId) {
        fetchGame();
      }
    });
    
    onMounted(fetchGame);
    
    return {
      game,
      loading,
      error,
      saveLoading,
      deleteLoading,
      editMode,
      showDeleteModal,
      platforms,
      editForm,
      screenshots,
      seriesGames,
      previousGame,
      nextGame,
      selectedScreenshotIndex,
      enterEditMode,
      cancelEdit,
      saveGame,
      confirmDelete,
      deleteGame,
      openScreenshotModal,
      closeScreenshotModal,
      previousScreenshot,
      nextScreenshot,
      getPlatforms,
      getGenres,
      getPublishers,
      getMetacriticColorClass,
      formatDate
    };
  }
};
</script>
