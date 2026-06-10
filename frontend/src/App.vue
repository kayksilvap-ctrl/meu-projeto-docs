<template>
  <div style="display:flex;height:100vh;overflow:hidden">
    <div class="app-layout">
      <!-- Sidebar -->
      <AppSidebar ref="sidebarRef" />

      <!-- Main Area -->
      <div class="main-area">
        <!-- Topbar -->
        <AppTopbar @toggle-menu="toggleMenu" />

        <!-- Content -->
        <main class="content-area">
          <router-view v-slot="{ Component, route }">
            <transition name="page" mode="out-in">
              <component :is="Component" :key="route.path" />
            </transition>
          </router-view>
        </main>
      </div>
    </div>

    <!-- Global Modals -->
    <router-view name="modal" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AppSidebar from './components/AppSidebar.vue'
import AppTopbar from './components/AppTopbar.vue'

const sidebarRef = ref(null)

function toggleMenu() {
  if (sidebarRef.value) {
    sidebarRef.value.toggleMenu()
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
  --bg: #F8F9FB;
  --surface: #FFFFFF;
  --text: #1A1A1A;
  --text-secondary: #6B7280;
  --sidebar-width: 250px;
  --radius: 12px;
  --radius-sm: 8px;
  --shadow: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.08);
  --transition: 0.2s ease;
}

* { margin: 0; padding: 0; box-sizing: border-box; }
html, body, #app { height: 100%; }
body {
  font-family: 'Inter', -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
  background: var(--bg);
  color: var(--text);
}

.app-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: var(--sidebar-width);
  overflow: hidden;
}

.content-area {
  flex: 1;
  overflow-y: auto;
  padding: 24px 32px;
  background: var(--bg);
}

@media (max-width: 960px) {
  .main-area { margin-left: 0; }
  .content-area { padding: 16px; }
}
@media (max-width: 600px) {
  .content-area { padding: 12px; }
}

.page-enter-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.page-leave-active { transition: opacity 0.15s ease; }
.page-enter-from { opacity: 0; transform: translateY(8px); }
.page-leave-to { opacity: 0; }

::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #D1D5DB; border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: #9CA3AF; }

/* Utility classes */
.ml-3 { margin-left: 12px; }
</style>
