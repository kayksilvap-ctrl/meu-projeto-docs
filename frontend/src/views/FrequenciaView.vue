<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Frequência</h1>
        <p class="page-subtitle">Registre a presença das crianças</p>
      </div>
      <div class="header-actions">
        <select v-model="turmaFiltro" class="filter-select" @change="carregar">
          <option value="">Todas as turmas</option>
          <option v-for="t in turmas" :key="t.id" :value="t.id">{{ t.nome }}</option>
        </select>
        <input type="date" v-model="dataFiltro" class="filter-input" @change="carregar" />
      </div>
    </div>

    <div class="kpi-strip">
      <div class="kpi-mini kpi-green">{{ presentes }} ✅ Presentes</div>
      <div class="kpi-mini kpi-orange">{{ justificadas }} 📋 Justificadas</div>
      <div class="kpi-mini kpi-red">{{ naoJustificadas }} ❌ Não Justificadas</div>
      <div class="kpi-mini kpi-blue">{{ criancas.length }} 👶 Total</div>
    </div>

    <div class="table-container">
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Nome da Criança</th>
              <th>Turma</th>
              <th>Presenças</th>
              <th>Faltas Justificadas</th>
              <th>Faltas Não Justificadas</th>
              <th>Frequência</th>
              <th>Status Hoje</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in criancas" :key="c.id">
              <td class="font-medium">{{ c.nome }}</td>
              <td><span class="badge badge-blue">{{ c.turma_nome || '—' }}</span></td>
              <td>{{ c._presentes }}</td>
              <td>{{ c._justificadas }}</td>
              <td>{{ c._nao_justificadas }}</td>
              <td>
                <div class="progress-cell">
                  <span>{{ c._percentual }}%</span>
                  <div class="progress-bar"><div class="progress-fill" :style="{ width: c._percentual + '%', background: getProgressColor(c._percentual) }"></div></div>
                </div>
              </td>
              <td>
                <div class="status-hoje">
                  <button v-if="!c._statusHoje" class="btn-sm btn-green" @click="registrar(c, 'presente')" title="Presente">✓</button>
                  <button v-if="!c._statusHoje" class="btn-sm btn-orange" @click="registrar(c, 'ausente_justificada')" title="Falta Justificada">📋</button>
                  <button v-if="!c._statusHoje" class="btn-sm btn-red" @click="registrar(c, 'ausente_nao_justificada')" title="Falta Não Justificada">✗</button>
                  <span v-if="c._statusHoje" class="status-badge" :class="c._statusHoje === 'presente' ? 'bg-green' : c._statusHoje === 'ausente_justificada' ? 'bg-orange' : 'bg-red'">
                    {{ c._statusHoje === 'presente' ? '✓ Presente' : c._statusHoje === 'ausente_justificada' ? '📋 Justificada' : '✗ Não Justificada' }}
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="!criancas.length" class="empty-state">
        <p>{{ turmaFiltro ? 'Nenhuma criança nesta turma.' : 'Nenhuma criança cadastrada.' }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../api'

const criancas = ref([])
const turmas = ref([])
const turmaFiltro = ref('')
const dataFiltro = ref(new Date().toISOString().split('T')[0])

const presentes = computed(() => criancas.value.filter(c => c._statusHoje === 'presente').length)
const justificadas = computed(() => criancas.value.filter(c => c._statusHoje === 'ausente_justificada').length)
const naoJustificadas = computed(() => criancas.value.filter(c => c._statusHoje === 'ausente_nao_justificada').length)

async function carregar() {
  const params = {}
  if (turmaFiltro.value) params.turma_id = turmaFiltro.value

  const [cResp, tResp, fResp] = await Promise.all([
    api.getCriancas(params).catch(() => ({ data: [] })),
    api.getTurmas().catch(() => ({ data: [] })),
    api.getFrequencias({}).catch(() => ({ data: [] })) // todas as frequencias
  ])

  turmas.value = tResp.data
  const todasFrequencias = fResp.data
  const hojeStr = dataFiltro.value

  // Build frequency maps
  const freqMapHoje = {} // { crianca_id: status }
  const countMap = {}    // { crianca_id: { presentes, justificadas, nao_justificadas } }

  todasFrequencias.forEach(f => {
    if (!countMap[f.crianca_id]) {
      countMap[f.crianca_id] = { presentes: 0, justificadas: 0, nao_justificadas: 0 }
    }
    if (f.status === 'presente') countMap[f.crianca_id].presentes++
    else if (f.status === 'ausente_justificada') countMap[f.crianca_id].justificadas++
    else if (f.status === 'ausente_nao_justificada') countMap[f.crianca_id].nao_justificadas++

    // Status de hoje
    if (f.data === hojeStr) {
      freqMapHoje[f.crianca_id] = f.status
    }
  })

  criancas.value = cResp.data.map(c => {
    const counts = countMap[c.id] || { presentes: 0, justificadas: 0, nao_justificadas: 0 }
    const total = counts.presentes + counts.justificadas + counts.nao_justificadas
    const percentual = total > 0 ? Math.round((counts.presentes / total) * 100) : 0

    return {
      ...c,
      _statusHoje: freqMapHoje[c.id] || '',
      _presentes: counts.presentes,
      _justificadas: counts.justificadas,
      _nao_justificadas: counts.nao_justificadas,
      _percentual: percentual
    }
  })
}

async function registrar(crianca, status) {
  const motivo = status === 'ausente_justificada' ? prompt('Motivo da falta justificada:') : ''
  await api.registrarFrequencia({
    crianca_id: crianca.id,
    data: dataFiltro.value,
    status,
    motivo: motivo || undefined
  }).catch(() => alert('Erro ao registrar.'))
  carregar()
}

function getProgressColor(pct) {
  if (pct >= 80) return '#22C55E'
  if (pct >= 50) return '#F59E0B'
  return '#E53935'
}

onMounted(carregar)
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
.page-title { font-size: 1.5rem; font-weight: 700; color: var(--text); }
.page-subtitle { font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px; }
.header-actions { display: flex; gap: 8px; flex-wrap: wrap; }
.filter-select, .filter-input { padding: 8px 12px; border: 1px solid #E5E7EB; border-radius: var(--radius-sm); font-size: 0.82rem; font-family: inherit; background: white; color: var(--text); outline: none; }

.kpi-strip { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
.kpi-mini { padding: 8px 16px; border-radius: var(--radius-sm); font-size: 0.82rem; font-weight: 600; }
.kpi-green { background: var(--green-light); color: var(--green); }
.kpi-orange { background: var(--orange-light); color: var(--orange); }
.kpi-red { background: var(--red-light); color: var(--red); }
.kpi-blue { background: var(--blue-light); color: var(--blue); }

.table-container { background: white; border-radius: var(--radius); box-shadow: var(--shadow); overflow: hidden; }
.table-responsive { overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; min-width: 750px; }
.data-table th { padding: 12px 14px; text-align: left; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary); border-bottom: 1px solid #E5E7EB; background: #FAFAFA; white-space: nowrap; }
.data-table td { padding: 10px 14px; font-size: 0.85rem; border-bottom: 1px solid #F3F4F6; }
.font-medium { font-weight: 600; }
.badge { padding: 3px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 500; }
.badge-blue { background: var(--blue-light); color: var(--blue); }

.progress-cell { display: flex; align-items: center; gap: 8px; white-space: nowrap; }
.progress-bar { width: 60px; height: 6px; background: #F3F4F6; border-radius: 3px; flex-shrink: 0; }
.progress-fill { height: 100%; border-radius: 3px; transition: width 0.5s ease; }

.status-hoje { display: flex; gap: 4px; flex-wrap: wrap; }
.btn-sm { padding: 5px 10px; border: 1px solid; border-radius: 6px; font-size: 0.78rem; font-weight: 500; cursor: pointer; font-family: inherit; transition: var(--transition); }
.btn-green { border-color: var(--green); color: var(--green); background: white; }
.btn-green:hover { background: var(--green); color: white; }
.btn-orange { border-color: var(--orange); color: var(--orange); background: white; }
.btn-orange:hover { background: var(--orange); color: white; }
.btn-red { border-color: var(--red); color: var(--red); background: white; }
.btn-red:hover { background: var(--red); color: white; }

.status-badge { padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; white-space: nowrap; }
.bg-green { background: var(--green); color: white; }
.bg-orange { background: var(--orange); color: white; }
.bg-red { background: var(--red); color: white; }

.empty-state { padding: 40px; text-align: center; color: var(--text-secondary); }

@media (max-width: 960px) {
  .page-title { font-size: 1.2rem; }
  .kpi-strip { gap: 8px; }
  .kpi-mini { font-size: 0.75rem; padding: 6px 12px; }
  .data-table { min-width: 600px; }
  .data-table th, .data-table td { padding: 8px 10px; font-size: 0.78rem; }
}
@media (max-width: 600px) {
  .data-table { min-width: 500px; font-size: 0.75rem; }
  .data-table th, .data-table td { padding: 6px 8px; }
  .filter-select, .filter-input { font-size: 0.75rem; padding: 6px 10px; }
}
</style>