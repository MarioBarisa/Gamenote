<template>
  <div class="min-h-screen flex items-center justify-center bg-base-200 px-4 py-8">
    <div class="card w-full max-w-md bg-base-100 shadow-xl">
      <div class="card-body gap-4 text-left">
        <div class="flex flex-col items-center mb-2">
          <RouterLink to="/">
            <GamenoteBanner class="h-12 w-auto max-w-full object-contain" />
          </RouterLink>
          <h2 class="text-xl font-bold mt-3">{{ $t('common.signUpLabel') }}</h2>
        </div>

        <div role="alert" v-if="errorMessage" class="alert alert-error text-sm">
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span>{{ errorMessage }}</span>
        </div>

<div v-if="successMessage" role="status" class="alert alert-success mb-4">{{ successMessage }}</div>
        <form @submit.prevent="handleSignup" class="flex flex-col gap-4">
          <div class="form-control">
            <label class="label" for="signup-username">
              <span class="label-text">{{ $t('signUp.displayName') }}</span>
            </label>
            <input
              id="signup-username"
              :aria-invalid="!!fieldErrors.name" :aria-describedby="fieldErrors.name ? 'signup-username-error' : undefined"
              @input="fieldErrors.name = ''"
              type="text"
              v-model="name"
              :placeholder="$t('signUp.displayName')"
              class="input input-bordered w-full"
              required
              autocomplete="nickname"
              @blur="validateName"
            />
            <p id="signup-username-error" v-if="fieldErrors.name" role="alert" class="text-error text-sm mt-1">{{ fieldErrors.name }}</p>
          </div>

          <div class="form-control">
            <label class="label" for="signup-email">
              <span class="label-text">{{ $t('common.emailAddress') }}</span>
            </label>
            <input
              id="signup-email"
              :aria-invalid="!!fieldErrors.email" :aria-describedby="fieldErrors.email ? 'signup-email-error' : undefined"
              @input="fieldErrors.email = ''"
              type="email"
              v-model="email"
              :placeholder="$t('common.emailExample')"
              class="input input-bordered w-full"
              required
              autocomplete="email"
              @blur="validateEmail"
            />
            <p id="signup-email-error" v-if="fieldErrors.email" role="alert" class="text-error text-sm mt-1">{{ fieldErrors.email }}</p>
          </div>

          <div class="form-control">
            <label class="label" for="signup-password">
              <span class="label-text">{{ $t('common.password') }}</span>
            </label>
            <div class="relative">
              <input
                id="signup-password"
              :aria-invalid="!!fieldErrors.password" :aria-describedby="fieldErrors.password ? 'signup-password-error' : undefined"
              @input="fieldErrors.password = ''"
                :type="showPassword ? 'text' : 'password'"
                v-model="password"
                placeholder="••••••••"
                class="input input-bordered w-full pr-12"
                required
                autocomplete="new-password"
                @blur="validatePassword"
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 btn btn-ghost btn-xs btn-circle"
                @click="showPassword = !showPassword"
                :aria-label="showPassword ? $t('common.hidePassword') : $t('common.showPassword')"
              >
                <svg v-if="!showPassword" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                <svg v-else viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              </button>
            </div>
            <div v-if="password" class="mt-2">
              <span class="badge text-xs" :class="passwordStrength.cls">{{ passwordStrength.label }}</span>
            </div>
            <p id="signup-password-error" v-if="fieldErrors.password" role="alert" class="text-error text-sm mt-1">{{ fieldErrors.password }}</p>
          </div>

          <div class="form-control">
            <label class="label" for="signup-confirm-password">
              <span class="label-text">{{ $t('common.confirmPassword') }}</span>
            </label>
            <input
              id="signup-confirm-password"
              :aria-invalid="!!fieldErrors.confirmPassword" :aria-describedby="fieldErrors.confirmPassword ? 'signup-confirm-password-error' : undefined"
              @input="fieldErrors.confirmPassword = ''"
              :type="showPassword ? 'text' : 'password'"
              v-model="confirmPassword"
              placeholder="••••••••"
              class="input input-bordered w-full"
              required
              autocomplete="new-password"
              @blur="validateConfirmPassword"
            />
            <p id="signup-confirm-password-error" v-if="fieldErrors.confirmPassword" role="alert" class="text-error text-sm mt-1">{{ fieldErrors.confirmPassword }}</p>
          </div>

          <button
            type="submit"
            class="btn btn-primary w-full btn-lg mt-2"
            :disabled="loading"
          >
            <span v-if="loading" class="loading loading-spinner loading-sm"></span>
            <span>{{ $t('common.createAccount') }}</span>
          </button>
        </form>

        <div class="divider text-xs text-base-content/40">{{ $t('common.or') }}</div>

        <p class="text-center text-sm text-base-content/60">
          {{ $t('signUp.alreadyHaveAnAccount') }}
          <RouterLink to="/login" class="link link-primary font-semibold">{{ $t('signUp.signIn') }}</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { t } from '../i18n/index.js';
import { ref, computed, reactive, nextTick } from 'vue'
import { useAuth } from '../services/useAuth'
import GamenoteBanner from './GamenoteBanner.vue'

const { loading, errorMessage, successMessage, signUp } = useAuth()

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)

const fieldErrors = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const passwordStrength = computed(() => {
  const p = password.value
  if (p.length < 6) return { label: t('signUp.tooWeak'), cls: 'badge-error' }
  if (p.length < 10 || !/[0-9]/.test(p) || !/[^a-zA-Z0-9]/.test(p))
    return { label: t('signUp.fair'), cls: 'badge-warning' }
  return { label: t('signUp.strong'), cls: 'badge-success' }
})

function validateName() {
  fieldErrors.name = name.value.trim() ? '' : 'Prikazno ime je obavezno.'
}

function validateEmail() {
  if (!email.value.trim()) {
    fieldErrors.email = 'E-mail adresa je obavezna.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    fieldErrors.email = 'Unesite valjanu e-mail adresu.'
  } else {
    fieldErrors.email = ''
  }
}

function validatePassword() {
  fieldErrors.password = password.value.length < 6 ? t('common.yourPasswordMustHaveAt') : ''
}

function validateConfirmPassword() {
  fieldErrors.confirmPassword = password.value !== confirmPassword.value ? 'Lozinke se ne podudaraju.' : ''
}

function validateAll() {
  validateName()
  validateEmail()
  validatePassword()
  validateConfirmPassword()
  return !fieldErrors.name && !fieldErrors.email && !fieldErrors.password && !fieldErrors.confirmPassword
}

async function handleSignup() {
  if (!validateAll()) {
    await nextTick();
    document.querySelector('[aria-invalid="true"]')?.focus();
    return
  }
  await signUp(email.value, password.value, name.value)
}
</script>
