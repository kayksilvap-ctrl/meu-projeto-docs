<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Resumo por Turma</h1>
        <p class="page-subtitle">{{ subtitulo }}</p>
      </div>
    </div>

    <div class="filters">
      <input v-model="busca" placeholder="🔍 Buscar criança..." class="filter-input search-grow" />
      <select v-model="turma" class="filter-select">
        <option value="">Todas as turmas</option>
        <option v-for="t in turmas" :key="t.id" :value="t.id">{{ t.nome }}</option>
      </select>
      <input type="month" v-model="mes" class="filter-input" title="Faltas do mês" />
      <input type="date" v-model="de" class="filter-input" title="De" />
      <input type="date" v-model="ate" class="filter-input" title="Até" />
      <button v-if="mes || de || ate" class="btn-clear" @click="limparPeriodo">Limpar período</button>
    </div>

    <div class="kpi-strip">
      <div class="kpi-mini kpi-green">{{ totalPresencas }} Presenças</div>
      <div class="kpi-mini kpi-orange">{{ totalJustificadas }} Faltas Justificadas</div>
      <div class="kpi-mini kpi-red">{{ totalNaoJustificadas }} Faltas Não Justificadas</div>
      <div class="kpi-mini kpi-dark">{{ totalFaltas }} Total de Faltas</div>
    </div>

    <div v-if="loading" class="table-container">
      <div class="empty-state">Carregando…</div>
    </div>

    <div v-else-if="!linhasFiltradas.length" class="table-container">
      <div class="empty-state">Nenhuma criança encontrada.</div>
    </div>

    <template v-else>
      <div v-for="g in grupos" :key="g.turma_nome" class="grupo">
        <div class="grupo-header">
          <span class="badge badge-blue">{{ g.turma_nome }}</span>
          <span class="grupo-count">{{ g.criancas.length }} criança(s)</span>
        </div>

        <div class="table-container">
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Criança</th>
                  <th>Presenças</th>
                  <th>Faltas Justificadas</th>
                  <th>Faltas Não Justificadas</th>
                  <th>Total Faltas</th>
                  <th>% Presença</th>
                  <th class="th-chevron"></th>
                </tr>
              </thead>
              <tbody>
                <template v-for="c in g.criancas" :key="c.id">
                  <tr class="table-row" @click="toggle(c.id)">
                    <td class="font-medium">{{ c.nome }}</td>
                    <td>{{ c.presencas }}</td>
                    <td class="orange-text">{{ c.faltas_justificadas }}</td>
                    <td class="red-text">{{ c.faltas_nao_justificadas }}</td>
                    <td class="total-faltas">{{ (c.faltas_justificadas || 0) + (c.faltas_nao_justificadas || 0) }}</td>
                    <td>{{ c.pct_presenca == null ? '—' : c.pct_presenca + '%' }}</td>
                    <td class="chevron">{{ expandedId === c.id ? '▾' : '▸' }}</td>
                  </tr>
                  <tr v-if="expandedId === c.id" class="detail-row">
                    <td :colspan="7">
                      <div class="detail-grid">
                        <div class="detail-block">
                          <h4 class="detail-title">Responsáveis</h4>
                          <div v-if="c.responsaveis && c.responsaveis.length">
                            <div v-for="(r, i) in c.responsaveis" :key="i" class="resp-item">
                              <span class="badge badge-tipo">{{ tipoLabel(r.tipo) }}</span>
                              <span class="resp-nome">{{ r.nome }}</span>
                              <span v-if="r.telefone" class="resp-contato">📞 {{ r.telefone }}</span>
                              <a v-if="r.whatsapp" class="resp-contato resp-wa" :href="waLink(r.whatsapp)"
                                target="_blank" rel="noopener" @click.stop>WhatsApp: {{ r.whatsapp }}</a>
                              <span v-if="r.email" class="resp-contato">{{ r.email }}</span>
                            </div>
                          </div>
                          <p v-else class="detail-empty">Sem responsáveis cadastrados</p>
                        </div>
                        <div class="detail-block">
                          <h4 class="detail-title">Endereço</h4>
                          <p class="detail-text">{{ enderecoFormatado(c.endereco) }}</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import api from '../api'

