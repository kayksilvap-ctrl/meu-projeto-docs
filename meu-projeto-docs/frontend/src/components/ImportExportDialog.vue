<template>
  <v-dialog v-model="dialogVisible" max-width="550">
    <v-card>
      <v-card-title class="form-header pa-4">
        <v-icon color="#FFD700" size="28" class="mr-2">mdi-file-transfer</v-icon>
        <span class="text-white font-weight-bold">Exportar / Importar Dados</span>
        <v-spacer></v-spacer>
        <v-btn icon variant="text" color="white" @click="fechar" size="small">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text class="pa-4">
        <!-- Exportar -->
        <div class="mb-6">
          <h3 class="font-weight-bold mb-2" style="color: #8B4513;">
            <v-icon color="#FFD700" class="mr-1">mdi-download</v-icon>
            Exportar Dados
          </h3>
          <p class="text-caption text-grey mb-3">
            Baixe todos os dados (alunos e chamadas) em formato JSON.
          </p>
          <v-btn
            color="#8B4513"
            class="text-white"
            @click="exportar"
            :loading="exportando"
            prepend-icon="mdi-file-download"
          >
            Baixar JSON
          </v-btn>
        </div>

        <v-divider class="mb-4"></v-divider>

        <!-- Importar -->
        <div>
          <h3 class="font-weight-bold mb-2" style="color: #8B4513;">
            <v-icon color="#FFD700" class="mr-1">mdi-upload</v-icon>
            Importar Dados
          </h3>
          <p class="text-caption text-grey mb-3">
            Selecione um arquivo JSON para importar. Isso substituirá todos os dados atuais!
          </p>

          <v-file-input
            v-model="arquivo"
            accept=".json"
            label="Selecionar arquivo JSON"
            prepend-icon="mdi-paperclip"
            variant="outlined"
            density="compact"
            :loading="importando"
            :disabled="importando"
          ></v-file-input>

          <v-btn
            color="warning"
            @click="importar"
            :loading="importando"
            :disabled="!arquivo"
            prepend-icon="mdi-file-upload"
          >
            Importar Dados
          </v-btn>
        </div>
      </v-card-text>

      <v-card-actions class="pa-4 bg-grey-lighten-4">
        <v-spacer></v-spacer>
        <v-btn variant="text" color="grey" @click="fechar">Fechar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import api from '../api'

const props = defineProps({
  modelValue: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'dados-importados'])

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const arquivo = ref(null)
const exportando = ref(false)
const importando = ref(false)

function fechar() {
  emit('update:modelValue', false)
  arquivo.value = null
}

async function exportar() {
  exportando.value = true
  try {
    const response = await api.exportarDados()
    const dados = response.data

    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `dados-anjo-guarda-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Erro ao exportar:', error)
    alert('Erro ao exportar dados.')
  } finally {
    exportando.value = false
  }
}

async function importar() {
  if (!arquivo.value) return

  importando.value = true
  try {
    const text = await arquivo.value.text()
    const dados = JSON.parse(text)

    const confirmed = confirm(
      'Isso irá substituir TODOS os dados atuais. Deseja continuar?'
    )

    if (!confirmed) {
      importando.value = false
      return
    }

    await api.importarDados(dados)
    alert('Dados importados com sucesso!')
    emit('dados-importados')
    fechar()
  } catch (error) {
    console.error('Erro ao importar:', error)
    alert('Erro ao importar dados. Verifique se o arquivo é válido.')
  } finally {
    importando.value = false
  }
}
</script>

<style scoped>
.form-header {
  background: linear-gradient(135deg, #8B4513 0%, #5C2E0A 100%);
}
</style>