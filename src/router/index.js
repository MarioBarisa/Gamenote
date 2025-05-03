// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import AddGame from '../views/AddGame.vue';
import Games from '../views/Games.vue';
import GameDetails from '../views/GameDetails.vue';
import Stats from '../views/Stats.vue';
import SignIn from '../components/SignIn.vue';
import SignUp from '../components/SignUp.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
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
    }
  ]
});

export default router;
