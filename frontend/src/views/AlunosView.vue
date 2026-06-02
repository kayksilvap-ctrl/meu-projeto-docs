<template>
  <v-container fluid class="pa-4 pa-md-6" style="background:#f5f0eb;min-height:100vh">
    <div class="d-flex align-center justify-space-between mb-4 flex-wrap ga-2">
      <div>
        <h1 class="text-h4 font-weight-bold" style="color:#8B4513">
          <v-icon color="#FFD700" size="32" class="mr-2">mdi-account-group</v-icon>Alunos
        </h1>
        <p class="text-grey text-caption mt-1">{{ alunos.length }} aluno{{ alunos.length !== 1 ? 's' : '' }}</p>
      </div>
      <v-btn color="#8B4513" class="text-white" prepend-icon="mdi-account-plus" @click="abrirCadastro()" size="small">
        Novo Aluno
      </v-btn>
    </div>

    <!-- Filtros -->
    <v-card class="pa-3 mb-4" elevation="1" style="border-radius:12px">
      <v-row dense align="center">
        <v-col cols="12" sm="6" md="5">
          <v-text-field v-model="filtro" label="Buscar por nome, endereço ou idade..." prepend-inner-icon="mdi-magnify" variant="outlined" density="compact" clearable hide-details @input="onFiltroChange"></v-text-field>
        </v-col>
        <v-col cols="12" sm="6" md="4">
          <v-select v-model="filtroSala" :items="salas" item-title="nome" item-value="id" label="Filtrar por sala" prepend-inner-icon="mdi-door-open" clearable density="compact" hide-details @update:model-value="carregarAlunos"></v-select>
        </v-col>
      </v-row>
    </v-card>

    <!-- Lista -->
    <div v-if="carregando" class="d-flex justify-center pa-8">
      <v-progress-circular indeterminate color="#8B4513" size="36" width="3"></v-progress-circular>
    </div>
    <div v-else-if="alunosFiltrados.length === 0" class="text-center pa-8 text-grey">
      <v-icon size="56" class="mb-3">mdi-account-search</v-icon>
      <h3>Nenhum aluno encontrado</h3>
      <p class="text-caption mb-4">{{ filtro || filtroSala ? 'Tente alterar os filtros.' : 'Cadastre o primeiro aluno!' }}</p>
      <v-btn v-if="!filtro && !filtroSala" color="#8B4513" class="text-white" prepend-icon="mdi-account-plus" @click="abrirCadastro()" size="small">Cadastrar Aluno</v-btn>
    </div>
    <v-row v-else>
      <v-col v-for="aluno in alunosFiltrados" :key="aluno.id" cols="12" sm="6" lg="4">
        <v-hover v-slot="{ isHovering, props }">
          <v-card v-bind="props" :class="['aluno-card', { 'card-hover': isHovering }]" :elevation="isHovering ? 4 : 1">
            <v-card-text class="pa-4">
              <div class="d-flex align-start">
                <v-avatar :color="avatarColor(aluno.nome)" size="40" class="mr-3">
                  <span class="text-white font-weight-bold">{{ getIniciais(aluno.nome) }}</span>
                </v-avatar>
                <div class="flex-grow-1 min-width-0">
                  <div class="font-weight-semibold" style="color:#8B4513;font-size:1rem">{{ aluno.nome }}</div>
                  <div class="text-caption text-grey mt-1">
                    <div v-if="aluno.sala_nome"><v-icon size="12" class="mr-1">mdi-door-open</v-icon>{{ aluno.sala_nome }}</div>
                    <div v-if="aluno.idade"><v-icon size="12" class="mr-1">mdi-calendar</v-icon>{{ aluno.idade }} anos</div>
                    <div v-if="aluno.responsavel"><v-icon size="12" class="mr-1">mdi-account-star</v-icon>{{ aluno.responsavel }}</div>
                    <div v-if="aluno.endereco" class="text-truncate"><v-icon size="12" class="mr-1">mdi-map-marker</v-icon>{{ aluno.endereco }}</div>
                    <div v-if="aluno.telefone"><v-icon size="12" class="mr-1">mdi-phone</v-icon>{{ aluno.telefone }}</div>
                  </div>
                </div>
              </div>
            </v-card-text>
            <div class="pa-2 d-flex justify-end ga-1 border-top">
              <v-btn icon variant="text" color="#8B4513" size="x-small" @click="abrirEdicao(aluno)"><v-icon size="18">mdi-pencil</v-icon><v-tooltip activator="parent">Editar</v-tooltip></v-btn>
              <v-btn icon variant="text" color="error" size="x-small" @click="confirmarExclusao(aluno)"><v-icon size="18">mdi-delete</v-icon><v-tooltip activator="parent">Remover</v-tooltip></v-btn>
            </div>
          </v-card>
        </v-hover>
      </v-col>
    </v-row>

    <AlunoForm v-model="showForm" :aluno="alunoEditando" @saved="carregarAlunos" />
    <v-dialog v-model="showDeleteDialog" max-width="380">
      <v-card class="pa-2">
        <v-card-text class="text-center">
          <v-icon color="error" size="48" class="mb-2">mdi-alert-circle</v-icon>
          <p>Remover aluno <strong>{{ alunoExcluir?.nome }}</strong>?</p>
          <p class="text-caption text-grey">Esta ação não pode ser desfeita.</p>
        </v-card-text>
        <v-card-actions class="justify-center pb-4">
          <v-btn variant="tonal" color="grey" @click="showDeleteDialog=false" size="small">Cancelar</v-btn>
          <v-btn color="error" @click="excluirAluno" :loading="deletando" size="small">Remover</v-btn>
        </v-card-actions>
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
const showDeleteDialog = ref(false)
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

const colors = ['#8B4513','#A0522D','#5C2E0A','#D2691E','#CD853F','#8B7355']
function avatarColor(n) { return colors[(n?.length||0) % colors.length] }
function getIniciais(n) { return n ? n.split(' ').map(p=>p[0]).join('').toUpperCase().slice(0,2) : '?' }

let debounceTimer = null
function onFiltroChange() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(carregarAlunos, 400)
}

async function carregarAlunos() {
  carregando.value = true
  try {
    const r = await api.getAlunos(filtro.value, filtroSala.value || '')
    alunos.value = r.data || []
  } catch (e) { console.error(e) }
  finally { carregando.value = false }
}

async function carregarSalas() {
  try { const r = await api.getSalas(); salas.value = r.data || [] } catch (e) { console.error(e) }
}

function abrirCadastro() { alunoEditando.value = null; showForm.value = true }
function abrirEdicao(a) { alunoEditando.value = { ...a }; showForm.value = true }
function onAlunoSaved() { carregarAlunos() }
function confirmarExclusao(a) { alunoExcluir.value = a; showDeleteDialog.value = true }

async function excluirAluno() {
  if (!alunoExcluir.value) return
  deletando.value = true
  try {
    await api.deleteAluno(alunoExcluir.value.id)
    showDeleteDialog.value = false; alunoExcluir.value = null; carregarAlunos()
  } catch (e) { console.error(e); alert('Erro ao excluir.') }
  finally { deletando.value = false }
}

onMounted(() => { carregarAlunos(); carregarSalas() })
</script>

<style scoped>
.aluno-card { border-radius: 12px !important; border-left: 3px solid #FFD700; transition: all 0.25s ease; height:100% }
.aluno-card:hover { border-left-color: #8B4513; }
.card-hover { transform: translateY(-2px); }
.min-width-0 { min-width: 0; }
.text-truncate { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.border-top { border-top: 1px solid #eee; }
</style>