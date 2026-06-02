<template>
  <div class="dashboard">
    <div class="page-header">
      <div>
        <h1 class="page-title">Dashboard</h1>
        <p class="page-subtitle">{{ dataAtual }}</p>
      </div>
      <div class="header-actions">
        <select v-model="turmaFiltro" class="filter-select" @change="carregar">
          <option value="">Todas as turmas</option>
          <option v-for="t in turmas" :key="t.id" :value="t.id">{{ t.nome }}</option>
        </select>
        <input type="date" v-model="dataFiltro" class="filter-input" @change="carregar" />
      </div>
    </div>

    <div class="kpi-grid">
      <div class="kpi-card kpi-green">
        <div class="kpi-icon">✅</div>
        <div class="kpi-value">{{ dash.presentes }}</div>
        <div class="kpi-label">Presentes Hoje</div>
        <div class="kpi-compare" :class="dash.presentes > 0 ? 'positive' : 'neutral'">{{ dash.presentes }} crianças</div>
      </div>
      <div class="kpi-card kpi-orange">
        <div class="kpi-icon">📋</div>
        <div class="kpi-value">{{ dash.ausentes_justificadas }}</div>
        <div class="kpi-label">Faltas Justificadas</div>
        <div class="kpi-compare neutral">do total</div>
      </div>
      <div class="kpi-card kpi-red">
        <div class="kpi-icon">❌</div>
        <div class="kpi-value">{{ dash.ausentes_nao_justificadas }}</div>
        <div class="kpi-label">Faltas Não Justificadas</div>
        <div class="kpi-compare neutral">do total</div>
      </div>
      <div class="kpi-card kpi-blue">
        <div class="kpi-icon">📊</div>
        <div class="kpi-value">{{ dash.taxa_presenca }}%</div>
        <div class="kpi-label">Taxa de Frequência</div>
        <div class="kpi-compare" :class="dash.taxa_presenca >= 80 ? 'positive' : dash.taxa_presenca >= 50 ? 'neutral' : 'negative'">
          {{ dash.taxa_presenca >= 80 ? '✓ Boa' : dash.taxa_presenca >= 50 ? '⚠ Regular' : '✗ Baixa' }}
        </div>
      </div>
    </div>

    <div class="dashboard-bottom">
      <div class="card">
        <h3 class="card-title">Atividade Recente</h3>
        <div class="activity-list">
          <div v-for="(f, i) in frequencias" :key="i" class="activity-item">
            <div class="activity-dot" :class="f.status === 'presente' ? 'green' : f.status === 'ausente_justificada' ? 'orange' : 'red'"></div>
            <div class="activity-info">
              <span class="activity-name">{{ f.crianca_nome }}</span>
              <span class="activity-status" :class="f.status === 'presente' ? 'green' : 'red'">
                {{ f.status === 'presente' ? 'Presente' : f.status === 'ausente_justificada' ? 'Falta justificada' : 'Falta não justificada' }}
              </span>
            </div>
            <div class="activity-turma">{{ f.turma_nome || 'Sem turma' }}</div>
          </div>
          <div v-if="!frequencias.length" class="empty-state">
            <p>Nenhuma frequência registrada hoje.</p>
          </div>
        </div>
      </div>

      <div class="card">
        <h3 class="card-title">Resumo por Turma</h3>
        <div v-for="t in turmas" :key="t.id" class="turma-row">
          <span class="turma-name">{{ t.nome }}</span>
          <span class="turma-count">{{ t.total_criancas }} crianças</span>
          <div class="turma-bar">
            <div class="turma-bar-fill" :style="{ width: '70%' }"></div>
          </div>
        </div>
        <div v-if="!turmas.length" class="empty-state">
          <p>Nenhuma turma cadastrada.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../api'

const dataFiltro = ref(new Date().toISOString().split('T')[0])
const turmaFiltro = ref('')
const dash = ref({ total_criancas: 0, presentes: 0, ausentes_justificadas: 0, ausentes_nao_justificadas: 0, taxa_presenca: 0 })
const frequencias = ref([])
const turmas = ref([])

