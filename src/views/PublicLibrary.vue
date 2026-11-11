<template>
  <ShareGuestHeader v-if="!userStore.isLoggedIn" />
  <div class="public-library space-y-5 min-w-0 max-w-[1600px] mx-auto px-3 sm:px-4 py-5">
    <div v-if="error" role="alert" class="alert alert-error"><span>{{ error }}</span><button class="btn btn-sm" @click="load">Pokušaj ponovno</button></div>
    <template v-if="loading && !header">
      <div class="skeleton h-8 w-64 max-w-full" aria-hidden="true"></div>
      <GamerCardSkeleton />
    </template>
    <template v-if="header">
      <h1 class="text-2xl sm:text-3xl font-bold text-left break-words">Gamenote · {{ header.name }}</h1>
      <div class="max-w-xl mx-auto">
        <GamerCard :name="header.name" :username="header.username" :avatar-url="header.avatar_url" :created-at="header.created_at" :card-stats="header.card" color="signature" />
      </div>
      <div class="flex flex-wrap items-center justify-between gap-2">
        <nav class="flex flex-wrap gap-1" aria-label="Podijeljena zbirka">
          <router-link v-for="item in tabs" :key="item.key" :to="{ path: route.path, query: item.key === 'games' ? {} : { tab: item.key } }" class="collection-nav-link" :class="{ 'bg-base-200 text-primary': tab === item.key }" :aria-current="tab === item.key ? 'page' : undefined"><CollectionNavIcon :name="item.key" class="h-5 w-5" />{{ item.label }}</router-link>
        </nav>
      </div>
    </template>
    <template v-if="header && tab === 'games'">
      <LibraryStatusFilters ratings :model-value="filters.status || 'all'" @update:model-value="filterStatus" />
      <LibraryToolbar :model-value="filters.search" :sort-value="sortValue" placeholder="Pretraži zbirku…" @update:model-value="searchGames" @sort="sortGames">
        <template #controls><TcgShareToggle class="sm:ml-auto shrink-0" :model-value="tcgActive" @update:model-value="toggleTcg" /></template>
      </LibraryToolbar>
    </template>
    <template v-if="loading">
      <LoadingCardGrid v-if="tab === 'groups'" :layout="groupLayout" variant="groups" banner label="Učitavam grupe…" />
      <LoadingCardGrid v-else-if="tab === 'stats'" :layout="statsLayout" variant="panels" label="Učitavam statistiku…" />
      <LoadingCardGrid v-else :layout="cardLayout" />
    </template>
    <template v-else-if="header">
      <StatsContent v-if="tab === 'stats' && statsGames" :public-games="statsGames" @open-game="openGame" />
      <template v-else-if="tab === 'groups'">
        <h2 class="sr-only">Grupe</h2>
        <p v-if="!items.length">Ova zbirka još nema grupa.</p>
        <div v-else class="grid" :class="[groupLayout.container, groupLayout.gap]">
          <GroupCard v-for="group in items" :key="group.id" :group="group" :load-images="loadGroupImages" @open="openGroup(group)" />
        </div>
      </template>
      <template v-else>
        <p v-if="!items.length">Nema igara za prikaz.</p>
        <div v-else class="grid" :class="[cardLayout.container, cardLayout.gap]">
          <div v-for="entry in items" :key="entry.id" role="button" tabindex="0" :aria-label="`Pogledaj igru: ${entry.title}`" class="min-w-0 cursor-pointer rounded-box focus-visible:outline-2 focus-visible:outline-primary" @click="openGame(entry.id)" @keydown.enter.prevent="openGame(entry.id)" @keydown.space.prevent="openGame(entry.id)">
            <GameCard :game="entry" :lazy="true" :tcg="tcgActive" />
          </div>
        </div>
      </template>
      <nav v-if="!loading && tab !== 'stats' && total > 48" class="flex justify-center items-center gap-3" aria-label="Stranice zbirke">
        <button class="btn btn-sm" :disabled="page <= 1" @click="changePage(page - 1)">Prethodna</button><span>{{ page }} / {{ Math.ceil(total / 48) }}</span><button class="btn btn-sm" :disabled="page * 48 >= total" @click="changePage(page + 1)">Sljedeća</button>
      </nav>
    </template>
  </div>

  <dialog ref="groupDialog" class="modal" aria-labelledby="shared-group-title" @close="closeGroup">
    <div class="modal-box w-11/12 max-w-6xl p-3 sm:p-4 md:p-6">
      <div class="flex justify-between items-center gap-3 mb-4"><h2 id="shared-group-title" class="text-xl font-bold">{{ selectedGroup?.name || 'Grupa' }}</h2><button class="btn btn-sm btn-circle btn-ghost" aria-label="Zatvori grupu" @click="groupDialog.close()">✕</button></div>
      <LoadingCardGrid v-if="groupLoading" :layout="groupCardLayout" />
      <p v-else-if="groupError" role="alert" class="alert alert-error">{{ groupError }}</p>
      <p v-else-if="!groupItems.length">Grupa još nema igara.</p>
      <div v-else class="grid" :class="[groupCardLayout.container, groupCardLayout.gap]">
        <div v-for="entry in groupItems" :key="entry.id" role="button" tabindex="0" :aria-label="`Pogledaj igru: ${entry.title}`" class="min-w-0 cursor-pointer rounded-box focus-visible:outline-2 focus-visible:outline-primary" @click="openGame(entry.id)" @keydown.enter.prevent="openGame(entry.id)" @keydown.space.prevent="openGame(entry.id)"><GameCard :game="entry" size="medium" :lazy="true" :tcg="tcgActive" /></div>
      </div>
      <div v-if="groupTotal > 48" class="flex justify-center items-center gap-3 mt-4"><button class="btn btn-sm" :disabled="groupLoading || groupPage <= 1" @click="loadGroup(groupPage - 1)">Prethodna</button><span>{{ groupPage }} / {{ Math.ceil(groupTotal / 48) }}</span><button class="btn btn-sm" :disabled="groupLoading || groupPage * 48 >= groupTotal" @click="loadGroup(groupPage + 1)">Sljedeća</button></div>
    </div>
    <form method="dialog" class="modal-backdrop"><button>Zatvori grupu</button></form>
  </dialog>

  <dialog ref="gameDialog" class="modal" aria-labelledby="shared-game-title" @close="closeGame">
    <div class="modal-box w-11/12 max-w-4xl">
      <div class="flex justify-between items-center gap-3 mb-4"><h2 id="shared-game-title" class="text-xl font-bold">{{ game?.title || 'Informacije o igri' }}</h2><button class="btn btn-sm btn-circle btn-ghost" aria-label="Zatvori igru" @click="gameDialog.close()">✕</button></div>
      <div v-if="gameLoading" class="grid md:grid-cols-[200px_1fr] gap-5">
        <div class="skeleton w-full aspect-[3/4] self-start" aria-hidden="true"></div>
        <LoadingCardGrid :layout="statsLayout" variant="panels" label="Učitavam igru…" />
      </div>
      <p v-else-if="gameError" role="alert" class="alert alert-error">{{ gameError }}</p>
      <template v-else-if="game">
        <div class="grid md:grid-cols-[200px_1fr] gap-5">
          <GameCard :game="game" :tcg="false" />
          <div class="space-y-4 min-w-0">
            <div>
              <span class="flex items-center gap-2 text-sm opacity-70 font-semibold mb-1"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 shrink-0" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>Opis</span>
              <p id="shared-game-description" ref="descriptionText" class="shared-game-description whitespace-pre-line break-words" :class="descriptionExpanded ? '' : 'line-clamp-3 sm:line-clamp-none'">{{ game.description || 'Opis nije dostupan.' }}</p>
              <button v-if="descriptionOverflow || descriptionExpanded" type="button" class="btn btn-link btn-sm px-0 sm:hidden" :aria-expanded="descriptionExpanded" aria-controls="shared-game-description" @click="descriptionExpanded = !descriptionExpanded">{{ descriptionExpanded ? 'Sažmi opis' : 'Pročitaj cijeli opis' }}</button>
            </div>
            <dl class="shared-game-info grid grid-cols-2 gap-3">
              <div v-for="field in detailFields" :key="field.label">
                <dt class="flex items-center gap-2 text-sm opacity-70"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 shrink-0" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" :d="field.icon" /></svg>{{ field.label }}</dt>
                <dd class="text-sm font-semibold break-words">{{ field.value || '—' }}</dd>
              </div>
              <div v-if="game.metacritic_score || game.esrb_rating" class="col-span-2 flex flex-wrap items-center justify-evenly gap-x-10 gap-y-3 bg-base-300 rounded-xl p-3 w-full">
                <div v-if="game.metacritic_score" class="flex items-center gap-2">
                  <dt class="flex items-center gap-1.5 text-sm opacity-70"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 shrink-0" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg>Metacritic</dt>
                  <dd><div class="radial-progress font-bold text-lg" :class="getMetacriticColorClass(game.metacritic_score)" :style="{ '--value': game.metacritic_score, '--size': '4.2rem', '--thickness': '0.4rem' }" :aria-valuenow="game.metacritic_score" aria-label="Metacritic" role="progressbar">{{ game.metacritic_score }}</div></dd>
                </div>
                <div v-if="game.esrb_rating" class="flex items-center gap-2">
                  <dt class="flex items-center gap-1.5 text-sm opacity-70"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 shrink-0" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" /></svg>ESRB</dt>
                  <dd><img v-if="esrbImage" :src="esrbImage" :alt="game.esrb_rating" class="w-12 h-auto" /><span v-else class="text-sm">{{ game.esrb_rating }}</span></dd>
                </div>
              </div>
            </dl>
            <GameSeriesSection :game="game" @open-game="openSeriesGame" />
            <div class="game-screenshots flex gap-3 overflow-x-auto" @wheel="scrollScreenshots">
              <button v-for="(url, index) in screenshots" :key="index" type="button" class="shrink-0 rounded-box hover:opacity-90 transition-opacity" :aria-label="`Otvori screenshot ${index + 1}`" @click="openScreenshotModal(index)">
                <img :src="url" :alt="`Screenshot ${index + 1}`" class="w-64 aspect-video object-cover rounded-box" loading="lazy" />
              </button>
            </div>
          </div>
        </div>
        <div v-if="userStore.isLoggedIn" class="shared-game-actions mt-5">
          <button v-if="ownGameId" class="btn btn-sm btn-success min-h-10" @click="openOwnGame">Već u Gamenoteu</button>
          <button v-else-if="libraryCheckError" class="btn btn-sm min-h-10" @click="libraryCheckVersion++">Ponovi provjeru</button>
          <button v-else class="btn btn-sm btn-primary min-h-10" :disabled="libraryChecking" @click="addModal.open(game)">{{ libraryChecking ? 'Provjeravam Gamenote…' : 'Dodaj u Gamenote' }}</button>
          <p v-if="libraryCheckError" role="alert" class="text-sm text-error mt-2">{{ libraryCheckError }}</p>
        </div>
      </template>
    </div>
    <form method="dialog" class="modal-backdrop"><button>Zatvori igru</button></form>
  </dialog>
  <dialog ref="screenshotDialog" class="modal" aria-label="Pregled screenshotova" @close="selectedScreenshotIndex = null">
    <div class="modal-box max-w-5xl">
      <div class="flex justify-end mb-3"><button type="button" class="btn btn-sm btn-circle btn-ghost" aria-label="Zatvori screenshot" @click="closeScreenshotModal">✕</button></div>
      <div v-if="selectedScreenshotIndex !== null" class="relative">
        <img :src="screenshots[selectedScreenshotIndex]" :alt="`Screenshot ${selectedScreenshotIndex + 1}`" class="w-full h-auto rounded-lg" />
        <button v-if="screenshots.length > 1" type="button" @click="previousScreenshot" aria-label="Prethodni screenshot" class="absolute left-2 top-1/2 transform -translate-y-1/2 btn btn-circle btn-ghost bg-black/50 text-white hover:bg-black/75">❮</button>
        <button v-if="screenshots.length > 1" type="button" @click="nextScreenshot" aria-label="Sljedeći screenshot" class="absolute right-2 top-1/2 transform -translate-y-1/2 btn btn-circle btn-ghost bg-black/50 text-white hover:bg-black/75">❯</button>
        <div class="screenshot-counter absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded" aria-live="polite">{{ selectedScreenshotIndex + 1 }} / {{ screenshots.length }}</div>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop"><button aria-label="Zatvori pregled screenshotova">Zatvori</button></form>
  </dialog>
  <AddSharedGameModal ref="addModal" @added="onGameAdded" />
