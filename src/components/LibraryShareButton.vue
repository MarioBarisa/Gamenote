<template>
  <button type="button" class="library-share-trigger btn btn-sm btn-primary gap-2 shadow-sm" @click="open">
    <svg v-if="settings" class="size-4 shrink-0" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M12.004 21c-.732.002-1.466-.437-1.679-1.317a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37c1 .608 2.296.07 2.572-1.065c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.306.317 1.64 1.78 1.004 2.684"/><path d="M12 15a3 3 0 1 0 0-6a3 3 0 0 0 0 6m4 7l5-5m0 4.5V17h-4.5"/></g></svg>
    <svg v-else class="size-4 shrink-0" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 10H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-1m-2-4l-3-3l-3 3m3-3v10"/></svg>
    <span>{{ $t('libraryShareButton.shareGamenote') }}</span>
  </button>
  <Teleport to="body">
  <dialog ref="dialog" class="modal" :aria-labelledby="titleId" @close="reset">
    <div class="modal-box max-w-lg">
      <div class="flex items-start justify-between gap-3">
        <div><h2 :id="titleId" class="text-xl font-bold">{{ $t('libraryShareButton.gamenoteSharing') }}</h2><p class="text-sm opacity-65 mt-1">{{ $t('libraryShareButton.chooseWhatVisitorsCanSee') }}</p></div>
        <button type="button" class="btn btn-sm btn-circle btn-ghost shrink-0" :aria-label="$t('libraryShareButton.closeGamenoteSharing')" :disabled="saving" @click="dialog.close()">✕</button>
      </div>
      <p v-if="loading" role="status" class="py-6">{{ $t('libraryShareButton.loadingSettings') }}</p>
      <form v-else @submit.prevent="save" class="space-y-4 mt-5">
        <div v-if="error" role="alert" class="alert alert-error text-sm">{{ error }}</div>
        <p v-if="saved" role="status" class="text-sm text-success">{{ $t('libraryShareButton.settingsSaved') }}</p>
        <label v-if="!originalUsername" class="block space-y-1">
          <span class="block font-medium text-sm">{{ $t('libraryShareButton.publicUsername') }}</span>
          <input v-model="username" :aria-label="$t('libraryShareButton.publicUsername')" class="input input-bordered w-full" autocomplete="off" maxlength="30" :placeholder="$t('libraryShareButton.chooseANameForYour')" :disabled="saving || failedLoad" @input="saved = false" />
          <span class="block text-xs opacity-60">{{ $t('common.value330CharactersA') }}</span>
        </label>
        <fieldset class="space-y-2" :disabled="saving || failedLoad">
          <legend class="sr-only">{{ $t('libraryShareButton.whatDoYouWantTo') }}</legend>
          <label v-for="option in SHARE_SCOPES" :key="option.key" class="flex items-start gap-3 rounded-box border p-3 cursor-pointer transition-colors" :class="scope === option.key ? 'border-primary bg-primary/5' : 'border-base-content/15 hover:bg-base-200'">
            <input v-model="scope" type="radio" :name="titleId" :value="option.key" :aria-labelledby="titleId + '-' + option.key" class="radio radio-sm radio-primary mt-0.5" @change="saved = false" />
            <span class="block flex-1 min-w-0">
              <span :id="titleId + '-' + option.key" class="block font-semibold text-sm">{{ $t(option.labelKey) }}</span>
              <span class="block text-xs opacity-65 mt-1">{{ $t(option.descriptionKey) }}</span>
              <span class="grid grid-cols-3 gap-2 mt-3">
                <span v-for="category in categories" :key="category.key" class="flex flex-col items-center gap-1 text-xs sm:flex-row" :class="included(option.key, category.key) ? 'text-base-content' : 'text-base-content/45'">
                  <span class="flex items-center gap-1"><CollectionNavIcon :name="category.key" class="size-4 shrink-0" /><span>{{ category.label }}</span></span>
                  <svg class="size-3.5 shrink-0 sm:ml-auto" :class="included(option.key, category.key) ? 'text-success' : 'opacity-60'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path :d="included(option.key, category.key) ? 'M5 12l4 4L19 6' : 'M6 6l12 12M18 6L6 18'" /></svg>
                </span>
              </span>
            </span>
          </label>
        </fieldset>
        <p class="text-xs opacity-60">{{ $t('libraryShareButton.anyoneWithTheLinkCan') }}</p>
        <code v-if="canShare" class="share-link block bg-base-300 px-3 py-2 rounded text-xs sm:text-sm break-all" :aria-label="$t('libraryShareButton.gamenoteLink')">{{ link }}</code>
        <p v-else-if="scope !== 'none'" class="text-xs opacity-60">{{ $t('libraryShareButton.saveYourSelectionToShow') }}</p>
        <div class="library-share-actions flex items-center gap-2 border-t border-base-content/10 pt-4">
          <button v-if="canShare" type="button" class="btn btn-sm btn-outline shrink-0" :aria-label="$t('common.copyLink')" :title="$t('common.copyLink')" @click="copy">
            <svg class="size-5 shrink-0" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M8 4v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7.242a2 2 0 0 0-.602-1.43L16.083 2.57A2 2 0 0 0 14.685 2H10a2 2 0 0 0-2 2"/><path d="M16 18v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h2"/></g></svg>
            <span class="hidden sm:inline">{{ $t('common.copyLink') }}</span>
          </button>
          <a v-if="canShare" class="btn btn-sm btn-ghost shrink-0" :href="link" target="_blank" rel="noopener" :aria-label="$t('common.openPreview')" :title="$t('common.openPreview')">
            <svg class="size-5 shrink-0" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path d="M10.586 10.586L16.95 7.05l-3.536 6.364m-2.828-2.828L7.05 16.95l6.364-3.536m-2.828-2.828l2.828 2.828"/><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2S2 6.477 2 12s4.477 10 10 10m7-10h-1M6 12H5m7-7v1m0 12v1M7.05 7.05l.707.707m8.486 8.486l.707.707"/></g></svg>
            <span class="hidden sm:inline">{{ $t('common.openPreview') }}</span>
          </a>
          <button v-if="failedLoad" type="button" class="btn btn-sm" @click="open">{{ $t('common.tryAgain') }}</button>
          <button type="submit" class="btn btn-sm btn-primary min-w-24 ml-auto" :disabled="saving || failedLoad">{{ saving ? $t('common.saving') : $t('common.save') }}</button>
        </div>
        <p v-if="copied" role="status" class="text-sm text-success">{{ $t('common.linkCopied') }}</p>
      </form>
    </div>
    <form method="dialog" class="modal-backdrop"><button :disabled="saving">{{ $t('common.close') }}</button></form>
  </dialog>
  </Teleport>
