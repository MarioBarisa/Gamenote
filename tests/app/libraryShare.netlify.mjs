import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { open, mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const artifacts = await mkdtemp(join(tmpdir(), 'gamenote-share-netlify-'));
const log = await open(join(artifacts, 'netlify.log'), 'w');
let active = true;
let child;
const fixture = createServer(async (req, res) => {
  res.setHeader('content-type', 'application/json');
  for await (const chunk of req) { /* Testni zahtjev nema tajnih podataka. */ }
  res.end(JSON.stringify(active ? { username: 'fixture-player', name: 'Testni igrač', created_at: '2025-01-01', avatar_url: '', share_scope: 'library', card: { hours: 25, total: 3, completed: 1, playing: 1, favoriteGame: { title: 'Test igra', play_time: 25 }, favoriteGenre: { name: 'RPG' } } } : null));
});
await new Promise(resolve => fixture.listen(0, '127.0.0.1', resolve));
const fixtureUrl = `http://127.0.0.1:${fixture.address().port}`;
const probe = createServer();
await new Promise(resolve => probe.listen(0, '127.0.0.1', resolve));
const targetPort = probe.address().port;
await new Promise(resolve => probe.close(resolve));
const origin = 'http://localhost:8891';
try {
  child = spawn(process.execPath, ['node_modules/netlify-cli/bin/run.js', 'dev', '--offline', '--port', '8891', '--no-open', '--command', `npm run dev -- --port ${targetPort} --strictPort`, '--target-port', String(targetPort)], {
    env: { ...process.env, VITE_SUPABASE_URL: fixtureUrl, VITE_SUPABASE_ANON_KEY: 'fixture-public-key' },
    stdio: ['ignore', log.fd, log.fd], detached: true,
  });
  const deadline = Date.now() + 90000;
  let ready = false;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(`Netlify je završio: ${child.exitCode}; log: ${artifacts}`);
    try {
      const response = await fetch(`${origin}/.netlify/functions/library-card?username=fixture-player`, { signal: AbortSignal.timeout(2000) });
      if (response.status === 200 && response.headers.get('content-type')?.includes('image/png')) { ready = true; break; }
    } catch { /* Poslužitelj se još priprema. */ }
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  assert.ok(ready, `Netlify nije spreman; log: ${artifacts}`);
  const page = await fetch(`${origin}/fixture-player`, { redirect: 'manual', headers: { 'user-agent': 'Twitterbot', accept: 'text/html' } });
  const html = await page.text();
  assert.equal(page.status, 200);
  assert.match(html, /Zbirka: Testni igrač/);
  assert.match(html, /library-card\?username=fixture-player/);
  const botPage = await fetch(`${origin}/fixture-player`);
  assert.match(await botPage.text(), /Zbirka: Testni igrač/);
  active = false;
  const card = await fetch(`${origin}/.netlify/functions/library-card?username=fixture-player`);
  assert.equal(card.status, 404);
  const hidden = await fetch(`${origin}/fixture-player`);
  // Netlify Dev zamjenjuje SPA 404 odgovor.
  assert.ok([200, 404].includes(hidden.status));
  assert.doesNotMatch(await hidden.text(), /Zbirka: Testni igrač|library-card\?username/);
  console.log(`✓ Netlify: pravi PNG endpoint, Edge OG i opoziv dijeljenja; log: ${artifacts}`);
} finally {
  if (child?.pid) { try { process.kill(-child.pid, 'SIGTERM'); } catch { /* Proces je već završio. */ } }
  await new Promise(resolve => fixture.close(resolve));
  await log.close();
}
