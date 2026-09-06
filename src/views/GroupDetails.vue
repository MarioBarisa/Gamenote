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
            <h1 class="text-3xl font-bold text-white drop-shadow-lg">{{ group.name }}</h1>
          </div>
        </figure>
        
        <div class="card-body">
          <div class="flex items-center gap-2 mb-2">
            <h1 v-if="gameImages.length === 0" class="text-2xl sm:text-3xl font-bold">{{ group.name }}</h1>
            <button class="btn btn-sm btn-ghost" @click="openRenameModal" title="Preimenuj grupu">
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

          <div class="mt-4 flex items-center gap-3 flex-wrap">
            <label class="label">Ocjena grupe</label>
            <div class="rating rating-sm">
              <input type="radio" name="group-rating" class="mask mask-star-2 bg-orange-400" value="1" v-model="groupRating" @change="saveRating" :disabled="savingRating" />
              <input type="radio" name="group-rating" class="mask mask-star-2 bg-orange-400" value="2" v-model="groupRating" @change="saveRating" :disabled="savingRating" />
              <input type="radio" name="group-rating" class="mask mask-star-2 bg-orange-400" value="3" v-model="groupRating" @change="saveRating" :disabled="savingRating" />
              <input type="radio" name="group-rating" class="mask mask-star-2 bg-orange-400" value="4" v-model="groupRating" @change="saveRating" :disabled="savingRating" />
              <input type="radio" name="group-rating" class="mask mask-star-2 bg-orange-400" value="5" v-model="groupRating" @change="saveRating" :disabled="savingRating" />
            </div>
            <span v-if="savingRating" class="loading loading-spinner loading-xs"></span>
            <span class="text-sm opacity-70">Ukupno vrijeme igranja:</span>
            <span class="badge badge-ghost gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ totalHours }}h
            </span>
            <span class="text-sm opacity-70">Prosječna ocjena:</span>
            <span class="badge badge-ghost gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {{ avgRatingText }}
            </span>
          </div>

          <div class="mt-4 flex gap-2">
            <button class="btn btn-primary" @click="showAddModal = true">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Dodaj igre
            </button>
            <button class="btn" :class="selectMode ? 'btn-primary' : 'btn-ghost'" @click="toggleSelectMode">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ selectMode ? 'Gotovo' : 'Odaberi' }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="showAddModal" class="modal modal-open">
        <div class="modal-box max-w-lg">
          <h3 class="font-bold text-lg">Dodaj igre u grupu</h3>
          <input v-model="addSearch" type="text" placeholder="Pretraži igre..." class="input input-bordered w-full mt-3" />
          <ul v-if="filteredAvailable.length" class="mt-3 max-h-72 overflow-y-auto space-y-1">
            <li v-for="game in filteredAvailable" :key="game.id">
              <label class="flex items-center gap-3 p-2 rounded-lg hover:bg-base-200 cursor-pointer" :class="{ 'bg-base-200': isAddSelected(game.id) }">
                <input type="checkbox" class="checkbox checkbox-primary checkbox-sm shrink-0" :checked="isAddSelected(game.id)" @change="toggleAddSelect(game.id)" />
                <span class="flex-1 min-w-0">
                  <span class="block truncate font-semibold text-sm">{{ game.title }}</span>
                  <span class="block text-xs opacity-60">{{ game.platform }}</span>
                </span>
              </label>
            </li>
          </ul>
          <p v-else class="text-sm opacity-70 mt-3">Nema dostupnih igara.</p>
          <div class="modal-action">
            <button class="btn" @click="closeAddModal" :disabled="adding">Odustani</button>
            <button class="btn btn-primary" @click="confirmAddGames" :disabled="addSelectedIds.size === 0 || adding">
              <span v-if="adding" class="loading loading-spinner loading-sm"></span>
              <span v-else>Dodaj ({{ addSelectedIds.size }})</span>
            </button>
          </div>
        </div>
        <form method="dialog" class="modal-backdrop">
          <button @click="closeAddModal">zatvori</button>
        </form>
      </div>

      <h2 class="text-xl font-semibold mb-4">Igre u grupi</h2>
      <div v-if="selectMode" class="flex items-center justify-between gap-2 mb-4 p-3 card bg-base-200 shadow">
        <span class="text-sm font-semibold">Odabrano: {{ selectedGameIds.size }}</span>
        <div class="flex gap-2">
          <button class="btn btn-sm btn-ghost" @click="toggleSelectMode">Poništi</button>
          <button class="btn btn-sm btn-error" @click="showBulkDeleteModal = true" :disabled="selectedGameIds.size === 0 || bulkRemoving">
            Obriši odabrane ({{ selectedGameIds.size }})
          </button>
        </div>
      </div>
      <div v-if="groupGames.length === 0" class="card bg-base-200 shadow-xl">
        <div class="card-body text-center">
          <p class="text-sm opacity-70">Nema igara u grupi.</p>
        </div>
      </div>
      <div :class="['grid', cardSizeStore.getSizeConfig(cardSizeStore.cardSize).container, cardSizeStore.getSizeConfig(cardSizeStore.cardSize).gap]">
        <template v-for="gg in groupGames" :key="gg.id">
          <div v-if="gg.games" class="relative cursor-pointer rounded-box" :class="{ 'ring-2 ring-primary': isSelected(gg.games.id) }" @click="selectMode ? toggleSelect(gg.games.id) : navigateToGame(gg.games.id)">
            <GameCard :game="gg.games" />
            <span v-if="selectMode" class="absolute top-2 left-2 z-10 size-7 rounded-full shadow-lg flex items-center justify-center transition-all" :class="isSelected(gg.games.id) ? 'bg-primary text-primary-content' : 'bg-black/50 border-2 border-white/70'" aria-hidden="true">
              <svg v-if="isSelected(gg.games.id)" xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
              </svg>
            </span>
          </div>
        </template>
      </div>
    </div>

    <div v-if="showBulkDeleteModal" class="modal modal-open">
      <div class="modal-box">
        <h3 class="font-bold text-lg">Ukloni igre iz grupe?</h3>
        <p class="py-3 text-sm">
          Jeste li sigurni da želite ukloniti
          <strong>{{ selectedGameIds.size }} {{ selectedGameIds.size === 1 ? 'igru' : (selectedGameIds.size % 10 >= 2 && selectedGameIds.size % 10 <= 4 && (selectedGameIds.size % 100 < 12 || selectedGameIds.size % 100 > 14) ? 'igre' : 'igara') }}</strong>
          iz grupe "{{ group?.name }}"? Igre ostaju u vašoj kolekciji.
        </p>
        <ul class="max-h-48 overflow-y-auto space-y-1 mb-2 text-sm opacity-80 list-disc list-inside">
          <li v-for="sg in selectedGames" :key="sg.games.id">{{ sg.games.title }}</li>
        </ul>
        <div class="modal-action">
          <button @click="showBulkDeleteModal = false" class="btn" :disabled="bulkRemoving">Odustani</button>
          <button @click="removeSelected" class="btn btn-error" :disabled="bulkRemoving">
            <span v-if="bulkRemoving" class="loading loading-spinner loading-sm"></span>
            <span v-else>Ukloni ({{ selectedGameIds.size }})</span>
          </button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button @click="showBulkDeleteModal = false">zatvori</button>
      </form>
    </div>

    <div v-if="showRenameModal" class="modal modal-open">
      <div class="modal-box">
        <h3 class="font-bold text-lg">Preimenuj grupu</h3>
        <input v-model="renameInput" type="text" placeholder="Naziv grupe" class="input input-bordered w-full mt-3" @keyup.enter="confirmRename" />
        <div class="modal-action">
          <button class="btn" @click="showRenameModal = false">Odustani</button>
          <button class="btn btn-primary" @click="confirmRename" :disabled="!renameInput.trim()">Spremi</button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button @click="showRenameModal = false">zatvori</button>
      </form>
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
import { useCardSizeStore } from '../stores/cardSize';
import { supabase } from '../supabase';
import GameCard from '../components/GameCard.vue';
import { getGroup, listGroupGames, updateGroup, removeGameFromGroup, addGameToGroup, deleteGroup } from '../services/groupsApi';

