<template>
  <div class="overflow-hidden">
    <div class="hero min-h-[calc(85dvh-64px)] bg-base-100 pb-10 relative">
      <!-- Rotirajući GameCards (Netflix stil) -->
    <div class="hero-marquee absolute inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true" role="presentation">
      <div class="flex flex-col justify-between gap-2 sm:gap-4 h-full py-4 sm:py-8">
        <div v-for="(row, rowIndex) in heroRows" :key="rowIndex" class="hero-marquee-fade w-full overflow-hidden">
          <div class="hero-marquee-track" :style="{ '--marquee-duration': row.duration, '--marquee-direction': row.direction }">
            <template v-for="copy in 2" :key="copy">
              <div v-for="demo in row.games" :key="`${demo.id}-${copy}`" class="shrink-0 w-44 sm:w-48 md:w-56 px-2">
                <GameCard :game="demo" lazy no-tcg />
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- Overlay za čitljivost teksta -->
    <div class="absolute inset-0 z-[1] bg-base-100/60 backdrop-blur-[1.8px] pointer-events-none" aria-hidden="true"></div>

    <!-- Glatki prijelaz prema sadržaju iznad i ispod -->
    <div class="absolute inset-x-0 top-0 h-20 sm:h-24 z-[1] bg-gradient-to-b from-base-100 to-transparent pointer-events-none" aria-hidden="true"></div>
    <div class="absolute inset-x-0 bottom-0 h-20 sm:h-28 z-[1] bg-gradient-to-t from-base-100 via-base-100/40 to-transparent pointer-events-none" aria-hidden="true"></div>

    <div class="hero-content text-center flex-col relative z-10 transition-all duration-700 ease-out"
           :class="mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'">
        
        <img src="../assets/gamenote.png" 
             alt="Gamenote Logo" 
             class="w-64 sm:w-80 md:w-96 max-w-full h-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500" />
             
        <div class="max-w-3xl mt-4">
          <p class="text-xl md:text-2xl text-base-content/80 font-bold mb-2">
            Prati cijelu svoju zbirku igara na jednom mjestu.
          </p>

          <div class="h-24 md:h-20 flex items-center justify-center overflow-hidden mb-6 w-full">
            <Transition name="cycle" mode="out-in">
              <h1 class="text-2xl md:text-4xl font-extrabold text-base-content px-2" :key="currentFeatureIndex">
                {{ features[currentFeatureIndex].text }}
                <span class="bg-gradient-to-r from-[#F9461F] to-rose-500 bg-clip-text text-transparent pb-1">
                  {{ features[currentFeatureIndex].highlight }}
                </span>
              </h1>
            </Transition>
          </div>

          <div class="flex flex-col sm:flex-row gap-4 justify-center w-full px-4 sm:px-0">
            <RouterLink to="/register" class="btn btn-primary btn-lg  shadow-xl sm:w-auto w-full hover:-translate-y-1 hover:scale-105 transition-all">Stvori račun</RouterLink>
            <RouterLink to="/login" class="btn btn-outline btn-lg sm:w-auto w-full hover:-translate-y-1 transition-all bg-base-100/50 backdrop-blur-sm">Prijava</RouterLink>
          </div>
        </div>
      </div>
    </div>

    <section class="py-16 md:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
      <div class="mb-12 text-center md:text-left">
        <h2 class="text-4xl md:text-5xl font-black mb-4 tracking-tight bg-gradient-to-r from-[#F9461F] to-rose-500 bg-clip-text text-transparent inline-block pb-2 leading-relaxed">
          Sve što trebaš za praćenje svojih igara
        </h2>
        <p class="text-base-content/70 text-xl max-w-2xl font-medium mx-auto md:mx-0">
          Osobna gaming biblioteka s moćnim alatima za praćenje, napravljena za sve kojima je stalo do kolekcije.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-6 gap-6 md:gap-8">
        <div class="card bg-base-100 shadow-xl hover:-translate-y-2 hover:rotate-1 hover:shadow-2xl transition-all duration-300 md:col-span-3 border-2 border-base-200 hover:border-[#F9461F]/30">
          <div class="card-body">
            <div class="text-[#F9461F] mb-2 bg-[#F9461F]/10 w-fit p-4 rounded-2xl">
              <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </div>
            <h3 class="card-title text-2xl font-bold">Pretraga igara</h3>
            <p class="text-base-content/70 text-lg">Pretraži milijune igara uz naslovnice, ocjene i metapodatke direktno iz IGDB baze.</p>
          </div>
        </div>

        <div class="card bg-base-100 shadow-xl hover:-translate-y-2 hover:-rotate-1 hover:shadow-2xl transition-all duration-300 md:col-span-3 border-2 border-base-200 hover:border-orange-400/30">
          <div class="card-body">
            <div class="text-orange-500 mb-2 bg-orange-500/10 w-fit p-4 rounded-2xl">
              <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            </div>
            <h3 class="card-title text-2xl font-bold">Gamenote je samo tvoj.</h3>
            <p class="text-base-content/70 text-lg">Piši i spremi bilješke za svaku igru, daj igrama ocjenu, playtime, postotak prolaznosti, organiziraj si igre po grupama...</p>
          </div>
        </div>

        <div class="card bg-base-100 shadow-xl hover:-translate-y-2 hover:rotate-1 hover:shadow-2xl transition-all duration-300 md:col-span-2 border-2 border-base-200 hover:border-accent/30">
          <div class="card-body">
            <div class="text-accent mb-2 bg-accent/10 w-fit p-4 rounded-2xl">
              <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
            </div>
            <h3 class="card-title text-2xl font-bold">Statusi</h3>
            <p class="text-base-content/70">Označi igre kao: Igram, Završeno, Odustao ili Backlog.</p>
          </div>
        </div>

        <div class="card bg-base-100 shadow-xl hover:-translate-y-2 hover:-rotate-1 hover:shadow-2xl transition-all duration-300 md:col-span-2 border-2 border-base-200 hover:border-success/30">
          <div class="card-body">
            <div class="text-success mb-2 bg-success/10 w-fit p-4 rounded-2xl">
              <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
            </div>
            <h3 class="card-title text-2xl font-bold">Optimizirano</h3>
            <p class="text-base-content/70">Dizajnirano za praćenje u pokretu na svakom uređaju.</p>
          </div>
        </div>

        <div class="card bg-base-100 shadow-xl hover:-translate-y-2 hover:rotate-1 hover:shadow-2xl transition-all duration-300 md:col-span-2 border-2 border-base-200 hover:border-warning/30">
          <div class="card-body">
            <div class="text-warning mb-2 bg-warning/10 w-fit p-4 rounded-2xl">
              <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
            </div>
            <h3 class="card-title text-2xl font-bold">Brzi filteri</h3>
            <p class="text-base-content/70">Filtriraj svoj Gamenote po statusu ili godini izdanja.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="py-20 md:py-28 bg-gradient-to-b from-base-100 to-base-200">
      <div class="max-w-4xl mx-auto text-center px-4">
        <h2 class="text-4xl md:text-5xl font-black mb-6">Spreman za praćenje?</h2>
        <p class="text-base-content/70 text-xl mb-10 max-w-2xl mx-auto font-medium">
          Stvori besplatan račun danas i počni graditi svoju osobnu gaming biblioteku bez ometanja.
        </p>
        <RouterLink to="/register" class="btn btn-primary btn-lg shadow-primary/40 shadow-2xl hover:-translate-y-2 hover:scale-110 transition-all duration-300 text-lg px-10 rounded-full">
          Započni besplatno
        </RouterLink>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import GameCard from '../components/GameCard.vue'

