<template>
  <main class="min-h-screen bg-base-100 text-base-content flex items-center justify-center p-6">
    <div class="w-full max-w-sm text-center flex flex-col items-center gap-5">
      <GamenoteLogo class="w-16 h-auto" />
      <template v-if="error">
        <div role="alert">
          <h1 class="text-lg font-semibold mb-2">Prijavu nije moguće provjeriti</h1>
          <p class="text-sm text-base-content/70">{{ error }}</p>
        </div>
        <button type="button" class="btn btn-primary" @click="$emit('retry')">Pokušaj ponovno</button>
      </template>
      <div v-else role="status" class="flex items-center gap-3 text-sm text-base-content/70">
        <span class="loading loading-spinner loading-sm" aria-hidden="true"></span>
        Učitavam Gamenote…
      </div>
    </div>
  </main>
</template>

<script setup>
import GamenoteLogo from './GamenoteLogo.vue';

defineProps({ error: { type: String, default: '' } });
defineEmits(['retry']);
</script>
