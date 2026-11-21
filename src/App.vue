<template>
  <div v-if="pageFailure" class="container mx-auto p-6" role="alert">
    <p class="mb-4">{{ $t('app.thisPageCouldntBeLoaded') }}</p>
    <button type="button" class="btn btn-primary" @click="reloadPage">{{ $t('common.tryAgain') }}</button>
  </div>
  <AuthStartup v-else-if="showStartup" :error="userStore.authError" @retry="retryAuth" />
  <Layout v-else>
    <router-view v-slot="{ Component }">
      <component :is="Component" :key="userStore.user?.id || 'guest'" />
    </router-view>
  </Layout>
</template>

<script>
import { locale } from './i18n/index.js';
import { updateMetadata } from './services/seo.js';
import { computed, ref, watch, onErrorCaptured } from 'vue';
import { pageFailure } from './services/pageFailure';
import { useRouter } from 'vue-router';
import { useUserStore } from './stores/user';
import { useThemeStore } from './stores/theme';
import { useCardSizeStore } from './stores/cardSize';
import Layout from './components/Layout.vue';
import AuthStartup from './components/AuthStartup.vue';
import { subscribeToGames } from './services/libraryCache.js';
import { supabase } from './supabase.js';

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
    const libraryOwner = ref(null);

    themeStore.initTheme();
    cardSizeStore.initCardSize();
    router.isReady().then(() => { routeReady.value = true; }).catch(() => { pageFailure.value = true; });
    onErrorCaptured(() => { pageFailure.value = true; return false; });
    watch(locale, () => updateMetadata(router.currentRoute.value));
    watch([() => userStore.user?.id, () => router.currentRoute.value.name], ([userId, routeName]) => {
      if (userId !== libraryOwner.value) libraryOwner.value = routeName === 'library' ? userId || null : null;
    }, { immediate: true });
    watch(libraryOwner, (userId, previous, onCleanup) => {
      if (userId) onCleanup(subscribeToGames(supabase, userId));
    });
    const reloadPage = () => window.location.reload();

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
      if (ready && !loggedIn && requiresAuth) router.replace({ name: 'login', query: { redirect: router.currentRoute.value.fullPath } });
    });
    
    return {
      userStore,
      pageFailure,
      reloadPage,
      themeStore,
      cardSizeStore,
      showStartup,
      retryAuth
    };
  }
};
</script>
