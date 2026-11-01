import { watch } from 'vue';
import { useRoute } from 'vue-router';
import { pageMetadata } from '../services/seo';

export function usePageTitle(getTitle, routeNames) {
  const route = useRoute();
  const owners = routeNames || [route.name];
  watch([getTitle, () => route.fullPath], ([title]) => {
    if (!owners.includes(route.name)) return;
    document.title = String(title || '').trim() || pageMetadata(route.path, route.query).title;
  }, { immediate: true, flush: 'post' });
}
