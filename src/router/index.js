// src/router/index.js
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
    }
  ]
});

router.beforeEach(async (to, from, next) => {
  try {
    const userStore = await import('../stores/user').then(module => module.useUserStore());
    
    await userStore.fetchUser();
    const isAuthenticated = userStore.isLoggedIn;
    
    
    const authRequiredRoutes = ['add-game', 'games', 'game-details', 'edit-game', 'stats'];
    
    
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
