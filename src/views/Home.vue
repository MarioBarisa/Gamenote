<template>
  <div class="home">
    <LandingView v-if="!userStore.isLoggedIn" />

    <template v-if="userStore.isLoggedIn">
      <section v-if="themeStore.showNewsWidget"
        class="hero py-8 sm:py-12 bg-base-300 rounded-box mb-6 sm:mb-10">
        <gameN />
      </section>

      <div class="grid grid-cols-3 gap-2 mb-6">
        <router-link to="/library" class="stat bg-base-200 rounded-box shadow hover:bg-base-300 transition-colors cursor-pointer p-3 sm:p-4">
          <div class="stat-title text-xs sm:text-sm">Ukupno igara</div>
          <div class="stat-value text-secondary text-xl sm:text-2xl lg:text-3xl">{{ totalGames }}</div>
          <div class="stat-desc text-xs mt-1">U kolekciji</div>
        </router-link>
        <router-link to="/library" class="stat bg-base-200 rounded-box shadow hover:bg-base-300 transition-colors cursor-pointer p-3 sm:p-4">
          <div class="stat-title text-xs sm:text-sm">Vrijeme igranja</div>
          <div class="stat-value text-accent text-xl sm:text-2xl lg:text-3xl">{{ totalHours }}</div>
          <div class="stat-desc text-xs mt-1">Ukupno sati</div>
        </router-link>
        <router-link to="/library" class="stat bg-base-200 rounded-box shadow hover:bg-base-300 transition-colors cursor-pointer p-3 sm:p-4">
          <div class="stat-title text-xs sm:text-sm">Završeno</div>
          <div class="stat-value text-success text-xl sm:text-2xl lg:text-3xl">{{ completedGames }}</div>
          <div class="stat-desc text-xs mt-1">Završene igre</div>
        </router-link>
      </div>

      <section class="mb-8 sm:mb-12">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-2">
          <h2 class="text-2xl sm:text-3xl font-bold">Trenutno igraš</h2>
          <router-link v-if="currentlyPlaying.length > 0" to="/library?filter=current" class="btn btn-sm btn-ghost">Prikaži sve</router-link>
        </div>

        <div v-if="userGamesLoading" :class="['grid', cardSizeStore.getSizeConfig(cardSizeStore.cardSize).container, cardSizeStore.getSizeConfig(cardSizeStore.cardSize).gap]">
          <div v-for="n in 3" :key="n" class="skeleton rounded-2xl" style="aspect-ratio: 3/4;"></div>
        </div>

        <div v-else-if="currentlyPlaying.length === 0" class="alert alert-info">
          <span>Trenutno ne igraš niti jednu igru.</span>
        </div>
        <div v-else>
          <div :class="['grid', cardSizeStore.getSizeConfig(cardSizeStore.cardSize).container, cardSizeStore.getSizeConfig(cardSizeStore.cardSize).gap]">
            <div v-for="game in currentlyPlaying.slice(0, 5)" :key="game.id" @click="navigateToUserGame(game.id)" class="cursor-pointer">
              <GameCard :game="game" />
            </div>
          </div>
        </div>
      </section>

      <section v-if="todaysPick" class="mb-8 sm:mb-12">
        <h2 class="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-secondary" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
          </svg>
          Jump back in.
        </h2>
        <div class="card bg-base-200 shadow-xl overflow-hidden relative" :style="todaysPick.image_url ? `background-image: url(${todaysPick.image_url}); background-position: center; background-size: cover;` : ''">
          <div v-if="todaysPick.image_url" class="absolute inset-0 bg-gradient-to-r from-base-100 via-base-100/95 to-base-100/40"></div>
          <div class="card-body relative z-10 sm:flex-row items-center gap-6 p-6 sm:p-8">
            <figure v-if="!todaysPick.image_url" class="w-24 h-32 flex-none bg-base-300 rounded-lg flex items-center justify-center">
              <span class="opacity-50">Nema slike</span>
            </figure>
            <figure v-else class="w-32 h-44 sm:w-40 sm:h-56 flex-none shadow-2xl rounded-lg overflow-hidden hidden sm:block">
              <img :src="todaysPick.image_url" :alt="todaysPick.title" class="w-full h-full object-cover" />
            </figure>
            <div class="flex-grow text-center sm:text-left">
              <div class="badge badge-secondary mb-3 shadow-sm border-none font-bold uppercase tracking-wider text-xs p-3">Today's Pick</div>
              <h3 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-3 text-base-content drop-shadow-md">{{ todaysPick.title }}</h3>
              <p class="opacity-80 text-sm sm:text-base max-w-xl mb-6 font-medium">{{ todaysPick.platform }} • {{ todaysPick._statusLabel }}</p>
              <div class="card-actions justify-center sm:justify-start">
                <button @click="navigateToUserGame(todaysPick.id)" class="btn btn-primary shadow-xl hover:scale-105 transition-transform text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
                  </svg>
                  Igraj danas
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../supabase';
import { useUserStore } from '../stores/user';
import { useCardSizeStore } from '../stores/cardSize';
import { useGamesApi } from '../services/gamesApi';
import { useThemeStore } from '../stores/theme';
import GameCard from '../components/GameCard.vue';
import gameN from '../components/gameN.vue';
import LandingView from './LandingView.vue';

