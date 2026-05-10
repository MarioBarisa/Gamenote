<template>
  <div class="overflow-hidden">
    <div class="hero min-h-[calc(85dvh-64px)] bg-base-100 pb-10 relative">
      <!-- Animated Background Blobs -->
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-full z-0 pointer-events-none">
        <div class="absolute top-10 left-10 w-64 h-64 bg-[#F9461F]/20 rounded-full filter blur-3xl opacity-50 animate-blob"></div>
        <div class="absolute top-10 right-10 w-64 h-64 bg-orange-500/20 rounded-full filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
        <div class="absolute -bottom-10 left-1/3 w-64 h-64 bg-rose-500/20 rounded-full filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>
      </div>

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

const mounted = ref(false)
const currentFeatureIndex = ref(0)
let intervalId = null

const features = [
  { text: 'Pretraži milijune igara putem', highlight: 'IGDB-a' },
  { text: 'Bilježi vlastite dojmove za', highlight: 'svaku igru' },
  { text: 'Jednostavno označi i prati', highlight: 'svoje statuse' }
]

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
.cycle-enter-active,
.cycle-leave-active {
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.cycle-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}
.cycle-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}

@keyframes blob {
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
}

.animate-blob {
  animation: blob 7s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}
</style>