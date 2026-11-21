<template>
  <label v-if="game.needsChoice" class="block space-y-1 text-xs mt-3" data-testid="importer-match-choice">
    <span class="font-semibold text-base-content">{{ game.blocked ? $t('importerMatchChoice.possiblyTheSameGame') : game.resolution === 'separate' ? $t('importerMatchChoice.separateEntry') : $t('importerMatchChoice.linkedToAnExistingGame') }}</span>
    <select class="select select-bordered select-sm w-full max-w-full" :value="game.resolution || ''" :disabled="disabled" :aria-label="$t('importerMatchChoice.matchFor', [game.name])" @change="$emit('resolve', { key: game.key, value: $event.target.value })">
      <option value="" disabled>{{ $t('importerMatchChoice.chooseAnAction') }}</option>
      <option v-for="candidate in game.candidates" :key="candidate.id" :value="`link:${candidate.id}`">{{ $t('importerMatchChoice.sameGame') }} {{ candidate.title }}</option>
      <option value="separate">{{ $t('importerMatchChoice.importSeparately') }}</option>
    </select>
    <span class="block opacity-60">{{ $t('importerMatchChoice.linkingKeepsYourTitleRating') }}</span>
  </label>
</template>

<script setup>
defineProps({ game: { type: Object, required: true }, disabled: Boolean });
defineEmits(['resolve']);
</script>
