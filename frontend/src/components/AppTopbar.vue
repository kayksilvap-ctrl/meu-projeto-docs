<template>
  <header class="topbar">
    <div class="topbar-left">
      <button class="hamburger-btn" @click="$emit('toggle-menu')">☰</button>
      <input type="text" class="search-input" placeholder="🔍 Buscar..." v-model="busca" />
      <select v-model="turmaFiltro" class="filter-select">
        <option value="">Todas as turmas</option>
        <option v-for="t in turmas" :key="t.id" :value="t.id">{{ t.nome }}</option>
      </select>
      <input type="date" class="filter-input" v-model="dataFiltro" />
    </div>
    <div class="topbar-right">
      <span class="notification-badge">🔔 <span class="badge">3</span></span>
      <div class="user-avatar-sm">AD</div>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import api from '../api'
defineEmits(['toggle-menu'])
const busca = ref('')
const turmaFiltro = ref('')
const dataFiltro = ref(new Date().toISOString().split('T')[0])
const turmas = ref([])

api.getTurmas().then(r => turmas.value = r.data).catch(() => {})
</script>

<style scoped>
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 32px;
  background: white;
  border-bottom: 1px solid #E5E7EB;
  height: 60px;
  flex-shrink: 0;
}
.topbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}
.search-input {
  padding: 8px 16px;
  border: 1px solid #E5E7EB;
  border-radius: var(--radius-sm);
  font-size: 0.88rem;
  width: 280px;
  outline: none;
  transition: var(--transition);
  font-family: inherit;
}
.search-input:focus {
  border-color: var(--red);
  box-shadow: 0 0 0 3px rgba(229, 57, 53, 0.1);
}
.filter-select, .filter-input {
  padding: 8px 12px;
  border: 1px solid #E5E7EB;
  border-radius: var(--radius-sm);
  font-size: 0.82rem;
  outline: none;
  font-family: inherit;
  background: white;
  color: var(--text);
}
.topbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}
.notification-badge {
  position: relative;
  cursor: pointer;
  font-size: 1.1rem;
}
.badge {
  position: absolute;
  top: -6px;
  right: -8px;
  background: var(--red);
  color: white;
  font-size: 0.65rem;
  padding: 1px 5px;
  border-radius: 10px;
  font-weight: 700;
}
.hamburger-btn {
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text);
  padding: 4px;
  line-height: 1;
}

.user-avatar-sm {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--blue);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 700;
  cursor: pointer;
}
@media (max-width: 960px) {
  .topbar { padding: 12px 16px; }
  .search-input { width: 150px; }
  .hamburger-btn { display: block; }
}
</style>