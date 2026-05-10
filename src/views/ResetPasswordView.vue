<template>
  <div class="min-h-screen flex items-center justify-center bg-base-200 px-4 py-8">
    <div class="card w-full max-w-md bg-base-100 shadow-xl">
      <div class="card-body gap-4 text-left">
        <div class="flex flex-col items-center mb-2">
          <img src="../assets/gamenote.png" alt="Gamenote" class="h-30 w-auto" />
          <h2 class="text-xl font-bold mt-3">Resetiranje lozinke</h2>
        </div>

        <div v-if="successMessage" class="alert alert-success text-sm">
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          <span>{{ successMessage }}</span>
        </div>

        <div v-if="errorMsg" class="alert alert-error text-sm">
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span>{{ errorMsg }}</span>
        </div>

        <form v-if="isRecovery && !successMessage" @submit.prevent="handleUpdate" class="flex flex-col gap-4">
          <div class="form-control">
            <label class="label" for="new-password">
              <span class="label-text">Nova lozinka</span>
            </label>
            <input
              id="new-password"
              type="password"
              v-model="newPassword"
              placeholder="••••••••"
              class="input input-bordered w-full"
              required
              autocomplete="new-password"
            />
            <p v-if="fieldError" class="text-error text-sm mt-1">{{ fieldError }}</p>
          </div>

          <div class="form-control">
            <label class="label" for="confirm-new-password">
              <span class="label-text">Potvrdi lozinku</span>
            </label>
            <input
              id="confirm-new-password"
              type="password"
              v-model="confirmPassword"
              placeholder="••••••••"
              class="input input-bordered w-full"
              required
              autocomplete="new-password"
            />
            <p v-if="confirmError" class="text-error text-sm mt-1">{{ confirmError }}</p>
          </div>

          <button type="submit" class="btn btn-primary w-full btn-lg" :disabled="updating">
            <span v-if="updating" class="loading loading-spinner loading-sm"></span>
            <template v-if="!updating">Spremi novu lozinku</template>
          </button>
        </form>

        <div v-if="!isRecovery && !successMessage" class="text-center py-4">
          <p class="text-base-content/60 text-sm">Čekanje na potvrdu sesije...</p>
          <span class="loading loading-spinner loading-md mt-2"></span>
        </div>

        <div v-if="successMessage" class="text-center mt-2">
          <RouterLink to="/login" class="btn btn-primary">Natrag na prijavu</RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase'
import { useAuth } from '../services/useAuth'

const router = useRouter()
const { updatePassword } = useAuth()

const isRecovery = ref(false)
const newPassword = ref('')
const confirmPassword = ref('')
const errorMsg = ref('')
const fieldError = ref('')
const confirmError = ref('')
const successMessage = ref('')
const updating = ref(false)

onMounted(() => {
  supabase.auth.onAuthStateChange(async (event) => {
    if (event === 'PASSWORD_RECOVERY') {
      isRecovery.value = true
    }
  })
})

async function handleUpdate() {
  fieldError.value = ''
  confirmError.value = ''
  errorMsg.value = ''

  if (newPassword.value.length < 6) {
    fieldError.value = 'Lozinka mora imati najmanje 6 znakova.'
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    confirmError.value = 'Lozinke se ne podudaraju.'
    return
  }

  updating.value = true
  const result = await updatePassword(newPassword.value)

  if (result.success) {
    successMessage.value = 'Lozinka je uspješno promijenjena.'
    setTimeout(() => router.push('/login'), 2000)
  } else {
    errorMsg.value = result.error
  }
  updating.value = false
}
</script>
