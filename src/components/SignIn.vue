<template>
  <div>
    <h2 class="text-xl mb-4">Prijava</h2>
    <form @submit.prevent="handleSignin" class="flex flex-col items-start gap-2">
      <div class="form-control">
        <label for="email" class="label">Email</label>
        <input id="email" type="email" v-model="email" class="input input-bordered" required />
      </div>
      <div class="form-control">
        <label for="password" class="label">Lozinka</label>
        <input id="password" type="password" v-model="password" class="input input-bordered" required />
      </div>
      <div class="form-control mt-2">
        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ loading ? 'Učitavanje...' : 'Prijava' }}
        </button>
         <br> 
         <router-link to="/register" class="btn btn-outline btn-primary mt-2"> ili se Registrirajte</router-link>  
      </div>
      <p v-if="errorMessage" class="text-error">{{ errorMessage }}</p>
    </form>
  </div>
</template>

<script>
import { ref } from "vue";
import { supabase } from "../supabase";
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/user";

export default {
  setup() {
    const email = ref("");
    const password = ref("");
    const errorMessage = ref("");
    const loading = ref(false);
    const router = useRouter();
    const userStore = useUserStore();

    const handleSignin = async () => {
      loading.value = true;
      errorMessage.value = "";

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value,
      });

      if (error) {
        loading.value = false;
        return errorMessage.value = error.message;
      }

      // user data -> store
      userStore.setUser(data.user);
      
      // cekaj da budeš siguran da je veza sa supabase-om uspjela
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // preusmjeri na home
      router.push("/");
      loading.value = false;
    };

    return {
      email,
      password,
      errorMessage,
      loading,
      handleSignin
    };
  }
};
</script>
