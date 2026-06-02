<template>
  <v-container fluid class="pa-4 pa-md-6">
    <div class="d-flex align-center justify-space-between mb-4 flex-wrap ga-2">
      <div>
        <h1 class="page-title">Chamada</h1>
        <p v-if="salaSelecionada" class="text-body-2 text-secondary mt-1">
          Sala: <strong>{{ salaNome }}</strong>
        </p>
      </div>
      <div class="d-flex ga-2">
        <v-select
          v-model="salaSelecionada" :items="salas" item-title="nome" item-value="id"
          label="Selecionar sala" prepend-inner-icon="mdi-door-open" clearable
          density="compact" variant="outlined" hide-details style="min-width:160px"
          @update:model-value="carregarChamada"
        />
        <v-menu :close-on-content-click="false" transition="scale-transition">
          <template v-slot:activator="{ props }">
            <v-btn v-bind="props" variant="outlined" color="primary" size="small" class="bg-white">
              <v-icon start size="16">mdi-calendar</v-icon>
              {{ dataFormatada }}
            </v-btn>
          </template>
          <v-date-picker v-model="dataSelecionada" @update:model-value="onDataChange" color="primary" :max="hoje" />
        </v-menu>
      </div>
    </div>

    <v-card class="pa-3 mb-4 d-flex align-center flex-wrap ga-2" elevation="1">
      <v-chip size="x-small" color="primary" variant="tonal" label>
        <v-icon start size="14">mdi-account-group</v-icon>{{ alunos.length }} alunos
      </v-chip>
      <v-chip size="x-small" color="success" variant="tonal" label>
        <v-icon start size="14">mdi-check-circle</v-icon>{{ totalPresentes }} presentes
      </v-chip>
      <v-chip size="x-small" color="error" variant="tonal" label>
        <v-icon start size="14">mdi-close-circle</v-icon>{{ totalAusentes }} ausentes
      </v-chip>
      <v-chip size="x-small" variant="tonal" label>
        <v-icon start size="14">mdi-minus-circle</v-icon>{{ totalNaoRegistrados }} pendentes
      </v-chip>
      <v-spacer />
      <v-btn
        v-if="alunos.length && totalNaoRegistrados"
        color="success" variant="tonal" size="x-small" prepend-icon="mdi-check-all"
        @click="marcarTodosPresentes" :loading="marcandoTodos"
      >
        Todos Presentes
      </v-btn>
    </v-card>

    <div v-if="carregando" class="d-flex justify-center pa-8">
      <v-progress-circular indeterminate color="primary" size="32" width="2" />
    </div>
    <div v-else-if="!alunos.length" class="text-center pa-8 text-secondary">
      <v-icon size="52" class="mb-3">mdi-account-off</v-icon>
      <p class="text-body-1 font-weight-medium">
        {{ salas.length ? 'Nenhum aluno nesta sala' : 'Nenhuma sala cadastrada' }}
      </p>
      <p class="text-body-2">Cadastre salas e alunos primeiro.</p>
    </div>
    <div v-else>
      <v-row>
        <v-col cols="12" v-for="aluno in alunos" :key="aluno.id">
          <AlunoCard :aluno="aluno" @registrar="registrarPresenca" />
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../api'
import AlunoCard from '../components/AlunoCard.vue'

const alunos = ref([])
const salas = ref([])
const salaSelecionada = ref(null)
const carregando = ref(false)
const marcandoTodos = ref(false)
const dataSelecionada = ref(new Date().toISOString().split('T')[0])
const hoje = ref(new Date().toISOString().split('T')[0])

const dataFormatada = computed(() => {
  if (!dataSelecionada.value) return 'Data'
  const p = dataSelecionada.value.split('-')
  return new Date(p[0], p[1]-1, p[2]).toLocaleDateString('pt-BR')
})
const salaNome = computed(() => salas.value.find(s => s.id === salaSelecionada.value)?.nome || '')
const totalPresentes = computed(() => alunos.value.filter(a => a.status === 'presente').length)
const totalAusentes = computed(() => alunos.value.filter(a => a.status === 'ausente').length)
const totalNaoRegistrados = computed(() => alunos.value.filter(a => !a.status).length)

async function carregarSalas() {
  try { const r = await api.getSalas(); salas.value = r.data || [] } catch {}
}

async function carregarChamada() {
  carregando.value = true
  try {
    const r = await api.getChamada(dataSelecionada.value, salaSelecionada.value || '')
    alunos.value = r.data || []
  } catch { alunos.value = [] }
  finally { carregando.value = false }
}

async function registrarPresenca({ aluno_id, status }) {
  try {
    await api.registrarChamada(aluno_id, dataSelecionada.value, status)
    const idx = alunos.value.findIndex(a => a.id === aluno_id)
    if (idx !== -1) alunos.value[idx] = { ...alunos.value[idx], status }
  } catch { alert('Erro ao registrar.') }
}

async function marcarTodosPresentes() {
  marcandoTodos.value = true
  try {
    await Promise.all(alunos.value.filter(a => !a.status).map(a => api.registrarChamada(a.id, dataSelecionada.value, 'presente')))
    await carregarChamada()
  } catch { alert('Erro.') }
  finally { marcandoTodos.value = false }
}

function onDataChange() { carregarChamada() }

onMounted(() => { carregarSalas(); carregarChamada() })
</script>

<style scoped>
.page-title { font-size: 1.5rem; font-weight: 700; color: var(--text); }
</style>