import { updateMetadata } from '../services/seo';
import { useUserStore } from '../stores/user';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      meta: { skipAuthLoading: true },
      component: () => import('../views/Home.vue')
    },
    {
      path: '/groups',
      name: 'groups',
      meta: { requiresAuth: true },
      component: () => import('../views/Groups.vue')
    },
    {
      path: '/groups/:id',
      name: 'group-details',
      meta: { requiresAuth: true },
      component: () => import('../views/GroupDetails.vue')
    },
    {
      path: '/about',
      name: 'about',
      redirect: '/'
    },
    {
      path: '/contact',
      name: 'contact',
      redirect: '/'
    },
    {
      path: '/add-game',
      name: 'add-game',
      meta: { requiresAuth: true },
      component: () => import('../views/AddGame.vue')
    },
    {
      path: '/library',
      name: 'library',
      meta: { requiresAuth: true },
      component: () => import('../views/Games.vue')
    },
    {
      path: '/games',
      name: 'games',
      redirect: '/library'
    },
    {
      path: '/game/:id',
      name: 'game-details',
      meta: { requiresAuth: true },
      component: () => import('../views/GameDetails.vue')
    },
    {
      path: '/edit-game/:id',
      name: 'edit-game',
      meta: { requiresAuth: true },
      component: () => import('../views/GameDetails.vue'),
      props: { editMode: true }
    },
    {
      path: '/api-games/:id',
      name: 'api-game-details',
      meta: { requiresAuth: true },
      component: () => import('../views/ApiGameDetails.vue')
    },
    {
      path: '/stats',
      name: 'stats',
      meta: { requiresAuth: true },
      component: () => import('../views/Stats.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../components/SignIn.vue')
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../components/SignUp.vue')
    },
    {
      path: '/profile',
      name: 'profile',
      meta: { requiresAuth: true },
      component: () => import('../views/Profile.vue')
    },
    {
      path: '/theme-settings',
      name: 'theme-settings',
      meta: { requiresAuth: true },
      component: () => import('../views/ThemeSettings.vue')
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      meta: { skipAuthLoading: true },
      component: () => import('../views/ResetPasswordView.vue')
    },
    {
      path: '/u/:username([a-zA-Z0-9][a-zA-Z0-9_-]{2,29})',
      name: 'library-visitor',
      meta: { requiresAuth: true },
      component: () => import('../views/PublicLibrary.vue')
    },
    {
      path: '/:username([a-zA-Z0-9][a-zA-Z0-9_-]{2,29})',
      name: 'public-library',
      meta: { skipAuthLoading: true },
      component: () => import('../views/PublicLibrary.vue')
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      redirect: '/'
    },
    {
      path: '/importers',
      name: 'importers',
      meta: { requiresAuth: true },
      component: () => import('../views/Importers.vue')
    },
    {
      path: '/shared',
      name: 'shared-game',
      meta: { skipAuthLoading: true },
      component: () => import('../views/SharedGameView.vue')
    },
    {
      path: '/privacy',
      name: 'privacy',
      meta: { skipAuthLoading: true },
      component: () => import('../views/PrivacyPolicy.vue')
    },
    {
      path: '/tos',
      name: 'tos',
      meta: { skipAuthLoading: true },
      component: () => import('../views/TermsOfService.vue')
    }
  ]
});


router.afterEach((to, from, failure) => {
  if (failure) return;
  updateMetadata(to);
  setTimeout(() => {
    const labels = document.querySelectorAll('label[tabindex]');
    labels.forEach(label => {
      try {
        label.blur();
        label.removeAttribute('tabindex');
        setTimeout(() => {
          label.setAttribute('tabindex', '0');
        }, 0);
      } catch (e) {
        console.error('Error blurring labels:', e);
      }
    });
  }, 50);
});

router.beforeEach(async (to) => {
  if (to.name === 'public-library') {
    const userStore = useUserStore();
    try { await userStore.initializeAuth(); } catch { /* Javni prikaz ostaje dostupan. */ }
    if (userStore.isLoggedIn) return { name: 'library-visitor', params: to.params, query: to.query };
  }
  if (to.name === 'library-visitor') {
    const userStore = useUserStore();
    try { await userStore.initializeAuth(); } catch { /* Gost koristi javni prikaz. */ }
    if (!userStore.isLoggedIn) return { name: 'public-library', params: to.params, query: to.query };
  }
  if (!to.meta.requiresAuth && !['login', 'register'].includes(to.name)) return;
  try {
    const userStore = useUserStore();
    await userStore.initializeAuth();
    if (to.meta.requiresAuth && !userStore.isLoggedIn) return { name: 'login' };
  } catch (error) {
    console.error('Provjera prijave nije uspjela:', error);
    // Pogrešku prikazuje početni ekran.
  }
});

export default router;
