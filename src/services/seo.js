import { t } from '../i18n/index.js';
import { comparisonFromPath, comparisonMetadata } from './comparisonLink.js';
import { metadataHtml, siteUrl } from './metadataHtml.js';

export { escapeHtml, metadataHtml, previewImage, siteUrl } from './metadataHtml.js';

const pages = {
  '/library': ['common.myGames', 'seo.yourPersonalGameLibrary'],
  '/groups': ['common.groups', 'seo.organizeGamesIntoYourOwn'],
  '/profile': ['common.profile', 'seo.yourProfileSettings'],
  '/stats': ['common.gamenoteStats', 'seo.anOverviewOfYourPlaytime'],
  '/theme-settings': ['common.uiSettings', 'seo.customizeHowGamenoteLooks'],
  '/importers': ['common.importer', 'seo.importGamesFromConnectedPlatforms'],
  '/add-game': ['common.searchGamesLabel', 'seo.findAGameForYour'],
  '/': ['Gamenote', 'seo.organizeYourGameLibraryWrite'],
  '/privacy': ['seo.privacyPolicyGamenote', 'seo.howGamenoteUsesAndKeeps'],
  '/tos': ['seo.termsOfServiceGamenote', 'seo.termsOfServiceForThe'],
  '/login': ['common.signInLabel', 'seo.signInToYourGaming'],
  '/register': ['common.signUpLabel', 'seo.createAnAccountAndStart'],
  '/reset-password': ['common.resetPassword', 'seo.setANewPasswordFor'],
  '/shared': ['seo.sharedGame', 'seo.viewTheSharedGameOn'],
};

export function pageMetadata(path, query = {}) {
  path = path.replace(/\/+$/, '') || '/';
  const comparison = comparisonFromPath(path);
  if (comparison) {
    return comparisonMetadata(comparison, t('seo.comparisonDescription', [comparison.left, comparison.right]));
  }
  const [titleKey, descriptionKey] = pages[path] || ['Gamenote', 'seo.yourPersonalGameLibraryOn'];
  let title = titleKey === 'Gamenote' ? titleKey : t(titleKey);
  const description = t(descriptionKey);
  if (/^\/(?:game|edit-game|api-games)\//.test(path)) title = t('common.game');
  if (/^\/groups\//.test(path)) title = t('common.group');
  const url = new URL(path, siteUrl);
  if (path === '/shared' && typeof query.id === 'string') url.searchParams.set('id', query.id);
  return { title, description, canonical: url.href, robots: ['/', '/privacy', '/tos'].includes(path) ? 'index, follow' : 'noindex, follow' };
}

export function updateMetadata(route) {
  const template = document.createElement('template');
  const metadata = pageMetadata(route.path, route.query);
  if (route.publicLibrary) {
    metadata.title = `Gamenote · ${route.publicLibrary.name}`;
    metadata.description = t('seo.sharedLibraryDescription', [route.publicLibrary.username]);
  }
  template.innerHTML = metadataHtml(metadata);
  if (route.publicLibrary) {
    for (const tag of template.content.querySelectorAll('[property="og:image"], [name="twitter:image"]')) {
      tag.setAttribute('content', `${siteUrl}/.netlify/functions/library-card?username=${encodeURIComponent(route.publicLibrary.username)}`);
    }
  }
  for (const tag of template.content.children) {
    const attribute = tag.hasAttribute('name') ? 'name' : tag.hasAttribute('property') ? 'property' : 'rel';
    const selector = tag.tagName === 'TITLE' ? 'title' : `${tag.tagName.toLowerCase()}[${attribute}="${tag.getAttribute(attribute)}"]`;
    for (const existing of document.head.querySelectorAll(selector)) existing.remove();
  }
  document.head.append(template.content);
}