export default {
  components: {
    GameCard,
    gameN,
    LandingView
  },
  setup() {
    const userStore = useUserStore();
    const cardSizeStore = useCardSizeStore();
    const router = useRouter();
    const gamesApi = useGamesApi();
    const themeStore = useThemeStore();

    const loading = ref(true);
    const userGamesLoading = ref(true);
    const currentlyPlaying = ref([]);
    const todaysPick = ref(null);
    const totalGames = ref(0);
    const completedGames = ref(0);
    const totalHours = ref(0);
    const popularGames = ref([]);
    const recentGames = ref([]);

    const fetchUserGames = async () => {
      if (!userStore.isLoggedIn || !userStore.user) {
        return;
      }

      try {
        const userId = userStore.user.id;

        const { data: allGames, error } = await supabase
          .from('games')
          .select('*')
          .eq('user_id', userId)
          .order('updated_at', { ascending: false });

        if (allGames) {
          currentlyPlaying.value = allGames.filter(g => g.status === 'playing');

          const pickCandidates = allGames.filter(g => g.status === 'backlog' || g.status === 'paused');
          if (pickCandidates.length > 0) {
            const randomIndex = Math.floor(Math.random() * pickCandidates.length);
            const picked = pickCandidates[randomIndex];
            todaysPick.value = {
              ...picked,
              _statusLabel: picked.status === 'paused' ? 'Pauzirano' : 'U backlogu'
            };
          } else {
            todaysPick.value = null;
          }

          totalGames.value = allGames.length;
          completedGames.value = allGames.filter(g => g.status === 'completed').length;
          totalHours.value = allGames.reduce((sum, g) => sum + (Number(g.play_time) || 0), 0);
        }
      } catch (error) {
        console.error('Error fetching user games:', error);
      } finally {
        userGamesLoading.value = false;
      }
    };

    const fetchApiGames = async () => {
      loading.value = true;

      try {
        const popularnigre = await gamesApi.getPopularGames();
        popularGames.value = popularnigre;

        const nedavnigre = await gamesApi.getRecentGames();
        recentGames.value = nedavnigre;
      } catch (error) {
        console.error('Error fetching API games:', error);
      } finally {
        loading.value = false;
      }
    };

    const navigateToUserGame = (id) => {
      router.push(`/game/${id}`);
    };

    const navigateToApiGame = (id) => {
      router.push(`/api-games/${id}`);
    };

    const formatDate = (dateString) => {
      if (!dateString) return 'Nepoznat datum';
      return new Date(dateString).toLocaleDateString('hr-HR');
    };

    onMounted(async () => {
      await fetchUserGames();
      await fetchApiGames();
    });

    return {
      userStore,
      cardSizeStore,
      loading,
      userGamesLoading,
      currentlyPlaying,
      todaysPick,
      totalGames,
      completedGames,
      totalHours,
      popularGames,
      recentGames,
      navigateToUserGame,
      navigateToApiGame,
      formatDate,
      themeStore
    };
  }
};
</script>
