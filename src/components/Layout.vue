<template>
  <div class="app-container min-h-screen flex flex-col bg-base-100">
    <header v-if="isLoggedIn" class="bg-base-200 sticky top-0 z-50 shadow-lg">
      <div class="container mx-auto px-2 sm:px-4">
        <div class="navbar py-2 sm:py-3">
          <div class="navbar-start">
            <router-link to="/" class="group flex items-center rounded-lg px-2 py-1 sm:px-3" aria-label="Gamenote početna">
              <svg
                viewBox="0 0 896 722"
                role="img"
                aria-hidden="true"
                shape-rendering="crispEdges"
                class="h-8 sm:h-9 w-auto text-base-content transition-all duration-200 group-hover:scale-105 group-hover:text-[#E44423]"
              >
                <g fill="currentColor">
                  <rect x="162" y="0" width="70" height="70" />
                  <rect x="308" y="0" width="70" height="70" />
                  <rect x="84" y="70" width="364" height="60" />
                  <rect x="84" y="130" width="70" height="70" />
                  <rect x="232" y="130" width="70" height="70" />
                  <rect x="378" y="130" width="70" height="70" />
                  <rect x="0" y="200" width="532" height="52" />
                  <rect x="0" y="252" width="70" height="70" />
                  <rect x="154" y="252" width="70" height="70" />
                  <rect x="308" y="252" width="70" height="70" />
                  <rect x="462" y="252" width="70" height="70" />
                  <rect x="532" y="0" width="364" height="70" />
                  <rect x="826" y="0" width="70" height="722" />
                  <rect x="0" y="652" width="896" height="70" />
                  <rect x="0" y="376" width="70" height="276" />
                </g>
              </svg>
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
                  <span class="w-12 sm:w-10 rounded-full block aspect-square overflow-hidden">
                    <img :src="profileImageUrl" alt="Avatar" />
                  </span>
                </label>
                <ul 
                  tabindex="0"
                  class="mt-3 p-2 shadow menu menu-compact dropdown-content bg-base-200 rounded-box w-52 z-[100]">
                  <li class="menu-title">
                    <span class="text-base-content/70 text-xs">{{ userStore.user?.email }}</span>
                  </li>
                  <li>
                    <router-link to="/profile" @click="closeProfileDropdown">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      Profil
                    </router-link>
                  </li>
                  <li>
                    <router-link to="/theme-settings" @click="closeProfileDropdown">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>
                      Postavke UI-ja
                    </router-link>
                  </li>
                  <li>
                    <router-link to="/importers" @click="closeProfileDropdown">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      Import
                    </router-link>
                  </li>
                  <li>
                    <a @click="openLogoutModal" class="text-error">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                      Odjava
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <main :class="isLoggedIn ? 'container mx-auto px-3 sm:px-4 py-4 sm:py-6 flex-grow max-w-full pb-28 lg:pb-0' : 'flex-grow'">
      <slot />
    </main>
    
    <!-- MOBILNA NAVIGACIJA -->
    <nav
      v-if="isLoggedIn"
      class="btm-nav lg:hidden z-50 fixed left-0 right-0 bg-base-200/90 backdrop-blur border border-base-300 grid grid-flow-col auto-cols-fr transition-all duration-300 ease-in-out overflow-visible p-2 gap-2 items-center"
      :class="isCompact ? 'mx-3 rounded-[32px] shadow-2xl h-14' : 'mx-4 rounded-[32px] shadow-2xl h-20'"
      :style="navStyle"
      aria-label="Primary"
    >
      <router-link to="/" aria-label="Početna" class="h-full w-full flex items-center justify-center">
        <div class="flex flex-col items-center justify-center w-full">
          <div :class="[circleBaseClass, circleSizeClass, isActive('/') ? circleActiveClass : circleInactiveClass]" :aria-current="isActive('/') ? 'page' : undefined">
            <svg xmlns="http://www.w3.org/2000/svg" :class="iconSizeClass" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
          </div>
          <span class="mt-1 text-xs leading-tight" v-show="!isCompact">Početna</span>
        </div>
      </router-link>

      <router-link to="/library" aria-label="Moje igre" class="h-full w-full flex items-center justify-center">
        <div class="flex flex-col items-center justify-center w-full">
          <div :class="[circleBaseClass, circleSizeClass, isActive('/library') ? circleActiveClass : circleInactiveClass]" :aria-current="isActive('/library') ? 'page' : undefined">
            <svg xmlns="http://www.w3.org/2000/svg" :class="iconSizeClass" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 3.75V16.5L12 14.25 7.5 16.5V3.75m9 0H18A2.25 2.25 0 0 1 20.25 6v12A2.25 2.25 0 0 1 18 20.25H6A2.25 2.25 0 0 1 3.75 18V6A2.25 2.25 0 0 1 6 3.75h1.5m9 0h-9" />
            </svg>
          </div>
          <span class="mt-1 text-xs leading-tight" v-show="!isCompact">Moje igre</span>
        </div>
      </router-link>

      <router-link to="/add-game" aria-label="Traži igre" class="h-full w-full flex items-center justify-center">
        <div class="flex flex-col items-center justify-center w-full">
          <div :class="[circleBaseClass, circleSizeClass, isActive('/add-game') ? circleActiveClass : circleInactiveClass]" :aria-current="isActive('/add-game') ? 'page' : undefined">
            <svg xmlns="http://www.w3.org/2000/svg" :class="iconSizeClass" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </div>
          <span class="mt-1 text-xs leading-tight" v-show="!isCompact">Traži</span>
        </div>
      </router-link>

      <router-link to="/stats" aria-label="Statistika" class="h-full w-full flex items-center justify-center">
        <div class="flex flex-col items-center justify-center w-full">
          <div :class="[circleBaseClass, circleSizeClass, isActive('/stats') ? circleActiveClass : circleInactiveClass]" :aria-current="isActive('/stats') ? 'page' : undefined">
            <svg xmlns="http://www.w3.org/2000/svg" :class="iconSizeClass" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" />
            </svg>
          </div>
          <span class="mt-1 text-xs leading-tight" v-show="!isCompact">Statistika</span>
        </div>
      </router-link>

      <router-link to="/groups" aria-label="Grupe" class="h-full w-full flex items-center justify-center">
        <div class="flex flex-col items-center justify-center w-full">
          <div :class="[circleBaseClass, circleSizeClass, isActive('/groups') ? circleActiveClass : circleInactiveClass]" :aria-current="isActive('/groups') ? 'page' : undefined">
            <svg xmlns="http://www.w3.org/2000/svg" :class="iconSizeClass" viewBox="0 0 24 24"><path fill="currentColor" d="M8 16h12V4h-2v6.125q0 .3-.25.45t-.5-.025l-1.225-.725q-.25-.15-.537-.15t-.513.15l-1.225.725q-.275.175-.513.025t-.237-.45V4H8zm0 2q-.825 0-1.412-.587T6 16V4q0-.825.588-1.412T8 2h12q.825 0 1.413.588T22 4v12q0 .825-.587 1.413T20 18zm-4 4q-.825 0-1.412-.587T2 20V7q0-.425.288-.712T3 6t.713.288T4 7v13h13q.425 0 .713.288T18 21t-.288.713T17 22zM8 4v12zm5 6.125q0 .3.238.45t.512-.025l1.225-.725q.225-.15.513-.15t.537.15l1.225.725q.25.175.5.025t.25-.45q0 .3-.25.45t-.5-.025l-1.225-.725q-.25-.15-.537-.15t-.513.15l-1.225.725q-.275.175-.513.025t-.237-.45"/></svg>
          </div>
          <span class="mt-1 text-xs leading-tight" v-show="!isCompact">Grupe</span>
        </div>
      </router-link>
    </nav>
    <!-- FOOTER -->
    <div :class="['sm:mt-8', isLoggedIn ? 'pb-28 lg:pb-0' : '']">
      <footer class="footer sm:footer-horizontal bg-base-200 text-base-content gap-x-8 gap-y-4 px-5 py-4 sm:gap-y-5 sm:px-10 sm:py-6 border-t border-base-300">
        <aside class="gap-2.5 sm:gap-2">
          <router-link to="/" aria-label="Gamenote početna">
            <img :src="footerBannerUrl" loading="lazy" class="hidden sm:block h-10 w-auto" alt="Gamenote" />
            <img :src="footerBannerUrl" loading="lazy" class="sm:hidden w-3/4 max-w-56 h-auto" alt="Gamenote" />
          </router-link>
          <p class="text-xs sm:text-sm text-base-content/70 max-w-xs">
            Tvoja osobna biblioteka videoigara.
            <br />Prati, ocijeni i podijeli.
          </p>
        </aside>
        <nav class="grid grid-cols-2 gap-x-6 gap-y-1.5 content-start">
          <h6 class="footer-title col-span-2">Aplikacija</h6>
          <a href="https://github.com/MarioBarisa/Gamenote" target="_blank" rel="noopener noreferrer" class="link link-hover text-sm">O aplikaciji</a>
          <a href="mailto:mario@barisa.me" class="link link-hover text-sm">Kontakt</a>
          <router-link to="/privacy" class="link link-hover text-sm">Privatnost</router-link>
          <router-link to="/tos" class="link link-hover text-sm">Uvjeti korištenja</router-link>
        </nav>
        <nav>
          <h6 class="footer-title">Zaprati</h6>
          <div class="grid grid-flow-col gap-1 sm:gap-2">
            <a href="https://github.com/MarioBarisa" target="_blank" rel="noopener noreferrer" aria-label="Mario Bariša na GitHubu" title="Mario Bariša na GitHubu" class="btn btn-ghost btn-circle btn-xs sm:btn-sm">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-4 w-4 sm:h-5 sm:w-5"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>
            </a>
            <a href="https://github.com/MarioBarisa/Gamenote" target="_blank" rel="noopener noreferrer" aria-label="Izvorni kod Gamenotea" title="Izvorni kod Gamenotea" class="btn btn-ghost btn-circle btn-xs sm:btn-sm">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-4 w-4 sm:h-5 sm:w-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
              </svg>
            </a>
            <a href="https://barisa.me" target="_blank" rel="noopener noreferrer" aria-label="barisa.me" title="barisa.me" class="btn btn-ghost btn-circle btn-xs sm:btn-sm">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-4 w-4 sm:h-5 sm:w-5">
                <circle cx="12" cy="12" r="9" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 12h18" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 3c2.5 2.6 3.9 5.7 3.9 9s-1.4 6.4-3.9 9c-2.5-2.6-3.9-5.7-3.9-9S9.5 5.6 12 3Z" />
              </svg>
            </a>
            <a href="mailto:mario@barisa.me" aria-label="Kontakt e-poštom" title="Kontakt e-poštom" class="btn btn-ghost btn-circle btn-xs sm:btn-sm">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-4 w-4 sm:h-5 sm:w-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
              </svg>
            </a>
          </div>
          <p class="text-sm text-base-content/70">
            Izradio ❤️ <a href="https://barisa.me" target="_blank" rel="noopener noreferrer" class="link link-hover font-medium">Mario Bariša</a>
          </p>
          <p class="text-[11px] sm:text-xs text-base-content/60">© 2026 Gamenote - <a href="https://barisa.me" target="_blank" rel="noopener noreferrer" class="link link-hover">Mario Bariša</a>. Sva prava pridržana.</p>
        </nav>
      </footer>
    </div>

    <dialog class="modal" :class="{ 'modal-open': showLogoutModal }">
      <div class="modal-box">
        <h3 class="font-bold text-lg">Odjava</h3>
        <p class="text-base-content/60 text-sm mt-1">Jeste li sigurni da se želite odjaviti?</p>
        <div class="modal-action">
          <button class="btn" @click="closeLogoutModal">Odustani</button>
          <button class="btn btn-error" @click="confirmLogout">Odjavi se</button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop" @click="closeLogoutModal">
        <button>zatvori</button>
      </form>
    </dialog>
  </div>
