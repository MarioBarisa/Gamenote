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

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
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
    }
  ]
});


router.afterEach((to, from) => {
  console.log('🔄 Router nakon navigacije sa', from.name, 'na', to.name);
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
        console.error('Greška pri resetiranju labele:', e);
      }
    });
    
    console.log('✅ UI state resetiran');
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
    const authRequiredRoutes = ['add-game', 'library', 'game-details', 'edit-game', 'stats', 'profile', 'theme-settings'];
    
    if (authRequiredRoutes.includes(to.name) && !isAuthenticated) {
      console.log('Preusmjeravam na login jer je autentifikacija obavezna');
      next({ name: 'login' });
    } else {
      next();
    }
  } catch (error) {
    console.error('Greška u navigation guard-u:', error);
    next('/login');
  }
});

export default router;
