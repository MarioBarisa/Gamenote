import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import AddGame from '../views/AddGame.vue';
import Games from '../views/Games.vue';
import GameDetails from '../views/GameDetails.vue';
import ApiGameDetails from '../views/ApiGameDetails.vue';
import Stats from '../views/Stats.vue';
import SignIn from '../components/SignIn.vue';
import SignUp from '../components/SignUp.vue';
import Profile from '../views/Profile.vue';
import ThemeSettings from '../views/ThemeSettings.vue';
import Groups from '../views/Groups.vue';
import GroupDetails from '../views/GroupDetails.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/groups',
      name: 'groups',
      component: Groups
    },
    {
      path: '/groups/:id',
      name: 'group-details',
      component: GroupDetails
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
      component: AddGame
    },
    {
      path: '/library',
      name: 'library',
      component: Games
    },
    {
      path: '/games',
      name: 'games',
      redirect: '/library'
    },
    {
      path: '/game/:id',
      name: 'game-details',
      component: GameDetails
    },
    {
      path: '/edit-game/:id',
      name: 'edit-game',
      component: GameDetails,
      props: { editMode: true }
    },
    {
      path: '/api-games/:id',
      name: 'api-game-details',
      component: ApiGameDetails
    },
    {
      path: '/stats',
      name: 'stats',
      component: Stats
    },
    {
      path: '/login',
      name: 'login',
      component: SignIn
    },
    {
      path: '/register',
      name: 'register',
      component: SignUp
    },
    {
      path: '/profile',
      name: 'profile',
      component: Profile
    },
    {
      path: '/theme-settings',
      name: 'theme-settings',
      component: ThemeSettings
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      redirect: '/'
    }
  ]
});


router.afterEach((to, from) => {
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
      }
    });
  }, 50);
});

let authCheckPromise = null;
let lastAuthCheck = 0;
const AUTH_CHECK_INTERVAL = 5000; 

router.beforeEach(async (to, from, next) => {
  try {
    const userStore = await import('../stores/user').then(module => module.useUserStore());
    
    const now = Date.now();
    const shouldFetchUser = !lastAuthCheck || (now - lastAuthCheck) > AUTH_CHECK_INTERVAL;
    
    if (shouldFetchUser) {
      if (!authCheckPromise) {
        authCheckPromise = userStore.fetchUser();
      }
      await authCheckPromise;
      lastAuthCheck = now;
      authCheckPromise = null;
    }
    
    const isAuthenticated = userStore.isLoggedIn;
    const authRequiredRoutes = ['add-game', 'library', 'game-details', 'edit-game', 'api-game-details', 'stats', 'profile', 'theme-settings', 'groups', 'group-details'];
    
    if (authRequiredRoutes.includes(to.name) && !isAuthenticated) {
      next({ name: 'login' });
    } else {
      next();
    }
  } catch (error) {
    next('/login');
  }
});

export default router;
