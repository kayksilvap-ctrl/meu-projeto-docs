<template>
  <v-app>
    <NavBar
      @add-aluno="showAlunoForm = true"
      @import-export="showImportExport = true"
      @estatisticas="showEstatisticas = true"
      @reset="showResetDialog = true"
    />

    <v-main>
      <router-view v-slot="{ Component, route }">
        <transition name="page" mode="out-in">
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </v-main>

    <AlunoForm v-model="showAlunoForm" :aluno="null" @saved="notificar('Aluno salvo com sucesso!')" />
    <ImportExportDialog v-model="showImportExport" @dados-importados="notificar('Dados importados!', 'success')" />
    <EstatisticasDialog v-model="showEstatisticas" />

    <v-dialog v-model="showResetDialog" max-width="420">
      <v-card class="pa-6 text-center">
        <v-icon color="error" size="48" class="mb-3">mdi-alert-circle-outline</v-icon>
        <h3 class="text-h6 font-weight-bold mb-2">Resetar todos os dados?</h3>
        <p class="text-body-2 text-grey mb-4">Esta ação apagará todos os alunos, salas e chamadas permanentemente.</p>
        <div class="d-flex justify-center ga-2">
          <v-btn variant="tonal" color="grey" @click="showResetDialog = false">Cancelar</v-btn>
          <v-btn color="error" @click="executarReset" :loading="resetando">Confirmar Reset</v-btn>
        </div>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000" location="bottom right">
      <v-icon start class="mr-2">{{ snackbar.icon }}</v-icon>
      {{ snackbar.message }}
    </v-snackbar>
  </v-app>
</template>

<script setup>
import { ref } from 'vue'
import NavBar from './components/NavBar.vue'
import AlunoForm from './components/AlunoForm.vue'
import ImportExportDialog from './components/ImportExportDialog.vue'
import EstatisticasDialog from './components/EstatisticasDialog.vue'
import api from './api'

const showAlunoForm = ref(false)
const showImportExport = ref(false)
const showEstatisticas = ref(false)
const showResetDialog = ref(false)
const resetando = ref(false)

const snackbar = ref({ show: false, message: '', color: 'success', icon: 'mdi-check-circle' })

function notificar(message, color = 'success', icon = 'mdi-check-circle') {
  snackbar.value = { show: true, message, color, icon }
}

async function executarReset() {
  resetando.value = true
  try {
    await api.resetarDados()
    showResetDialog.value = false
    notificar('Dados resetados com sucesso!', 'warning', 'mdi-delete-restore')
  } catch {
    notificar('Erro ao resetar dados.', 'error', 'mdi-alert')
  } finally {
    resetando.value = false
  }
}
</script>

<style>
:root {
  --primary: #D90445;
  --primary-dark: #B80338;
  --primary-light: #E83E6B;
  --secondary: #FFD700;
  --secondary-dark: #B8960C;
  --bg: #F2EFE6;
  --surface: #FFFFFF;
  --text: #1A1A1A;
  --text-secondary: #757575;
  --success: #2E7D32;
  --error: #C62828;
  --gold-light: #FFF8E1;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.06);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.08);
  --transition: 0.2s ease;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

html {
  overflow-y: auto;
  background: var(--bg);
}

body {
  font-family: 'Montserrat', -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
  background: var(--bg);
  color: var(--text);
}

#app { background: var(--bg); }

.page-enter-active { transition: opacity 0.2s var(--transition), transform 0.2s var(--transition); }
.page-leave-active { transition: opacity 0.15s var(--transition); }
.page-enter-from { opacity: 0; transform: translateY(6px); }
.page-leave-to { opacity: 0; }

::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #CCC; border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: #999; }
</style>