<template>
  <button type="button" class="btn btn-sm btn-outline gap-2" @click="open">
    <svg class="size-4 shrink-0" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4.333 16.048L16.57 3.81a2.56 2.56 0 0 1 3.62 3.619L7.951 19.667a2 2 0 0 1-1.022.547L3 21l.786-3.93a2 2 0 0 1 .547-1.022"/><path d="m14.5 6.5l3 3"/></g></svg>
    <span>Uredi info</span>
  </button>
  <Teleport to="body">
    <dialog ref="dialog" class="modal" :aria-labelledby="titleId" @cancel="preventBusyClose" @close="invalidateRequests">
      <div class="modal-box max-w-lg">
        <div class="flex items-start justify-between gap-3 mb-5">
          <h2 :id="titleId" class="text-xl font-bold">Uredi info</h2>
          <button type="button" class="btn btn-sm btn-circle btn-ghost shrink-0" aria-label="Zatvori uređivanje informacija" :disabled="busy" @click="dialog.close()">✕</button>
        </div>
        <section :aria-labelledby="`${titleId}-avatar`">
          <h3 :id="`${titleId}-avatar`" class="font-semibold">Profilna slika</h3>
          <p class="text-sm opacity-65 mt-1">Unesi izravnu poveznicu ili odaberi sliku s uređaja.</p>
          <form class="space-y-3 mt-4" @submit.prevent="saveAvatar">
            <p v-if="avatarError" role="alert" class="alert alert-error text-sm">{{ avatarError }}</p>
            <p v-if="avatarMessage" role="status" class="text-sm text-success">{{ avatarMessage }}</p>
            <label class="block"><span class="block text-sm mb-1">Izravna poveznica na sliku</span><input v-model="avatarDraft" aria-label="Izravna poveznica na sliku" type="url" class="input input-bordered w-full" placeholder="https://example.com/slika.jpg" maxlength="2048" :disabled="busy" /></label>
            <div v-if="previewUrl" class="flex justify-center"><img :src="previewFailed ? '/apple-touch-icon.png' : previewUrl" alt="Pregled profilne slike" class="size-20 rounded-full object-cover ring-2 ring-primary" @error="previewFailed = true" /></div>
            <label class="block"><span class="block text-sm mb-1">Odaberi sliku s uređaja</span><input aria-label="Odaberi sliku s uređaja" type="file" accept="image/png,image/jpeg,image/gif,image/webp" class="file-input file-input-bordered w-full" :disabled="busy" @change="upload" /><span class="block text-xs opacity-60 mt-1">Maksimalno 3 MB (JPG, PNG, GIF, WebP)</span></label>
            <p v-if="uploading" role="status" class="text-sm">Prenosim sliku…</p>
            <div class="flex justify-end"><button class="btn btn-sm btn-primary" :disabled="busy || !avatarDraft.trim() || avatarDraft.trim() === originalAvatar">{{ savingAvatar ? 'Spremam…' : 'Spremi sliku' }}</button></div>
          </form>
        </section>
        <section class="border-t border-base-content/10 mt-6 pt-5" :aria-labelledby="`${titleId}-username`">
          <h3 :id="`${titleId}-username`" class="font-semibold">Korisničko ime</h3>
          <p class="text-sm opacity-65 mt-1">Ime za tvoju Gamenote poveznicu.</p>
          <p v-if="loadingUsername" role="status" class="py-4">Učitavam korisničko ime…</p>
          <form v-else class="space-y-3 mt-4" @submit.prevent="saveUsername">
            <p v-if="usernameErrorMessage" role="alert" class="alert alert-error text-sm">{{ usernameErrorMessage }}</p>
            <p v-if="usernameMessage" role="status" class="text-sm text-success">{{ usernameMessage }}</p>
            <p v-if="originalUsername" class="text-sm">Trenutačno ime: <strong>@{{ originalUsername }}</strong></p>
            <label class="block"><span class="block text-sm mb-1">Korisničko ime</span><input v-model="username" aria-label="Korisničko ime" class="input input-bordered w-full" maxlength="30" autocomplete="off" :disabled="busy || failedLoad" /><span class="text-xs opacity-60">3–30 znakova: a–z, brojevi, crtica ili podvlaka.</span></label>
            <p v-if="originalUsername && normalized !== originalUsername" class="text-sm text-warning">Promjenom imena stara poveznica prestaje raditi.</p>
            <p v-if="availability !== null" role="status" class="text-sm" :class="availability ? 'text-success' : 'text-error'">{{ availability ? normalized === originalUsername ? 'Ovo je tvoje korisničko ime.' : 'Korisničko ime je dostupno.' : 'Korisničko ime je zauzeto.' }}</p>
            <div class="flex flex-wrap justify-end gap-2">
              <button v-if="failedLoad" type="button" class="btn btn-sm" :disabled="busy" @click="loadUsername">Pokušaj ponovno</button>
              <button type="button" class="btn btn-sm btn-outline" :disabled="checking || busy || failedLoad" @click="checkUsername">{{ checking ? 'Provjeravam…' : 'Provjeri dostupnost' }}</button>
              <button class="btn btn-sm btn-primary" :disabled="busy || checking || !availability || checkedName !== normalized || normalized === originalUsername">{{ savingUsername ? 'Spremam…' : 'Spremi korisničko ime' }}</button>
            </div>
          </form>
        </section>
      </div>
      <form method="dialog" class="modal-backdrop"><button :disabled="busy">Zatvori</button></form>
    </dialog>
  </Teleport>
