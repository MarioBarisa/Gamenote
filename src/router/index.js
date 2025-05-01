
import { createRouter, createWebHistory } from 'vue-router';
import { supabase } from '../supabase';
import Home from '../views/Home.vue';
import Login from '../views/Login.vue';
import Profile from '../views/Profile.vue';
import GameDetails from '../views/GameDetails.vue';
import AddGame from '../views/AddGame.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { guestOnly: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true }
  },
  {
    path: '/games/:id',
    name: 'GameDetails',
    component: GameDetails,
    meta: { requiresAuth: true }
  },
  {
    path: '/add-game',
    name: 'AddGame',
    component: AddGame,
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

// Provjera autentifikacije prije svake promjene rute
router.beforeEach(async (to, from, next) => {
  const { data: { session } } = await supabase.auth.getSession();
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const guestOnly = to.matched.some(record => record.meta.guestOnly);

  if (requiresAuth && !session) {
    next('/login');
  } else if (guestOnly && session) {
    next('/');
  } else {
    next();
  }
});

export default router;