const dataAtual = new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

async function carregar() {
  const params = { data: dataFiltro.value }
  if (turmaFiltro.value) params.turma_id = turmaFiltro.value

  const [d, f] = await Promise.all([
    api.getDashboard(params).catch(() => ({ data: dash.value })),
    api.getFrequencias(params).catch(() => ({ data: [] }))
  ])
  dash.value = d.data
  frequencias.value = f.data
}

onMounted(async () => {
  const r = await api.getTurmas().catch(() => ({ data: [] }))
  turmas.value = r.data
  carregar()
})
</script>

<style scoped>
.dashboard { max-width: 1200px; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; flex-wrap: wrap; gap: 16px; }
.page-title { font-size: 1.5rem; font-weight: 700; color: var(--text); }
.page-subtitle { font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px; }
.header-actions { display: flex; gap: 8px; }
.filter-select, .filter-input { padding: 8px 12px; border: 1px solid #E5E7EB; border-radius: var(--radius-sm); font-size: 0.82rem; font-family: inherit; background: white; color: var(--text); outline: none; }

.kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }
@media (max-width: 960px) { .kpi-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 600px) { .kpi-grid { grid-template-columns: 1fr; } }

.kpi-card { background: white; border-radius: var(--radius); padding: 20px; box-shadow: var(--shadow); border-top: 3px solid; transition: var(--transition); }
.kpi-card:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); }
.kpi-green { border-top-color: var(--green); }
.kpi-orange { border-top-color: var(--orange); }
.kpi-red { border-top-color: var(--red); }
.kpi-blue { border-top-color: var(--blue); }

.kpi-icon { font-size: 1.5rem; margin-bottom: 8px; }
.kpi-value { font-size: 1.8rem; font-weight: 800; color: var(--text); line-height: 1; }
.kpi-label { font-size: 0.8rem; color: var(--text-secondary); margin-top: 6px; }
.kpi-compare { font-size: 0.72rem; margin-top: 4px; font-weight: 500; }
.kpi-compare.positive { color: var(--green); }
.kpi-compare.neutral { color: var(--text-secondary); }
.kpi-compare.negative { color: var(--red); }

.dashboard-bottom { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; }
@media (max-width: 960px) { .dashboard-bottom { grid-template-columns: 1fr; } }

.card { background: white; border-radius: var(--radius); padding: 20px; box-shadow: var(--shadow); }
.card-title { font-size: 0.9rem; font-weight: 600; color: var(--text); margin-bottom: 16px; }

.activity-list { display: flex; flex-direction: column; gap: 8px; }
.activity-item { display: flex; align-items: center; gap: 12px; padding: 8px 0; border-bottom: 1px solid #F3F4F6; }
.activity-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.activity-dot.green { background: var(--green); }
.activity-dot.orange { background: var(--orange); }
.activity-dot.red { background: var(--red); }
.activity-info { flex: 1; }
.activity-name { font-size: 0.85rem; font-weight: 500; margin-right: 8px; }
.activity-status { font-size: 0.75rem; font-weight: 500; }
.activity-status.green { color: var(--green); }
.activity-status.red { color: var(--red); }
.activity-turma { font-size: 0.75rem; color: var(--text-secondary); }

.turma-row { display: flex; align-items: center; gap: 12px; padding: 8px 0; border-bottom: 1px solid #F3F4F6; }
.turma-name { font-size: 0.85rem; font-weight: 500; min-width: 80px; }
.turma-count { font-size: 0.75rem; color: var(--text-secondary); min-width: 80px; }
.turma-bar { flex: 1; height: 6px; background: #F3F4F6; border-radius: 3px; }
.turma-bar-fill { height: 100%; background: var(--blue); border-radius: 3px; transition: width 0.5s ease; }

.empty-state { padding: 24px; text-align: center; color: var(--text-secondary); font-size: 0.85rem; }
</style>