export default {
  components: { GameCard },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const userStore = useUserStore();
    const cardSizeStore = useCardSizeStore();
    const loading = ref(true);
    const savingRating = ref(false);
    const adding = ref(false);
    const deleting = ref(false);
    const group = ref(null);
    const groupGames = ref([]);
    const groupRating = ref(0);
    const allUserGames = ref([]);
    const showAddModal = ref(false);
    const showRenameModal = ref(false);
    const renameInput = ref('');
    const addSelectedIds = ref(new Set());
    const addSearch = ref('');
    const showDeleteModal = ref(false);
    const selectMode = ref(false);
    const selectedGameIds = ref(new Set());
    const showBulkDeleteModal = ref(false);
    const bulkRemoving = ref(false);

    const selectedGames = computed(() =>
      groupGames.value.filter(gg => gg.games && selectedGameIds.value.has(gg.games.id))
    );

    const gameImages = computed(() => {
      return groupGames.value
        .map(gg => gg.games?.background_image || gg.games?.image_url)
        .filter(img => img);
    });

    const availableGames = computed(() => {
      const gamesInGroup = new Set(groupGames.value.map(gg => gg.games?.id));
      return allUserGames.value.filter(game => !gamesInGroup.has(game.id));
    });

    const filteredAvailable = computed(() => {
      const q = addSearch.value.trim().toLowerCase();
      if (!q) return availableGames.value;
      return availableGames.value.filter(game => (game.title || '').toLowerCase().includes(q));
    });

    const totalHours = computed(() =>
      groupGames.value.reduce((sum, gg) => sum + (Number(gg.games?.play_time) || 0), 0)
    );

    const avgRatingText = computed(() => {
      const rated = groupGames.value
        .map(gg => Number(gg.games?.rating) || 0)
        .filter(r => r > 0);
      if (!rated.length) return '–';
      return (rated.reduce((a, b) => a + b, 0) / rated.length).toFixed(1);
    });

    const fetchAll = async () => {
      loading.value = true;
      try {
        if (!userStore.user) return;
        const g = await getGroup(route.params.id, userStore.user.id);
        group.value = g;
        groupRating.value = g?.rating || 0;
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

    const openRenameModal = () => {
      renameInput.value = group.value?.name || '';
      showRenameModal.value = true;
    };

    const confirmRename = async () => {
      if (!group.value || !userStore.user || !renameInput.value.trim()) return;
      try {
        await updateGroup(group.value.id, userStore.user.id, { name: renameInput.value.trim() });
        group.value.name = renameInput.value.trim();
        showRenameModal.value = false;
      } catch (e) {
        console.error('Error updating group name:', e);
      }
    };

    const isAddSelected = (gameId) => addSelectedIds.value.has(gameId);

    const toggleAddSelect = (gameId) => {
      if (addSelectedIds.value.has(gameId)) {
        addSelectedIds.value.delete(gameId);
      } else {
        addSelectedIds.value.add(gameId);
      }
    };

    const closeAddModal = () => {
      showAddModal.value = false;
      addSelectedIds.value.clear();
      addSearch.value = '';
    };

    const confirmAddGames = async () => {
      if (!userStore.user || !group.value || addSelectedIds.value.size === 0) return;
      adding.value = true;
      try {
        for (const gameId of addSelectedIds.value) {
          await addGameToGroup({
            user_id: userStore.user.id,
            group_id: group.value.id,
            game_id: gameId
          });
        }
        closeAddModal();
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

    const navigateToGame = (id) => {
      router.push(`/game/${id}`);
    };

    const toggleSelectMode = () => {
      selectMode.value = !selectMode.value;
      selectedGameIds.value.clear();
      showBulkDeleteModal.value = false;
    };

    const isSelected = (gameId) => selectedGameIds.value.has(gameId);

    const toggleSelect = (gameId) => {
      if (selectedGameIds.value.has(gameId)) {
        selectedGameIds.value.delete(gameId);
      } else {
        selectedGameIds.value.add(gameId);
      }
    };

    const removeSelected = async () => {
      if (!userStore.user || !group.value || selectedGameIds.value.size === 0) return;
      bulkRemoving.value = true;
      try {
        for (const gameId of selectedGameIds.value) {
          await removeGameFromGroup({ user_id: userStore.user.id, group_id: group.value.id, game_id: gameId });
        }
        selectedGameIds.value.clear();
        showBulkDeleteModal.value = false;
        selectMode.value = false;
        await fetchAll();
      } finally {
        bulkRemoving.value = false;
      }
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
      cardSizeStore,
      navigateToGame,
      selectMode,
      selectedGameIds,
      selectedGames,
      showBulkDeleteModal,
      bulkRemoving,
      toggleSelectMode,
      isSelected,
      toggleSelect,
      removeSelected,
      groupRating, 
      totalHours,
      avgRatingText,
      savingRating, 
      saveRating, 
      removeGame,
      gameImages,
      availableGames,
      filteredAvailable,
      showAddModal,
      addSelectedIds,
      addSearch,
      isAddSelected,
      toggleAddSelect,
      closeAddModal,
      confirmAddGames,
      adding,
      showRenameModal,
      renameInput,
      openRenameModal,
      confirmRename,
      showDeleteModal,
      deleting,
      confirmDelete,
      deleteGroupConfirmed
    };
  }
};
</script>
