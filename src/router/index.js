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
      component: () => import('../views/Groups.vue')
    },
    {
      path: '/groups/:id',
      name: 'group-details',
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
      component: () => import('../views/AddGame.vue')
    },
    {
      path: '/library',
      name: 'library',
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
      component: () => import('../views/GameDetails.vue')
    },
    {
      path: '/edit-game/:id',
      name: 'edit-game',
      component: () => import('../views/GameDetails.vue'),
      props: { editMode: true }
    },
    {
      path: '/api-games/:id',
      name: 'api-game-details',
      component: () => import('../views/ApiGameDetails.vue')
    },
    {
      path: '/stats',
      name: 'stats',
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
      component: () => import('../views/Profile.vue')
    },
    {
      path: '/theme-settings',
      name: 'theme-settings',
      component: () => import('../views/ThemeSettings.vue')
    },
    {
      path: '/reset-password',
      name: 'reset-password',
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
      component: () => import('../views/PrivacyPolicy.vue')
    },
    {
      path: '/tos',
      name: 'tos',
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

let lastAuthCheck = 0;
const AUTH_CHECK_INTERVAL = 5000;

const PUBLIC_ROUTES = new Set(['home', 'login', 'register', 'shared-game', 'privacy', 'tos', 'about', 'contact', 'not-found']);

const needsUserHydration = (to) => to.name === 'shared-game';

router.beforeEach(async (to, from, next) => {
  if (PUBLIC_ROUTES.has(to.name) && !needsUserHydration(to)) {
    next();
    return;
  }

  try {
    const userStore = await import('../stores/user').then(module => module.useUserStore());

    const now = Date.now();
    const shouldFetchUser = !lastAuthCheck || (now - lastAuthCheck) > AUTH_CHECK_INTERVAL;

    if (shouldFetchUser) {
      await userStore.fetchUser();
      lastAuthCheck = now;
    }

    const isAuthenticated = userStore.isLoggedIn;

    if (needsUserHydration(to)) {
      next();
      return;
    }

    const authRequiredRoutes = ['add-game', 'library', 'game-details', 'edit-game', 'api-game-details', 'stats', 'profile', 'theme-settings', 'groups', 'group-details'];

    if (authRequiredRoutes.includes(to.name) && !isAuthenticated) {
      next({ name: 'login' });
    } else {
      next();
    }
  } catch (error) {
    console.error('Auth guard error:', error);
    next();
  }
});

export default router;
