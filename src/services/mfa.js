import { createPasswordCheckClient, supabase } from '../supabase.js';

export async function checkCurrentPassword(user, password) {
  const { auth } = createPasswordCheckClient();
  const { data, error } = await auth.signInWithPassword({ email: user.email, password });
  if (error) throw error;
  try {
    return data.user?.id === user.id;
  } finally {
    await auth.signOut({ scope: 'local' });
  }
}

export async function verifyTotp(factorId, code) {
  const challenge = await supabase.auth.mfa.challenge({ factorId });
  if (challenge.error) throw challenge.error;
  const verification = await supabase.auth.mfa.verify({ factorId, challengeId: challenge.data.id, code });
  if (verification.error) throw verification.error;
  return verification.data;
}

export async function recoveryCodes(action, details = {}) {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session) throw new Error('session');
  const result = await fetch('/.netlify/functions/mfa-recovery', {
    method: 'POST',
    headers: { authorization: `Bearer ${session.access_token}`, 'content-type': 'application/json' },
    body: JSON.stringify({ action, ...details }),
    signal: AbortSignal.timeout(15_000),
  });
  const data = await result.json();
  if (!result.ok) throw new Error(data.error);
  return data;
}