const turmas = ref([])
const linhas = ref([])
const turma = ref('')
const mes = ref('')
const de = ref('')
const ate = ref('')
const busca = ref('')
const loading = ref(false)
const expandedId = ref(null)

const subtitulo = computed(() => {
  if (mes.value) return `Faltas e presenças de ${fmtMes(mes.value)}`
  if (de.value && ate.value) return `Presenças e faltas de ${fmtData(de.value)} a ${fmtData(ate.value)}`
  if (de.value) return `Presenças e faltas a partir de ${fmtData(de.value)}`
  if (ate.value) return `Presenças e faltas até ${fmtData(ate.value)}`
  return 'Presenças e faltas acumuladas por criança'
})

// Busca por nome (cliente). KPIs continuam refletindo o período inteiro carregado.
const linhasFiltradas = computed(() => {
  const q = busca.value.trim().toLowerCase()
  if (!q) return linhas.value
  return linhas.value.filter(c => (c.nome || '').toLowerCase().includes(q))
})

const totalPresencas = computed(() => linhas.value.reduce((s, c) => s + (c.presencas || 0), 0))
const totalJustificadas = computed(() => linhas.value.reduce((s, c) => s + (c.faltas_justificadas || 0), 0))
const totalNaoJustificadas = computed(() => linhas.value.reduce((s, c) => s + (c.faltas_nao_justificadas || 0), 0))
const totalFaltas = computed(() => totalJustificadas.value + totalNaoJustificadas.value)

// Agrupamento por turma preservando a ordem do array (já ordenado por turma no backend)
const grupos = computed(() => linhasFiltradas.value.reduce((acc, c) => {
  const nome = c.turma_nome || 'Sem turma'
  let g = acc[acc.length - 1]
  if (!g || g.turma_nome !== nome) {
    g = { turma_nome: nome, criancas: [] }
    acc.push(g)
  }
  g.criancas.push(c)
  return acc
}, []))

function fmtData(iso) {
  return iso ? iso.split('-').reverse().join('/') : ''
}

const NOMES_MES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
function fmtMes(m) {
  const [y, mo] = m.split('-').map(Number)
  return `${NOMES_MES[mo - 1]} de ${y}`
}

function limparPeriodo() {
  mes.value = ''
  de.value = ''
  ate.value = ''
}

function tipoLabel(tipo) {
  return tipo === 'mae' ? 'Mãe' : tipo === 'pai' ? 'Pai' : 'Outro'
}

function waLink(whatsapp) {
  const d = String(whatsapp).replace(/\D/g, '')
  return 'https://wa.me/' + (d.length <= 11 ? '55' + d : d)
}

function enderecoFormatado(e) {
  if (!e) return 'Sem endereço cadastrado'
  const seg1 = [e.rua, e.numero].filter(Boolean).join(', ') + (e.complemento ? ' ' + e.complemento : '')
  const cidadeUf = [e.cidade, e.estado].filter(Boolean).join('/')
  const seg2 = [e.bairro, cidadeUf].filter(Boolean).join(', ')
  const seg3 = e.cep ? 'CEP ' + e.cep : ''
  const texto = [seg1, seg2, seg3].filter(s => s && s.trim()).join(' - ')
  return texto || 'Sem endereço cadastrado'
}

function toggle(id) {
  expandedId.value = expandedId.value === id ? null : id
}

async function carregar() {
  loading.value = true
  expandedId.value = null
  try {
    const resp = await api.getResumoFrequencia({
      turma_id: turma.value || undefined,
      de: de.value || undefined,
      ate: ate.value || undefined
    })
    linhas.value = resp.data
  } catch {
    linhas.value = []
  } finally {
    loading.value = false
  }
}

// Escolher o mês preenche de/ate com o 1º e o último dia — o watch abaixo recarrega uma vez só.
watch(mes, (m) => {
  if (!m) return
  const [y, mo] = m.split('-').map(Number)
  const ultimoDia = new Date(y, mo, 0).getDate()
  de.value = `${m}-01`
  ate.value = `${m}-${String(ultimoDia).padStart(2, '0')}`
})

watch([turma, de, ate], carregar)

