<template>
  <figure ref="container" class="gamer-card" :aria-busy="avatarLoading">
    <svg ref="cardSvg" :id="cardId || undefined" xmlns="http://www.w3.org/2000/svg"
      :viewBox="`0 0 ${width} ${height}`" role="img" :aria-labelledby="`${uid}-title ${uid}-description`"
      font-family="Arial, sans-serif" font-weight="500" :fill="palette.foreground">
      <title :id="`${uid}-title`">Gamenote kartica: {{ name }}</title>
      <desc :id="`${uid}-description`">{{ description }}</desc>
      <defs>
        <clipPath :id="`${uid}-bounds`"><rect :width="width" :height="height" rx="32" /></clipPath>
        <clipPath :id="`${uid}-avatar`"><circle r="44" /></clipPath>
      </defs>
      <g :clip-path="`url(#${uid}-bounds)`">
        <rect :width="width" :height="height" :fill="palette.background" />
        <GamenoteLogo :x="compact ? 340 : 664" :y="compact ? 628 : 340" width="410" height="330" :color="palette.watermark" />

        <g transform="translate(92 96)">
          <circle r="48" :fill="palette.primary" />
          <g :clip-path="`url(#${uid}-avatar)`">
            <circle r="44" :fill="palette.background" />
            <text v-if="!avatarSource" text-anchor="middle" y="12" font-size="32" font-weight="600">{{ initials }}</text>
            <image v-if="avatarSource" :href="avatarSource" @load="avatarPreviewLoaded = true" @error="onAvatarPreviewError" x="-44" y="-44" width="88" height="88" preserveAspectRatio="xMidYMid slice" />
          </g>
        </g>
        <text class="card-username" x="162" y="82" dominant-baseline="central" :font-size="compact ? 38 : 44" font-weight="800">{{ identity.name }}</text>
        <text v-if="identity.email" class="card-email" :x="identity.emailX" y="82" dominant-baseline="central" :font-size="compact ? 18 : 19" font-weight="500" fill-opacity="0.6">{{ identity.email }}</text>
        <text x="162" y="130" font-size="23" font-weight="600" :fill="palette.foreground">{{ stats.level }}</text>

        <g class="card-playtime">
          <text :x="margin - 3" :y="compact ? 277 : 281" :font-size="hoursText.length > 8 ? 54 : 84" font-weight="800" letter-spacing="-2" :fill="palette.accent">{{ hoursText }}</text>
          <text :x="margin" :y="compact ? 312 : 316" font-size="23" font-weight="600">Sati igranja</text>
        </g>
        <g class="card-summary" :transform="`translate(${compact ? margin : 382} ${compact ? 348 : 220})`">
          <g v-for="(metric, index) in metrics" :key="metric.label" class="card-metric" :transform="`translate(${18 + index * summaryWidth / 3} 0)`">
            <text y="48" :font-size="metric.value.length > 6 ? 36 : 50" font-weight="800" :fill="palette[metric.color]">{{ metric.value }}</text>
            <text y="83" font-size="19" font-weight="600" :fill="palette.foreground">{{ metric.label }}</text>
          </g>
        </g>

        <g :transform="`translate(${margin} ${compact ? 513 : 403})`">
          <text font-size="21" :fill="palette.foreground">Omiljena igra</text>
          <text v-for="(line, index) in favoriteLines" :key="index" x="0" :y="40 + index * 36" font-size="31" font-weight="700">{{ line }}</text>
          <text x="0" y="109" font-size="21" :fill="palette.foreground">{{ stats.favoriteGame ? `${formatCardNumber(stats.favoriteGame.play_time)} h · najviše igrana` : 'Još nema zabilježenog vremena' }}</text>
        </g>
        <g :transform="`translate(${compact ? margin : 544} ${compact ? 679 : 403})`">
          <text font-size="21" :fill="palette.foreground">Omiljeni žanr</text>
          <text v-for="(line, index) in genreLines" :key="index" x="0" :y="40 + index * 36" font-size="31" font-weight="700">{{ line }}</text>
          <text v-if="!stats.favoriteGenre" x="0" y="109" font-size="21" :fill="palette.foreground">Dodaj žanrove igrama</text>
        </g>

        <g :transform="`translate(${margin} ${height - 58})`" :fill="palette.foreground">
          <GamenoteLogo width="25" height="20" :color="palette.foreground" />
          <text x="34" y="16" font-size="18">gamenote.eu</text>
        </g>
        <text v-if="!compact" x="908" :y="height - 42" font-size="18" text-anchor="end" :fill="palette.foreground">{{ memberSince }}</text>
        <text v-else :x="margin" :y="height - 15" font-size="18" :fill="palette.foreground">{{ memberSince }}</text>
      </g>
    </svg>
    <figcaption class="mt-3 text-xs text-base-content/60">
      <span v-if="avatarFailed" class="block mt-1">
        {{ avatarPreviewLoaded ? 'Fotografija se prikazuje, ali nije spremna za izvoz.' : 'Profilna slika nije dostupna za karticu; prikazuju se inicijali.' }}
        <button type="button" class="link ml-1" @click="avatarAttempt++">Ponovno učitaj sliku</button>
      </span>
    </figcaption>
  </figure>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted, watch, useId, nextTick } from 'vue';
