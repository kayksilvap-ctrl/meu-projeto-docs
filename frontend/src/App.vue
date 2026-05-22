<template>
  <v-app>
    <!-- Navbar -->
    <NavBar
      @add-aluno="abrirCadastro"
      @import-export="showImportExport = true"
      @estatisticas="showEstatisticas = true"
      @reset="confirmarReset"
    />

    <!-- Main Content -->
    <v-main>
      <router-view />
    </v-main>

    <!-- Modals -->
    <AlunoForm
      v-model="showAlunoForm"
      :aluno="alunoEditando"
      @saved="onAlunoSaved"
    />

    <ImportExportDialog
      v-model="showImportExport"
      @dados-importados="onDadosImportados"
    />

    <EstatisticasDialog
      v-model="showEstatisticas"
    />

    <!-- Reset Dialog -->
    <v-dialog v-model="showResetDialog" max-width="400">
      <v-card>
        <v-card-title class="bg-error pa-4 text-white">
          <v-icon class="mr-2">mdi-alert</v-icon>
          Resetar Todos os Dados
        </v-card-title>
        <v-card-text class="pa-4">
          <p class="mb-2">Tem certeza que deseja resetar TODOS os dados?</p>
          <p class="text-caption text-grey">
            Isso irá apagar todos os alunos e chamadas cadastrados. Esta ação não pode ser desfeita.
          </p>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="showResetDialog = false">Cancelar</v-btn>
          <v-btn
            color="error"
            @click="executarReset"
            :loading="resetando"
            prepend-icon="mdi-delete-restore"
          >
            Resetar Tudo
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar de notificações -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="3000"
      location="bottom right"
    >
      <v-icon start class="mr-2">{{ snackbar.icon }}</v-icon>
      {{ snackbar.message }}
      <template v-slot:actions>
        <v-btn color="white" variant="text" @click="snackbar.show = false">
          Fechar
        </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from './components/NavBar.vue'
import AlunoForm from './components/AlunoForm.vue'
import ImportExportDialog from './components/ImportExportDialog.vue'
import EstatisticasDialog from './components/EstatisticasDialog.vue'
import api from './api'

const router = useRouter()

// Modal states
const showAlunoForm = ref(false)
const showImportExport = ref(false)
const showEstatisticas = ref(false)
const showResetDialog = ref(false)
const alunoEditando = ref(null)
const resetando = ref(false)

// Snackbar
const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
  icon: 'mdi-check-circle'
})

function notificar(message, color = 'success', icon = 'mdi-check-circle') {
  snackbar.value = { show: true, message, color, icon }
}

function abrirCadastro() {
  alunoEditando.value = null
  showAlunoForm.value = true
}

function onAlunoSaved() {
  notificar('Aluno salvo com sucesso!')
}

function onDadosImportados() {
  notificar('Dados importados com sucesso!', 'success')
}

function confirmarReset() {
  showResetDialog.value = true
}

async function executarReset() {
  resetando.value = true
  try {
    await api.resetarDados()
    showResetDialog.value = false
    notificar('Todos os dados foram resetados!', 'warning', 'mdi-delete-restore')
  } catch (error) {
    console.error('Erro ao resetar:', error)
    notificar('Erro ao resetar dados.', 'error', 'mdi-alert')
  } finally {
    resetando.value = false
  }
}
</script>

<style>
/* Global styles */
#app {
  font-family: 'Montserrat', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Smooth page transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #8B4513;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #5C2E0A;
}
</style>