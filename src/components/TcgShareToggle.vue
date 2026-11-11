<template>
  <label v-bind="$attrs" class="btn tcg-toggle relative gap-2" :class="{ 'tcg-active': modelValue }" :title="modelValue ? 'Isključi TCG efekt' : 'Uključi TCG efekt'">
    <input type="checkbox" aria-label="TCG" class="absolute inset-0 h-full w-full cursor-pointer opacity-0" :checked="modelValue" @change="toggle" />
    <svg class="size-5 shrink-0" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M19.713 14.7q.412 0 .712.3L22 16.6q.3.3.3.7t-.3.7t-.7.3t-.7-.3L19 16.425q-.3-.3-.3-.712T19 15t.713-.3M20.3 3.713q0 .412-.3.712L18.425 6q-.3.3-.712.3T17 6t-.3-.712t.3-.713L18.6 3q.3-.3.7-.3t.7.3t.3.712M4.713 2.7q.412 0 .712.3L7 4.6q.3.3.3.7T7 6t-.712.3t-.713-.3L4 4.425q-.3-.3-.3-.712T4 3t.713-.3M5.3 15.713q0 .412-.3.712L3.425 18q-.3.3-.712.3T2 18t-.3-.712t.3-.713L3.6 15q.3-.3.7-.3t.7.3t.3.713m6.7 1.562l-4.15 2.5q-.275.175-.575.15t-.525-.2t-.35-.437t-.05-.588l1.1-4.725L3.775 10.8q-.25-.225-.312-.513t.037-.562t.3-.45t.55-.225l4.85-.425l1.875-4.45q.125-.3.388-.45t.537-.15t.537.15t.388.45l1.875 4.45l4.85.425q.35.05.55.225t.3.45t.038.563t-.313.512l-3.675 3.175l1.1 4.725q.075.325-.05.588t-.35.437t-.525.2t-.575-.15z"/></svg>
    <span class="tcg-label">TCG</span>
    <span v-if="modelValue && burst" :key="burst" class="tcg-sparkles" aria-hidden="true">
      <span v-for="(sparkle, index) in sparkles" :key="index" class="tcg-spark" :style="sparkle"></span>
    </span>
  </label>
  <TcgConfirmation ref="confirmation" />
</template>
<script setup>
import { ref } from 'vue';
defineOptions({ inheritAttrs: false });
import TcgConfirmation from './TcgConfirmation.vue';
const props = defineProps({ modelValue: Boolean });
const confirmation = ref(null);
const emit = defineEmits(['update:modelValue']);
const burst = ref(0);
const sparkles = [
  { left: '12%', top: '8%', '--spark-x': '-8px', '--spark-y': '-12px', '--spark-delay': '0ms' },
  { left: '45%', top: '0%', '--spark-x': '-2px', '--spark-y': '-14px', '--spark-delay': '50ms' },
  { left: '83%', top: '10%', '--spark-x': '8px', '--spark-y': '-10px', '--spark-delay': '20ms' },
  { left: '98%', top: '50%', '--spark-x': '10px', '--spark-y': '1px', '--spark-delay': '80ms' },
  { left: '75%', top: '92%', '--spark-x': '6px', '--spark-y': '12px', '--spark-delay': '40ms' },
  { left: '28%', top: '98%', '--spark-x': '-5px', '--spark-y': '12px', '--spark-delay': '90ms' },
  { left: '1%', top: '60%', '--spark-x': '-10px', '--spark-y': '3px', '--spark-delay': '30ms' },
];
async function toggle(event) {
  const enabled = event.target.checked;
  event.target.checked = props.modelValue;
  if (enabled && !await confirmation.value.requestEnable()) return;
  if (enabled) burst.value++;
  emit('update:modelValue', enabled);
}
</script>
<style scoped>
.tcg-toggle {
  background-color: color-mix(in oklab, var(--color-primary) 12%, var(--color-base-100));
  color: var(--color-base-content);
  border-color: transparent;
  outline: none;
  box-shadow: 0 1px 3px rgb(0 0 0 / 8%);
  overflow: visible;
  transition-property: box-shadow, transform;
}
.tcg-active {
  background-color: #6d28d9;
  background-image: radial-gradient(ellipse at 15% 0%, rgb(255 255 255 / 18%), transparent 65%), linear-gradient(115deg, #4338ca 0%, #7c3aed 52%, #a21caf 100%);
  background-size: 100% 100%;
  background-repeat: no-repeat;
  color: #fff;
  box-shadow: 0 3px 12px rgb(109 40 217 / 22%), inset 0 1px 0 rgb(255 255 255 / 15%);
}
.tcg-toggle:has(input:focus-visible) {
  outline: none;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 45%, transparent), 0 3px 12px rgb(109 40 217 / 15%);
}
.tcg-sparkles {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.tcg-spark {
  --spark-delay: 0ms;
  --spark-x: 0px;
  --spark-y: 0px;
  position: absolute;
  width: 12px;
  height: 12px;
  background-color: #a78bfa;
  clip-path: polygon(50% 0%, 62% 38%, 100% 50%, 62% 62%, 50% 100%, 38% 62%, 0% 50%, 38% 38%);
  opacity: 0;
  animation: tcg-sparkle 700ms ease-out var(--spark-delay) both;
}
.tcg-spark:nth-child(even) {
  width: 9px;
  height: 9px;
  background-color: #d946ef;
}
@keyframes tcg-sparkle {
  0% { opacity: 0; transform: translate(-50%, -50%) scale(0.25); }
  25% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  65% { opacity: 0.8; }
  100% { opacity: 0; transform: translate(calc(-50% + var(--spark-x)), calc(-50% + var(--spark-y))) scale(0.55) rotate(45deg); }
}
@media (prefers-reduced-motion: reduce) {
  .tcg-sparkles { display: none; }
  .tcg-spark { animation: none; }
  .tcg-toggle { transition: none; }
}
</style>
