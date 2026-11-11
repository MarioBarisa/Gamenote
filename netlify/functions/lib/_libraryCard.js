const { avatarImage } = require('./_avatarImage.js');
const { join } = require('node:path');
const { allowRequest } = require('./_requestSafety.js');
const headers = { 'cache-control': 'no-store', 'content-type': 'application/json; charset=utf-8', 'x-content-type-options': 'nosniff' };

async function libraryCard(method, username, options = {}) {
  const fail = (status, message) => ({ status, headers, body: JSON.stringify({ error: message }) });
  if (method !== 'GET') return fail(405, 'Metoda nije dopuštena.');
  if (typeof username !== 'string' || !/^[a-z0-9][a-z0-9_-]{2,29}$/.test(username)) return fail(404, 'Zbirka nije dostupna.');
  if (options.ip && !allowRequest(`library-card:${options.ip}`, 30)) return fail(429, 'Pričekaj prije ponovnog dohvata kartice.');
  const env = options.env || process.env;
  const url = env.VITE_SUPABASE_URL;
  const key = env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return fail(503, 'Kartica trenutačno nije dostupna.');
  const request = options.fetch || fetch;
  async function loadHeader() {
    const response = await request(`${url}/rest/v1/rpc/get_public_library`, {
      method: 'POST', headers: { apikey: key, authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: JSON.stringify({ p_username: username, p_section: 'header' }), signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error('Dohvat nije uspio.');
    return response.json();
  }
  try {
    const header = await loadHeader();
    if (!header) return fail(404, 'Zbirka nije dostupna.');
    if (options.metadata) return { status: 200, headers, body: JSON.stringify({ name: header.name, username: header.username }) };
    let avatar = '';
    if (header.avatar_url) {
      try {
        const result = await avatarImage(header.avatar_url, options.fetchImage);
        if (result.status === 200) avatar = result.data.image;
      } catch { /* Nedostupnu sliku zamjenjuju inicijali. */ }
    }
    const render = options.render || require('./card-renderer/_renderCard.cjs').renderLibraryCard;
    const svg = await render(header, avatar);
    const { Resvg } = require('@resvg/resvg-js');
    const image = new Resvg(svg, {
      fitTo: { mode: 'width', value: 1200 },
      font: { fontFiles: [join(process.cwd(), 'netlify/functions/lib/fonts/Lato-Regular.ttf'), join(process.cwd(), 'netlify/functions/lib/fonts/Lato-Bold.ttf')], loadSystemFonts: false, defaultFontFamily: 'Lato' },
    }).render().asPng();
    // Provjera nakon sporijeg renderiranja slike.
    if (!await loadHeader()) return fail(404, 'Zbirka nije dostupna.');
    return { status: 200, headers: { ...headers, 'content-type': 'image/png' }, body: Buffer.from(image).toString('base64'), binary: true };
  } catch { return fail(503, 'Kartica trenutačno nije dostupna.'); }
}
module.exports = { libraryCard };
