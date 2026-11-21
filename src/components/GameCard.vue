<template>
  <component
    :is="tcgActive ? 'hover-tilt' : 'div'"
    v-bind="tcgActive ? tiltAttrs : {}"
    class="game-card-host h-full"
    :class="marquee ? 'marquee-card' : ''"
  >
    <div
      class="game-card relative card bg-base-200 shadow-xl h-full"
      :class="[
        tcgActive ? '' : 'transform transition-all duration-300 hover:scale-105 hover:shadow-2xl',
        { 'relative overflow-hidden': !!foilVariant }
      ]"
    >
    <router-link v-if="to" :to="to" :aria-label="game.title" class="card-open-link absolute inset-0 z-10 rounded-box" @click="$emit('open')" />
    <figure :class="`relative w-full ${sizeCfg.poster} overflow-hidden`">
      <img
        :src="getGameImage(game)"
        :alt="game.title"
        class="w-full h-full object-cover"
        decoding="async"
        @error="posterError"
        :loading="lazy ? 'lazy' : undefined"
      />
      <!-- TCG folija -->
      <div v-if="foilVariant" class="tcg-foil" :class="{ 'tcg-foil--gold': foilVariant === 'gold', 'tcg-foil--holo': foilVariant === 'holo', 'tcg-foil--prism': foilVariant === 'prism' }" aria-hidden="true"></div>
      <!-- 100% Badge --->
      <div v-if="progress.complete && !foilVariant" class="absolute top-0 left-0 m-1 sm:m-2">
        <div class="badge bg-linear-to-r from-yellow-400 via-amber-500 to-yellow-600 text-black font-bold text-xs sm:text-sm p-2 sm:p-3 shadow-lg border-2 border-yellow-300">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 sm:h-4 sm:w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          100%
        </div>
      </div>
    </figure>
    <div class="card-body flex flex-col" :class="sizeCfg.cardBody">
      <h2 class="card-title font-bold mb-1 line-clamp-1" :class="sizeCfg.titleSize">{{ game.title }}</h2>
      <!-- Status badge -->
      <div v-if="gameStatus" class="mb-2">
        <span :class="[`badge ${sizeCfg.badge} font-semibold`, statusBadgeClass]">
          {{ statusBadgeText }}
        </span>
      </div>
      <div v-else class="mb-2" aria-hidden="true">
        <span :class="`badge ${sizeCfg.badge} font-semibold invisible`">Playing</span>
      </div>
      
      <div class="flex flex-wrap items-center gap-y-1 text-xs sm:text-sm mb-2">
        <component :is="to ? 'router-link' : 'span'" :to="to || undefined" :tabindex="to ? -1 : undefined" @click="to && $emit('open')" :class="{ 'relative z-20': to }" class="badge badge-outline p-2 h-auto tooltip tooltip-top" :data-tip="game.platform || $t('common.unknownPlatform')" :aria-label="game.platform || $t('common.unknownPlatform')">
          <PlatformIcon :name="game.platform" class="marquee-platform w-6 h-6" />
        </component>
        <component :is="to ? 'router-link' : 'span'" v-if="visibleGenres.length" :to="to || undefined" :tabindex="to ? -1 : undefined" @click="to && $emit('open')" :class="{ 'relative z-20': to }" class="badge badge-outline ml-1 sm:ml-2 p-2 h-auto" :aria-label="visibleGenres.join(', ')">
          <span v-for="g in visibleGenres" :key="g" class="tooltip tooltip-top inline-flex" :data-tip="g">
            <GenreIcon :genre="g" class="w-6 h-6" />
          </span>
        </component>
        <span v-else class="badge badge-outline ml-1 sm:ml-2 p-2 h-auto invisible" aria-hidden="true">
          <GenreIcon genre="" class="w-6 h-6" />
        </span>
        <button v-if="game.notes" @click.stop="showNotesModal = true" class="relative z-20 ml-1 sm:ml-2 btn btn-ghost btn-xs sm:btn-sm p-1 sm:p-2 h-auto shrink-0" :title="$t('gameCard.showNotes')" :aria-label="$t('gameCard.showNotesLabel', [game.title])">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
        </button>
        <button v-else class="relative z-20 ml-1 sm:ml-2 btn btn-ghost btn-xs sm:btn-sm p-1 sm:p-2 h-auto shrink-0 invisible" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
        </button>
      </div>

      <!-- Bilješke izvan 3D kartice. -->
      <Teleport to="body">
        <AppModal v-if="showNotesModal" :label="$t('common.notes')" @close="showNotesModal = false">
          <div class="modal-box max-w-2xl">
          <button type="button" class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 z-20" :aria-label="$t('common.close')" @click.stop="showNotesModal = false">✕</button>
            <h3 class="font-bold text-lg mb-4">{{ game.title }}</h3>
            <div class="bg-base-100 p-4 rounded mb-4 max-h-96 overflow-y-auto">
              <p class="text-sm whitespace-pre-wrap">{{ game.notes }}</p>
            </div>

          </div>
          <form method="dialog" class="modal-backdrop" @click.stop="showNotesModal = false"></form>
        </AppModal>
      </Teleport>
      
      <div v-if="game.rating != null" class="flex items-center mb-2">
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
      

      <div v-if="meta" class="mt-auto space-y-2 pt-2">


