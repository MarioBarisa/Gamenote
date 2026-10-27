<template>
  <div class="space-y-4" data-testid="importer-game-list">
    <div class="card bg-base-200 shadow">
      <div class="card-body p-3 space-y-3">
        <div class="flex flex-wrap gap-2 items-center">
          <span class="badge badge-sm sm:badge-lg badge-ghost font-bold">{{ games.length }} igara</span>
          <span class="badge badge-sm sm:badge-lg badge-success badge-outline">{{ newCount }} novih</span>
          <span class="badge badge-sm sm:badge-lg badge-info badge-outline">{{ existingCount }} postoji</span>
          <button type="button" class="btn btn-circle btn-ghost btn-xs ml-auto" aria-label="Informacije o importeru" title="Informacije o importeru" @click="infoDialog.showModal()"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-5 w-5" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path stroke-linecap="round" d="M12 11v6m0-10v.01" /></svg></button>
        </div>
        <input v-model="filter" type="search" class="input input-sm input-bordered w-full" placeholder="Pretraži igre..." aria-label="Pretraži igre" />
        <div class="flex flex-wrap gap-1 sm:gap-2 items-center">
          <div class="flex flex-wrap gap-1">
            <button class="btn btn-xs btn-ghost gap-1" :disabled="busy" @click="selectAll(false, true)">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
              Sve nove
            </button>
            <button class="btn btn-xs btn-ghost gap-1" :disabled="busy" @click="selectAll(false, false)">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
              Poništi nove
            </button>
            <button class="btn btn-xs btn-ghost gap-1" :disabled="busy" @click="selectAll(true, true)">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 shrink-0 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              Sve postojeće
            </button>
            <button class="btn btn-xs btn-ghost gap-1" :disabled="busy" @click="selectAll(true, false)">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
              Poništi postojeće
            </button>
          </div>
          <div class="ml-auto flex flex-wrap w-full sm:w-auto gap-1 sm:gap-2">
            <button class="btn btn-xs sm:btn-sm flex-1 sm:flex-none gap-1" :disabled="busy" @click="$emit('refresh')"><Icon icon="mdi:refresh" class="h-4 w-4" />{{ refreshLabel }}</button>
            <button class="btn btn-xs sm:btn-sm btn-info flex-1 sm:flex-none" :disabled="busy || !ready || !selectedExistingCount" @click="$emit('sync')">Sinkroniziraj ({{ selectedExistingCount }})</button>
            <button class="btn btn-xs sm:btn-sm btn-success flex-1 sm:flex-none" :disabled="busy || !ready || !selectedNewCount" @click="$emit('import')">Uvezi nove ({{ selectedNewCount }})</button>
          </div>
        </div>
        <label v-if="!metadataRequired" class="flex items-center gap-2 text-xs sm:text-sm">
          <input type="checkbox" class="checkbox checkbox-sm" :checked="enrichMetadata" :disabled="busy" @change="$emit('update:enrichMetadata', $event.target.checked)" />
          Dodaj opise i metapodatke pronađenih igara
        </label>
        <div v-if="busy && progress" role="status" class="space-y-1">
          <div class="flex justify-between gap-2 text-xs opacity-60"><span>{{ progress }}</span><span v-if="total">{{ done }}/{{ total }}</span></div>
          <progress class="progress progress-success w-full" :value="total ? done : undefined" :max="total || 100"></progress>
        </div>
      </div>
    </div>

    <dialog ref="infoDialog" class="modal" :aria-labelledby="`${source}-import-info-title`" @click.self="infoDialog.close()">
      <div class="modal-box max-w-lg space-y-4">
        <h3 :id="`${source}-import-info-title`" class="font-bold text-lg">Kako radi importer</h3>
        <div class="space-y-3 text-sm">
          <p v-if="metadataRequired" class="text-base-content/80">Metapodaci dolaze iz Gamenote kataloga, posteri prvenstveno s platforme.</p>
          <p class="text-base-content/80">Automatski status je Completed samo za 100% postignuća; inače Backlog.</p>
          <p class="text-base-content/80">Sinkronizacija ažurira vrijeme igranja i dostupni napredak. Tvoje ocjene, status, bilješke i grupe ostaju sačuvani.</p>
          <p class="text-base-content/80">Slični nazivi mogu pripadati istoj igri. Odaberi povezivanje s postojećom igrom ili zaseban unos. Igra na drugoj platformi uvijek dobiva zaseban unos.</p>
        </div>
        <div class="modal-action"><button type="button" class="btn btn-primary" @click="infoDialog.close()">Razumijem</button></div>
      </div>
    </dialog>

    <div class="flex flex-col gap-4 lg:hidden" data-layout="mobile">
      <div v-for="game in visibleGames" :key="game.key" class="card bg-base-200 shadow-md transition-opacity" :class="game.exists ? 'opacity-70' : ''" :data-game-key="game.key">
        <div class="card-body p-4 space-y-3">
          <div class="flex gap-3 items-start">
            <div class="flex flex-col gap-1 items-center pt-1 shrink-0">
              <input type="checkbox" class="checkbox" :class="game.exists ? 'checkbox-info' : 'checkbox-success'" :checked="isSelected(game)" :disabled="busy || !ready || game.blocked" :aria-label="`Odaberi ${game.name}`" @change="selectGame(game, $event.target.checked)" />
              <span class="text-xs opacity-40">{{ game.exists ? 'sync' : 'nova' }}</span>
            </div>
            <ImporterGamePoster :name="game.name" :image-url="game.imageUrl" :fallback-image-url="game.fallbackImageUrl" @loaded="$emit('poster', { key: game.key, url: $event })" />
            <div class="flex-1 min-w-0 space-y-1.5 break-words">
              <a v-if="game.url" :href="game.url" target="_blank" rel="noopener noreferrer" class="font-bold text-base leading-snug link link-hover">{{ game.name }}</a>
              <div v-else class="font-bold text-base leading-snug">{{ game.name }}</div>
              <div class="flex flex-wrap gap-1.5">
                <span class="badge badge-sm" :class="game.platformPrimary ? 'badge-primary' : 'badge-ghost'">{{ game.platform }}</span>
                <span class="badge badge-sm" :class="game.blocked ? 'badge-warning' : game.exists ? 'badge-info' : 'badge-success badge-outline'">{{ game.blocked ? 'Provjeri podudaranje' : game.exists ? 'Postoji' : 'Nova' }}</span>
                <span v-if="game.otherPlatforms?.length" class="badge badge-sm badge-info badge-outline h-auto py-0.5 whitespace-normal" :title="`Već dodano za: ${game.otherPlatforms.join(', ')}`">Postoji na drugoj platformi</span>
                <span class="badge badge-sm badge-ghost">{{ game.playtime }}</span>
                <span v-if="game.progress != null" class="badge badge-sm badge-warning badge-outline">{{ game.progress }}% {{ game.progressLabel }}</span>
              </div>
              <p v-if="game.lastPlayed" class="text-xs opacity-40">Zadnje: {{ formatDate(game.lastPlayed) }}</p>
            </div>
          </div>
          <ImporterMatchChoice :game="game" :disabled="busy || !ready" @resolve="$emit('resolve', $event)" />
          <p v-if="game.blocked" class="text-xs text-warning">Odaberi postojeću igru ili zaseban unos.</p>
          <template v-else-if="!game.exists && extras[game.key]">
            <div class="divider my-0"></div>
            <ImporterGameFields :id="`${source}-mobile-${game.key}`" :name="game.name" :extras="extras[game.key]" :groups="groups" :status-options="statusOptions" :disabled="busy" />
          </template>
        </div>
      </div>
    </div>

    <div class="hidden lg:block overflow-x-auto rounded-xl" data-layout="desktop">
      <table class="table table-zebra">
        <thead><tr class="bg-base-300 text-sm"><th class="w-12">Odabir</th><th>Naziv</th><th>Platforma</th><th>Vrijeme</th><th>Napredak</th><th class="min-w-80">Detalji novog unosa</th></tr></thead>
        <tbody>
          <tr v-for="game in visibleGames" :key="game.key" :class="game.exists ? 'opacity-70' : ''" :data-game-key="game.key">
            <td><input type="checkbox" class="checkbox" :class="game.exists ? 'checkbox-info' : 'checkbox-success'" :checked="isSelected(game)" :disabled="busy || !ready || game.blocked" :aria-label="`Odaberi ${game.name}`" @change="selectGame(game, $event.target.checked)" /></td>
            <td><div class="flex items-center gap-3 min-w-56">
              <ImporterGamePoster :name="game.name" :image-url="game.imageUrl" :fallback-image-url="game.fallbackImageUrl" @loaded="$emit('poster', { key: game.key, url: $event })" />
              <div class="min-w-0 break-words"><a v-if="game.url" :href="game.url" target="_blank" rel="noopener noreferrer" class="font-semibold link link-hover">{{ game.name }}</a><div v-else class="font-semibold">{{ game.name }}</div><div class="text-xs opacity-50 mt-1">{{ game.blocked ? 'Provjeri podudaranje' : game.exists ? 'Postoji' : 'Nova' }}</div><span v-if="game.otherPlatforms?.length" class="badge badge-sm badge-info badge-outline mt-1 h-auto py-0.5" :title="`Već dodano za: ${game.otherPlatforms.join(', ')}`">Postoji na drugoj platformi</span></div>
            </div><ImporterMatchChoice :game="game" :disabled="busy || !ready" @resolve="$emit('resolve', $event)" /></td>
            <td><span class="badge whitespace-nowrap" :class="game.platformPrimary ? 'badge-primary' : 'badge-ghost'">{{ game.platform }}</span></td>
            <td class="tabular-nums whitespace-nowrap">{{ game.playtime }}</td>
            <td class="tabular-nums"><template v-if="game.progress != null">{{ game.progress }}% <span v-if="game.progressTotal" class="text-xs opacity-50">({{ game.progressValue }}/{{ game.progressTotal }})</span></template><span v-else class="opacity-40">—</span></td>
            <td><ImporterGameFields v-if="!game.exists && !game.blocked && extras[game.key]" :id="`${source}-desktop-${game.key}`" :name="game.name" :extras="extras[game.key]" :groups="groups" :status-options="statusOptions" :disabled="busy" /><span v-else class="text-xs opacity-50">{{ game.blocked ? 'Odaberi postupak uz naslov igre.' : 'Osobni podaci ostaju sačuvani.' }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-if="!visibleGames.length" class="text-sm opacity-60">Nema igara za ovaj pojam.</p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Icon } from '@iconify/vue';