import GamenoteLogo from './GamenoteLogo.vue';
import { cardDisplayPalette } from '../services/cardAppearance.js';
import { loadCardAvatar } from '../services/cardAvatar.js';
import { GAME_STATUS_MAP } from '../constants/gameStatus.js';
import { getGamerCardStats, formatCardNumber, exportGamerCard } from '../services/gamerCard.js';

const props = defineProps({
  games: { type: Array, default: () => [] },
  name: { type: String, default: 'Igrač' },
  email: { type: String, default: '' },
  avatarUrl: { type: String, default: '' },
  createdAt: { type: String, default: '' },
  color: { type: String, default: 'signature' },
  theme: { type: String, default: '' },
  cardId: { type: String, default: '' },
});
const uid = useId();
const container = ref(null);
const cardSvg = ref(null);
const compact = ref(false);
const avatarData = ref('');
const avatarLoading = ref(false);
const avatarFailed = ref(false);
const avatarAttempt = ref(0);
const avatarPreviewLoaded = ref(false);
const avatarPreviewFailed = ref(false);
const avatarSource = computed(() => avatarData.value || (!avatarPreviewFailed.value ? props.avatarUrl : ''));
let observer;
let resizeFrame;
let avatarReady = Promise.resolve();
const stats = computed(() => getGamerCardStats(props.games));
const palette = computed(() => cardDisplayPalette(props.color, stats.value.favoriteGenre?.name, props.theme));
const width = computed(() => compact.value ? 600 : 960);
const height = computed(() => compact.value ? 880 : 600);
const margin = computed(() => compact.value ? 44 : 52);
const hoursText = computed(() => formatCardNumber(stats.value.hours));
const summaryWidth = computed(() => compact.value ? width.value - margin.value * 2 : 526);
const identity = computed(() => {
  const totalWidth = compact.value ? 390 : 730;
  const emailSize = compact.value ? 18 : 19;
  const email = fitText(props.email, compact.value ? 220 : 320, emailSize, 1, 500)[0] || '';
  const context = document.createElement('canvas').getContext('2d');
  context.font = `500 ${emailSize}px Arial`;
  const emailWidth = email ? context.measureText(email).width + 14 : 0;
  const nameSize = compact.value ? 38 : 44;
  const name = fitText(props.name, totalWidth - emailWidth, nameSize, 1, 800)[0] || '';
  context.font = `800 ${nameSize}px Arial`;
  return { name, email, emailX: 162 + context.measureText(name).width + 14 };
});
const initials = computed(() => props.name.trim().split(/\s+/).slice(0, 2).map(word => word[0] || '').join('').toUpperCase());
const metrics = computed(() => [
  { label: 'Igara u biblioteci', color: 'primary', value: formatCardNumber(stats.value.total) },
  { label: GAME_STATUS_MAP.completed.label, color: 'success', value: formatCardNumber(stats.value.completed) },
  { label: GAME_STATUS_MAP.playing.label, color: 'info', value: formatCardNumber(stats.value.playing) },
]);
const memberSince = computed(() => {
  const date = new Date(props.createdAt);
  return Number.isNaN(date.getTime()) ? 'Tvoja osobna gaming priča' : `Član od ${date.toLocaleDateString('hr-HR', { month: '2-digit', year: 'numeric' })}`;
});
const description = computed(() => `${props.name}. ${props.email ? props.email + '. ' : ''}${stats.value.hours} sati igranja, ${stats.value.total} igara, ${stats.value.completed} ${GAME_STATUS_MAP.completed.label}, ${stats.value.playing} ${GAME_STATUS_MAP.playing.label}. Omiljena igra: ${stats.value.favoriteGame?.title || 'nema podataka'}. Omiljeni žanr: ${stats.value.favoriteGenre?.name || 'nema podataka'}. gamenote.eu.`);
const favoriteLines = computed(() => fitText(stats.value.favoriteGame?.title || 'Još nema podataka', compact.value ? 512 : 436, 31, 2));
const genreLines = computed(() => fitText(stats.value.favoriteGenre?.name || 'Još nema podataka', compact.value ? 400 : 364, 31, 2));

