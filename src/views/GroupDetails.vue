<template>
  <div class="group-details">
    <div v-if="loading" class="flex justify-center py-8">
      <span class="loading loading-spinner loading-lg"></span>
    </div>
    <div v-else-if="!group" class="text-sm opacity-70">Grupa nije pronađena.</div>
    <div v-else>
      <div class="card bg-base-200 shadow-xl mb-6 overflow-hidden">
        <figure v-if="gameImages.length > 0" class="relative h-48 overflow-hidden">
          <div class="flex w-full h-full">
            <div 
              v-for="(img, idx) in gameImages.slice(0, 4)" 
              :key="idx"
              class="flex-1 bg-cover bg-center"
              :style="{ backgroundImage: `url(${img})` }"
            ></div>
          </div>
          <div class="absolute inset-0 bg-gradient-to-t from-base-200 via-base-200/50 to-transparent"></div>
          <div class="absolute bottom-4 left-4 right-4">
            <h1 v-if="!editingName" class="text-3xl font-bold text-white drop-shadow-lg">{{ group.name }}</h1>
          </div>
        </figure>
        
        <div class="card-body">
          <div class="flex items-center gap-2 mb-2">
            <h1 v-if="!editingName && gameImages.length === 0" class="text-2xl sm:text-3xl font-bold">{{ group.name }}</h1>
            <div v-if="editingName" class="flex gap-2 flex-1">
              <input v-model="editedName" class="input input-bordered flex-1" placeholder="Naziv grupe" />
              <button class="btn btn-sm btn-primary" @click="saveName">Spremi</button>
              <button class="btn btn-sm btn-ghost" @click="cancelEditName">Odustani</button>
            </div>
            <button v-if="!editingName" class="btn btn-sm btn-ghost" @click="startEditName">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            <button class="btn btn-sm btn-error" @click="confirmDelete">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>

          <div class="flex items-center gap-3 flex-wrap">
            <span class="badge badge-outline">{{ group.type }}</span>
            <span class="text-sm opacity-70">{{ groupGames.length }} igre/a</span>
          </div>

          <div class="mt-4 flex items-center gap-3">
            <label class="label">Ocjena grupe</label>
            <div class="rating rating-sm">
              <input type="radio" name="group-rating" class="mask mask-star-2 bg-orange-400" value="1" v-model="groupRating"/>
              <input type="radio" name="group-rating" class="mask mask-star-2 bg-orange-400" value="2" v-model="groupRating"/>
              <input type="radio" name="group-rating" class="mask mask-star-2 bg-orange-400" value="3" v-model="groupRating"/>
              <input type="radio" name="group-rating" class="mask mask-star-2 bg-orange-400" value="4" v-model="groupRating"/>
              <input type="radio" name="group-rating" class="mask mask-star-2 bg-orange-400" value="5" v-model="groupRating"/>
            </div>
            <button class="btn btn-sm btn-primary" @click="saveRating" :disabled="savingRating">Spremi</button>
          </div>
        </div>
      </div>

      <div class="card bg-base-200 shadow-xl mb-6">
        <div class="card-body">
          <h2 class="text-xl font-semibold mb-3">Dodaj igru</h2>
          <div class="flex gap-2">
            <select v-model="selectedGameId" class="select select-bordered flex-1">
              <option value="" disabled>Odaberi igru...</option>
              <option v-for="game in availableGames" :key="game.id" :value="game.id">
                {{ game.title }} ({{ game.platform }})
              </option>
            </select>
            <button class="btn btn-primary" @click="addGame" :disabled="!selectedGameId || adding">
              <span v-if="adding" class="loading loading-spinner"></span>
              <span v-else>Dodaj</span>
            </button>
          </div>
        </div>
      </div>

      <h2 class="text-xl font-semibold mb-4">Igre u grupi</h2>
      <div v-if="groupGames.length === 0" class="card bg-base-200 shadow-xl">
        <div class="card-body text-center">
          <p class="text-sm opacity-70">Nema igara u grupi.</p>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="gg in groupGames" :key="gg.id" class="card bg-base-200 shadow-xl hover:shadow-2xl transition-all">
          <figure v-if="gg.games?.background_image || gg.games?.image_url" class="h-32">
            <img :src="gg.games?.background_image || gg.games?.image_url" :alt="gg.games?.title" class="w-full h-full object-cover" />
          </figure>
          <div class="card-body p-4">
            <h3 class="font-bold">{{ gg.games?.title || 'Igra' }}</h3>
            <p class="text-xs opacity-70">{{ gg.games?.platform }}</p>
            <div v-if="gg.games?.rating" class="flex items-center gap-1 mt-1">
              <div class="rating rating-xs">
                <input v-for="star in 5" :key="star" type="radio" class="mask mask-star-2 bg-orange-400" :checked="star <= gg.games.rating" disabled />
              </div>
              <span class="text-xs opacity-70">{{ gg.games.rating }}/5</span>
            </div>
            <div class="card-actions justify-end mt-2">
              <button class="btn btn-xs btn-error" @click="removeGame(gg.games.id)">Makni</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showDeleteModal" class="modal modal-open">
      <div class="modal-box">
        <h3 class="font-bold text-lg">Potvrdi brisanje</h3>
        <p class="py-4">Jeste li sigurni da želite obrisati grupu "{{ group.name }}"? Sve igre će biti uklonjene iz grupe.</p>
        <div class="modal-action">
          <button @click="deleteGroupConfirmed" class="btn btn-error" :disabled="deleting">
            <span v-if="deleting" class="loading loading-spinner"></span>
            <span v-else>Obriši</span>
          </button>
          <button @click="showDeleteModal = false" class="btn">Odustani</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';
