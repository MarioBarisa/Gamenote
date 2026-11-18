<template>
  <div class="comparison-rating flex flex-wrap items-center gap-1.5" role="img" :aria-label="value ? `Ocjena ${formatted} od 5` : 'Nije ocijenjeno'">
    <strong class="text-lg sm:text-xl font-black tabular-nums" aria-hidden="true">{{ formatted }}<span class="text-xs font-semibold opacity-70">/5</span></strong>
    <span class="flex" aria-hidden="true"><svg v-for="star in 5" :key="star" viewBox="0 0 20 20" class="size-3 sm:size-4"><path :d="starPath" fill="currentColor" class="text-base-content/25" /><path :d="starPath" fill="currentColor" class="text-orange-400" :style="{ clipPath: `inset(0 ${100 - Math.max(0, Math.min(1, (value || 0) - star + 1)) * 100}% 0 0)` }" /></svg></span>
  </div>
</template>
<script setup>
import { computed } from 'vue';
const props = defineProps({ value: { type: Number, default: null } });
const formatted = computed(() => props.value ? props.value.toLocaleString('hr-HR', { maximumFractionDigits: 1 }) : '—');
const starPath = 'M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z';
</script>
