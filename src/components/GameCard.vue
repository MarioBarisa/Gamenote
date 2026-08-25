<template>
  <component
    :is="tcgActive ? 'hover-tilt' : 'div'"
    v-bind="tcgActive ? tiltAttrs : {}"
    class="game-card-host h-full"
    :class="[
      { 'tcg-round': tcgActive, 'tcg-ex': !!foilVariant },
      foilVariant ? `tcg-ex--${foilVariant}` : ''
    ]"
  >
    <div
      class="game-card card bg-base-200 shadow-xl h-full"
      :class="[
        tcgActive ? '' : 'transform transition-all duration-300 hover:scale-105 hover:shadow-2xl',
        { 'relative overflow-hidden': !!foilVariant }
      ]"
    >
    <figure :class="`relative ${cardSizeStore.getSizeConfig(cardSizeStore.cardSize).imageHeight} overflow-hidden`">
      <img
        :src="getGameImage(game)"
        :alt="game.title"
        class="w-full h-full object-cover"
        decoding="async"
        :loading="lazy ? 'lazy' : undefined"
      />
      <!-- TCG folija -->
      <div v-if="foilVariant" class="tcg-foil" :class="`tcg-foil--${foilVariant}`" aria-hidden="true"></div>
      <!-- 100% Badge --->
      <div v-if="achievementPercent === 100 && !foilVariant" class="absolute top-0 left-0 m-1 sm:m-2">
        <div class="badge bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-black font-bold text-xs sm:text-sm p-2 sm:p-3 shadow-lg border-2 border-yellow-300">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 sm:h-4 sm:w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          100%
        </div>
      </div>
    </figure>
    <div :class="`card-body ${cardSizeStore.getSizeConfig(cardSizeStore.cardSize).cardBody} flex flex-col`">
      <h2 :class="`card-title ${cardSizeStore.getSizeConfig(cardSizeStore.cardSize).titleSize} font-bold mb-1 line-clamp-1`">{{ game.title }}</h2>
      <!-- Status badge -->
      <div v-if="gameStatus" class="mb-2">
        <span :class="[`badge ${cardSizeStore.getSizeConfig(cardSizeStore.cardSize).badgeSize} p-1.5 sm:p-2 font-semibold`, statusBadgeClass]">
          {{ statusBadgeText }}
        </span>
      </div>
      
      <div class="flex items-center text-xs sm:text-sm mb-2">
        <span class="badge badge-outline p-2 h-auto tooltip tooltip-top" :data-tip="game.platform || 'Nepoznata platforma'">
          <PlatformIcon :name="game.platform" class="w-6 h-6" />
        </span>
          <span v-if="genreList.length" class="badge badge-outline ml-2 p-2 h-auto">
            <span v-for="(g, index) in genreList" :key="g" class="tooltip tooltip-top" :class="{ 'hidden sm:inline-flex': index >= 2 }" :data-tip="g">
              <GenreIcon :genre="g" class="w-6 h-6" />
            </span>
          </span>
        <button v-if="game.notes" @click.stop="showNotesModal = true" class="ml-2 btn btn-ghost btn-xs sm:btn-sm p-1 sm:p-2 h-auto" title="Prikazi bilješke">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
        </button>
      </div>

      <!-- Modal za bilješke (teleportirano izvan kartice radi overflow/tilt isjecanja) -->
      <Teleport to="body">
        <div v-if="showNotesModal" class="modal modal-open">
          <div class="modal-box max-w-2xl">
            <h3 class="font-bold text-lg mb-4">{{ game.title }}</h3>
            <div class="bg-base-100 p-4 rounded mb-4 max-h-96 overflow-y-auto">
              <p class="text-sm whitespace-pre-wrap">{{ game.notes }}</p>
            </div>
            <div class="modal-action">
              <button class="btn btn-primary" @click.stop="showNotesModal = false">Zatvori</button>
            </div>
          </div>
          <form method="dialog" class="modal-backdrop" @click.stop="showNotesModal = false"></form>
        </div>
      </Teleport>
      
      <div class="flex items-center mb-2">
        <div class="flex">
          <template v-for="star in 5" :key="star">
            <svg class="w-3 h-3 sm:w-4 sm:h-4" 
                 :class="star <= (game.rating || 0) ? 'text-orange-400' : 'text-gray-400'"
                 fill="currentColor" 
                 viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
          </template>
        </div>
        <span class="ml-1 sm:ml-2 text-xs sm:text-sm opacity-70">{{ game.rating || 0 }}/5</span>
      </div>
      

      <div class="mt-auto space-y-2 pt-2">


