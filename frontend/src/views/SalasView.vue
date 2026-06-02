<template>
  <v-container fluid class="pa-4 pa-md-6" style="background:#f5f0eb;min-height:100vh">
    <div class="d-flex align-center justify-space-between mb-4 flex-wrap ga-2">
      <div>
        <h1 class="text-h4 font-weight-bold" style="color:#8B4513">
          <v-icon color="#FFD700" size="32" class="mr-2">mdi-door-open</v-icon>Salas
        </h1>
        <p class="text-grey text-caption mt-1">{{ salas.length }} sala{{ salas.length !== 1 ? 's' : '' }}</p>
      </div>
      <v-btn color="#8B4513" class="text-white" prepend-icon="mdi-plus" @click="abrirForm()" size="small">
        Nova Sala
      </v-btn>
    </div>

    <!-- Lista de Salas -->
    <v-row v-if="!carregando && salas.length">
      <v-col v-for="sala in salas" :key="sala.id" cols="12" sm="6" lg="4">
        <v-hover v-slot="{ isHovering, props }">
          <v-card v-bind="props" :class="['sala-card', { 'card-hover': isHovering }]" :elevation="isHovering ? 4 : 1">
            <v-card-text class="pa-4">
              <div class="d-flex align-center mb-2">
                <v-avatar color="#8B4513" size="40" class="mr-3">
                  <v-icon color="#FFD700">mdi-door-open</v-icon>
                </v-avatar>
                <div class="flex-grow-1">
                  <div class="font-weight-semibold" style="color:#8B4513;font-size:1.05rem">{{ sala.nome }}</div>
                  <div class="text-caption text-grey">
                    <v-icon size="12" class="mr-1">mdi-account-tie</v-icon>
                    {{ sala.professor || 'Sem professor' }}
                  </div>
                </div>
                <v-chip size="x-small" color="#8B4513" variant="tonal" label>
                  {{ sala.total_alunos || 0 }} alunos
                </v-chip>
              </div>
              <div v-if="sala.descricao" class="text-caption text-grey mt-1 ml-1">
                {{ sala.descricao }}
              </div>
              <div class="d-flex mt-3 pt-2 border-top justify-end ga-1">
                <v-btn icon variant="text" color="#8B4513" size="x-small" @click="abrirForm(sala)">
                  <v-icon size="18">mdi-pencil</v-icon>
                  <v-tooltip activator="parent" location="top">Editar</v-tooltip>
                </v-btn>
                <v-btn icon variant="text" color="error" size="x-small" @click="confirmarExclusao(sala)">
                  <v-icon size="18">mdi-delete</v-icon>
                  <v-tooltip activator="parent" location="top">Remover</v-tooltip>
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-hover>
      </v-col>
    </v-row>

    <div v-else-if="!carregando && !salas.length" class="text-center pa-8 text-grey">
      <v-icon size="56" class="mb-3">mdi-door-open</v-icon>
      <h3>Nenhuma sala cadastrada</h3>
      <p class="text-caption mb-4">Crie salas para organizar seus alunos.</p>
      <v-btn color="#8B4513" class="text-white" prepend-icon="mdi-plus" @click="abrirForm()" size="small">
        Criar Primeira Sala
      </v-btn>
    </div>

    <div v-else class="d-flex justify-center pa-8">
      <v-progress-circular indeterminate color="#8B4513" size="36" width="3"></v-progress-circular>
    </div>

    <SalaForm v-model="showForm" :sala="salaEditando" @saved="carregarSalas" />

    <v-dialog v-model="showDelete" max-width="380">
      <v-card class="pa-2">
        <v-card-text class="text-center">
          <v-icon color="error" size="48" class="mb-2">mdi-alert-circle</v-icon>
          <p>Remover sala <strong>{{ salaExcluir?.nome }}</strong>?</p>
          <p class="text-caption text-grey">Os alunos desta sala ficarão sem sala vinculada.</p>
        </v-card-text>
        <v-card-actions class="justify-center pb-4">
          <v-btn variant="tonal" color="grey" @click="showDelete=false" size="small">Cancelar</v-btn>
          <v-btn color="error" @click="excluirSala" :loading="deletando" size="small">Remover</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../api'
import SalaForm from '../components/SalaForm.vue'

const salas = ref([])
const carregando = ref(false)
const showForm = ref(false)
const salaEditando = ref(null)
const showDelete = ref(false)
const salaExcluir = ref(null)
const deletando = ref(false)

async function carregarSalas() {
  carregando.value = true
  try {
    const r = await api.getSalas()
    salas.value = r.data || []
  } catch (e) { console.error(e) }
  finally { carregando.value = false }
}

function abrirForm(sala) {
  salaEditando.value = sala || null
  showForm.value = true
}

function confirmarExclusao(sala) {
  salaExcluir.value = sala
  showDelete.value = true
}

async function excluirSala() {
  if (!salaExcluir.value) return
  deletando.value = true
  try {
    await api.deleteSala(salaExcluir.value.id)
    showDelete.value = false
    salaExcluir.value = null
    carregarSalas()
  } catch (e) { console.error(e); alert('Erro ao remover sala.') }
  finally { deletando.value = false }
}

onMounted(carregarSalas)
</script>

<style scoped>
.sala-card {
  border-radius: 12px !important;
  border-left: 3px solid #FFD700;
  transition: all 0.25s ease;
}
.sala-card:hover { border-left-color: #8B4513; }
.card-hover { transform: translateY(-2px); }
.border-top { border-top: 1px solid #eee; }
</style>