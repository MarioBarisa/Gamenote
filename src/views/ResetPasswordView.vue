<template>
  <div class="min-h-screen flex items-center justify-center bg-base-200 px-4 py-8">
    <div class="card w-full max-w-md bg-base-100 shadow-xl">
      <div class="card-body gap-4 text-left">
        <div class="flex flex-col items-center mb-2">
          <GamenoteBanner class="h-12 w-auto max-w-full object-contain" />
          <h2 class="text-xl font-bold mt-3">{{ $t('common.resetPassword') }}</h2>
        </div>

        <div v-if="successMessage" class="alert alert-success text-sm">
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          <span>{{ successMessage }}</span>
        </div>

        <div v-if="errorMsg" class="alert alert-error text-sm">
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span>{{ errorMsg }}</span>
        </div>

        <MfaSignIn v-if="isRecovery && userStore.pendingMfa" stay-on-page />
        <form v-if="!checking && isRecovery && !userStore.pendingMfa && !successMessage" method="post" @submit.prevent="handleUpdate" class="flex flex-col gap-4">
          <div class="form-control">
            <label class="label" for="new-password">
              <span class="label-text">{{ $t('common.newPassword') }}</span>
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
              <span class="label-text">{{ $t('common.confirmPassword') }}</span>
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
            <template v-if="!updating">{{ $t('resetPasswordView.saveNewPassword') }}</template>
          </button>
        </form>

        <div v-if="checking && !successMessage" class="text-center py-4">
          <p class="text-base-content/60 text-sm">{{ $t('resetPasswordView.waitingForSessionConfirmation') }}</p>
          <span class="loading loading-spinner loading-md mt-2"></span>
        </div>

        <div v-if="successMessage || (!checking && !isRecovery)" class="text-center mt-2">
          <RouterLink to="/login" class="btn btn-primary">{{ $t('resetPasswordView.backToSignIn') }}</RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { t } from '../i18n/index.js';
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase'
import { recoveryState, clearRecovery } from '../services/recoveryState'
import { useAuth } from '../services/useAuth'
import GamenoteBanner from '../components/GamenoteBanner.vue'
import MfaSignIn from '../components/MfaSignIn.vue'
import { useUserStore } from '../stores/user.js'

const router = useRouter()
const userStore = useUserStore()
const { updatePassword } = useAuth()

const isRecovery = computed(() => recoveryState.active)
const checking = ref(true)
const newPassword = ref('')
const confirmPassword = ref('')
const errorMsg = ref('')
const fieldError = ref('')
const confirmError = ref('')
const successMessage = ref('')
const updating = ref(false)

onMounted(async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    if (!session || !recoveryState.active) errorMsg.value = recoveryState.error || t('resetPasswordView.theLinkIsInvalidOr');
    else userStore.setSession(session);
  } catch {
    errorMsg.value = t('resetPasswordView.aPasswordResetSessionIs');
  } finally {
    checking.value = false;
  }
})

watch(isRecovery, active => { if (active) errorMsg.value = ''; })

async function handleUpdate() {
  if (checking.value || updating.value || !isRecovery.value || userStore.pendingMfa) return
  fieldError.value = ''
  confirmError.value = ''
  errorMsg.value = ''

  if (newPassword.value.length < 6) {
    fieldError.value = t('common.yourPasswordMustHaveAt')
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    confirmError.value = 'Lozinke se ne podudaraju.'
    return
  }

  updating.value = true
  const result = await updatePassword(newPassword.value)

  if (result.success) {
    clearRecovery()
    successMessage.value = t('resetPasswordView.passwordChangedSuccessfully')
    setTimeout(() => router.push('/login'), 2000)
  } else {
    errorMsg.value = result.error
  }
  updating.value = false
}
</script>
