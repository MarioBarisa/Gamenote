<template>
  <div class="min-h-screen bg-base-100">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">

      <!-- Language toggle -->
      <div class="flex justify-end mb-8">
        <div class="join">
          <button
            class="join-item btn btn-sm"
            :class="lang === 'hr' ? 'btn-primary' : 'btn-ghost'"
            @click="lang = 'hr'"
          >
            HR
          </button>
          <button
            class="join-item btn btn-sm"
            :class="lang === 'en' ? 'btn-primary' : 'btn-ghost'"
            @click="lang = 'en'"
          >
            EN
          </button>
        </div>
      </div>

      <!-- Logo -->
      <div class="flex justify-center mb-6">
        <img src="../assets/gamenote.png" class="h-20 sm:h-24 w-auto opacity-90" alt="Gamenote" />
      </div>

      <!-- Headline -->
      <h1 class="text-3xl sm:text-4xl font-black text-center mb-2">
        <span v-if="lang === 'hr'">Uvjeti korištenja</span>
        <span v-else>Terms of Service</span>
      </h1>

      <!-- Date -->
      <p class="text-center text-base-content/50 text-sm mb-8">{{ today }}</p>

      <!-- Content card -->
      <div class="card bg-base-200 shadow-xl">
        <div class="card-body p-6 sm:p-8 space-y-6 text-base sm:text-lg leading-relaxed">

          <template v-if="lang === 'hr'">

            <div>
              <h2 class="text-xl font-bold mb-2">1. Tko sam ja</h2>
              <p>
                Gamenote je projekt kojeg u slobodno vrijeme razvija
                <strong>Mario Bariša</strong>. Trudim se da sve radi kako treba,
                ali ne mogu garantirati da će aplikacija uvijek biti dostupna
                ili bez grešaka — na kraju krajeva, čovjek sam, ne firma 😊
              </p>
            </div>

            <div>
              <h2 class="text-xl font-bold mb-2">2. Usluga se pruža "takva kakva je"</h2>
              <p>
                Aplikacija se pruža u trenutnom stanju, bez ikakvih jamstava.
                <strong>Ne preuzimam odgovornost</strong> za bilo kakvu štetu,
                gubitak podataka ili probleme nastale korištenjem Gamenotea.
                Koristiš je na vlastitu odgovornost.
              </p>
            </div>

            <div>
              <h2 class="text-xl font-bold mb-2">3. Dostupnost</h2>
              <p>
                Gamenote može biti izmijenjen, privremeno ugašen ili trajno
                uklonjen bez prethodne najave. Trudit ću se najaviti veće
                promjene, ali ne jamčim da će uvijek biti vremena za to.
              </p>
            </div>

            <div>
              <h2 class="text-xl font-bold mb-2">4. Plaćanja (budućnost)</h2>
              <p>
                Ako u budućnosti uvedem opcionalne kupnje (donacije, premium
                značajke), ista <strong>neće biti povratna</strong>. Cijene i uvjeti
                bit će jasno navedeni prije svake transakcije.
              </p>
            </div>

            <div>
              <h2 class="text-xl font-bold mb-2">5. Tvoji podaci</h2>
              <p>
                Ne prodajem, ne dijelim i ne analiziram tvoje podatke.
                Pregledaj
                <router-link to="/privacy" class="link link-primary">Pravila privatnosti</router-link>
                za više detalja.
              </p>
            </div>

            <div class="divider"></div>

            <p class="text-sm sm:text-base text-base-content/60">
              Imaš pitanje ili nedoumicu? Slobodno mi se javi — tu sam da pomognem 🙌
              <br />
              <a href="mailto:mario@barisa.me" class="link link-hover font-medium">mario@barisa.me</a>
            </p>

          </template>

          <template v-else>

            <div>
              <h2 class="text-xl font-bold mb-2">1. Who I am</h2>
              <p>
                Gamenote is a project built by <strong>Mario Bariša</strong> in his
                free time. I do my best to keep things running, but I can't guarantee
                the app will always be available or bug-free — I'm just one person,
                not a company 😊
              </p>
            </div>

            <div>
              <h2 class="text-xl font-bold mb-2">2. Service is provided "as is"</h2>
              <p>
                The app is provided in its current state, without any warranties.
                <strong>I take no liability</strong> for any damages, data loss, or
                issues arising from using Gamenote. You use it at your own risk.
              </p>
            </div>

            <div>
              <h2 class="text-xl font-bold mb-2">3. Availability</h2>
              <p>
                Gamenote may be modified, temporarily suspended, or permanently taken
                down without prior notice. I'll try to announce major changes, but
                can't promise I'll always have the time.
              </p>
            </div>

            <div>
              <h2 class="text-xl font-bold mb-2">4. Payments (future)</h2>
              <p>
                If optional purchases (donations, premium features) are introduced in
                the future, they will be <strong>non-refundable</strong>. Pricing and
                terms will be clearly stated before each transaction.
              </p>
            </div>

            <div>
              <h2 class="text-xl font-bold mb-2">5. Your data</h2>
              <p>
                I do not sell, share, or analyze your data.
                See the
                <router-link to="/privacy" class="link link-primary">Privacy Policy</router-link>
                for details.
              </p>
            </div>

            <div class="divider"></div>

            <p class="text-sm sm:text-base text-base-content/60">
              Questions or concerns? Feel free to reach out — I'm here to help 🙌
              <br />
              <a href="mailto:mario@barisa.me" class="link link-hover font-medium">mario@barisa.me</a>
            </p>

          </template>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const lang = ref('hr')

const today = computed(() => {
  return new Date().toLocaleDateString(lang.value === 'hr' ? 'hr-HR' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})
</script>
