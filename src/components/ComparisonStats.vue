<template>
  <section :aria-label="$t('comparisonStats.compareStats')" class="space-y-4">
    <div class="grid grid-cols-2 gap-3 sm:gap-4">
      <div v-for="(profile, index) in [left, right]" :key="profile.username" class="card bg-base-200 p-3 sm:p-5 min-w-0 comparison-summary" :style="{ borderTop: `3px solid ${profile.color}` }">
        <h3 class="font-bold text-sm sm:text-base break-words min-h-10 sm:min-h-0">{{ profile.label }}</h3>
        <p class="text-xs text-base-content/70 mt-4">{{ $t('common.playtime') }}</p><strong class="text-2xl sm:text-4xl font-black tabular-nums">{{ format(summaries[index].hours) }}<span class="text-sm font-semibold ml-1">h</span></strong>
        <div class="mt-4 grid sm:grid-cols-3 gap-3"><div><p class="text-xs text-base-content/70">{{ $t('common.games') }}</p><strong class="text-xl tabular-nums">{{ summaries[index].total }}</strong></div><div><p class="text-xs text-success font-semibold">{{ GAME_STATUS_MAP.completed.label }}</p><strong class="text-xl tabular-nums">{{ summaries[index].completed }}</strong></div><div><p class="text-xs text-base-content/70">{{ $t('comparisonStats.value100Progress') }}</p><strong class="text-xl tabular-nums">{{ summaries[index].perfected }}</strong></div></div>
        <div class="mt-4 border-t border-base-content/10 pt-3"><p class="text-xs text-base-content/70 mb-1">{{ $t('common.averageRating') }}</p><ComparisonRating :value="summaries[index].rating" /></div>
        <div class="grid sm:grid-cols-2 gap-3 mt-4"><div><p class="text-xs text-base-content/70 mb-1">{{ $t('common.favoriteGenre') }}</p><span v-if="profile.stats.favoriteGenre" class="tooltip inline-flex" :data-tip="profile.stats.favoriteGenre.name" :title="profile.stats.favoriteGenre.name"><GenreIcon :genre="profile.stats.favoriteGenre.name" class-name="size-7" /></span><span v-else>—</span></div><div><p class="text-xs text-base-content/70 mb-1">{{ $t('comparisonStats.topPlatform') }}</p><span class="tooltip inline-flex" :data-tip="summaries[index].topPlatform" :title="summaries[index].topPlatform"><PlatformIcon :name="summaries[index].topPlatform" class="size-7" /></span></div></div>
        <p class="text-xs text-base-content/70 mt-4">{{ $t('comparisonStats.mostPlayed') }}</p><p class="text-sm font-semibold break-words">{{ profile.stats.favoriteGame?.title || '—' }}</p>
      </div>
    </div>
    <div class="grid lg:grid-cols-2 gap-4 items-start">
      <div class="card bg-base-200 p-3 sm:p-5 min-w-0"><ComparisonRatingsChart :rows="rows" :left="left" :right="right" /></div>
      <figure class="card bg-base-200 p-3 sm:p-5 min-w-0">
        <figcaption class="font-bold text-lg">{{ $t('comparisonStats.hoursByPlatform') }}</figcaption><p class="text-xs text-base-content/70 mt-1">{{ $t('comparisonStats.upTo5PlatformsSame') }}</p>
        <div class="flex flex-wrap gap-x-4 gap-y-1 text-xs mt-3"><span v-for="(profile, index) in [left, right]" :key="profile.username" class="inline-flex items-center gap-2 font-semibold"><span class="platform-symbol" :class="{ diamond: index === 1 }" :style="{ background: profile.color }"></span>{{ profile.label }}</span></div>
        <div class="space-y-5 mt-6">
          <div v-for="platform in platforms" :key="platform.platform" class="flex gap-3 items-center"><span class="tooltip shrink-0 inline-flex" :data-tip="platform.platform" :title="platform.platform"><PlatformIcon :name="platform.platform" class="size-7" /></span><div class="flex-1 min-w-0 space-y-2"><div v-for="(profile, index) in [left, right]" :key="index" class="flex items-center gap-2" ><span class="platform-symbol" :class="{ diamond: index === 1 }" :style="{ background: profile.color }" aria-hidden="true"></span><span class="sr-only">{{ profile.label }}</span><div class="h-3 bg-base-300 rounded-full flex-1 overflow-hidden" aria-hidden="true"><div class="h-full rounded-full" :style="{ background: profile.color, width: bar(platform[index === 0 ? 'left' : 'right']) + '%' }"></div></div><strong class="text-xs tabular-nums w-16 text-right shrink-0">{{ format(platform[index === 0 ? 'left' : 'right']) }} h</strong></div></div></div>
        </div>
        <p v-if="!platforms.length" class="text-sm text-base-content/70 py-12 text-center">{{ $t('comparisonStats.noPlatformData') }}</p>
        <details v-else class="mt-5 text-xs"><summary class="cursor-pointer py-1 font-medium">{{ $t('common.chartData') }}</summary><div class="overflow-x-auto mt-2"><table class="table table-xs"><caption class="sr-only">{{ $t('comparisonStats.playtimeByPlatform') }}</caption><thead><tr><th scope="col">{{ $t('common.platform') }}</th><th scope="col">{{ left.label }}</th><th scope="col">{{ right.label }}</th></tr></thead><tbody><tr v-for="platform in platforms" :key="platform.platform"><th scope="row">{{ platform.platform }}</th><td>{{ format(platform.left) }} h</td><td>{{ format(platform.right) }} h</td></tr></tbody></table></div></details>
      </figure>
    </div>
  </section>
</template>
<script setup>
import { formatLocale } from '../i18n/index.js';
import { computed } from 'vue';
import { GAME_STATUS_MAP } from '../constants/gameStatus.js';
import { comparisonSummary, comparisonPlatforms } from '../services/libraryComparison.js';
import GenreIcon from './GenreIcon.vue';
import PlatformIcon from './PlatformIcon.vue';
import ComparisonRating from './ComparisonRating.vue';
import ComparisonRatingsChart from './ComparisonRatingsChart.vue';
const props = defineProps({ left: { type: Object, required: true }, right: { type: Object, required: true }, leftGames: { type: Array, required: true }, rightGames: { type: Array, required: true }, rows: { type: Array, required: true } });
const summaries = computed(() => [comparisonSummary(props.leftGames), comparisonSummary(props.rightGames)]);
const platforms = computed(() => comparisonPlatforms(props.leftGames, props.rightGames));
const maxHours = computed(() => Math.max(1, ...platforms.value.flatMap(platform => [platform.left || 0, platform.right || 0])));
function format(value) { return value == null ? '—' : value.toLocaleString(formatLocale.value, { maximumFractionDigits: 1 }); }
function bar(value) { return (value || 0) / maxHours.value * 100; }
</script>

<style scoped>
.platform-symbol { display: inline-block; width: .5rem; height: .5rem; border-radius: 50%; flex-shrink: 0; }
.platform-symbol.diamond { border-radius: 1px; transform: rotate(45deg); }
</style>
