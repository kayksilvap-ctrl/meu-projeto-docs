<template>
  <v-dialog v-model="dialogVisible" max-width="550" persistent>
    <v-card class="aluno-form-card">
      <v-card-title class="form-header pa-4">
        <v-icon color="#FFD700" size="28" class="mr-2">
          {{ editando ? 'mdi-account-edit' : 'mdi-account-plus' }}
        </v-icon>
        <span class="text-white font-weight-bold">
          {{ editando ? 'Editar Aluno' : 'Novo Aluno' }}
        </span>
        <v-spacer></v-spacer>
        <v-btn icon variant="text" color="white" @click="fechar" size="small">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text class="pa-4">
        <v-form ref="formRef" v-model="valid" @submit.prevent="salvar">
          <v-row>
            <v-col cols="12">
              <v-select
                v-model="form.sala_id"
                :items="salas"
                item-title="nome"
                item-value="id"
                label="Sala (opcional)"
                prepend-inner-icon="mdi-door-open"
                clearable
                :loading="loadingSalas"
              ></v-select>
            </v-col>

            <v-col cols="12">
              <v-text-field
                v-model="form.nome"
                label="Nome do Aluno *"
                :rules="[v => !!v || 'Nome é obrigatório']"
                prepend-inner-icon="mdi-account"
                required
                clearable
                counter="100"
              ></v-text-field>
            </v-col>

            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.idade"
                label="Idade"
                type="number"
                prepend-inner-icon="mdi-numeric"
                min="0"
                max="120"
                :rules="[v => !v || (v > 0 && v <= 120) || 'Idade inválida']"
                clearable
              ></v-text-field>
            </v-col>

            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.telefone"
                label="Telefone"
                prepend-inner-icon="mdi-phone"
                placeholder="(00) 00000-0000"
                clearable
              ></v-text-field>
            </v-col>

            <v-col cols="12">
              <v-text-field
                v-model="form.responsavel"
                label="Nome do Responsável"
                prepend-inner-icon="mdi-account-star"
                clearable
              ></v-text-field>
            </v-col>

            <v-col cols="12">
              <v-text-field
                v-model="form.endereco"
                label="Endereço"
                prepend-inner-icon="mdi-map-marker"
                clearable
                counter="200"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn
          variant="outlined"
          color="#8B4513"
          @click="fechar"
          class="mr-2"
        >
          Cancelar
        </v-btn>
        <v-btn
          :loading="loading"
          :disabled="!valid"
          color="#8B4513"
          class="save-btn text-white"
          @click="salvar"
        >
          <v-icon start>{{ editando ? 'mdi-content-save' : 'mdi-plus-circle' }}</v-icon>
          {{ editando ? 'Salvar Alterações' : 'Adicionar Aluno' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'
import api from '../api'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  aluno: { type: Object, default: null }
})

const emit = defineEmits(['update:modelValue', 'saved'])

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const editando = computed(() => !!props.aluno?.id)

const formRef = ref(null)
const valid = ref(false)
const loading = ref(false)

const salas = ref([])
const loadingSalas = ref(false)

const form = reactive({
  nome: '',
  idade: null,
  responsavel: '',
  endereco: '',
  telefone: '',
  sala_id: null
})

async function carregarSalas() {
  loadingSalas.value = true
  try {
    const r = await api.getSalas()
    salas.value = r.data || []
  } catch (e) { console.error(e) }
  finally { loadingSalas.value = false }
}

watch(() => props.aluno, (novo) => {
  if (novo) {
    form.nome = novo.nome || ''
    form.idade = novo.idade || null
    form.responsavel = novo.responsavel || ''
    form.endereco = novo.endereco || ''
    form.telefone = novo.telefone || ''
    form.sala_id = novo.sala_id || null
  } else {
    resetForm()
  }
}, { immediate: true })

// Carregar salas quando o diálogo abrir
watch(dialogVisible, (v) => { if (v) carregarSalas() })

function resetForm() {
  form.nome = ''
  form.idade = null
  form.responsavel = ''
  form.endereco = ''
  form.telefone = ''
  form.sala_id = null
}

function fechar() {
  emit('update:modelValue', false)
  resetForm()
}

async function salvar() {
  if (!valid.value) return

  loading.value = true
  try {
    const payload = {
      nome: form.nome,
      idade: form.idade ? parseInt(form.idade) : null,
      responsavel: form.responsavel || null,
      endereco: form.endereco || null,
      telefone: form.telefone || null,
      sala_id: form.sala_id || null
    }

    if (editando.value) {
      await api.updateAluno(props.aluno.id, payload)
    } else {
      await api.createAluno(payload)
    }

    emit('saved')
    fechar()
  } catch (error) {
    console.error('Erro ao salvar aluno:', error)
    alert('Erro ao salvar aluno. Verifique os dados e tente novamente.')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.form-header {
  background: linear-gradient(135deg, #8B4513 0%, #5C2E0A 100%);
}

.aluno-form-card {
  border: 1px solid rgba(255, 215, 0, 0.3);
}

.save-btn {
  background: linear-gradient(135deg, #8B4513 0%, #5C2E0A 100%) !important;
  border: none;
}

.save-btn:hover {
  background: linear-gradient(135deg, #A0522D 0%, #8B4513 100%) !important;
}
</style>