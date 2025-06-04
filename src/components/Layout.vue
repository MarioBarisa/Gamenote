<!-- src/components/Layout.vue -->
<template>
  <div class="app-container min-h-screen flex flex-col bg-base-100" data-theme="dark">
    <!-- Navigacija -->
    <header class="bg-base-200 sticky top-0 z-50 shadow-lg">
      <div class="container mx-auto px-4">
        <div class="navbar py-3">
          <div class="navbar-start">
            <div class="dropdown">
              <label tabindex="0" class="btn btn-ghost lg:hidden">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16" /></svg>
              </label>
              <ul tabindex="0" class="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-200 rounded-box w-52">
                <li><router-link to="/">Početna</router-link></li>
                <li><router-link to="/games">Moje igre</router-link></li>
                <li><router-link to="/add-game">Dodaj igru</router-link></li>
                <li><router-link to="/stats">Statistika</router-link></li>
              </ul>
            </div>
          <router-link
            to="/"
            class="btn normal-case text-xl bg-base-500 hover:bg-secondary group"
          >
            <span class="bg-gradient-to-tr from-rose-500 to-pink-500 bg-clip-text text-transparent transition-colors group-hover:text-white">
              Gamenote
            </span>
          </router-link>

          </div>
          <div class="navbar-center hidden lg:flex">
            <ul class="menu menu-horizontal px-1">
              <li><router-link to="/">Početna</router-link></li>
              <li><router-link to="/games">Moje igre</router-link></li>
              <li><router-link to="/add-game">Dodaj igru</router-link></li>
              <li><router-link to="/stats">Statistika</router-link></li>
            </ul>
          </div>
          <div class="navbar-end">
            <div v-if="isLoggedIn">
              <div class="dropdown dropdown-end">
                <label tabindex="0" class="btn btn-ghost btn-circle avatar">
                  <div class="w-10 rounded-full">
                    <img src="https://api.dicebear.com/6.x/initials/svg?seed=GN" alt="Avatar" />
                  </div>
                </label>
                <ul tabindex="0" class="mt-3 p-2 shadow menu menu-compact dropdown-content bg-base-200 rounded-box w-52">
                  <li><router-link to="/profile">Profil</router-link></li>
                  <li><a @click="logout">Odjava</a></li>
                </ul>
              </div>
            </div>
            <router-link v-else to="/login" class="btn btn-primary">Prijava</router-link>
          </div>
        </div>
      </div>
    </header>

    <!-- Glavni sadržaj -->
    <main class="container mx-auto px-4 py-6 flex-grow">
      <slot></slot>
    </main>

    <!-- Footer -->
    <footer class="bg-base-200 p-10">
      <div class="container mx-auto">
        <div class="footer">
          <div class="flex flex-row gap-4">
            <span class="footer-title">Gamenote</span> 
            <router-link to="/" class="link link-hover">Početna</router-link> 
            <router-link to="/about" class="link link-hover">O aplikaciji</router-link> 
            <router-link to="/contact" class="link link-hover">Kontakt</router-link> 
          </div> 
          <div class="flex flex-row gap-4">
            <span class="footer-title ">Pravno</span> 
            <a class="link link-hover">Uvjeti korištenja</a> 
            <a class="link link-hover">Privatnost</a> 
            <a class="link link-hover">Kolačići</a>
          </div> 
          <div>
            <span class="footer-title">Društvene mreže</span> 
            <div class="grid grid-flow-col gap-4">
              <a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" class="fill-current"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path></svg></a>
              <a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" class="fill-current"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"></path></svg></a>
              <a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" class="fill-current"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"></path></svg></a>
            </div>
          </div>
        </div>
        <div class="mt-8 text-center">
          <p>© 2025 Gamenote. Sva prava pridržana.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import { computed } from 'vue';
import { useUserStore } from '../stores/user';
import { useRouter } from 'vue-router';

export default {
  setup() {
    const userStore = useUserStore();
    const router = useRouter();
    
    const isLoggedIn = computed(() => userStore.isLoggedIn);
    
    const logout = async () => {
      await userStore.logout();
      router.push('/login');
    };
    
    return {
      isLoggedIn,
      logout
    };
  }
};
</script>
