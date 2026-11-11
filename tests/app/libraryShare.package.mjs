import assert from 'node:assert/strict';
import { zipFunction } from '@netlify/zip-it-and-ship-it';
import { createRequire } from 'node:module';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const require = createRequire(import.meta.url);
const artifacts = await mkdtemp(join(tmpdir(), 'gamenote-share-package-'));
const result = await zipFunction('netlify/functions/library-card.js', artifacts, {
  basePath: process.cwd(), archiveFormat: 'none',
  config: { 'library-card': { nodeBundler: 'esbuild', externalNodeModules: ['@resvg/resvg-js'], includedFiles: ['netlify/functions/lib/fonts/**', 'netlify/functions/lib/card-renderer/**'] } },
});
const previousCwd = process.cwd();
const previousFetch = globalThis.fetch;
const previousUrl = process.env.VITE_SUPABASE_URL;
const previousKey = process.env.VITE_SUPABASE_ANON_KEY;
try {
  process.chdir(result.path);
  process.env.VITE_SUPABASE_URL = 'https://fixture.test';
  process.env.VITE_SUPABASE_ANON_KEY = 'fixture-public-key';
  globalThis.fetch = async () => Response.json({ name: 'Testni igrač', username: 'fixture-player', created_at: '2025-01-01', card: { hours: 25, total: 3, completed: 1, playing: 1, favoriteGame: { title: 'Test igra', play_time: 25 }, favoriteGenre: { name: 'RPG' } } });
  const { handler } = require(join(result.path, 'netlify/functions/library-card.js'));
  const response = await handler({ httpMethod: 'GET', queryStringParameters: { username: 'fixture-player' }, headers: {} });
  assert.equal(response.statusCode, 200);
  const png = Buffer.from(response.body, 'base64');
  assert.equal(png.readUInt32BE(16), 1200);
  assert.equal(png.readUInt32BE(20), 750);
  assert.ok(png.length > 25000, 'PNG mora sadržavati tekst i karticu.');
  await writeFile(join(artifacts, 'card.png'), png);
  console.log(`✓ Zapakirana funkcija: native modul, SVG, fontovi i PNG; datoteke: ${artifacts}`);
} finally {
  process.chdir(previousCwd);
  globalThis.fetch = previousFetch;
  if (previousUrl === undefined) delete process.env.VITE_SUPABASE_URL; else process.env.VITE_SUPABASE_URL = previousUrl;
  if (previousKey === undefined) delete process.env.VITE_SUPABASE_ANON_KEY; else process.env.VITE_SUPABASE_ANON_KEY = previousKey;
}
