<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Turmas</h1>
        <p class="page-subtitle">{{ turmas.length }} turma(s) cadastrada(s)</p>
      </div>
      <button class="btn-primary" @click="showForm = true">+ Nova Turma</button>
    </div>

    <div class="turmas-grid">
      <div v-for="t in turmas" :key="t.id" class="turma-card" @click="abrirTurma(t)" style="cursor: pointer;">
        <div class="turma-card-header">
          <div class="turma-icon">🏫</div>
          <div class="turma-actions">
            <button class="btn-icon" @click.stop="editar(t)">✏️</button>
            <button class="btn-icon" @click.stop="excluir(t)">🗑️</button>
          </div>
        </div>
        <h3 class="turma-nome">{{ t.nome }}</h3>
        <p class="turma-professor">{{ t.professor || 'Sem professor' }}</p>
        <div class="turma-stats">
          <span class="turma-stat">👶 {{ t.total_criancas }} crianças</span>
        </div>
      </div>

      <div v-if="!turmas.length" class="empty-card">
        <p>Nenhuma turma cadastrada.</p>
      </div>
    </div>

    <div v-if="showForm" class="modal-overlay" @click.self="fechar">
      <div class="modal-content modal-sm">
        <h2 class="modal-title">{{ editando ? 'Editar Turma' : 'Nova Turma' }}</h2>
        <form @submit.prevent="salvar">
          <div class="form-group">
            <label>Nome da Turma *</label>
            <input v-model="form.nome" required placeholder="Ex: Infantil A" />
          </div>
          <div class="form-group">
            <label>Professor(a)</label>
            <input v-model="form.professor" placeholder="Nome do professor" />
          </div>
          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="fechar">Cancelar</button>
            <button type="submit" class="btn-primary">{{ editando ? 'Salvar' : 'Criar' }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api'

const router = useRouter()
const turmas = ref([])
const showForm = ref(false)
const editando = ref(false)
const editId = ref(null)
const form = ref({ nome: '', professor: '' })

async function carregar() { turmas.value = (await api.getTurmas().catch(() => ({ data: [] }))).data }
function abrirTurma(t) { router.push(`/turmas/${t.id}`) }
function editar(t) { form.value = { nome: t.nome, professor: t.professor || '' }; editId.value = t.id; editando.value = true; showForm.value = true }
function fechar() { showForm.value = false; editando.value = false; editId.value = null; form.value = { nome: '', professor: '' } }
async function salvar() {
  if (editando.value) await api.updateTurma(editId.value, form.value).catch(() => alert('Erro.'))
  else await api.createTurma(form.value).catch(() => alert('Erro.'))
  fechar(); carregar()
}
async function excluir(t) { if (!confirm(`Remover turma ${t.nome}?`)) return; await api.deleteTurma(t.id).catch(() => alert('Erro.')); carregar() }
onMounted(carregar)
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
.page-title { font-size: 1.5rem; font-weight: 700; color: var(--text); }
.page-subtitle { font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px; }
.btn-primary { padding: 10px 20px; background: var(--red); color: white; border: none; border-radius: var(--radius-sm); font-weight: 600; font-size: 0.85rem; cursor: pointer; font-family: inherit; transition: var(--transition); }
.btn-primary:hover { background: var(--red-dark); }
.btn-secondary { padding: 10px 20px; background: #F3F4F6; color: var(--text); border: 1px solid #E5E7EB; border-radius: var(--radius-sm); font-weight: 500; font-size: 0.85rem; cursor: pointer; font-family: inherit; }
.btn-icon { background: none; border: none; cursor: pointer; padding: 4px; border-radius: 6px; transition: var(--transition); font-size: 0.9rem; }
.btn-icon:hover { background: #F3F4F6; }

.turmas-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }
.turma-card { background: white; border-radius: var(--radius); padding: 24px; box-shadow: var(--shadow); border-top: 3px solid var(--blue); transition: var(--transition); }
.turma-card:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); }
.turma-card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
.turma-icon { font-size: 2rem; }
.turma-nome { font-size: 1.1rem; font-weight: 700; color: var(--text); margin-bottom: 4px; }
.turma-professor { font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 12px; }
.turma-stats { font-size: 0.8rem; color: var(--text-secondary); }

.empty-card { grid-column: 1 / -1; padding: 48px; text-align: center; color: var(--text-secondary); background: white; border-radius: var(--radius); box-shadow: var(--shadow); }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 200; }
.modal-content { background: white; border-radius: var(--radius); padding: 32px; width: 90%; max-width: 500px; }
.modal-title { font-size: 1.2rem; font-weight: 700; margin-bottom: 24px; }
.form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
.form-group label { font-size: 0.82rem; font-weight: 500; color: var(--text-secondary); }
.form-group input { padding: 10px 14px; border: 1px solid #E5E7EB; border-radius: var(--radius-sm); font-size: 0.88rem; font-family: inherit; outline: none; transition: var(--transition); }
.form-group input:focus { border-color: var(--red); box-shadow: 0 0 0 3px rgba(229,57,53,0.08); }
.form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; padding-top: 16px; border-top: 1px solid #E5E7EB; }
</style>