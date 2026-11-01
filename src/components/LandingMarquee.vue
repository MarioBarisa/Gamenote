<template>
    <div class="hero-marquee absolute inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true" role="presentation">
      <div class="flex flex-col justify-between gap-2 sm:gap-4 h-full py-4 sm:py-8">
        <div v-for="(row, rowIndex) in heroRows" :key="rowIndex" class="hero-marquee-fade w-full overflow-hidden">
          <div class="hero-marquee-track" :style="{ '--marquee-duration': row.duration, '--marquee-direction': row.direction }">
            <template v-for="copy in 2" :key="copy">
              <div v-for="demo in row.games" :key="`${demo.id}-${copy}`" class="shrink-0 w-44 sm:w-48 md:w-56 px-2">
                <GameCard :game="demo" lazy no-tcg :meta="false" />
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
</template>
<script setup>
import GameCard from './GameCard.vue'
const marqueeRows = [
  { duration: '42s', direction: 'normal' },
  { duration: '55s', direction: 'reverse' },
  { duration: '36s', direction: 'normal' }
]

const steamCover = (appId) => `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${appId}/library_600x900.jpg`

const demoGames = [
  { id: 1, title: 'Hollow Knight', platform: 'Nintendo Switch', genre: 'Action, Metroidvania', status: 'completed', rating: 5, image_url: steamCover(367520), play_time: 48, start_date: '2023-01-10', end_date: '2023-03-02' },
  { id: 2, title: 'Elden Ring', platform: 'PlayStation 5', genre: 'Action, RPG', status: 'completed', rating: 4, image_url: steamCover(1245620), play_time: 96, progress_total: 100, progress_value: 82, progress_mode: 'achievements_steam' },
  { id: 3, title: 'God of War', platform: 'PlayStation 5', genre: 'Adventure, Action', status: 'backlog', rating: 5, image_url: steamCover(1593500) },
  { id: 4, title: 'The Witcher 3', platform: 'PC', genre: 'Adventure, RPG', status: 'playing', rating: 4, image_url: steamCover(292030), play_time: 120, progress_total: 100, progress_value: 55, progress_mode: 'achievements_steam' },
  { id: 5, title: 'Stardew Valley', platform: 'Nintendo Switch', genre: 'Simulation, Indie', status: 'playing', rating: 4, image_url: steamCover(413150), play_time: 68 },
  { id: 6, title: 'Hades', platform: 'Nintendo Switch', genre: 'Action, Indie', status: 'completed', rating: 4, image_url: steamCover(1145360), play_time: 45, start_date: '2022-05-01', end_date: '2022-06-20' },
  { id: 7, title: 'Cyberpunk 2077', platform: 'PC', genre: 'Adventure, RPG', status: 'playing', rating: 4, image_url: steamCover(1091500), play_time: 133, progress_total: 100, progress_value: 41, progress_mode: 'achievements_steam' },
  { id: 8, title: "Baldur's Gate 3", platform: 'PC', genre: 'Adventure, RPG', status: 'playing', rating: 5, image_url: steamCover(1086940), progress_total: 100, progress_value: 38, progress_mode: 'achievements_steam' },
  { id: 9, title: 'Celeste', platform: 'PC', genre: 'Platform, Indie', status: 'completed', rating: 5, image_url: steamCover(504230), play_time: 12, start_date: '2021-08-15', end_date: '2021-08-30' },
  { id: 10, title: 'Cuphead', platform: 'Xbox Series X/S', genre: 'Action, Indie', status: 'paused', rating: 4, image_url: steamCover(268910), progress_total: 30, progress_value: 22, progress_mode: 'achievements_steam' },
  { id: 11, title: 'Sekiro: Shadows Die Twice', platform: 'PlayStation 4', genre: 'Action, Adventure', status: 'dropped', rating: 4, image_url: steamCover(814380) },
  { id: 12, title: 'Portal 2', platform: 'PC', genre: 'Puzzle, Adventure', status: 'completed', rating: 5, image_url: steamCover(620), play_time: 14, progress_total: 100, progress_value: 100, progress_mode: 'achievements_steam', start_date: '2020-11-11', end_date: '2020-11-14' },
  { id: 13, title: 'Kena: Bridge of Spirits', platform: 'PlayStation 5', genre: 'Adventure, Action', status: 'completed', rating: 5, image_url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co3t3j.jpg', play_time: 22, start_date: '2023-06-01', end_date: '2023-06-18' },
  { id: 14, title: 'Monster Hunter Rise', platform: 'Nintendo Switch', genre: 'Action, RPG', status: 'playing', rating: 4, image_url: steamCover(1446780), play_time: 34, progress_total: 60, progress_value: 27, progress_mode: 'achievements_steam' },
  { id: 15, title: 'Horizon Forbidden West', platform: 'PlayStation 5', genre: 'Action, RPG', status: 'completed', rating: 5, image_url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2gvu.jpg', play_time: 53, progress_total: 100, progress_value: 71, progress_mode: 'achievements_steam' },
  { id: 16, title: 'A Plague Tale: Requiem', platform: 'Xbox Series X/S', genre: 'Adventure, RPG', status: 'playing', rating: 4, image_url: steamCover(1182900), play_time: 12, progress_total: 100, progress_value: 30, progress_mode: 'achievements_steam' },
  { id: 17, title: 'The Legend of Zelda: Breath of the Wild', platform: 'Nintendo Switch', genre: 'Action, Adventure', status: 'backlog', rating: 5, image_url: 'https://upload.wikimedia.org/wikipedia/en/c/c6/The_Legend_of_Zelda_Breath_of_the_Wild.jpg', play_time: 4 },
  { id: 18, title: 'Splatoon 2', platform: 'Nintendo Switch', genre: 'Action, Adventure', status: 'completed', rating: 5, image_url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/cob8r9.jpg', play_time: 40, start_date: '2022-09-20', end_date: '2022-10-12' },
  { id: 19, title: 'Genshin Impact', platform: 'PC', genre: 'Adventure, RPG', status: 'playing', rating: 4, image_url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co8p06.jpg', play_time: 1200, progress_total: 100, progress_value: 15, progress_mode: 'achievements_steam' },
  { id: 20, title: 'Super Smash Bros. Ultimate', platform: 'Nintendo Switch', genre: 'Action, Fighting', status: 'playing', rating: 5, image_url: 'https://upload.wikimedia.org/wikipedia/en/5/50/Super_Smash_Bros._Ultimate.jpg', play_time: 58 },
  { id: 21, title: 'Forza Horizon 4', platform: 'Xbox Series X/S', genre: 'Racing, Adventure', status: 'completed', rating: 4, image_url: steamCover(1293830), play_time: 74, start_date: '2021-05-03', end_date: '2021-07-19' }
]


function shuffle(games) {
  const shuffled = [...games]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const game = shuffled[i]
    shuffled[i] = shuffled[j]
    shuffled[j] = game
  }
  return shuffled
}

const heroRows = marqueeRows.map(row => ({ ...row, games: shuffle(demoGames).slice(0, 10) }))
</script>
<style scoped>
/* ====== Rotirajući GameCards marquee ====== */
.hero-marquee-fade {
  -webkit-mask-image: linear-gradient(to right, transparent, black 6%, black 94%, transparent);
  mask-image: linear-gradient(to right, transparent, black 6%, black 94%, transparent);
}

.hero-marquee-track {
  display: flex;
  width: max-content;
  will-change: transform;
  animation: marquee-left var(--marquee-duration, 42s) linear infinite;
  animation-direction: var(--marquee-direction, normal);
}

@keyframes marquee-left {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

/* Kompaktnija kartica unutar hero marquee-a (nadjačava cardSize store) */
/*noinspection CssUnusedSymbol*/
.hero-marquee :deep(.game-card) {
  height: auto;
  border-radius: 0.5rem !important;
  overflow: hidden;
}

/*noinspection CssUnusedSymbol*/
.hero-marquee :deep(.game-card figure) {
  height: 4.5rem !important;
  overflow: hidden;
  border-radius: 0.5rem 0.5rem 0 0 !important;
}

@media (min-width: 640px) {
  .hero-marquee :deep(.game-card figure) {
    height: 5.5rem !important;
  }
}

@media (min-width: 768px) {
  .hero-marquee :deep(.game-card figure) {
    height: 6.5rem !important;
  }
}

/*noinspection CssUnusedSymbol*/
.hero-marquee :deep(.game-card img) {
  object-fit: cover !important;
}

/*noinspection CssUnusedSymbol*/
.hero-marquee :deep(.game-card .card-body) {
  padding: 0.2rem 0.45rem !important;
  border-radius: 0 0 0.5rem 0.5rem !important;
}

/*noinspection CssUnusedSymbol*/
.hero-marquee :deep(.game-card .card-title) {
  font-size: 0.7rem;
  line-height: 1.1;
}

/*noinspection CssUnusedSymbol*/
.hero-marquee :deep(.game-card .badge) {
  font-size: 0.55rem !important;
  padding: 0.08rem 0.3rem !important;
  height: auto !important;
  min-height: 0 !important;
}

/*noinspection CssUnusedSymbol*/
.hero-marquee :deep(.badge-outline) {
  padding: 0.15rem 0.25rem !important;
}

/*noinspection CssUnusedSymbol*/
.hero-marquee :deep(.badge-outline svg),
.hero-marquee :deep(.platform-icon) {
  width: 0.9rem !important;
  height: 0.9rem !important;
}

/*noinspection CssUnusedSymbol*/
.hero-marquee :deep(.text-xs),
.hero-marquee :deep(.text-sm) {
  font-size: 0.6rem !important;
}

@media (prefers-reduced-motion: reduce) {
  .hero-marquee-track {
    animation: none;
  }
}
</style>
