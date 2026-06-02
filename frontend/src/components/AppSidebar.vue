<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <LogoAnjo :size="36" :showText="false" />
      <div class="ml-3">
        <div class="sidebar-title">Anjo da Guarda</div>
        <div class="sidebar-subtitle">Gestão de Frequência</div>
      </div>
    </div>

    <nav class="sidebar-nav">
      <router-link v-for="item in menuItems" :key="item.path" :to="item.path"
        class="nav-item" :class="{ active: $route.path === item.path }">
        <span class="nav-icon">{{ item.icon }}</span>
        <span class="nav-label">{{ item.label }}</span>
      </router-link>
    </nav>

    <div class="sidebar-footer">
      <div class="user-info">
        <div class="user-avatar">AD</div>
        <div class="user-details">
          <div class="user-name">Administrador</div>
          <div class="user-role">admin@anjodaguarda.org</div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { useRoute } from 'vue-router'
import LogoAnjo from './LogoAnjo.vue'
const route = useRoute()

const menuItems = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/criancas', label: 'Crianças', icon: '👦' },
  { path: '/responsaveis', label: 'Responsáveis', icon: '👨‍👩‍👧' },
  { path: '/turmas', label: 'Turmas', icon: '🏫' },
  { path: '/frequencia', label: 'Frequência', icon: '📅' },
  { path: '/relatorios', label: 'Relatórios', icon: '📈' },
  { path: '/configuracoes', label: 'Configurações', icon: '⚙️' }
]
</script>

<style scoped>
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
}

.sidebar-header {
  display: flex;
  align-items: center;
  padding: 20px 20px;
  border-bottom: 1px solid #E5E7EB;
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
  padding: 12px 10px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  text-decoration: none;
  color: var(--text-secondary);
  font-size: 0.88rem;
  font-weight: 500;
  transition: var(--transition);
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
  font-size: 1.2rem;
  width: 24px;
  text-align: center;
}

.sidebar-footer {
  padding: 16px 20px;
  border-top: 1px solid #E5E7EB;
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
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text);
}

.user-role {
  font-size: 0.7rem;
  color: var(--text-secondary);
}

@media (max-width: 960px) {
  .sidebar { display: none; }
}
</style>