import { reactive } from 'vue';

const KEY = 'gamenote.auth.recovery';
const hash = new URLSearchParams(globalThis.location?.hash?.slice(1) || '');
const query = new URLSearchParams(globalThis.location?.search || '');
export const recoveryState = reactive({ active: false, error: hash.get('error_description') || query.get('error_description') || '' });

export function handleRecoveryEvent(event, session) {
  if (event === 'PASSWORD_RECOVERY' && session?.user?.id) {
    recoveryState.active = true;
    recoveryState.error = '';
    try { sessionStorage.setItem(KEY, JSON.stringify({ userId: session.user.id, expiresAt: Date.now() + 3600000 })); } catch { /* Spremnik nije obavezan. */ }
  } else if (event === 'SIGNED_OUT' || !session) {
    clearRecovery();
  } else if (event === 'INITIAL_SESSION') {
    try {
      const saved = JSON.parse(sessionStorage.getItem(KEY));
      recoveryState.active = saved?.userId === session.user.id && saved.expiresAt > Date.now() && !recoveryState.error;
    } catch { recoveryState.active = false; }
  }
}

export function clearRecovery() {
  recoveryState.active = false;
  try { sessionStorage.removeItem(KEY); } catch { /* Spremnik nije obavezan. */ }
}
