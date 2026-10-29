import { useUserStore } from '../stores/user';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
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


router.afterEach(() => {
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
  if (!to.meta.requiresAuth && !['home', 'login', 'register', 'shared-game'].includes(to.name)) return;
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
