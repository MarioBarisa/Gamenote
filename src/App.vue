// src/App.vue
<template>
  <Layout>
    <router-view />
  </Layout>
</template>

<script>
import { onMounted } from 'vue';
import { useUserStore } from './stores/user';
import Layout from './components/Layout.vue';
import { supabase } from './supabase';

export default {
  components: {
    Layout
  },
  setup() {
    const userStore = useUserStore();
    
    onMounted(async () => {
      // Dohvati trenutnog korisnika ako postoji sesija
      await userStore.fetchUser();
      
      // Postavi listener za promjene u autentifikaciji
      supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session) {
          userStore.setUser(session.user);
        } else if (event === 'SIGNED_OUT') {
          userStore.clearUser();
        }
      });
    });
    
    return {
      userStore
    };
  }
};
</script>
