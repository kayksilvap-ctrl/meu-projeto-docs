<template>
  <div class="chamada-page">
    <v-container fluid class="pa-4 pa-md-6">
      <!-- Cabeçalho -->
      <div class="d-flex align-center justify-space-between mb-4 flex-wrap ga-2">
        <div>
          <h1 class="text-h4 font-weight-bold" style="color: #8B4513;">
            <v-icon color="#FFD700" size="36" class="mr-2">mdi-clipboard-check</v-icon>
            Chamada Diária
          </h1>
          <p class="text-grey mt-1">
            Marque presença ou ausência dos alunos
          </p>
        </div>

        <!-- Seletor de Data -->
        <v-menu :close-on-content-click="false" transition="scale-transition">
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              variant="outlined"
              color="#8B4513"
              prepend-icon="mdi-calendar"
              class="date-btn"
              size="large"
            >
              <v-icon start>mdi-calendar</v-icon>
              {{ dataFormatada }}
              <v-icon end size="small">mdi-chevron-down</v-icon>
            </v-btn>
          </template>
          <v-date-picker
            v-model="dataSelecionada"
            @update:model-value="onDataChange"
            color="#8B4513"
            header-color="#8B4513"
            :max="hoje"
          ></v-date-picker>
        </v-menu>
      </div>

      <!-- Barra de ações rápidas -->
      <v-card class="pa-3 mb-4 d-flex align-center flex-wrap ga-2" elevation="2">
        <v-chip
          label
          color="#8B4513"
          variant="tonal"
          class="mr-2"
        >
          <v-icon start>mdi-account-group</v-icon>
          {{ alunos.length }} alunos
        </v-chip>
        <v-chip
          label
          color="success"
          variant="tonal"
          class="mr-2"
        >
          <v-icon start>mdi-check-circle</v-icon>
          {{ totalPresentes }} presentes
        </v-chip>
        <v-chip
          label
          color="error"
          variant="tonal"
          class="mr-2"
        >
          <v-icon start>mdi-close-circle</v-icon>
          {{ totalAusentes }} ausentes
        </v-chip>
        <v-chip
          label
          color="grey"
          variant="tonal"
        >
          <v-icon start>mdi-minus-circle</v-icon>
          {{ totalNaoRegistrados }} não registrados
        </v-chip>

        <v-spacer></v-spacer>

        <!-- Marcar todos como presente -->
        <v-btn
          v-if="alunos.length > 0 && totalNaoRegistrados > 0"
          color="success"
          variant="tonal"
          size="small"
          prepend-icon="mdi-check-all"
          @click="marcarTodosPresentes"
          :loading="marcandoTodos"
        >
          Marcar Todos Presentes
        </v-btn>
      </v-card>

      <!-- Lista de Chamada -->
      <div v-if="carregando" class="d-flex justify-center pa-8">
        <v-progress-circular indeterminate color="#8B4513" size="48"></v-progress-circular>
      </div>

      <div v-else-if="alunos.length === 0" class="text-center pa-8">
        <v-icon size="64" color="grey lighten-2" class="mb-3">mdi-account-off</v-icon>
        <h3 class="text-grey">Nenhum aluno cadastrado</h3>
        <p class="text-grey-lighten-1 mb-4">
          Cadastre alunos primeiro para fazer a chamada.
        </p>
        <v-btn
          color="#8B4513"
          class="text-white"
          prepend-icon="mdi-account-plus"
          to="/alunos"
        >
          Gerenciar Alunos
        </v-btn>
      </div>

      <div v-else>
        <v-row>
          <v-col cols="12">
            <!-- Lista compacta para mobile -->
            <div class="d-none d-sm-block">
              <v-row>
                <v-col
                  v-for="aluno in alunos"
                  :key="aluno.id"
                  cols="12"
                >
                  <AlunoCard
                    :aluno="aluno"
                    @registrar="registrarPresenca"
                  />
                </v-col>
              </v-row>
            </div>

            <!-- Cards em grid para desktop -->
            <div class="d-sm-none">
              <v-row>
                <v-col
                  v-for="aluno in alunos"
                  :key="aluno.id"
                  cols="12"
                >
                  <AlunoCard
                    :aluno="aluno"
                    @registrar="registrarPresenca"
                  />
                </v-col>
              </v-row>
            </div>
          </v-col>
        </v-row>
      </div>
    </v-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../api'
import AlunoCard from '../components/AlunoCard.vue'

const alunos = ref([])
const carregando = ref(false)
const marcandoTodos = ref(false)
const dataSelecionada = ref(new Date().toISOString().split('T')[0])
const hoje = ref(new Date().toISOString().split('T')[0])

const dataFormatada = computed(() => {
  if (!dataSelecionada.value) return 'Selecionar Data'
  const parts = dataSelecionada.value.split('-')
  return new Date(parts[0], parts[1] - 1, parts[2]).toLocaleDateString('pt-BR')
})

const totalPresentes = computed(() =>
  alunos.value.filter(a => a.status === 'presente').length
)

const totalAusentes = computed(() =>
  alunos.value.filter(a => a.status === 'ausente').length
)

const totalNaoRegistrados = computed(() =>
  alunos.value.filter(a => !a.status).length
)

async function carregarChamada() {
  carregando.value = true
  try {
    const response = await api.getChamada(dataSelecionada.value)
    alunos.value = response.data || []
  } catch (error) {
    console.error('Erro ao carregar chamada:', error)
    alunos.value = []
  } finally {
    carregando.value = false
  }
}

async function registrarPresenca({ aluno_id, status }) {
  try {
    const response = await api.registrarChamada(aluno_id, dataSelecionada.value, status)

    // Atualizar status do aluno na lista local
    const index = alunos.value.findIndex(a => a.id === aluno_id)
    if (index !== -1) {
      alunos.value[index] = {
        ...alunos.value[index],
        status: response.data?.status || status,
        chamada_data: dataSelecionada.value
      }
    }
  } catch (error) {
    console.error('Erro ao registrar presença:', error)
    alert('Erro ao registrar. Tente novamente.')
  }
}

async function marcarTodosPresentes() {
  marcandoTodos.value = true
  try {
    const promises = alunos.value
      .filter(a => !a.status)
      .map(a => api.registrarChamada(a.id, dataSelecionada.value, 'presente'))

    await Promise.all(promises)
    await carregarChamada()
  } catch (error) {
    console.error('Erro ao marcar todos:', error)
    alert('Erro ao marcar todos como presente.')
  } finally {
    marcandoTodos.value = false
  }
}

function onDataChange() {
  carregarChamada()
}

onMounted(() => {
  carregarChamada()
})
</script>

<style scoped>
.chamada-page {
  min-height: 100vh;
  background: #f5f0eb;
}

.date-btn {
  text-transform: none;
  font-weight: 500;
  background: white !important;
}

.d-none.d-sm-block {
  display: none;
}

@media (min-width: 600px) {
  .d-none.d-sm-block {
    display: block;
  }
  .d-sm-none {
    display: none;
  }
}
</style>