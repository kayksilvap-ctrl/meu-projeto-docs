<template>
  <div>
    <div class="page-header">
      <div>
        <button class="btn-back" @click="$router.push('/turmas')">← Voltar</button>
        <h1 class="page-title">{{ turma.nome || 'Carregando...' }}</h1>
        <p class="page-subtitle">{{ turma.professor || 'Sem professor' }} · {{ criancas.length }} criança(s)</p>
      </div>
    </div>

    <div class="kpi-strip">
      <div class="kpi-card kpi-blue"><div class="kpi-number">{{ criancas.length }}</div><div class="kpi-label">Crianças</div></div>
      <div class="kpi-card kpi-green"><div class="kpi-number">{{ presentesHoje }}</div><div class="kpi-label">Presentes Hoje</div></div>
      <div class="kpi-card kpi-orange"><div class="kpi-number">{{ justificadasHoje }}</div><div class="kpi-label">Justificadas Hoje</div></div>
      <div class="kpi-card kpi-red"><div class="kpi-number">{{ naoJustificadasHoje }}</div><div class="kpi-label">Não Justificadas Hoje</div></div>
    </div>

    <div class="section">
      <h2 class="section-title">📋 Chamadas Recentes</h2>
      <div class="table-container">
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr><th>Data</th><th>Presentes</th><th>Justificadas</th><th>Não Justificadas</th><th>Taxa</th><th>Ação</th></tr>
            </thead>
            <tbody>
              <tr v-for="d in diasChamada" :key="d.data" class="row-clickable" @click="abrirDia(d.data)">
                <td class="font-medium">{{ formatarData(d.data) }}</td>
                <td><span class="badge badge-green">{{ d.presentes }}</span></td>
                <td><span class="badge badge-orange">{{ d.ausentes_justificadas }}</span></td>
                <td><span class="badge badge-red">{{ d.ausentes_nao_justificadas }}</span></td>
                <td>
                  <div class="progress-cell">
                    <span>{{ d.taxa }}%</span>
                    <div class="progress-bar"><div class="progress-fill" :style="{ width: d.taxa + '%', background: getProgressColor(d.taxa) }"></div></div>
                  </div>
                </td>
                <td><button class="btn-ver" @click.stop="abrirDia(d.data)">👁️ Ver</button></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="!diasChamada.length" class="empty-state"><p>Nenhuma chamada registrada.</p></div>
      </div>
    </div>

    <div v-if="diaSelecionado" class="modal-overlay" @click.self="fecharDia">
      <div class="modal-content modal-lg">
        <div class="modal-header">
          <div>
            <h2 class="modal-title">📅 {{ formatarData(diaSelecionado) }}</h2>
            <p class="modal-subtitle">{{ turma.nome }} · {{ criancasDia.length }} criança(s)</p>
          </div>
          <button class="btn-close" @click="fecharDia">✕</button>
        </div>
        <div class="dia-kpis">
          <div class="dia-kpi dia-kpi-green">✅ {{ presentesDia.length }} Presentes</div>
          <div class="dia-kpi dia-kpi-orange">📋 {{ justificadasDia.length }} Justificadas</div>
          <div class="dia-kpi dia-kpi-red">❌ {{ naoJustificadasDia.length }} Não Justificadas</div>
        </div>
        <div class="dia-lista">
          <div v-for="c in criancasDia" :key="c.id" class="dia-item" :class="c._status === 'presente' ? 'dia-presente' : c._status === 'ausente_justificada' ? 'dia-justificada' : 'dia-ausente'">
            <div class="dia-item-avatar" :class="c.sexo === 'F' ? 'avatar-f' : 'avatar-m'">{{ c.nome.charAt(0) }}</div>
            <div class="dia-item-info">
              <div class="dia-item-nome">{{ c.nome }}</div>
              <div class="dia-item-status">
                <span v-if="c._status === 'presente'" class="status-badge bg-green">✓ Presente</span>
                <span v-else-if="c._status === 'ausente_justificada'" class="status-badge bg-orange">📋 Justificada</span>
                <span v-else-if="c._status === 'ausente_nao_justificada'" class="status-badge bg-red">✗ Não Justificada</span>
                <span v-else class="status-badge bg-gray">Sem registro</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">👶 Crianças da Turma</h2>
      <div class="criancas-grid">
        <div v-for="c in criancas" :key="c.id" class="crianca-card">
          <div class="crianca-avatar" :class="c.sexo === 'F' ? 'avatar-f' : 'avatar-m'">{{ c.nome.charAt(0) }}</div>
          <div class="crianca-info">
            <div class="crianca-nome">{{ c.nome }}</div>
            <div class="crianca-detalhe">{{ turma.nome }}</div>
          </div>
          <div class="crianca-status">
            <span v-if="c._statusHoje" class="status-badge" :class="c._statusHoje === 'presente' ? 'bg-green' : c._statusHoje === 'ausente_justificada' ? 'bg-orange' : 'bg-red'">
              {{ c._statusHoje === 'presente' ? '✓ Presente' : c._statusHoje === 'ausente_justificada' ? '📋 Justificada' : '✗ Não Justificada' }}
            </span>
            <span v-else class="status-badge bg-gray">Sem registro</span>
          </div>
        </div>
      </div>
      <div v-if="!criancas.length" class="empty-state"><p>Nenhuma criança nesta turma.</p></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '../api'

