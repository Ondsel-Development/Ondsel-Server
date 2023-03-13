// Composables
import { createRouter, createWebHistory } from 'vue-router'

import Home from "@/views/Home";
import SignUp from "@/views/SignUp";
import Login from '@/views/Login';


const routes = [
  {
    path: '/',
    component: Home,
    name: 'Home',
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
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

export default router
