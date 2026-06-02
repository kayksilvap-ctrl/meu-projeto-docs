<template>
  <v-container fluid class="pa-4 pa-md-6" style="background:#f5f0eb;min-height:100vh">
    <!-- Cabeçalho -->
    <div class="d-flex align-center justify-space-between mb-4 flex-wrap ga-2">
      <div>
        <h1 class="text-h4 font-weight-bold" style="color:#8B4513">
          <v-icon color="#FFD700" size="32" class="mr-2">mdi-view-dashboard</v-icon>Dashboard
        </h1>
        <p class="text-grey text-caption mt-1">
          <v-icon size="12" class="mr-1">mdi-calendar-today</v-icon>
          {{ dataAtualFormatada }}
        </p>
      </div>

      <div class="d-flex ga-2 flex-wrap">
        <v-select v-model="salaSelecionada" :items="salas" item-title="nome" item-value="id" label="Filtrar por sala" prepend-inner-icon="mdi-door-open" clearable density="compact" style="min-width:160px" variant="outlined" hide-details @update:model-value="carregarDashboard"></v-select>
        <v-menu :close-on-content-click="false" transition="scale-transition">
          <template v-slot:activator="{ props }">
            <v-btn v-bind="props" variant="outlined" color="#8B4513" size="small" class="bg-white">
              <v-icon start size="16">mdi-calendar</v-icon>
              {{ dataSelecionada ? formatarDataExibicao(dataSelecionada) : 'Data' }}
            </v-btn>
          </template>
          <v-date-picker v-model="dataSelecionada" @update:model-value="carregarDashboard" color="#8B4513" header-color="#8B4513"></v-date-picker>
        </v-menu>
      </div>
    </div>

    <!-- Cards -->
    <DashboardCards :dados="dashboard" />

    <!-- Chamadas Recentes + Resumo -->
    <v-row class="mt-4">
      <v-col cols="12" md="8">
        <v-card class="pa-4" elevation="1" style="border-radius:12px">
          <h3 class="font-weight-semibold mb-3" style="color:#8B4513;font-size:1rem">
            <v-icon color="#FFD700" size="18" class="mr-1">mdi-history</v-icon>Chamadas Recentes
          </h3>
          <div v-if="chamadasRecentes.length">
            <div v-for="(c, idx) in chamadasRecentes" :key="idx" class="d-flex align-center pa-2" :class="{ 'border-bottom': idx < chamadasRecentes.length - 1 }" style="border-radius:6px">
              <v-avatar :color="c.status === 'presente' ? 'success' : 'error'" size="28" class="mr-3">
                <v-icon color="white" size="16">{{ c.status === 'presente' ? 'mdi-check' : 'mdi-close' }}</v-icon>
              </v-avatar>
              <div class="flex-grow-1">
                <div class="font-weight-medium text-body-2">{{ c.aluno_nome || `#${c.aluno_id}` }}</div>
                <div class="text-caption text-grey">{{ c.status === 'presente' ? 'Presente' : 'Ausente' }} — {{ formatarDataExibicao(c.data) }}</div>
              </div>
            </div>
          </div>
          <div v-else class="text-center pa-4 text-grey">
            <v-icon size="40" class="mb-2">mdi-clipboard-text-off</v-icon>
            <p class="text-caption">Nenhuma chamada hoje.</p>
            <v-btn color="#8B4513" variant="tonal" to="/chamada" size="small" class="mt-2">Ir para Chamada</v-btn>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="pa-4" elevation="1" style="border-radius:12px">
          <h3 class="font-weight-semibold mb-3" style="color:#8B4513;font-size:1rem">
            <v-icon color="#FFD700" size="18" class="mr-1">mdi-information</v-icon>Resumo
          </h3>
          <v-list density="compact" lines="one">
            <v-list-item><template v-slot:prepend><v-icon color="#8B4513">mdi-account-group</v-icon></template><v-list-item-title class="text-body-2">Total de Alunos</v-list-item-title><template v-slot:append><v-chip color="#8B4513" size="x-small" label>{{ dashboard.total_alunos }}</v-chip></template></v-list-item>
            <v-divider inset></v-divider>
            <v-list-item><template v-slot:prepend><v-icon color="success">mdi-check-circle</v-icon></template><v-list-item-title class="text-body-2">Presentes</v-list-item-title><template v-slot:append><v-chip color="success" size="x-small" label>{{ dashboard.presentes }}</v-chip></template></v-list-item>
            <v-divider inset></v-divider>
            <v-list-item><template v-slot:prepend><v-icon color="error">mdi-close-circle</v-icon></template><v-list-item-title class="text-body-2">Ausentes</v-list-item-title><template v-slot:append><v-chip color="error" size="x-small" label>{{ dashboard.ausentes }}</v-chip></template></v-list-item>
            <v-divider inset></v-divider>
            <v-list-item><template v-slot:prepend><v-icon color="#FFD700">mdi-percent</v-icon></template><v-list-item-title class="text-body-2">Taxa de Presença</v-list-item-title><template v-slot:append><v-chip color="#FFD700" size="x-small" label>{{ dashboard.taxa_presenca }}%</v-chip></template></v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../api'
import DashboardCards from '../components/DashboardCards.vue'

const dashboard = ref({ total_alunos: 0, presentes: 0, ausentes: 0, taxa_presenca: 0 })
const chamadasRecentes = ref([])
const dataSelecionada = ref(new Date().toISOString().split('T')[0])
const salaSelecionada = ref(null)
const salas = ref([])

const dataAtualFormatada = computed(() => {
  return new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).replace('-feira', '')
})

function formatarDataExibicao(d) {
  if (!d) return ''
  const p = d.split('-')
  return new Date(p[0], p[1]-1, p[2]).toLocaleDateString('pt-BR')
}

async function carregarSalas() {
  try { const r = await api.getSalas(); salas.value = r.data || [] } catch (e) { console.error(e) }
}

async function carregarDashboard() {
  try {
    const r = await api.getDashboard(dataSelecionada.value, salaSelecionada.value || '')
    dashboard.value = r.data
  } catch (e) { console.error(e) }
}

async function carregarChamadasRecentes() {
  try {
    const r = await api.getChamada(dataSelecionada.value, salaSelecionada.value || '')
    chamadasRecentes.value = (r.data || []).filter(a => a.status).map(a => ({ aluno_id: a.id, aluno_nome: a.nome, status: a.status, data: dataSelecionada.value }))
  } catch (e) { console.error(e) }
}

onMounted(() => { carregarSalas(); carregarDashboard(); carregarChamadasRecentes() })
</script>