</template>
<script setup>
import { t } from '../i18n/index.js';
import CollectionNavIcon from './CollectionNavIcon.vue';
import { computed, ref, useId, watch } from 'vue';
import { useUserStore } from '../stores/user.js';
import { loadShareSettings, saveShareSettings } from '../services/libraryShare.js';
import { SHARE_SCOPES, normalizeUsername, usernameError } from '../constants/libraryShare.js';
defineProps({ settings: Boolean });
const categories = [{ key: 'games', label: t('common.games') }, { key: 'groups', label: t('common.groups') }, { key: 'stats', label: 'Stats' }];
function included(scope, category) { return scope === 'all' || (scope === 'library' && category !== 'stats'); }
const userStore = useUserStore();
const titleId = useId();
const dialog = ref(null);
const username = ref('');
const scope = ref('none');
const originalUsername = ref('');
const originalScope = ref('none');
const loading = ref(false);
const saving = ref(false);
const failedLoad = ref(false);
const error = ref('');
const saved = ref(false);
const copied = ref(false);
const normalized = computed(() => normalizeUsername(username.value));
const canShare = computed(() => !loading.value && !saving.value && !failedLoad.value && originalScope.value !== 'none' && scope.value === originalScope.value && normalized.value === originalUsername.value);
const link = computed(() => `https://gamenote.eu/${originalUsername.value}`);
let revision = 0;
function reset() { copied.value = false; saved.value = false; }
async function open() {
  const current = ++revision;
  const userId = userStore.user?.id;
  if (!userId) return;
  if (!dialog.value.open) dialog.value.showModal();
  reset(); loading.value = true; failedLoad.value = false; error.value = '';
  try {
    const data = await loadShareSettings(userId);
    if (current !== revision) return;
    username.value = originalUsername.value = data.username || '';
    scope.value = originalScope.value = data.share_scope;
  } catch (failure) {
    if (current === revision) { error.value = failure.message; failedLoad.value = true; }
  } finally { if (current === revision) loading.value = false; }
}
async function save() {
  error.value = ''; copied.value = false; saved.value = false;
  if (normalized.value || scope.value !== 'none') error.value = usernameError(normalized.value);
  if (error.value) return;
  const current = revision;
  saving.value = true;
  try {
    const data = await saveShareSettings(originalUsername.value ? null : normalized.value, scope.value);
    if (current !== revision) return;
    username.value = originalUsername.value = data.username || '';
    scope.value = originalScope.value = data.share_scope;
    saved.value = true;
  } catch (failure) { if (current === revision) error.value = failure.message; }
  finally { saving.value = false; }
}
async function copy() {
  try { await navigator.clipboard.writeText(link.value); copied.value = true; }
  catch { error.value = t('libraryShareButton.couldntCopyTheLinkSelect'); }
}
watch(() => userStore.user?.id, () => { revision++; dialog.value?.close(); });
</script>
