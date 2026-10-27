<template>
  <div class="space-y-4">
    <div class="card bg-base-200 shadow">
      <div class="card-body p-4 space-y-3">
        <div v-if="profile" class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div class="flex items-center gap-4 flex-1 min-w-0">
            <img v-if="profile.avatarUrl" :src="profile.avatarUrl" alt="Steam avatar" class="w-14 h-14 rounded-full ring-2 ring-primary shrink-0" />
            <div class="min-w-0">
              <a :href="`https://steamcommunity.com/profiles/${profile.steamId}/`" target="_blank" rel="noopener noreferrer" class="font-bold text-lg link link-hover">{{ profile.name }}</a>
              <p class="text-xs opacity-50">Steam · {{ games.length }} igara</p>
              <p v-if="syncedAt" class="text-xs opacity-50 mt-0.5">Zadnje osvježavanje: {{ new Date(syncedAt).toLocaleString('hr-HR') }}</p>
            </div>
          </div>
          <div class="flex flex-wrap gap-2 shrink-0">
            <button v-if="!games.length" class="btn btn-sm" :disabled="!!busy" @click="refreshLibrary">Osvježi sa Steama</button>
            <button class="btn btn-sm btn-error btn-outline" :disabled="!!busy" @click="disconnect">Odspoji</button>
          </div>
        </div>
        <template v-else>
          <h2 class="font-semibold">Poveži svoj Steam račun</h2>
          <p class="text-sm text-base-content/60">Uvezi igre, vrijeme igranja i postignuća sa svojeg javnog Steam profila.</p>
          <button class="btn btn-primary w-fit gap-1.5" @click="openWizard">Poveži Steam račun</button>
          <p class="text-xs opacity-50">Unesi ime iz Steam linka ili cijeli link profila. Upute su unutar čarobnjaka.</p>
        </template>
      </div>
    </div>

    <div v-if="errorMessage && !wizardOpen" role="alert" class="alert alert-error"><span>{{ errorMessage }}</span></div>
    <div v-if="notice" role="status" class="alert alert-success"><span>{{ notice }}</span></div>
    <div v-if="warning" role="status" class="alert alert-warning"><span>{{ warning }}</span></div>
    <div v-if="busy && !games.length && !wizardOpen" role="status" class="flex items-center gap-2 text-sm"><span class="loading loading-spinner loading-sm"></span>{{ progress }}</div>

    <ImporterGameList v-if="profile && games.length"
      source="steam" :games="listGames" :selected-new="selected" :selected-existing="selected"
      :extras="extras" :groups="groups" :status-options="statusOptions" :ready="libraryReady"
      :busy="!!busy" refresh-label="Osvježi sa Steama" metadata-required
      :progress="progress" :done="done" :total="total"
      @resolve="resolveGame" @poster="setPoster" @select="selectGame" @refresh="refreshLibrary" @import="saveSelected(false)" @sync="saveSelected(true)"
    />
    <p v-else-if="profile && !busy" class="alert">Steam biblioteka je prazna.</p>

    <dialog ref="wizardDialog" class="modal" aria-labelledby="steam-wizard-title" @close="wizardOpen = false" @cancel="cancelWizard">
      <form class="modal-box max-w-lg space-y-4" @submit.prevent="connect">
        <h3 id="steam-wizard-title" class="font-bold text-xl">Poveži Steam račun</h3>
        <ol class="space-y-4">
          <li class="flex gap-3"><span class="shrink-0 w-7 h-7 rounded-full bg-primary text-primary-content font-bold text-sm flex items-center justify-center">1</span><div class="text-sm pt-1">Otvori <a href="https://steamcommunity.com/my/" target="_blank" rel="noopener noreferrer" class="link link-primary">svoj Steam profil</a>. Ako Steam zatraži, prijavi se tamo.</div></li>
          <li class="flex gap-3"><span class="shrink-0 w-7 h-7 rounded-full bg-primary text-primary-content font-bold text-sm flex items-center justify-center">2</span><div class="text-sm pt-1 space-y-1"><p>Kopiraj link profila ili samo ime iza <code>/id/</code>.</p><p class="opacity-60">Primjer: za <code class="break-all">steamcommunity.com/id/CatWarrior99/</code> unesi <strong>CatWarrior99</strong>. Radi i broj iz linka <code>/profiles/</code>.</p><p class="opacity-60">Ime za prijavu i prikazni nadimak mogu biti drukčiji. Koristi ime iz linka.</p></div></li>
          <li class="flex gap-3"><span class="shrink-0 w-7 h-7 rounded-full bg-primary text-primary-content font-bold text-sm flex items-center justify-center">3</span><div class="text-sm pt-1">U <a href="https://steamcommunity.com/my/edit/settings" target="_blank" rel="noopener noreferrer" class="link link-primary">postavkama privatnosti</a> postavi profil i detalje igara na <strong>Javno</strong>. Za vrijeme igranja isključi „Uvijek sakrij moje ukupno vrijeme igranja”.</div></li>
        </ol>
        <label class="block space-y-1"><span class="text-sm font-medium">Steam ime iz linka ili link profila</span><input v-model="profileInput" class="input input-bordered w-full" placeholder="CatWarrior99 ili https://steamcommunity.com/id/CatWarrior99/" :disabled="!!busy" required maxlength="256" autocomplete="off" /></label>
        <div v-if="errorMessage && wizardOpen" role="alert" class="alert alert-error text-sm"><span>{{ errorMessage }}</span></div>
        <div class="modal-action"><button type="button" class="btn btn-ghost" :disabled="!!busy" @click="closeWizard">Odustani</button><button type="submit" class="btn btn-primary gap-1" :disabled="!!busy || !profileInput.trim()"><span v-if="busy" class="loading loading-spinner loading-sm"></span>Učitaj Steam igre</button></div>
      </form>
    </dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue';
