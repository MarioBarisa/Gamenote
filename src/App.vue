<template>
  <Layout>
    <router-view />
  </Layout>
</template>

<script>
import { onMounted, onUnmounted } from 'vue';
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
    const themeStore = useThemeStore();
    const cardSizeStore = useCardSizeStore();

    let authSubscription = null;
    
    onMounted(async () => {
      themeStore.initTheme();
      cardSizeStore.initCardSize();
      await userStore.fetchUser();
      const { data } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session) {
          userStore.setUser(session.user);
        } else if (event === 'SIGNED_OUT') {
          userStore.clearUser();
        }
      });
      authSubscription = data?.subscription || null;
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
