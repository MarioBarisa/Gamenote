// src/components/Auth.vue
<template>
  <div class="auth-container p-6 max-w-md mx-auto">
    <div class="tabs tabs-boxed mb-4">
      <a 
        class="tab flex-1" 
        :class="{ 'tab-active': activeTab === 'signin' }" 
        @click="activeTab = 'signin'"
      >
        Prijava
      </a>
      <a 
        class="tab flex-1" 
        :class="{ 'tab-active': activeTab === 'signup' }" 
        @click="activeTab = 'signup'"
      >
        Registracija
      </a>
    </div>
    
    <SignIn v-if="activeTab === 'signin'" />
    <SignUp v-if="activeTab === 'signup'" />
    
  </div>
</template>

<script>
import { ref } from "vue";

import SignIn from "./SignIn.vue";
import SignUp from "./SignUp.vue";


export default {
  components: {
    SignIn,
    SignUp
  },
  setup() {
    const activeTab = ref("signin"); 

    return {
      activeTab
 };
  }
};
</script>
