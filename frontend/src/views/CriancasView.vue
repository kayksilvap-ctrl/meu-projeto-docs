<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Crianças</h1>
        <p class="page-subtitle">{{ criancas.length }} criança(s) cadastrada(s)</p>
      </div>
      <button class="btn-primary" @click="showForm = true">+ Nova Criança</button>
    </div>

    <div class="filters">
      <input v-model="filtro" placeholder="🔍 Buscar por nome..." class="search-input" />
      <select v-model="turmaFiltro" class="filter-select" @change="carregar">
        <option value="">Todas as turmas</option>
        <option v-for="t in turmas" :key="t.id" :value="t.id">{{ t.nome }}</option>
      </select>
    </div>

    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Turma</th>
            <th>Idade</th>
            <th>Sexo</th>
            <th>Responsável</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in filtradas" :key="c.id" class="table-row" @click="abrirDetalhes(c)">
            <td class="font-medium">{{ c.nome }}</td>
            <td><span class="badge badge-blue">{{ c.turma_nome || '—' }}</span></td>
            <td>{{ c.data_nascimento ? calcularIdade(c.data_nascimento) + ' anos' : '—' }}</td>
            <td>{{ c.sexo === 'M' ? '👨 Menino' : c.sexo === 'F' ? '👧 Menina' : '—' }}</td>
            <td class="text-secondary">{{ c.responsavel_nome || '—' }}</td>
            <td @click.stop>
              <button class="btn-icon" @click="editarCrianca(c)">✏️</button>
              <button class="btn-icon btn-danger" @click="excluirCrianca(c)">🗑️</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="!filtradas.length" class="empty-state">Nenhuma criança encontrada.</div>
    </div>

    <!-- Form Modal -->
    <div v-if="showForm" class="modal-overlay" @click.self="fecharForm">
      <div class="modal-content">
        <h2 class="modal-title">{{ editando ? 'Editar Criança' : 'Nova Criança' }}</h2>
        <form @submit.prevent="salvar">
          <div class="form-grid">
            <div class="form-group">
              <label>Nome Completo *</label>
              <input v-model="form.nome" required placeholder="Nome completo" />
            </div>
            <div class="form-group">
              <label>Data de Nascimento</label>
              <input v-model="form.data_nascimento" type="date" />
            </div>
            <div class="form-group">
              <label>Sexo</label>
              <select v-model="form.sexo">
                <option value="">Selecione</option>
                <option value="M">Menino</option>
                <option value="F">Menina</option>
              </select>
            </div>
            <div class="form-group">
              <label>Turma</label>
              <select v-model="form.turma_id">
                <option value="">Sem turma</option>
                <option v-for="t in turmas" :key="t.id" :value="t.id">{{ t.nome }}</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>Observações</label>
            <textarea v-model="form.observacoes" rows="3" placeholder="Observações..."></textarea>
          </div>

          <h3 class="section-label">Responsáveis</h3>
          <div v-for="(r, i) in form.responsaveis" :key="i" class="responsavel-form">
            <div class="form-grid">
              <div class="form-group">
                <label>Tipo</label>
                <select v-model="r.tipo">
                  <option value="mae">Mãe</option>
                  <option value="pai">Pai</option>
                  <option value="outro">Outro</option>
                </select>
              </div>
              <div class="form-group">
                <label>Nome</label>
                <input v-model="r.nome" placeholder="Nome do responsável" />
              </div>
              <div class="form-group">
                <label>Telefone</label>
                <input v-model="r.telefone" placeholder="(00) 00000-0000" />
              </div>
              <div class="form-group">
                <label>WhatsApp</label>
                <input v-model="r.whatsapp" placeholder="(00) 00000-0000" />
              </div>
            </div>
          </div>
          <button type="button" class="btn-text" @click="form.responsaveis.push({ tipo: 'mae', nome: '', telefone: '', whatsapp: '' })">
            + Adicionar responsável
          </button>

          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="fecharForm">Cancelar</button>
            <button type="submit" class="btn-primary" :disabled="loading">
              {{ loading ? 'Salvando...' : (editando ? 'Salvar' : 'Cadastrar') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Details Drawer -->
    <div v-if="selectedCrianca" class="drawer-overlay" @click.self="selectedCrianca = null">
      <div class="drawer">
        <div class="drawer-header">
          <div class="drawer-avatar">{{ selectedCrianca.nome?.charAt(0) }}</div>
          <div>
            <h2 class="drawer-name">{{ selectedCrianca.nome }}</h2>
            <p class="drawer-subtitle">{{ selectedCrianca.turma_nome || 'Sem turma' }}</p>
          </div>
          <button class="btn-close" @click="selectedCrianca = null">✕</button>
        </div>
        <div class="drawer-body">
          <div class="detail-row"><span class="detail-label">Data de Nascimento</span><span>{{ selectedCrianca.data_nascimento || '—' }}</span></div>
          <div class="detail-row"><span class="detail-label">Sexo</span><span>{{ selectedCrianca.sexo === 'M' ? 'Menino' : selectedCrianca.sexo === 'F' ? 'Menina' : '—' }}</span></div>
          <div v-for="(r, i) in selectedCrianca.responsaveis || []" :key="i" class="detail-section">
            <div class="detail-row"><span class="detail-label">{{ r.tipo === 'mae' ? 'Mãe' : r.tipo === 'pai' ? 'Pai' : 'Responsável' }}</span><span>{{ r.nome }}</span></div>
            <div v-if="r.telefone" class="detail-row"><span class="detail-label">Telefone</span><span>{{ r.telefone }}</span></div>
            <div v-if="r.whatsapp" class="detail-row"><span class="detail-label">WhatsApp</span><span>{{ r.whatsapp }}</span></div>
          </div>
          <div v-if="selectedCrianca.observacoes" class="detail-section">
            <span class="detail-label">Observações</span>
            <p class="detail-text">{{ selectedCrianca.observacoes }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../api'

const criancas = ref([])
const turmas = ref([])
const filtro = ref('')
const turmaFiltro = ref('')
const showForm = ref(false)
const editando = ref(false)
const editId = ref(null)
const loading = ref(false)
const selectedCrianca = ref(null)
const form = ref({ nome: '', data_nascimento: '', sexo: '', turma_id: '', observacoes: '', responsaveis: [] })

const filtradas = computed(() => {
  let list = criancas.value
  if (turmaFiltro.value) list = list.filter(c => c.turma_id == turmaFiltro.value)
  if (filtro.value) {
    const t = filtro.value.toLowerCase()
    list = list.filter(c => c.nome.toLowerCase().includes(t))
  }
  return list
})

function calcularIdade(data) {
  const nasc = new Date(data)
  const hoje = new Date()
  let idade = hoje.getFullYear() - nasc.getFullYear()
  const m = hoje.getMonth() - nasc.getMonth()
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--
  return idade
}

async function carregar() {
  const params = turmaFiltro.value ? { turma_id: turmaFiltro.value } : {}
  const [c, t] = await Promise.all([
    api.getCriancas(params).catch(() => ({ data: [] })),
    api.getTurmas().catch(() => ({ data: [] }))
  ])
  criancas.value = c.data
  turmas.value = t.data
}

function editarCrianca(c) {
  form.value = { nome: c.nome, data_nascimento: c.data_nascimento || '', sexo: c.sexo || '', turma_id: c.turma_id || '', observacoes: c.observacoes || '', responsaveis: [] }
  editId.value = c.id
  editando.value = true
  showForm.value = true
}

function fecharForm() { showForm.value = false; editando.value = false; editId.value = null; form.value = { nome: '', data_nascimento: '', sexo: '', turma_id: '', observacoes: '', responsaveis: [] } }

async function salvar() {
  loading.value = true
  try {
    if (editando.value) await api.updateCrianca(editId.value, form.value)
    else await api.createCrianca(form.value)
    fecharForm(); carregar()
  } catch { alert('Erro ao salvar.') }
  finally { loading.value = false }
}

async function excluirCrianca(c) {
  if (!confirm(`Remover ${c.nome}?`)) return
  await api.deleteCrianca(c.id).catch(() => alert('Erro.'))
  carregar()
}

function abrirDetalhes(c) { selectedCrianca.value = c }

onMounted(carregar)
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
.page-title { font-size: 1.5rem; font-weight: 700; color: var(--text); }
.page-subtitle { font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px; }
.btn-primary { padding: 10px 20px; background: var(--red); color: white; border: none; border-radius: var(--radius-sm); font-weight: 600; font-size: 0.85rem; cursor: pointer; font-family: inherit; transition: var(--transition); }
.btn-primary:hover { background: var(--red-dark); }
.btn-secondary { padding: 10px 20px; background: #F3F4F6; color: var(--text); border: 1px solid #E5E7EB; border-radius: var(--radius-sm); font-weight: 500; font-size: 0.85rem; cursor: pointer; font-family: inherit; }
.btn-text { background: none; border: none; color: var(--blue); cursor: pointer; font-size: 0.85rem; font-weight: 500; padding: 8px 0; font-family: inherit; }
.btn-icon { background: none; border: none; cursor: pointer; padding: 6px; border-radius: 6px; transition: var(--transition); font-size: 1rem; }
.btn-icon:hover { background: #F3F4F6; }
.btn-danger:hover { background: var(--red-light); }
.btn-close { background: none; border: none; font-size: 1.2rem; cursor: pointer; padding: 4px 8px; color: var(--text-secondary); }

.filters { display: flex; gap: 12px; margin-bottom: 20px; }
.search-input, .filter-select { padding: 10px 14px; border: 1px solid #E5E7EB; border-radius: var(--radius-sm); font-size: 0.85rem; font-family: inherit; background: white; outline: none; }
.search-input { flex: 1; max-width: 400px; }
.search-input:focus { border-color: var(--red); box-shadow: 0 0 0 3px rgba(229,57,53,0.08); }

.table-container { background: white; border-radius: var(--radius); box-shadow: var(--shadow); overflow: hidden; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { padding: 12px 16px; text-align: left; font-size: 0.78rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary); border-bottom: 1px solid #E5E7EB; background: #FAFAFA; }
.data-table td { padding: 12px 16px; font-size: 0.85rem; border-bottom: 1px solid #F3F4F6; }
.table-row { cursor: pointer; transition: var(--transition); }
.table-row:hover { background: #FAFAFA; }
.font-medium { font-weight: 600; }
.text-secondary { color: var(--text-secondary); }
.badge { padding: 3px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 500; }
.badge-blue { background: var(--blue-light); color: var(--blue); }
.empty-state { padding: 40px; text-align: center; color: var(--text-secondary); }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 200; }
.modal-content { background: white; border-radius: var(--radius); padding: 32px; width: 90%; max-width: 650px; max-height: 90vh; overflow-y: auto; }
.modal-title { font-size: 1.2rem; font-weight: 700; margin-bottom: 24px; color: var(--text); }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
@media (max-width: 600px) { .form-grid { grid-template-columns: 1fr; } }
.form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
.form-group label { font-size: 0.82rem; font-weight: 500; color: var(--text-secondary); }
.form-group input, .form-group select, .form-group textarea { padding: 10px 14px; border: 1px solid #E5E7EB; border-radius: var(--radius-sm); font-size: 0.88rem; font-family: inherit; outline: none; transition: var(--transition); }
.form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: var(--red); box-shadow: 0 0 0 3px rgba(229,57,53,0.08); }
.form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; padding-top: 16px; border-top: 1px solid #E5E7EB; }
.section-label { font-size: 0.85rem; font-weight: 600; color: var(--text); margin: 20px 0 12px; }
.responsavel-form { padding: 12px; background: #F9FAFB; border-radius: var(--radius-sm); margin-bottom: 8px; }

.drawer-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: flex-end; z-index: 200; }
.drawer { background: white; width: 420px; max-width: 90vw; height: 100vh; overflow-y: auto; padding: 0; }
.drawer-header { display: flex; align-items: center; gap: 14px; padding: 24px; border-bottom: 1px solid #E5E7EB; }
.drawer-avatar { width: 52px; height: 52px; border-radius: 12px; background: var(--red); color: white; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; font-weight: 700; }
.drawer-name { font-size: 1.1rem; font-weight: 700; color: var(--text); }
.drawer-subtitle { font-size: 0.82rem; color: var(--text-secondary); }
.drawer-body { padding: 24px; }
.detail-section { margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #F3F4F6; }
.detail-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 0.85rem; }
.detail-label { color: var(--text-secondary); }
.detail-text { font-size: 0.85rem; color: var(--text); margin-top: 4px; }
</style>