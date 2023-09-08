/**
 * main.js
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */
import { createSSRApp } from 'vue';

// Components
import App from './App.vue'
import { createRouter } from "@/router";

// Plugins
import { registerPlugins } from '@/plugins'

export function createApp() {
  const app = createSSRApp(App)
  registerPlugins(app)
  const router = createRouter()
  app.use(router)
  return { app, router }
}