</template>

<script>
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useUserStore } from '../stores/user';
import { useThemeStore } from '../stores/theme';
import { useRouter, useRoute } from 'vue-router';
import bannerLightUrl from '../assets/newAssets/GamenoteBannerLightMode.png';
import bannerDarkUrl from '../assets/newAssets/GamenoteBannerDarkMode.png';

export default {
  setup() {
    const userStore = useUserStore();
    const themeStore = useThemeStore();
    const router = useRouter();
    const route = useRoute();
    const profileDropdownLabel = ref(null);
    const mobileMenuLabel = ref(null);
    const mobileMenuDropdown = ref(null);
    const profileDropdown = ref(null);
    const isCompact = ref(false);
    const showLogoutModal = ref(false);
    let lastY = 0;

    const darkThemeSet = new Set(['dark', 'black', 'dracula', 'night', 'dim', 'forest', 'halloween', 'business', 'coffee', 'luxury', 'synthwave']);
    const isDarkTheme = (name) => darkThemeSet.has(name) || name?.includes('dark') || name?.includes('night') || name?.includes('black');
    const footerBannerUrl = computed(() => isDarkTheme(themeStore.currentTheme) ? bannerDarkUrl : bannerLightUrl);
    
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
        if (document.activeElement && document.activeElement.blur) {
          document.activeElement.blur();
        }
        
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
        console.error('Error resetting dropdowns:', error);
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
        console.error('Error closing mobile menu:', error);
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
      } catch (error) {
        console.error('Error closing profile dropdown:', error);
      }
    };
    
    const logout = async () => {
      await userStore.logout();
      router.push('/login');
    };

    const openLogoutModal = () => {
      closeProfileDropdown();
      showLogoutModal.value = true;
    };

    const closeLogoutModal = () => {
      showLogoutModal.value = false;
    };

    const confirmLogout = async () => {
      closeLogoutModal();
      await logout();
    };

    const isActive = (path) => {
      if (path === '/') return route.path === '/';
      if (path === '/library' || path === '/games') {
        return route.path.startsWith('/library') || route.path.startsWith('/games');
      }
      return route.path.startsWith(path);
    };

    const circleBaseClass = 'rounded-full flex items-center justify-center transition-all duration-200';
    const circleActiveClass = 'bg-accent text-accent-content shadow-lg ring-1 ring-accent/40';
    const circleInactiveClass = 'bg-transparent text-base-content/80';
    const circleSizeClass = computed(() => (isCompact.value ? 'w-10 h-10' : 'w-11 h-11'));
    const iconSizeClass = computed(() => (isCompact.value ? 'w-5 h-5' : 'w-6 h-6'));

    const navStyle = computed(() => {
      const bottom = isCompact.value
        ? 'calc(env(safe-area-inset-bottom, 0px) + 0.5rem)'
        : 'calc(env(safe-area-inset-bottom, 0px) + 1rem)';
      const paddingBottom = 'max(env(safe-area-inset-bottom, 0px), 0px)';
      return { bottom, paddingBottom };
    });

    const onScroll = () => {
      const y = window.scrollY || 0;
      const delta = y - lastY;
      if (delta > 8) {
        isCompact.value = true; // korisnik ide dole -> compact
      } else if (delta < -8) {
        isCompact.value = false; // korisnik ide gore -> expand
      }
      lastY = y;
    };
    onMounted(() => {
      router.beforeEach((to, from, next) => {
        resetAllDropdowns();
        next();
      });

      router.afterEach(() => {
        setTimeout(() => {
          resetAllDropdowns();
        }, 100);
      });

      window.addEventListener('scroll', onScroll, { passive: true });
    });

    onUnmounted(() => {
      window.removeEventListener('scroll', onScroll);
    });
    
    return {
      isLoggedIn,
      profileImageUrl,
      userName,
      userStore,
      themeStore,
      logout,
      openLogoutModal,
      closeLogoutModal,
      confirmLogout,
      showLogoutModal,
      closeProfileDropdown,
      closeMobileMenu,
      resetAllDropdowns,
      profileDropdownLabel,
      mobileMenuLabel,
      mobileMenuDropdown,
      profileDropdown,
      isActive,
      isCompact,
      circleBaseClass,
      circleActiveClass,
      circleInactiveClass,
      circleSizeClass,
      iconSizeClass,
      navStyle,
      footerBannerUrl
    };
  }
};
</script>
