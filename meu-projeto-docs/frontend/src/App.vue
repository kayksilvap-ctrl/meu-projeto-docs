<template>
  <!-- Login: tela cheia sem sidebar nem topbar -->
  <div v-if="isLoginPage" class="login-wrapper">
    <router-view />
  </div>

  <!-- Aplicação: com sidebar + topbar -->
  <div v-else class="app-shell">
    <AppSidebar ref="sidebarRef" />
    <div class="app-main">
      <AppTopbar @toggle-menu="toggleMenu" @toggle-sidebar="toggleSidebar" />
      <main class="app-content">
        <router-view v-slot="{ Component, route }">
          <transition name="page" mode="out-in">
            <component :is="Component" :key="route.path" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from './components/AppSidebar.vue'
import AppTopbar from './components/AppTopbar.vue'

const route = useRoute()
const sidebarRef = ref(null)
const isLoginPage = computed(() => route.path === '/login')

function toggleMenu() {
  if (sidebarRef.value) sidebarRef.value.toggleMenu()
}

function toggleSidebar() {
  if (window.innerWidth > 960) {
    const currentlyCollapsed = sidebarRef.value?.sidebarCollapsed
    const newWidth = currentlyCollapsed ? '250px' : '70px'
    document.documentElement.style.setProperty('--sidebar-width', newWidth)
    if (sidebarRef.value) sidebarRef.value.sidebarCollapsed = !currentlyCollapsed
  } else {
    toggleMenu()
  }
}
</script>

<style>
:root {
  --red: #E53935;
  --red-dark: #C62828;
  --red-light: #FFEBEE;
  --green: #22C55E;
  --green-light: #E8F5E9;
  --orange: #F59E0B;
  --orange-light: #FFF8E1;
  --blue: #3B82F6;
  --blue-light: #E3F2FD;
  --bg: #F0F2F5;
  --surface: #FFFFFF;
  --text: #1A1A1A;
  --text-secondary: #6B7280;
  --sidebar-width: 250px;
  --radius: 12px;
  --radius-sm: 8px;
  --shadow: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.08);
  --shadow-lg: 0 10px 30px rgba(0,0,0,0.1);
  --transition: 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body, #app { height: 100%; }
body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: var(--bg);
  color: var(--text);
  font-size: 16px;
  line-height: 1.5;
}
.login-wrapper { height: 100vh; overflow: auto; }
.app-shell { display: flex; height: 100vh; overflow: hidden; }
.app-main {
  flex: 1; display: flex; flex-direction: column;
  margin-left: var(--sidebar-width); overflow: hidden;
  transition: margin-left var(--transition);
}
.app-content {
  flex: 1; overflow-y: auto; overflow-x: hidden;
  padding: 24px 32px; background: var(--bg);
}
.page-enter-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.page-leave-active { transition: opacity 0.15s ease; }
.page-enter-from { opacity: 0; transform: translateY(10px); }
.page-leave-to { opacity: 0; }
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #D1D5DB; border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: #9CA3AF; }
@media (max-width: 1200px) {
  .app-main { margin-left: 70px; }
  .app-content { padding: 20px 24px; }
}
@media (max-width: 960px) {
  .app-main { margin-left: 0; }
  .app-content { padding: 16px; }
}
@media (max-width: 600px) {
  .app-content { padding: 12px; }
}
</style>