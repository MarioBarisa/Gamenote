import { build } from 'vite';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { metadataHtml, pageMetadata } from '../src/services/seo.js';

// Isti Vue sadržaj, bez korisničke sesije.
await build({ build: { ssr: 'scripts/render-public.js', outDir: 'node_modules/.cache/gamenote-prerender', emptyOutDir: true } });
const { renderPublic } = await import('../node_modules/.cache/gamenote-prerender/render-public.js');
await build({ build: { manifest: true } });
const shell = await readFile('dist/index.html', 'utf8');
const manifest = JSON.parse(await readFile('dist/.vite/manifest.json', 'utf8'));
const publicEntries = { '/': 'src/views/Home.vue', '/privacy': 'src/views/PrivacyPolicy.vue', '/tos': 'src/views/TermsOfService.vue' };
function documentHtml(path, content = '') {
  const styles = new Set();
  const visited = new Set();
  function collectStyles(key) {
    if (visited.has(key)) return;
    visited.add(key);
    const entry = manifest[key];
    if (!entry) return;
    for (const css of entry.css || []) styles.add(css);
    for (const dependency of entry.imports || []) collectStyles(dependency);
  }
  collectStyles(publicEntries[path]);
  let styleTags = '';
  for (const css of styles) {
    if (!shell.includes(`href="/${css}"`)) styleTags += `<link rel="stylesheet" href="/${css}">`;
  }
  return shell.replace('</head>', `${styleTags}</head>`).replace('<title>Gamenote</title>', metadataHtml(pageMetadata(path)))
    .replace('<div id="app"></div>', `<div id="app">${content}</div>`);
}
await writeFile('dist/spa.html', documentHtml('/app').replace(/<link rel="canonical"[^>]*>/, '').replace(/<meta property="og:url"[^>]*>/, ''));
for (const path of ['/', '/privacy', '/tos']) {
  const folder = path === '/' ? 'dist' : `dist${path}`;
  await mkdir(folder, { recursive: true });
  await writeFile(`${folder}/index.html`, documentHtml(path, await renderPublic(path)));
}
for (const path of ['/login', '/register', '/reset-password', '/shared']) {
  await mkdir(`dist${path}`, { recursive: true });
  await writeFile(`dist${path}/index.html`, documentHtml(path));
}

// Serverski prikaz koristi istu SVG karticu.
await build({
  configFile: false,
  publicDir: false,
  ssr: { noExternal: ['daisyui'] },
  plugins: [(await import('@vitejs/plugin-vue')).default()],
  build: {
    ssr: 'scripts/render-library-card.js',
    outDir: 'netlify/functions/lib/card-renderer',
    emptyOutDir: true,
    rollupOptions: { output: { format: 'cjs', entryFileNames: '_renderCard.cjs' } },
  },
});