<!-- Datumi -->
<div v-if="(game.start_date || game.end_date) && gameStatus !== 'playing'" class="flex items-center gap-1.5 text-xs opacity-60">
  <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
  </svg>
  <span v-if="game.start_date">{{ formatDate(game.start_date) }}</span>
  <template v-if="game.start_date && game.end_date">
    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
    </svg>
    <span>{{ formatDate(game.end_date) }}</span>
  </template>
  <template v-else-if="!game.start_date && game.end_date">
    <span>do {{ formatDate(game.end_date) }}</span>
  </template>
</div>

<!-- Play time -->
<div v-if="game.play_time" class="text-xs sm:text-sm opacity-70">
  {{ game.play_time }}h igranja
</div>

<!-- Progress -->
<div v-if="game.progress_value && game.progress_total" class="space-y-1">
  <div class="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
    <div
      class="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-2 rounded-full transition-all"
      :style="{ width: `${achievementPercent}%` }"
    ></div>
  </div>
  <div class="flex justify-between items-center text-xs">
    <span class="font-semibold">{{ validatedProgressValue }}/{{ game.progress_total }} {{ achievementLabel }}</span>
    <span class="opacity-70">{{ achievementPercent }}%</span>
  </div>
</div>

    </div>

    </div>
  </div>
  </component>
</template>

<script>
import { useCardSizeStore } from '../stores/cardSize';
import { useThemeStore } from '../stores/theme';
import { ref, watch } from 'vue';
import PlatformIcon from './PlatformIcon.vue';
import GenreIcon from './GenreIcon.vue';

// hover-tilt se registrira samo jednom i tek kad je TCG način aktivan
let hoverTiltRegistered = false;

