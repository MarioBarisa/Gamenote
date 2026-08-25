<template>
  <div class="max-w-6xl mx-auto space-y-8 sm:space-y-12">
    <!-- UI Postavke Header -->
    <div>
      <h1 class="text-3xl font-bold mb-2">Postavke UI-ja</h1>
      <p class="text-base opacity-70">Prilagodi izgled aplikacije prema svojim željama :)</p>
    </div>

    <!-- Početna stranica - NewsShuffle -->
    <div>
      <h2 class="text-2xl font-bold mb-4">Početna stranica</h2>
      <div class="card bg-base-200">
        <div class="card-body flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 class="card-title text-lg">Gaming vijesti</h3>
            <p class="text-sm opacity-70">
              Prikaži NewsShuffle (gaming vijesti) na početnoj stranici za prijavljene korisnike.
            </p>
          </div>
          <label class="flex items-center gap-3 cursor-pointer">
            <span class="text-sm">Prikaži</span>
            <input type="checkbox" class="toggle toggle-primary" v-model="themeStore.showNewsWidget" />
          </label>
        </div>
      </div>
    </div>

    <!-- TCG način -->
    <div>
      <h2 class="text-2xl font-bold mb-4">TCG način</h2>
      <div class="card bg-base-200">
        <div class="card-body flex flex-col gap-4">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 class="card-title text-lg">TCG Mode</h3>
              <p class="text-sm opacity-70">
                3D nagib i folirani efekt na karticama igara. Igre sa 100% postignuća dobivaju zlatnu Gamenote foliju,
                igre s ocjenom 5/5 holografsku, a igre s obima specijalnu prizma foliju. Preporučeno samo na računalu.
              </p>
            </div>
            <label class="flex items-center gap-3 cursor-pointer shrink-0">
              <span class="text-sm">Omogući</span>
              <input
                type="checkbox"
                class="toggle toggle-primary"
                :checked="themeStore.tcgMode"
                @change="onTcgToggle($event)"
              />
            </label>
          </div>
          <div class="flex flex-wrap items-center gap-x-1 gap-y-0.5 text-xs opacity-60">
            <span>Ovaj način koristi kod iz community-built</span>
            <a
              class="link link-hover inline-flex items-center gap-0.5 font-medium"
              href="https://github.com/simeydotme/hover-tilt"
              target="_blank"
              rel="noopener"
            >
              Hover Tilt
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-3 h-3" aria-hidden="true">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
              </svg>
            </a>.
            <span>Hvala</span>
            <a class="link link-hover font-medium" href="https://github.com/simeydotme" target="_blank" rel="noopener">Simeydotme</a>
            <span>na implementaciji!</span>
          </div>
        </div>
      </div>
    </div>


    <!-- Teme Sekcija -->
    <div>
      <h2 class="text-2xl font-bold mb-4">Dostupne teme</h2>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div v-for="theme in themeStore.availableThemes" :key="theme.name" class="rounded-lg">
          <div @click="switchTheme(theme.name)" :data-theme="theme.name"
            class="card cursor-pointer hover:scale-105 transition-all duration-300 border-2 bg-base-100 shadow-md overflow-hidden"
            :class="{
              'border-primary shadow-xl scale-105 ring-2 ring-primary': themeStore.currentTheme === theme.name,
              'border-base-300 hover:border-primary': themeStore.currentTheme !== theme.name
            }">
            <div class="card-body p-4">
              <div class="font-bold text-sm mb-3 text-base-content">{{ theme.label }}</div>

              <div class="flex gap-1 mb-2">
                <div class="bg-primary rounded flex-1 h-8"></div>
                <div class="bg-secondary rounded flex-1 h-8"></div>
                <div class="bg-accent rounded flex-1 h-8"></div>
              </div>

              <div class="grid grid-cols-4 gap-1 mb-2">
                <div
                  class="bg-success rounded h-6 flex items-center justify-center text-xs text-success-content font-bold">
                  OK</div>
                <div
                  class="bg-warning rounded h-6 flex items-center justify-center text-xs text-warning-content font-bold">
                  !</div>
                <div class="bg-error rounded h-6 flex items-center justify-center text-xs text-error-content font-bold">
                  X</div>
                <div class="bg-info rounded h-6 flex items-center justify-center text-xs text-info-content font-bold">i
                </div>
              </div>

              <div class="bg-base-200 rounded p-2 mb-2">
                <div class="bg-base-300 rounded p-1 text-xs text-base-content text-center">
                  Background
                </div>
              </div>

              <div class="flex gap-1">
                <button class="btn btn-primary btn-xs flex-1">Primary</button>
                <button class="btn btn-ghost btn-xs flex-1">Ghost</button>
              </div>

              <div v-if="themeStore.currentTheme === theme.name" class="mt-2 badge badge-primary badge-sm w-full">
                ✓ Odabrano
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Veličina Kartica Sekcija -->
    <div>
      <h2 class="text-2xl font-bold mb-4">Veličina Kartica</h2>
      <p class="text-base opacity-70 mb-4">Izaberi kako želiš vidjeti igre - od kompaktnoga do detaljnoga prikaza</p>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <!-- Small Size -->
        <div class="card bg-base-200 cursor-pointer transition-all duration-300 border-2"
          :class="cardSizeStore.cardSize === 'small' ? 'border-primary' : 'border-transparent'"
          @click="cardSizeStore.saveCardSize('small')">
          <div class="card-body">
            <h3 class="card-title text-lg">Mala</h3>
            <p class="text-sm opacity-70">Više igara na ekranu. Kompaktan prikaz idealan za pregledavanje većeg broja
              igara.</p>

            <div class="mt-4 space-y-2">
              <div class="grid grid-cols-4 gap-1">
                <div v-for="i in 8" :key="i" class="bg-base-300 rounded h-12 sm:h-14"></div>
              </div>
            </div>

            <div class="mt-4 text-xs opacity-70 space-y-1">
              <p><strong>Mobilni:</strong> 3 kartica po redu</p>
              <p><strong>Desktop:</strong> 6-7 kartica po redu</p>
            </div>

            <div v-if="cardSizeStore.cardSize === 'small'" class="mt-4">
              <span class="badge badge-primary">Trenutno aktivna</span>
            </div>
            <button v-else @click="cardSizeStore.saveCardSize('small')" class="btn btn-sm btn-primary mt-4 w-full">
              Koristi ovu veličinu
            </button>
          </div>
        </div>

        <!-- Medium Size -->
        <div class="card bg-base-200 cursor-pointer transition-all duration-300 border-2"
          :class="cardSizeStore.cardSize === 'medium' ? 'border-primary' : 'border-transparent'"
          @click="cardSizeStore.saveCardSize('medium')">
          <div class="card-body">
            <h3 class="card-title text-lg">Srednja</h3>
            <p class="text-sm opacity-70">Ravnoteža veličina i dobrih detalja. Preporučena za većinu korisnika.</p>

            <div class="mt-4 space-y-2">
              <div class="grid grid-cols-3 gap-1.5">
                <div v-for="i in 6" :key="i" class="bg-base-300 rounded h-16 sm:h-20"></div>
              </div>
            </div>

            <div class="mt-4 text-xs opacity-70 space-y-1">
              <p><strong>Mobilni:</strong> 2 kartica po redu</p>
              <p><strong>Desktop:</strong> 5-6 kartica po redu</p>
            </div>

            <div v-if="cardSizeStore.cardSize === 'medium'" class="mt-4">
              <span class="badge badge-primary">Trenutno aktivna</span>
            </div>
            <button v-else @click="cardSizeStore.saveCardSize('medium')" class="btn btn-sm btn-primary mt-4 w-full">
              Koristi ovu veličinu
            </button>
          </div>
        </div>

        <!-- Large Size -->
        <div class="card bg-base-200 cursor-pointer transition-all duration-300 border-2"
          :class="cardSizeStore.cardSize === 'large' ? 'border-primary' : 'border-transparent'"
          @click="cardSizeStore.saveCardSize('large')">
          <div class="card-body">
            <h3 class="card-title text-lg">Velika</h3>
            <p class="text-sm opacity-70">Velika kartica s puno detalja. Idealna za fokusirani prikaz.</p>

            <div class="mt-4 space-y-2">
              <div class="grid grid-cols-2 gap-2">
                <div v-for="i in 4" :key="i" class="bg-base-300 rounded h-20 sm:h-24"></div>
              </div>
            </div>

            <div class="mt-4 text-xs opacity-70 space-y-1">
              <p><strong>Mobilni:</strong> 1 kartica po redu</p>
              <p><strong>Desktop:</strong> 3-4 kartica po redu</p>
            </div>

            <div v-if="cardSizeStore.cardSize === 'large'" class="mt-4">
              <span class="badge badge-primary">Trenutno aktivna</span>
            </div>
            <button v-else @click="cardSizeStore.saveCardSize('large')" class="btn btn-sm btn-primary mt-4 w-full">
              Koristi ovu veličinu
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="alert">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-info shrink-0 w-6 h-6">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <div>
        <span><strong>💡 Savjet:</strong> Sve tvoje postavke se automatski spremaju u pregledniku.</span>
        <div class="text-xs opacity-75 mt-1">Tema i veličina kartica će biti dostupne kad god se vratiš u aplikaciju.
        </div>
      </div>
    </div>

    <!-- Mobilno upozorenje za TCG način -->
    <div v-if="showTcgWarning" class="modal modal-open">
      <div class="modal-box">
        <h3 class="font-bold text-lg">⚠️ Mobilni uređaj otkriven</h3>
        <p class="py-4 text-sm">
          TCG način koristi 3D animacije i sjene koje mogu usporiti pregledavanje ili uzrokovati probleme s prikazom
          na mobilnim uređajima. Ako primijetiš probleme, uvijek ga možeš isključiti ovdje u postavkama.
        </p>
        <label class="flex items-center gap-2 cursor-pointer mb-2">
          <input type="checkbox" v-model="tcgDontShowAgain" class="checkbox checkbox-sm" />
          <span class="text-sm">Ne prikazuj više ovu poruku</span>
        </label>
        <div class="modal-action">
          <button class="btn btn-ghost" @click="showTcgWarning = false">Odustani</button>
          <button class="btn btn-primary" @click="confirmTcgMobile">Ipak omogući</button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop" @click.stop="showTcgWarning = false"></form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useThemeStore } from '../stores/theme';
