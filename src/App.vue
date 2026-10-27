<template>
  <Layout>
    <router-view v-slot="{ Component }">
      <component :is="Component" :key="userStore.user?.id || 'guest'" />
    </router-view>
  </Layout>
</template>

<script>
import { onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from './stores/user';
import { useThemeStore } from './stores/theme';
import { useCardSizeStore } from './stores/cardSize';
import Layout from './components/Layout.vue';
import { supabase } from './supabase';

export default {
  components: {
    Layout
  },
  setup() {
    const userStore = useUserStore();
    const router = useRouter();
    const themeStore = useThemeStore();
    const cardSizeStore = useCardSizeStore();

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      userStore.setUser(session?.user || null);
    });
    const authSubscription = data?.subscription;
    watch(() => userStore.isLoggedIn, (loggedIn) => {
      if (!loggedIn && router.currentRoute.value.meta.requiresAuth) router.replace('/login');
    });
    
    onMounted(async () => {
      themeStore.initTheme();
      cardSizeStore.initCardSize();
      try { await userStore.fetchUser(); } catch { /* Prijavu obrađuje zaštita ruta. */ }
    });

    onUnmounted(() => {
      if (authSubscription) authSubscription.unsubscribe();
    });
    
    return {
      userStore,
      themeStore,
      cardSizeStore
    };
  }
};
</script>
