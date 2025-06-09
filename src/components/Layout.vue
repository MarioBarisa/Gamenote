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
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16" />
                </svg>
              </label>
              <ul tabindex="0" class="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-200 rounded-box w-52">
                <li><router-link to="/">Početna</router-link></li>
                <li><router-link to="/games">Moje igre</router-link></li>
                <li><router-link to="/add-game">Dodaj igru</router-link></li>
                <li><router-link to="/stats">Statistika</router-link></li>
              </ul>
            </div>
            <router-link to="/" class="btn normal-case text-xl bg-base-500 hover:bg-secondary group">
              <span
                class="bg-gradient-to-tr from-rose-500 to-pink-500 bg-clip-text text-transparent transition-colors group-hover:text-white">
                Gamenote
              </span>
            </router-link>
            <!--HERO ICONS ZA SVG ICON-e https://heroicons.com/outline-->
          </div>
          <div class="navbar-center hidden lg:flex">
            <ul class="menu menu-horizontal px-1">
              <li><router-link to="/">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                    stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                  </svg>

                  Početna</router-link></li>
              <li><router-link to="/games">

                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                    stroke="currentColor" class="h-5 w-5">
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="M16.5 3.75V16.5L12 14.25 7.5 16.5V3.75m9 0H18A2.25 2.25 0 0 1 20.25 6v12A2.25 2.25 0 0 1 18 20.25H6A2.25 2.25 0 0 1 3.75 18V6A2.25 2.25 0 0 1 6 3.75h1.5m9 0h-9" />
                  </svg>

                  Moje igre</router-link></li>
              <li><router-link to="/add-game">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                    stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>

                  Traži igre</router-link></li>
              <li><router-link to="/stats">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                    stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" />
                  </svg>

                  Statistika</router-link></li>
            </ul>
          </div>
          <div class="navbar-end">
            <div v-if="isLoggedIn" class="flex items-center gap-3">
              <!-- ime korisnika -->
              <span class="hidden sm:block text-sm font-medium">
                {{ userName }}
              </span>
              
              <div class="dropdown dropdown-end">
                <label tabindex="0" class="btn btn-ghost btn-circle avatar">
                  <div class="w-10 rounded-full">
                    <img :src="profileImageUrl" alt="Avatar" />
                  </div>
                </label>
                <ul tabindex="0"
                  class="mt-3 p-2 shadow menu menu-compact dropdown-content bg-base-200 rounded-box w-52">
                  <!-- email u dropdown -->
                  <li class="menu-title">
                    <span class="text-base-content/70 text-xs">{{ userStore.user?.email }}</span>
                  </li>
                  <div class="divider my-1"></div>
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
              <a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                  class="fill-current">
                  <path
                    d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z">
                  </path>
                </svg></a>
              <a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                  class="fill-current">
                  <path
                    d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z">
                  </path>
                </svg></a>
              <a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                  class="fill-current">
                  <path
                    d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z">
                  </path>
                </svg></a>
            </div>
          </div>
        </div>
      <div class="mt-8 text-center">
        <p>© 2025 Gamenote. Sva prava pridržana.</p>
        <p class="flex items-center justify-center gap-1">Made with 
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
          </svg>
          in Croatia 
        </p>
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
    
    const profileImageUrl = computed(() => {
      return userStore.user?.user_metadata?.avatar_url || 
             'https://i.pravatar.cc/300?u=' + (userStore.user?.email || 'default');
    });
    
    const userName = computed(() => {
      const name = userStore.user?.user_metadata?.name;
      if (name) {
        return name.length > 15 ? name.split(' ')[0] : name;
      }
      const email = userStore.user?.email;
      return email ? email.split('@')[0] : 'Korisnik';
    });
    
    const logout = async () => {
      await userStore.logout();
      router.push('/login');
    };
    
    return {
      isLoggedIn,
      profileImageUrl,
      userName,
      userStore,
      logout
    };
  }
};
</script>
