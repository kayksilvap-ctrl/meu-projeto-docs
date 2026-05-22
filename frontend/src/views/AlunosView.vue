<template>
  <div class="alunos-page">
    <v-container fluid class="pa-4 pa-md-6">
      <!-- Cabeçalho -->
      <div class="d-flex align-center justify-space-between mb-4 flex-wrap ga-2">
        <div>
          <h1 class="text-h4 font-weight-bold" style="color: #8B4513;">
            <v-icon color="#FFD700" size="36" class="mr-2">mdi-account-group</v-icon>
            Gerenciar Alunos
          </h1>
          <p class="text-grey mt-1">
            {{ alunos.length }} aluno{{ alunos.length !== 1 ? 's' : '' }} cadastrado{{ alunos.length !== 1 ? 's' : '' }}
          </p>
        </div>

        <v-btn
          color="#8B4513"
          class="text-white"
          prepend-icon="mdi-account-plus"
          @click="abrirCadastro()"
        >
          Novo Aluno
        </v-btn>
      </div>

      <!-- Filtro -->
      <v-card class="pa-3 mb-4" elevation="2">
        <v-text-field
          v-model="filtro"
          label="Buscar por nome, endereço ou idade..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          clearable
          hide-details
          @input="onFiltroChange"
        ></v-text-field>
      </v-card>

      <!-- Lista de Alunos -->
      <div v-if="carregando" class="d-flex justify-center pa-8">
        <v-progress-circular indeterminate color="#8B4513" size="48"></v-progress-circular>
      </div>

      <div v-else-if="alunosFiltrados.length === 0" class="text-center pa-8">
        <v-icon size="64" color="grey lighten-2" class="mb-3">mdi-account-search</v-icon>
        <h3 class="text-grey">Nenhum aluno encontrado</h3>
        <p class="text-grey-lighten-1 mb-4">
          {{ filtro ? 'Tente alterar os termos da busca.' : 'Cadastre o primeiro aluno!' }}
        </p>
        <v-btn
          v-if="!filtro"
          color="#8B4513"
          class="text-white"
          prepend-icon="mdi-account-plus"
          @click="abrirCadastro()"
        >
          Cadastrar Aluno
        </v-btn>
      </div>

      <v-row v-else>
        <v-col
          v-for="aluno in alunosFiltrados"
          :key="aluno.id"
          cols="12"
          sm="6"
          lg="4"
        >
          <v-hover v-slot="{ isHovering, props }">
            <v-card
              v-bind="props"
              :class="['aluno-card', { 'card-hover': isHovering }]"
              :elevation="isHovering ? 6 : 2"
            >
              <v-card-text class="pa-4">
                <div class="d-flex align-start">
                  <v-avatar :color="avatarColor(aluno.nome)" size="44" class="mr-3">
                    <span class="text-white font-weight-bold">{{ getIniciais(aluno.nome) }}</span>
                  </v-avatar>
                  <div class="flex-grow-1 min-width-0">
                    <div class="font-weight-bold" style="color: #8B4513; font-size: 1.05rem;">
                      {{ aluno.nome }}
                    </div>
                    <div class="text-caption text-grey mt-1">
                      <div v-if="aluno.idade">
                        <v-icon size="14" class="mr-1">mdi-calendar</v-icon>
                        {{ aluno.idade }} anos
                      </div>
                      <div v-if="aluno.responsavel">
                        <v-icon size="14" class="mr-1">mdi-account-star</v-icon>
                        {{ aluno.responsavel }}
                      </div>
                      <div v-if="aluno.endereco" class="text-truncate">
                        <v-icon size="14" class="mr-1">mdi-map-marker</v-icon>
                        {{ aluno.endereco }}
                      </div>
                      <div v-if="aluno.telefone">
                        <v-icon size="14" class="mr-1">mdi-phone</v-icon>
                        {{ aluno.telefone }}
                      </div>
                    </div>
                  </div>
                </div>
              </v-card-text>

              <v-divider></v-divider>

              <v-card-actions class="pa-2">
                <v-spacer></v-spacer>
                <v-btn
                  icon
                  variant="text"
                  color="#8B4513"
                  size="small"
                  @click="abrirEdicao(aluno)"
                >
                  <v-icon>mdi-pencil</v-icon>
                  <v-tooltip activator="parent" location="top">Editar</v-tooltip>
                </v-btn>
                <v-btn
                  icon
                  variant="text"
                  color="error"
                  size="small"
                  @click="confirmarExclusao(aluno)"
                >
                  <v-icon>mdi-delete</v-icon>
                  <v-tooltip activator="parent" location="top">Remover</v-tooltip>
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-hover>
        </v-col>
      </v-row>
    </v-container>

    <!-- Modal de Cadastro/Edição -->
    <AlunoForm
      v-model="showForm"
      :aluno="alunoEditando"
      @saved="onAlunoSaved"
    />

    <!-- Modal de Confirmação de Exclusão -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card>
        <v-card-title class="error pa-4 text-white">
          <v-icon class="mr-2">mdi-alert-circle</v-icon>
          Confirmar Exclusão
        </v-card-title>
        <v-card-text class="pa-4">
          <p>Tem certeza que deseja remover o aluno</p>
          <p class="font-weight-bold" style="color: #8B4513;">{{ alunoExcluir?.nome }}?</p>
          <p class="text-caption text-grey mt-2">Esta ação não pode ser desfeita.</p>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="showDeleteDialog = false">Cancelar</v-btn>
          <v-btn
            color="error"
            @click="excluirAluno"
            :loading="deletando"
            prepend-icon="mdi-delete"
          >
            Remover
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../api'
import AlunoForm from '../components/AlunoForm.vue'