import { useCardSizeStore } from '../stores/cardSize';

const themeStore = useThemeStore();
const cardSizeStore = useCardSizeStore();

const showTcgWarning = ref(false);
const tcgDontShowAgain = ref(false);

const isCoarsePointer = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(hover: none), (pointer: coarse)').matches;

const onTcgToggle = (event) => {
  const want = event.target.checked;
  const dismissed = localStorage.getItem('gamenote_tcg_warning_dismissed') === '1';
  if (want && isCoarsePointer() && !dismissed) {
    event.target.checked = false;
    tcgDontShowAgain.value = false;
    showTcgWarning.value = true;
    return;
  }
  themeStore.setTcgMode(want);
};

const confirmTcgMobile = () => {
  if (tcgDontShowAgain.value) {
    localStorage.setItem('gamenote_tcg_warning_dismissed', '1');
  }
  themeStore.setTcgMode(true);
  showTcgWarning.value = false;
};

const getCurrentThemeLabel = () => {
  const theme = themeStore.availableThemes.find(t => t.name === themeStore.currentTheme);
  return theme ? theme.label : 'Nepoznata tema';
};

const getCurrentThemeDescription = () => {
  const theme = themeStore.availableThemes.find(t => t.name === themeStore.currentTheme);
  return theme ? theme.description : 'Nema opisa';
};

const switchTheme = (themeName) => {
  console.log('🎨 Klikam na temu:', themeName);
  themeStore.setTheme(themeName);
};
</script>