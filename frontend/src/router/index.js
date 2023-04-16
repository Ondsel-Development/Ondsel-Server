// Composables
import { createRouter, createWebHistory } from 'vue-router'
import store from '@/store'

import Home from "@/views/Home";
import SignUp from "@/views/SignUp";
import Login from '@/views/Login';
import Share from '@/views/Share'


const routes = [
  {
    path: '/:id?',
    component: Home,
    name: 'Home',
    meta: { requiresAuth: true },
  },
  {
    path: '/signup',
    component: SignUp,
    name: 'SignUp',
  },
  {
    path: '/login',
    component: Login,
    name: 'Login',
  },
  {
    path: '/share/:id',
    component: Share,
    name: 'Share',
    meta: { tryAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

router.beforeEach(async (to, from, next) => {
  if (to.meta && to.meta.requiresAuth) {
    try {
      await store.dispatch('auth/authenticate');
    } catch (err) {
      next({ name: 'Login' });
    }
  }
  else if (to.meta && to.meta.tryAuth) {
    try {
      await store.dispatch('auth/authenticate');
    } catch (err) {
    }
  }
  next();
});

export default router