const alunos = ref([])
const filtro = ref('')
const carregando = ref(false)
const showForm = ref(false)
const alunoEditando = ref(null)
const showDeleteDialog = ref(false)
const alunoExcluir = ref(null)
const deletando = ref(false)

const alunosFiltrados = computed(() => {
  if (!filtro.value) return alunos.value
  const termo = filtro.value.toLowerCase()
  return alunos.value.filter(a =>
    a.nome.toLowerCase().includes(termo) ||
    (a.endereco && a.endereco.toLowerCase().includes(termo)) ||
    (a.idade && String(a.idade).includes(termo))
  )
})

const colors = ['#8B4513', '#A0522D', '#5C2E0A', '#D2691E', '#CD853F', '#8B7355']

function avatarColor(nome) {
  const index = (nome?.length || 0) % colors.length
  return colors[index]
}

function getIniciais(nome) {
  if (!nome) return '?'
  return nome.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2)
}

let debounceTimer = null
function onFiltroChange() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    carregarAlunos()
  }, 400)
}

async function carregarAlunos() {
  carregando.value = true
  try {
    const response = await api.getAlunos(filtro.value)
    alunos.value = response.data
  } catch (error) {
    console.error('Erro ao carregar alunos:', error)
  } finally {
    carregando.value = false
  }
}

function abrirCadastro() {
  alunoEditando.value = null
  showForm.value = true
}

function abrirEdicao(aluno) {
  alunoEditando.value = { ...aluno }
  showForm.value = true
}

function onAlunoSaved() {
  carregarAlunos()
}

function confirmarExclusao(aluno) {
  alunoExcluir.value = aluno
  showDeleteDialog.value = true
}

async function excluirAluno() {
  if (!alunoExcluir.value) return
  deletando.value = true
  try {
    await api.deleteAluno(alunoExcluir.value.id)
    showDeleteDialog.value = false
    alunoExcluir.value = null
    carregarAlunos()
  } catch (error) {
    console.error('Erro ao excluir aluno:', error)
    alert('Erro ao excluir aluno.')
  } finally {
    deletando.value = false
  }
}

onMounted(() => {
  carregarAlunos()
})
</script>

<style scoped>
.alunos-page {
  min-height: 100vh;
  background: #f5f0eb;
}

.aluno-card {
  transition: all 0.3s ease;
  border-left: 3px solid #FFD700;
  border-radius: 8px !important;
  height: 100%;
}

.aluno-card:hover {
  border-left-color: #8B4513;
}

.card-hover {
  transform: translateY(-2px);
}

.min-width-0 {
  min-width: 0;
}

.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>