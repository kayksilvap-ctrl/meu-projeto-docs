<template>
  <div class="criancas-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Crianças</h1>
        <p class="page-subtitle">{{ criancas.length }} criança(s) cadastrada(s)</p>
      </div>
      <button class="btn-primary" @click="abrirForm()">
        <span class="btn-icon-only">+</span>
        <span class="btn-text-full">Nova Criança</span>
      </button>
    </div>

    <div class="filters">
      <div class="search-wrapper">
        <span class="search-icon">🔍</span>
        <input v-model="filtro" placeholder="Buscar por nome..." class="search-input" />
      </div>
      <select v-model="turmaFiltro" class="filter-select" @change="carregar">
        <option value="">Todas as turmas</option>
        <option v-for="t in turmas" :key="t.id" :value="t.id">{{ t.nome }}</option>
      </select>
    </div>

    <!-- Mobile cards view -->
    <div class="mobile-cards">
      <div v-for="c in filtradas" :key="c.id" class="mobile-card" @click="abrirDetalhes(c)">
        <div class="mobile-card-header">
          <div class="mobile-avatar">{{ c.nome?.charAt(0) }}</div>
          <div class="mobile-card-info">
            <div class="mobile-card-name">{{ c.nome }}</div>
            <div class="mobile-card-turma">{{ c.turma_nome || 'Sem turma' }}</div>
          </div>
          <div class="mobile-card-idade">{{ c.data_nascimento ? calcularIdade(c.data_nascimento) + 'a' : '—' }}</div>
        </div>
        <div class="mobile-card-body">
          <div class="mobile-card-detail"><span>Responsável:</span> {{ primeiroResponsavel(c) }}</div>
          <div class="mobile-card-detail"><span>Contato:</span> {{ primeiroTelefone(c) }}</div>
        </div>
        <div class="mobile-card-actions">
          <button class="btn-sm-action" @click.stop="editarCrianca(c)">✏️ Editar</button>
          <button class="btn-sm-action btn-sm-danger" @click.stop="excluirCrianca(c)">🗑️ Excluir</button>
        </div>
      </div>
    </div>

    <!-- Desktop table -->
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
              <td>{{ c.sexo === 'M' ? 'Menino' : c.sexo === 'F' ? 'Menina' : '—' }}</td>
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
        <div class="modal-header">
          <h2 class="modal-title">{{ editando ? 'Editar Criança' : 'Nova Criança' }}</h2>
          <button class="modal-close" @click="fecharForm">✕</button>
        </div>
        <form @submit.prevent="salvar">
          <div class="modal-body">
            <div class="form-section">
              <h3 class="section-label">📋 Dados da Criança</h3>
              <div class="form-grid">
                <div class="form-group full-width">
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
                    <option value="">Selecione uma turma</option>
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
                  <input v-model="form.endereco.estado" placeholder="UF" maxlength="2" />
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
                    <label>Nome *</label>
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
          </div>

          <div class="modal-footer">
            <button type="button" class="btn-secondary" @click="fecharForm">Cancelar</button>
            <button type="submit" class="btn-primary" :disabled="loading">
              {{ loading ? '⏳ Salvando...' : (editando ? 'Salvar Alterações' : 'Cadastrar') }}
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
  criancas.value = c.data
  turmas.value = t.data
}

function abrirForm() {
  form.value = emptyForm()
  editando.value = false
  editId.value = null
  showForm.value = true
}

