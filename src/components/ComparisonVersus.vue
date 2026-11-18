<template>
  <div class="comparison-versus" :class="{ 'versus-loading': loading }" :style="{ '--left-color': leftColor, '--right-color': rightColor }" aria-hidden="true">
      <svg class="versus-mark" viewBox="0 0 256 256" aria-hidden="true">
        <defs>
          <path v-for="(path, index) in VERSUS_PATHS" :key="index" :id="id + '-letter-' + index" :d="path" />
          
          
          <mask :id="id + '-paint'" maskUnits="userSpaceOnUse" x="0" y="0" width="256" height="256">
            <path class="versus-brush" d="M40 255 L90 200 L205 -55" pathLength="1" stroke="white" stroke-width="240" fill="none" />
          </mask>
          <clipPath v-if="loading" :id="id + '-shape'"><use v-for="index in [0, 1, 2]" :key="index" :href="'#' + id + '-letter-' + index" /></clipPath>
          <linearGradient v-if="loading" :id="id + '-shine'"><stop offset="0" stop-color="currentColor" stop-opacity="0" /><stop offset=".5" stop-color="currentColor" stop-opacity=".75" /><stop offset="1" stop-color="currentColor" stop-opacity="0" /></linearGradient>
        </defs>
        <g class="versus-outline" fill="none" stroke-width="1.5">
          <use :href="'#' + id + '-letter-0'" stroke="var(--right-color)" />
          <use :href="'#' + id + '-letter-1'" stroke="var(--left-color)" />
          <use :href="'#' + id + '-letter-2'" stroke="var(--left-color)" />
        </g>
        <g class="versus-ink" :mask="`url(#${id}-paint)`">
          <use :href="'#' + id + '-letter-0'" fill="var(--right-color)" />
          <use :href="'#' + id + '-letter-1'" fill="var(--left-color)" />
          <use :href="'#' + id + '-letter-2'" fill="var(--left-color)" />
        </g>
        <g v-if="loading" :clip-path="`url(#${id}-shape)`" class="versus-shimmer"><rect x="-256" y="0" width="256" height="256" :fill="`url(#${id}-shine)`" /></g>
      </svg>
      <span v-if="!loading" class="versus-sparks">
        <span v-for="(spark, index) in sparks" :key="index" class="versus-spark" :class="index % 2 ? 'spark-left' : 'spark-right'" :style="{ left: spark.left + '%', top: spark.top + '%', '--spark-x': spark.x + 'px', '--spark-y': spark.y + 'px', '--spark-delay': (640 + index * 18) + 'ms' }"></span>
      </span>
  </div>
</template>
<script setup>
import { useId } from 'vue';
import { VERSUS_PATHS } from '../constants/versusPaths.js';
defineProps({ leftColor: { type: String, default: 'var(--color-primary)' }, rightColor: { type: String, default: 'var(--color-accent)' }, loading: Boolean });
const id = useId();
const sparks = [
  { left: 18, top: 18, x: -20, y: -20 }, { left: 55, top: 5, x: 4, y: -28 },
  { left: 90, top: 24, x: 24, y: -16 }, { left: 92, top: 66, x: 28, y: 12 },
  { left: 65, top: 95, x: 12, y: 28 }, { left: 25, top: 94, x: -12, y: 28 },
  { left: 4, top: 58, x: -28, y: 6 }, { left: 10, top: 34, x: -24, y: -10 }
];
</script>
<style scoped>
.comparison-versus {
  --left-color: var(--color-primary);
  --right-color: var(--color-accent);
  position: relative; width: 100%;
}
.versus-mark { display: block; width: 100%; height: auto; filter: drop-shadow(0 2px 2px #0002); }
.versus-outline { opacity: .4; }
.versus-brush { stroke-dasharray: 1; stroke-dashoffset: 0; }
.versus-loading .versus-ink { opacity: .25; }
.versus-loading .versus-ink use { fill: var(--color-base-content); }
.versus-loading .versus-outline use { stroke: var(--color-base-content); }
.versus-shimmer { color: var(--color-base-content); }
.versus-spark { position: absolute; width: 15px; height: 15px; opacity: 0; filter: drop-shadow(0 0 3px currentColor); clip-path: polygon(50% 0%,62% 38%,100% 50%,62% 62%,50% 100%,38% 62%,0% 50%,38% 38%); }
.spark-left { background: var(--left-color); color: var(--left-color); }
.spark-right { background: var(--right-color); color: var(--right-color); width: 11px; height: 11px; }
@keyframes versus-draw { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
@keyframes versus-settle {
  0% { transform: translateY(2px) rotate(-3deg) scale(1); }
  35% { transform: translateY(-3px) rotate(2deg) scale(1.06); }
  65% { transform: translateY(0) rotate(-1deg) scale(1.12); }
  85% { transform: translateY(1px) rotate(.5deg) scale(.99); }
  100% { transform: translateY(0) rotate(0) scale(1); }
}
@keyframes versus-spark {
  0% { opacity: 0; transform: translate(-50%,-50%) scale(.25) rotate(-15deg); }
  20% { opacity: 1; transform: translate(calc(-50% + var(--spark-x) * .3),calc(-50% + var(--spark-y) * .3)) scale(1.2); }
  60% { opacity: .9; }
  100% { opacity: 0; transform: translate(calc(-50% + var(--spark-x)),calc(-50% + var(--spark-y))) scale(.3) rotate(55deg); }
}
@keyframes versus-loading { from { transform: translateX(0); } to { transform: translateX(512px); } }
@media (prefers-reduced-motion: no-preference) {
  .versus-brush { animation: versus-draw 650ms cubic-bezier(.35,.1,.8,.5) 70ms both; }
  .versus-mark { animation: versus-settle 1050ms cubic-bezier(.22,.7,.3,1) 80ms both; }
  .versus-spark { animation: versus-spark 700ms ease-out var(--spark-delay) both; }
  .versus-loading .versus-brush { animation: none; }
  .versus-loading .versus-mark { animation: none; }
  .versus-shimmer rect { animation: versus-loading 1600ms ease-in-out infinite; }
}
@media (prefers-reduced-motion: reduce) {
  .versus-shimmer rect { animation: versus-loading 6s ease-in-out infinite; }
}
</style>
