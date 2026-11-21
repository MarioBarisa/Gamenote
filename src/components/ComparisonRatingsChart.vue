<template>
  <figure class="block min-w-0">
    <figcaption class="font-bold text-lg">{{ $t('comparisonRatingsChart.ratingsAndMetacritic') }}</figcaption>
    <p class="text-xs text-base-content/70 mt-1">{{ $t('comparisonRatingsChart.sharedGamesUpTo12') }}</p>
    <div class="flex flex-wrap gap-x-4 gap-y-1 text-xs mt-3">
      <span v-for="(profile, index) in [left, right]" :key="index" class="inline-flex items-center gap-2 font-semibold"><span class="chart-symbol" :class="{ diamond: index === 1 }" :style="{ background: profile.color }"></span>{{ profile.label }}</span>
    </div>
    <template v-if="points.length">
      <div class="ratings-chart mt-4">
        <span class="chart-axis-title text-xs">{{ $t('comparisonRatingsChart.rating5') }}</span>
        <div class="chart-y-labels text-xs tabular-nums" aria-hidden="true"><span v-for="value in [5, 4, 3, 2, 1, 0]" :key="value" :style="{ top: (5 - value) * 20 + '%' }">{{ value }}</span></div>
        <div class="chart-plot">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" class="absolute inset-0 size-full" aria-hidden="true">
            <path v-for="value in [0, 20, 40, 60, 80, 100]" :key="value" :d="`M0 ${value}H100`" class="chart-grid" vector-effect="non-scaling-stroke" />
            <path d="M0 100L100 0" class="chart-grid" stroke-dasharray="3 3" vector-effect="non-scaling-stroke" />
            <path v-for="point in points" :key="point.key" :d="`M${point.metacritic} ${100 - point.left * 20}V${100 - point.right * 20}`" class="chart-connector" :class="{ selected: selected?.key === point.key }" vector-effect="non-scaling-stroke" />
          </svg>
          <template v-for="point in points" :key="point.key">
            <button v-for="(profile, index) in [left, right]" :key="index" type="button" class="chart-point" :class="{ 'point-selected': selected?.key === point.key }" :style="{ left: `calc(${point.metacritic}% + ${index === 0 ? -4 : 4}px)`, top: (100 - point[index === 0 ? 'left' : 'right'] * 20) + '%', color: profile.color }" :aria-label="`${point.title} · ${point.platform}, ${profile.label}: ${point[index === 0 ? 'left' : 'right']}/5, Metacritic ${point.metacritic}`" :aria-pressed="selected?.key === point.key" @mouseenter="selected = point" @focus="selected = point" @click="selected = point"><span class="chart-symbol" :class="{ diamond: index === 1 }"></span></button>
          </template>
        </div>
        <div class="chart-x-labels flex justify-between text-xs tabular-nums" aria-hidden="true"><span>0</span><span>50</span><span>100</span></div>
        <p class="text-xs text-center mt-1">Metacritic / 100</p>
      </div>
      <div class="rounded-box bg-base-100 p-3 text-sm min-h-22 mt-3">
        <template v-if="selected"><p class="font-bold break-words">{{ selected.title }} <span class="text-xs font-normal text-base-content/70">· {{ selected.platform }}</span></p><div class="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs"><span>{{ left.label }} <strong>{{ selected.left }}/5</strong></span><span>{{ right.label }} <strong>{{ selected.right }}/5</strong></span><span>Metacritic <strong>{{ selected.metacritic }}</strong></span></div></template>
        <p v-else class="text-base-content/70">{{ $t('comparisonRatingsChart.tapAPointToCompare') }}</p>
      </div>
      <details class="mt-3 text-xs"><summary class="cursor-pointer py-1 font-medium">{{ $t('common.chartData') }}</summary><div class="overflow-x-auto mt-2"><table class="table table-xs"><caption class="sr-only">{{ $t('comparisonRatingsChart.ratingsAndMetacriticForShared') }}</caption><thead><tr><th scope="col">{{ $t('common.game') }}</th><th scope="col">Metacritic</th><th scope="col">{{ left.label }}</th><th scope="col">{{ right.label }}</th></tr></thead><tbody><tr v-for="point in points" :key="point.key"><th scope="row">{{ point.title }} · {{ point.platform }}</th><td>{{ point.metacritic }}</td><td>{{ point.left }}/5</td><td>{{ point.right }}/5</td></tr></tbody></table></div></details>
    </template>
    <p v-else class="text-sm text-base-content/70 py-12 text-center">{{ $t('comparisonRatingsChart.theChartNeedsSharedRated') }}</p>
  </figure>
</template>
<script setup>
import { computed, ref } from 'vue';
import { comparisonRatingPairs } from '../services/libraryComparison.js';
const props = defineProps({ rows: { type: Array, required: true }, left: { type: Object, required: true }, right: { type: Object, required: true } });
const points = computed(() => comparisonRatingPairs(props.rows));
const selected = ref(null);
</script>
<style scoped>
.ratings-chart { position: relative; padding: 1.75rem 1rem 0 1.5rem; }
.chart-axis-title { position: absolute; top: 0; left: 0; }
.chart-plot { position: relative; height: 12rem; border-left: 1px solid color-mix(in oklab, currentColor 35%, transparent); border-bottom: 1px solid color-mix(in oklab, currentColor 35%, transparent); }
.chart-grid { fill: none; stroke: currentColor; stroke-opacity: .12; stroke-width: 1; }
.chart-connector { fill: none; stroke: currentColor; stroke-opacity: .25; stroke-width: 1.5; }
.chart-connector.selected { stroke-opacity: .75; stroke-width: 2; }
.chart-y-labels { position: absolute; top: 1.75rem; left: 0; height: 12rem; width: 1rem; text-align: right; }
.chart-y-labels span { position: absolute; right: 0; transform: translateY(-50%); }
.chart-x-labels { margin-top: .5rem; }
.chart-point { position: absolute; display: grid; place-items: center; width: 24px; height: 24px; transform: translate(-50%, -50%); border-radius: 50%; cursor: pointer; z-index: 1; }
.chart-symbol { display: inline-block; width: 10px; height: 10px; flex-shrink: 0; border-radius: 50%; background: currentColor; outline: 1px solid var(--color-base-100); }
.chart-symbol.diamond { border-radius: 1px; transform: rotate(45deg); }
.chart-point.point-selected .chart-symbol { outline: 2px solid currentColor; outline-offset: 2px; }
.chart-point:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; z-index: 2; }
@media (pointer: coarse) { .chart-point { width: 28px; height: 28px; } }
</style>
