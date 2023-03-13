// Composables
import { createRouter, createWebHistory } from 'vue-router'

import Home from "@/views/Home";
import SignUp from "@/views/SignUp";


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
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

export default router
