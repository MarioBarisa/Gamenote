// Šifrirani ključevi odvojeni su po korisniku.

const DB_NAME = 'gamenote-key-db';
const STORE = 'keys';
const cachedKeys = new Map();

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

function getKey(keyId) {
  if (!cachedKeys.has(keyId)) cachedKeys.set(keyId, loadKey(keyId));
  return cachedKeys.get(keyId);
}

async function loadKey(keyId) {
  let db;
  try {
    if (!globalThis.crypto?.subtle || !globalThis.indexedDB) return null;
    db = await openDb();
    const candidate = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      const store = tx.objectStore(STORE);
      const request = store.get(keyId);
      let key;
      request.onsuccess = () => {
        key = request.result || candidate;
        if (!request.result) store.put(key, keyId);
      };
      tx.oncomplete = () => resolve(key);
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.warn('[vault] Šifrirani spremnik nije dostupan.');
    return null;
  } finally {
    db?.close();
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

export async function seal(obj, keyId = 'psn') {
  const key = await getKey(keyId);
  if (!key) return null;
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(JSON.stringify(obj)));
  return { v: 2, alg: 'A256GCM', iv: b64u.enc(iv), ct: b64u.enc(ct) };
}

export async function unseal(envelope, keyId = 'psn') {
  const key = await getKey(keyId);
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
export async function deleteKey(keyId = 'psn') {
  cachedKeys.delete(keyId);
  let db;
  try {
    db = await openDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).delete(keyId);
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  } catch { /* Spremnik možda nije dostupan. */ }
  finally { db?.close(); }
}
