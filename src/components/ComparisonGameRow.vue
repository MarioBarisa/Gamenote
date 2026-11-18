<template>
  <article class="card bg-base-200 shadow overflow-hidden relative comparison-game" :aria-label="row.title + ' · ' + row.platform">
    <img v-if="row.background" :src="row.background" alt="" class="comparison-game-background absolute inset-0 w-full h-full object-cover" loading="lazy" decoding="async" />
    <div class="absolute inset-0 bg-gradient-to-r from-base-100 via-base-100/50 to-base-100/20" aria-hidden="true"></div>
    <div class="relative grid grid-cols-2 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)] gap-3 sm:gap-4 p-3 sm:p-4">
      <div class="col-span-2 lg:col-span-1 flex items-center gap-3 min-w-0">
        <button type="button" class="shrink-0 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent" :aria-label="'Otvori poster igre: ' + row.title" @click="$emit('open-game', row)">
          <img :src="row.image" :alt="row.title" class="comparison-poster w-12 h-18 sm:w-16 sm:h-24 lg:w-20 lg:h-30 object-cover rounded-lg shadow-lg" loading="lazy" decoding="async" @error="posterError" />
        </button>
        <div class="min-w-0 rounded-box bg-base-100/85 p-2">
          <h3 class="font-extrabold text-base sm:text-lg leading-tight [overflow-wrap:anywhere]"><button type="button" class="text-left hover:underline rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent" :aria-label="'Otvori igru: ' + row.title" @click="$emit('open-game', row)">{{ row.title }}</button></h3>
          <span class="tooltip inline-flex mt-2 bg-base-100/90 rounded-box p-1.5" :data-tip="row.platform" :title="row.platform"><PlatformIcon :name="row.platform" class="size-6" /></span>
        </div>
      </div>
      <section v-for="(profile, index) in [left, right]" :key="index" class="min-w-0 rounded-box bg-base-100/95 p-2 sm:p-3 shadow-sm" :aria-label="profile.label">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 mb-3 min-h-10 sm:min-h-0">
          <p class="text-xs sm:text-sm font-bold truncate max-w-full" :title="profile.label">{{ profile.label }}</p>
          <span v-if="entries[index]" class="text-xs font-semibold" :class="GAME_STATUS_SELECT_CLASS[comparisonStatus(entries[index])]">{{ GAME_STATUS_MAP[comparisonStatus(entries[index])]?.label || '—' }}</span>
        </div>
        <template v-if="entries[index]">
          <div class="grid sm:grid-cols-2 gap-2">
            <div class="flex sm:block items-baseline justify-between gap-1"><span class="text-xs text-base-content/75">Sati</span><strong class="block text-lg sm:text-xl font-black tabular-nums" :class="row.hoursLeader === sides[index] ? GAME_STATUS_SELECT_CLASS.completed : ''">{{ format(hours[index]) }}<span v-if="hours[index] != null" class="text-xs font-semibold"> h</span></strong></div>
            <div class="flex sm:block items-baseline justify-between gap-1"><span class="text-xs text-base-content/75">Napredak</span><strong class="block text-lg sm:text-xl font-black tabular-nums" :title="progress[index]?.text" :class="row.progressLeader === sides[index] ? GAME_STATUS_SELECT_CLASS.completed : ''">{{ progress[index]?.percent == null ? '—' : progress[index].percent + '%' }}</strong></div>
          </div>
          <div class="h-1.5 rounded-full bg-base-300 mt-2" aria-hidden="true"><div class="h-full rounded-full" :style="{ backgroundColor: profile.color, width: `${progress[index]?.percent || 0}%` }"></div></div>
          <div class="mt-3 pt-2 border-t border-base-content/10"><ComparisonRating :value="entries[index].rating" /></div>
        </template>
        <p v-else class="text-sm opacity-70 py-4">Nema u zbirci</p>
      </section>
    </div>
  </article>
</template>
<script setup>
import { computed } from 'vue';
import { comparisonStatus } from '../services/libraryComparison.js';
import { GAME_STATUS_MAP, GAME_STATUS_SELECT_CLASS } from '../constants/gameStatus.js';
import PlatformIcon from './PlatformIcon.vue';
import ComparisonRating from './ComparisonRating.vue';
const props = defineProps({ row: { type: Object, required: true }, left: { type: Object, required: true }, right: { type: Object, required: true } });
defineEmits(['open-game']);
const entries = computed(() => [props.row.left, props.row.right]);
const hours = computed(() => [props.row.leftHours, props.row.rightHours]);
const progress = computed(() => [props.row.leftProgress, props.row.rightProgress]);
const sides = ['left', 'right'];
function format(value) { return value == null ? '—' : value.toLocaleString('hr-HR', { maximumFractionDigits: 1 }); }
function posterError(event) { if (!event.target.src.endsWith('/game-placeholder.svg')) event.target.src = '/game-placeholder.svg'; }
</script>
