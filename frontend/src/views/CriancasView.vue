<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Crianças</h1>
        <p class="page-subtitle">{{ criancas.length }} criança(s) cadastrada(s)</p>
      </div>
      <button class="btn-primary" @click="abrirForm()">+ Nova Criança</button>
    </div>

    <div class="filters">
      <input v-model="filtro" placeholder="🔍 Buscar por nome..." class="search-input" />
      <select v-model="turmaFiltro" class="filter-select" @change="carregar">
        <option value="">Todas as turmas</option>
        <option v-for="t in turmas" :key="t.id" :value="t.id">{{ t.nome }}</option>
      </select>
    </div>

    <div class="table-container">
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Turma</th>
              <th>Idade</th>
              <th>Sexo</th>
              <th>Responsável</th>
              <th>Telefone</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in filtradas" :key="c.id" class="table-row" @click="abrirDetalhes(c)">
              <td class="font-medium">{{ c.nome }}</td>
              <td><span class="badge badge-blue">{{ c.turma_nome || '—' }}</span></td>
              <td>{{ c.data_nascimento ? calcularIdade(c.data_nascimento) + ' anos' : '—' }}</td>
              <td>{{ c.sexo === 'M' ? '👨 Menino' : c.sexo === 'F' ? '👧 Menina' : '—' }}</td>
              <td class="text-secondary">{{ primeiroResponsavel(c) }}</td>
              <td class="text-secondary">{{ primeiroTelefone(c) }}</td>
              <td @click.stop>
                <button class="btn-icon" @click="editarCrianca(c)" title="Editar">✏️</button>
                <button class="btn-icon btn-danger" @click="excluirCrianca(c)" title="Excluir">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="!filtradas.length" class="empty-state">Nenhuma criança encontrada.</div>
    </div>

    <!-- Form Modal -->
    <div v-if="showForm" class="modal-overlay" @click.self="fecharForm">
      <div class="modal-content modal-lg">
        <h2 class="modal-title">{{ editando ? 'Editar Criança' : 'Nova Criança' }}</h2>
        <form @submit.prevent="salvar">
          <div class="form-section">
            <h3 class="section-label">📋 Dados da Criança</h3>
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
              <textarea v-model="form.observacoes" rows="2" placeholder="Observações..."></textarea>
            </div>
          </div>

          <div class="form-section">
            <h3 class="section-label">🏠 Endereço</h3>
            <div class="form-grid">
              <div class="form-group">
                <label>CEP</label>
                <input v-model="form.endereco.cep" placeholder="00000-000" />
              </div>
              <div class="form-group">
                <label>Rua</label>
                <input v-model="form.endereco.rua" placeholder="Nome da rua" />
              </div>
              <div class="form-group">
                <label>Número</label>
                <input v-model="form.endereco.numero" placeholder="Nº" />
              </div>
              <div class="form-group">
                <label>Complemento</label>
                <input v-model="form.endereco.complemento" placeholder="Apto, Bloco..." />
              </div>
              <div class="form-group">
                <label>Bairro</label>
                <input v-model="form.endereco.bairro" placeholder="Bairro" />
              </div>
              <div class="form-group">
                <label>Cidade</label>
                <input v-model="form.endereco.cidade" placeholder="Cidade" />
              </div>
              <div class="form-group">
                <label>Estado</label>
                <input v-model="form.endereco.estado" placeholder="Estado" maxlength="2" />
              </div>
            </div>
          </div>

          <div class="form-section">
            <h3 class="section-label">👨‍👩‍👧 Responsáveis</h3>
            <div v-for="(r, i) in form.responsaveis" :key="i" class="responsavel-card">
              <div class="responsavel-header">
                <span class="font-medium">{{ r.tipo === 'mae' ? '👩 Mãe' : r.tipo === 'pai' ? '👨 Pai' : '👤 Outro' }}</span>
                <button type="button" class="btn-text btn-text-danger" @click="form.responsaveis.splice(i, 1)" v-if="form.responsaveis.length > 1">Remover</button>
              </div>
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
                  <input v-model="r.nome" placeholder="Nome completo" />
                </div>
                <div class="form-group">
                  <label>Telefone</label>
                  <input v-model="r.telefone" placeholder="(00) 00000-0000" />
                </div>
                <div class="form-group">
                  <label>WhatsApp</label>
                  <input v-model="r.whatsapp" placeholder="(00) 00000-0000" />
                </div>
                <div class="form-group">
                  <label>Email</label>
                  <input v-model="r.email" placeholder="email@exemplo.com" type="email" />
                </div>
              </div>
            </div>
            <button type="button" class="btn-text" @click="form.responsaveis.push({ tipo: 'mae', nome: '', telefone: '', whatsapp: '', email: '' })">
              + Adicionar responsável
            </button>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="fecharForm">Cancelar</button>
            <button type="submit" class="btn-primary" :disabled="loading">
              {{ loading ? 'Salvando...' : (editando ? 'Salvar Alterações' : 'Cadastrar') }}
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
          <div class="detail-section">
            <div class="detail-row"><span class="detail-label">Data de Nascimento</span><span>{{ selectedCrianca.data_nascimento || '—' }}</span></div>
            <div class="detail-row"><span class="detail-label">Sexo</span><span>{{ selectedCrianca.sexo === 'M' ? 'Menino' : selectedCrianca.sexo === 'F' ? 'Menina' : '—' }}</span></div>
            <div class="detail-row"><span class="detail-label">Idade</span><span>{{ selectedCrianca.data_nascimento ? calcularIdade(selectedCrianca.data_nascimento) + ' anos' : '—' }}</span></div>
          </div>

          <div v-if="selectedCrianca.endereco" class="detail-section">
            <h4 class="detail-section-title">🏠 Endereço</h4>
            <div class="detail-row"><span class="detail-label">Rua</span><span>{{ selectedCrianca.endereco.rua || '—' }}, {{ selectedCrianca.endereco.numero || 'S/N' }}</span></div>
            <div class="detail-row"><span class="detail-label">Bairro</span><span>{{ selectedCrianca.endereco.bairro || '—' }}</span></div>
            <div class="detail-row"><span class="detail-label">Cidade/UF</span><span>{{ selectedCrianca.endereco.cidade || '—' }}/{{ selectedCrianca.endereco.estado || '—' }}</span></div>
          </div>

          <div v-for="(r, i) in selectedCrianca.responsaveis || []" :key="i" class="detail-section">
            <h4 class="detail-section-title">{{ r.tipo === 'mae' ? '👩 Mãe' : r.tipo === 'pai' ? '👨 Pai' : '👤 Responsável' }}</h4>
            <div class="detail-row"><span class="detail-label">Nome</span><span>{{ r.nome }}</span></div>
            <div v-if="r.telefone" class="detail-row"><span class="detail-label">Telefone</span><span>{{ r.telefone }}</span></div>
            <div v-if="r.whatsapp" class="detail-row"><span class="detail-label">WhatsApp</span><span>{{ r.whatsapp }}</span></div>
            <div v-if="r.email" class="detail-row"><span class="detail-label">Email</span><span>{{ r.email }}</span></div>
          </div>

          <div v-if="selectedCrianca.observacoes" class="detail-section">
            <h4 class="detail-section-title">📝 Observações</h4>
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

