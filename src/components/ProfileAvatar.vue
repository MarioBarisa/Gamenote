<template>
  <span class="relative block w-full h-full">
    <img :src="localAvatar(name)" alt="" class="absolute inset-0 w-full h-full object-cover" />
    <img v-if="source && !failed" :key="`${source}-${attempt}`" :src="source"
      alt="Profilna slika" referrerpolicy="no-referrer" class="relative w-full h-full object-cover"
      @error="onError" @load="loaded = true" />
  </span>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { localAvatar } from '../services/safeContent';

const props = defineProps({ source: String, name: String, owner: String });
const failed = ref(false);
const loaded = ref(false);
const attempt = ref(0);
let retryTimer;

function retry() {
  if (!props.source || loaded.value || attempt.value >= 2) return;
  clearTimeout(retryTimer);
  attempt.value++;
  failed.value = false;
}

function onError() {
  failed.value = true;
  loaded.value = false;
  // Najviše dva pokušaja po slici.
  if (attempt.value < 2) retryTimer = setTimeout(retry, 1500 * (attempt.value + 1));
}

watch(() => [props.source, props.owner], () => {
  clearTimeout(retryTimer);
  failed.value = false;
  loaded.value = false;
  attempt.value = 0;
});
onMounted(() => window.addEventListener('online', retry));
onUnmounted(() => {
  clearTimeout(retryTimer);
  window.removeEventListener('online', retry);
});
</script>
