<template>
  <AppModal :label="title" :busy="busy" @close="$emit('close')">
    <div class="modal-box flex flex-col gap-4">
      <button type="button" class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
        :aria-label="$t('common.closeLabel')" :disabled="busy" @click="$emit('close')">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="m6 6 12 12M18 6 6 18" />
        </svg>
      </button>
      <h2 class="pr-8 text-lg font-bold">{{ title }}</h2>
      <slot />
    </div>
    <form method="dialog" class="modal-backdrop" aria-hidden="true"><button tabindex="-1">{{ $t('common.closeLabel') }}</button></form>
  </AppModal>
</template>

<script setup>
import AppModal from './AppModal.vue';

defineProps({ title: { type: String, required: true }, busy: Boolean });
defineEmits(['close']);
</script>
