import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '../supabase';
import { useLibraryUiStore } from './libraryUi';

export const useUserStore = defineStore('user', () => {
  const user = ref(null);
  const isLoggedIn = computed(() => !!user.value);
  
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
  };
  
  const clearUser = () => {
    setUser(null);
  };
  
  const fetchUser = async () => {
    const startRevision = revision;
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      if (startRevision === revision) setUser(session?.user || null);
      return user.value;
    } catch (error) {
      if (startRevision === revision) clearUser();
      throw error;
    }
  };
  
  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    clearUser();
  };
  
  return { user, isLoggedIn, setUser, clearUser, fetchUser, logout };
});
