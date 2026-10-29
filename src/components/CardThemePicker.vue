<template>
  <div class="card-theme-picker">
    <button ref="trigger" type="button" class="btn btn-sm btn-ghost gap-1.5 px-1.5"
      aria-label="Sve daisyUI teme" title="Odaberi temu kartice" :popovertarget="popoverId"
      :style="{ anchorName }">
      <CardThemePreview :theme="selectedTheme" />
      <span class="sm:hidden">Sve teme</span>
      <svg width="10" height="10" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m5 8 5 5 5-5"/></svg>
    </button>
    <div ref="popover" :id="popoverId" popover aria-label="Sve teme kartice"
      class="dropdown dropdown-end bg-base-200 text-base-content rounded-box shadow-2xl card-theme-menu"
      :style="{ positionAnchor: anchorName }">
      <ul class="menu w-full">
        <li class="menu-title text-xs">Tema kartice</li>
        <li v-for="theme in CARD_THEMES" :key="theme.value">
          <button type="button" class="gap-3 px-2" :aria-label="theme.label"
            :aria-pressed="modelValue === theme.value" @click="selectTheme(theme.value)">
            <CardThemePreview :theme="theme" />
            <span class="grow text-left">{{ theme.label }}</span>
            <svg viewBox="0 0 24 24" class="size-3 shrink-0" :class="{ invisible: modelValue !== theme.value }"
              fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true"><path d="m4 12 5 5L20 6"/></svg>
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, useId } from 'vue';
import { CARD_THEMES } from '../services/cardAppearance.js';
import CardThemePreview from './CardThemePreview.vue';

const props = defineProps({ modelValue: { type: String, default: '' } });
const emit = defineEmits(['update:modelValue']);
const popoverId = 'card-themes-' + useId();
const anchorName = '--' + popoverId;
const trigger = ref(null);
const popover = ref(null);
const selectedTheme = computed(() => CARD_THEMES.find(theme => theme.value === props.modelValue) || CARD_THEMES[0]);

function selectTheme(value) {
  emit('update:modelValue', value);
  popover.value.hidePopover();
  trigger.value.focus();
}
</script>

<style scoped>
.card-theme-picker {
  display: inline-flex;
  flex-shrink: 0;
}

.card-theme-menu {
  width: 224px;
  max-height: min(380px, 55dvh);
  overflow-y: auto;
  border: 1px solid rgb(128 128 128 / 15%);
  margin-top: 8px;
}

@supports (anchor-name: --card-themes) {
  .card-theme-menu {
    position-area: none;
    inset: auto;
    top: calc(anchor(bottom) + 8px);
    left: clamp(12px, calc(anchor(right) - 224px), calc(100vw - 236px));
    margin: 0;
  }
}
</style>
