import { t } from '../i18n/index.js';
import { defineStore } from 'pinia';
import { ref, computed, onScopeDispose } from 'vue';
import { supabase } from '../supabase';
import { useLibraryUiStore } from './libraryUi';

async function fetchSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
}

export const useUserStore = defineStore('user', () => {
  const user = ref(null);
  const pendingMfa = ref(null);
  const isLoggedIn = computed(() => !!user.value);
  const authReady = ref(false);
  const authError = ref('');
  let pendingUser = null;
  let authSubscription = null;
  
  let revision = 0;
  const setSession = (session) => {
    const userData = session?.user || null;
    revision++;
    let previousId = user.value?.id || pendingMfa.value?.userId;
    try { previousId ||= sessionStorage.getItem('gamenote.ui.owner'); } catch { /* Spremnik nije obavezan. */ }
    if (previousId !== userData?.id) {
      useLibraryUiStore().reset();
      try {
        sessionStorage.removeItem('addGameSearchQuery');
        sessionStorage.removeItem('addGameSearchResults');
      } catch { /* Spremnik nije obavezan. */ }
    }
    try {
      if (userData?.id) sessionStorage.setItem('gamenote.ui.owner', userData.id);
      else sessionStorage.removeItem('gamenote.ui.owner');
    } catch { /* Spremnik nije obavezan. */ }
    const factors = userData?.factors?.filter(factor => factor.factor_type === 'totp' && factor.status === 'verified') || [];
    let assurance;
    if (factors.length) {
      try {
        const encoded = session.access_token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        assurance = JSON.parse(atob(encoded)).aal;
      } catch { /* Neprovjerena sesija traži potvrdu. */ }
    }
    pendingMfa.value = factors.length && assurance !== 'aal2'
      ? { userId: userData.id, email: userData.email, factors }
      : null;
    user.value = pendingMfa.value ? null : userData;
    authError.value = '';
    authReady.value = true;
  };
  
  const clearUser = () => {
    setSession(null);
  };
  
  const fetchUser = () => {
    if (pendingUser) return pendingUser;
    authError.value = '';
    const startRevision = revision;
    pendingUser = (async () => {
      try {
        const session = await fetchSession();
        if (startRevision === revision) setSession(session);
        return user.value;
      } catch (error) {
        if (startRevision !== revision) return user.value;
        authReady.value = false;
        authError.value = t('user.signInCouldntBeVerified');
        throw error;
      } finally {
        pendingUser = null;
      }
    })();
    return pendingUser;
  };

  const initializeAuth = () => {
    if (!authSubscription) {
      const { data } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'INITIAL_SESSION') {
          // Prazan događaj može pratiti grešku.
          if (!authReady.value && session?.user) setSession(session);
        } else if (event === 'SIGNED_OUT') {
          clearUser();
        } else if (session?.user) {
          setSession(session);
        }
      });
      authSubscription = data?.subscription;
    }
    if (pendingUser) return pendingUser;
    if (authReady.value) return Promise.resolve(user.value);
    return fetchUser();
  };

  onScopeDispose(() => authSubscription?.unsubscribe());
  
  const logout = async (options) => {
    const { error } = await supabase.auth.signOut(options);
    if (error) throw error;
    clearUser();
  };
  
  return { user, pendingMfa, isLoggedIn, authReady, authError, initializeAuth, setSession, clearUser, fetchUser, logout };
});
