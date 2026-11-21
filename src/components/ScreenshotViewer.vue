<template>
  <div class="modal-box screenshot-viewer" role="region" aria-roledescription="carousel" :aria-label="$t('screenshotViewer.gameScreenshots')" :style="{ '--image-ratio': imageRatio }">
    <div class="flex items-center justify-between gap-2 shrink-0">
      <div class="flex items-center gap-1">
        <button v-if="images.length > 1" type="button" class="btn btn-sm btn-square btn-ghost screenshot-control screenshot-mobile" :aria-label="$t('screenshotViewer.previousScreenshot')" @click="previous">❮</button>
        <span class="screenshot-counter text-sm tabular-nums opacity-70 whitespace-nowrap" aria-live="polite">{{ selectedIndex + 1 }} / {{ images.length }}</span>
        <button v-if="images.length > 1" type="button" class="btn btn-sm btn-square btn-ghost screenshot-control screenshot-mobile" :aria-label="$t('screenshotViewer.nextScreenshot')" @click="next">❯</button>
      </div>
      <div class="flex items-center gap-1 sm:gap-2" role="group" :aria-label="$t('screenshotViewer.screenshotTools')">
        <a v-if="downloadUrl" :href="downloadUrl" download target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-square screenshot-control" :aria-label="$t('screenshotViewer.downloadScreenshot')" :title="$t('screenshotViewer.downloadScreenshot')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" class="size-5" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v12m-4-4 4 4 4-4M5 15v5h14v-5" /></svg>
        </a>
        <div class="join screenshot-desktop" role="group" :aria-label="$t('screenshotViewer.screenshotZoom')">
          <button type="button" class="btn btn-sm btn-square join-item screenshot-control" :aria-label="$t('screenshotViewer.zoomOut')" :title="$t('screenshotViewer.zoomOut')" :disabled="zoom <= 1" @click="zoom = Math.max(1, zoom - 0.25)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="size-5" aria-hidden="true"><path stroke-linecap="round" d="M5 12h14" /></svg>
          </button>
          <button type="button" class="btn btn-sm btn-square join-item screenshot-control" :aria-label="$t('screenshotViewer.zoomIn')" :title="$t('screenshotViewer.zoomIn')" :disabled="zoom >= 3" @click="zoom = Math.min(3, zoom + 0.25)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="size-5" aria-hidden="true"><path stroke-linecap="round" d="M5 12h14M12 5v14" /></svg>
          </button>
        </div>
        <select v-model.number="zoom" class="select select-sm screenshot-zoom screenshot-desktop w-20 text-xs tabular-nums" :aria-label="$t('screenshotViewer.imageZoom')">
          <option v-for="percentage in [100, 125, 150, 175, 200, 225, 250, 275, 300]" :key="percentage" :value="percentage / 100">{{ percentage }}%</option>
        </select>
        <button type="button" class="btn btn-sm btn-circle btn-ghost screenshot-control" :aria-label="$t('screenshotViewer.closeScreenshot')" :title="$t('screenshotViewer.closeScreenshot')" @click="$emit('close')">✕</button>
      </div>
    </div>
    <div class="screenshot-surface">
      <div ref="stage" class="screenshot-stage bg-base-300/40 rounded-box" :class="{ 'is-zoomed': zoom > 1, 'is-dragging': dragging }" role="group" aria-roledescription="slide" :aria-label="$t('screenshotViewer.screenshotOf', [selectedIndex + 1, images.length])" tabindex="0" @pointerdown="startInteraction" @pointermove="movePan" @pointerup="finishInteraction" @pointercancel="cancelInteraction" @lostpointercapture="stopPan" @scroll.passive="scheduleViewport" @dblclick="toggleZoom">
        <div class="screenshot-canvas" :style="{ width: `${zoom * 100}%`, height: `${zoom * 100}%` }">
          <img :src="imageUrl" :alt="`Screenshot ${selectedIndex + 1}`" class="screenshot-main select-none" decoding="async" draggable="false" @load="readImageSize" />
        </div>
      </div>
      <button v-if="images.length > 1" type="button" class="btn btn-circle btn-ghost screenshot-desktop screenshot-arrow screenshot-previous bg-black/50 text-white hover:bg-black/75" :aria-label="$t('screenshotViewer.previousScreenshot')" @click="previous">❮</button>
      <button v-if="images.length > 1" type="button" class="btn btn-circle btn-ghost screenshot-desktop screenshot-arrow screenshot-next bg-black/50 text-white hover:bg-black/75" :aria-label="$t('screenshotViewer.nextScreenshot')" @click="next">❯</button>
      <button v-if="zoom > 1" type="button" class="screenshot-minimap rounded-box focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 border border-base-content/30 bg-base-100/90 shadow" :style="{ aspectRatio: viewport.ratio }" :aria-label="$t('screenshotViewer.moveTheVisibleAreaOf')" :title="$t('screenshotViewer.panImage')" @click="moveFromMinimap">
        <img :src="imageUrl" alt="" class="block w-full h-full object-contain rounded-box" draggable="false" />
        <span class="screenshot-viewport absolute border-2 border-primary bg-primary/15 outline outline-1 outline-base-100/80" :style="{ left: `${viewport.left}%`, top: `${viewport.top}%`, width: `${viewport.width}%`, height: `${viewport.height}%` }"></span>
      </button>
    </div>
    <ScreenshotThumbnails :images="images" :selected-index="selectedIndex" @select="$emit('select', $event)" />
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, nextTick, ref, watch } from 'vue';
import ScreenshotThumbnails from './ScreenshotThumbnails.vue';
const props = defineProps({ images: { type: Array, required: true }, selectedIndex: { type: Number, default: 0 } });
const emit = defineEmits(['close', 'select']);
const zoom = ref(1);
const imageRatio = ref(16 / 9);
const imageRatios = new Map();
const stage = ref(null);
const dragging = ref(false);
const viewport = ref({ left: 0, top: 0, width: 100, height: 100, ratio: 1.5 });
let swipeStart = null;
let pan = null;
let viewportFrame = 0;
let resizeObserver;