import ImporterGameList from './ImporterGameList.vue';
import { useUserStore } from '../stores/user';
import { supabase } from '../supabase';
import { useGamesApi } from '../services/gamesApi';
import { GAME_STATUS } from '../constants/gameStatus';
import { fetchSteamLibrary, fetchSteamAchievements, loadSteamSnapshot, saveSteamSnapshot, clearSteamSnapshot } from '../services/steamService';
import { loadSteamLibraryRows, buildSteamPatch, buildSteamRow } from '../services/steamImport';
import { fetchUserRows } from '../services/libraryData';
import { loadImporterMetadata } from '../services/importerMetadata';
import { resolveImporterGame, loadImporterChoices, saveImporterChoices } from '../services/importerResolution';
import { httpUrl } from '../services/safeContent';
import { otherPlatforms } from '../services/importerMatching';
import { importerStatus } from '../services/importerStatus';

const emit = defineEmits(['connection-change']);
const userStore = useUserStore();
const gamesApi = useGamesApi();
const profileInput = ref('');
const wizardDialog = ref(null);
const wizardOpen = ref(false);
const profile = ref(null);
watch(profile, value => emit('connection-change', { connected: Boolean(value), name: value?.name || '' }), { immediate: true });
const games = ref([]);
const syncedAt = ref(null);
const selected = ref({});
const extras = ref({});
const choices = ref({});
let libraryRows = [];
const groups = ref([]);
const libraryReady = ref(false);
const busy = ref('');
const errorMessage = ref('');
const notice = ref('');
const warning = ref('');
const progress = ref('');
const done = ref(0);
const total = ref(0);
let controller;
let currentUserId;

const statusOptions = GAME_STATUS;
const listGames = computed(() => games.value.map(game => ({
  key: String(game.appId), name: game.name, exists: Boolean(game._match), blocked: game._ambiguous,
  otherPlatforms: game._otherPlatforms || [],
  candidates: game._resolution?.candidates || [], needsChoice: game._resolution?.needsChoice, resolution: game._resolution?.resolution,
  imageUrl: game.imageUrl || `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${game.appId}/library_600x900.jpg`,
  fallbackImageUrl: `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${game.appId}/header.jpg`, platform: 'PC · Steam',
  url: `https://store.steampowered.com/app/${game.appId}/`, playtime: formatPlaytime(game.minutesPlayed),
  progress: game.achievements?.total ? Math.round(game.achievements.earned / game.achievements.total * 100) : null,
  progressLabel: 'postignuća', progressValue: game.achievements?.earned,
  progressTotal: game.achievements?.total, lastPlayed: game.lastPlayed,
})));
function selectGame({ key, value }) { selected.value[key] = value; }
function setPoster({ key, url }) {
  const game = games.value.find(game => String(game.appId) === key);
  if (game) game._posterUrl = httpUrl(url);
}
function resolveGame({ key, value }) {
  if (busy.value) return;
  choices.value[key] = value === 'separate' ? { mode: 'separate' } : { mode: 'link', targetId: value.slice(5) };
  saveImporterChoices(currentUserId, 'steam', choices.value);
  applyMatches(libraryRows);
  selected.value[key] = true;
}
function openWizard() {
  errorMessage.value = '';
  wizardOpen.value = true;
  wizardDialog.value.showModal();
}
function closeWizard() {
  if (!busy.value) wizardDialog.value.close();
}
function cancelWizard(event) {
  if (busy.value) event.preventDefault();
}

function formatPlaytime(minutes) {
  if (minutes == null) return 'Vrijeme skriveno';
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
}

