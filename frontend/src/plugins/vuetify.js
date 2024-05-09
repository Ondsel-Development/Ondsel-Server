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


// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  theme: {
    themes: {
      light: {
        colors: {
          primary: '#1867C0',
          secondary: '#5CBBF6',
          danger: '#B71C1C',
          cancel: '',
          success: '',
        },
      },
    },
  },
  components: {
    VSkeletonLoader, VDataTable, VDataTableVirtual
  }
})
