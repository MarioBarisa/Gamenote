<template>
  <div ref="grid" class="loading-card-grid grid min-w-0" :class="[layout.container, layout.gap]" role="status" :aria-label="label" aria-busy="true">
    <span class="sr-only">{{ label }}</span>
    <div v-for="index in count" :key="index" class="loading-card card bg-base-200 shadow-sm min-w-0 overflow-hidden" aria-hidden="true">
      <div v-if="variant === 'games'" class="skeleton w-full rounded-none" :class="layout.poster"></div>
      <div v-else-if="banner" class="skeleton h-32 w-full rounded-none"></div>
      <div class="flex flex-col gap-3" :class="layout.cardBody || 'p-4'">
        <div :class="variant === 'games' ? layout.titleSize : 'text-lg'"><div class="skeleton h-[1.25em] w-3/4"></div></div>
        <template v-if="variant === 'games'">
          <div class="skeleton h-4 w-1/2"></div>
          <div class="flex gap-2"><div class="skeleton size-8"></div><div class="skeleton size-8"></div></div>
          <div class="skeleton h-3 w-2/3"></div>
          <div class="skeleton h-3 w-4/5 mt-2"></div>
          <div class="skeleton h-3 w-1/2"></div>
          <div class="skeleton h-2 w-full"></div>
        </template>
        <template v-else-if="variant === 'groups'">
          <div class="flex gap-2"><div class="skeleton h-4 w-20"></div><div class="skeleton h-4 w-12"></div></div>
        </template>
        <template v-else>
          <div class="skeleton h-36 w-full"></div>
          <div class="skeleton h-3 w-2/3"></div>
        </template>
      </div>
    </div>
  </div>
</template>
<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
defineProps({
  layout: { type: Object, required: true },
  variant: { type: String, default: 'games' },
  banner: Boolean,
  label: { type: String, default: 'Učitavam igre…' },
});
const grid = ref(null);
const count = ref(2);
let observer;
let resizeFrame;
function updateCount() {
  if (!grid.value) return;
  // Broj kartica prati stvarnu mrežu.
  const columns = getComputedStyle(grid.value).gridTemplateColumns;
  const columnCount = columns && columns !== 'none' ? columns.trim().split(/\s+/).length : 1;
  count.value = columnCount * 2;
}
onMounted(() => {
  updateCount();
  observer = new ResizeObserver(() => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(updateCount);
  });
  observer.observe(grid.value);
  observer.observe(grid.value.querySelector('.loading-card'));
});
onUnmounted(() => {
  observer?.disconnect();
  cancelAnimationFrame(resizeFrame);
});
</script>
<style scoped>
@media (prefers-reduced-motion: reduce) {
  .skeleton { animation: none; }
}
</style>
