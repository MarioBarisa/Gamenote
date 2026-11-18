<template>
  <div v-if="images.length > 1" ref="strip" @wheel="scrollWithWheel" role="group" aria-label="Odabir screenshota" class="screenshot-thumbnails flex shrink-0 gap-2 overflow-x-auto overscroll-x-contain p-1 w-max max-w-full mx-auto touch-manipulation">
    <button v-for="(image, index) in images" :key="index" type="button" class="shrink-0 rounded p-1 cursor-pointer focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2" :class="selectedIndex === index ? 'ring-2 ring-primary opacity-100' : 'opacity-50 hover:opacity-80'" :aria-label="`Prikaži screenshot ${index + 1}`" :aria-current="selectedIndex === index ? 'true' : undefined" @click="$emit('select', index)">
      <img :src="typeof image === 'string' ? image : image.image" alt="" class="w-15 h-11 sm:w-[4.375rem] sm:h-13 object-cover rounded" loading="lazy" decoding="async" />
    </button>
  </div>
</template>

<script setup>
import { onBeforeUnmount, ref, watch } from 'vue';
const props = defineProps({ images: { type: Array, required: true }, selectedIndex: { type: Number, default: 0 } });
defineEmits(['select']);
const strip = ref(null);
let resizeObserver;

function scrollWithWheel(event) {
  if (!strip.value || event.ctrlKey || Math.abs(event.deltaX) >= Math.abs(event.deltaY)) return;
  let distance = event.deltaY;
  if (event.deltaMode === 1) distance *= 16;
  else if (event.deltaMode === 2) distance *= strip.value.clientWidth;
  const before = strip.value.scrollLeft;
  strip.value.scrollLeft += distance;
  if (strip.value.scrollLeft !== before) event.preventDefault();
}

function revealSelected() {
  const button = strip.value?.querySelector('[aria-current="true"]');
  if (!button) return;
  const bounds = button.getBoundingClientRect();
  const track = strip.value.getBoundingClientRect();
  if (bounds.left < track.left) strip.value.scrollLeft += bounds.left - track.left;
  else if (bounds.right > track.right) strip.value.scrollLeft += bounds.right - track.right;
}

// Širina se mijenja nakon učitavanja slike.
watch(strip, element => {
  resizeObserver?.disconnect();
  if (!element) return;
  resizeObserver = new ResizeObserver(revealSelected);
  resizeObserver.observe(element);
  revealSelected();
}, { flush: 'post' });
watch(() => props.selectedIndex, revealSelected, { flush: 'post' });
onBeforeUnmount(() => resizeObserver?.disconnect());
</script>

<style scoped>
.screenshot-thumbnails { scrollbar-width: none; }
.screenshot-thumbnails::-webkit-scrollbar { display: none; }
</style>
