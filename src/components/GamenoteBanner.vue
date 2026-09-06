<template>
  <img :src="bannerUrl" alt="Gamenote" loading="lazy" />
</template>

<script setup>
import { computed } from 'vue'
import { useThemeStore } from '../stores/theme'
import bannerLightUrl from '../assets/newAssets/GamenoteBannerLightMode.png'
import bannerDarkUrl from '../assets/newAssets/GamenoteBannerDarkMode.png'

const themeStore = useThemeStore()

const darkThemeSet = new Set(['dark', 'black', 'dracula', 'night', 'dim', 'forest', 'halloween', 'business', 'coffee', 'luxury', 'synthwave'])
const isDarkTheme = (name) => darkThemeSet.has(name) || name?.includes('dark') || name?.includes('night') || name?.includes('black')

const bannerUrl = computed(() => (isDarkTheme(themeStore.currentTheme) ? bannerDarkUrl : bannerLightUrl))
</script>
