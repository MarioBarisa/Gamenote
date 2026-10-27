export async function requestAppApi(payload, options = {}) {
  const response = await fetch('/.netlify/functions/app-api', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(options.token ? { authorization: `Bearer ${options.token}` } : {}) },
    body: JSON.stringify(payload),
    signal: options.signal || AbortSignal.timeout(20000),
  });
  const data = await response.json().catch(() => { throw new Error('Servis nije dostupan. Pokušaj ponovno.'); });
  if (!response.ok) throw new Error(data.error || 'Dohvat nije uspio. Pokušaj ponovno.');
  return data;
}
