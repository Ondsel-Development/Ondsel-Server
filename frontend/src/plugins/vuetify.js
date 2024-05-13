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
import { VSkeletonLoader } from 'vuetify/labs/VSkeletonLoader';
import { VDataTable, VDataTableVirtual } from 'vuetify/labs/VDataTable';

const customLightTheme = {
  dark: false,
  colors: {
    primary: '#0D47A1',
    secondary: '#607D8B',
    decoration: '#EFEBE9',
    error: '#B71C1C',
    cancel: '#9E9E9E',
    success: '#00C853',
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
    VSkeletonLoader, VDataTable, VDataTableVirtual
  }
})
