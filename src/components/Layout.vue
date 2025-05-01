// src/components/Layout.vue
<template>
  <div class="app-container min-h-screen flex flex-col bg-base-100">
    <header class="navbar bg-primary text-primary-content">
      <div class="flex-1">
        <router-link to="/" class="btn btn-ghost normal-case text-xl">Gamenote</router-link>
      </div>
      <div class="flex-none">
        <ul class="menu menu-horizontal px-1">
          <li v-if="userStore.isLoggedIn">
            <router-link to="/add-game">Dodaj igru</router-link>
          </li>
          <li v-if="userStore.isLoggedIn">
            <router-link to="/profile">Profil</router-link>
          </li>
          <li v-if="userStore.isLoggedIn">
            <button @click="handleLogout">Odjava</button>
          </li>
          <li v-else>
            <router-link to="/login">Prijava</router-link>
          </li>
        </ul>
      </div>
    </header>
    
    <main class="flex-grow p-4">
      <slot></slot>
    </main>
    
    <footer class="footer p-4 bg-neutral text-neutral-content">
      <div class="container mx-auto text-center">
        <p>© 2025 Gamenote - Mario Bariša</p>
      </div>
    </footer>
  </div>
</template>

<script>
import { useUserStore } from '../stores/user';
import { useRouter } from 'vue-router';

export default {
  setup() {
    const userStore = useUserStore();
    const router = useRouter();
    
    const handleLogout = async () => {
      await userStore.logout();
      router.push('/login');
    };
    
    return {
      userStore,
      handleLogout
    };
  }
};
</script>
