<template>
  <span class="theme-preview" :style="{ backgroundColor: theme.color }" aria-hidden="true">
    <span :style="{ backgroundColor: theme.content }"></span>
    <span :style="{ backgroundColor: theme.primary }"></span>
    <span :style="{ backgroundColor: theme.secondary }"></span>
    <span :style="{ backgroundColor: theme.accent }"></span>
  </span>
</template>

<script setup>
defineProps({ theme: { type: Object, required: true } });
</script>

<style scoped>
.theme-preview {
  display: inline-grid;
  grid-template-columns: repeat(2, 4px);
  gap: 2px;
  padding: 4px;
  border: 1px solid rgb(128 128 128 / 15%);
  border-radius: 6px;
  flex-shrink: 0;
}

.theme-preview > span {
  width: 4px;
  height: 4px;
  border-radius: 50%;
}
</style>
