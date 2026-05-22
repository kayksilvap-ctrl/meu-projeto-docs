import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import 'vuetify/styles'

const marrom = '#8B4513'
const dourado = '#FFD700'
const marromClaro = '#A0522D'
const marromEscuro = '#5C2E0A'
const douradoClaro = '#FFF8DC'

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
          accent: douradoClaro,
          error: '#D32F2F',
          info: '#1976D2',
          success: '#388E3C',
          warning: '#F57C00',
          'primary-darken-1': marromEscuro,
          'primary-lighten-1': marromClaro,
          'secondary-darken-1': '#B8960C',
          'surface': '#FFFFFF',
          'background': '#f5f0eb'
        }
      }
    }
  },
  defaults: {
    VBtn: {
      rounded: 'lg',
      elevation: 2
    },
    VCard: {
      rounded: 'lg',
      elevation: 3
    },
    VTextField: {
      variant: 'outlined',
      density: 'comfortable'
    },
    VSelect: {
      variant: 'outlined',
      density: 'comfortable'
    }
  }
})