const emptyForm = () => ({
  nome: '',
  data_nascimento: '',
  sexo: '',
  turma_id: '',
  observacoes: '',
  responsaveis: [{ tipo: 'mae', nome: '', telefone: '', whatsapp: '', email: '' }],
  endereco: { cep: '', rua: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '' }
})

const form = ref(emptyForm())

const filtradas = computed(() => {
  let list = criancas.value
  if (turmaFiltro.value) list = list.filter(c => c.turma_id == turmaFiltro.value)
  if (filtro.value) {
    const t = filtro.value.toLowerCase()
    list = list.filter(c => c.nome.toLowerCase().includes(t))
  }
  return list
})

function primeiroResponsavel(c) {
  const r = c.responsaveis?.[0]
  return r ? r.nome : '—'
}

function primeiroTelefone(c) {
  const r = c.responsaveis?.[0]
  return r?.telefone || r?.whatsapp || '—'
}

function calcularIdade(data) {
  if (!data) return 0
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
  // Load full details for each child (includes responsaveis + endereco)
  const detalhadas = await Promise.all(
    c.data.map(async (cri) => {
      try {
        const resp = await api.getCrianca(cri.id)
        return resp.data
      } catch {
        return cri
      }
    })
  )
  criancas.value = detalhadas
  turmas.value = t.data
}