<!-- Datumi -->
<div class="flex items-center gap-1.5 text-xs min-h-8" :class="showDates ? 'opacity-60' : 'opacity-40'">
  <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
  </svg>
  <template v-if="showDates">
    <span v-if="game.start_date">{{ formatDate(game.start_date) }}</span>
    <template v-if="game.start_date && game.end_date">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
      </svg>
      <span>{{ formatDate(game.end_date) }}</span>
    </template>
    <template v-else-if="!game.start_date && game.end_date">
      <span>{{ $t('common.to') }} {{ formatDate(game.end_date) }}</span>
    </template>
  </template>
  <span v-else :title="datesHint">–</span>
</div>

<!-- Play time -->
<div class="text-xs sm:text-sm min-h-5 flex items-center opacity-70">
  {{ game.play_time || 0 }}{{ $t('gameCard.hPlayed') }}
</div>

<!-- Progress -->
<div class="space-y-1" :aria-label="hasProgress ? undefined : $t('gameCard.noProgressData')">
  <div class="w-full rounded-full h-2 overflow-hidden" :class="hasProgress ? 'bg-gray-700' : 'bg-base-300/50 border border-dashed border-base-content/25'">
    <div
      v-if="hasProgress && progress.percent !== null"
      class="bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 h-2 rounded-full transition-all"
      :style="{ width: `${achievementPercent}%` }"
    ></div>
  </div>
  <div class="flex justify-between items-center gap-1 text-xs min-h-4" :class="{ 'opacity-40': !hasProgress }">
    <template v-if="hasProgress">
      <span class="font-semibold min-w-0">{{ progress.text }}<template v-if="game.progress_mode !== 'leaderboard_rank' && !game.progress_mode?.startsWith('completion_')"> {{ ' ' + achievementLabel }}</template></span>
      <span v-if="progress.percent !== null" class="opacity-70 shrink-0">{{ achievementPercent }}%</span>
    </template>
    <template v-else>
      <span class="font-semibold">— {{ achievementLabel }}</span>
      <span>—</span>
    </template>
  </div>
</div>

    </div>

    </div>

    <!-- EX-holo preko cijele kartice -->
    <div v-if="foilVariant" class="tcg-exholo" :class="{ 'tcg-exholo--gold': foilVariant === 'gold', 'tcg-exholo--prism': foilVariant === 'prism' }" aria-hidden="true"></div>
  </div>
  </component>
</template>

<script>
import { formatLocale, t } from '../i18n/index.js';
import AppModal from './AppModal.vue';
import { useCardSizeStore } from '../stores/cardSize';
import { useThemeStore } from '../stores/theme';
import { ref, watch } from 'vue';
import { cardProgress } from '../services/cardProgress.js';
import { GAME_STATUS_MAP } from '../constants/gameStatus';
import PlatformIcon from './PlatformIcon.vue';
import GenreIcon from './GenreIcon.vue';

// Učitaj efekt tek nakon uključivanja.
let hoverTiltLoading = null;

