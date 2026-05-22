<template>
  <div class="dashboard-page">
    <v-container fluid class="pa-4 pa-md-6">
      <!-- Cabeçalho -->
      <div class="d-flex align-center justify-space-between mb-4 flex-wrap ga-2">
        <div>
          <h1 class="text-h4 font-weight-bold" style="color: #8B4513;">
            <v-icon color="#FFD700" size="36" class="mr-2">mdi-view-dashboard</v-icon>
            Dashboard
          </h1>
          <p class="text-grey mt-1">
            <v-icon size="14" class="mr-1">mdi-calendar-today</v-icon>
            {{ dataAtualFormatada }}
          </p>
        </div>

        <!-- Seletor de data -->
        <v-menu :close-on-content-click="false" transition="scale-transition">
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              variant="outlined"
              color="#8B4513"
              prepend-icon="mdi-calendar"
              class="date-btn"
            >
              {{ dataSelecionada ? formatarDataExibicao(dataSelecionada) : 'Selecionar Data' }}
            </v-btn>
          </template>
          <v-date-picker
            v-model="dataSelecionada"
            @update:model-value="carregarDashboard"
            color="#8B4513"
            header-color="#8B4513"
          ></v-date-picker>
        </v-menu>
      </div>

      <!-- Cards do Dashboard -->
      <DashboardCards :dados="dashboard" />

      <!-- Últimas atividades / Chamadas Recentes -->
      <v-row class="mt-4">
        <v-col cols="12" md="8">
          <v-card class="pa-4" elevation="2">
            <h3 class="font-weight-bold mb-3" style="color: #8B4513;">
              <v-icon color="#FFD700" class="mr-1">mdi-history</v-icon>
              Chamadas Recentes
            </h3>

            <div v-if="chamadasRecentes.length > 0">
              <div
                v-for="(chamada, idx) in chamadasRecentes"
                :key="idx"
                class="d-flex align-center pa-2 recent-item"
                :class="{ 'border-bottom': idx < chamadasRecentes.length - 1 }"
              >
                <v-avatar
                  :color="chamada.status === 'presente' ? 'success' : 'error'"
                  size="32"
                  class="mr-3"
                >
                  <v-icon color="white" size="18">
                    {{ chamada.status === 'presente' ? 'mdi-check' : 'mdi-close' }}
                  </v-icon>
                </v-avatar>
                <div class="flex-grow-1">
                  <div class="font-weight-medium" style="font-size: 0.9rem;">
                    {{ chamada.aluno_nome || `Aluno #${chamada.aluno_id}` }}
                  </div>
                  <div class="text-caption text-grey">
                    {{ chamada.status === 'presente' ? 'Presente' : 'Ausente' }} —
                    {{ formatarDataExibicao(chamada.data) }}
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-center pa-4 text-grey">
              <v-icon size="48" class="mb-2">mdi-clipboard-text-off</v-icon>
              <p>Nenhuma chamada registrada ainda.</p>
              <v-btn
                color="#8B4513"
                variant="outlined"
                to="/chamada"
                prepend-icon="mdi-clipboard-check"
              >
                Ir para Chamada
              </v-btn>
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card class="pa-4" elevation="2">
            <h3 class="font-weight-bold mb-3" style="color: #8B4513;">
              <v-icon color="#FFD700" class="mr-1">mdi-information</v-icon>
              Resumo Rápido
            </h3>

            <v-list density="compact">
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="#8B4513">mdi-account-group</v-icon>
                </template>
                <v-list-item-title>Total de Alunos</v-list-item-title>
                <template v-slot:append>
                  <v-chip color="#8B4513" label>{{ dashboard.total_alunos }}</v-chip>
                </template>
              </v-list-item>
              <v-divider inset></v-divider>
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="success">mdi-check-circle</v-icon>
                </template>
                <v-list-item-title>Presentes Hoje</v-list-item-title>
                <template v-slot:append>
                  <v-chip color="success" label>{{ dashboard.presentes }}</v-chip>
                </template>
              </v-list-item>
              <v-divider inset></v-divider>
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="error">mdi-close-circle</v-icon>
                </template>
                <v-list-item-title>Ausentes Hoje</v-list-item-title>
                <template v-slot:append>
                  <v-chip color="error" label>{{ dashboard.ausentes }}</v-chip>
                </template>
              </v-list-item>
              <v-divider inset></v-divider>
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="#FFD700">mdi-percent</v-icon>
                </template>
                <v-list-item-title>Taxa de Presença</v-list-item-title>
                <template v-slot:append>
                  <v-chip color="#FFD700" label>{{ dashboard.taxa_presenca }}%</v-chip>
                </template>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../api'
import DashboardCards from '../components/DashboardCards.vue'

const dashboard = ref({
  total_alunos: 0,
  presentes: 0,
  ausentes: 0,
  taxa_presenca: 0
})

const chamadasRecentes = ref([])
const dataSelecionada = ref(new Date().toISOString().split('T')[0])

const hoje = new Date()
const dataAtualFormatada = computed(() => {
  return hoje.toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).replace('-feira', '')
})

function formatarDataExibicao(dataStr) {
  if (!dataStr) return ''
  const parts = dataStr.split('-')
  if (parts.length === 3) {
    return new Date(parts[0], parts[1] - 1, parts[2]).toLocaleDateString('pt-BR')
  }
  return dataStr
}

async function carregarDashboard() {
  try {
    const response = await api.getDashboard(dataSelecionada.value)
    dashboard.value = response.data
  } catch (error) {
    console.error('Erro ao carregar dashboard:', error)
  }
}

async function carregarChamadasRecentes() {
  try {
    const response = await api.getChamada(dataSelecionada.value)
    const alunos = response.data || []
    chamadasRecentes.value = alunos
      .filter(a => a.status)
      .map(a => ({
        aluno_id: a.id,
        aluno_nome: a.nome,
        status: a.status,
        data: dataSelecionada.value
      }))
  } catch (error) {
    console.error('Erro ao carregar chamadas recentes:', error)
  }
}

onMounted(() => {
  carregarDashboard()
  carregarChamadasRecentes()
})
</script>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  background: #f5f0eb;
}

.date-btn {
  text-transform: none;
  font-weight: 500;
  background: white !important;
}

.recent-item {
  transition: background 0.2s;
  border-radius: 4px;
}

.recent-item:hover {
  background: #f5f0eb;
}

.border-bottom {
  border-bottom: 1px solid #e0e0e0;
}
</style>