function abrirForm() {
  form.value = emptyForm()
  editando.value = false
  editId.value = null
  showForm.value = true
}

async function editarCrianca(c) {
  // Load full data
  try {
    const resp = await api.getCrianca(c.id)
    const data = resp.data
    form.value = {
      nome: data.nome || '',
      data_nascimento: data.data_nascimento || '',
      sexo: data.sexo || '',
      turma_id: data.turma_id || '',
      observacoes: data.observacoes || '',
      responsaveis: data.responsaveis?.length ? data.responsaveis.map(r => ({
        tipo: r.tipo || 'outro',
        nome: r.nome || '',
        telefone: r.telefone || '',
        whatsapp: r.whatsapp || '',
        email: r.email || ''
      })) : [{ tipo: 'mae', nome: '', telefone: '', whatsapp: '', email: '' }],
      endereco: data.endereco ? {
        cep: data.endereco.cep || '',
        rua: data.endereco.rua || '',
        numero: data.endereco.numero || '',
        complemento: data.endereco.complemento || '',
        bairro: data.endereco.bairro || '',
        cidade: data.endereco.cidade || '',
        estado: data.endereco.estado || ''
      } : { cep: '', rua: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '' }
    }
    editId.value = c.id
    editando.value = true
    showForm.value = true
  } catch {
    alert('Erro ao carregar dados da criança.')
  }
}

function fecharForm() {
  showForm.value = false
  editando.value = false
  editId.value = null
  form.value = emptyForm()
}

async function salvar() {
  loading.value = true
  try {
    if (editando.value) await api.updateCrianca(editId.value, form.value)
    else await api.createCrianca(form.value)
    fecharForm()
    await carregar()
  } catch {
    alert('Erro ao salvar.')
  } finally {
    loading.value = false
  }
}

