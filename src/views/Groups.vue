<template>
  <div v-if="error" role="alert" class="alert alert-error mb-4">{{ error }}</div>
  <div class="groups-page">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
      <h1 class="text-2xl sm:text-3xl font-bold">Grupe</h1>
      <button class="btn btn-primary w-full sm:w-auto" @click="showCreateModal = true">
        Dodaj grupu
      </button>
    </div>

    <!-- Create Group Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div class="card bg-base-200 shadow-2xl w-full max-w-md">
        <div class="card-body space-y-4">
          <div class="flex justify-between items-start">
            <h2 class="text-lg font-bold">Nova grupa</h2>
            <button class="btn btn-ghost btn-sm" @click="closeCreateModal">✕</button>
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text">Naziv grupe</span></label>
            <input v-model="newGroupName" class="input input-bordered w-full" placeholder="npr. Soulslike kolekcija" />
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text">Vrsta grupe</span></label>
            <select v-model="newGroupType" class="select select-bordered w-full">
              <option value="collection">Collection</option>
              <option value="franchise">Franchise</option>
              <option value="trilogy">Trilogy</option>
            </select>
          </div>
          <div class="flex justify-end gap-2 pt-2">
            <button class="btn btn-ghost" @click="closeCreateModal">Odustani</button>
            <button class="btn btn-primary" @click="createNewGroup" :disabled="creating || !newGroupName.trim()">
              <span v-if="creating" class="loading loading-spinner"></span>
              <span v-else>Kreiraj</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Groups List -->
    <LoadingCardGrid v-if="loading" :layout="groupLayout" variant="groups" banner label="Učitavam grupe…" />
    <div v-else>
      <div v-if="groups.length === 0" class="card bg-base-200 shadow-xl">
        <div class="card-body text-center">
          <p class="text-sm opacity-70">Nema grupa. Kreiraj prvu!</p>
        </div>
      </div>
      <div class="grid" :class="[groupLayout.container, groupLayout.gap]">
        <GroupCard v-for="group in groupsWithGames" :key="group.id" :group="group" @open="openGroup(group.id)" />
      </div>
    </div>
  </div>
</template>

<script>
import LoadingCardGrid from '../components/LoadingCardGrid.vue';
import GroupCard from '../components/GroupCard.vue';
import { GROUP_LAYOUT } from '../constants/groupLayout.js';
import { supabase } from '../supabase';
import { fetchUserRows } from '../services/libraryData';
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';
import { listGroups, createGroup } from '../services/groupsApi';

export default {
  components: { LoadingCardGrid, GroupCard },
  setup() {
    const groupLayout = GROUP_LAYOUT;
    const router = useRouter();
    const userStore = useUserStore();
    const loading = ref(true);
    const creating = ref(false);
    const groups = ref([]);
    const groupGamesMap = ref({});
    const newGroupName = ref('');
    const newGroupType = ref('collection');
    const showCreateModal = ref(false);

    const error = ref('');
    const fetchGroups = async () => {
      error.value = '';
      loading.value = true;
      try {
        if (!userStore.user) return;
        groups.value = await listGroups(userStore.user.id);
        
        const links = await fetchUserRows(supabase, 'game_groups', userStore.user.id, { columns: '*, games:game_id(*)' });
        const map = {};
        for (const link of links) {
          if (!map[link.group_id]) map[link.group_id] = [];
          map[link.group_id].push(link);
        }
        groupGamesMap.value = map;
      } catch (failure) {
        error.value = failure.message || 'Grupe nije moguće učitati.';
      } finally {
        loading.value = false;
      }
    };

    const groupsWithGames = computed(() => {
      return groups.value.map(group => {
        const games = groupGamesMap.value[group.id] || [];
        const gameImages = games
          .map(gg => gg.games?.background_image || gg.games?.image_url)
          .filter(img => img);
        
        return {
          ...group,
          gameImages,
          gameCount: games.length
        };
      });
    });

    const createNewGroup = async () => {
      if (!newGroupName.value.trim() || !userStore.user) return;
      creating.value = true;
      try {
        await createGroup({ user_id: userStore.user.id, name: newGroupName.value.trim(), type: newGroupType.value });
        newGroupName.value = '';
        newGroupType.value = 'collection';
        showCreateModal.value = false;
        await fetchGroups();
      } catch (failure) {
        error.value = failure.message || 'Grupa nije spremljena.';
      } finally {
        creating.value = false;
      }
    };

    const closeCreateModal = () => {
      showCreateModal.value = false;
    };

    const openGroup = (id) => router.push(`/groups/${id}`);

    onMounted(fetchGroups);

    return {
      groupLayout,
      error, loading,
      creating, 
      groups, 
      groupsWithGames,
      newGroupName, 
      newGroupType, 
      createNewGroup, 
      openGroup,
      showCreateModal,
      closeCreateModal
    };
  }
};
</script>
