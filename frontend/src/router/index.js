// Composables
import { createRouter, createWebHistory } from 'vue-router'
import store from '@/store'

import Home from "@/views/Home";
import SignUp from "@/views/SignUp";
import ChooseTier from "@/views/ChooseTier.vue";
import Login from '@/views/Login';
import Share from '@/views/Share';
import Models from '@/views/Models';
import PageNotFound from '@/views/PageNotFound';
import PublicModels from '@/views/PublicModels';
import InitialPurchaseForPeer from "@/views/InitialPurchaseForPeer.vue";
import DowngradeToSolo from "@/views/DowngradeToSolo.vue";
import CancelTierChange from "@/views/CancelTierChange.vue";
import LegalDoc from "@/views/LegalDoc.vue";
import AccountSettings from "@/views/AccountSettings.vue";
import AccountHistory from "@/views/AccountHistory.vue";
import VerifySignup from "@/views/VerifySignup.vue";


const isWindowLoadedInIframe = () => {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
}


const routes = [
  {
    path: '/model/:id?',
    component: Home,
    name: 'Home',
    meta: { requiresAuth: true },
  },
  {
    path: '/',
    component: Models,
    name: 'Models',
    meta: { requiresAuth: true },
  },
  {
    path: '/public-models',
    component: PublicModels,
    name: 'PublicModels',
    meta: { requiresAuth: true },
  },
  {
    path: '/signup',
    component: SignUp,
    name: 'SignUp',
  },
  {
    path: '/legal-document/:doc_name',
    component: LegalDoc,
    name: 'LegalDoc',
  },
  {
    path: '/account-settings',
    component: AccountSettings,
    name: 'AccountSettings',
    meta: { requiresAuth: true },
  },
  {
    path: '/account-history',
    component: AccountHistory,
    name: 'AccountHistory',
    meta: { requiresAuth: true },
  },
  {
    path: '/choose-tier',
    component: ChooseTier,
    name: 'ChooseTier',
    meta: { requiresAuth: true },
  },
  {
    path: '/initial-purchase-for-peer/:stripe_session_id',
    component: InitialPurchaseForPeer,
    name: 'InitialPurchaseForPeer',
    meta: { requiresAuth: true },
  },
  {
    path: '/downgrade-to-solo',
    component: DowngradeToSolo,
    name: 'DowngradeToSolo',
    meta: { requiresAuth: true },
  },
  {
    path: '/cancel-tier-change',
    component: CancelTierChange,
    name: 'CancelTierChange',
    meta: { requiresAuth: true },
  },
  {
    path: '/verifySignup/:token',
    component: VerifySignup,
    name: 'VerifySignup',
    meta: { requiresAuth: true },
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
    meta: { tryAuth: true, checkIframe: true },
  },
  {
    path: '/404',
    component: PageNotFound,
    name: 'PageNotFound',
    meta: { tryAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

router.beforeEach(async (to, from, next) => {
  const link = router.resolve(to.path);
  if (link.matched.length === 0) {
    next('/404');
    return;
  }

  if (to.meta && to.meta.checkIframe) {
    to.meta.isWindowLoadedInIframe = isWindowLoadedInIframe();
  }

  if (link.name === 'Login' || link.name === 'SignUp') {
    try {
      await store.dispatch('auth/authenticate');
      next({ name: 'Models' });
      return;
    } catch (err) {
    }
  }
  else if (to.meta && to.meta.requiresAuth) {
    try {
      await store.dispatch('auth/authenticate');
    } catch (err) {
      next({ name: 'Login' });
      return;
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
