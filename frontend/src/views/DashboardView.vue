<template>
  <v-container fluid class="pa-4 pa-md-6">
    <div class="d-flex align-center justify-space-between mb-5 flex-wrap ga-2">
      <div>
        <h1 class="page-title">Dashboard</h1>
        <p class="text-body-2 text-secondary mt-1">{{ dataAtualFormatada }}</p>
      </div>
      <div class="d-flex ga-2">
        <v-select
          v-model="salaSelecionada" :items="salas" item-title="nome" item-value="id"
          label="Filtrar sala" prepend-inner-icon="mdi-door-open" clearable
          density="compact" variant="outlined" hide-details style="min-width:150px"
          @update:model-value="carregarDashboard"
        />
        <v-menu :close-on-content-click="false" transition="scale-transition">
          <template v-slot:activator="{ props }">
            <v-btn v-bind="props" variant="outlined" color="primary" size="small" class="bg-white">
              <v-icon start size="16">mdi-calendar</v-icon>
              {{ dataSelecionada ? formatarData(dataSelecionada) : 'Hoje' }}
            </v-btn>
          </template>
          <v-date-picker v-model="dataSelecionada" @update:model-value="carregarDashboard" color="primary" />
        </v-menu>
      </div>
    </div>

    <DashboardCards :dados="dashboard" />

    <v-row class="mt-5">
      <v-col cols="12" md="7">
        <v-card class="pa-4" elevation="1">
          <h3 class="section-title">
            <v-icon color="secondary" size="18" class="mr-1">mdi-history</v-icon>
            Chamadas de hoje
          </h3>
          <div v-if="chamadasRecentes.length">
            <div
              v-for="(c, idx) in chamadasRecentes" :key="idx"
              class="d-flex align-center pa-2 rounded-sm"
              :class="{ 'border-bottom': idx < chamadasRecentes.length - 1 }"
            >
              <v-avatar :color="c.status === 'presente' ? 'success' : 'error'" size="28" class="mr-3">
                <v-icon color="white" size="16">{{ c.status === 'presente' ? 'mdi-check' : 'mdi-close' }}</v-icon>
              </v-avatar>
              <div class="flex-grow-1">
                <div class="text-body-2 font-weight-medium">{{ c.aluno_nome }}</div>
                <div class="text-caption text-secondary">{{ c.status === 'presente' ? 'Presente' : 'Ausente' }}</div>
              </div>
              <v-chip :color="c.status === 'presente' ? 'success' : 'error'" size="x-small" label>
                {{ c.status === 'presente' ? '✓' : '✗' }}
              </v-chip>
            </div>
          </div>
          <div v-else class="text-center pa-6 text-secondary">
            <v-icon size="40" class="mb-2">mdi-clipboard-text-off</v-icon>
            <p class="text-body-2 mb-3">Nenhuma chamada registrada hoje.</p>
            <v-btn color="primary" variant="tonal" to="/chamada" size="small">Ir para Chamada</v-btn>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="5">
        <v-card class="pa-4" elevation="1">
          <h3 class="section-title">
            <v-icon color="secondary" size="18" class="mr-1">mdi-information</v-icon>
            Resumo
          </h3>
          <div class="d-flex flex-column ga-2 mt-3">
            <div class="d-flex align-center justify-space-between pa-2 rounded-sm" style="background:var(--gold-light)">
              <span class="text-body-2 font-weight-medium">Total de Alunos</span>
              <v-chip color="primary" size="small" label>{{ dashboard.total_alunos }}</v-chip>
            </div>
            <div class="d-flex align-center justify-space-between pa-2 rounded-sm" style="background:#E8F5E9">
              <span class="text-body-2 font-weight-medium">Presentes</span>
              <v-chip color="success" size="small" label>{{ dashboard.presentes }}</v-chip>
            </div>
            <div class="d-flex align-center justify-space-between pa-2 rounded-sm" style="background:#FFEBEE">
              <span class="text-body-2 font-weight-medium">Ausentes</span>
              <v-chip color="error" size="small" label>{{ dashboard.ausentes }}</v-chip>
            </div>
            <div class="d-flex align-center justify-space-between pa-2 rounded-sm" style="background:var(--gold-light)">
              <span class="text-body-2 font-weight-medium">Taxa de Presença</span>
              <v-chip color="secondary" size="small" label>{{ dashboard.taxa_presenca }}%</v-chip>
            </div>
          </div>
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

const dataAtualFormatada = computed(() => new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).replace('-feira', ''))

function formatarData(d) {
  if (!d) return ''
  const p = d.split('-')
  return new Date(p[0], p[1]-1, p[2]).toLocaleDateString('pt-BR')
}

async function carregarSalas() {
  try { const r = await api.getSalas(); salas.value = r.data || [] } catch {}
}

async function carregarDashboard() {
  try {
    const [dash, chamada] = await Promise.all([
      api.getDashboard(dataSelecionada.value, salaSelecionada.value || ''),
      api.getChamada(dataSelecionada.value, salaSelecionada.value || '')
    ])
    dashboard.value = dash.data
    chamadasRecentes.value = (chamada.data || []).filter(a => a.status)
  } catch {}
}

onMounted(() => { carregarSalas(); carregarDashboard() })
</script>

<style scoped>
.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text);
}
.section-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 12px;
}
.border-bottom { border-bottom: 1px solid #eee; }
.rounded-sm { border-radius: 6px; }
</style>