export default {
  name: 'GameCard',
  components: { PlatformIcon, GenreIcon },
  props: {
    game: {
      type: Object,
      required: true
    },
    lazy: {
      type: Boolean,
      default: false
    },
    noTcg: {
      type: Boolean,
      default: false
    }
  },
  setup() {
    const cardSizeStore = useCardSizeStore();
    const themeStore = useThemeStore();
    const showNotesModal = ref(false);

    const ensureHoverTilt = () => {
      if (!hoverTiltRegistered) {
        hoverTiltRegistered = true;
        import('hover-tilt/web-component');
      }
    };
    watch(
      () => themeStore.tcgMode,
      (on) => { if (on) ensureHoverTilt(); },
      { immediate: true }
    );

    return { cardSizeStore, themeStore, showNotesModal };
  },
  computed: {
    tcgActive() {
      return this.themeStore.tcgMode && !this.noTcg;
    },
    perfectRating() {
      return (this.game?.rating || 0) === 5;
    },
    foilVariant() {
      if (!this.tcgActive) return null;
      const ach = this.achievementPercent === 100;
      if (ach && this.perfectRating) return 'prism';
      if (ach) return 'gold';
      if (this.perfectRating) return 'holo';
      return null;
    },
    tiltAttrs() {
      const glareHue = { gold: '45', holo: '270', prism: '180' };
      return {
        'tilt-factor': '1.4',
        'scale-factor': '1.04',
        shadow: true,
        'shadow-blur': '18',
        'glare-intensity': '0.4',
        'glare-hue': glareHue[this.foilVariant] || '270',
        'blend-mode': 'overlay',
        'spring-options': '{"stiffness": 0.25, "damping": 0.75}',
        'exit-delay': '120'
      };
    },
    genreList() {
      const game = this.game;
      if (!game) return [];
      let list = [];
      if (game.genres_list) {
        try {
          const parsed = JSON.parse(game.genres_list);
          if (Array.isArray(parsed) && parsed.length > 0) list = parsed;
        } catch {
          // ignore
        }
      }
      if (list.length === 0 && game.genre) {
        list = game.genre.split(',').map(g => g.trim());
      }
      return list.filter(Boolean).slice(0, 3);
    },
    achievementLabel() {
      const source = this.game?.progress_source;
      const mode = this.game?.progress_mode;

      if (mode === 'trophies_psn') return 'PSN Trophies';
      if (mode === 'achievements_xbox' || mode === 'trophies_xbox') return 'Xbox Achievements';
      if (mode === 'achievements_steam') return 'Steam Achievements';
      if (mode === 'achievements_gamecenter' || mode === 'achievements_gamecentre') return 'Game Center Achievements';
      if (mode === 'pokedex') return 'Pokédex';
      if (source === 'PlayStation 4' || source === 'PlayStation 5') return 'PSN Trophies';
      if (source === 'Xbox One' || source === 'Xbox Series X/S') return 'Xbox Achievements';
      if (source === 'Steam') return 'Steam Achievements';
      if (source === 'Nintendo Switch') return 'Achievements';

      return 'Achievements';
    },
    achievementPercent() {
      if (!this.game?.progress_value || !this.game?.progress_total) return 0;
      const value = Math.min(this.game.progress_value, this.game.progress_total);
      return Math.round((value / this.game.progress_total) * 100);
    },
    validatedProgressValue() {
      if (!this.game?.progress_value || !this.game?.progress_total) return 0;
      return Math.min(this.game.progress_value, this.game.progress_total);
    },
    gameStatus() {
      // BINTO: Support both new 'status' field and legacy 'currently_playing' !!!!!!
      if (this.game?.status) return this.game.status;
      if (this.game?.currently_playing) return 'playing';
      if (this.game?.end_date) return 'completed';
      return null;
    },
    statusBadgeText() {
      const statusMap = {
        'playing': 'Trenutno igram',
        'paused': 'Pauzirano',
        'completed': 'Završeno',
        'dropped': 'Napušteno',
        'backlog': 'Backlog',
        'wishlist': 'Wishlist'
      };
      return statusMap[this.gameStatus] || this.gameStatus;
    },
    statusBadgeClass() {
      const classMap = {
        'playing': 'badge-primary',
        'paused': 'badge-warning',
        'completed': 'badge-success',
        'dropped': 'badge-error',
        'backlog': 'badge-ghost',
        'wishlist': 'badge-accent'
      };
      return classMap[this.gameStatus] || 'badge-neutral';
    }
  },
  methods: {
    truncateText(text, maxLength) {
      if (!text) return '';
      return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    },
    getGameImage(game) {
      //FUNKCIJA SLIKE
      if (game.image_url) return game.image_url;
      if (game.background_image) return game.background_image;
      
      
      if (game.game_api_id && game.background_image) {
        return game.background_image;
      }
      
      
      return 'https://placehold.co/600x400?text=No+Image';
    },
    renderStars(rating) {
      const stars = [];
      for (let i = 1; i <= 5; i++) {
        stars.push(i <= rating);
      }
      return stars;
    },
    formatDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString('hr-HR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

  }
};
</script>

<style scoped>
/* Tooltips only on precise-pointer (PC) devices */
@media (hover: none), (pointer: coarse) {
  .tooltip::before,
  .tooltip::after {
    display: none !important;
  }
}

/* ===== TCG način ===== */
.game-card-host {
  display: block;
}

/* Izolacija: folija smije miješati isključivo sa svojim sadržajem (poster img).
   Bez ovoga preserve-3d/transform kontekst hover-tilta može preusmjeriti blend
   prema prozirnoj pozadini → poster djeluje "prozirno". */
.game-card figure {
  isolation: isolate;
}

/* Folija: cijeli poster, sijaj prati nagib kartice (hover-tilt varijable, 0–1).
   Gradijenti su "trakasti" — crni razmaci ne mijenjaju sliku uz color-dodge,
   pa detalji ostaju vidljivi između sjajnih traka. */
.tcg-foil {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  mix-blend-mode: color-dodge;
  opacity: 0.45;
  background-size: 220% 220%;
  background-position:
    calc(var(--hover-tilt-x, 0.5) * 100%)
    calc(var(--hover-tilt-y, 0.5) * 100%);
  animation: tcg-foil-breathe 7s ease-in-out infinite alternate;
}

.tcg-foil--gold {
  background-image: linear-gradient(
    115deg,
    #000 12%, #f7e08b 22%, #000 34%,
    #fff3b0 44%, #000 56%,
    #d4af37 66%, #000 78%,
    #ffe98a 88%, #000 100%
  );
}

.tcg-foil--holo {
  background-image: linear-gradient(
    115deg,
    #000 10%, #7c3aed 20%, #000 32%,
    #22d3ee 42%, #000 54%,
    #f472b6 64%, #000 76%,
    #2dd4bf 86%, #000 100%
  );
}

.tcg-foil--prism {
  background-image: conic-gradient(
    from 90deg at 50% 50%,
    #000, #f7e08b 15%, #000 30%,
    #22d3ee 45%, #000 60%,
    #f472b6 75%, #000 90%, #000
  );
  opacity: 0.55;
}

/* Gamenote logo je sada dio EX Holo sloja (::part(tilt)::after u ne-scoped bloku ispod) */

@keyframes tcg-foil-breathe {
  from { background-size: 220% 220%; }
  to { background-size: 260% 260%; }
}

@media (prefers-reduced-motion: reduce) {
  .tcg-foil {
    animation: none;
  }
}
</style>

<!-- NE-scoped: ::part() selektori moraju živjeti u globalnom CSS-u da bi došli do
     shadow DOM-a hover-tilt web komponente. Uzorak: Pokemon "ex Holo" primjer iz dokumentacije. -->
<style>
.tcg-round::part(container),
.tcg-round::part(tilt) {
  border-radius: var(--radius-box, 1rem);
  isolation: isolate;
}

/* Tekstura folije sa zvjezdicama (SVG) se miješa u zadani gradijent sjaja,
   pa se cijela kompozicija soft-lightom prelije preko kartice — uzorak:
   Pokemon "ex Holo" primjer iz hover-tilt dokumentacije. */
.tcg-ex::part(tilt)::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  /* slojevi: Gamenote logo (vrh, normal) → folija sa zvjezdicama → zadani gradijent sjaja.
     Logo MORA biti iznad folije — color-burn tamne teksture inače poništi sve
     osim čisto bijelih piksala (zvjezdica). */
  background-image:
    url('../assets/newAssets/GamenoteMainLogo.png'),
    url('../assets/tcg/foil-spectrum.svg'),
    var(--hover-tilt-default-gradient);
  background-size: 50% auto, 120% 160%, cover;
  background-position:
    center center,
    calc(50% + var(--hover-tilt-x, 0) * 60px)
    calc(50% + var(--hover-tilt-y, 0) * 60px),
    center;
  background-repeat: no-repeat;
  background-blend-mode: normal, color-burn;
  mix-blend-mode: soft-light;
  opacity: calc(0.25 + var(--hover-tilt-opacity, 0) * 0.5);
  will-change: background-position, opacity;
}

/* Prizma — lagano pomaknuta paleta istog uzorka */
.tcg-ex--prism::part(tilt)::after {
  filter: hue-rotate(20deg);
}

/* Zlatna varijanta — topla šampanj folija */
.tcg-ex--gold::part(tilt)::after {
  background-image:
    url('../assets/newAssets/GamenoteMainLogo.png'),
    url('../assets/tcg/foil-gold.svg'),
    var(--hover-tilt-default-gradient);
}
</style>
