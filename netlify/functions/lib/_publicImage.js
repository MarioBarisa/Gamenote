const { lookup } = require('node:dns/promises');
const { isIP } = require('node:net');
const http = require('node:http');
const https = require('node:https');

function publicAddress(address) {
  if (isIP(address) === 4) {
    const [a, b, c] = address.split('.').map(Number);
    if (a === 0 || a === 10 || a === 127 || a >= 224) return false;
    if (a === 100 && b >= 64 && b <= 127) return false;
    if (a === 169 && b === 254) return false;
    if (a === 172 && b >= 16 && b <= 31) return false;
    if (a === 192 && (b === 168 || (b === 0 && (c === 0 || c === 2)) || (b === 88 && c === 99))) return false;
    if (a === 198 && (b === 18 || b === 19 || (b === 51 && c === 100))) return false;
    return !(a === 203 && b === 0 && c === 113);
  }
  if (isIP(address) !== 6) return false;
  const parts = address.toLowerCase().split(':');
  const first = parseInt(parts[0], 16);
  const second = parseInt(parts[1] || '0', 16);
  if (!(first >= 0x2000 && first <= 0x3fff)) return false;
  if (first === 0x2002) return false;
  return !(first === 0x2001 && (second < 0x200 || second === 0xdb8));
}

function publicImageUrl(value) {
  try {
    if (typeof value !== 'string' || value.length > 2048) return null;
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return null;
    const host = url.hostname.replace(/^\[|]$/g, '');
    if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local') || host.endsWith('.internal')) return null;
    if (isIP(host) && !publicAddress(host)) return null;
    return url;
  } catch { return null; }
}

async function publicImageAddresses(url, resolve = lookup) {
  const host = url.hostname.replace(/^\[|]$/g, '');
  const addresses = isIP(host) ? [{ address: host, family: isIP(host) }] : await resolve(host, { all: true, verbatim: true });
  if (!addresses.length || addresses.some(item => !publicAddress(item.address))) {
    throw Object.assign(new Error('Adresa profilne slike nije javna.'), { status: 400 });
  }
  return addresses;
}

async function requestPublicImage(value, options = {}) {
  const url = publicImageUrl(value);
  if (!url) throw Object.assign(new Error('Neispravna adresa profilne slike.'), { status: 400 });
  const signal = options.signal || AbortSignal.timeout(10000);
  signal.throwIfAborted();
  let abortLookup;
  const addresses = await Promise.race([
    publicImageAddresses(url),
    new Promise((resolve, reject) => {
      abortLookup = () => reject(signal.reason);
      signal.addEventListener('abort', abortLookup, { once: true });
    }),
  ]).finally(() => signal.removeEventListener('abort', abortLookup));
  signal.throwIfAborted();
  return new Promise((resolve, reject) => {
    const transport = url.protocol === 'https:' ? https : http;
    const request = transport.request(url, {
      method: 'GET',
      agent: false,
      signal,
      headers: { accept: 'image/*', 'accept-encoding': 'identity' },
      // Veza ostaje na provjerenoj IP adresi.
      lookup(host, settings, callback) {
        if (settings.all) callback(null, addresses);
        else callback(null, addresses[0].address, addresses[0].family);
      },
    }, response => {
      const headers = {};
      for (const key of ['content-type', 'content-length', 'location']) {
        if (typeof response.headers[key] === 'string') headers[key] = response.headers[key];
      }
      const status = response.statusCode;
      if (status !== 200 || !headers['content-type']?.startsWith('image/')) {
        resolve(new Response(null, { status, headers }));
        response.destroy();
        return;
      }
      const maximum = 3 * 1024 * 1024;
      const chunks = [];
      let length = 0;
      if (Number(headers['content-length']) > maximum) {
        response.destroy();
        reject(Object.assign(new Error('Profilna slika je prevelika.'), { status: 413 }));
        return;
      }
      response.on('data', chunk => {
        length += chunk.length;
        if (length > maximum) {
          response.destroy();
          reject(Object.assign(new Error('Profilna slika je prevelika.'), { status: 413 }));
        } else chunks.push(chunk);
      });
      response.on('error', reject);
      response.on('end', () => resolve(new Response(Buffer.concat(chunks), { status, headers })));
    });
    request.on('error', reject);
    request.end();
  });
}

module.exports = { publicAddress, publicImageUrl, publicImageAddresses, requestPublicImage };
