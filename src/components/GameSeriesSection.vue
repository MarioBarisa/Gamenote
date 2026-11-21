<template>
  <section class="game-series space-y-3" aria-labelledby="shared-series-title">
    <h3 id="shared-series-title" class="font-semibold">{{ $t('gameSeriesSection.series') }}</h3>
    <p v-if="!navigation.hasData" class="text-sm opacity-60">{{ $t('gameSeriesSection.noSeriesInformation') }}</p>
    <p v-else-if="!navigation.others.length" class="text-sm opacity-60">{{ $t('common.thisIsTheOnlyGame') }}</p>
    <template v-else>
      <div class="grid sm:grid-cols-2 gap-3">
        <template v-for="side in sides" :key="side.key">
          <button v-if="navigation[side.key]" type="button" class="card card-side min-h-24 overflow-hidden bg-base-300 text-left shadow-sm hover:shadow-md transition-shadow" :aria-label="`${side.label}: ${navigation[side.key].name}`" @click="$emit('open-game', navigation[side.key])">
            <span class="relative w-20 shrink-0 self-stretch overflow-hidden"><img :src="navigation[side.key].background_image || '/game-placeholder.svg'" :alt="navigation[side.key].name" class="absolute inset-0 h-full w-full object-cover" loading="lazy" @error="imageError" /></span>
            <span class="card-body p-3 min-w-0"><span class="text-xs opacity-60">{{ side.label }}</span><span class="font-semibold text-sm">{{ navigation[side.key].name }}</span><span class="text-xs opacity-60">{{ new Date(navigation[side.key].released).getFullYear() }}</span></span>
          </button>
          <div v-else class="card bg-base-300 p-3 justify-center text-center text-sm opacity-60">{{ side.empty }}</div>
        </template>
      </div>
      <div v-if="!navigation.previous && !navigation.next" class="space-y-2">
        <p class="text-sm opacity-60">{{ $t('common.allGamesInTheSeries') }}</p>
        <div class="flex flex-wrap gap-2"><button v-for="entry in navigation.others" :key="entry.id" type="button" class="btn btn-sm btn-outline" @click="$emit('open-game', entry)">{{ entry.name }}</button></div>
      </div>
    </template>
  </section>
</template>
<script setup>
import { t } from '../i18n/index.js';
import { computed } from 'vue';
import { getSeriesNavigation } from '../services/gameSeries.js';
const props = defineProps({ game: { type: Object, required: true } });
defineEmits(['open-game']);
const navigation = computed(() => getSeriesNavigation(props.game));
const sides = [{ key: 'previous', label: t('gameSeriesSection.previousGame'), empty: t('common.noPreviousGameInThe') }, { key: 'next', label: t('gameSeriesSection.nextGame'), empty: t('common.thisIsTheLatestGame') }];
function imageError(event) { if (!event.target.src.endsWith('/game-placeholder.svg')) event.target.src = '/game-placeholder.svg'; }
</script>