function showError(error) {
  if (error.name === 'AbortError') return;
  errorMessage.value = error.message || 'Steam uvoz nije uspio. Pokušaj ponovno.';
}

function startOperation(type) {
  controller?.abort();
  controller = new AbortController();
  busy.value = type;
  errorMessage.value = '';
  notice.value = '';
  warning.value = '';
  done.value = 0;
  total.value = 0;
  return controller.signal;
}

function checkActive(signal) {
  signal.throwIfAborted();
  if (userStore.user?.id !== currentUserId) throw new DOMException('Prekinuto', 'AbortError');
}

async function markExisting(signal) {
  libraryReady.value = false;
  const rows = await loadSteamLibraryRows(supabase, currentUserId, signal);
  const data = await fetchUserRows(supabase, 'groups', currentUserId, { columns: 'id,name', order: 'name', signal });
  checkActive(signal);
  groups.value = data;
  libraryRows = rows;
  applyMatches(rows);
  libraryReady.value = true;
  return rows;
}

function applyMatches(rows) {
  for (const game of games.value) {
    const match = resolveImporterGame(rows, 'steam', game, choices.value[game.appId]);
    game._resolution = match;
    game._match = match.row;
    game._ambiguous = match.blocked;
    game._otherPlatforms = otherPlatforms(rows, game.name, 'PC');
    if (!extras.value[game.appId]) extras.value[game.appId] = { status: 'backlog', statusAutomatic: true, rating: 0, notes: '', groupId: null };
    if (extras.value[game.appId].statusAutomatic) {
      extras.value[game.appId].status = importerStatus(extras.value[game.appId], game.achievements?.earned, game.achievements?.total);
    }
    if (match.row || match.blocked) selected.value[game.appId] = false;
  }
}

function saveSnapshot() {
  const snapshotGames = [];
  for (const game of games.value) {
    const { _match, _ambiguous, _otherPlatforms, _metadata, _posterUrl, _resolution, ...saved } = game;
    snapshotGames.push(saved);
  }
  saveSteamSnapshot(currentUserId, { profile: profile.value, games: snapshotGames, syncedAt: syncedAt.value });
}

async function connect() {
  if (busy.value) return;
  await refreshLibrary(profileInput.value.trim());
}

async function refreshLibrary(input) {
  if (busy.value) return;
  const signal = startOperation(profile.value ? 'refresh' : 'connect');
  progress.value = 'Dohvaćam Steam biblioteku…';
  try {
    const snapshot = await fetchSteamLibrary(typeof input === 'string' ? input : profile.value.steamId, signal);
    checkActive(signal);
    profile.value = snapshot.profile;
    games.value = snapshot.games;
    syncedAt.value = snapshot.syncedAt;
    selected.value = {};
    await markExisting(signal);
    saveSnapshot();
    wizardDialog.value?.close();
    notice.value = `Učitano ${games.value.length} igara. Odaberi igre za uvoz ili sinkronizaciju.`;
  } catch (error) {
    if (!signal.aborted) showError(error);
  } finally {
    if (!signal.aborted) busy.value = '';
  }
}

function disconnect() {
  if (busy.value) return;
  clearSteamSnapshot(currentUserId);
  profile.value = null;
  profileInput.value = '';
  games.value = [];
  selected.value = {};
  extras.value = {};
  syncedAt.value = null;
  notice.value = 'Steam profil je odspojen.';
  errorMessage.value = '';
  warning.value = '';
}

