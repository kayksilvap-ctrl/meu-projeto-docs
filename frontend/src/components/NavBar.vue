<template>
  <v-app-bar :elevation="2" density="compact" class="nav-bar">
    <template v-slot:prepend>
      <v-app-bar-nav-icon @click.stop="toggleDrawer" color="white" class="d-md-none">
        <v-icon>mdi-menu</v-icon>
      </v-app-bar-nav-icon>
    </template>

    <v-app-bar-title class="nav-title d-flex align-center">
      <LogoAnjo :size="32" :showText="false" class="mr-2" />
      <span class="text-white font-weight-bold" style="font-size:1.1rem">Anjo da Guarda</span>
      <span class="text-gold ml-2 d-none d-sm-inline" style="font-size:0.85rem">— Sistema de Chamada</span>
    </v-app-bar-title>

    <template v-slot:append>
      <div class="d-flex align-center">
        <v-btn
          v-for="item in navItems"
          :key="item.route"
          :to="item.route"
          variant="text"
          class="nav-link mx-1 d-none d-md-flex"
          :class="{ 'active-link': $route.path === item.route }"
        >
          <v-icon start>{{ item.icon }}</v-icon>
          {{ item.label }}
        </v-btn>

        <v-divider vertical class="mx-2 border-white opacity-50 d-none d-md-flex" inset></v-divider>

        <v-btn
          icon
          variant="flat"
          color="#FFD700"
          class="action-btn mr-1"
          @click="$emit('add-aluno')"
          title="Adicionar Aluno"
          size="small"
        >
          <v-icon color="#D90445">mdi-account-plus</v-icon>
          <v-tooltip activator="parent" location="bottom">Adicionar Aluno</v-tooltip>
        </v-btn>

        <v-btn
          icon
          variant="flat"
          color="white"
          class="action-btn mr-1"
          @click="$emit('import-export')"
          title="Exportar / Importar"
          size="small"
        >
          <v-icon color="#D90445">mdi-file-import-outline</v-icon>
          <v-tooltip activator="parent" location="bottom">Exportar/Importar</v-tooltip>
        </v-btn>

        <v-btn
          icon
          variant="flat"
          color="white"
          class="action-btn mr-1"
          @click="$emit('estatisticas')"
          title="Estatísticas"
          size="small"
        >
          <v-icon color="#D90445">mdi-chart-bar</v-icon>
          <v-tooltip activator="parent" location="bottom">Estatísticas</v-tooltip>
        </v-btn>

        <v-btn
          icon
          variant="flat"
          color="error"
          class="action-btn"
          @click="$emit('reset')"
          title="Resetar Dados"
          size="small"
        >
          <v-icon>mdi-delete-restore</v-icon>
          <v-tooltip activator="parent" location="bottom">Resetar</v-tooltip>
        </v-btn>
      </div>
    </template>
  </v-app-bar>

  <v-navigation-drawer
    v-model="drawer"
    temporary
    location="left"
    class="pa-2 mobile-drawer"
  >
    <div class="d-flex align-center pa-4 drawer-header mb-4">
      <LogoAnjo :size="40" :showText="false" class="mr-2" />
      <div>
        <div class="font-weight-bold text-white" style="font-size: 1.1rem">Anjo da Guarda</div>
        <div class="text-gold" style="font-size: 0.8rem">Sistema de Chamada</div>
      </div>
    </div>

    <v-list nav density="compact">
      <v-list-item
        v-for="item in navItems"
        :key="item.route"
        :to="item.route"
        :prepend-icon="item.icon"
        :title="item.label"
        :active="$route.path === item.route"
        color="primary"
        class="mobile-nav-item"
        @click="drawer = false"
      ></v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import LogoAnjo from './LogoAnjo.vue'

defineEmits(['add-aluno', 'import-export', 'estatisticas', 'reset'])

const route = useRoute()
const drawer = ref(false)

const navItems = [
  { label: 'Dashboard', route: '/', icon: 'mdi-view-dashboard' },
  { label: 'Salas', route: '/salas', icon: 'mdi-door-open' },
  { label: 'Alunos', route: '/alunos', icon: 'mdi-account-group' },
  { label: 'Chamada', route: '/chamada', icon: 'mdi-clipboard-check' }
]

function toggleDrawer() {
  drawer.value = !drawer.value
}
</script>

<style scoped>
.nav-bar {
  background: linear-gradient(135deg, #D90445 0%, #B80338 100%) !important;
  border-bottom: 2px solid #FFD700;
}

.nav-title {
  color: #FFFFFF !important;
  font-family: 'Montserrat', sans-serif;
}

.text-gold {
  color: #FFD700;
  font-weight: 300;
  font-size: 0.9rem;
}

.nav-link {
  color: rgba(255, 255, 255, 0.85) !important;
  font-size: 0.85rem;
  text-transform: none;
  font-weight: 500;
  transition: all 0.3s;
  border-radius: 8px;
}

.nav-link:hover {
  color: #FFD700 !important;
  background: rgba(255, 215, 0, 0.1) !important;
}

.active-link {
  color: #FFD700 !important;
  background: rgba(255, 215, 0, 0.15) !important;
}

.action-btn {
  transition: all 0.3s;
  border: 1px solid transparent;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2) !important;
}

.mobile-drawer {
  background: linear-gradient(180deg, #D90445 0%, #B80338 100%) !important;
}

.drawer-header {
  border-bottom: 1px solid rgba(255, 215, 0, 0.3);
}

.mobile-nav-item {
  color: rgba(255, 255, 255, 0.9) !important;
  border-radius: 8px;
  margin-bottom: 4px;
}

.mobile-nav-item:hover {
  background: rgba(255, 215, 0, 0.15) !important;
}

.mobile-nav-item.v-list-item--active {
  background: rgba(255, 215, 0, 0.2) !important;
  color: #FFD700 !important;
}
</style>