const mounted = ref(false)
const currentFeatureIndex = ref(0)
let intervalId = null

const features = [
  { text: 'Pretraži milijune igara putem', highlight: 'IGDB-a' },
  { text: 'Bilježi vlastite dojmove za', highlight: 'svaku igru' },
  { text: 'Jednostavno označi i prati', highlight: 'svoje statuse' }
]

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

const shuffle = (arr) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const heroRows = marqueeRows.map((row) => ({ ...row, games: shuffle(demoGames).slice(0, 10) }))

onMounted(() => {
  requestAnimationFrame(() => {
    mounted.value = true
  })
  intervalId = setInterval(() => {
    currentFeatureIndex.value = (currentFeatureIndex.value + 1) % features.length
  }, 3500)
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})
</script>

<style scoped>
/* Custom properties postavljene inline preko :style u templateu */
@property --marquee-duration {
  syntax: "<time>";
  inherits: false;
  initial-value: 42s;
}

@property --marquee-direction {
  syntax: "<custom-ident>";
  inherits: false;
  initial-value: normal;
}

/*noinspection CssUnusedSymbol*/
.cycle-enter-active,
.cycle-leave-active {
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}
/*noinspection CssUnusedSymbol*/
.cycle-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}
/*noinspection CssUnusedSymbol*/
.cycle-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}

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