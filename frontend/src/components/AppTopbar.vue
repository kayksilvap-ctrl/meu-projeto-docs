<template>
  <header class="topbar">
    <div class="topbar-left">
      <button class="hamburger-btn" @click="$emit('toggle-sidebar')" title="Alternar menu">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
      <div class="breadcrumb">
        <span class="breadcrumb-current">{{ pageTitle }}</span>
      </div>
    </div>
    <div class="topbar-right">
      <div class="user-menu">
        <div class="user-avatar-sm">AD</div>
        <span class="user-name-sm">Admin</span>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const pageTitle = ref('Dashboard')

watch(() => route.path, (path) => {
  const titles = {
    '/': 'Dashboard',
    '/criancas': 'Crianças',
    '/turmas': 'Turmas',
    '/fazer-chamada': 'Fazer Chamada',
    '/resumo': 'Resumo por Turma',
    '/relatorios': 'Relatórios',
    '/configuracoes': 'Configurações'
  }
  pageTitle.value = titles[path] || 'Dashboard'
}, { immediate: true })

defineEmits(['toggle-menu', 'toggle-sidebar'])
</script>

<style scoped>
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28px;
  background: white;
  border-bottom: 1px solid #E5E7EB;
  height: 60px;
  flex-shrink: 0;
}
.topbar-left {
  display: flex;
  align-items: center;
  gap: 14px;
}
.hamburger-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text);
  padding: 6px;
  border-radius: 8px;
  transition: background 0.2s;
}
.hamburger-btn:hover { background: #F3F4F6; }
.breadcrumb {}
.breadcrumb-current {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text);
}
.topbar-right {
  display: flex;
  align-items: center;
}
.user-menu {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px 4px 4px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}
.user-menu:hover { background: #F3F4F6; }
.user-avatar-sm {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, #E53935, #C62828);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 700;
}
.user-name-sm {
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--text);
}
@media (max-width: 960px) {
  .topbar { padding: 0 16px; }
  .user-name-sm { display: none; }
}
</style>