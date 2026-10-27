<template>
  <label v-if="game.needsChoice" class="block space-y-1 text-xs mt-3" data-testid="importer-match-choice">
    <span class="font-semibold text-base-content">{{ game.blocked ? 'Moguće ista igra' : game.resolution === 'separate' ? 'Zaseban unos' : 'Povezano s postojećom igrom' }}</span>
    <select class="select select-bordered select-sm w-full max-w-full" :value="game.resolution || ''" :disabled="disabled" :aria-label="`Prepoznavanje za ${game.name}`" @change="$emit('resolve', { key: game.key, value: $event.target.value })">
      <option value="" disabled>Odaberi postupak</option>
      <option v-for="candidate in game.candidates" :key="candidate.id" :value="`link:${candidate.id}`">Ista igra: {{ candidate.title }}</option>
      <option value="separate">Uvezi zasebno</option>
    </select>
    <span class="block opacity-60">Povezivanje čuva tvoj naslov, ocjenu i bilješke.</span>
  </label>
</template>

<script setup>
defineProps({ game: { type: Object, required: true }, disabled: Boolean });
defineEmits(['resolve']);
</script>
