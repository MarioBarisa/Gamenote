<template>
  <div class="min-h-screen flex items-center justify-center bg-base-200 px-4 py-8">
    <div class="card w-full max-w-md bg-base-100 shadow-xl">
      <div class="card-body gap-4 text-left">
        <div class="flex flex-col items-center mb-2">
          <RouterLink to="/">
            <img src="../assets/gamenote.png" alt="Gamenote" class="h-30 w-auto" />
          </RouterLink>
          <h2 class="text-xl font-bold mt-3">Prijavi se</h2>
        </div>

        <div v-if="errorMessage" class="alert alert-error text-sm">
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span>{{ errorMessage }}</span>
        </div>

        <form @submit.prevent="handleSignin" class="flex flex-col gap-4">
          <div class="form-control">
            <label class="label" for="signin-email">
              <span class="label-text">E-mail</span>
            </label>
            <input
              id="signin-email"
              type="email"
              v-model="email"
              placeholder="ime@primjer.hr"
              class="input input-bordered w-full"
              required
              autocomplete="email"
            />
          </div>

          <div class="form-control">
            <label class="label" for="signin-password">
              <span class="label-text">Lozinka</span>
            </label>
            <div class="relative">
              <input
                id="signin-password"
                :type="showPassword ? 'text' : 'password'"
                v-model="password"
                placeholder="••••••••"
                class="input input-bordered w-full pr-12"
                required
                autocomplete="current-password"
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 btn btn-ghost btn-xs btn-circle"
                @click="showPassword = !showPassword"
                :aria-label="showPassword ? 'Sakrij lozinku' : 'Prikaži lozinku'"
              >
                <svg v-if="!showPassword" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                <svg v-else viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              </button>
            </div>
            <div class="flex justify-end mt-1">
              <a class="link link-primary text-sm cursor-pointer" @click="showResetModal = true">Zaboravio si lozinku?</a>
            </div>
          </div>

          <div class="form-control">
            <label class="label cursor-pointer justify-start gap-3">
              <input type="checkbox" class="checkbox checkbox-primary checkbox-sm" />
              <span class="label-text text-sm">Zapamti me</span>
            </label>
          </div>

          <button
            type="submit"
            class="btn btn-primary w-full btn-lg"
            :disabled="loading"
          >
            <span v-if="loading" class="loading loading-spinner loading-sm"></span>
            <template v-if="!loading">Prijava</template>
          </button>
        </form>

        <div class="divider text-xs text-base-content/40">ili</div>

        <p class="text-center text-sm text-base-content/60">
          Nemaš račun?
          <RouterLink to="/register" class="link link-primary font-semibold">Registriraj se.</RouterLink>
        </p>
      </div>
    </div>

    <dialog class="modal" :class="{ 'modal-open': showResetModal }">
      <div class="modal-box">
        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" @click="closeResetModal">
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <h3 class="font-bold text-lg">Resetiranje lozinke</h3>
        <p class="text-base-content/60 text-sm mt-1">Unesite svoju e-mail adresu i poslat ćemo vam link za resetiranje.</p>

        <div v-if="resetSent" class="alert alert-success mt-4 text-sm">
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          <span>Link za resetiranje poslan je na vašu e-mail adresu.</span>
        </div>

        <div v-if="resetError" class="alert alert-error mt-4 text-sm">
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span>{{ resetError }}</span>
        </div>

        <form v-if="!resetSent" @submit.prevent="handleReset" class="mt-4 flex flex-col gap-3">
          <input
            type="email"
            v-model="resetEmail"
            placeholder="ime@primjer.hr"
            class="input input-bordered w-full"
            required
          />
          <button type="submit" class="btn btn-primary w-full" :disabled="resetLoading">
            <span v-if="resetLoading" class="loading loading-spinner loading-sm"></span>
            <template v-if="!resetLoading">Pošalji link</template>
          </button>
        </form>

        <div class="modal-action" v-if="resetSent">
          <button class="btn" @click="closeResetModal">Zatvori</button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop" @click="closeResetModal">
        <button>zatvori</button>
      </form>
    </dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuth } from '../services/useAuth'

const { loading, errorMessage, signIn } = useAuth()

const email = ref('')
const password = ref('')
const showPassword = ref(false)

const showResetModal = ref(false)
const resetEmail = ref('')
const resetSent = ref(false)
const resetError = ref('')
const resetLoading = ref(false)

const { resetPassword } = useAuth()

async function handleSignin() {
  await signIn(email.value, password.value)
}

async function handleReset() {
  resetLoading.value = true
  resetError.value = ''
  const result = await resetPassword(resetEmail.value)
  if (result.success) {
    resetSent.value = true
  } else {
    resetError.value = result.error
  }
  resetLoading.value = false
}

function closeResetModal() {
  showResetModal.value = false
  resetEmail.value = ''
  resetSent.value = false
  resetError.value = ''
}
</script>
