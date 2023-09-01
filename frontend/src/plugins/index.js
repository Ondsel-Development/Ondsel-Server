/**
 * plugins/index.js
 *
 * Automatically included in `./src/main.js`
 */

// Plugins
import { loadFonts } from './webfontloader'
import vuetify from './vuetify'
import router from '../router'
import store from '../store'
import { FeathersVuex } from './feathers-client'
import { createMetaManager } from 'vue-meta'


export function registerPlugins (app) {
  loadFonts()
  app
    .use(vuetify)
    .use(router)
    .use(store)
    .use(FeathersVuex)
    .use(createMetaManager())
}

// https://stackoverflow.com/questions/66228340/how-to-use-vue-3-meta-with-vue-js-3
