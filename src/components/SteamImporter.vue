<template>
  <div class="space-y-4">
    <div class="card bg-base-200 shadow">
      <div class="card-body p-4 space-y-3">
        <div v-if="profile" class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div class="flex items-center gap-4 flex-1 min-w-0">
            <img v-if="profile.avatarUrl" :src="profile.avatarUrl" :alt="$t('steamImporter.steamAvatar')" class="w-14 h-14 rounded-full ring-2 ring-primary shrink-0" />
            <div class="min-w-0">
              <a :href="`https://steamcommunity.com/profiles/${profile.steamId}/`" target="_blank" rel="noopener noreferrer" class="font-bold text-lg link link-hover">{{ profile.name }}</a>
              <p class="text-xs opacity-50">Steam · {{ games.length }} {{ $t('common.gameCountUnit') }}</p>
              <p v-if="syncedAt" class="text-xs opacity-50 mt-0.5">{{ $t('steamImporter.lastRefreshed') }} {{ new Date(syncedAt).toLocaleString(formatLocale) }}</p>
            </div>
          </div>
          <div class="flex flex-wrap gap-2 shrink-0">
            <button v-if="!games.length" class="btn btn-sm" :disabled="!!busy" @click="refreshLibrary">{{ $t('steamImporter.refreshFromSteam') }}</button>
            <button class="btn btn-sm btn-error btn-outline" :disabled="!!busy" @click="disconnect">{{ $t('common.disconnect') }}</button>
          </div>
        </div>
        <template v-else>
          <h2 class="font-semibold">{{ $t('steamImporter.connectYourSteamAccount') }}</h2>
          <p class="text-sm text-base-content/60">{{ $t('steamImporter.importGamesPlaytimeAndAchievements') }}</p>
          <button class="btn btn-primary w-fit gap-1.5" @click="openWizard">{{ $t('steamImporter.connectSteamAccount') }}</button>
          <p class="text-xs opacity-50">{{ $t('steamImporter.enterTheNameFromYour') }}</p>
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
      :busy="!!busy" :refresh-label="$t('steamImporter.refreshFromSteam')" metadata-required
      :progress="progress" :done="done" :total="total"
      @resolve="resolveGame" @poster="setPoster" @select="selectGame" @refresh="refreshLibrary" @import="saveSelected(false)" @sync="saveSelected(true)"
    />
    <p v-else-if="profile && !busy" class="alert">{{ $t('steamImporter.yourSteamLibraryIsEmpty') }}</p>

    <dialog ref="wizardDialog" class="modal" aria-labelledby="steam-wizard-title" @close="wizardOpen = false" @cancel="cancelWizard">
      <form class="modal-box max-w-lg space-y-4" @submit.prevent="connect">
        <h3 id="steam-wizard-title" class="font-bold text-xl">{{ $t('steamImporter.connectSteamAccount') }}</h3>
        <ol class="space-y-4">
          <li class="flex gap-3"><span class="shrink-0 w-7 h-7 rounded-full bg-primary text-primary-content font-bold text-sm flex items-center justify-center">1</span><div class="text-sm pt-1">{{ $t('common.open') }} <a href="https://steamcommunity.com/my/" target="_blank" rel="noopener noreferrer" class="link link-primary">{{ $t('steamImporter.yourSteamProfile') }}</a>{{ $t('steamImporter.ifSteamAsksSignIn') }}</div></li>
          <li class="flex gap-3"><span class="shrink-0 w-7 h-7 rounded-full bg-primary text-primary-content font-bold text-sm flex items-center justify-center">2</span><div class="text-sm pt-1 space-y-1"><p>{{ $t('steamImporter.copyTheProfileLinkOr') }} <code>/id/</code>.</p><p class="opacity-60">{{ $t('steamImporter.forExampleFor') }} <code class="break-all">steamcommunity.com/id/CatWarrior99/</code> {{ $t('steamImporter.enter') }} <strong>CatWarrior99</strong>{{ $t('steamImporter.theNumberFromThisLink') }} <code>/profiles/</code>.</p><p class="opacity-60">{{ $t('steamImporter.yourSignInNameAnd') }}</p></div></li>
          <li class="flex gap-3"><span class="shrink-0 w-7 h-7 rounded-full bg-primary text-primary-content font-bold text-sm flex items-center justify-center">3</span><div class="text-sm pt-1">{{ $t('steamImporter.in') }} <a href="https://steamcommunity.com/my/edit/settings" target="_blank" rel="noopener noreferrer" class="link link-primary">{{ $t('steamImporter.privacySettings') }}</a> {{ $t('steamImporter.setYourProfileAndGame') }} <strong>{{ $t('steamImporter.public') }}</strong>{{ $t('steamImporter.toShareYourPlaytimeTurn') }}</div></li>
        </ol>
        <label class="block space-y-1"><span class="text-sm font-medium">{{ $t('steamImporter.steamNameFromLinkOr') }}</span><input v-model="profileInput" class="input input-bordered w-full" :placeholder="$t('steamImporter.profileExample')" :disabled="!!busy" required maxlength="256" autocomplete="off" /></label>
        <div v-if="errorMessage && wizardOpen" role="alert" class="alert alert-error text-sm"><span>{{ errorMessage }}</span></div>
        <div class="modal-action"><button type="button" class="btn btn-ghost" :disabled="!!busy" @click="closeWizard">{{ $t('common.cancel') }}</button><button type="submit" class="btn btn-primary gap-1" :disabled="!!busy || !profileInput.trim()"><span v-if="busy" class="loading loading-spinner loading-sm"></span>{{ $t('steamImporter.loadSteamGames') }}</button></div>
      </form>
    </dialog>
  </div>
