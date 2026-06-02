import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import 'vuetify/styles'

const marrom = '#8B4513'
const dourado = '#FFD700'
const marromClaro = '#A0522D'
const marromEscuro = '#5C2E0A'

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'anjoGuarda',
    themes: {
      anjoGuarda: {
        dark: false,
        colors: {
          primary: marrom,
          secondary: dourado,
          accent: '#FAF0E6',
          error: '#D32F2F',
          info: '#1976D2',
          success: '#388E3C',
          warning: '#F57C00',
          'primary-darken-1': marromEscuro,
          'primary-lighten-1': marromClaro,
          'secondary-darken-1': '#B8960C',
          surface: '#FFFFFF',
          background: '#f5f0eb'
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