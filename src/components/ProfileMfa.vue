<template>
  <div class="border-b border-base-content/10 mb-4 pb-4">
    <div class="flex flex-col gap-3">
      <div>
        <h3 class="font-medium">{{ $t('mfa.title') }}</h3>
        <p class="text-sm mt-1" :class="factors.length ? 'text-success' : 'text-base-content/60'">
          {{ $t(factors.length ? 'mfa.enabled' : 'mfa.disabled') }}
        </p>
      </div>
      <button type="button" class="btn btn-sm btn-outline w-full" @click="opened = true">
        <AchievementIcon name="shield-star" class="size-4" />
        {{ $t('mfa.settings') }}
      </button>
    </div>
    <p v-if="route.query.mfa === 'recovered' && !factors.length" role="status" class="text-sm mt-2">{{ $t('mfa.recovered') }}</p>
    <p v-if="notice && !opened" role="status" class="text-sm mt-2">{{ $t(notice) }}</p>

    <MfaDialog v-if="opened" :title="$t('mfa.title')" :busy="busy" @close="close">
      <p v-if="error" role="alert" class="alert alert-error alert-soft text-sm">{{ $t(error) }}</p>
      <div v-if="!action && !dialog" class="flex flex-col gap-3">
        <p class="text-sm" :class="{ 'text-success': factors.length }">{{ $t(factors.length ? 'mfa.enabled' : 'mfa.disabled') }}</p>
        <p v-if="notice" role="status" class="text-sm">{{ $t(notice) }}</p>
        <ul v-if="factors.length" class="flex flex-col gap-2">
          <li v-for="factor in factors" :key="factor.id" class="flex flex-wrap items-center gap-2">
            <span class="text-sm grow">{{ factor.friendly_name || $t('mfa.authenticator') }}</span>
            <button type="button" class="btn btn-sm btn-ghost" @click="start('codes', factor.id)">{{ $t('mfa.recoveryCodes') }}</button>
            <button type="button" class="btn btn-sm btn-outline" @click="start('disable', factor.id)">{{ $t('mfa.disable') }}</button>
          </li>
        </ul>
        <button v-else type="button" class="btn btn-primary self-start" @click="start('enable')">{{ $t('mfa.enable') }}</button>
      </div>
      <form v-else-if="!dialog" method="post" class="flex flex-col items-start gap-2" @submit.prevent="confirmPassword">
        <label for="mfa-password" class="text-sm font-medium">{{ $t('mfa.confirmPassword') }}</label>
        <input type="text" name="username" autocomplete="username" :value="userStore.user?.email" class="hidden" readonly />
        <input id="mfa-password" v-model="password" type="password" name="password" autocomplete="current-password"
          class="input w-full" :aria-invalid="error === 'mfa.wrongPassword' || undefined" :disabled="busy" required />
        <div class="flex flex-wrap items-center gap-2">
          <button type="submit" class="btn btn-primary" :disabled="busy">{{ $t('mfa.continue') }}</button>
          <button type="button" class="btn btn-ghost" :disabled="busy" @click="reset">{{ $t('mfa.cancel') }}</button>
        </div>
      </form>
      <form v-else-if="dialog === 'enable' && enrollment" method="post" class="flex flex-col gap-4" @submit.prevent="activate">
        <p class="text-sm">{{ $t('mfa.scan') }}</p>
        <img class="size-44 self-center rounded-box bg-white p-2" :src="enrollment.totp.qr_code" :alt="$t('mfa.qrCode')" />
        <div>
          <p class="text-sm mb-2">{{ $t('mfa.setupKey') }}</p>
          <div class="flex flex-wrap gap-2 items-center">
            <pre class="min-w-0 grow overflow-x-auto bg-base-300 rounded-box p-2 text-sm"><code>{{ enrollment.totp.secret }}</code></pre>
            <button type="button" class="btn btn-sm" @click="copy(enrollment.totp.secret)">{{ $t('mfa.copy') }}</button>
          </div>
        </div>
        <MfaCodeInput v-model="code" :invalid="error === 'mfa.invalidCode'" :disabled="busy" />
        <button type="submit" class="btn btn-primary" :disabled="busy">{{ $t('mfa.verifyAndEnable') }}</button>
      </form>
      <form v-else-if="dialog === 'disable'" method="post" class="flex flex-col gap-4" @submit.prevent="disable">
        <p class="text-sm">{{ $t('mfa.disableHint') }}</p>
        <button type="submit" class="btn btn-error self-end" :disabled="busy">{{ $t('mfa.disable') }}</button>
      </form>
      <div v-else-if="codes.length" class="flex flex-col gap-3">
        <p class="text-sm">{{ $t('mfa.saveCodes') }}</p>
        <pre class="bg-base-300 rounded-box p-3 overflow-x-auto text-sm"><code>{{ codes.join('\n') }}</code></pre>
        <div class="flex flex-wrap gap-2">
          <button type="button" class="btn btn-sm" @click="copy(codes.join('\n'))">{{ $t('mfa.copy') }}</button>
          <a class="btn btn-sm" :href="downloadUrl" download="gamenote-recovery-codes.txt">{{ $t('mfa.download') }}</a>
        </div>
      </div>
      <form v-else method="post" class="flex flex-col gap-3" @submit.prevent="issueCodes">
        <p class="text-sm">{{ $t('mfa.generateHint') }}</p>
        <button type="submit" class="btn btn-primary self-end" :disabled="busy">{{ $t('mfa.generate') }}</button>
      </form>
      <p v-if="copyStatus" role="status" class="text-sm">{{ $t(copyStatus) }}</p>
    </MfaDialog>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref } from 'vue';