async function saveSelected(existing) {
  if (busy.value || !libraryReady.value) return;
  const toSave = games.value.filter(game => selected.value[game.appId] && !game._ambiguous && Boolean(game._match) === existing);
  if (!toSave.length) return;
  const signal = startOperation(existing ? 'sync' : 'import');
  total.value = toSave.length;
  let saved = 0;
  let unavailable = 0;
  let groupFailures = 0;
  const missingMetadata = [];
  const unresolved = [];
  try {
    // Ponovna provjera sprječava ponovljeni uvoz.
    const rows = await loadSteamLibraryRows(supabase, currentUserId, signal);
    checkActive(signal);
    const targets = new Set();
    if (existing) {
      for (const game of toSave) {
        const match = resolveImporterGame(rows, 'steam', game, choices.value[game.appId]);
        if (match.row && targets.has(match.row.id)) throw new Error('Odaberi samo jedan izvor napretka za istu igru.');
        if (match.row) targets.add(match.row.id);
      }
    }
    for (const game of toSave) {
      checkActive(signal);
      progress.value = `${existing ? 'Sinkroniziram' : 'Uvozim'}: ${game.name} (${done.value + 1}/${total.value})`;
      const match = resolveImporterGame(rows, 'steam', game, choices.value[game.appId]);
      if (match.blocked || Boolean(match.row) !== existing) {
        if (match.blocked) unresolved.push(game.name);
        selected.value[game.appId] = false;
        done.value++;
        continue;
      }
      let achievements = null;
      try {
        achievements = await fetchSteamAchievements(profile.value.steamId, game.appId, signal);
      } catch (error) {
        if (error.name === 'AbortError' || error.status === 401 || error.status === 429) throw error;
      }
      if (!achievements) unavailable++;
      checkActive(signal);
      if (existing) {
        const patch = buildSteamPatch(game, achievements);
        patch.website_url = `https://store.steampowered.com/app/${game.appId}/`;
        const { data, error } = await supabase.from('games').update(patch)
          .eq('user_id', currentUserId).eq('id', match.row.id).eq('platform', match.row.platform).select('id').abortSignal(signal);
        if (error) throw error;
        if (!data?.length) throw new Error('Igra više nije u kolekciji. Osvježi popis i pokušaj ponovno.');
      } else {
        const metadata = await loadImporterMetadata(gamesApi, game.name);
        if (!metadata) { missingMetadata.push(game.name); done.value++; continue; }
        checkActive(signal);
        const row = { ...buildSteamRow(currentUserId, game, extras.value[game.appId], achievements), ...metadata };
        if (match.separate) row.title = game.name;
        row.image_url = game._posterUrl || metadata.image_url;
        extras.value[game.appId].status = row.status;
        // Steam link čuva identitet unosa.
        row.website_url = `https://store.steampowered.com/app/${game.appId}/`;
        game._metadata = metadata;
        const { data, error } = await supabase.from('games').insert(row).select('id').single().abortSignal(signal);
        if (error) throw error;
        checkActive(signal);
        rows.push({ ...row, id: data.id });
        if (match.separate) {
          choices.value[game.appId] = { mode: 'separate', entryId: data.id };
          saveImporterChoices(currentUserId, 'steam', choices.value);
        }
        const groupId = extras.value[game.appId].groupId;
        if (groupId) {
          const { error } = await supabase.from('game_groups').insert({ user_id: currentUserId, game_id: data.id, group_id: groupId }).abortSignal(signal);
          if (error) groupFailures++;
        }
      }
      checkActive(signal);
      game.achievements = achievements;
      selected.value[game.appId] = false;
      saved++;
      done.value++;
    }
  } catch (error) {
    if (!signal.aborted) {
      showError(error);
    }
  } finally {
    if (!signal.aborted) {
      notice.value = `${existing ? 'Sinkronizirano' : 'Uvezeno'} ${saved} od ${toSave.length} odabranih igara.`;
      const warnings = [];
      if (unresolved.length) warnings.push(`Odaberi postojeću igru ili zaseban unos za: ${unresolved.join(', ')}.`);
      if (missingMetadata.length) warnings.push(`Nisu dodane igre bez potvrđenog podudaranja u Gamenote katalogu: ${missingMetadata.join(', ')}. Pronađi ih kroz Dodaj igru.`);
      if (unavailable) warnings.push(`Za ${unavailable} igara postignuća nisu dostupna. Postojeći napredak je sačuvan.`);
      if (groupFailures) warnings.push(`${groupFailures} igara je uvezeno bez grupe. Grupu dodaj u kolekciji.`);
      warning.value = warnings.join(' ');
      try {
        await markExisting(signal);
        saveSnapshot();
      } catch (error) {
        if (!signal.aborted) showError(error);
      }
      if (!signal.aborted) busy.value = '';
    }
  }
}

watch(() => userStore.user?.id, async (userId) => {
  controller?.abort();
  wizardDialog.value?.close();
  currentUserId = userId;
  choices.value = userId ? loadImporterChoices(userId, 'steam') : {};
  libraryRows = [];
  busy.value = '';
  profile.value = null;
  profileInput.value = '';
  games.value = [];
  selected.value = {};
  extras.value = {};
  groups.value = [];
  errorMessage.value = '';
  warning.value = '';
  notice.value = '';
  libraryReady.value = false;
  if (!userId) return;
  const snapshot = loadSteamSnapshot(userId);
  if (!snapshot) return;
  const signal = startOperation('restore');
  progress.value = 'Provjeravam igre u kolekciji…';
  profile.value = snapshot.profile;
  games.value = snapshot.games;
  syncedAt.value = snapshot.syncedAt;
  try {
    await markExisting(signal);
  } catch (error) {
    if (!signal.aborted) showError(error);
  } finally {
    if (!signal.aborted) busy.value = '';
  }
}, { immediate: true });

onBeforeUnmount(() => controller?.abort());
</script>
