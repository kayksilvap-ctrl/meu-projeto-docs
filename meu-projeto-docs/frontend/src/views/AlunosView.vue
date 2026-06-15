<template>
  <v-container fluid class="pa-4 pa-md-6">
    <div class="d-flex align-center justify-space-between mb-4 flex-wrap ga-2">
      <div>
        <h1 class="page-title">Alunos</h1>
        <p class="text-body-2 text-secondary mt-1">{{ alunosFiltrados.length }} aluno{{ alunosFiltrados.length !== 1 ? 's' : '' }}</p>
      </div>
      <v-btn color="primary" class="text-white" prepend-icon="mdi-account-plus" @click="abrirCadastro()" size="small">
        Novo Aluno
      </v-btn>
    </div>

    <v-card class="pa-3 mb-4" elevation="1">
      <v-row dense>
        <v-col cols="12" sm="6" md="5">
          <v-text-field
            v-model="filtro" label="Buscar..." prepend-inner-icon="mdi-magnify"
            variant="outlined" density="compact" clearable hide-details @input="onFiltroChange"
          />
        </v-col>
        <v-col cols="12" sm="6" md="4">
          <v-select
            v-model="filtroSala" :items="salas" item-title="nome" item-value="id"
            label="Filtrar sala" prepend-inner-icon="mdi-door-open" clearable
            density="compact" hide-details @update:model-value="carregarAlunos"
          />
        </v-col>
      </v-row>
    </v-card>

    <div v-if="carregando" class="d-flex justify-center pa-8">
      <v-progress-circular indeterminate color="primary" size="32" width="2" />
    </div>
    <div v-else-if="!alunosFiltrados.length" class="text-center pa-8 text-secondary">
      <v-icon size="52" class="mb-3">mdi-account-search</v-icon>
      <p class="text-body-1 font-weight-medium">Nenhum aluno encontrado</p>
      <p class="text-body-2 mb-3">{{ filtro || filtroSala ? 'Tente alterar os filtros.' : '' }}</p>
      <v-btn v-if="!filtro && !filtroSala" color="primary" class="text-white" prepend-icon="mdi-account-plus" @click="abrirCadastro()" size="small">
        Cadastrar Aluno
      </v-btn>
    </div>
    <v-row v-else>
      <v-col v-for="aluno in alunosFiltrados" :key="aluno.id" cols="12" sm="6" lg="4" xl="3">
        <v-hover v-slot="{ isHovering, props }">
          <v-card v-bind="props" :class="['aluno-card', { 'card-hover': isHovering }]" :elevation="isHovering ? 3 : 1">
            <v-card-text class="pa-4">
              <div class="d-flex align-start">
                <v-avatar :color="avatarColor(aluno.nome)" size="40" class="mr-3">
                  <span class="text-white font-weight-bold text-body-2">{{ getIniciais(aluno.nome) }}</span>
                </v-avatar>
                <div class="flex-grow-1" style="min-width:0">
                  <div class="text-body-1 font-weight-semibold text-primary">{{ aluno.nome }}</div>
                  <div class="text-caption text-secondary mt-1">
                    <div v-if="aluno.sala_nome">📖 {{ aluno.sala_nome }}</div>
                    <div v-if="aluno.idade">🎂 {{ aluno.idade }} anos</div>
                    <div v-if="aluno.responsavel">👤 {{ aluno.responsavel }}</div>
                    <div v-if="aluno.telefone">📞 {{ aluno.telefone }}</div>
                  </div>
                </div>
              </div>
            </v-card-text>
            <div class="pa-2 d-flex justify-end ga-1" style="border-top:1px solid #eee">
              <v-btn icon variant="text" color="primary" size="x-small" @click="abrirEdicao(aluno)">
                <v-icon size="18">mdi-pencil</v-icon>
                <v-tooltip activator="parent">Editar</v-tooltip>
              </v-btn>
              <v-btn icon variant="text" color="error" size="x-small" @click="confirmarExclusao(aluno)">
                <v-icon size="18">mdi-delete</v-icon>
                <v-tooltip activator="parent">Remover</v-tooltip>
              </v-btn>
            </div>
          </v-card>
        </v-hover>
      </v-col>
    </v-row>

    <AlunoForm v-model="showForm" :aluno="alunoEditando" @saved="carregarAlunos" />

    <v-dialog v-model="showDelete" max-width="380">
      <v-card class="pa-6 text-center">
        <v-icon color="error" size="44" class="mb-3">mdi-alert-circle-outline</v-icon>
        <p class="text-body-1 font-weight-medium mb-1">Remover aluno?</p>
        <p class="text-body-2 text-secondary mb-4">{{ alunoExcluir?.nome }}</p>
        <div class="d-flex justify-center ga-2">
          <v-btn variant="tonal" color="grey" @click="showDelete=false" size="small">Cancelar</v-btn>
          <v-btn color="error" @click="excluirAluno" :loading="deletando" size="small">Remover</v-btn>
        </div>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../api'
import AlunoForm from '../components/AlunoForm.vue'

const alunos = ref([])
const salas = ref([])
const filtro = ref('')
const filtroSala = ref(null)
const carregando = ref(false)
const showForm = ref(false)
const alunoEditando = ref(null)
const showDelete = ref(false)
const alunoExcluir = ref(null)
const deletando = ref(false)

const alunosFiltrados = computed(() => {
  let list = alunos.value
  if (filtro.value) {
    const t = filtro.value.toLowerCase()
    list = list.filter(a => a.nome?.toLowerCase().includes(t) || a.endereco?.toLowerCase().includes(t) || String(a.idade || '').includes(t))
  }
  return list
})

const colors = ['var(--primary)','var(--primary-light)','#E91E63','#9C27B0','#FF5722','#795548']
function avatarColor(n) { return colors[(n?.length||0) % colors.length] }
function getIniciais(n) { return n ? n.split(' ').map(p=>p[0]).join('').toUpperCase().slice(0,2) : '?' }

let debounceTimer
function onFiltroChange() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(carregarAlunos, 400)
}

async function carregarAlunos() {
  carregando.value = true
  try {
    const r = await api.getAlunos(filtro.value, filtroSala.value || '')
    alunos.value = r.data || []
  } catch {}
  finally { carregando.value = false }
}

async function carregarSalas() {
  try { const r = await api.getSalas(); salas.value = r.data || [] } catch {}
}

function abrirCadastro() { alunoEditando.value = null; showForm.value = true }
function abrirEdicao(a) { alunoEditando.value = { ...a }; showForm.value = true }

function confirmarExclusao(a) { alunoExcluir.value = a; showDelete.value = true }

async function excluirAluno() {
  if (!alunoExcluir.value) return
  deletando.value = true
  try {
    await api.deleteAluno(alunoExcluir.value.id)
    showDelete.value = false
    alunoExcluir.value = null
    carregarAlunos()
  } catch { alert('Erro ao remover.') }
  finally { deletando.value = false }
}

onMounted(() => { carregarAlunos(); carregarSalas() })
</script>

<style scoped>
.page-title { font-size: 1.5rem; font-weight: 700; color: var(--text); }
.aluno-card { border-radius: var(--radius-md) !important; border-left: 3px solid var(--secondary); transition: var(--transition); height: 100%; }
.aluno-card:hover { border-left-color: var(--primary); }
.card-hover { transform: translateY(-2px); }
</style>