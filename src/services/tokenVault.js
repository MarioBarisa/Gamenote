// AES-GCM vault; ključ (neekstraktabilan) u IndexedDB. Fail-open.

const DB_NAME = 'gamenote-key-db';
const STORE = 'keys';
const KEY_ID = 'psn';

let cachedKey; // undefined=nije pokušano, null=nedostupan

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getKey() {
  if (cachedKey !== undefined) return cachedKey;
  try {
    if (!globalThis.crypto?.subtle || !globalThis.indexedDB) throw new Error('WebCrypto/IndexedDB nedostupan');
    const db = await openDb();
    const existing = await new Promise((resolve, reject) => {
      const rq = db.transaction(STORE, 'readonly').objectStore(STORE).get(KEY_ID);
      rq.onsuccess = () => resolve(rq.result ?? null);
      rq.onerror = () => reject(rq.error);
    });
    let key = existing ?? null;
    if (!key) {
      key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
      await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).put(key, KEY_ID);
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
      });
    }
    cachedKey = key;
    return key;
  } catch (e) {
    console.warn('[vault] Šifrirani spremnik nedostupan:', e?.message || e);
    cachedKey = null;
    return null;
  }
}

const b64u = {
  enc(buf) {
    const b = new Uint8Array(buf);
    let s = '';
    for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000));
    return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  },
  dec(s) {
    return Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
  }
};

export function isEnvelope(x) {
  return Boolean(x && typeof x === 'object' && x.v === 2 && typeof x.iv === 'string' && typeof x.ct === 'string');
}

export async function seal(obj) {
  const key = await getKey();
  if (!key) return null;
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(JSON.stringify(obj)));
  return { v: 2, alg: 'A256GCM', iv: b64u.enc(iv), ct: b64u.enc(ct) };
}

export async function unseal(envelope) {
  const key = await getKey();
  if (!key || !isEnvelope(envelope)) return null;
  try {
    const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64u.dec(envelope.iv) }, key, b64u.dec(envelope.ct));
    return JSON.parse(new TextDecoder().decode(pt));
  } catch (e) {
    console.warn('[vault] Dešifriranje nije uspjelo:', e?.message || e);
    return null;
  }
}

// novi ključ po vezi
export async function deleteKey() {
  cachedKey = undefined;
  try {
    const db = await openDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).delete(KEY_ID);
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  } catch { /* best effort */ }
}
