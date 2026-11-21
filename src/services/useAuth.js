import { t } from '../i18n/index.js';
import { ref } from 'vue'
import { supabase } from '../supabase'
import { useUserStore } from '../stores/user'
import { useRouter } from 'vue-router'

const ERROR_MAP = {
  'Invalid login credentials': t('common.incorrectEmailAddressOrPassword'),
  'Email not confirmed': t('useAuth.theEmailAddressHasntBeen'),
  'User already registered': t('useAuth.anAccountWithThatEmail'),
  'Password should be at least 6 characters': t('common.yourPasswordMustHaveAt'),
  'Unable to validate email address: invalid format': t('useAuth.invalidEmailAddressFormat'),
  'Signup requires a valid password': t('useAuth.enterAValidPassword'),
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

  async function finishSignIn() {
    const redirect = router.currentRoute.value.query.redirect
    await router.push(typeof redirect === 'string' && redirect.startsWith('/') && !redirect.startsWith('//') ? redirect : '/')
  }

  async function signIn(email, password) {
    if (loading.value) return false
    loading.value = true
    errorMessage.value = ''
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
      if (error) {
        errorMessage.value = translateError(error.message) || t('useAuth.signInFailedTryAgain')
        return false
      }
      userStore.setSession(data.session)
      if (!userStore.pendingMfa) await finishSignIn()
      return true
    } catch (error) {
      errorMessage.value = translateError(error.message) || t('useAuth.signInFailedTryAgain')
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
      if (error) {
        errorMessage.value = translateError(error.message) || t('useAuth.signUpFailedTryAgain')
        return false
      }
      if (data.session) {
        userStore.setSession(data.session)
        await router.push('/')
      } else {
        successMessage.value = t('useAuth.checkYourEmailAndConfirm')
      }
      return true
    } catch (error) {
      errorMessage.value = translateError(error.message) || t('useAuth.signUpFailedTryAgain')
      return false
    } finally {
      loading.value = false
    }
  }

  async function resetPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/reset-password` })
      if (error) return { success: false, error: translateError(error.message) || t('useAuth.theLinkCouldntBeSent') }
      return { success: true, error: '' }
    } catch (error) {
      return { success: false, error: translateError(error.message) || t('useAuth.theLinkCouldntBeSent') }
    }
  }

  async function updatePassword(newPassword) {
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) return { success: false, error: translateError(error.message) || t('useAuth.thePasswordCouldntBeChanged') }
      return { success: true, error: '' }
    } catch (error) {
      return { success: false, error: translateError(error.message) || t('useAuth.thePasswordCouldntBeChanged') }
    }
  }

  return { loading, errorMessage, successMessage, signIn, finishSignIn, signUp, resetPassword, updatePassword }
}