</template>
<script setup>
import { computed, onUnmounted, ref, useId, watch } from 'vue';
import { useUserStore } from '../stores/user.js';
import { supabase } from '../supabase.js';
import { requestAppApi } from '../services/appApi.js';
import { normalizeAvatarUrl } from '../services/profileAvatar.js';
import { loadShareSettings, checkUsernameAvailability, saveLibraryUsername } from '../services/libraryShare.js';
import { normalizeUsername, usernameError } from '../constants/libraryShare.js';
const props = defineProps({ avatarUrl: { type: String, default: '' } });
const emit = defineEmits(['avatar-saved']);
const userStore = useUserStore();
const titleId = useId();
const dialog = ref(null);
const avatarDraft = ref('');
const originalAvatar = ref('');
const uploadedUrl = ref('');
const avatarError = ref('');
const avatarMessage = ref('');
const previewFailed = ref(false);
const uploading = ref(false);
const savingAvatar = ref(false);
const username = ref('');
const originalUsername = ref('');
const checkedName = ref('');
const availability = ref(null);
const loadingUsername = ref(false);
const failedLoad = ref(false);
const checking = ref(false);
const savingUsername = ref(false);
const usernameErrorMessage = ref('');
const usernameMessage = ref('');
const busy = computed(() => uploading.value || savingAvatar.value || savingUsername.value);
const normalized = computed(() => normalizeUsername(username.value));
const previewUrl = computed(() => { try { return normalizeAvatarUrl(avatarDraft.value); } catch { return ''; } });
let revision = 0;
let checkRevision = 0;
function open() {
  if (!userStore.user?.id) return;
  revision++;
  avatarDraft.value = originalAvatar.value = props.avatarUrl;
  uploadedUrl.value = ''; avatarError.value = ''; avatarMessage.value = ''; previewFailed.value = false;
  usernameMessage.value = ''; availability.value = null;
  if (!dialog.value.open) dialog.value.showModal();
  loadUsername();
}
async function loadUsername() {
  const current = revision;
  checkRevision++; checking.value = false;
  loadingUsername.value = true; failedLoad.value = false; usernameErrorMessage.value = '';
  try {
    const data = await loadShareSettings(userStore.user.id);
    if (current === revision) username.value = originalUsername.value = data.username || '';
  } catch (failure) {
    if (current === revision) { failedLoad.value = true; usernameErrorMessage.value = failure.message; }
  } finally { if (current === revision) loadingUsername.value = false; }
}
async function sessionFor(ownerId) {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session || data.session.user.id !== ownerId) throw new Error('Prijavi se ponovno.');
  return data.session;
}
async function upload(event) {
  const file = event.target.files?.[0];
  if (!file || busy.value) return;
  avatarError.value = ''; avatarMessage.value = '';
  if (file.size > 3 * 1024 * 1024) { avatarError.value = 'Slika je prevelika. Maksimalno 3 MB.'; event.target.value = ''; return; }
  if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) { avatarError.value = 'Odaberi JPG, PNG, GIF ili WebP sliku.'; event.target.value = ''; return; }
  const current = revision;
  const ownerId = userStore.user?.id;
  uploading.value = true;
  try {
    const session = await sessionFor(ownerId);
    const image = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(',')[1]);
      reader.onerror = () => reject(new Error('Sliku nije moguće pročitati.'));
      reader.readAsDataURL(file);
    });
    if (current !== revision || userStore.user?.id !== ownerId) return;
    const data = await requestAppApi({ action: 'avatar', image }, { token: session.access_token });
    if (current !== revision || userStore.user?.id !== ownerId) return;
    avatarDraft.value = uploadedUrl.value = normalizeAvatarUrl(data.url);
    avatarMessage.value = 'Slika je prenesena. Spremi je za svoj profil.';
  } catch (failure) { if (current === revision) avatarError.value = failure.message || 'Sliku nije moguće prenijeti. Pokušaj ponovno.'; }
  finally { if (current === revision) uploading.value = false; event.target.value = ''; }
}
// noinspection ExceptionCaughtLocallyJS
async function saveAvatar() {
  if (busy.value || !userStore.user?.id) return;
  const current = revision;
  const ownerId = userStore.user.id;
  savingAvatar.value = true; avatarError.value = ''; avatarMessage.value = '';
  try {
    const url = normalizeAvatarUrl(avatarDraft.value);
    const session = await sessionFor(ownerId);
    if (url !== uploadedUrl.value) await requestAppApi({ action: 'avatar-image', url }, { token: session.access_token });
    if (current !== revision || userStore.user?.id !== ownerId) return;
    const { error } = await supabase.auth.updateUser({ data: { avatar_url: url } });
    if (error) throw new Error('Profilnu sliku nije moguće spremiti. Pokušaj ponovno.');
    if (current !== revision || userStore.user?.id !== ownerId) return;
    originalAvatar.value = url;
    emit('avatar-saved', url);
    await userStore.fetchUser();
    if (current === revision) avatarMessage.value = 'Profilna slika je spremljena.';
  } catch (failure) { if (current === revision) avatarError.value = failure.message || 'Profilnu sliku nije moguće spremiti. Pokušaj ponovno.'; }
  finally { if (current === revision) savingAvatar.value = false; }
}
async function checkUsername() {
  if (busy.value || checking.value || failedLoad.value) return;
  usernameErrorMessage.value = usernameError(normalized.value); usernameMessage.value = '';
  if (usernameErrorMessage.value) return;
  const current = ++checkRevision;
  const owner = revision;
  const candidate = normalized.value;
  checking.value = true; availability.value = null;
  try {
    const available = await checkUsernameAvailability(candidate);
    if (owner === revision && current === checkRevision) { availability.value = available; checkedName.value = candidate; }
  } catch (failure) { if (owner === revision && current === checkRevision) usernameErrorMessage.value = failure.message; }
  finally { if (current === checkRevision) checking.value = false; }
}
async function saveUsername() {
  if (busy.value || checking.value || !availability.value || checkedName.value !== normalized.value || normalized.value === originalUsername.value) return;
  const current = revision;
  savingUsername.value = true; usernameErrorMessage.value = ''; usernameMessage.value = '';
  try {
    const data = await saveLibraryUsername(normalized.value);
    if (current === revision) { username.value = originalUsername.value = data.username; availability.value = null; checkedName.value = ''; usernameMessage.value = 'Korisničko ime je spremljeno.'; }
  } catch (failure) { if (current === revision) { usernameErrorMessage.value = failure.message; availability.value = null; } }
  finally { if (current === revision) savingUsername.value = false; }
}
function preventBusyClose(event) { if (busy.value) event.preventDefault(); }
function invalidateRequests() { revision++; checkRevision++; checking.value = false; loadingUsername.value = false; }
watch(avatarDraft, () => { previewFailed.value = false; avatarError.value = ''; avatarMessage.value = ''; }, { flush: 'sync' });
watch(username, () => { checkRevision++; checking.value = false; availability.value = null; checkedName.value = ''; usernameMessage.value = ''; usernameErrorMessage.value = ''; }, { flush: 'sync' });
watch(() => userStore.user?.id, () => { invalidateRequests(); uploading.value = false; savingAvatar.value = false; savingUsername.value = false; dialog.value?.close(); });
onUnmounted(invalidateRequests);
</script>
