import { requestAppApi } from './appApi.js';
import { supabase } from '../supabase.js';

function rasterizeAvatar(url, signal) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    function cleanup() {
      clearTimeout(timer);
      signal.removeEventListener('abort', abort);
      image.onload = image.onerror = null;
    }
    function fail(error) {
      cleanup();
      image.src = '';
      reject(error);
    }
    function abort() { fail(new DOMException('Dohvat je prekinut.', 'AbortError')); }
    const timer = setTimeout(() => fail(new Error('Profilna slika nije dostupna.')), 5000);
    signal.addEventListener('abort', abort, { once: true });
    if (signal.aborted) return abort();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 192;
        const size = Math.min(image.naturalWidth, image.naturalHeight);
        canvas.getContext('2d').drawImage(image, (image.naturalWidth - size) / 2, (image.naturalHeight - size) / 2, size, size, 0, 0, 192, 192);
        const data = canvas.toDataURL('image/png');
        cleanup();
        resolve(data);
      } catch (error) { fail(error); }
    };
    image.onerror = () => fail(new Error('Profilna slika nije dostupna.'));
    image.src = url;
  });
}

export async function loadCardAvatar(url, signal) {
  const source = new URL(url, location.origin);
  if (['http:', 'https:'].includes(source.protocol) && source.origin !== location.origin) {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (!sessionError && session?.access_token) {
      try {
        const requestSignal = AbortSignal.any([signal, AbortSignal.timeout(15000)]);
        const result = await requestAppApi({ action: 'avatar-image', url }, { token: session.access_token, signal: requestSignal });
        return await rasterizeAvatar(result.image, signal);
      } catch (error) {
        if (signal.aborted) throw error;
      }
    }
  }
  return rasterizeAvatar(url, signal);
}
