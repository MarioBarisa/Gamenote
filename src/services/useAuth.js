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

  const successMessage = ref('')

  async function signIn(email, password) {
    if (loading.value) return false
    loading.value = true
    errorMessage.value = ''
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
      if (error) throw error
      userStore.setUser(data.user)
      await router.push('/')
      return true
    } catch (error) {
      errorMessage.value = translateError(error.message) || 'Prijava nije uspjela. Pokušaj ponovno.'
      return false
    } finally {
      loading.value = false
    }
  }

  async function signUp(email, password, name) {
    if (loading.value) return false
    loading.value = true
    errorMessage.value = ''
    successMessage.value = ''
    try {
      const { data, error } = await supabase.auth.signUp({ email: email.trim(), password, options: { data: { name: name.trim() } } })
      if (error) throw error
      if (data.session) {
        userStore.setUser(data.user)
        await router.push('/')
      } else {
        successMessage.value = 'Provjeri e-mail i potvrdi adresu prije prijave.'
      }
      return true
    } catch (error) {
      errorMessage.value = translateError(error.message) || 'Registracija nije uspjela. Pokušaj ponovno.'
      return false
    } finally {
      loading.value = false
    }
  }

  async function resetPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/reset-password` })
      if (error) throw error
      return { success: true, error: '' }
    } catch (error) {
      return { success: false, error: translateError(error.message) || 'Slanje poveznice nije uspjelo.' }
    }
  }

  async function updatePassword(newPassword) {
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      return { success: true, error: '' }
    } catch (error) {
      return { success: false, error: translateError(error.message) || 'Promjena lozinke nije uspjela.' }
    }
  }

  return { loading, errorMessage, successMessage, signIn, signUp, resetPassword, updatePassword }
}