import { supabase } from '../supabase';
import { getGroup, listGroupGames, updateGroup, removeGameFromGroup, addGameToGroup, deleteGroup } from '../services/groupsApi';

export default {
  setup() {
    const route = useRoute();
    const router = useRouter();
    const userStore = useUserStore();
    const loading = ref(true);
    const savingRating = ref(false);
    const adding = ref(false);
    const deleting = ref(false);
    const group = ref(null);
    const groupGames = ref([]);
    const groupRating = ref(0);
    const allUserGames = ref([]);
    const selectedGameId = ref('');
    const editingName = ref(false);
    const editedName = ref('');
    const showDeleteModal = ref(false);

    const gameImages = computed(() => {
      return groupGames.value
        .map(gg => gg.games?.background_image || gg.games?.image_url)
        .filter(img => img);
    });

    const availableGames = computed(() => {
      const gamesInGroup = new Set(groupGames.value.map(gg => gg.games?.id));
      return allUserGames.value.filter(game => !gamesInGroup.has(game.id));
    });

    const fetchAll = async () => {
      loading.value = true;
      try {
        if (!userStore.user) return;
        const g = await getGroup(route.params.id, userStore.user.id);
        group.value = g;
        groupRating.value = g?.rating || 0;
        editedName.value = g?.name || '';
        groupGames.value = await listGroupGames(route.params.id, userStore.user.id);
        
        // FETCHAJ SVE IGRE
        const { data } = await supabase
          .from('games')
          .select('*')
          .eq('user_id', userStore.user.id)
          .order('title');
        allUserGames.value = data || [];
      } finally {
        loading.value = false;
      }
    };

    const saveRating = async () => {
      if (!group.value || !userStore.user) return;
      savingRating.value = true;
      try {
        await updateGroup(group.value.id, userStore.user.id, { rating: Number(groupRating.value) || null });
      } finally {
        savingRating.value = false;
      }
    };

    const startEditName = () => {
      editingName.value = true;
      editedName.value = group.value?.name || '';
    };

    const cancelEditName = () => {
      editingName.value = false;
      editedName.value = group.value?.name || '';
    };

    const saveName = async () => {
      if (!group.value || !userStore.user || !editedName.value.trim()) return;
      try {
        await updateGroup(group.value.id, userStore.user.id, { name: editedName.value.trim() });
        group.value.name = editedName.value.trim();
        editingName.value = false;
      } catch (e) {
        console.error('Error updating group name:', e);
      }
    };

    const addGame = async () => {
      if (!selectedGameId.value || !userStore.user || !group.value) return;
      adding.value = true;
      try {
        await addGameToGroup({ 
          user_id: userStore.user.id, 
          group_id: group.value.id, 
          game_id: selectedGameId.value 
        });
        selectedGameId.value = '';
        await fetchAll();
      } finally {
        adding.value = false;
      }
    };

    const removeGame = async (gameId) => {
      if (!userStore.user || !group.value) return;
      await removeGameFromGroup({ user_id: userStore.user.id, group_id: group.value.id, game_id: gameId });
      await fetchAll();
    };

    const confirmDelete = () => {
      showDeleteModal.value = true;
    };

    const deleteGroupConfirmed = async () => {
      if (!group.value || !userStore.user) return;
      deleting.value = true;
      try {
        await deleteGroup(group.value.id, userStore.user.id);
        router.push('/groups');
      } finally {
        deleting.value = false;
        showDeleteModal.value = false;
      }
    };

    onMounted(fetchAll);

    return { 
      loading, 
      group, 
      groupGames, 
      groupRating, 
      savingRating, 
      saveRating, 
      removeGame,
      gameImages,
      availableGames,
      selectedGameId,
      adding,
      addGame,
      editingName,
      editedName,
      startEditName,
      cancelEditName,
      saveName,
      showDeleteModal,
      deleting,
      confirmDelete,
      deleteGroupConfirmed
    };
  }
};
</script>
