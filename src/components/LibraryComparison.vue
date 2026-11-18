<template>
  <component :is="publicPair ? 'section' : AppModal" v-bind="publicPair ? { 'aria-label': 'Gamenote usporedba' } : { label: 'Gamenote usporedba' }" @close="$emit('close')">
    <div ref="comparisonBody" class="library-comparison" :class="publicPair ? 'public-comparison-content' : 'modal-box'" :aria-busy="loading">
      <header v-if="!publicPair" class="comparison-heading flex items-center justify-between gap-3 bg-base-100 py-2">
        <h2 class="text-xl sm:text-2xl font-bold">Gamenote usporedba</h2>
        <button type="button" class="btn btn-sm btn-circle btn-ghost shrink-0" aria-label="Zatvori usporedbu" @click="$emit('close')">✕</button>
      </header>
      <div v-if="loading" class="comparison-loader flex justify-center items-center min-h-64 sm:min-h-80">
        <progress class="sr-only" aria-label="Učitavam usporedbu"></progress>
        <ComparisonVersus class="comparison-loader-mark" :left-color="left.color" :right-color="right.color" loading />
      </div>
      <div v-else-if="error" class="alert alert-error" role="alert"><span>{{ error }}</span><button type="button" class="btn btn-sm" @click="load">Pokušaj ponovno</button></div>
      <template v-else>
        <ComparisonHero :key="publicPair ? publicPair.left + publicPair.right : user.id + header.username" :left="left" :right="right" :public-view="Boolean(publicPair)" />
        <div class="flex items-center justify-between gap-2 my-4">
        <div role="tablist" aria-label="Vrsta usporedbe" class="flex flex-wrap gap-1" @keydown="handleTabKeys">
          <button type="button" role="tab" class="collection-nav-link" :class="{ 'bg-base-200 text-primary': tab === 'games' }" :id="id + '-games'" :aria-controls="id + '-game-panel'" :aria-selected="tab === 'games'" :tabindex="tab === 'games' ? 0 : -1" @click="tab = 'games'"><CollectionNavIcon name="games" class="h-5 w-5" />Igre</button>
          <button type="button" role="tab" class="collection-nav-link" :class="{ 'bg-base-200 text-primary': tab === 'stats' }" :id="id + '-stats'" :aria-controls="id + '-stats-panel'" :aria-selected="tab === 'stats'" :tabindex="tab === 'stats' ? 0 : -1" :disabled="!canSeeStats" @click="tab = 'stats'"><CollectionNavIcon name="stats" class="h-5 w-5" />Statistika</button>
        </div>
        <ComparisonShareButton :left="left.username" :right="right.username" :allowed="shareAllowed" />
        </div>
        <p v-if="!canSeeStats" class="text-xs opacity-60 mb-4">Statistika nije podijeljena.</p>
        <section v-if="tab === 'games'" role="tabpanel" :id="id + '-game-panel'" :aria-labelledby="id + '-games'" class="space-y-4">
          <div class="comparison-toolbar grid gap-2">
            <input v-model="filters.search" type="search" class="input w-full min-w-0" placeholder="Pretraži igre…" aria-label="Pretraži usporedbu" />
            <select v-model="filters.sort" class="select w-full min-w-0" aria-label="Poredak usporedbe"><option value="title">Naziv A–Z</option><option value="hours">Najviše sati</option><option value="hours-gap">Razlika sati</option><option value="progress-gap">Razlika napretka</option><option value="status">Status</option><option value="platform">Platforma</option></select>
            <button type="button" class="btn btn-outline gap-2" :aria-expanded="filtersExpanded" :aria-controls="id + '-filters'" @click="filtersExpanded = !filtersExpanded"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" class="size-5" aria-hidden="true"><path stroke-linecap="round" d="M4 6h16M7 12h10M10 18h4" /></svg>Filtri<span v-if="activeFilterCount">({{ activeFilterCount }})</span></button>
          </div>
          <div v-show="filtersExpanded" :id="id + '-filters'" class="space-y-4 bg-base-200 rounded-box p-3 sm:p-4">
            <div role="group" aria-label="Pripadnost igre"><p class="text-xs font-semibold mb-2">Prikaz</p><div class="flex flex-wrap gap-2"><button v-for="choice in membershipOptions" :key="choice.value" type="button" class="btn btn-sm" :class="filters.membership === choice.value ? 'btn-primary' : 'btn-ghost'" :aria-pressed="filters.membership === choice.value" @click="filters.membership = choice.value">{{ choice.label }}</button></div></div>
            <div role="group" aria-label="Prednost igrača"><p class="text-xs font-semibold mb-2">Prednost</p><div class="flex flex-wrap gap-2"><button v-for="choice in leaderOptions" :key="choice.value" type="button" class="btn btn-sm" :class="filters.leader === choice.value ? 'btn-primary' : 'btn-ghost'" :aria-pressed="filters.leader === choice.value" @click="filters.leader = choice.value">{{ choice.label }}</button></div></div>
            <LibraryStatusFilters :model-value="filters.status || 'all'" @update:model-value="filters.status = $event === 'all' ? '' : $event" />
            <div role="group" aria-label="Platforma u usporedbi"><p class="text-xs font-semibold mb-2">Platforma</p><div class="flex flex-wrap gap-2"><button type="button" class="btn btn-sm" :class="!filters.platform ? 'btn-primary' : 'btn-ghost'" :aria-pressed="!filters.platform" @click="filters.platform = ''">Sve</button><button v-for="platform in platforms" :key="platform" type="button" class="btn btn-sm btn-square tooltip" :class="filters.platform === platform ? 'btn-primary' : 'btn-ghost'" :data-tip="platform" :title="platform" :aria-label="'Platforma: ' + platform" :aria-pressed="filters.platform === platform" @click="filters.platform = platform"><PlatformIcon :name="platform" class="size-6" /></button></div></div>
          </div>
          <div class="flex items-center justify-between gap-2 text-xs"><p role="status">{{ filtered.length }} igara za usporedbu</p><button v-if="hasFilters" type="button" class="btn btn-xs btn-ghost" @click="resetFilters">Očisti filtre</button></div>
          <p v-if="!filtered.length" class="text-center py-8 opacity-70">Nema igara za odabrane filtre.</p>
          <ComparisonGameRow v-for="row in visibleRows" :key="row.key" :row="row" :left="left" :right="right" @open-game="$emit('open-game', $event)" />
          <div v-if="visibleCount < filtered.length" ref="loadMoreTrigger" class="flex justify-center py-2"><button type="button" class="btn btn-sm btn-ghost" @click="showMore">Prikaži još</button></div>
          <p class="text-xs opacity-60">Ista igra i ista platforma čine par. — znači da usporediv podatak nije dostupan.</p>
        </section>
        <section v-else-if="canSeeStats" role="tabpanel" :id="id + '-stats-panel'" :aria-labelledby="id + '-stats'"><ComparisonStats :left="left" :right="right" :left-games="ownGames" :right-games="sharedGames" :rows="rows" /></section>
      </template>
    </div>
  </component>