export default {
  name: 'GameCard',
  emits: ['open'],
  components: { AppModal, PlatformIcon, GenreIcon },
  props: {
    to: { type: String, default: '' },
    game: {
      type: Object,
      required: true
    },
    size: {
      type: String,
      default: ''
    },
    lazy: {
      type: Boolean,
      default: false
    },
    tcg: {
      type: Boolean,
      default: undefined
    },
    noTcg: {
      type: Boolean,
      default: false
    },
    meta: {
      type: Boolean,
      default: true
    },
    marquee: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const cardSizeStore = useCardSizeStore();
    const themeStore = useThemeStore();
    const showNotesModal = ref(false);

    const ensureHoverTilt = () => {
      if (typeof customElements === 'undefined' || customElements.get('hover-tilt') || hoverTiltLoading) return;
      hoverTiltLoading = import('hover-tilt/web-component').catch(error => {
        hoverTiltLoading = null;
        console.error('TCG efekt nije moguće učitati.', error);
      });
    };
    watch(
      () => (props.tcg ?? themeStore.tcgMode) && !props.noTcg,
      (on) => { if (on) ensureHoverTilt(); },
      { immediate: true }
    );

    return { cardSizeStore, themeStore, showNotesModal };
  },
  computed: {
    sizeCfg() {
      return this.cardSizeStore.getSizeConfig(this.size || this.cardSizeStore.cardSize);
    },
    hasDates() {
      return !!(this.game?.start_date || this.game?.end_date);
    },
    showDates() {
      return this.hasDates && this.gameStatus !== 'playing';
    },
    datesHint() {
      return this.gameStatus === 'playing' ? 'U tijeku' : t('gameCard.noDate');
    },
    progress() { return cardProgress(this.game); },
    hasProgress() { return this.progress.available; },
    visibleGenres() {
      return this.genreList.slice(0, this.sizeCfg.maxGenres ?? 3);
    },
    tcgActive() {
      return (this.tcg ?? this.themeStore.tcgMode) && !this.noTcg;
    },
    perfectRating() {
      return (this.game?.rating || 0) === 5;
    },
    foilVariant() {
      if (!this.tcgActive) return null;
      const ach = this.progress.complete;
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
          // Neispravan popis koristi rezervni žanr.
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
    achievementPercent() { return this.progress.percent ?? 0; },
    gameStatus() {
      // Podrži i stariji zapis statusa.
      if (this.game?.status) return this.game.status;
      if (this.game?.currently_playing) return 'playing';
      if (this.game?.end_date) return 'completed';
      return null;
    },
    statusBadgeText() {
      return GAME_STATUS_MAP[this.gameStatus]?.label || this.gameStatus;
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
      return game.image_url || game.background_image || '/game-placeholder.svg';
    },
    posterError(event) {
      const image = event.target;
      const fallback = this.game.background_image;
      if (fallback && image.dataset.fallback !== 'used' && image.src !== new URL(fallback, location.origin).href) {
        image.dataset.fallback = 'used';
        image.src = fallback;
        return;
      }
      image.onerror = null;
      if (!image.src.endsWith('/game-placeholder.svg')) image.src = '/game-placeholder.svg';
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
  return d.toLocaleDateString(formatLocale.value, { day: '2-digit', month: '2-digit', year: 'numeric' });
}

  }
};
</script>

<style scoped>
/* Tooltip prikazuje samo precizni pokazivač. */
@media (hover: none), (pointer: coarse) {
  .tooltip::before,
  .tooltip::after {
    display: none !important;
  }
}

/* Kompaktan prikaz samo za marquee. */
.marquee-card .game-card {
  height: auto;
  border-radius: 0.5rem !important;
  overflow: hidden;
}

.marquee-card .game-card figure {
  height: 4.5rem !important;
  overflow: hidden;
  border-radius: 0.5rem 0.5rem 0 0 !important;
}

@media (min-width: 640px) {
  .marquee-card .game-card figure {
    height: 5.5rem !important;
  }
}

@media (min-width: 768px) {
  .marquee-card .game-card figure {
    height: 6.5rem !important;
  }
}

.marquee-card .game-card img {
  object-fit: cover !important;
}

.marquee-card .game-card .card-body {
  padding: 0.2rem 0.45rem !important;
  border-radius: 0 0 0.5rem 0.5rem !important;
}

.marquee-card .game-card .card-title {
  font-size: 0.7rem;
  line-height: 1.1;
}

.marquee-card .game-card .badge {
  font-size: 0.55rem !important;
  padding: 0.08rem 0.3rem !important;
  height: auto !important;
  min-height: 0 !important;
}

.marquee-card .badge-outline {
  padding: 0.15rem 0.25rem !important;
}

.marquee-card .badge-outline svg,
.marquee-card .marquee-platform {
  width: 0.9rem !important;
  height: 0.9rem !important;
}

.marquee-card .text-xs,
.marquee-card .text-sm {
  font-size: 0.6rem !important;
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
/* Varijable postavlja hover-tilt. */
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

.tcg-exholo {
  position: absolute;
  inset: 0;
  z-index: 5;
  border-radius: inherit;
  pointer-events: none;
  /* Logo uvijek iznad folije */
  /* Offset simetričan, manji od rezerve */
  background-image:
    url('../assets/newAssets/GamenoteMainLogo.png'),
    url('../assets/tcg/foil-spectrum.svg'),
    var(--hover-tilt-default-gradient);
  background-size: 50% auto, 140% 160%, cover;
  background-position:
    center center,
    calc(50% + (var(--hover-tilt-x, 0) - 0.5) * 40px)
    calc(50% + (var(--hover-tilt-y, 0) - 0.5) * 40px),
    center;
  background-repeat: no-repeat;
  background-blend-mode: normal, color-burn;
  mix-blend-mode: soft-light;
  opacity: calc(0.25 + var(--hover-tilt-opacity, 0) * 0.5);
  will-change: background-position, opacity;
}

/* Prizma — lagano pomaknuta paleta istog uzorka */
.tcg-exholo--prism {
  filter: hue-rotate(20deg);
}

/* Zlatna varijanta — topla šampanj folija */
.tcg-exholo--gold {
  background-image:
    url('../assets/newAssets/GamenoteMainLogo.png'),
    url('../assets/tcg/foil-gold.svg'),
    var(--hover-tilt-default-gradient);
}
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

<!-- ::part mora biti globalno -->
<style>
.game-card-host::part(container),
.game-card-host::part(tilt) {
  height: 100%;
  border-radius: var(--radius-box, 1rem);
  isolation: isolate;
}
</style>
