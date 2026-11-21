<template>
  <MfaDialog v-if="userStore.pendingMfa" :key="dialogKey" :title="$t('mfa.signInTitle')" :busy="busy" @close="cancel">
    <p class="text-sm">{{ $t(useRecovery ? 'mfa.recoveryHint' : 'mfa.signInHint') }}</p>
    <p v-if="error" role="alert" class="alert alert-error alert-soft text-sm">{{ $t(error) }}</p>
    <form method="post" class="flex flex-col gap-4" @submit.prevent="submit">
      <input type="text" name="username" autocomplete="username" :value="userStore.pendingMfa.email" class="hidden" readonly />
      <div v-if="useRecovery" class="flex flex-col items-center gap-2 text-center">
        <label for="mfa-recovery-signin">{{ $t('mfa.recoveryCode') }}</label>
        <input id="mfa-recovery-signin" name="recovery" type="text" class="input w-full font-mono text-center"
          v-model="recovery" autocapitalize="none" autocorrect="off" spellcheck="false"
          :aria-invalid="error === 'mfa.invalidRecoveryCode' || undefined" :disabled="busy" maxlength="64" required />
      </div>
      <template v-else>
        <label v-if="userStore.pendingMfa.factors.length > 1" class="flex flex-col gap-2">
          {{ $t('mfa.authenticator') }}
          <select v-model="factorId" class="select w-full" :disabled="busy">
            <option v-for="factor in userStore.pendingMfa.factors" :key="factor.id" :value="factor.id">
              {{ factor.friendly_name || $t('mfa.authenticator') }}
            </option>
          </select>
        </label>
        <MfaCodeInput v-model="code" :invalid="error === 'mfa.invalidCode'" :disabled="busy" autofocus />
      </template>
      <button type="submit" class="btn btn-primary" :disabled="busy">{{ $t('mfa.verify') }}</button>
      <button type="button" class="link link-primary text-sm self-start" :disabled="busy" @click="switchMethod">
        {{ $t(useRecovery ? 'mfa.useAuthenticator' : 'mfa.useRecoveryCode') }}
      </button>
    </form>
  </MfaDialog>
</template>

<script setup>
import { nextTick, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import MfaCodeInput from './MfaCodeInput.vue';
import MfaDialog from './MfaDialog.vue';
import { recoveryCodes, verifyTotp } from '../services/mfa.js';
import { useAuth } from '../services/useAuth.js';
import { useUserStore } from '../stores/user.js';
import { supabase } from '../supabase.js';

const props = defineProps({ stayOnPage: Boolean });
const emit = defineEmits(['cancelled']);
const userStore = useUserStore();
const { finishSignIn } = useAuth();
const router = useRouter();
const busy = ref(false);
const error = ref('');
const factorId = ref('');
const code = ref('');
const recovery = ref('');
const useRecovery = ref(false);
const dialogKey = ref(0);

watch(() => userStore.pendingMfa?.userId, () => {
  factorId.value = userStore.pendingMfa?.factors[0]?.id || '';
}, { immediate: true });

async function switchMethod() {
  useRecovery.value = !useRecovery.value;
  error.value = '';
  code.value = '';
  recovery.value = '';
  if (useRecovery.value) {
    await nextTick();
    document.getElementById('mfa-recovery-signin')?.focus();
  }
}

async function submit(event) {
  if (busy.value) return;
  const fields = new FormData(event.target);
  busy.value = true;
  error.value = '';
  try {
    if (useRecovery.value) {
      await recoveryCodes('recover', { code: fields.get('recovery') });
      const result = await supabase.auth.refreshSession();
      if (result.error) throw result.error;
      userStore.setSession(result.data.session);
      if (userStore.pendingMfa) {
        factorId.value = userStore.pendingMfa.factors[0].id;
        await switchMethod();
        return;
      }
      if (!props.stayOnPage) await router.push({ name: 'profile', query: { mfa: 'recovered' } });
    } else {
      const session = await verifyTotp(factorId.value, fields.get('totp'));
      userStore.setSession(session);
      if (userStore.pendingMfa) throw new Error('session');
      if (!props.stayOnPage) await finishSignIn();
    }
  } catch (failure) {
    error.value = failure?.code === 'mfa_verification_failed' ? 'mfa.invalidCode'
      : failure?.message === 'code' ? 'mfa.invalidRecoveryCode' : 'mfa.unavailable';
  } finally {
    busy.value = false;
  }
}

async function cancel() {
  if (busy.value) return;
  busy.value = true;
  try {
    await userStore.logout({ scope: 'local' });
    code.value = '';
    recovery.value = '';
    useRecovery.value = false;
    error.value = '';
    emit('cancelled');
  } catch {
    error.value = 'mfa.unavailable';
    dialogKey.value++;
  } finally {
    busy.value = false;
  }
}
</script>