async function excluirCrianca(c) {
  if (!confirm(`Remover ${c.nome} permanentemente?`)) return
  await api.deleteCrianca(c.id).catch(() => alert('Erro ao excluir.'))
  await carregar()
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
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-secondary { padding: 10px 20px; background: #F3F4F6; color: var(--text); border: 1px solid #E5E7EB; border-radius: var(--radius-sm); font-weight: 500; font-size: 0.85rem; cursor: pointer; font-family: inherit; }
.btn-text { background: none; border: none; color: var(--blue); cursor: pointer; font-size: 0.85rem; font-weight: 500; padding: 8px 0; font-family: inherit; }
.btn-text-danger { color: var(--red); }
.btn-icon { background: none; border: none; cursor: pointer; padding: 6px; border-radius: 6px; transition: var(--transition); font-size: 1rem; }
.btn-icon:hover { background: #F3F4F6; }
.btn-danger:hover { background: var(--red-light); }
.btn-close { background: none; border: none; font-size: 1.2rem; cursor: pointer; padding: 4px 8px; color: var(--text-secondary); }

.filters { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
.search-input, .filter-select { padding: 10px 14px; border: 1px solid #E5E7EB; border-radius: var(--radius-sm); font-size: 0.85rem; font-family: inherit; background: white; outline: none; }
.search-input { flex: 1; min-width: 200px; max-width: 400px; }
.search-input:focus { border-color: var(--red); box-shadow: 0 0 0 3px rgba(229,57,53,0.08); }

.table-container { background: white; border-radius: var(--radius); box-shadow: var(--shadow); overflow: hidden; }
.table-responsive { overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; min-width: 650px; }
.data-table th { padding: 12px 16px; text-align: left; font-size: 0.78rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary); border-bottom: 1px solid #E5E7EB; background: #FAFAFA; white-space: nowrap; }
.data-table td { padding: 12px 16px; font-size: 0.85rem; border-bottom: 1px solid #F3F4F6; }
.table-row { cursor: pointer; transition: var(--transition); }
.table-row:hover { background: #FAFAFA; }
.font-medium { font-weight: 600; }
.text-secondary { color: var(--text-secondary); }
.badge { padding: 3px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 500; white-space: nowrap; }
.badge-blue { background: var(--blue-light); color: var(--blue); }
.empty-state { padding: 40px; text-align: center; color: var(--text-secondary); }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 200; padding: 16px; }
.modal-content { background: white; border-radius: var(--radius); padding: 32px; width: 100%; max-width: 750px; max-height: 90vh; overflow-y: auto; }
.modal-title { font-size: 1.2rem; font-weight: 700; margin-bottom: 24px; color: var(--text); }
.form-section { margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid #E5E7EB; }
.form-section:last-of-type { border-bottom: none; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
@media (max-width: 600px) { .form-grid { grid-template-columns: 1fr; } }
.form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; }
.form-group label { font-size: 0.82rem; font-weight: 500; color: var(--text-secondary); }
.form-group input, .form-group select, .form-group textarea { padding: 10px 14px; border: 1px solid #E5E7EB; border-radius: var(--radius-sm); font-size: 0.88rem; font-family: inherit; outline: none; transition: var(--transition); }
.form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: var(--red); box-shadow: 0 0 0 3px rgba(229,57,53,0.08); }
.form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; padding-top: 16px; border-top: 1px solid #E5E7EB; }
.section-label { font-size: 0.95rem; font-weight: 700; color: var(--text); margin: 0 0 16px 0; }
.responsavel-card { padding: 16px; background: #F9FAFB; border-radius: var(--radius-sm); margin-bottom: 12px; }
.responsavel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }

.drawer-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: flex-end; z-index: 200; }
.drawer { background: white; width: 420px; max-width: 100vw; height: 100vh; overflow-y: auto; }
.drawer-header { display: flex; align-items: center; gap: 14px; padding: 24px; border-bottom: 1px solid #E5E7EB; }
.drawer-avatar { width: 52px; height: 52px; border-radius: 12px; background: var(--red); color: white; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; font-weight: 700; flex-shrink: 0; }
.drawer-name { font-size: 1.1rem; font-weight: 700; color: var(--text); }
.drawer-subtitle { font-size: 0.82rem; color: var(--text-secondary); }
.drawer-body { padding: 24px; }
.detail-section { margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #F3F4F6; }
.detail-section-title { font-size: 0.85rem; font-weight: 600; color: var(--text); margin-bottom: 8px; }
.detail-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 0.85rem; }
.detail-label { color: var(--text-secondary); }
.detail-text { font-size: 0.85rem; color: var(--text); margin-top: 4px; }

@media (max-width: 960px) {
  .page-title { font-size: 1.2rem; }
  .data-table { min-width: 550px; }
  .data-table th, .data-table td { padding: 8px 10px; font-size: 0.78rem; }
  .modal-content { padding: 20px; }
}
@media (max-width: 600px) {
  .filters { flex-direction: column; }
  .search-input { max-width: 100%; }
  .drawer { width: 100vw; }
}
</style>