import { createSSRApp, h } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { parse, formatHex } from 'culori';
import GamerCard from '../src/components/GamerCard.vue';

export async function renderLibraryCard(header, avatar = '') {
  const app = createSSRApp({ render: () => h(GamerCard, {
    name: header.name, username: header.username, createdAt: header.created_at,
    cardStats: header.card, color: 'signature', preparedAvatar: avatar,
  }) });
  const html = await renderToString(app);
  const svg = html.match(/<svg\b[\s\S]*<\/svg>/)?.[0];
  if (!svg) throw new Error('Karticu nije moguće pripremiti.');
  return svg.replace(/viewbox=/g, 'viewBox=').replace(/ data-v-[a-z0-9-]+(?:="")?/g, '').replace(/oklch\([^)]*\)/g, color => formatHex(parse(color)))
    .replace('font-family="Arial, sans-serif"', 'font-family="Lato, sans-serif"');
}
