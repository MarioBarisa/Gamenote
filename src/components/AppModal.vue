<template>
  <dialog ref="dialog" class="modal" :closedby="busy ? 'none' : 'any'" :aria-label="label" @close="$emit('close')" @cancel="preventBusyClose" @click.capture="preventBusyBackdrop" @click="dismissBackdrop">
    <slot />
  </dialog>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
const props = defineProps({ label: { type: String, required: true }, busy: Boolean });
defineEmits(['close']);
const dialog = ref(null);
function preventBusyClose(event) {
  if (props.busy) event.preventDefault();
}
function preventBusyBackdrop(event) {
  if (props.busy && event.target.closest('.modal-backdrop')) {
    event.preventDefault();
    event.stopPropagation();
  }
}
function dismissBackdrop(event) {
  if (props.busy) return;
  if (event.target === dialog.value || event.target.closest('.modal-backdrop')) dialog.value.close();
}
onMounted(() => dialog.value.showModal());
onBeforeUnmount(() => dialog.value?.close());
</script>
