// SPDX-FileCopyrightText: 2024 Ondsel <development@ondsel.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 * plugins/vuetify.js
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import '@mdi/font/css/materialdesignicons.css'
import '@/styles/main.scss'

// Composables
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components'
import * as labsComponents from 'vuetify/labs/components'

const customLightTheme = {
  dark: false,
  colors: {
    primary: '#0D47A1',
    secondary: '#607D8B',
    decoration: '#EFEBE9',
    link: '#263238',
    error: '#B71C1C',
    cancel: '#9E9E9E',
    success: '#00C853',
    background: '#FAFAFA',
  },
};


// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  theme: {
    themes: {
      light: customLightTheme,
    }
  },
  components: {
    ...components, ...labsComponents
  }
})