onMounted(async () => {
  turmas.value = (await api.getTurmas().catch(() => ({ data: [] }))).data
  await carregar()
})
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
.page-title { font-size: 1.5rem; font-weight: 700; color: var(--text); }
.page-subtitle { font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px; }

.filters { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; align-items: center; }
.filter-select, .filter-input { padding: 8px 12px; border: 1px solid #E5E7EB; border-radius: var(--radius-sm); font-size: 0.82rem; font-family: inherit; background: white; color: var(--text); outline: none; }
.filter-select:focus, .filter-input:focus { border-color: var(--red); box-shadow: 0 0 0 3px rgba(229,57,53,0.08); }
.search-grow { flex: 1; min-width: 180px; }
.btn-clear { padding: 8px 14px; border: 1px solid #E5E7EB; border-radius: var(--radius-sm); background: white; color: var(--text-secondary); font-size: 0.82rem; font-family: inherit; cursor: pointer; transition: var(--transition); }
.btn-clear:hover { background: #F3F4F6; }

.kpi-strip { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
.kpi-mini { padding: 8px 16px; border-radius: var(--radius-sm); font-size: 0.82rem; font-weight: 600; }
.kpi-green { background: var(--green-light); color: var(--green); }
.kpi-orange { background: var(--orange-light); color: var(--orange); }
.kpi-red { background: var(--red-light); color: var(--red); }
.kpi-dark { background: #EEF2F7; color: #374151; }
.total-faltas { font-weight: 700; color: var(--text); }

.grupo { margin-bottom: 24px; }
.grupo-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.grupo-count { font-size: 0.8rem; color: var(--text-secondary); }

.table-container { background: white; border-radius: var(--radius); box-shadow: var(--shadow); overflow: hidden; }
.table-responsive { overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; min-width: 650px; }
.data-table th { padding: 12px 14px; text-align: left; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary); border-bottom: 1px solid #E5E7EB; background: #FAFAFA; white-space: nowrap; }
.data-table td { padding: 10px 14px; font-size: 0.85rem; border-bottom: 1px solid #F3F4F6; }
.th-chevron { width: 32px; }
.table-row { cursor: pointer; transition: var(--transition); }
.table-row:hover { background: #FAFAFA; }
.font-medium { font-weight: 600; }
.orange-text { color: var(--orange); font-weight: 600; }
.red-text { color: var(--red); font-weight: 600; }
.chevron { color: var(--text-secondary); font-size: 0.8rem; text-align: center; }

.badge { padding: 3px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 500; white-space: nowrap; }
.badge-blue { background: var(--blue-light); color: var(--blue); }
.badge-tipo { background: var(--blue-light); color: var(--blue); font-size: 0.7rem; padding: 2px 8px; flex-shrink: 0; }

.detail-row td { background: #F9FAFB; padding: 16px 14px; }
.detail-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 20px; }
.detail-block { min-width: 0; }
.detail-title { font-size: 0.78rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary); margin-bottom: 8px; }
.resp-item { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; padding: 4px 0; font-size: 0.85rem; }
.resp-nome { font-weight: 600; color: var(--text); }
.resp-contato { color: var(--text-secondary); white-space: nowrap; }
.resp-wa { color: var(--green); text-decoration: none; font-weight: 500; }
.resp-wa:hover { text-decoration: underline; }
.detail-text { font-size: 0.85rem; color: var(--text); }
.detail-empty { font-size: 0.85rem; color: var(--text-secondary); font-style: italic; }

.empty-state { padding: 40px; text-align: center; color: var(--text-secondary); }

@media (max-width: 960px) {
  .page-title { font-size: 1.2rem; }
  .kpi-strip { gap: 8px; }
  .kpi-mini { font-size: 0.75rem; padding: 6px 12px; }
  .data-table { min-width: 600px; }
  .data-table th, .data-table td { padding: 8px 10px; font-size: 0.78rem; }
  .detail-grid { grid-template-columns: 1fr; gap: 14px; }
}
@media (max-width: 600px) {
  .filters { flex-direction: column; }
  .filter-select, .filter-input { font-size: 0.75rem; padding: 6px 10px; }
  .data-table { min-width: 520px; font-size: 0.75rem; }
  .data-table th, .data-table td { padding: 6px 8px; }
}
</style>
