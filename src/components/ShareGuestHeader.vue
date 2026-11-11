<template>
  <header class="bg-base-100 text-base-content border-b border-base-300 shadow-sm sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
      <a href="https://gamenote.eu" target="_blank" rel="noopener noreferrer" class="flex items-center shrink-0" aria-label="Gamenote početna">
        <GamenoteLogo class="lg:hidden w-10 h-9 text-base-content" />
        <GamenoteBanner class="hidden lg:block h-9 w-auto max-w-52 object-contain" />
      </a>
      <div class="flex gap-2 sm:hidden">
        <router-link to="/register" class="btn btn-xs btn-primary">Registracija</router-link>
        <router-link to="/login" class="btn btn-xs btn-outline">Prijava</router-link>
      </div>
      <div class="hidden sm:flex gap-2">
        <router-link to="/register" class="btn btn-sm btn-primary">Napravi profil</router-link>
        <router-link to="/login" class="btn btn-sm btn-outline">Prijavi se</router-link>
      </div>
    </div>
  </header>
  <div class="max-w-7xl mx-auto px-3 sm:px-4 mt-3">
    <div role="note" class="flex items-center gap-2 rounded-lg border border-info/20 bg-info/10 px-3 py-2 text-xs sm:text-sm">
      <svg class="size-4 shrink-0 text-info" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v1"/></svg>
      <p>Napravi profil ili se prijavi kako bi dobio puno iskustvo!</p>
    </div>
  </div>
</template>
<script setup>
import GamenoteLogo from './GamenoteLogo.vue';
import GamenoteBanner from './GamenoteBanner.vue';
</script>
