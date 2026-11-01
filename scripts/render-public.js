import { createSSRApp, h } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { createPinia } from 'pinia';
import { createRouter, createMemoryHistory } from 'vue-router';
import Landing from '../src/views/LandingView.vue';
import Privacy from '../src/views/PrivacyPolicy.vue';
import Terms from '../src/views/TermsOfService.vue';

export async function renderPublic(path) {
  const component = { '/': Landing, '/privacy': Privacy, '/tos': Terms }[path];
  const app = createSSRApp({ render: () => h('main', [h(component)]) });
  const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/:pathMatch(.*)*', component }] });
  app.use(createPinia());
  app.use(router);
  await router.push(path);
  await router.isReady();
  return renderToString(app);
}