</template>
<script setup>
import { computed, defineAsyncComponent, onUnmounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { supabase } from '../supabase.js';
import { useUserStore } from '../stores/user.js';
import { useThemeStore } from '../stores/theme.js';
import { useCardSizeStore } from '../stores/cardSize.js';
import { loadPublicLibrary } from '../services/libraryShare.js';
import { updateMetadata } from '../services/seo.js';
import GameSeriesSection from '../components/GameSeriesSection.vue';
import { useGamesApi } from '../services/gamesApi.js';
import { catalogGameDetails } from '../services/gameSeries.js';
import GamerCard from '../components/GamerCard.vue';
import GameCard from '../components/GameCard.vue';
import ShareGuestHeader from '../components/ShareGuestHeader.vue';
import CollectionNavIcon from '../components/CollectionNavIcon.vue';
import LibraryToolbar from '../components/LibraryToolbar.vue';
import LibraryStatusFilters from '../components/LibraryStatusFilters.vue';
import TcgShareToggle from '../components/TcgShareToggle.vue';
import AddSharedGameModal from '../components/AddSharedGameModal.vue';
import LoadingCardGrid from '../components/LoadingCardGrid.vue';
import GamerCardSkeleton from '../components/GamerCardSkeleton.vue';
import GroupCard from '../components/GroupCard.vue';
import { GROUP_LAYOUT } from '../constants/groupLayout.js';
const StatsContent = defineAsyncComponent(() => import('../components/StatsContent.vue'));
const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const gamesApi = useGamesApi();
const themeStore = useThemeStore();
const cardSizeStore = useCardSizeStore();
const header = ref(null);
const error = ref('');
const loading = ref(true);
const items = ref([]);
const total = ref(0);
const statsGames = ref(null);
const gameDialog = ref(null);
const screenshotDialog = ref(null);
/** @type {import('vue').Ref<number | null>} */
const selectedScreenshotIndex = ref(null);
const groupDialog = ref(null);
const addModal = ref(null);
const game = ref(null);
const ownGameId = ref(null);
const libraryChecking = ref(false);
const libraryCheckError = ref('');
const libraryCheckVersion = ref(0);
// noinspection ExceptionCaughtLocallyJS
watch([game, () => userStore.user?.id, libraryCheckVersion], async ([source, ownerId], previous, onCleanup) => {
  ownGameId.value = null; libraryChecking.value = false; libraryCheckError.value = '';
  if (!source || !ownerId) return;
  const request = new AbortController();
  onCleanup(() => request.abort());
  libraryChecking.value = true;
  try {
    let query = supabase.from('games').select('id').eq('user_id', ownerId);
    if (source.game_api_id) query = query.eq('game_api_id', String(source.game_api_id));
    else query = query.eq('title', source.title);
    const { data, error: failure } = await query.limit(1).abortSignal(request.signal);
    if (request.signal.aborted) return;
    if (failure) throw failure;
    ownGameId.value = data?.[0]?.id || null;
  } catch {
    if (!request.signal.aborted) libraryCheckError.value = 'Nije moguće provjeriti tvoj Gamenote. Pokušaj ponovno.';
  } finally {
    if (!request.signal.aborted) libraryChecking.value = false;
  }
});
function onGameAdded(result) { if (game.value === result.source) ownGameId.value = result.id; }
function openOwnGame() {
  if (!ownGameId.value) return;
  const id = ownGameId.value;
  gameDialog.value.close();
  groupDialog.value?.close();
  router.push({ name: 'game-details', params: { id } });
}
const gameLoading = ref(false);
const gameError = ref('');
const descriptionText = ref(null);
const descriptionExpanded = ref(false);
const descriptionOverflow = ref(false);
let descriptionObserver;
watch(descriptionText, element => {
  descriptionObserver?.disconnect();
  descriptionOverflow.value = false;
  if (!element) return;
  descriptionObserver = new ResizeObserver(() => {
    if (!descriptionExpanded.value) descriptionOverflow.value = element.scrollHeight > element.clientHeight + 1;
  });
  descriptionObserver.observe(element);
});
const selectedGroup = ref(null);
const groupItems = ref([]);
const groupLoading = ref(false);
const groupError = ref('');
const groupPage = ref(1);
const groupTotal = ref(0);
const guestMedia = window.matchMedia('(min-width: 1024px) and (hover: hover) and (pointer: fine)');
const guestTcg = ref(guestMedia.matches);
let guestTcgChosen = false;
function syncGuestTcg(event) { if (!guestTcgChosen) guestTcg.value = event.matches; }
guestMedia.addEventListener('change', syncGuestTcg);
const tcgActive = computed(() => userStore.isLoggedIn ? themeStore.tcgMode : guestTcg.value);
const cardLayout = computed(() => cardSizeStore.getSizeConfig(userStore.isLoggedIn ? cardSizeStore.cardSize : 'medium'));
const groupCardLayout = {
  ...cardSizeStore.getSizeConfig('medium'),
  container: 'grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(min(100%,10rem),1fr))] md:grid-cols-[repeat(auto-fill,minmax(min(100%,11rem),1fr))]',
};
const groupLayout = GROUP_LAYOUT;
const statsLayout = { container: 'grid-cols-1 sm:grid-cols-2', gap: 'gap-4', cardBody: 'p-4' };
const filters = reactive({ search: '', status: '', platform: '', genre: '', sort: 'title' });
const sortOptions = { 'title:asc': 'title', 'title:desc': 'title_desc', 'rating:desc': 'rating', 'rating:asc': 'rating_asc', 'play_time:desc': 'hours', 'created_at:desc': 'newest' };
const sortValue = computed(() => Object.keys(sortOptions).find(key => sortOptions[key] === filters.sort) || 'title:asc');
let searchTimer;
function searchGames(value) { filters.search = value; clearTimeout(searchTimer); searchTimer = setTimeout(applyFilters, 300); }
function sortGames(value) {
  clearTimeout(searchTimer);
  applyFilters({ sort: sortOptions[value] || 'title' });
}

const tab = computed(() => ['groups', 'stats'].includes(route.query.tab) ? route.query.tab : 'games');
const page = computed(() => Math.max(1, Math.min(100000, Number.parseInt(route.query.page) || 1)));
const tabs = computed(() => [{ key: 'games', label: 'Igre' }, { key: 'groups', label: 'Grupe' }, ...(header.value?.share_scope === 'all' ? [{ key: 'stats', label: 'Statistika' }] : [])]);
function toggleTcg(value) { if (userStore.isLoggedIn) themeStore.setTcgMode(value); else { guestTcgChosen = true; guestTcg.value = value; } }
function date(value) { return value ? new Date(value).toLocaleDateString('hr-HR') : ''; }
const detailFields = computed(() => game.value ? [
  { label: 'Izdavač', value: game.value.publisher, icon: 'M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h1.5c.621 0 1.125.504 1.125 1.125V21' },
  { label: 'Datum izlaska', value: date(game.value.release_date), icon: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5' },
] : []);
const esrbImage = computed(() => {
  const ratings = { Mature: 'M', Everyone: 'E', Teen: 'T', 'Everyone 10+': 'E10plus', 'Adults Only': 'AO' };
  const file = ratings[game.value?.esrb_rating];
  return file ? `https://www.esrb.org/wp-content/uploads/2019/05/${file}.svg` : '';
});
function getMetacriticColorClass(score) {
  if (score >= 90) return 'text-green-700 bg-base-200 border-green-900';
  if (score >= 80) return 'text-green-600 bg-base-200 border-green-700';
  if (score >= 70) return 'text-green-500 bg-base-200 border-green-500';
  if (score >= 60) return 'text-yellow-500 bg-base-200 border-yellow-500';
  if (score >= 50) return 'text-yellow-600 bg-base-200 border-yellow-600';
  if (score >= 40) return 'text-orange-500 bg-base-200 border-orange-500';
  return 'text-red-500 bg-base-200 border-red-500';
}
const screenshots = computed(() => {
  try { const list = typeof game.value?.screenshot_urls === 'string' ? JSON.parse(game.value.screenshot_urls) : game.value?.screenshot_urls; return Array.isArray(list) ? list.filter(url => typeof url === 'string' && /^https?:\/\//.test(url)).slice(0, 20) : []; }
  catch { return []; }
});
function scrollScreenshots(event) {
  if (!guestMedia.matches || event.ctrlKey || Math.abs(event.deltaX) >= Math.abs(event.deltaY)) return;
  const strip = event.currentTarget;
  let distance = event.deltaY;
  if (event.deltaMode === 1) distance *= 16;
  else if (event.deltaMode === 2) distance *= strip.clientWidth;
  const previous = strip.scrollLeft;
  strip.scrollLeft += distance;
  if (strip.scrollLeft !== previous) event.preventDefault();
}
function openScreenshotModal(index) {
  if (!screenshots.value[index]) return;
  selectedScreenshotIndex.value = index;
  if (!screenshotDialog.value.open) screenshotDialog.value.showModal();
}
function closeScreenshotModal() { screenshotDialog.value?.close(); selectedScreenshotIndex.value = null; }
function previousScreenshot() {
  if (selectedScreenshotIndex.value === null || !screenshots.value.length) return;
  if (selectedScreenshotIndex.value > 0) selectedScreenshotIndex.value--;
  else selectedScreenshotIndex.value = screenshots.value.length - 1;
}
function nextScreenshot() {
  if (selectedScreenshotIndex.value === null || !screenshots.value.length) return;
  if (selectedScreenshotIndex.value < screenshots.value.length - 1) selectedScreenshotIndex.value++;
  else selectedScreenshotIndex.value = 0;
}
let controller;
let revision = 0;
let gameController;
let gameRevision = 0;
let groupController;
let groupRevision = 0;
let loadedUsername = '';
async function load() {
  closeScreenshotModal();
  controller?.abort(); controller = new AbortController();
  const current = ++revision;
  loading.value = true; error.value = ''; statsGames.value = null; items.value = [];
  const username = String(route.params.username);
  for (const key of Object.keys(filters)) filters[key] = String(route.query[key] || (key === 'sort' ? 'title' : ''));
  const options = { ...filters, page: page.value };
  if (loadedUsername !== username) { header.value = null; gameDialog.value?.close(); groupDialog.value?.close(); }
  try {
    const data = await loadPublicLibrary(username, 'header', {}, controller.signal);
    if (current !== revision) return;
    header.value = data; loadedUsername = username;
    if (tab.value === 'stats' && data.share_scope !== 'all') { await router.replace({ path: route.path, query: {} }); return; }
    const section = tab.value === 'groups' ? 'groups' : tab.value === 'stats' ? 'stats' : 'games';
    const result = await loadPublicLibrary(username, section, options, controller.signal);
    if (current !== revision) return;
    if (section === 'stats') statsGames.value = result.items;
    else { items.value = result.items; total.value = result.total; }
    updateMetadata({ path: `/${data.username}`, query: {}, publicLibrary: data });
    if (route.query.game) await openGame(String(route.query.game));
    else if (route.query.group) await openGroup({ id: String(route.query.group), name: String(route.query.name || 'Grupa') });
  } catch (failure) { if (current === revision) { error.value = failure.message; header.value = null; } }
  finally { if (current === revision) loading.value = false; }
}
async function openGame(id) {
  closeScreenshotModal();
  gameController?.abort(); gameController = new AbortController();
  const current = ++gameRevision;
  game.value = null; gameLoading.value = true; gameError.value = ''; descriptionExpanded.value = false;
  if (!gameDialog.value.open) gameDialog.value.showModal();
  try { const data = await loadPublicLibrary(String(route.params.username), 'game', { game: id }, gameController.signal); if (current === gameRevision) game.value = data; }
  catch (failure) { if (current === gameRevision) gameError.value = failure.message; }
  finally { if (current === gameRevision) gameLoading.value = false; }
}
async function openSeriesGame(entry) {
  closeScreenshotModal();
  gameController?.abort(); gameController = new AbortController();
  const current = ++gameRevision;
  game.value = null; gameLoading.value = true; gameError.value = ''; descriptionExpanded.value = false;
  try {
    const data = await gamesApi.getGameDetails(entry.id, { signal: gameController.signal });
    if (current !== gameRevision) return;
    const results = await Promise.allSettled([gamesApi.getGameScreenshots(entry.id, { signal: gameController.signal }), gamesApi.getGameSeries(entry.id, { signal: gameController.signal })]);
    if (current !== gameRevision) return;
    const images = results[0].status === 'fulfilled' ? results[0].value : [];
    const series = results[1].status === 'fulfilled' ? results[1].value.results || [] : [];
    game.value = catalogGameDetails(data, images, series);
  } catch { if (current === gameRevision) gameError.value = 'Informacije o igri nije moguće učitati. Pokušaj ponovno.'; }
  finally { if (current === gameRevision) gameLoading.value = false; }
}
function closeGame() { gameRevision++; gameController?.abort(); closeScreenshotModal(); gameLoading.value = false; game.value = null; }
async function loadGroupImages(group, signal) {
  const result = await loadPublicLibrary(header.value.username, 'games', { group: group.id }, signal);
  return result.items.map(game => game.background_image || game.image_url).filter(Boolean).slice(0, 4);
}
async function openGroup(group) { selectedGroup.value = group; if (!groupDialog.value.open) groupDialog.value.showModal(); await loadGroup(1); }
async function loadGroup(value) {
  groupController?.abort(); groupController = new AbortController();
  const current = ++groupRevision;
  groupPage.value = value; groupLoading.value = true; groupError.value = ''; groupItems.value = [];
  try { const data = await loadPublicLibrary(String(route.params.username), 'games', { group: selectedGroup.value.id, page: value }, groupController.signal); if (current === groupRevision) { groupItems.value = data.items; groupTotal.value = data.total; } }
  catch (failure) { if (current === groupRevision) groupError.value = failure.message; }
  finally { if (current === groupRevision) groupLoading.value = false; }
}
function closeGroup() { groupRevision++; groupController?.abort(); groupLoading.value = false; selectedGroup.value = null; groupItems.value = []; }
function collectionQuery() { const query = { ...route.query }; delete query.game; delete query.group; delete query.name; return query; }
function changePage(value) { router.push({ query: { ...collectionQuery(), page: value } }); }
function applyFilters(overrides = {}) {
  router.push({ query: { ...collectionQuery(), ...filters, ...overrides, page: undefined } });
}
function filterStatus(value) {
  clearTimeout(searchTimer);
  applyFilters({ status: value === 'all' ? '' : value });
}
watch(() => route.fullPath, load, { immediate: true });
watch(() => userStore.isLoggedIn, (loggedIn) => {
  gameDialog.value?.close(); groupDialog.value?.close();
  const path = loggedIn ? `/u/${route.params.username}` : `/${route.params.username}`;
  if (route.path !== path) router.replace({ path, query: route.query });
});
onUnmounted(() => { descriptionObserver?.disconnect(); clearTimeout(searchTimer); guestMedia.removeEventListener('change', syncGuestTcg); revision++; controller?.abort(); closeGame(); closeGroup(); });
</script>
<style scoped>
.collection-nav-link { display: flex; align-items: center; gap: 8px; padding: 10px 12px; border-radius: 8px; font-size: 14px; font-weight: 500; }
.collection-nav-link:hover { color: var(--color-primary); }
.collection-nav-link:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }
</style>
