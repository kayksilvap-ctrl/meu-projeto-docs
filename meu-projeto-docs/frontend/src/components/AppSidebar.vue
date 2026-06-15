<template>
  <!-- Mobile overlay -->
  <div v-if="isMobile && menuAberto" class="mobile-overlay" @click="fecharMenu"></div>

  <aside class="sidebar" :class="{ 'sidebar-open': menuAberto }">
    <!-- Header with logo -->
    <div class="sidebar-header">
      <LogoAnjo :size="36" :showText="false" />
      <div v-if="mostrarTexto" class="header-text">
        <div class="sidebar-title">Anjo da Guarda</div>
        <div class="sidebar-subtitle">Gestão de Frequência</div>
      </div>
      <button v-if="isMobile" class="btn-close-sidebar" @click="fecharMenu">✕</button>
    </div>

    <!-- Navigation -->
    <nav class="sidebar-nav">
      <router-link
        v-for="item in menuItems"
        :key="item.path"
        :to="item.path"
        class="nav-item"
        :class="{ active: $route.path === item.path }"
        :title="!mostrarTexto ? item.label : ''"
        @click="fecharMenuMobile"
      >
        <span class="nav-icon">{{ item.icon }}</span>
        <span v-if="mostrarTexto" class="nav-label">{{ item.label }}</span>
      </router-link>
    </nav>

    <!-- Footer -->
    <div class="sidebar-footer">
      <div class="user-info">
        <div class="user-avatar">AD</div>
        <div v-if="mostrarTexto" class="user-details">
          <div class="user-name">Administrador</div>
          <div class="user-role">admin@anjodaguarda.org</div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import LogoAnjo from './LogoAnjo.vue'

const route = useRoute()
const menuAberto = ref(false)
const isMobile = ref(false)
const sidebarCollapsed = ref(false)

const mostrarTexto = computed(() => {
  // Mobile: texto só quando o menu está aberto
  if (isMobile.value) return menuAberto.value
  // Desktop: texto quando NÃO está colapsado
  return !sidebarCollapsed.value
})

function detectWidth() {
  const w = window.innerWidth
  isMobile.value = w <= 960
  if (w <= 960) {
    sidebarCollapsed.value = false
    document.documentElement.style.setProperty('--sidebar-width', '0px')
  } else if (w <= 1200) {
    sidebarCollapsed.value = true
    document.documentElement.style.setProperty('--sidebar-width', '70px')
  } else {
    sidebarCollapsed.value = false
    document.documentElement.style.setProperty('--sidebar-width', '250px')
  }
}

onMounted(() => {
  detectWidth()
  window.addEventListener('resize', detectWidth)
})
onUnmounted(() => window.removeEventListener('resize', detectWidth))

function fecharMenu() { menuAberto.value = false }
function fecharMenuMobile() { if (isMobile.value) menuAberto.value = false }
function toggleMenu() { menuAberto.value = !menuAberto.value }

defineExpose({ toggleMenu, menuAberto, sidebarCollapsed })

const menuItems = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/criancas', label: 'Crianças', icon: '👦' },
  { path: '/responsaveis', label: 'Responsáveis', icon: '👨‍👩‍👧' },
  { path: '/turmas', label: 'Turmas', icon: '🏫' },
  { path: '/fazer-chamada', label: 'Fazer Chamada', icon: '📋' },
  { path: '/resumo', label: 'Resumo por Turma', icon: '🧾' },
  { path: '/relatorios', label: 'Relatórios', icon: '📈' },
  { path: '/configuracoes', label: 'Configurações', icon: '⚙️' }
]
</script>

<style scoped>
.mobile-overlay {
  display: none;
}

.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  width: var(--sidebar-width);
  height: 100vh;
  background: var(--surface);
  border-right: 1px solid #E5E7EB;
  display: flex;
  flex-direction: column;
  z-index: 100;
  overflow: hidden;
  transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1), left 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar-header {
  display: flex;
  align-items: center;
  padding: 18px 14px;
  border-bottom: 1px solid #E5E7EB;
  min-height: 64px;
  gap: 10px;
  flex-shrink: 0;
}

.header-text {
  white-space: nowrap;
  overflow: hidden;
}

.btn-close-sidebar {
  display: none;
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: var(--text-secondary);
  margin-left: auto;
  padding: 4px 8px;
}

.sidebar-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--red);
  line-height: 1.2;
}

.sidebar-subtitle {
  font-size: 0.7rem;
  color: var(--text-secondary);
  font-weight: 400;
}

.sidebar-nav {
  flex: 1;
  padding: 10px 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;
  overflow-x: hidden;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  text-decoration: none;
  color: var(--text-secondary);
  font-size: 0.88rem;
  font-weight: 500;
  transition: var(--transition);
  white-space: nowrap;
  overflow: hidden;
}

.nav-item:hover {
  background: #F3F4F6;
  color: var(--text);
}

.nav-item.active {
  background: var(--red-light);
  color: var(--red);
  font-weight: 600;
}

.nav-icon {
  font-size: 1.3rem;
  width: 28px;
  text-align: center;
  flex-shrink: 0;
}

.nav-label {
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-footer {
  padding: 14px;
  border-top: 1px solid #E5E7EB;
  flex-shrink: 0;
  overflow: hidden;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: var(--red);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  flex-shrink: 0;
}

.user-details {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.user-name {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 0.7rem;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Mobile (< 960px): drawer */
@media (max-width: 960px) {
  .sidebar {
    left: -280px;
    width: 250px;
    box-shadow: 2px 0 12px rgba(0,0,0,0.15);
  }
  .sidebar-open {
    left: 0;
  }
  .mobile-overlay {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.4);
    z-index: 99;
    animation: fadeIn 0.2s ease;
  }
  .btn-close-sidebar {
    display: block;
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>