<template>
  <div class="app-container min-h-screen flex flex-col bg-base-100">
    <!-- Header -->
    <header class="bg-base-200 sticky top-0 z-50 shadow-lg">
      <div class="container mx-auto px-2 sm:px-4">
        <div class="navbar py-2 sm:py-3">
          <!-- Navbar start - Mobile menu + Logo -->
          <div class="navbar-start">
            <!-- Mobile menu button -->
            <div class="dropdown">
              <label 
                tabindex="0" 
                class="btn btn-ghost lg:hidden"
                ref="mobileMenuLabel"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16" />
                </svg>
              </label>
              <ul tabindex="0" class="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-200 rounded-box w-52 z-50">
                <li><router-link to="/" @click="closeMobileMenu">Početna</router-link></li>
                <li><router-link to="/games" @click="closeMobileMenu">Moje igre</router-link></li>
                <li><router-link to="/add-game" @click="closeMobileMenu">Dodaj igru</router-link></li>
                <li><router-link to="/stats" @click="closeMobileMenu">Statistika</router-link></li>
              </ul>
            </div>

            <!-- Logo -->
            <router-link to="/" class="btn normal-case text-lg sm:text-xl bg-base-500 hover:bg-secondary group px-2 sm:px-4">
              <span class="bg-gradient-to-tr from-rose-500 to-pink-500 bg-clip-text text-transparent transition-colors group-hover:text-white">
                Gamenote
              </span>
            </router-link>
          </div>

          <!-- Navbar center - Desktop menu -->
          <div class="navbar-center hidden lg:flex">
            <ul class="menu menu-horizontal px-1">
              <li>
                <router-link to="/">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                  </svg>
                  Početna
                </router-link>
              </li>
              <li>
                <router-link to="/games">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-5 w-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 3.75V16.5L12 14.25 7.5 16.5V3.75m9 0H18A2.25 2.25 0 0 1 20.25 6v12A2.25 2.25 0 0 1 18 20.25H6A2.25 2.25 0 0 1 3.75 18V6A2.25 2.25 0 0 1 6 3.75h1.5m9 0h-9" />
                  </svg>
                  Moje igre
                </router-link>
              </li>
              <li>
                <router-link to="/add-game">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>
                  Traži igre
                </router-link>
              </li>
              <li>
                <router-link to="/stats">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" />
                  </svg>
                  Statistika
                </router-link>
              </li>
            </ul>
          </div>

          <!-- Navbar end - User profile -->
          <div class="navbar-end">
            <div class="flex items-center gap-3">
              <!-- Username - hidden on small screens -->
              <span class="hidden sm:block text-sm font-medium">{{ userName }}</span>
              
              <!-- Profile dropdown -->
              <div class="dropdown dropdown-end">
                <label 
                  tabindex="0" 
                  class="btn btn-ghost btn-circle avatar"
                  ref="profileDropdownLabel"
                >
                  <div class="w-10 rounded-full">
                    <img :src="profileImageUrl" alt="Avatar" />
                  </div>
                </label>
                <ul 
                  tabindex="0"
                  class="mt-3 p-2 shadow menu menu-compact dropdown-content bg-base-200 rounded-box w-52 z-[100]">
                  <!-- Email -->
                  <li class="menu-title">
                    <span class="text-base-content/70 text-xs">{{ userStore.user?.email }}</span>
                  </li>
                  <div class="divider my-1"></div>
                  <li><router-link to="/profile" @click="closeProfileDropdown">Profil</router-link></li>
                  
                  <!-- THEME SWITCHER -->
                  <div class="divider my-1"></div>
                  <li class="menu-title">
                    <span class="text-base-content/70 text-xs">🎨 Tema</span>
                  </li>
                  <li>
                    <details>
                      <summary class="cursor-pointer">{{ getCurrentThemeLabel() }}</summary>
                      <ul class="bg-base-200 p-2 rounded-box max-h-64 overflow-y-auto z-[101]" @click.stop>
                        <li v-for="theme in themeStore.availableThemes" :key="theme.name">
                          <a 
                            @click.stop="switchTheme(theme.name)"
                            :class="{ 'active': themeStore.currentTheme === theme.name }"
                            class="text-sm"
                          >
                            {{ theme.label }}
                            <span v-if="themeStore.currentTheme === theme.name" class="ml-auto">✓</span>
                          </a>
                        </li>
                      </ul>
                    </details>
                  </li>
                  
                  <div class="divider my-1"></div>
                  <li><a @click="logout">Odjava</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-3 sm:px-4 py-4 sm:py-6 flex-grow max-w-full">
      <slot />
    </main>
  </div>
</template>



<script>
  import { computed, ref } from 'vue';
  import { useUserStore } from '../stores/user';
  import { useThemeStore } from '../stores/theme';
  import { useRouter } from 'vue-router';
  
  export default {
    setup() {
      const userStore = useUserStore();
      const themeStore = useThemeStore();
      const router = useRouter();
      const profileDropdownLabel = ref(null);
      const mobileMenuLabel = ref(null);
      
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
      
      const getCurrentThemeLabel = () => {
        const current = themeStore.availableThemes.find(
          t => t.name === themeStore.currentTheme
        );
        return current ? current.label : '🎨 Odaberi temu';
      };
      
      const closeProfileDropdown = () => {
        setTimeout(() => {
          if (profileDropdownLabel.value) {
            profileDropdownLabel.value.blur();
          }
        }, 100);
      };
      
      const closeMobileMenu = () => {
        setTimeout(() => {
          if (mobileMenuLabel.value) {
            mobileMenuLabel.value.blur();
          }
        }, 50);
      };
      

      const switchTheme = (themeName) => {
        console.log('🔄 Switching theme to:', themeName);
        themeStore.setTheme(themeName);
        
      };
      
      const logout = async () => {
        await userStore.logout();
        router.push('/login');
      };
      
      return {
        isLoggedIn,
        profileImageUrl,
        userName,
        userStore,
        themeStore,
        logout,
        switchTheme,
        getCurrentThemeLabel,
        closeProfileDropdown,
        closeMobileMenu,
        profileDropdownLabel,
        mobileMenuLabel
      };
    }
  };
  </script>
  
  
  