function fitText(value, maxWidth, fontSize, maxLines = 1, fontWeight = 700) {
  const context = document.createElement('canvas').getContext('2d');
  context.font = `${fontWeight} ${fontSize}px Arial`;
  const lines = [];
  let remaining = String(value).replace(/\s+/g, ' ').trim();
  while (remaining && lines.length < maxLines) {
    let line = remaining;
    if (context.measureText(line).width <= maxWidth) {
      lines.push(line);
      break;
    }
    const characters = Array.from(line);
    while (characters.length && context.measureText(characters.join('') + '…').width > maxWidth) characters.pop();
    line = characters.join('');
    if (lines.length === maxLines - 1) {
      lines.push(line.trimEnd() + '…');
      break;
    }
    const space = line.lastIndexOf(' ');
    if (space > line.length / 2) line = line.slice(0, space);
    lines.push(line);
    remaining = remaining.slice(line.length).trim();
  }
  return lines;
}

function onAvatarPreviewError() {
  avatarPreviewLoaded.value = false;
  avatarPreviewFailed.value = true;
  avatarData.value = '';
}

watch([() => props.avatarUrl, avatarAttempt], ([url], [previousUrl] = [], onCleanup) => {
  if (url !== previousUrl) {
    avatarPreviewLoaded.value = false;
    avatarPreviewFailed.value = false;
  }
  const controller = new AbortController();
  onCleanup(() => controller.abort());
  avatarData.value = '';
  avatarFailed.value = false;
  avatarLoading.value = Boolean(url);
  avatarReady = (async () => {
    if (!url) return;
    try {
      const data = await loadCardAvatar(url, controller.signal);
      if (!controller.signal.aborted) avatarData.value = data;
    } catch {
      if (!controller.signal.aborted) avatarFailed.value = true;
    } finally {
      if (!controller.signal.aborted) avatarLoading.value = false;
    }
  })();
}, { immediate: true });

onMounted(() => {
  observer = new ResizeObserver(([entry]) => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => { compact.value = entry.contentRect.width < 560; });
  });
  observer.observe(container.value);
});
onUnmounted(() => {
  observer?.disconnect();
  cancelAnimationFrame(resizeFrame);
});

async function exportImage() {
  let pending;
  do {
    pending = avatarReady;
    await pending;
  } while (pending !== avatarReady);
  await nextTick();
  if (avatarPreviewLoaded.value && !avatarData.value) {
    throw new Error('Profilna slika nije spremna za izvoz. Pokušaj ponovno učitati sliku.');
  }
  return exportGamerCard(cardSvg.value);
}
defineExpose({ exportImage });
</script>

<style scoped>
.gamer-card { display: block; width: 100%; margin: 0; min-width: 0; }
.gamer-card > svg { display: block; width: 100%; height: auto; border-radius: 20px; }
</style>
