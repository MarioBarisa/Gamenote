const { publicImageUrl, requestPublicImage } = require('./_publicImage.js');

function imageMime(bytes) {
  if (bytes.subarray(0, 3).equals(Buffer.from([255, 216, 255]))) return 'image/jpeg';
  if (bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return 'image/png';
  if (/^GIF8[79]a/.test(bytes.toString('ascii', 0, 6))) return 'image/gif';
  if (bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP') return 'image/webp';
  return null;
}

async function avatarImage(value, request = requestPublicImage) {
  let url = publicImageUrl(value);
  if (!url) {
    return { status: 400, data: { error: 'Nepodržan izvor profilne slike.' } };
  }
  const signal = AbortSignal.timeout(10000);
  let response;
  for (let attempt = 0; attempt < 3; attempt++) {
    response = await request(url.href, { redirect: 'manual', signal });
    if (![301, 302, 303, 307, 308].includes(response.status)) break;
    await response.body?.cancel();
    const location = response.headers.get('location');
    url = location ? publicImageUrl(new URL(location, url).href) : null;
    if (!url || attempt === 2) return { status: 502, data: { error: 'Profilna slika ima nedopušteno preusmjeravanje.' } };
  }
  const maximum = 3 * 1024 * 1024;
  if (!response.ok || !response.headers.get('content-type')?.startsWith('image/') || Number(response.headers.get('content-length')) > maximum || !response.body) {
    await response.body?.cancel();
    return { status: 502, data: { error: 'Profilna slika nije dostupna.' } };
  }
  const reader = response.body.getReader();
  const chunks = [];
  let length = 0;
  while (true) {
    const { value: chunk, done } = await reader.read();
    if (done) break;
    length += chunk.length;
    if (length > maximum) {
      await reader.cancel();
      return { status: 413, data: { error: 'Profilna slika je prevelika.' } };
    }
    chunks.push(chunk);
  }
  const bytes = Buffer.concat(chunks);
  const mime = imageMime(bytes);
  if (!mime) return { status: 400, data: { error: 'Nepodržan format profilne slike.' } };
  return { status: 200, data: { image: `data:${mime};base64,${bytes.toString('base64')}` } };
}

module.exports = { avatarImage, imageMime };
