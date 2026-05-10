import { ref } from 'vue'
import { supabase } from '../supabase'
import { useUserStore } from '../stores/user'
import { useRouter } from 'vue-router'

const ERROR_MAP = {
  'Invalid login credentials': 'Pogrešna e-mail adresa ili lozinka.',
  'Email not confirmed': 'E-mail adresa nije potvrđena. Provjerite inbox.',
  'User already registered': 'Korisnik s tom e-mail adresom već postoji.',
  'Password should be at least 6 characters': 'Lozinka mora imati najmanje 6 znakova.',
  'Unable to validate email address: invalid format': 'Nevažeći format e-mail adrese.',
  'Signup requires a valid password': 'Unesite valjanu lozinku.',
}

function translateError(msg) {
  return ERROR_MAP[msg] || msg
}

export function useAuth() {
  const userStore = useUserStore()
  const router = useRouter()
  const loading = ref(false)
  const errorMessage = ref('')

  async function signIn(email, password) {
    loading.value = true
    errorMessage.value = ''

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      loading.value = false
      errorMessage.value = translateError(error.message)
      return false
    }

    userStore.setUser(data.user)
    await new Promise(resolve => setTimeout(resolve, 300))
    loading.value = false
    router.push('/')
    return true
  }

  async function signUp(email, password, name) {
    loading.value = true
    errorMessage.value = ''

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    })

    if (error) {
      loading.value = false
      errorMessage.value = translateError(error.message)
      return false
    }

    loading.value = false
    router.push('/')
    return true
  }

  async function resetPassword(email) {
    const resetError = ref('')
    const resetSent = ref(false)

    resetError.value = ''
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      return { success: false, error: translateError(error.message) }
    }

    return { success: true, error: '' }
  }

  async function updatePassword(newPassword) {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      return { success: false, error: translateError(error.message) }
    }
    return { success: true, error: '' }
  }

  return {
    loading,
    errorMessage,
    signIn,
    signUp,
    resetPassword,
    updatePassword,
  }
}
