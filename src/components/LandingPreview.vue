<template>
  <figure class="landing-preview" :class="{ 'preview-unframed': kind === 'library' || kind === 'summary' }">
    <div v-if="kind === 'library'" class="preview-shelf">
      <div v-for="game in games" :key="game.id" class="preview-game">
        <GameCard :game="game" :tcg="desktopTcg" lazy />
      </div>
    </div>
    <div v-else-if="kind === 'details'" class="preview-details">
      <div class="details-webview" aria-label="Detalji igre iz Gamenote kataloga">
        <ApiGameDetails v-if="mounted" preview-game-id="134588" :preview-platforms="['PlayStation 5', 'PC', 'Xbox Series X/S']" />
        <a v-else href="/api-games/134588" class="link">Pogledaj detalje igre u Gamenoteu</a>
      </div>
    </div>
    <div v-else-if="kind === 'import'" class="preview-import">
      <div class="import-orbit">
        <div class="import-flows" aria-hidden="true">
        <svg ref="connections" class="import-connections" viewBox="0 0 320 320" fill="none" aria-hidden="true">
          <path v-for="pulse in pulses" :key="pulse.source" :d="pulse.path"
            :class="[`connection-${pulse.source}`, { 'future-path': pulse.future }]" />
          <template v-for="pulse in pulses" :key="`${pulse.source}-${pulse.cycle}`">
            <path v-if="!pulse.future" :d="pulse.path" pathLength="100" class="import-particle"
              :class="[`particle-${pulse.source}`, { 'future-pulse': pulse.future }]"
              :style="{ '--pulse-duration': `${pulse.duration}s`, '--pulse-delay': `${pulse.delay}s` }"
              @animationend="restartPulse(pulse)" />
          </template>
        </svg>
        </div>
        <span class="import-node source-steam"><svg fill="currentColor" role="img" class="source-logo" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Steam</title><path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.605 0 11.979 0zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.076 3.332-1.375.263-.63.264-1.319.005-1.949s-.75-1.121-1.377-1.383c-.624-.26-1.29-.249-1.878-.03l1.523.63c.956.4 1.409 1.5 1.009 2.455-.397.957-1.497 1.41-2.454 1.012H7.54zm11.415-9.303c0-1.662-1.353-3.015-3.015-3.015-1.665 0-3.015 1.353-3.015 3.015 0 1.665 1.35 3.015 3.015 3.015 1.663 0 3.015-1.35 3.015-3.015zm-5.273-.005c0-1.252 1.013-2.266 2.265-2.266 1.249 0 2.266 1.014 2.266 2.266 0 1.251-1.017 2.265-2.266 2.265-1.253 0-2.265-1.014-2.265-2.265z"/></svg></span>
        <span class="import-node source-psn"><svg fill="currentColor" role="img" class="source-logo" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>PlayStation</title><path d="M8.984 2.596v17.547l3.915 1.261V6.688c0-.69.304-1.151.794-.991.636.18.76.814.76 1.505v5.875c2.441 1.193 4.362-.002 4.362-3.152 0-3.237-1.126-4.675-4.438-5.827-1.307-.448-3.728-1.186-5.39-1.502zm4.656 16.241l6.296-2.275c.715-.258.826-.625.246-.818-.586-.192-1.637-.139-2.357.123l-4.205 1.5V14.98l.24-.085s1.201-.42 2.913-.615c1.696-.18 3.785.03 5.437.661 1.848.601 2.04 1.472 1.576 2.072-.465.6-1.622 1.036-1.622 1.036l-8.544 3.107V18.86zM1.807 18.6c-1.9-.545-2.214-1.668-1.352-2.32.801-.586 2.16-1.052 2.16-1.052l5.615-2.013v2.313L4.205 17c-.705.271-.825.632-.239.826.586.195 1.637.15 2.343-.12L8.247 17v2.074c-.12.03-.256.044-.39.073-1.939.331-3.996.196-6.038-.479z"/></svg></span>
        <span class="import-node source-xbox"><svg fill="currentColor" viewBox="0 0 24 24" class="source-logo" role="img" xmlns="http://www.w3.org/2000/svg">
                <title>Xbox</title><path d="m24 12c0-.001 0-.001 0-.002 0-3.618-1.606-6.861-4.144-9.054l-.015-.013c-1.91 1.023-3.548 2.261-4.967 3.713l-.004.004c.044.046.087.085.131.132 3.719 4.012 7.106 9.73 6.546 12.471 1.53-1.985 2.452-4.508 2.452-7.246 0-.002 0-.004 0-.006z"/><path d="m12.591 3.955c1.68-1.104 3.699-1.833 5.872-2.022l.048-.003c-1.837-1.21-4.09-1.929-6.511-1.929-2.171 0-4.207.579-5.962 1.591l.058-.031c.658.567 2.837.781 5.484 2.4.143.089.316.142.502.142.189 0 .365-.055.513-.149l-.004.002z"/><path d="m9.166 6.778c.046-.049.093-.09.138-.138-1.17-1.134-2.446-2.174-3.806-3.1l-.099-.064c-.302-.221-.681-.354-1.091-.354-.146 0-.288.017-.425.049l.013-.002c-2.398 2.198-3.896 5.344-3.896 8.84 0 2.909 1.037 5.576 2.762 7.651l-.016-.02c-1.031-2.547 2.477-8.672 6.419-12.862z"/><path d="m12.084 9.198c-3.962 3.503-9.477 8.73-8.632 11.218 2.174 2.213 5.198 3.584 8.542 3.584 3.493 0 6.637-1.496 8.826-3.883l.008-.009c.486-2.618-4.755-7.337-8.744-10.91z"/>
              </svg><span class="future-label">Dolazi uskoro</span></span>

        <span class="import-node source-nintendo"><svg xmlns="http://www.w3.org/2000/svg" class="source-logo" role="img" viewBox="0 0 24 24"><title>Nintendo</title><path fill="currentColor" d="M14.176 24h3.674c3.376 0 6.15-2.774 6.15-6.15V6.15C24 2.775 21.226 0 17.85 0H14.1c-.074 0-.15.074-.15.15v23.7c-.001.076.075.15.226.15m4.574-13.199c1.351 0 2.399 1.125 2.399 2.398c0 1.352-1.125 2.4-2.399 2.4c-1.35 0-2.4-1.049-2.4-2.4c-.075-1.349 1.05-2.398 2.4-2.398M11.4 0H6.15C2.775 0 0 2.775 0 6.15v11.7C0 21.226 2.775 24 6.15 24h5.25c.074 0 .15-.074.15-.149V.15c.001-.076-.075-.15-.15-.15M9.676 22.051H6.15a4.194 4.194 0 0 1-4.201-4.201V6.15A4.194 4.194 0 0 1 6.15 1.949H9.6zM3.75 7.199c0 1.275.975 2.25 2.25 2.25s2.25-.975 2.25-2.25c0-1.273-.975-2.25-2.25-2.25s-2.25.977-2.25 2.25"/></svg><span class="future-label">Dolazi uskoro</span></span>
        <div class="import-target" role="img" aria-label="Gamenote"><GamenoteLogo class="w-16 h-14 text-[#F9461F]" /></div>
      </div>
    </div>
    <div v-else class="preview-summary">
      <GamerCard v-if="mounted" :games="games" name="Player One" created-at="2024-01-01" color="theme:night" avatar-url="/landing-avatar.jpeg" />
      <div v-else class="summary-placeholder"><GamenoteLogo class="w-16 h-14 text-[#F9461F]" /></div>
    </div>
  </figure>