async function editarCrianca(c) {
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
.criancas-page { max-width: 1200px; margin: 0 auto; }

.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
.page-title { font-size: 1.5rem; font-weight: 700; color: var(--text); }
.page-subtitle { font-size: 0.82rem; color: var(--text-secondary); margin-top: 4px; }

.btn-primary {
  padding: 10px 20px; background: var(--red); color: white; border: none;
  border-radius: var(--radius-sm); font-weight: 600; font-size: 0.85rem;
  cursor: pointer; font-family: inherit; transition: var(--transition);
  display: flex; align-items: center; gap: 6px;
}
.btn-primary:hover { background: var(--red-dark); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-secondary {
  padding: 10px 20px; background: #F3F4F6; color: var(--text);
  border: 1px solid #E5E7EB; border-radius: var(--radius-sm);
  font-weight: 500; font-size: 0.85rem; cursor: pointer; font-family: inherit;
}
.btn-text { background: none; border: none; color: var(--blue); cursor: pointer; font-size: 0.85rem; font-weight: 500; padding: 8px 0; font-family: inherit; }
.btn-text-danger { color: var(--red); }
.btn-icon { background: none; border: none; cursor: pointer; padding: 6px; border-radius: 6px; transition: var(--transition); font-size: 1rem; }
.btn-icon:hover { background: #F3F4F6; }
.btn-danger:hover { background: var(--red-light); }
.btn-close { background: none; border: none; font-size: 1.2rem; cursor: pointer; padding: 4px 8px; color: var(--text-secondary); }

.btn-sm-action {
  flex: 1; padding: 6px 12px; border: 1px solid #E5E7EB; border-radius: 6px;
  background: white; font-size: 0.78rem; font-weight: 500; cursor: pointer;
  font-family: inherit; transition: var(--transition);
}
.btn-sm-action:hover { background: #F3F4F6; }
.btn-sm-danger:hover { background: var(--red-light); border-color: var(--red); color: var(--red); }

.filters { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
.search-wrapper {
  display: flex; align-items: center; gap: 8px;
  padding: 0 14px; border: 1px solid #E5E7EB; border-radius: var(--radius-sm);
  background: white; flex: 1; min-width: 200px; max-width: 400px;
}
.search-wrapper:focus-within { border-color: var(--red); box-shadow: 0 0 0 3px rgba(229,57,53,0.08); }
.search-icon { font-size: 0.85rem; color: var(--text-secondary); }
.search-input { border: none; padding: 10px 0; font-size: 0.85rem; font-family: inherit; background: transparent; outline: none; flex: 1; }
.filter-select {
  padding: 10px 14px; border: 1px solid #E5E7EB; border-radius: var(--radius-sm);
  font-size: 0.85rem; font-family: inherit; background: white; color: var(--text); outline: none;
  min-width: 160px; cursor: pointer;
}
.filter-select:focus { border-color: var(--red); box-shadow: 0 0 0 3px rgba(229,57,53,0.08); }

/* Mobile cards - show only on small screens */
.mobile-cards { display: none; flex-direction: column; gap: 10px; }

.mobile-card {
  background: white; border-radius: var(--radius); box-shadow: var(--shadow);
  padding: 14px 16px; cursor: pointer; transition: var(--transition);
}
.mobile-card:active { transform: scale(0.98); }
.mobile-card-header { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.mobile-avatar {
  width: 36px; height: 36px; border-radius: 10px;
  background: linear-gradient(135deg, var(--red), var(--red-dark));
  color: white; display: flex; align-items: center; justify-content: center;
  font-size: 1rem; font-weight: 700; flex-shrink: 0;
}
.mobile-card-info { flex: 1; min-width: 0; }
.mobile-card-name { font-size: 0.88rem; font-weight: 600; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mobile-card-turma { font-size: 0.72rem; color: var(--text-secondary); }
.mobile-card-idade { font-size: 0.75rem; color: var(--text-secondary); font-weight: 500; }
.mobile-card-body { padding: 4px 0; }
.mobile-card-detail { font-size: 0.78rem; color: var(--text); padding: 2px 0; }
.mobile-card-detail span { color: var(--text-secondary); }
.mobile-card-actions { display: flex; gap: 8px; margin-top: 8px; padding-top: 8px; border-top: 1px solid #F3F4F6; }

/* Desktop table */
.table-container { background: white; border-radius: var(--radius); box-shadow: var(--shadow); overflow: hidden; }
.table-responsive { overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; min-width: 650px; }
.data-table th { padding: 12px 16px; text-align: left; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary); border-bottom: 1px solid #E5E7EB; background: #FAFAFA; white-space: nowrap; }
.data-table td { padding: 12px 16px; font-size: 0.85rem; border-bottom: 1px solid #F3F4F6; }
.table-row { cursor: pointer; transition: var(--transition); }
.table-row:hover { background: #FAFAFA; }
.font-medium { font-weight: 600; }
.text-secondary { color: var(--text-secondary); }
.badge { padding: 3px 10px; border-radius: 20px; font-size: 0.72rem; font-weight: 500; white-space: nowrap; }
.badge-blue { background: var(--blue-light); color: var(--blue); }
.empty-state { padding: 32px; text-align: center; color: var(--text-secondary); font-size: 0.85rem; }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 200; padding: 16px; }
.modal-content { background: white; border-radius: var(--radius); width: 100%; max-width: 750px; max-height: 90vh; display: flex; flex-direction: column; }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid #E5E7EB; }
.modal-title { font-size: 1.1rem; font-weight: 700; color: var(--text); }
.modal-close { background: none; border: none; font-size: 1.2rem; cursor: pointer; color: var(--text-secondary); padding: 4px 8px; border-radius: 6px; }
.modal-close:hover { background: #F3F4F6; }
.modal-body { padding: 24px; overflow-y: auto; flex: 1; }
.modal-footer { display: flex; justify-content: flex-end; gap: 12px; padding: 16px 24px; border-top: 1px solid #E5E7EB; }

.form-section { margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid #E5E7EB; }
.form-section:last-of-type { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group.full-width { grid-column: 1 / -1; }
.form-group label { font-size: 0.8rem; font-weight: 500; color: var(--text-secondary); }
.form-group input, .form-group select, .form-group textarea {
  padding: 10px 12px; border: 1px solid #E5E7EB; border-radius: var(--radius-sm);
  font-size: 0.85rem; font-family: inherit; outline: none; transition: var(--transition);
}
.form-group input:focus, .form-group select:focus, .form-group textarea:focus {
  border-color: var(--red); box-shadow: 0 0 0 3px rgba(229,57,53,0.08);
}
.section-label { font-size: 0.9rem; font-weight: 700; color: var(--text); margin: 0 0 14px 0; }
.responsavel-card { padding: 14px; background: #F9FAFB; border-radius: var(--radius-sm); margin-bottom: 10px; }
.responsavel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }

/* Drawer */
.drawer-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: flex-end; z-index: 200; }
.drawer { background: white; width: 420px; max-width: 100vw; height: 100vh; overflow-y: auto; }
.drawer-header { display: flex; align-items: center; gap: 14px; padding: 20px 24px; border-bottom: 1px solid #E5E7EB; }
.drawer-avatar { width: 48px; height: 48px; border-radius: 12px; background: var(--red); color: white; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; font-weight: 700; flex-shrink: 0; }
.drawer-name { font-size: 1.05rem; font-weight: 700; color: var(--text); }
.drawer-subtitle { font-size: 0.8rem; color: var(--text-secondary); }
.drawer-body { padding: 20px 24px; }
.detail-section { margin-bottom: 16px; padding-bottom: 14px; border-bottom: 1px solid #F3F4F6; }
.detail-section-title { font-size: 0.82rem; font-weight: 600; color: var(--text); margin-bottom: 8px; }
.detail-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 0.82rem; }
.detail-label { color: var(--text-secondary); }
.detail-text { font-size: 0.82rem; color: var(--text); margin-top: 4px; }

/* === RESPONSIVO === */
@media (max-width: 768px) {
  .page-title { font-size: 1.2rem; }
  .mobile-cards { display: flex; }
  .table-container { display: none; }
  .btn-icon-only { display: inline; }
  .btn-text-full { display: inline; }
  .filters { flex-direction: column; }
  .search-wrapper { max-width: 100%; }
  .filter-select { width: 100%; }
  .form-grid { grid-template-columns: 1fr; }
  .modal-content { max-height: 95vh; border-radius: 12px 12px 0 0; margin-top: auto; }
  .modal-overlay { align-items: flex-end; padding: 0; }
  .modal-header { padding: 16px 20px; }
  .modal-body { padding: 20px; }
  .modal-footer { padding: 14px 20px; flex-direction: column; }
  .modal-footer .btn-primary, .modal-footer .btn-secondary { width: 100%; justify-content: center; }
  .drawer { width: 100vw; }
  .drawer-header { padding: 16px 20px; }
  .drawer-body { padding: 16px 20px; }
}

@media (max-width: 480px) {
  .btn-icon-only { display: inline; }
  .btn-text-full { display: inline; }
  .page-header { flex-direction: column; }
  .page-header .btn-primary { width: 100%; justify-content: center; }
}

@media (min-width: 769px) {
  .mobile-cards { display: none; }
  .table-container { display: block; }
}
</style>