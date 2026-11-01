<template>
  <div class="overflow-hidden">
    <div class="hero min-h-[calc(85dvh-64px)] bg-base-100 pb-10 relative">
      <!-- Rotirajući GameCards (Netflix stil) -->
    <LandingMarquee v-if="mounted" />

    <!-- Overlay za čitljivost teksta -->
    <div class="absolute inset-0 z-[1] bg-base-100/60 backdrop-blur-[1.8px] pointer-events-none" aria-hidden="true"></div>

    <!-- Glatki prijelaz prema sadržaju iznad i ispod -->
    <div class="absolute inset-x-0 top-0 h-20 sm:h-24 z-[1] bg-gradient-to-b from-base-100 to-transparent pointer-events-none" aria-hidden="true"></div>
    <div class="absolute inset-x-0 bottom-0 h-20 sm:h-28 z-[1] bg-gradient-to-t from-base-100 via-base-100/40 to-transparent pointer-events-none" aria-hidden="true"></div>

    <div class="hero-content text-center flex-col relative z-10">
        
        <GamenoteBanner
             class="w-64 sm:w-80 md:w-96 max-w-full h-auto object-contain drop-shadow-2xl" />
             
        <div class="max-w-3xl mt-4">
          <h1 class="text-4xl md:text-6xl font-extrabold text-base-content mb-6">Tvoj gaming dnevnik<span class="text-[#F9461F]">.</span></h1>
          <p class="text-lg md:text-xl text-base-content/80 mb-8 max-w-2xl mx-auto">
            Organiziraj igre koje igraš, koje si završio i koje te još čekaju. Zapiši dojmove, prati vrijeme i napredak.
          </p>

          <div class="flex flex-col sm:flex-row gap-4 justify-center w-full px-4 sm:px-0">
            <RouterLink to="/register" class="btn btn-primary btn-lg  shadow-xl sm:w-auto w-full hover:-translate-y-1 hover:scale-105 transition-all">Stvori račun</RouterLink>
            <RouterLink to="/login" class="btn btn-outline btn-lg sm:w-auto w-full hover:-translate-y-1 transition-all bg-base-100/50 backdrop-blur-sm">Prijava</RouterLink>
          </div>
        </div>
      </div>
    </div>

    <section id="mogucnosti" class="py-16 md:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10 scroll-mt-8">
      <div class="mb-12 text-center md:text-left">
        <h2 class="text-3xl md:text-5xl font-black mb-4 tracking-tight text-[#F9461F]">Svaka igra ima svoju priču.</h2>
        <p class="text-base-content/70 text-xl max-w-2xl">Sačuvaj gdje si stao, što te oduševilo i što želiš igrati sljedeće.</p>
      </div>
      <div class="features-grid">
        <article class="feature-card feature-library">
          <div class="feature-copy">
            <span class="feature-label text-[#F9461F]">✦ Tvoja kolekcija</span>
            <h3 class="text-2xl md:text-3xl font-bold">Biblioteka kroz sve faze igranja</h3>
            <p class="text-base-content/70 text-lg">Za ono što igraš sada. I sve što dolazi poslije. Posloži igre po statusima i svojim grupama.</p>
          </div>
          <LandingPreview kind="library" />
        </article>
        <article class="feature-card feature-details">
          <div class="feature-copy">
            <span class="feature-label text-warning">✦ Istraži svaki detalj</span>
            <h3 class="text-2xl font-bold">Sve o igri, na jednom mjestu</h3>
            <p class="text-base-content/70 text-lg">Od sinopsisa i galerije do ESRB oznake, Metacritic ocjene i igara iz istog serijala — lako pronađi dostupne informacije.</p>
          </div>
          <LandingPreview kind="details" />
        </article>
        <article class="feature-card feature-import">
          <div class="feature-copy">
            <span class="feature-label text-accent">↓ Manje prepisivanja</span>
            <h3 class="text-2xl font-bold">Steam i PlayStation importeri</h3>
            <p class="text-base-content/70 text-lg">Uvezi odabrane igre, dostupne sate i postignuća. Ostale dodaj ručno uz Gamenote katalog.</p>
          </div>
          <LandingPreview kind="import" />
          <p class="text-xs text-base-content/60 px-1">Steam traži javni profil i detalje igara; PlayStation povezuješ prema uputama importera.</p>
        </article>
        <article class="feature-card feature-summary">
          <div class="feature-copy">
            <span class="feature-label text-success">↗ Svaki sat se računa</span>
            <h3 class="text-2xl md:text-3xl font-bold">Tvoj pregled igranja</h3>
            <p class="text-base-content/70 text-lg">Sati, statistike i napredak tvoje kolekcije. A za uspomenu — vlastita gamerska kartica.</p>
          </div>
          <LandingPreview kind="summary" />
        </article>
      </div>
      <p class="text-center text-base-content/70 mt-12 max-w-2xl mx-auto">Tvoj dnevnik, bez oglasa, alata za praćenje i prodaje osobnih podataka. <RouterLink to="/privacy" class="link">Pročitaj pravila privatnosti</RouterLink>.</p>
    </section>

    <section class="py-20 md:py-28 bg-gradient-to-b from-base-100 to-base-200">
      <div class="max-w-4xl mx-auto text-center px-4">
        <h2 class="text-4xl md:text-5xl font-black mb-6">Koju ćeš igru prvu zapisati?</h2>
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
import { ref, onMounted, defineAsyncComponent } from 'vue'
import GamenoteBanner from '../components/GamenoteBanner.vue'
import LandingPreview from '../components/LandingPreview.vue'

const LandingMarquee = defineAsyncComponent(() => import('../components/LandingMarquee.vue'))
const mounted = ref(false)
onMounted(() => { mounted.value = true })
</script>

<style scoped>
.features-grid { display: grid; grid-template-columns: minmax(0, 1fr); gap: 1.5rem; }
.feature-card { display: grid; gap: 1.5rem; padding: 1.5rem; border: 1px solid var(--color-base-300); border-radius: 1.75rem; background: var(--color-base-100); box-shadow: 0 10px 30px #0001; min-width: 0; }
.feature-copy { display: flex; flex-direction: column; justify-content: center; gap: 1rem; padding: .5rem; }
.feature-label { font-size: .8rem; font-weight: 700; }
.feature-import, .feature-summary { align-content: start; }
@media (min-width: 1024px) {
  .features-grid { grid-template-columns: repeat(12, minmax(0, 1fr)); gap: 2rem; }
  .feature-library, .feature-details { grid-column: span 12; }
  .feature-library { grid-template-columns: minmax(0, .8fr) minmax(0, 1.2fr); align-items: center; padding: 2rem; gap: 2rem; }
  .feature-import { grid-column: span 4; }
  .feature-summary { grid-column: span 8; }
}
@media (max-width: 480px) { .feature-card { padding: .75rem; gap: 1rem; } .feature-copy { padding: .75rem; } }
</style>
