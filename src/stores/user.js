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
  const isLoggedIn = computed(() => !!user.value);
  const authReady = ref(false);
  const authError = ref('');
  let pendingUser = null;
  let authSubscription = null;
  
  let revision = 0;
  const setUser = (userData) => {
    revision++;
    let previousId = user.value?.id;
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
    user.value = userData || null;
    authError.value = '';
    authReady.value = true;
  };
  
  const clearUser = () => {
    setUser(null);
  };
  
  const fetchUser = () => {
    if (pendingUser) return pendingUser;
    authError.value = '';
    const startRevision = revision;
    pendingUser = (async () => {
      try {
        const session = await fetchSession();
        if (startRevision === revision) setUser(session?.user || null);
        return user.value;
      } catch (error) {
        if (startRevision !== revision) return user.value;
        authReady.value = false;
        authError.value = 'Provjera prijave nije uspjela. Provjeri vezu i pokušaj ponovno.';
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
          if (!authReady.value && session?.user) setUser(session.user);
        } else if (event === 'SIGNED_OUT') {
          clearUser();
        } else if (session?.user) {
          setUser(session.user);
        }
      });
      authSubscription = data?.subscription;
    }
    if (pendingUser) return pendingUser;
    if (authReady.value) return Promise.resolve(user.value);
    return fetchUser();
  };

  onScopeDispose(() => authSubscription?.unsubscribe());
  
  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    clearUser();
  };
  
  return { user, isLoggedIn, authReady, authError, initializeAuth, setUser, clearUser, fetchUser, logout };
});
