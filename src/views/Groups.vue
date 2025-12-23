<template>
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
    <div v-if="loading" class="flex justify-center py-8">
      <span class="loading loading-spinner loading-lg"></span>
    </div>
    <div v-else>
      <div v-if="groups.length === 0" class="card bg-base-200 shadow-xl">
        <div class="card-body text-center">
          <p class="text-sm opacity-70">Nema grupa. Kreiraj prvu!</p>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div 
          v-for="g in groupsWithGames" 
          :key="g.id" 
          class="card bg-base-200 shadow-xl hover:shadow-2xl transition-all cursor-pointer overflow-hidden"
          @click="openGroup(g.id)"
        >
          <!-- Game Images Banner -->
          <figure v-if="g.gameImages && g.gameImages.length > 0" class="relative h-32 overflow-hidden">
            <div class="flex w-full h-full">
              <div 
                v-for="(img, idx) in g.gameImages.slice(0, 4)" 
                :key="idx"
                class="flex-1 bg-cover bg-center"
                :style="{ backgroundImage: `url(${img})` }"
              ></div>
            </div>
            <div class="absolute inset-0 bg-gradient-to-t from-base-200 to-transparent"></div>
          </figure>
          
          <div class="card-body p-4">
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <h3 class="font-bold text-lg">{{ g.name }}</h3>
                <div class="flex items-center gap-2 mt-1">
                  <span class="badge badge-sm badge-outline">{{ g.type }}</span>
                  <span v-if="g.gameCount > 0" class="text-xs opacity-70">{{ g.gameCount }} igre/a</span>
                </div>
                <div v-if="g.rating" class="flex items-center gap-1 mt-2">
                  <div class="rating rating-xs">
                    <input v-for="star in 5" :key="star" type="radio" class="mask mask-star-2 bg-orange-400" :checked="star <= g.rating" disabled />
                  </div>
                  <span class="text-xs opacity-70">{{ g.rating }}/5</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';
import { listGroups, createGroup, listGroupGames } from '../services/groupsApi';

export default {
  setup() {
    const router = useRouter();
    const userStore = useUserStore();
    const loading = ref(true);
    const creating = ref(false);
    const groups = ref([]);
    const groupGamesMap = ref({});
    const newGroupName = ref('');
    const newGroupType = ref('collection');
    const showCreateModal = ref(false);

    const fetchGroups = async () => {
      loading.value = true;
      try {
        if (!userStore.user) return;
        groups.value = await listGroups(userStore.user.id);
        
        // Fetch games for each group to build banner
        for (const group of groups.value) {
          const games = await listGroupGames(group.id, userStore.user.id);
          groupGamesMap.value[group.id] = games;
        }
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
      loading, 
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
