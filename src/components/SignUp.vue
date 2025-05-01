<template>
  <div>
    <h2 class="text-xl mb-4">Registracija računa</h2>
    <form @submit.prevent="handleSignup" class="flex flex-col gap-3">
      <div class="form-control">
        <label for="name" class="label">Ime</label>
        <input id="name" type="text" v-model="name" class="input input-bordered" required />
      </div>
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
          {{ loading ? 'Učitavanje...' : 'Registracija' }}
        </button>
      </div>
      <p v-if="errorMessage" class="text-error">{{ errorMessage }}</p>
    </form>
  </div>
</template>

<script>
import { ref } from "vue";
import { supabase } from "../supabase";
import { useRouter } from "vue-router";

export default {
  setup() {
    const name = ref("");
    const email = ref("");
    const password = ref("");
    const errorMessage = ref("");
    const loading = ref(false);
    const router = useRouter();

    const validateEmail = (email) => {
      return email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    };

    const handleSignup = async () => {
      if (password.value.length < 6) {
        return errorMessage.value = "Lozinka mora imati najmanje 6 znakova";
      }

      if (!validateEmail(email.value)) {
        return errorMessage.value = "Email adresa nije valjana";
      }

      loading.value = true;
      errorMessage.value = "";

      const { data, error } = await supabase.auth.signUp({
        email: email.value,
        password: password.value,
        options: {
          data: {
            name: name.value
          }
        }
      });

      if (error) {
        loading.value = false;
        return errorMessage.value = error.message;
      }

      // Korisnik je stvoren, preusmjeri na home
      router.push("/");
      loading.value = false;
    };

    return {
      name,
      email,
      password,
      errorMessage,
      loading,
      handleSignup
    };
  }
};
</script>
