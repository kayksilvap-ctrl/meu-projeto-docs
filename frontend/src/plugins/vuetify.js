import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import 'vuetify/styles'

const vermelho = '#D90445'
const dourado = '#FFD700'
const cinzaAsa = '#D3D3D3'
const bege = '#F2EFE6'

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'anjoGuarda',
    themes: {
      anjoGuarda: {
        dark: false,
        colors: {
          primary: vermelho,
          secondary: dourado,
          accent: bege,
          error: '#C62828',
          info: '#1565C0',
          success: '#2E7D32',
          warning: '#EF6C00',
          'primary-darken-1': '#B80338',
          'primary-lighten-1': '#E83E6B',
          'secondary-darken-1': '#B8960C',
          surface: '#FFFFFF',
          background: bege
        }
      }
    }
  },
  defaults: {
    VBtn: {
      rounded: 'pill',
      elevation: 0,
      style: 'text-transform: none; font-weight: 500; letter-spacing: 0;'
    },
    VCard: {
      rounded: 'xl',
      elevation: 1
    },
    VTextField: {
      variant: 'outlined',
      density: 'compact',
      hideDetails: 'auto'
    },
    VSelect: {
      variant: 'outlined',
      density: 'compact',
      hideDetails: 'auto'
    },
    VDialog: {
      contentClass: 'rounded-xl'
    }
  }
})