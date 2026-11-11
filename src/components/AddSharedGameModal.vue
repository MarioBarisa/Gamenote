<template>
  <dialog ref="dialog" class="modal" aria-labelledby="add-shared-title" @cancel="preventSavingClose">
    <div class="modal-box max-w-2xl">
      <div class="flex items-start justify-between gap-3"><h2 id="add-shared-title" class="text-xl font-bold">Dodaj u Gamenote</h2><button type="button" class="btn btn-sm btn-circle btn-ghost shrink-0" aria-label="Zatvori dodavanje igre" :disabled="saving" @click="dialog.close()">✕</button></div>
      <p class="text-sm opacity-70 mt-2">Dodaješ svoj unos. Sati, ocjene i napredak vlasnika zbirke ne kopiraju se.</p>
      <form class="grid sm:grid-cols-2 gap-4 mt-5" @submit.prevent="save">
        <p v-if="error" role="alert" class="alert alert-error sm:col-span-2">{{ error }}</p>
        <p v-if="success" role="status" class="alert alert-success sm:col-span-2">{{ success }}</p>
        <label class="sm:col-span-2">Naziv<input v-model="form.title" class="input input-bordered w-full" required :disabled="saving || added" /></label>
        <label>Platforma<input v-model="form.platform" class="input input-bordered w-full" list="shared-platforms" required :disabled="saving || added" /></label>
        <datalist id="shared-platforms"><option v-for="platform in platforms" :key="platform">{{ platform }}</option></datalist>
        <label>Status<select aria-label="Status" v-model="form.status" class="select select-bordered w-full" :disabled="saving || added"><option v-for="status in GAME_STATUS" :key="status.key" :value="status.key">{{ status.label }}</option></select></label>
        <label>Ocjena<select aria-label="Ocjena" v-model.number="form.rating" class="select select-bordered w-full" :disabled="saving || added"><option :value="0">Bez ocjene</option><option v-for="star in 5" :key="star" :value="star">{{ star }}/5</option></select></label>
        <label>Sati igranja<input v-model="form.play_time" type="number" min="0" step="1" class="input input-bordered w-full" :disabled="saving || added" /></label>
        <label>Početak igranja<input v-model="form.start_date" type="date" class="input input-bordered w-full" :disabled="saving || added" /></label>
        <label>Završetak igranja<input v-model="form.end_date" type="date" class="input input-bordered w-full" :disabled="saving || added" /></label>
        <label class="sm:col-span-2">Osobna bilješka<textarea v-model="form.notes" maxlength="10000" class="textarea textarea-bordered w-full" :disabled="saving || added"></textarea></label>
        <fieldset v-if="groups.length" class="sm:col-span-2" :disabled="saving || added"><legend class="mb-2">Dodaj u grupe</legend><label v-for="group in groups" :key="group.id" class="flex items-center gap-2 py-1"><input v-model="form.group_ids" type="checkbox" :value="group.id" class="checkbox checkbox-sm" />{{ group.name }}</label></fieldset>
        <div class="sm:col-span-2 flex justify-end gap-2"><button v-if="!added" class="btn btn-primary" :disabled="saving">{{ saving ? 'Spremam…' : 'Dodaj u Gamenote' }}</button></div>
      </form>
    </div>
    <form method="dialog" class="modal-backdrop"><button :disabled="saving">Zatvori</button></form>
  </dialog>
</template>
<script setup>
import { onUnmounted, reactive, ref, watch } from 'vue';
import { supabase } from '../supabase.js';
import { useUserStore } from '../stores/user.js';
import { createGameForm, buildGameUpdate, progressModeForPlatform } from '../services/gameForm.js';
import { listGroups, addGameToGroup } from '../services/groupsApi.js';
import { PROGRESS_MODE_MAP } from '../constants/progressModes.js';
import { GAME_STATUS } from '../constants/gameStatus.js';
const userStore = useUserStore();
const emit = defineEmits(['added']);
const dialog = ref(null);
const form = reactive(createGameForm());
const groups = ref([]);
const source = ref(null);
const saving = ref(false);
const added = ref(false);
const error = ref('');
const success = ref('');
const platforms = ['PC', 'PlayStation 5', 'PlayStation 4', 'Xbox Series X/S', 'Xbox One', 'Nintendo Switch', 'Nintendo Switch 2', 'iOS', 'Android', 'Other'];
let revision = 0;
async function open(game) {
  if (!userStore.user?.id) return;
  const current = ++revision;
  source.value = game;
  Object.assign(form, createGameForm({ title: game.title, platform: game.platform, genre: game.genre, publisher: game.publisher, status: 'backlog' }));
  added.value = false; error.value = ''; success.value = ''; groups.value = [];
  dialog.value.showModal();
  try {
    const result = await listGroups(userStore.user.id);
    if (current === revision) groups.value = result;
  } catch { if (current === revision) error.value = 'Grupe nije moguće učitati. Igru možeš dodati bez grupe.'; }
}
// noinspection ExceptionCaughtLocallyJS
async function save() {
  if (saving.value || added.value || !userStore.user?.id) return;
  const ownerId = userStore.user.id;
  const current = revision;
  saving.value = true; error.value = '';
  try {
    form.progress_mode = progressModeForPlatform(form.platform);
    form.progress_unit = PROGRESS_MODE_MAP[form.progress_mode].defaultUnit;
    const payload = { ...buildGameUpdate(form), user_id: ownerId };
    for (const key of ['game_api_id', 'image_url', 'background_image', 'description', 'metacritic_score', 'esrb_rating', 'release_date', 'website_url', 'developers', 'genres_list', 'platforms_list', 'publishers_list', 'screenshot_urls', 'series_games']) payload[key] = source.value[key] ?? null;
    if (current !== revision || userStore.user?.id !== ownerId) return;
    const { data, error: failure } = await supabase.from('games').insert([payload]).select('id').single();
    if (failure) throw failure;
    if (current !== revision || userStore.user?.id !== ownerId) return;
    added.value = true;
    emit('added', { id: data.id, source: source.value });
    let failedGroups = false;
    for (const groupId of form.group_ids) {
      if (current !== revision || userStore.user?.id !== ownerId) return;
      try { await addGameToGroup({ user_id: ownerId, game_id: data.id, group_id: groupId }); }
      catch { failedGroups = true; }
    }
    success.value = failedGroups ? 'Igra je dodana. Neke grupe nisu spremljene; možeš ih urediti u svojoj biblioteci.' : 'Igra je dodana u tvoju biblioteku.';
  } catch (failure) { if (current === revision) error.value = failure.code ? 'Igru nije moguće spremiti. Pokušaj ponovno.' : failure.message || 'Igru nije moguće spremiti. Pokušaj ponovno.'; }
  finally { if (current === revision) saving.value = false; }
}
function preventSavingClose(event) { if (saving.value) event.preventDefault(); }
watch(() => userStore.user?.id, () => { revision++; saving.value = false; dialog.value?.close(); });
onUnmounted(() => { revision++; });
defineExpose({ open });
</script>