const route = useRoute()
const turmaId = route.params.id
const turma = ref({})
const criancas = ref([])
const frequencias = ref([])
const diaSelecionado = ref(null)

const presentesHoje = computed(() => {
  const hoje = new Date().toISOString().split('T')[0]
  return frequencias.value.filter(f => f.data === hoje && f.status === 'presente').length
})
const justificadasHoje = computed(() => {
  const hoje = new Date().toISOString().split('T')[0]
  return frequencias.value.filter(f => f.data === hoje && f.status === 'ausente_justificada').length
})
const naoJustificadasHoje = computed(() => {
  const hoje = new Date().toISOString().split('T')[0]
  return frequencias.value.filter(f => f.data === hoje && f.status === 'ausente_nao_justificada').length
})

const diasChamada = computed(() => {
  const map = {}
  frequencias.value.forEach(f => {
    if (!map[f.data]) map[f.data] = { data: f.data, presentes: 0, ausentes_justificadas: 0, ausentes_nao_justificadas: 0 }
    if (f.status === 'presente') map[f.data].presentes++
    else if (f.status === 'ausente_justificada') map[f.data].ausentes_justificadas++
    else if (f.status === 'ausente_nao_justificada') map[f.data].ausentes_nao_justificadas++
  })
  return Object.values(map).map(d => {
    const total = d.presentes + d.ausentes_justificadas + d.ausentes_nao_justificadas
    d.taxa = total > 0 ? Math.round((d.presentes / total) * 100) : 0
    return d
  }).sort((a, b) => b.data.localeCompare(a.data))
})

const criancasDia = computed(() => {
  if (!diaSelecionado.value) return []
  const freqMap = {}
  frequencias.value.forEach(f => {
    if (f.data === diaSelecionado.value) freqMap[f.crianca_id] = f.status
  })
  return criancas.value.map(c => ({ ...c, _status: freqMap[c.id] || '' }))
})

const presentesDia = computed(() => criancasDia.value.filter(c => c._status === 'presente'))
const justificadasDia = computed(() => criancasDia.value.filter(c => c._status === 'ausente_justificada'))
const naoJustificadasDia = computed(() => criancasDia.value.filter(c => c._status === 'ausente_nao_justificada'))

function abrirDia(data) { diaSelecionado.value = data }
function fecharDia() { diaSelecionado.value = null }

function formatarData(data) {
  const [y, m, d] = data.split('-')
  return `${d}/${m}/${y}`
}

function getProgressColor(pct) {
  if (pct >= 80) return '#22C55E'
  if (pct >= 50) return '#F59E0B'
  return '#E53935'
}

async function carregar() {
  const [tResp, cResp, fResp] = await Promise.all([
    api.getTurmas().catch(() => ({ data: [] })),
    api.getCriancas({ turma_id: turmaId }).catch(() => ({ data: [] })),
    api.getFrequencias({ turma_id: turmaId }).catch(() => ({ data: [] }))
  ])
  turma.value = tResp.data.find(t => t.id == turmaId) || {}
  criancas.value = cResp.data
  frequencias.value = fResp.data
  const hoje = new Date().toISOString().split('T')[0]
  const freqMap = {}
  frequencias.value.forEach(f => { if (f.data === hoje) freqMap[f.crianca_id] = f.status })
  criancas.value = criancas.value.map(c => ({ ...c, _statusHoje: freqMap[c.id] || '' }))
}

onMounted(carregar)
</script>

