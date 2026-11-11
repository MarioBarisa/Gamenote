<template>
  <div class="gamercard-loading max-w-xl mx-auto w-full" role="status" aria-label="Učitavam gamercard…" aria-busy="true">
    <div class="gamercard-skeleton skeleton w-full rounded-3xl" aria-hidden="true"></div>
  </div>
</template>
<style scoped>
.gamercard-loading { container-type: inline-size; }
.gamercard-skeleton { aspect-ratio: 960 / 600; }
@container (width < 560px) {
  .gamercard-skeleton { aspect-ratio: 600 / 880; }
}
@media (prefers-reduced-motion: reduce) {
  .skeleton { animation: none; }
}
</style>