</template>

<script setup>
import { formatLocale, t } from '../i18n/index.js';
import { ref, computed, watch, onBeforeUnmount } from 'vue';
import ImporterGameList from './ImporterGameList.vue';
import { useUserStore } from '../stores/user';
import { supabase } from '../supabase';
import { useGamesApi } from '../services/gamesApi';
import { GAME_STATUS } from '../constants/gameStatus';
import { fetchSteamLibrary, fetchSteamAchievements, loadSteamSnapshot, saveSteamSnapshot, clearSteamSnapshot } from '../services/steamService';
import { loadSteamLibraryRows, buildSteamPatch, buildSteamRow } from '../services/steamImport';
import { fetchUserRows } from '../services/libraryData';
import { invalidateGames } from '../services/libraryCache.js';
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
  progressLabel: t('steamImporter.achievements'), progressValue: game.achievements?.earned,
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
  if (minutes == null) return t('steamImporter.playtimeHidden');
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
}

function showError(error) {
  if (error.name === 'AbortError') return;
  errorMessage.value = error.message || t('steamImporter.steamImportFailedTryAgain');
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
  if (userStore.user?.id !== currentUserId) throw new DOMException(t('steamImporter.canceled'), 'AbortError');
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
  progress.value = t('steamImporter.fetchingSteamLibrary');
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
    notice.value = t('steamImporter.loadedGamesChooseGamesTo', [games.value.length]);
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
  notice.value = t('steamImporter.steamProfileDisconnected');
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
        if (match.row && targets.has(match.row.id)) {
          if (!signal.aborted) errorMessage.value = t('steamImporter.chooseOnlyOneSourceOf');
          return;
        }
        if (match.row) targets.add(match.row.id);
      }
    }
    for (const game of toSave) {
      checkActive(signal);
      progress.value = `${existing ? t('steamImporter.syncing') : t('steamImporter.importing')}: ${game.name} (${done.value + 1}/${total.value})`;
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
        if (error.name === 'AbortError' || error.status === 401 || error.status === 429) {
          if (!signal.aborted) showError(error);
          return;
        }
      }
      if (!achievements) unavailable++;
      checkActive(signal);
      if (existing) {
        const patch = buildSteamPatch(game, achievements);
        patch.website_url = `https://store.steampowered.com/app/${game.appId}/`;
        const { data, error } = await supabase.from('games').update(patch)
          .eq('user_id', currentUserId).eq('id', match.row.id).eq('platform', match.row.platform).select('id').abortSignal(signal);
        if (error) {
          if (!signal.aborted) showError(error);
          return;
        }
        invalidateGames(currentUserId);
        if (!data?.length) {
          if (!signal.aborted) errorMessage.value = t('steamImporter.theGameIsNoLonger');
          return;
        }
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
        if (error) {
          if (!signal.aborted) showError(error);
          return;
        }
        invalidateGames(currentUserId);
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
      notice.value = t('steamImporter.selectedGamesProgress', [existing ? t('steamImporter.synced') : t('steamImporter.imported'), saved, toSave.length]);
      const warnings = [];
      if (unresolved.length) warnings.push(t('steamImporter.chooseAnExistingGameOr', [unresolved.join(', ')]));
      if (missingMetadata.length) warnings.push(t('common.gamesWithoutAConfirmedMatch', [missingMetadata.join(', ')]));
      if (unavailable) warnings.push(t('steamImporter.achievementsArentAvailableForGames', [unavailable]));
      if (groupFailures) warnings.push(t('steamImporter.gamesWereImportedWithoutA', [groupFailures]));
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
  progress.value = t('steamImporter.checkingGamesInYourCollection');
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
