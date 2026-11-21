import { watch } from 'vue';
import { locale } from '../i18n/index.js';
import { useRoute } from 'vue-router';
import { pageMetadata } from '../services/seo';

/**
 * @param {() => string | null | undefined} getTitle
 * @param {string[]} [routeNames]
 */
export function usePageTitle(getTitle, routeNames) {
  const route = useRoute();
  const owners = routeNames || [route.name];
  watch([getTitle, () => route.fullPath, () => locale.value], ([title]) => {
    if (!owners.includes(route.name)) return;
    document.title = String(title || '').trim() || pageMetadata(route.path, route.query).title;
  }, { immediate: true, flush: 'post' });
}
