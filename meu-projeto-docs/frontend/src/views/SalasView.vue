<template>
  <v-container fluid class="pa-4 pa-md-6">
    <div class="d-flex align-center justify-space-between mb-4 flex-wrap ga-2">
      <div>
        <h1 class="page-title">Salas</h1>
        <p class="text-body-2 text-secondary mt-1">{{ salas.length }} sala{{ salas.length !== 1 ? 's' : '' }}</p>
      </div>
      <v-btn color="primary" class="text-white" prepend-icon="mdi-plus" @click="abrirForm()" size="small">
        Nova Sala
      </v-btn>
    </div>

    <v-row v-if="!carregando && salas.length">
      <v-col v-for="sala in salas" :key="sala.id" cols="12" sm="6" lg="4">
        <v-hover v-slot="{ isHovering, props }">
          <v-card v-bind="props" :class="['sala-card', { 'card-hover': isHovering }]" :elevation="isHovering ? 3 : 1">
            <v-card-text class="pa-4">
              <div class="d-flex align-center mb-2">
                <v-avatar color="primary" size="40" class="mr-3">
                  <v-icon color="secondary">mdi-door-open</v-icon>
                </v-avatar>
                <div class="flex-grow-1">
                  <div class="text-body-1 font-weight-semibold text-primary">{{ sala.nome }}</div>
                  <div class="text-caption text-secondary">{{ sala.professor || 'Sem professor' }}</div>
                </div>
                <v-chip size="x-small" color="primary" variant="tonal" label>
                  {{ sala.total_alunos || 0 }} alunos
                </v-chip>
              </div>
              <div v-if="sala.descricao" class="text-caption text-secondary mt-1">{{ sala.descricao }}</div>
              <div class="d-flex mt-3 pt-2 justify-end ga-1" style="border-top:1px solid #eee">
                <v-btn icon variant="text" color="primary" size="x-small" @click="abrirForm(sala)">
                  <v-icon size="18">mdi-pencil</v-icon>
                  <v-tooltip activator="parent">Editar</v-tooltip>
                </v-btn>
                <v-btn icon variant="text" color="error" size="x-small" @click="confirmarExclusao(sala)">
                  <v-icon size="18">mdi-delete</v-icon>
                  <v-tooltip activator="parent">Remover</v-tooltip>
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-hover>
      </v-col>
    </v-row>

    <div v-else-if="!carregando" class="text-center pa-8 text-secondary">
      <v-icon size="52" class="mb-3">mdi-door-open</v-icon>
      <p class="text-body-1 font-weight-medium">Nenhuma sala cadastrada</p>
      <p class="text-body-2 mb-3">Crie salas para organizar seus alunos.</p>
      <v-btn color="primary" class="text-white" prepend-icon="mdi-plus" @click="abrirForm()" size="small">
        Criar Sala
      </v-btn>
    </div>

    <div v-else class="d-flex justify-center pa-8">
      <v-progress-circular indeterminate color="primary" size="32" width="2" />
    </div>

    <SalaForm v-model="showForm" :sala="salaEditando" @saved="carregarSalas" />

    <v-dialog v-model="showDelete" max-width="380">
      <v-card class="pa-6 text-center">
        <v-icon color="error" size="44" class="mb-3">mdi-alert-circle-outline</v-icon>
        <p class="text-body-1 font-weight-medium mb-1">Remover sala?</p>
        <p class="text-body-2 text-secondary mb-1">{{ salaExcluir?.nome }}</p>
        <p class="text-caption text-secondary mb-4">Alunos ficarão sem sala.</p>
        <div class="d-flex justify-center ga-2">
          <v-btn variant="tonal" color="grey" @click="showDelete=false" size="small">Cancelar</v-btn>
          <v-btn color="error" @click="excluirSala" :loading="deletando" size="small">Remover</v-btn>
        </div>
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
  try { const r = await api.getSalas(); salas.value = r.data || [] } catch {}
  finally { carregando.value = false }
}

function abrirForm(sala) { salaEditando.value = sala || null; showForm.value = true }
function confirmarExclusao(sala) { salaExcluir.value = sala; showDelete.value = true }

async function excluirSala() {
  if (!salaExcluir.value) return
  deletando.value = true
  try {
    await api.deleteSala(salaExcluir.value.id)
    showDelete.value = false; salaExcluir.value = null; carregarSalas()
  } catch { alert('Erro ao remover.') }
  finally { deletando.value = false }
}

onMounted(carregarSalas)
</script>

<style scoped>
.page-title { font-size: 1.5rem; font-weight: 700; color: var(--text); }
.sala-card {
  border-radius: var(--radius-md) !important;
  border-left: 3px solid var(--secondary);
  transition: var(--transition);
}
.sala-card:hover { border-left-color: var(--primary); }
.card-hover { transform: translateY(-2px); }
</style>