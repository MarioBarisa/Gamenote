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
        <span v-if="lang === 'hr'">Gamenote vjeruje u privatnost</span>
        <span v-else>Gamenote believes in privacy</span>
      </h1>

      <!-- Date -->
      <p class="text-center text-base-content/50 text-sm mb-8">{{ today }}</p>

      <!-- Content card -->
      <div class="card bg-base-200 shadow-xl">
        <div class="card-body p-6 sm:p-8 space-y-4 text-base sm:text-lg leading-relaxed">

          <template v-if="lang === 'hr'">
            <p>
              Tvoji podaci su <strong>tvoji</strong>. Gamenote ne koristi tvoje podatke za
              AI treniranje, oglašavanje, analitiku, prodaju ili dijeljenje s trećim stranama.
            </p>
            <p>
              Sve što uneseš u aplikaciju ostaje isključivo za tvoje osobno praćenje
              videoigara. Ne prikupljamo, ne analiziramo i ne dijelimo tvoje podatke
              — nikada.
            </p>
            <p>
              Prijava i autentifikacija odvijaju se putem
              <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" class="link link-primary">Supabase</a>
              platforme. Korištenjem Gamenotea pristaješ na
              <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" class="link link-primary">Supabase Privacy Policy</a>.
            </p>
          </template>

          <template v-else>
            <p>
              Your data is <strong>yours</strong>. Gamenote does not use your data for
              AI training, advertising, analytics, selling, or sharing with third parties.
            </p>
            <p>
              Everything you enter stays exclusively for your personal video game tracking.
              We do not collect, analyze, or share your data — ever.
            </p>
            <p>
              Login and authentication are handled through
              <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" class="link link-primary">Supabase</a>.
              By using Gamenote you agree to the
              <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" class="link link-primary">Supabase Privacy Policy</a>.
            </p>
          </template>

          <div class="divider"></div>

          <p class="text-sm sm:text-base text-base-content/60">
            <template v-if="lang === 'hr'">Pitanja?</template>
            <template v-else>Questions?</template>
            <br />
            <a href="mailto:privacy@gamenote.eu" class="link link-hover font-medium">privacy@gamenote.eu</a>
          </p>

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