const imageUrl = computed(() => {
  const image = props.images[props.selectedIndex];
  return typeof image === 'string' ? image : image?.image || '';
});
const downloadUrl = computed(() => /^https?:\/\//i.test(imageUrl.value) ? imageUrl.value : '');

function previous() { emit('select', props.selectedIndex > 0 ? props.selectedIndex - 1 : props.images.length - 1); }
function next() { emit('select', props.selectedIndex < props.images.length - 1 ? props.selectedIndex + 1 : 0); }

function readImageSize(event) {
  const image = event.currentTarget;
  if (!image.naturalWidth || !image.naturalHeight) return;
  imageRatio.value = image.naturalWidth / image.naturalHeight;
  imageRatios.set(imageUrl.value, imageRatio.value);
}

async function toggleZoom(event) {
  if (!window.matchMedia('(min-width: 768px) and (hover: hover) and (pointer: fine)').matches) return;
  cancelInteraction();
  const area = stage.value;
  if (zoom.value > 1) {
    zoom.value = 1;
    area.scrollTo(0, 0);
    return;
  }
  const bounds = area.getBoundingClientRect();
  const x = (event.clientX - bounds.left + area.scrollLeft) / area.scrollWidth;
  const y = (event.clientY - bounds.top + area.scrollTop) / area.scrollHeight;
  zoom.value = 2;
  await nextTick();
  if (stage.value !== area) return;
  area.scrollTo(x * area.scrollWidth - area.clientWidth / 2, y * area.scrollHeight - area.clientHeight / 2);
  scheduleViewport();
}

function startInteraction(event) {
  if (zoom.value > 1 && event.button === 0 && event.isPrimary) {
    const area = stage.value;
    const bounds = area.getBoundingClientRect();
    if (event.clientX >= bounds.left + area.clientWidth || event.clientY >= bounds.top + area.clientHeight) return;
    swipeStart = null;
    pan = { id: event.pointerId, x: event.clientX, y: event.clientY, left: area.scrollLeft, top: area.scrollTop };
    dragging.value = true;
    area.focus({ preventScroll: true });
    area.setPointerCapture(event.pointerId);
    return;
  }
  if (event.pointerType !== 'touch' || zoom.value !== 1 || props.images.length < 2) return;
  swipeStart = { x: event.clientX, y: event.clientY };
}

function movePan(event) {
  if (!pan || event.pointerId !== pan.id) return;
  stage.value.scrollLeft = pan.left - (event.clientX - pan.x);
  stage.value.scrollTop = pan.top - (event.clientY - pan.y);
}
function stopPan() {
  const pointerId = pan?.id;
  pan = null;
  dragging.value = false;
  if (pointerId !== undefined && stage.value?.hasPointerCapture(pointerId)) stage.value.releasePointerCapture(pointerId);
}
function cancelInteraction() { swipeStart = null; stopPan(); }
function finishInteraction(event) {
  if (pan) { stopPan(); return; }
  if (!swipeStart) return;
  const distance = event.clientX - swipeStart.x;
  const vertical = event.clientY - swipeStart.y;
  swipeStart = null;
  if (Math.abs(distance) < 48 || Math.abs(distance) < Math.abs(vertical) * 1.5) return;
  if (distance < 0) next();
  else previous();
}

function updateViewport() {
  const area = stage.value;
  if (!area || !area.scrollWidth || !area.scrollHeight) return;
  const width = area.clientWidth / area.scrollWidth * 100;
  const height = area.clientHeight / area.scrollHeight * 100;
  viewport.value = {
    left: Math.max(0, Math.min(100 - width, area.scrollLeft / area.scrollWidth * 100)),
    top: Math.max(0, Math.min(100 - height, area.scrollTop / area.scrollHeight * 100)),
    width, height, ratio: area.scrollWidth / area.scrollHeight
  };
}
function scheduleViewport() {
  if (viewportFrame) return;
  viewportFrame = requestAnimationFrame(() => { viewportFrame = 0; updateViewport(); });
}
function moveFromMinimap(event) {
  const bounds = event.currentTarget.getBoundingClientRect();
  const x = event.detail === 0 ? 0.5 : (event.clientX - bounds.left) / bounds.width;
  const y = event.detail === 0 ? 0.5 : (event.clientY - bounds.top) / bounds.height;
  const area = stage.value;
  area.scrollTo(x * area.scrollWidth - area.clientWidth / 2, y * area.scrollHeight - area.clientHeight / 2);
  scheduleViewport();
}

watch(() => props.selectedIndex, () => {
  zoom.value = 1;
  cancelInteraction();
  stage.value?.scrollTo(0, 0);
});
watch(imageUrl, url => {
  const image = props.images[props.selectedIndex];
  const savedRatio = image?.width > 0 && image?.height > 0 ? image.width / image.height : 16 / 9;
  imageRatio.value = imageRatios.get(url) || savedRatio;
}, { immediate: true });
watch(zoom, scheduleViewport, { flush: 'post' });
onMounted(() => {
  resizeObserver = new ResizeObserver(scheduleViewport);
  resizeObserver.observe(stage.value);
  updateViewport();
});
onBeforeUnmount(() => {
  cancelInteraction();
  resizeObserver?.disconnect();
  cancelAnimationFrame(viewportFrame);
});
</script>

<style scoped>
.modal-box.screenshot-viewer {
  --image-ratio: calc(16 / 9);
  --screenshot-padding: 0.75rem;
  --screenshot-max-height: min(70dvh, calc(100dvh - 10rem));
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: calc(100vw - 1rem);
  max-width: min(70rem, max(24rem, calc(var(--screenshot-max-height) * var(--image-ratio) + var(--screenshot-padding) * 2)));
  max-height: calc(100dvh - 1rem);
  margin: 0;
  padding: var(--screenshot-padding);
}
.screenshot-surface {
  position: relative;
  width: 100%;
  max-width: min(100%, calc(var(--screenshot-max-height) * var(--image-ratio)));
  aspect-ratio: var(--image-ratio);
  align-self: center;
  flex-shrink: 0;
}
.screenshot-stage {
  width: 100%;
  height: 100%;
  overflow: auto;
  scrollbar-width: none;
  overscroll-behavior: contain;
  touch-action: pan-y pinch-zoom;
}
.screenshot-stage::-webkit-scrollbar { display: none; }
.screenshot-stage.is-zoomed { cursor: grab; touch-action: none; -webkit-user-select: none; user-select: none; }
.screenshot-stage.is-dragging { cursor: grabbing; }
.screenshot-canvas { min-width: 100%; min-height: 100%; }
.screenshot-main { display: block; width: 100%; height: 100%; object-fit: contain; }
.screenshot-control.btn { width: 2rem; height: 2rem; min-width: 2rem; min-height: 2rem; padding: 0; }
.screenshot-desktop { display: none; }
.screenshot-arrow { position: absolute; top: 50%; transform: translateY(-50%); width: 2.5rem; height: 2.5rem; min-height: 2.5rem; padding: 0; }
.screenshot-previous { left: 0.5rem; }
.screenshot-next { right: 0.5rem; }
.screenshot-minimap { position: absolute; top: 0.75rem; right: 0.75rem; width: clamp(5rem, 18%, 9rem); padding: 0; cursor: crosshair; }
.screenshot-viewport { pointer-events: none; }
@media (min-width: 768px) {
  .modal-box.screenshot-viewer { --screenshot-padding: 1.5rem; --screenshot-max-height: min(70dvh, calc(100dvh - 12rem), 46rem); }
  .screenshot-stage { touch-action: auto; }
  .screenshot-stage.is-zoomed { touch-action: none; }
  .screenshot-control.btn { width: 2.25rem; height: 2.25rem; min-width: 2.25rem; min-height: 2.25rem; }
  .screenshot-desktop { display: inline-flex; }
  .screenshot-mobile { display: none; }
}
</style>
