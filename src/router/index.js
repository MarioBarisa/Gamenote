// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import AddGame from '../views/AddGame.vue';
import Games from '../views/Games.vue';
import GameDetails from '../views/GameDetails.vue';
import Stats from '../views/Stats.vue';
import SignIn from '../components/SignIn.vue';
import SignUp from '../components/SignUp.vue';
import Profile from '../views/Profile.vue';

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
      path: '/profile',
      name: 'profile',
      redirect: '/'
    },
    {
      path: '/add-game',
      name: 'add-game',
      component: AddGame
    },
    {
      path: '/games',
      name: 'games',
      component: Games
    },
    {
      path: '/games/:id',
      name: 'game-details',
      component: GameDetails
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
  ]
});


router.beforeEach(async (to, from, next) => {
  try {
    const userStore = await import('../stores/user').then(module => module.useUserStore());
    
    await userStore.fetchUser();
    const isAuthenticated = userStore.isLoggedIn;
    
    
    const authRequiredRoutes = ['add-game', 'games', 'game-details', 'stats'];
    
    
    if (authRequiredRoutes.includes(to.name) && !isAuthenticated) {
      console.log('Redirecting to login because auth required and not authenticated');
      next({ name: 'login' });
    } else {
      next();
    }
  } catch (error) {
    console.error('Error in navigation guard:', error);
    next('/login');
  }
});

export default router;
