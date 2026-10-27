const limits = new Map();

function allowRequest(key, maximum, windowMs = 60000) {
  const now = Date.now();
  for (const [id, item] of limits) if (item.until <= now) limits.delete(id);
  if (!limits.has(key)) {
    if (limits.size >= 5000) return false;
    limits.set(key, { until: now + windowMs, count: 0 });
  }
  const item = limits.get(key);
  item.count++;
  return item.count <= maximum;
}

async function authenticatedUser(authorization, env, request = fetch) {
  if (!/^Bearer [A-Za-z0-9._-]+$/.test(authorization || '')) throw Object.assign(new Error('Prijavi se za ovu radnju.'), { status: 401 });
  if (!env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_ANON_KEY) throw Object.assign(new Error('Usluga trenutačno nije dostupna.'), { status: 503 });
  const response = await request(`${env.VITE_SUPABASE_URL.replace(/\/$/, '')}/auth/v1/user`, {
    headers: { authorization, apikey: env.VITE_SUPABASE_ANON_KEY }, signal: AbortSignal.timeout(10000),
  });
  if (response.status === 401 || response.status === 403) throw Object.assign(new Error('Sesija je istekla. Prijavi se ponovno.'), { status: 401 });
  if (!response.ok) throw new Error('Provjera prijave nije dostupna.');
  const user = await response.json();
  if (!user?.id) throw Object.assign(new Error('Prijavi se za ovu radnju.'), { status: 401 });
  return user;
}

module.exports = { allowRequest, authenticatedUser };