<style scoped>
.page-header { margin-bottom: 24px; }
.btn-back { display: inline-block; padding: 6px 14px; background: #F3F4F6; border: 1px solid #E5E7EB; border-radius: var(--radius-sm); font-size: 0.82rem; font-weight: 500; cursor: pointer; font-family: inherit; margin-bottom: 12px; color: var(--text-secondary); transition: var(--transition); }
.btn-back:hover { background: #E5E7EB; color: var(--text); }
.page-title { font-size: 1.5rem; font-weight: 700; color: var(--text); }
.page-subtitle { font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px; }
.kpi-strip { display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }
.kpi-card { flex: 1; min-width: 120px; padding: 16px 20px; border-radius: var(--radius); background: white; box-shadow: var(--shadow); text-align: center; }
.kpi-number { font-size: 1.8rem; font-weight: 700; }
.kpi-label { font-size: 0.75rem; font-weight: 500; margin-top: 4px; }
.kpi-blue .kpi-number { color: var(--blue); }
.kpi-green .kpi-number { color: var(--green); }
.kpi-orange .kpi-number { color: var(--orange); }
.kpi-red .kpi-number { color: var(--red); }
.section { margin-bottom: 28px; }
.section-title { font-size: 1.1rem; font-weight: 700; color: var(--text); margin-bottom: 14px; }
.table-container { background: white; border-radius: var(--radius); box-shadow: var(--shadow); overflow: hidden; }
.table-responsive { overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; min-width: 550px; }
.data-table th { padding: 12px 14px; text-align: left; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary); border-bottom: 1px solid #E5E7EB; background: #FAFAFA; white-space: nowrap; }
.data-table td { padding: 10px 14px; font-size: 0.85rem; border-bottom: 1px solid #F3F4F6; }
.font-medium { font-weight: 600; }
.row-clickable { cursor: pointer; transition: background 0.15s; }
.row-clickable:hover { background: #F9FAFB; }
.badge { padding: 3px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 500; }
.badge-green { background: var(--green-light); color: var(--green); }
.badge-orange { background: var(--orange-light); color: var(--orange); }
.badge-red { background: var(--red-light); color: var(--red); }
.progress-cell { display: flex; align-items: center; gap: 8px; white-space: nowrap; }
.progress-bar { width: 60px; height: 6px; background: #F3F4F6; border-radius: 3px; flex-shrink: 0; }
.progress-fill { height: 100%; border-radius: 3px; transition: width 0.5s ease; }
.btn-ver { padding: 5px 12px; background: var(--blue-light); color: var(--blue); border: 1px solid var(--blue); border-radius: 6px; font-size: 0.78rem; font-weight: 500; cursor: pointer; font-family: inherit; transition: var(--transition); }
.btn-ver:hover { background: var(--blue); color: white; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 200; }
.modal-content { background: white; border-radius: var(--radius); padding: 32px; width: 90%; max-width: 650px; max-height: 85vh; overflow-y: auto; }
.modal-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
.modal-title { font-size: 1.2rem; font-weight: 700; }
.modal-subtitle { font-size: 0.82rem; color: var(--text-secondary); margin-top: 4px; }
.btn-close { background: none; border: none; font-size: 1.2rem; cursor: pointer; color: var(--text-secondary); padding: 4px 8px; }
.dia-kpis { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
.dia-kpi { padding: 8px 16px; border-radius: var(--radius-sm); font-size: 0.82rem; font-weight: 600; }
.dia-kpi-green { background: var(--green-light); color: var(--green); }
.dia-kpi-orange { background: var(--orange-light); color: var(--orange); }
.dia-kpi-red { background: var(--red-light); color: var(--red); }
.dia-lista { display: flex; flex-direction: column; gap: 8px; }
.dia-item { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: var(--radius-sm); transition: var(--transition); }
.dia-presente { background: #F0FDF4; border-left: 3px solid var(--green); }
.dia-justificada { background: #FFF8E1; border-left: 3px solid var(--orange); }
.dia-ausente { background: #FEF2F2; border-left: 3px solid var(--red); }
.dia-item-avatar { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; font-weight: 700; color: white; flex-shrink: 0; }
.avatar-m { background: var(--blue); }
.avatar-f { background: var(--red); }
.dia-item-info { flex: 1; min-width: 0; }
.dia-item-nome { font-size: 0.88rem; font-weight: 600; color: var(--text); }
.dia-item-status { margin-top: 2px; }
.status-badge { padding: 4px 10px; border-radius: 20px; font-size: 0.72rem; font-weight: 600; white-space: nowrap; }
.bg-green { background: var(--green); color: white; }
.bg-orange { background: var(--orange); color: white; }
.bg-red { background: var(--red); color: white; }
.bg-gray { background: #F3F4F6; color: var(--text-secondary); }
.criancas-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; }
.crianca-card { display: flex; align-items: center; gap: 12px; padding: 14px 16px; background: white; border-radius: var(--radius); box-shadow: var(--shadow); transition: var(--transition); }
.crianca-card:hover { box-shadow: var(--shadow-md); }
.crianca-avatar { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1rem; font-weight: 700; color: white; flex-shrink: 0; }
.crianca-info { flex: 1; min-width: 0; }
.crianca-nome { font-size: 0.88rem; font-weight: 600; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.crianca-detalhe { font-size: 0.72rem; color: var(--text-secondary); }
.crianca-status { flex-shrink: 0; }
.empty-state { padding: 40px; text-align: center; color: var(--text-secondary); background: white; border-radius: var(--radius); box-shadow: var(--shadow); }
@media (max-width: 960px) { .kpi-card { min-width: 100px; padding: 12px 14px; } .kpi-number { font-size: 1.4rem; } .criancas-grid { grid-template-columns: 1fr; } }
</style>