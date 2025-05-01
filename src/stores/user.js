import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '../supabase';

export const useUserStore = defineStore('user', () => {
  const user = ref(null);
  const isLoggedIn = computed(() => !!user.value);
  
  const setUser = (userData) => {
    user.value = userData;
  };
  
  const clearUser = () => {
    user.value = null;
  };
  
  const fetchUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setUser(session.user);
      return session.user;
    }
    return null;
  };
  
  const logout = async () => {
    await supabase.auth.signOut();
    clearUser();
  };
  
  return { user, isLoggedIn, setUser, clearUser, fetchUser, logout };
});
