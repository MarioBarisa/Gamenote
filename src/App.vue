<template>
  <AuthStartup v-if="showStartup" :error="userStore.authError" @retry="retryAuth" />
  <Layout v-else>
    <router-view v-slot="{ Component }">
      <component :is="Component" :key="userStore.user?.id || 'guest'" />
    </router-view>
  </Layout>
</template>

<script>
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from './stores/user';
import { useThemeStore } from './stores/theme';
import { useCardSizeStore } from './stores/cardSize';
import Layout from './components/Layout.vue';
import AuthStartup from './components/AuthStartup.vue';

export default {
  components: {
    Layout,
    AuthStartup
  },
  setup() {
    const userStore = useUserStore();
    const router = useRouter();
    const themeStore = useThemeStore();
    const cardSizeStore = useCardSizeStore();
    const routeReady = ref(false);

    themeStore.initTheme();
    cardSizeStore.initCardSize();
    router.isReady().then(() => { routeReady.value = true; });

    const showStartup = computed(() => {
      if (!routeReady.value) return true;
      const route = router.currentRoute.value;
      if (route.meta.skipAuthLoading) return false;
      return !userStore.authReady || !!userStore.authError || (route.meta.requiresAuth && !userStore.isLoggedIn);
    });

    const retryAuth = async () => {
      try { await userStore.initializeAuth(); } catch { /* Pogrešku prikazuje početni ekran. */ }
    };

    watch([() => userStore.authReady, () => userStore.isLoggedIn, () => router.currentRoute.value.meta.requiresAuth], ([ready, loggedIn, requiresAuth]) => {
      if (ready && !loggedIn && requiresAuth) router.replace('/login');
    });
    
    return {
      userStore,
      themeStore,
      cardSizeStore,
      showStartup,
      retryAuth
    };
  }
};
</script>
