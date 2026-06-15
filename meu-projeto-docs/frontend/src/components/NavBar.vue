<template>
  <v-app-bar elevation="1" class="nav-bar" density="compact">
    <template v-slot:prepend>
      <v-app-bar-nav-icon @click="drawer = !drawer" color="white" class="d-md-none" />
    </template>

    <v-app-bar-title class="d-flex align-center">
      <LogoAnjo :size="28" :showText="false" class="mr-3" />
      <span class="text-white font-weight-bold" style="font-size:1rem">Anjo da Guarda</span>
    </v-app-bar-title>

    <template v-slot:append>
      <div class="d-flex align-center">
        <v-btn
          v-for="item in navItems" :key="item.route"
          :to="item.route"
          variant="text"
          class="nav-link d-none d-md-flex"
          :class="{ 'active-link': $route.path === item.route }"
        >
          <v-icon start size="18">{{ item.icon }}</v-icon>
          {{ item.label }}
        </v-btn>

        <v-menu location="bottom end" min-width="200">
          <template v-slot:activator="{ props }">
            <v-btn icon variant="text" color="white" v-bind="props" size="small" class="ml-2">
              <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
          </template>
          <v-list density="compact">
            <v-list-item prepend-icon="mdi-account-plus" title="Adicionar Aluno" @click="$emit('add-aluno')" />
            <v-list-item prepend-icon="mdi-file-import-outline" title="Exportar / Importar" @click="$emit('import-export')" />
            <v-list-item prepend-icon="mdi-chart-bar" title="Estatísticas" @click="$emit('estatisticas')" />
            <v-divider />
            <v-list-item prepend-icon="mdi-delete-restore" title="Resetar Dados" color="error" @click="$emit('reset')" />
          </v-list>
        </v-menu>
      </div>
    </template>
  </v-app-bar>

  <v-navigation-drawer v-model="drawer" temporary location="left" class="mobile-drawer pa-3">
    <div class="d-flex align-center pa-3 mb-4" style="border-bottom:1px solid rgba(255,215,0,0.2)">
      <LogoAnjo :size="36" :showText="false" class="mr-3" />
      <div>
        <div class="text-white font-weight-bold" style="font-size:1rem">Anjo da Guarda</div>
        <div class="text-gold" style="font-size:0.75rem">Sistema de Chamada</div>
      </div>
    </div>
    <v-list nav density="compact">
      <v-list-item
        v-for="item in navItems" :key="item.route" :to="item.route"
        :prepend-icon="item.icon" :title="item.label"
        :active="$route.path === item.route"
        color="#FFD700" class="mobile-nav-item"
        @click="drawer = false"
      />
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
</script>

<style scoped>
.nav-bar {
  background: linear-gradient(135deg, var(--primary), var(--primary-dark)) !important;
}
.nav-link {
  color: rgba(255,255,255,0.85) !important;
  font-size: 0.82rem;
  font-weight: 500;
  border-radius: var(--radius-sm);
  transition: var(--transition);
}
.nav-link:hover { color: var(--secondary) !important; background: rgba(255,215,0,0.1) !important; }
.active-link { color: var(--secondary) !important; background: rgba(255,215,0,0.15) !important; }
.text-gold { color: var(--secondary); }
.mobile-drawer { background: linear-gradient(180deg, var(--primary), var(--primary-dark)) !important; }
.mobile-nav-item { color: rgba(255,255,255,0.9) !important; border-radius: var(--radius-sm); margin-bottom: 4px; }
.mobile-nav-item:hover { background: rgba(255,215,0,0.15) !important; }
.mobile-nav-item.v-list-item--active { background: rgba(255,215,0,0.2) !important; color: var(--secondary) !important; }
</style>