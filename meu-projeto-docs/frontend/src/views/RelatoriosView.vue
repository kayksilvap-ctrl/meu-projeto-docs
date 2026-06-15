<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Relatórios</h1>
        <p class="page-subtitle">Visão geral dos últimos 30 dias</p>
      </div>
    </div>

    <div class="cards-grid">
      <div class="card">
        <h3 class="card-title">Presenças vs Faltas por Dia</h3>
        <canvas ref="chartRef" style="width:100%;height:260px"></canvas>
      </div>

      <div class="card">
        <h3 class="card-title">Distribuição por Turma</h3>
        <div v-for="t in dados.turmas" :key="t.id" class="turma-bar-item">
          <div class="turma-bar-header">
            <span>{{ t.nome }}</span>
            <span class="text-secondary">{{ t.presentes + t.faltas }} registros</span>
          </div>
          <div class="turma-bar-track">
            <div class="turma-bar-fill green" :style="{ width: barWidth(t.presentes, t.presentes + t.faltas) + '%' }"></div>
            <div class="turma-bar-fill red" :style="{ width: barWidth(t.faltas, t.presentes + t.faltas) + '%' }"></div>
          </div>
          <div class="turma-bar-legend">
            <span class="green-text">{{ t.presentes }} presentes</span>
            <span class="red-text">{{ t.faltas }} faltas</span>
          </div>
        </div>
        <div v-if="!dados.turmas?.length" class="empty-state">Sem dados por turma.</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import api from '../api'
import Chart from 'chart.js/auto'

const chartRef = ref(null)
const dados = ref({ dias: [], turmas: [] })

function barWidth(val, total) { return total > 0 ? (val / total) * 100 : 0 }

async function carregar() {
  dados.value = (await api.getRelatorios().catch(() => ({ data: { dias: [], turmas: [] } }))).data
  await nextTick()
  renderChart()
}

function renderChart() {
  if (!chartRef.value || !dados.value.dias?.length) return
  new Chart(chartRef.value, {
    type: 'bar',
    data: {
      labels: dados.value.dias.map(d => d.data.split('-').slice(1).reverse().join('/')),
      datasets: [
        { label: 'Presentes', data: dados.value.dias.map(d => d.presentes), backgroundColor: '#22C55E', borderRadius: 4 },
        { label: 'Faltas Justificadas', data: dados.value.dias.map(d => d.ausentes_justificadas), backgroundColor: '#F59E0B', borderRadius: 4 },
        { label: 'Faltas Não Justificadas', data: dados.value.dias.map(d => d.ausentes_nao_justificadas), backgroundColor: '#E53935', borderRadius: 4 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 16, font: { size: 12 } } } },
      scales: { x: { stacked: true, grid: { display: false } }, y: { stacked: true, beginAtZero: true } }
    }
  })
}

onMounted(carregar)
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.page-title { font-size: 1.5rem; font-weight: 700; color: var(--text); }
.page-subtitle { font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px; }
.cards-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 16px; }
@media (max-width: 960px) { .cards-grid { grid-template-columns: 1fr; } }
.card { background: white; border-radius: var(--radius); padding: 24px; box-shadow: var(--shadow); }
.card-title { font-size: 0.9rem; font-weight: 600; color: var(--text); margin-bottom: 16px; }
.turma-bar-item { margin-bottom: 16px; }
.turma-bar-header { display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 6px; }
.turma-bar-track { display: flex; height: 8px; background: #F3F4F6; border-radius: 4px; overflow: hidden; }
.turma-bar-fill.green { background: var(--green); }
.turma-bar-fill.red { background: var(--red); }
.turma-bar-legend { display: flex; justify-content: space-between; font-size: 0.72rem; margin-top: 4px; }
.green-text { color: var(--green); }
.red-text { color: var(--red); }
.text-secondary { color: var(--text-secondary); }
.empty-state { padding: 24px; text-align: center; color: var(--text-secondary); font-size: 0.85rem; }
</style>