<template>
  <div>
    <h2 class="text-xl mb-4">Prijava putem Magic Linka</h2>
    <form @submit.prevent="handleMagicLink" class="flex flex-col gap-3">
      <div class="form-control">
        <label for="email" class="label">Email</label>
        <input id="email" type="email" v-model="email" class="input input-bordered" required />
      </div>
      <div class="form-control mt-2">
        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ loading ? 'Slanje...' : 'Pošalji Magic Link' }}
        </button>
      </div>
      <p v-if="message" class="text-success">{{ message }}</p>
      <p v-if="errorMessage" class="text-error">{{ errorMessage }}</p>
    </form>
  </div>
</template>

<script>
import { ref } from "vue";
import { supabase } from "../supabase";

export default {
  setup() {
    const email = ref("");
    const message = ref("");
    const errorMessage = ref("");
    const loading = ref(false);

    const handleMagicLink = async () => {
      loading.value = true;
      errorMessage.value = "";
      message.value = "";

      const { error } = await supabase.auth.signInWithOtp({
        email: email.value,
      });

      if (error) {
        loading.value = false;
        return errorMessage.value = error.message;
      }

      message.value = "Magic link je poslan na vašu email adresu!";
      loading.value = false;
    };

    return {
      email,
      message,
      errorMessage,
      loading,
      handleMagicLink
    };
  }
};
</script>
