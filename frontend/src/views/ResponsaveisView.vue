<template>
  <div class="responsaveis-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Responsáveis</h1>
        <p class="page-subtitle">Informações dos responsáveis por criança</p>
      </div>
      <div class="header-actions">
        <select v-model="turmaFiltro" class="filter-select" @change="carregar">
          <option value="">Todas as turmas</option>
          <option v-for="t in turmas" :key="t.id" :value="t.id">{{ t.nome }}</option>
        </select>
        <input v-model="busca" placeholder="Buscar por nome..." class="search-input" />
      </div>
    </div>

    <div class="cards-grid">
      <div v-for="item in filtrados" :key="item.id" class="responsavel-card">
        <div class="card-header">
          <div class="crianca-avatar">{{ item.nome?.charAt(0) }}</div>
          <div class="crianca-info">
            <div class="crianca-nome">{{ item.nome }}</div>
            <div class="crianca-turma">{{ item.turma_nome || 'Sem turma' }}</div>
          </div>
        </div>

        <div class="card-body">
          <div v-for="(r, i) in item.responsaveis" :key="i" class="responsavel-item">
            <div class="responsavel-tipo">
              <span v-if="r.tipo === 'mae'" class="tipo-badge tipo-mae">👩 Mãe</span>
              <span v-else-if="r.tipo === 'pai'" class="tipo-badge tipo-pai">👨 Pai</span>
              <span v-else class="tipo-badge tipo-outro">👤 Outro</span>
            </div>
            <div class="responsavel-dados">
              <div class="responsavel-nome">{{ r.nome }}</div>
              <div class="responsavel-contatos">
                <span v-if="r.telefone" class="contato">📞 {{ r.telefone }}</span>
                <span v-if="r.whatsapp" class="contato">💬 {{ r.whatsapp }}</span>
                <span v-if="r.email" class="contato">✉️ {{ r.email }}</span>
              </div>
            </div>
          </div>
          <div v-if="!item.responsaveis?.length" class="sem-responsavel">
            Nenhum responsável cadastrado para esta criança.
          </div>
        </div>

        <div v-if="item.endereco" class="card-footer">
          <span class="endereco-text">
            📍 {{ item.endereco.rua || '' }}, {{ item.endereco.numero || 'S/N' }}
            <template v-if="item.endereco.bairro"> - {{ item.endereco.bairro }}</template>
            <template v-if="item.endereco.cidade"> - {{ item.endereco.cidade }}/{{ item.endereco.estado || '' }}</template>
          </span>
        </div>
      </div>
    </div>

    <div v-if="!filtrados.length" class="empty-state">
      <p>Nenhum responsável encontrado.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../api'

const turmas = ref([])
const dados = ref([])
const turmaFiltro = ref('')
const busca = ref('')

const filtrados = computed(() => {
  let list = dados.value
  if (turmaFiltro.value) list = list.filter(item => item.turma_id == turmaFiltro.value)
  if (busca.value) {
    const t = busca.value.trim().toLowerCase()
    list = list.filter(item =>
      (item.nome || '').toLowerCase().includes(t) ||
      (item.responsaveis || []).some(r => r.nome?.toLowerCase().includes(t))
    )
  }
  return list
})

async function carregar() {
  try {
    const params = {}
    if (turmaFiltro.value) params.turma_id = turmaFiltro.value
    const [resp, turmasResp] = await Promise.all([
      api.getResumoFrequencia(params).catch(() => ({ data: [] })),
      api.getTurmas().catch(() => ({ data: [] }))
    ])
    turmas.value = turmasResp.data
    dados.value = resp.data || []
  } catch {}
}

onMounted(carregar)
</script>

<style scoped>
.responsaveis-page { max-width: 1200px; margin: 0 auto; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
.page-title { font-size: 1.5rem; font-weight: 700; color: var(--text); }
.page-subtitle { font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px; }
.header-actions { display: flex; gap: 10px; flex-wrap: wrap; }
.filter-select, .search-input {
  padding: 9px 14px; border: 1px solid #E5E7EB; border-radius: var(--radius-sm);
  font-size: 0.85rem; font-family: inherit; background: white; color: var(--text); outline: none;
  transition: border-color 0.2s;
}
.filter-select:focus, .search-input:focus { border-color: var(--red); box-shadow: 0 0 0 3px rgba(229,57,53,0.08); }
.search-input { min-width: 220px; }

.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
@media (max-width: 768px) { .stats-row { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 480px) { .stats-row { grid-template-columns: 1fr; } }
.stat-card {
  background: white; border-radius: var(--radius); padding: 16px; box-shadow: var(--shadow);
  display: flex; flex-direction: column; align-items: center; text-align: center;
}
.stat-num { font-size: 1.6rem; font-weight: 700; color: var(--red); }
.stat-label { font-size: 0.78rem; color: var(--text-secondary); margin-top: 4px; font-weight: 500; }

.cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 16px; }
@media (max-width: 600px) { .cards-grid { grid-template-columns: 1fr; } }

.responsavel-card {
  background: white; border-radius: var(--radius); box-shadow: var(--shadow);
  overflow: hidden; transition: box-shadow 0.2s, transform 0.2s;
}
.responsavel-card:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); }

.card-header {
  display: flex; align-items: center; gap: 12px;
  padding: 16px 20px; background: #FAFAFA; border-bottom: 1px solid #F3F4F6;
}
.crianca-avatar {
  width: 42px; height: 42px; border-radius: 10px;
  background: linear-gradient(135deg, #E53935, #C62828);
  color: white; display: flex; align-items: center; justify-content: center;
  font-size: 1.1rem; font-weight: 700; flex-shrink: 0;
}
.crianca-info { flex: 1; min-width: 0; }
.crianca-nome { font-size: 0.95rem; font-weight: 600; color: var(--text); }
.crianca-turma { font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px; }

.card-body { padding: 12px 20px; }
.responsavel-item {
  display: flex; gap: 12px; padding: 10px 0; border-bottom: 1px solid #F9FAFB;
}
.responsavel-item:last-of-type { border-bottom: none; }
.responsavel-tipo { flex-shrink: 0; }
.tipo-badge { font-size: 0.72rem; font-weight: 600; padding: 2px 8px; border-radius: 20px; white-space: nowrap; }
.tipo-mae { background: #FCE4EC; color: #C62828; }
.tipo-pai { background: #E3F2FD; color: #1565C0; }
.tipo-outro { background: #F3F4F6; color: #6B7280; }
.responsavel-dados { flex: 1; min-width: 0; }
.responsavel-nome { font-size: 0.88rem; font-weight: 500; color: var(--text); }
.responsavel-contatos { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 4px; }
.contato { font-size: 0.75rem; color: var(--text-secondary); }
.sem-responsavel { font-size: 0.82rem; color: var(--text-secondary); font-style: italic; padding: 8px 0; }

.card-footer {
  padding: 10px 20px; border-top: 1px solid #F3F4F6; background: #FAFAFA;
}
.endereco-text { font-size: 0.75rem; color: var(--text-secondary); }

.empty-state { padding: 40px; text-align: center; color: var(--text-secondary); font-size: 0.9rem; background: white; border-radius: var(--radius); box-shadow: var(--shadow); }
</style>