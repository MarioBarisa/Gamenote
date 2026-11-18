<template>
  <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" :aria-label="`Gamenote: ${left} vs ${right}`" font-family="Lato, sans-serif">
    <defs>
      <linearGradient id="comparison-left"><stop offset="0" stop-color="#7561d8" stop-opacity=".5" /><stop offset="1" stop-color="#7561d8" stop-opacity="0" /></linearGradient>
      <linearGradient id="comparison-right"><stop offset="0" stop-color="#b96cce" stop-opacity="0" /><stop offset="1" stop-color="#b96cce" stop-opacity=".5" /></linearGradient>
    </defs>
    <rect width="1200" height="630" fill="#101326" />
    <rect x="36" y="200" width="526" height="260" rx="32" fill="url(#comparison-left)" />
    <rect x="638" y="200" width="526" height="260" rx="32" fill="url(#comparison-right)" />
    <GamenoteLogo x="56" y="48" width="74" height="60" color="#f6f5ff" />
    <text x="150" y="94" font-size="44" font-weight="700" fill="#f6f5ff">Gamenote</text>
    <text x="152" y="128" font-size="19" letter-spacing="3" fill="#b8b8d0">USPOREDBA</text>
    <path d="M36 400c150-130 300 90 526-60v90H68a32 32 0 0 1-32-30" fill="#d0c5ff" opacity=".06" />
    <path d="M638 370c170 80 340-150 526-20v78a32 32 0 0 1-32 32H638Z" fill="#f0c6ff" opacity=".06" />
    <text x="298" y="344" text-anchor="middle" :font-size="fontSize(left)" font-weight="700" fill="#f6f5ff" :textLength="left.length > 20 ? 390 : undefined" lengthAdjust="spacingAndGlyphs">@{{ left }}</text>
    <text x="902" y="344" text-anchor="middle" :font-size="fontSize(right)" font-weight="700" fill="#f6f5ff" :textLength="right.length > 20 ? 390 : undefined" lengthAdjust="spacingAndGlyphs">@{{ right }}</text>
    <g transform="translate(510 230) scale(.7)"><path v-for="(path, index) in VERSUS_PATHS" :key="index" :d="path" :fill="index === 0 ? '#f0b6ff' : '#c6b9ff'" /></g>
    <path d="m694 231 4 11 11 4-11 4-4 11-4-11-11-4 11-4Z" fill="#f0b6ff" />
    <path d="m515 420 3 8 8 3-8 3-3 8-3-8-8-3 8-3Z" fill="#c6b9ff" />
    <text x="600" y="562" text-anchor="middle" font-size="23" fill="#b8b8d0">gamenote.eu</text>
  </svg>
</template>
<script setup>
import GamenoteLogo from './GamenoteLogo.vue';
import { VERSUS_PATHS } from '../constants/versusPaths.js';
defineProps({ left: { type: String, required: true }, right: { type: String, required: true } });
function fontSize(username) { return username.length > 20 ? 30 : username.length > 14 ? 35 : 44; }
</script>
