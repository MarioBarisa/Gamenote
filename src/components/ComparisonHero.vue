<template>
  <div ref="hero" class="comparison-hero" :class="{ 'banner-paused': !bannerVisible || !pageVisible, 'public-hero': publicView }" :style="{ '--left-color': left.color, '--right-color': right.color }">
    <div class="comparison-hero-layout">
      <section v-for="(profile, index) in [left, right]" :key="profile.username" class="comparison-identity" :class="index === 0 ? 'identity-left' : 'identity-right'" :aria-label="profile.username">
        <div class="identity-waves" aria-hidden="true">
          <div v-for="(wave, layer) in waves[index]" :key="layer" class="wave-intro" :style="{ '--wave-duration': wave.duration + 'ms', '--wave-delay': -wave.delay + 'ms', '--wave-width': wave.width + '%', '--wave-height': wave.height + '%', '--wave-top': wave.top + '%', '--wave-opacity': wave.opacity, '--wave-surge-start': (index === 0 ? -wave.surge : wave.surge) + '%', '--wave-sway': wave.sway + '%', '--wave-sway-duration': wave.swayDuration + 'ms', '--wave-sway-delay': -wave.swayDelay + 'ms' }">
            <svg class="identity-wave" viewBox="0 0 1800 200" preserveAspectRatio="none"><path :d="wave.path" vector-effect="non-scaling-stroke" /></svg>
          </div>
        </div>
        <component :is="publicView ? RouterLink : 'div'" :to="publicView ? '/' + profile.username : undefined" :aria-label="publicView ? $t('comparisonHero.viewProfile', { username: profile.username }) : undefined" class="avatar placeholder shrink-0 rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
          <div class="identity-avatar rounded-full bg-base-300 ring-2 ring-base-100">
            <img v-if="profile.avatar && !failed[index]" :src="profile.avatar" :alt="profile.name" decoding="async" @error="failed[index] = true" />
            <span v-else class="text-lg font-bold">{{ profile.name.trim().slice(0, 1).toUpperCase() }}</span>
          </div>
        </component>
        <div class="identity-name min-w-0">
          <p class="font-bold text-sm wrap-anywhere">{{ profile.name }}</p>
          <p v-if="profile.username" class="text-xs opacity-70 wrap-anywhere"><router-link v-if="publicView" :to="'/' + profile.username" class="hover:underline rounded-sm focus-visible:outline-2 focus-visible:outline-primary">@{{ profile.username }}</router-link><template v-else>@{{ profile.username }}</template></p>
        </div>
      </section>
      <ComparisonVersus class="hero-versus" :left-color="left.color" :right-color="right.color" />
    </div>
  </div>
