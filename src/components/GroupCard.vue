<template>
  <button ref="card" type="button" class="group-card card w-full bg-base-200 shadow-xl hover:shadow-2xl transition-all cursor-pointer overflow-hidden text-left" :aria-label="`Otvori grupu: ${group.name}`" @click="$emit('open')">
    <span v-if="images.length" class="relative block h-32 overflow-hidden w-full" aria-hidden="true">
      <span class="flex w-full h-full">
        <img v-for="(image, index) in images" :key="index" :src="image" alt="" loading="lazy" class="flex-1 min-w-0 h-full object-cover" />
      </span>
      <span class="absolute inset-0 bg-gradient-to-t from-base-200 to-transparent"></span>
    </span>
    <span v-else-if="previewLoading" class="skeleton h-32 w-full rounded-none" aria-hidden="true"></span>
    <span class="card-body p-4 w-full">
      <span class="font-bold text-lg">{{ group.name }}</span>
      <span class="flex items-center gap-2 mt-1">
        <span class="badge badge-sm badge-outline">{{ group.type }}</span>
        <span v-if="gameCount > 0" class="text-xs opacity-70">{{ gameCount }} igre/a</span>
      </span>
      <span v-if="group.rating" class="flex items-center gap-1 mt-2">
        <span class="rating rating-xs" aria-hidden="true"><span v-for="star in 5" :key="star" class="mask mask-star-2 size-3 bg-orange-400" :class="{ 'opacity-25': star > group.rating }"></span></span>
        <span class="text-xs opacity-70">{{ group.rating }}/5</span>
      </span>
    </span>
  </button>
</template>
<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
const props = defineProps({ group: { type: Object, required: true }, loadImages: Function });
defineEmits(['open']);
const card = ref(null);
const previewImages = ref([]);
const gameCount = computed(() => props.group.gameCount ?? props.group.game_count ?? 0);
const images = computed(() => (props.group.gameImages || previewImages.value).slice(0, 4));
const previewLoading = ref(!!props.loadImages && gameCount.value > 0);
let observer;
let controller;
async function loadPreview() {
  controller = new AbortController();
  try {
    previewImages.value = await props.loadImages(props.group, controller.signal);
  } catch {
    previewImages.value = [];
  } finally {
    previewLoading.value = false;
  }
}
onMounted(() => {
  if (!previewLoading.value) return;
  observer = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    observer.disconnect();
    loadPreview();
  }, { rootMargin: '160px' });
  observer.observe(card.value);
});
onUnmounted(() => { observer?.disconnect(); controller?.abort(); });
</script>
