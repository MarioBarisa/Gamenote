<template>
  <div class="w-full overflow-x-auto pb-2" role="group" aria-label="Filteri statusa">
    <div class="flex flex-nowrap gap-2 min-w-max">
      <button v-for="option in options" :key="option.key" type="button" class="btn btn-sm" :class="buttonClass(option.key)" :aria-pressed="modelValue === option.key" @click="$emit('update:modelValue', modelValue === option.key ? 'all' : option.key)">{{ option.label }}</button>
    </div>
  </div>
</template>
<script setup>
import { computed } from 'vue';
import { GAME_STATUS_MAP } from '../constants/gameStatus.js';
const props = defineProps({ modelValue: { type: String, default: 'all' }, ratings: Boolean });
defineEmits(['update:modelValue']);
const options = computed(() => {
  const result = [{ key: 'all', label: 'Sve' }];
  for (const key of ['playing', 'completed', 'paused', 'backlog', 'dropped', 'wishlist']) result.push(GAME_STATUS_MAP[key]);
  if (props.ratings) result.push({ key: 'rated-5', label: '5/5' }, { key: 'rated-4', label: '4/5+' });
  return result;
});
function buttonClass(key) {
  const colors = { all: 'btn-info', playing: 'btn-primary', completed: 'btn-success', paused: 'btn-warning', backlog: 'btn-ghost', dropped: 'btn-error', wishlist: 'btn-accent', 'rated-5': 'btn-secondary', 'rated-4': 'btn-secondary' };
  return [colors[key], props.modelValue === key ? 'btn-active shadow' : 'btn-outline bg-base-100 shadow-sm'];
}
</script>