</template>
<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import ComparisonVersus from './ComparisonVersus.vue';
defineProps({ left: { type: Object, required: true }, right: { type: Object, required: true }, publicView: Boolean });
const failed = ref([false, false]);
const hero = ref(null), bannerVisible = ref(true), pageVisible = ref(true);
let visibilityObserver;
const waves = [[], []];
const waveSpeeds = [32, 20, 10];
const waveSurges = [40, 26, 14];
function randomBetween(min, max) { return Math.round(min + Math.random() * (max - min)); }
function createWavePath(profile, layer) {
  const baseline = randomBetween(92 + layer * 8 + profile * 3, 94 + layer * 8 + profile * 3);
  const amplitude = randomBetween(34, 68);
  const bend = randomBetween(65, 135);
  let path = `M0 ${baseline}`;
  // Tri segmenta čuvaju neprekinut tok.
  for (let tile = 0; tile < 3; tile++) {
    const x = tile * 600;
    path += `C${x + bend} ${baseline - amplitude} ${x + 300 - bend} ${baseline - amplitude} ${x + 300} ${baseline}S${x + 600 - bend} ${baseline + amplitude} ${x + 600} ${baseline}`;
  }
  return path + 'V600H0Z';
}
for (let profile = 0; profile < 2; profile++) {
  for (let layer = 0; layer < 3; layer++) {
    const width = randomBetween(145, 185);
    // Brzina ne ovisi o veličini vala.
    const duration = Math.round(width / waveSpeeds[layer] * 1000);
    const surge = waveSurges[layer];
    const distance = 18 + layer * 22;
    const crest = profile === 0 ? 100 - distance : distance;
    // Vrhovi počinju na različitim udaljenostima.
    const phase = profile === 0 ? (crest + surge) / width - .25 : .75 - (crest - surge) / width;
    const swayDuration = randomBetween(9000, 17000);
    waves[profile].push({ path: createWavePath(profile, layer), sway: randomBetween(2, 5), swayDuration, swayDelay: randomBetween(0, swayDuration), duration, delay: Math.round(phase * duration), surge, width, height: randomBetween(130, 175), top: -8 + layer * 16, opacity: [0.18, 0.14, 0.1][layer] });
  }
}
function syncVisibility() { pageVisible.value = !document.hidden; }
onMounted(() => {
  syncVisibility();
  document.addEventListener('visibilitychange', syncVisibility);
  if (typeof IntersectionObserver !== 'undefined') {
    visibilityObserver = new IntersectionObserver(entries => { bannerVisible.value = entries[0].isIntersecting; }, { root: hero.value.closest('.modal-box') });
    visibilityObserver.observe(hero.value);
  }
});
onBeforeUnmount(() => { visibilityObserver?.disconnect(); document.removeEventListener('visibilitychange', syncVisibility); });
</script>
<style scoped>
.comparison-hero {
  --left-color: var(--color-primary);
  --right-color: var(--color-accent);
  container: comparison-hero / inline-size; position: relative; isolation: isolate; overflow: clip; border-radius: var(--radius-box); --wave-sway-scale: .6;
}
.comparison-hero-layout { display: grid; grid-template-columns: minmax(0, 1fr) clamp(3.25rem,14cqw,4.5rem) minmax(0, 1fr); align-items: center; min-height: 8.25rem; }
.comparison-identity { position: relative; display: flex; flex-direction: column; align-items: center; gap: .5rem; padding: .875rem .375rem; text-align: center; }
.identity-left { grid-column: 1; border-radius: var(--radius-box) 0 0 var(--radius-box); overflow: clip; --wave-direction: 1; --wave-from: calc(-100% / 3); --wave-to: 0%; }
.identity-right { grid-column: 3; border-radius: 0 var(--radius-box) var(--radius-box) 0; overflow: clip; --wave-direction: -1; --wave-from: 0%; --wave-to: calc(-100% / 3); }
.comparison-identity::before { content: ''; position: absolute; inset: 0; z-index: -1; }
.identity-waves { position: absolute; inset: 0; z-index: -1; overflow: hidden; pointer-events: none; }
.identity-left .identity-waves { color: var(--left-color); mask-image: linear-gradient(to right, #000 55%, transparent); }
.identity-right .identity-waves { color: var(--right-color); mask-image: linear-gradient(to left, #000 55%, transparent); }
.wave-intro {
  --wave-duration: 6000ms;
  --wave-delay: 0ms;
  --wave-width: 165%;
  --wave-height: 150%;
  --wave-top: 0%;
  --wave-opacity: .14;
  --wave-surge-start: 0%;
  --wave-sway: 3%;
  --wave-sway-duration: 13000ms;
  --wave-sway-delay: 0ms;
  position: absolute; inset: 0; translate: 0 0; transform: translateX(0);
}
.identity-wave { position: absolute; width: calc(var(--wave-width) * 3); height: var(--wave-height); left: calc(-1 * var(--wave-width)); top: calc((100% - var(--wave-height)) / 2 + var(--wave-top)); fill: currentColor; opacity: var(--wave-opacity); transform: translateX(0) scaleX(var(--wave-direction)); }
.identity-wave path { stroke: currentColor; stroke-width: 1; transform-box: view-box; transform-origin: center; transform: scaleY(.38); }
.identity-left::before { background: linear-gradient(to right, color-mix(in oklab, var(--left-color) 25%, transparent), transparent); }
.identity-right::before { background: linear-gradient(to left, color-mix(in oklab, var(--right-color) 25%, transparent), transparent); }
.identity-avatar { width: 3rem; height: 3rem; display: flex; align-items: center; justify-content: center; }
.public-hero .identity-avatar { width: 3.5rem; height: 3.5rem; }
.public-hero .identity-left .identity-avatar { box-shadow: 0 0 0 3px color-mix(in oklab, var(--left-color) 25%, transparent); }
.public-hero .identity-right .identity-avatar { box-shadow: 0 0 0 3px color-mix(in oklab, var(--right-color) 25%, transparent); }
.hero-versus { grid-column: 2; grid-row: 1; }
@keyframes identity-left { from { opacity: 0; transform: translateX(-24px); } to { opacity: 1; transform: translateX(0); } }
@keyframes identity-right { from { opacity: 0; transform: translateX(24px); } to { opacity: 1; transform: translateX(0); } }
@keyframes banner-wave {
  from { transform: translateX(var(--wave-from)) scaleX(var(--wave-direction)); }
  to { transform: translateX(var(--wave-to)) scaleX(var(--wave-direction)); }
}
@keyframes banner-sway { from { translate: 0 calc(-1 * var(--wave-sway) * var(--wave-sway-scale)); } to { translate: 0 calc(var(--wave-sway) * var(--wave-sway-scale)); } }
@keyframes banner-surge { from { transform: translateX(var(--wave-surge-start)); } to { transform: translateX(0); } }
@container comparison-hero (min-width: 640px) {
  .comparison-hero-layout { grid-template-columns: minmax(0,1fr) 7rem minmax(0,1fr); min-height: 12rem; }
  .identity-waves { --wave-sway-scale: 1; }
  .identity-wave path { transform: scaleY(1); }
  .comparison-identity { flex-direction: row; padding: 2rem 1rem; gap: 1rem; text-align: left; }
  .identity-right { flex-direction: row-reverse; text-align: right; }
  .identity-avatar { width: 4.5rem; height: 4.5rem; }
  .public-hero .identity-avatar { width: 5rem; height: 5rem; }
  .identity-name p:first-child { font-size: 1.25rem; }
  .identity-name p:nth-child(2) { font-size: .875rem; }
}
@media (prefers-reduced-motion: no-preference) {
  .identity-left > .avatar, .identity-left > .identity-name { animation: identity-left 360ms ease-out both; }
  .identity-right > .avatar, .identity-right > .identity-name { animation: identity-right 360ms ease-out both; }
  .wave-intro { animation: banner-surge 1200ms cubic-bezier(.25,.25,.2,1) backwards, banner-sway var(--wave-sway-duration) ease-in-out var(--wave-sway-delay) infinite alternate; }
  /* Ograničene promjene čuvaju red brzina. */
  .identity-wave { animation: banner-wave var(--wave-duration) cubic-bezier(.3,.24,.7,.76) var(--wave-delay) infinite; }
  .banner-paused .identity-wave, .banner-paused .wave-intro { animation-play-state: paused; }
}
</style>
