<template>
  <div class="app-container min-h-screen flex flex-col bg-base-100">
    <header class="bg-base-200 sticky top-0 z-50 shadow-lg">
      <div class="container mx-auto px-2 sm:px-4">
        <div class="navbar py-2 sm:py-3">
          <div class="navbar-start">
            <div class="dropdown" ref="mobileMenuDropdown">
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
                <li><router-link to="/groups" @click="closeMobileMenu">Grupe</router-link></li>
              </ul>
            </div>

            <router-link to="/" class="btn normal-case text-lg sm:text-xl bg-base-500 hover:bg-secondary group px-2 sm:px-4">
              <span class="bg-gradient-to-tr from-rose-500 to-pink-500 bg-clip-text text-transparent transition-colors group-hover:text-white">
                Gamenote
              </span>
            </router-link>
          </div>

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
              <li>
                <router-link to="/groups">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M8 16h12V4h-2v6.125q0 .3-.25.45t-.5-.025l-1.225-.725q-.25-.15-.537-.15t-.513.15l-1.225.725q-.275.175-.513.025t-.237-.45V4H8zm0 2q-.825 0-1.412-.587T6 16V4q0-.825.588-1.412T8 2h12q.825 0 1.413.588T22 4v12q0 .825-.587 1.413T20 18zm-4 4q-.825 0-1.412-.587T2 20V7q0-.425.288-.712T3 6t.713.288T4 7v13h13q.425 0 .713.288T18 21t-.288.713T17 22zM8 4v12zm5 6.125q0 .3.238.45t.512-.025l1.225-.725q.225-.15.513-.15t.537.15l1.225.725q.25.175.5.025t.25-.45q0 .3-.25.45t-.5-.025l-1.225-.725q-.25-.15-.537-.15t-.513.15l-1.225.725q-.275.175-.513.025t-.237-.45"/></svg>
                  Grupe
                </router-link>
              </li>
            </ul>
          </div>

          <div class="navbar-end">
            <div class="flex items-center gap-3">
              <span class="hidden sm:block text-sm font-medium">{{ userName }}</span>
              <div class="dropdown dropdown-end" ref="profileDropdown">
                <label 
                  tabindex="0" 
                  class="btn btn-ghost btn-circle avatar"
                  ref="profileDropdownLabel"
                >
                  <div class="w-12 sm:w-10 rounded-full">
                    <img :src="profileImageUrl" alt="Avatar" />
                  </div>
                </label>
                <ul 
                  tabindex="0"
                  class="mt-3 p-2 shadow menu menu-compact dropdown-content bg-base-200 rounded-box w-52 z-[100]">
                  <li class="menu-title">
                    <span class="text-base-content/70 text-xs">{{ userStore.user?.email }}</span>
                  </li>
                  <div class="divider my-1"></div>
                  <li><router-link to="/profile" @click="closeProfileDropdown">Profil</router-link></li>
                  <li><router-link to="/theme-settings" @click="closeProfileDropdown">🎨 Teme</router-link></li>
                  
                  <div class="divider my-1"></div>
                  <li><a @click="logout">Odjava</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <main class="container mx-auto px-3 sm:px-4 py-4 sm:py-6 flex-grow max-w-full">
      <slot />
    </main>
    <div>
      <div class="flex items-center gap-2 pl-2">
        <router-link to="/">
          <img src="../assets/gamenote.png" class="h-22 w-auto" alt="Gamenote">
        </router-link>
        <a href="https://github.com/MarioBarisa/Gamenote" target="_blank" rel="noopener noreferrer" class="link link-hover pt-1">O aplikaciji</a>
        <a href="mailto:mario@barisa.me" class="link link-hover pt-1">Kontakt</a>
      </div>

    
    <div class="p-2 text-left">
        <p>© 2026 Gamenote - Mario Bariša. Sva prava pridržana.</p>
      </div></div>
  </div>
</template>

<script>
import { computed, ref, onMounted, onUnmounted } from 'vue';
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
    const mobileMenuDropdown = ref(null);
    const profileDropdown = ref(null);
    
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

    const resetAllDropdowns = () => {
      try {
        if (mobileMenuLabel.value) {
          mobileMenuLabel.value.removeAttribute('tabindex');
          setTimeout(() => {
            if (mobileMenuLabel.value) {
              mobileMenuLabel.value.setAttribute('tabindex', '0');
            }
          }, 10);
        }

        if (profileDropdownLabel.value) {
          profileDropdownLabel.value.removeAttribute('tabindex');
          setTimeout(() => {
            if (profileDropdownLabel.value) {
              profileDropdownLabel.value.setAttribute('tabindex', '0');
            }
          }, 10);
        }
        const dropdownUls = document.querySelectorAll('[tabindex="0"]');
        dropdownUls.forEach(ul => {
          if (ul !== mobileMenuLabel.value && ul !== profileDropdownLabel.value) {
            ul.removeAttribute('tabindex');
            setTimeout(() => {
              if (ul) {
                ul.setAttribute('tabindex', '0');
              }
            }, 10);
          }
        });
      } catch (error) {
      }
    };

    const closeMobileMenu = () => {
      try {
        if (mobileMenuLabel.value) {
          mobileMenuLabel.value.blur();
          mobileMenuLabel.value.removeAttribute('tabindex');
          
          setTimeout(() => {
            if (mobileMenuLabel.value) {
              mobileMenuLabel.value.setAttribute('tabindex', '0');
              mobileMenuLabel.value.blur();
            }
          }, 0);
        }
      
      } catch (error) {
      }
    };

    const closeProfileDropdown = () => {
      try {
        if (profileDropdownLabel.value) {
          profileDropdownLabel.value.blur();
          profileDropdownLabel.value.removeAttribute('tabindex');
          
          setTimeout(() => {
            if (profileDropdownLabel.value) {
              profileDropdownLabel.value.setAttribute('tabindex', '0');
              profileDropdownLabel.value.blur();
            }
          }, 0);
        }
      } catch (error) {;
      }
    };
    
    const logout = async () => {
      await userStore.logout();
      router.push('/login');
    };
    onMounted(() => {
      const routerBeforeEach = router.beforeEach((to, from, next) => {
        resetAllDropdowns();
        next();
      });

      const routerAfterEach = router.afterEach(() => {
        setTimeout(() => {
          resetAllDropdowns();
        }, 100);
      });
    });

    onUnmounted(() => {
    });
    
    return {
      isLoggedIn,
      profileImageUrl,
      userName,
      userStore,
      themeStore,
      logout,
      closeProfileDropdown,
      closeMobileMenu,
      resetAllDropdowns,
      profileDropdownLabel,
      mobileMenuLabel,
      mobileMenuDropdown,
      profileDropdown
    };
  }
};
</script>