</template>

<script setup>
import { ref, onMounted, onUnmounted, defineAsyncComponent } from 'vue'
import GamenoteLogo from './GamenoteLogo.vue'
import GameCard from './GameCard.vue'

const GamerCard = defineAsyncComponent(() => import('./GamerCard.vue'))
const ApiGameDetails = defineAsyncComponent(() => import('../views/ApiGameDetails.vue'))
defineProps({ kind: { type: String, required: true } })
const mounted = ref(false)
const desktopTcg = ref(false)
const connections = ref(null)
const pulses = ref([
  { source: 'steam', path: 'M24 160 C72 124 104 196 136 160', minSpeed: 50, maxSpeed: 60, duration: 3, delay: 0, cycle: 0, length: 120 },
  { source: 'psn', path: 'M160 52 C124 84 196 100 160 136', minSpeed: 38, maxSpeed: 46, duration: 3, delay: .8, cycle: 0, length: 100 },
  { source: 'xbox', path: 'M296 160 C248 124 216 196 184 160', minSpeed: 26, maxSpeed: 32, duration: 4, delay: .4, cycle: 0, length: 120, future: true },
  { source: 'nintendo', path: 'M160 272 C196 236 124 216 160 184', minSpeed: 16, maxSpeed: 22, duration: 5, delay: 1.2, cycle: 0, length: 100, future: true },
])
function randomDuration(pulse) {
  const speed = pulse.minSpeed + Math.random() * (pulse.maxSpeed - pulse.minSpeed)
  return pulse.length / speed
}
function restartPulse(pulse) {
  pulse.duration = randomDuration(pulse)
  pulse.delay = .2 + Math.random() * .5
  pulse.cycle++
}
let pointerQuery
function updateTcg() { desktopTcg.value = pointerQuery.matches }
onMounted(() => {
  mounted.value = true
  if (connections.value) {
    for (const pulse of pulses.value) {
      pulse.length = connections.value.querySelector(`.connection-${pulse.source}`).getTotalLength()
      pulse.duration = randomDuration(pulse)
    }
  }
  pointerQuery = window.matchMedia('(min-width: 1024px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)')
  updateTcg()
  pointerQuery.addEventListener('change', updateTcg)
})
onUnmounted(() => pointerQuery?.removeEventListener('change', updateTcg))
const cover = id => `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${id}/library_600x900.jpg`
const games = [
  { id: 'demo-tlou', title: 'The Last of Us Part I', platform: 'PlayStation 5', status: 'completed', rating: 5, play_time: 112, genre: 'Action, Adventure', image_url: cover(1888930), progress_mode: 'trophies_psn', progress_value: 29, progress_total: 29 },
  { id: 'demo-hollow', title: 'Hollow Knight', platform: 'Nintendo Switch', status: 'playing', rating: 4, play_time: 28, genre: 'Action, Metroidvania', image_url: cover(367520), progress_mode: 'achievements', progress_value: 30, progress_total: 30 },
  { id: 'demo-dokev', title: 'DokeV', platform: 'PC', status: 'wishlist', rating: 0, play_time: 0, genre: 'Adventure', image_url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co56d8.jpg' },
]
</script>

<style scoped>
.landing-preview { min-width: 0; margin: 0; padding: 1.5rem; border-radius: 1.5rem; background: var(--color-base-200); }
.landing-preview.preview-unframed { padding: 0; background: transparent; }
.preview-shelf { display: flex; gap: 1rem; overflow-x: auto; scrollbar-width: none; padding: 1rem .5rem 1.5rem; }
.preview-shelf::-webkit-scrollbar { display: none; }
.preview-game { position: relative; flex: 1 0 155px; min-width: 0; }
.preview-game:hover, .preview-game:focus-within { z-index: 1; }
.preview-shelf :deep(.card-body) { padding: .7rem; }
.preview-shelf :deep(.card-title) { font-size: .9rem; }
.preview-details { min-width: 0; border-radius: 1rem; overflow: hidden; }
.details-webview { min-width: 0; }
.details-webview :deep(.api-game-details) { min-width: 0; padding: .5rem; }
.import-orbit { position: relative; width: 100%; max-width: 320px; aspect-ratio: 1; margin: 1rem auto; }
.import-flows { position: absolute; inset: 0; pointer-events: none; mask-image: radial-gradient(ellipse 22% 22% at center, transparent 0 70%, black 100%), radial-gradient(circle at 7.5% 50%, transparent 20px, black 32px), radial-gradient(circle at 50% 10%, transparent 20px, black 32px), radial-gradient(circle at 92.5% 50%, transparent 20px, black 32px), radial-gradient(circle at 50% 85%, transparent 20px, black 32px); mask-composite: intersect; }
.import-connections { position: absolute; inset: 0; width: 100%; height: 100%; stroke-opacity: .3; stroke-width: 2; stroke-linecap: round; }
.connection-steam { stroke: #fff; }
.connection-psn { stroke: #168bff; stroke-opacity: .5; }
.future-path { stroke-dasharray: 4 5; opacity: .3; }
.connection-xbox { stroke: #107c10; }
.connection-nintendo { stroke: #e60012; }
.import-node { position: absolute; display: flex; align-items: center; justify-content: center; width: 15%; height: 20%; transform: translate(-50%, -50%); }
.source-logo { width: 2.5rem; height: 2.5rem; }
.source-steam { left: 7.5%; top: 50%; }
.source-psn { left: 50%; top: 10%; }
.source-nintendo { left: 50%; top: 85%; opacity: .4; }
.source-xbox { left: 92.5%; top: 50%; opacity: .4; }
.future-label { position: absolute; top: 100%; width: 5rem; text-align: center; font-size: .65rem; }
.import-target { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); display: grid; place-items: center; }
.import-particle { stroke-width: 2.5; stroke-linecap: round; stroke-opacity: 1; stroke-dasharray: 12 188; filter: drop-shadow(0 0 3px currentColor); animation: import-flow var(--pulse-duration, 3s) linear var(--pulse-delay, 0s) both; }
.particle-steam { color: #fff; stroke: currentColor; }
.particle-psn { color: #168bff; stroke: currentColor; }
.particle-xbox { color: #107c10; stroke: currentColor; }
.particle-nintendo { color: #e60012; stroke: currentColor; }
.future-pulse { --pulse-opacity: .3; filter: none; }
.preview-summary { min-width: 0; }
.summary-placeholder { aspect-ratio: 8/5; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; border-radius: 1rem; background: var(--color-base-100); color: var(--color-base-content); }
@keyframes import-flow { 0% { stroke-dashoffset: 12; opacity: 0; } 15%, 85% { opacity: var(--pulse-opacity, 1); } 100% { stroke-dashoffset: -100; opacity: 0; } }
@media (min-width: 1024px) { .preview-shelf { overflow: visible; } }
@media (max-width: 480px) { .landing-preview { padding: 1rem; } .details-webview :deep(.api-game-details) { min-width: 0; } }
@media (prefers-reduced-motion: reduce) { .import-particle { animation: none; stroke-dashoffset: -44; opacity: var(--pulse-opacity, 1); } }
</style>