</template>
<script setup>
import { computed, onBeforeUnmount, reactive, ref, shallowRef, useId, watch } from 'vue';
import AppModal from './AppModal.vue';
import ComparisonHero from './ComparisonHero.vue';
import ComparisonVersus from './ComparisonVersus.vue';
import ComparisonGameRow from './ComparisonGameRow.vue';
import ComparisonStats from './ComparisonStats.vue';
import ComparisonShareButton from './ComparisonShareButton.vue';
import { loadLibraryComparison, loadPublicComparison } from '../services/loadLibraryComparison.js';
import { compareLibraries, filterComparison } from '../services/libraryComparison.js';
import { getGamerCardStats } from '../services/gamerCard.js';
import { signatureForGenre } from '../services/cardAppearance.js';
import CollectionNavIcon from './CollectionNavIcon.vue';
import PlatformIcon from './PlatformIcon.vue';
import LibraryStatusFilters from './LibraryStatusFilters.vue';
import { handleTabKeys } from '../services/tabNavigation.js';
const props = defineProps({ header: { type: Object, required: true }, user: { type: Object, required: true }, ownShare: { type: Object, required: true }, initialPage: { type: Object, default: null }, publicPair: { type: Object, default: null } });
defineEmits(['close', 'open-game']);
const id = useId();
const loading = ref(true), error = ref(''), tab = ref('games');
const comparisonBody = ref(null), loadMoreTrigger = ref(null), visibleCount = ref(24);
const ownGames = shallowRef([]), sharedGames = shallowRef([]);
const leftPublicHeader = ref(null), rightPublicHeader = ref(null);
const canSeeStats = computed(() => props.publicPair ? leftPublicHeader.value?.share_scope === 'all' && rightPublicHeader.value?.share_scope === 'all' : props.header.share_scope === 'all');
const shareAllowed = computed(() => props.publicPair ? Boolean(leftPublicHeader.value && rightPublicHeader.value) : ['library', 'all'].includes(props.ownShare.share_scope));
const filtersExpanded = ref(false);
const filters = reactive({ search: '', sort: 'title', membership: 'all', leader: 'all', status: '', platform: '' });
const rows = computed(() => compareLibraries(ownGames.value, sharedGames.value));
const filtered = computed(() => filterComparison(rows.value, filters));
const visibleRows = computed(() => filtered.value.slice(0, visibleCount.value));
const platforms = computed(() => [...new Set(rows.value.map(row => row.platform))].sort((a, b) => a.localeCompare(b, 'hr')));
const hasFilters = computed(() => filters.search || filters.platform || filters.status || filters.membership !== 'all' || filters.leader !== 'all');
const activeFilterCount = computed(() => Number(Boolean(filters.status)) + Number(Boolean(filters.platform)) + Number(filters.membership !== 'all') + Number(filters.leader !== 'all'));
const membershipOptions = computed(() => [
  { value: 'all', label: 'Sve igre' }, { value: 'shared', label: 'Zajedničke' },
  { value: 'left', label: props.publicPair ? 'Samo ' + left.value.label : 'Samo ti' }, { value: 'right', label: 'Samo ' + right.value.label }
]);
const leaderOptions = computed(() => [
  { value: 'all', label: 'Sve' }, { value: 'hours-left', label: 'Više sati · ' + (props.publicPair ? left.value.label : 'Ti') },
  { value: 'hours-right', label: 'Više sati · ' + right.value.label },
  { value: 'progress-left', label: 'Veći napredak · ' + (props.publicPair ? left.value.label : 'Ti') }, { value: 'progress-right', label: 'Veći napredak · ' + right.value.label }
]);
function resetFilters() { Object.assign(filters, { search: '', membership: 'all', leader: 'all', status: '', platform: '' }); }
watch(filters, () => { visibleCount.value = 24; });
function showMore() { visibleCount.value = Math.min(visibleCount.value + 24, filtered.value.length); }
let listObserver;
watch(loadMoreTrigger, element => {
  listObserver?.disconnect();
  if (!element || typeof IntersectionObserver === 'undefined') return;
  listObserver = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) showMore();
  }, { root: props.publicPair ? null : comparisonBody.value, rootMargin: '0px 0px 600px 0px' });
  listObserver.observe(element);
});
function profile(games, name, username, avatar, genre) {
  const stats = getGamerCardStats(games);
  const signature = signatureForGenre(genre || stats.favoriteGenre?.name);
  name = String(name || 'Igrač');
  return { name, username, label: username ? '@' + username : name, avatar: typeof avatar === 'string' ? avatar : '', color: signature.primary, stats };
}
const left = computed(() => props.publicPair ? profile(ownGames.value, leftPublicHeader.value?.name, leftPublicHeader.value?.username, leftPublicHeader.value?.avatar_url, leftPublicHeader.value?.card?.favoriteGenre?.name) : profile(ownGames.value, props.user.user_metadata?.name || props.ownShare.username || 'Igrač', props.ownShare.username, props.user.user_metadata?.avatar_url));
const right = computed(() => { const header = rightPublicHeader.value || props.header; return profile(sharedGames.value, header.name, header.username, header.avatar_url, header.card?.favoriteGenre?.name); });
let request, revision = 0;
async function load() {
  request?.abort(); request = new AbortController();
  const current = ++revision;
  ownGames.value = []; sharedGames.value = []; loading.value = true; error.value = ''; tab.value = 'games'; visibleCount.value = 24;
  try {
    const result = props.publicPair
      ? await loadPublicComparison(props.publicPair.left, props.publicPair.right, request.signal)
      : await loadLibraryComparison(props.user.id, props.header.username, request.signal, props.initialPage);
    if (current !== revision || request.signal.aborted) return;
    ownGames.value = result.own; sharedGames.value = result.shared;
    leftPublicHeader.value = result.leftHeader || null; rightPublicHeader.value = result.rightHeader || null;
  } catch (failure) {
    if (current === revision && !request.signal.aborted) {
      error.value = props.publicPair ? 'Usporedba nije dostupna. Oba Gamenotea moraju biti javna.' : 'Usporedbu nije moguće učitati. Pokušaj ponovno.';
      request.abort();
    }
  } finally { if (current === revision) loading.value = false; }
}
watch([() => props.publicPair?.left, () => props.publicPair?.right, () => props.user.id, () => props.header.username, () => props.header.share_scope], load, { immediate: true });
onBeforeUnmount(() => { revision++; request?.abort(); listObserver?.disconnect(); });
</script>
<style scoped>
.modal-box.library-comparison { width: calc(100vw - 1rem); max-width: 80rem; max-height: calc(100dvh - 1rem); margin: 0; padding: .75rem; }
.public-comparison-content { max-width: 80rem; margin: 0 auto; padding: 1.25rem .75rem 2rem; }
.comparison-toolbar { grid-template-columns: minmax(0,1fr) auto; }
.comparison-toolbar input { grid-column: span 2; }
.comparison-loader > .comparison-loader-mark { width: 7rem; }
@media (min-width: 640px) { .comparison-toolbar { grid-template-columns: minmax(0,1fr) 11rem auto; } .comparison-toolbar input { grid-column: auto; } .modal-box.library-comparison { padding: 1.5rem; } }
@media (min-width: 640px) {
  .comparison-loader > .comparison-loader-mark { width: 9rem; }
}
</style>
