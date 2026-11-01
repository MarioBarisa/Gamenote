export const siteUrl = 'https://gamenote.eu';
export const previewImage = `${siteUrl}/social-preview.png`;

const pages = {
  '/library': ['Moje igre', 'Tvoja osobna biblioteka igara.'],
  '/groups': ['Grupe', 'Organiziraj igre u vlastite grupe.'],
  '/profile': ['Profil', 'Postavke tvojeg profila.'],
  '/stats': ['Gamenote Statistika', 'Pregled vremena igranja i tvoje biblioteke.'],
  '/theme-settings': ['Postavke UI-ja', 'Prilagodi izgled Gamenotea.'],
  '/importers': ['Importer', 'Uvezi igre iz povezanih platformi.'],
  '/add-game': ['Pretraži igre', 'Pronađi igru za svoju biblioteku.'],
  '/': ['Gamenote', 'Organiziraj svoju biblioteku igara, zapiši dojmove i prati napredak. Uvezi igre sa Steama i PlayStationa i vodi svoj gaming dnevnik bez oglasa.'],
  '/privacy': ['Pravila privatnosti – Gamenote', 'Kako Gamenote koristi i čuva tvoje podatke te kako ih možeš izvesti ili obrisati.'],
  '/tos': ['Uvjeti korištenja – Gamenote', 'Uvjeti korištenja osobnog gaming dnevnika Gamenote.'],
  '/login': ['Prijavi se', 'Prijavi se u svoj gaming dnevnik.'],
  '/register': ['Registriraj se', 'Stvori račun i započni svoju biblioteku igara.'],
  '/reset-password': ['Resetiranje lozinke', 'Postavi novu lozinku za svoj račun.'],
  '/shared': ['Podijeljena igra', 'Pogledaj podijeljenu igru na Gamenoteu.'],
};

export function pageMetadata(path, query = {}) {
  path = path.replace(/\/+$/, '') || '/';
  let [title, description] = pages[path] || ['Gamenote', 'Tvoja osobna biblioteka igara na Gamenoteu.'];
  if (/^\/(?:game|edit-game|api-games)\//.test(path)) title = 'Igra';
  if (/^\/groups\//.test(path)) title = 'Grupa';
  const url = new URL(path, siteUrl);
  if (path === '/shared' && typeof query.id === 'string') url.searchParams.set('id', query.id);
  return { title, description, canonical: url.href, robots: ['/', '/privacy', '/tos'].includes(path) ? 'index, follow' : 'noindex, follow' };
}

export const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

export function metadataHtml(metadata) {
  const { title, description, canonical, robots } = metadata;
  return `<title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}">
    <meta name="robots" content="${robots}">
    <link rel="canonical" href="${escapeHtml(canonical)}">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:url" content="${escapeHtml(canonical)}">
    <meta property="og:type" content="website">
    <meta property="og:image" content="${previewImage}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(title)}">
    <meta name="twitter:description" content="${escapeHtml(description)}">
    <meta name="twitter:image" content="${previewImage}">`;
}

export function updateMetadata(route) {
  const template = document.createElement('template');
  template.innerHTML = metadataHtml(pageMetadata(route.path, route.query));
  for (const tag of template.content.children) {
    const attribute = tag.hasAttribute('name') ? 'name' : tag.hasAttribute('property') ? 'property' : 'rel';
    const selector = tag.tagName === 'TITLE' ? 'title' : `${tag.tagName.toLowerCase()}[${attribute}="${tag.getAttribute(attribute)}"]`;
    for (const existing of document.head.querySelectorAll(selector)) existing.remove();
  }
  document.head.append(template.content);
}