import ImporterGameFields from './ImporterGameFields.vue';
import ImporterGamePoster from './ImporterGamePoster.vue';
import ImporterMatchChoice from './ImporterMatchChoice.vue';

const props = defineProps({
  source: { type: String, required: true },
  games: { type: Array, required: true },
  selectedNew: { type: Object, required: true },
  selectedExisting: { type: Object, required: true },
  extras: { type: Object, required: true },
  groups: { type: Array, default: () => [] },
  statusOptions: { type: Array, required: true },
  refreshLabel: { type: String, required: true },
  ready: { type: Boolean, default: true },
  busy: Boolean,
  metadataRequired: Boolean,
  enrichMetadata: { type: Boolean, default: true },
  progress: { type: String, default: '' },
  done: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
});
const emit = defineEmits(['select', 'import', 'sync', 'refresh', 'update:enrichMetadata', 'resolve', 'poster']);
const filter = ref('');
const infoDialog = ref(null);
const visibleGames = computed(() => props.games.filter(game => game.name.toLowerCase().includes(filter.value.trim().toLowerCase())));
const newCount = computed(() => props.games.filter(game => !game.exists && !game.blocked).length);
const existingCount = computed(() => props.games.filter(game => game.exists).length);
const selectedNewCount = computed(() => props.games.filter(game => !game.exists && !game.blocked && isSelected(game)).length);
const selectedExistingCount = computed(() => props.games.filter(game => game.exists && !game.blocked && isSelected(game)).length);

function isSelected(game) {
  return Boolean((game.exists ? props.selectedExisting : props.selectedNew)[game.key]);
}
function selectGame(game, value) {
  emit('select', { key: game.key, existing: game.exists, value });
}
function selectAll(existing, value) {
  for (const game of visibleGames.value) {
    if (game.exists === existing && !game.blocked) selectGame(game, value);
  }
}
function formatDate(value) {
  return new Date(value).toLocaleDateString('hr-HR');
}
</script>