import { useRoute } from 'vue-router';
import AchievementIcon from './AchievementIcon.vue';
import MfaCodeInput from './MfaCodeInput.vue';
import MfaDialog from './MfaDialog.vue';
import { checkCurrentPassword, recoveryCodes, verifyTotp } from '../services/mfa.js';
import { useUserStore } from '../stores/user.js';
import { supabase } from '../supabase.js';

const userStore = useUserStore();
const route = useRoute();
const factors = computed(() => userStore.user?.factors?.filter(factor =>
  factor.factor_type === 'totp' && factor.status === 'verified') || []);
const opened = ref(false);
const action = ref('');
const dialog = ref('');
const password = ref('');
const code = ref('');
const error = ref('');
const notice = ref('');
const copyStatus = ref('');
const busy = ref(false);
const enrollment = ref(null);
const codes = ref([]);
const downloadUrl = computed(() => 'data:text/plain;charset=utf-8,' + encodeURIComponent(codes.value.join('\n') + '\n'));
let factorId = null;
let disposed = false;

async function start(nextAction, id = null) {
  action.value = nextAction;
  factorId = id;
  notice.value = '';
  await nextTick();
  document.getElementById('mfa-password')?.focus();
}

function reset() {
  action.value = '';
  dialog.value = '';
  password.value = '';
  code.value = '';
  error.value = '';
  copyStatus.value = '';
  codes.value = [];
}

async function confirmPassword() {
  if (busy.value || !userStore.user) return;
  busy.value = true;
  error.value = '';
  const owner = userStore.user;
  try {
    if (!await checkCurrentPassword(owner, password.value)) throw new Error('password');
    if (disposed || userStore.user?.id !== owner.id) return;
    password.value = '';
    if (action.value === 'enable') {
      await recoveryCodes('status');
      if (disposed || userStore.user?.id !== owner.id) return;
      const { data, error: listError } = await supabase.auth.mfa.listFactors();
      if (listError) throw listError;
      const unfinished = data?.all.filter(factor => factor.factor_type === 'totp'
        && factor.status === 'unverified' && factor.friendly_name === 'Gamenote') || [];
      for (const factor of unfinished) {
        const result = await supabase.auth.mfa.unenroll({ factorId: factor.id });
        if (result.error) throw result.error;
      }
      if (data?.totp.length) {
        await userStore.fetchUser();
        throw new Error('factor');
      }
      const result = await supabase.auth.mfa.enroll({ factorType: 'totp', friendlyName: 'Gamenote' });
      if (result.error) throw result.error;
      if (disposed || userStore.user?.id !== owner.id) {
        if (userStore.user?.id === owner.id) await supabase.auth.mfa.unenroll({ factorId: result.data.id });
        return;
      }
      enrollment.value = result.data;
    }
    dialog.value = action.value;
  } catch (failure) {
    error.value = failure?.code === 'invalid_credentials' || ['password', 'Invalid login credentials'].includes(failure?.message)
      ? 'mfa.wrongPassword' : 'mfa.unavailable';
  } finally {
    password.value = '';
    busy.value = false;
  }
}

async function activate(event) {
  if (busy.value || !enrollment.value) return;
  busy.value = true;
  error.value = '';
  try {
    factorId = enrollment.value.id;
    const session = await verifyTotp(factorId, new FormData(event.target).get('totp'));
    enrollment.value = null;
    code.value = '';
    userStore.setSession(session);
    dialog.value = 'codes';
    codes.value = (await recoveryCodes('issue', { factorId })).codes;
  } catch (failure) {
    error.value = failure?.code === 'mfa_verification_failed' ? 'mfa.invalidCode' : 'mfa.unavailable';
  } finally {
    busy.value = false;
    if (disposed) await cleanupEnrollment();
  }
}

async function issueCodes() {
  if (busy.value) return;
  busy.value = true;
  error.value = '';
  try {
    codes.value = (await recoveryCodes('issue', { factorId })).codes;
  } catch {
    error.value = 'mfa.unavailable';
  } finally {
    busy.value = false;
  }
}

async function disable() {
  if (busy.value) return;
  busy.value = true;
  error.value = '';
  try {
    const { error: failure } = await supabase.auth.mfa.unenroll({ factorId });
    if (failure) throw failure;
    await userStore.fetchUser();
    await recoveryCodes('clear', { factorId }).catch(() => {});
    notice.value = 'mfa.removed';
    reset();
  } catch {
    error.value = 'mfa.unavailable';
  } finally {
    busy.value = false;
  }
}

async function cleanupEnrollment() {
  const id = enrollment.value?.id;
  enrollment.value = null;
  if (id) {
    const result = await supabase.auth.mfa.unenroll({ factorId: id });
    if (result.error) notice.value = 'mfa.cleanupFailed';
  }
}

async function close() {
  if (busy.value) return;
  opened.value = false;
  reset();
  await cleanupEnrollment();
}

async function copy(value) {
  try {
    await navigator.clipboard.writeText(value);
    copyStatus.value = 'mfa.copied';
  } catch {
    copyStatus.value = 'mfa.copyFailed';
  }
}

onBeforeUnmount(() => {
  disposed = true;
  if (!busy.value) void cleanupEnrollment();
});
</script>
