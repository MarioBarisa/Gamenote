<template>
  <div ref="container" class="relative w-12 sm:w-14 aspect-[2/3] shrink-0 overflow-hidden rounded-lg bg-base-300 ring-1 ring-base-content/10" data-testid="importer-poster" :aria-busy="loading">
    <img v-if="posterUrl && !failed" :src="posterUrl" :alt="`Poster igre ${name}`" width="112" height="168" loading="lazy" decoding="async" class="absolute inset-0 h-full w-full object-cover" @error="nextImage" @load="$emit('loaded', posterUrl)" />
    <div v-else class="absolute inset-0 flex items-center justify-center text-base-content/40" :role="loading ? 'status' : 'img'" :aria-label="loading ? `Učitavam poster igre ${name}` : `Poster nije dostupan za ${name}`">
      <span v-if="loading" class="loading loading-spinner loading-xs"></span>
      <Icon v-else icon="mdi:image-off-outline" class="h-5 w-5" aria-hidden="true" />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { Icon } from '@iconify/vue';
import { useGamesApi } from '../services/gamesApi';
import { loadImporterPoster } from '../services/importerPosters';
import { httpUrl } from '../services/safeContent';

const props = defineProps({
  name: { type: String, required: true },
  imageUrl: { type: String, default: null },
  fallbackImageUrl: { type: String, default: null },
});
defineEmits(['loaded']);
const api = useGamesApi();
const container = ref(null);
const posterUrl = ref(null);
const loading = ref(false);
const failed = ref(false);
let observer;
let visible = false;
let version = 0;
let triedFallback = false;
let triedCatalog = false;

async function loadPoster() {
  version++;
  failed.value = false;
  triedFallback = false;
  triedCatalog = false;
  posterUrl.value = httpUrl(props.imageUrl);
  if (posterUrl.value) { loading.value = false; return; }
  await nextImage();
}

async function nextImage() {
  const requestVersion = version;
  const fallback = httpUrl(props.fallbackImageUrl);
  if (!triedFallback && fallback && fallback !== posterUrl.value) {
    triedFallback = true;
    posterUrl.value = fallback;
    loading.value = false;
    return;
  }
  if (triedCatalog) { failed.value = true; loading.value = false; return; }
  triedCatalog = true;
  posterUrl.value = null;
  loading.value = true;
  try {
    const url = await loadImporterPoster(api, props.name);
    if (requestVersion === version) posterUrl.value = url;
  } catch {
    if (requestVersion === version) failed.value = true;
  } finally {
    if (requestVersion === version) loading.value = false;
  }
}

onMounted(() => {
  // Dohvati samo postere blizu vidljivog područja.
  if (!globalThis.IntersectionObserver) { visible = true; loadPoster(); return; }
  observer = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    visible = true;
    observer.disconnect();
    loadPoster();
  }, { rootMargin: '160px' });
  observer.observe(container.value);
});
watch(() => [props.name, props.imageUrl, props.fallbackImageUrl], () => { if (visible) loadPoster(); });
onBeforeUnmount(() => { version++; observer?.disconnect(); });
</script>
