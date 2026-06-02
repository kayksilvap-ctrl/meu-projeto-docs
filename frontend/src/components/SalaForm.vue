<template>
  <v-dialog v-model="dialogVisible" max-width="480" persistent>
    <v-card class="sala-form-card">
      <div class="form-header pa-4 d-flex align-center">
        <v-icon color="#FFD700" size="24" class="mr-2">
          {{ editando ? 'mdi-pencil' : 'mdi-plus-circle' }}
        </v-icon>
        <span class="text-white font-weight-semibold">
          {{ editando ? 'Editar Sala' : 'Nova Sala' }}
        </span>
        <v-spacer></v-spacer>
        <v-btn icon variant="text" color="white" @click="fechar" size="small">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>

      <v-card-text class="pa-4">
        <v-form ref="formRef" v-model="valid" @submit.prevent="salvar">
          <v-text-field
            v-model="form.nome"
            label="Nome da Sala *"
            :rules="[v => !!v || 'Nome é obrigatório']"
            prepend-inner-icon="mdi-door-open"
            required
            clearable
            class="mb-3"
          ></v-text-field>

          <v-text-field
            v-model="form.professor"
            label="Professor(a) responsável"
            prepend-inner-icon="mdi-account-tie"
            clearable
            class="mb-3"
          ></v-text-field>

          <v-textarea
            v-model="form.descricao"
            label="Descrição (opcional)"
            prepend-inner-icon="mdi-note-text"
            rows="2"
            auto-grow
            clearable
          ></v-textarea>
        </v-form>
      </v-card-text>

      <div class="pa-4 pt-0 d-flex justify-end ga-2">
        <v-btn variant="tonal" color="grey" @click="fechar" size="small">Cancelar</v-btn>
        <v-btn
          :loading="loading"
          :disabled="!valid"
          color="#8B4513"
          class="save-btn text-white"
          @click="salvar"
          size="small"
        >
          <v-icon start size="18">{{ editando ? 'mdi-content-save' : 'mdi-plus' }}</v-icon>
          {{ editando ? 'Salvar' : 'Criar Sala' }}
        </v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import api from '../api'

const props = defineProps({
  modelValue: Boolean,
  sala: { type: Object, default: null }
})
const emit = defineEmits(['update:modelValue', 'saved'])

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})
const editando = computed(() => !!props.sala?.id)
const formRef = ref(null)
const valid = ref(false)
const loading = ref(false)

const form = reactive({ nome: '', professor: '', descricao: '' })

watch(() => props.sala, (s) => {
  if (s) { form.nome = s.nome || ''; form.professor = s.professor || ''; form.descricao = s.descricao || '' }
  else resetForm()
}, { immediate: true })

function resetForm() { form.nome = ''; form.professor = ''; form.descricao = '' }

function fechar() { emit('update:modelValue', false); resetForm() }

async function salvar() {
  if (!valid.value) return
  loading.value = true
  try {
    const payload = { nome: form.nome, professor: form.professor || null, descricao: form.descricao || null }
    if (editando.value) await api.updateSala(props.sala.id, payload)
    else await api.createSala(payload)
    emit('saved'); fechar()
  } catch (e) {
    console.error(e); alert('Erro ao salvar sala.')
  } finally { loading.value = false }
}
</script>

<style scoped>
.form-header { background: linear-gradient(135deg, #8B4513, #5C2E0A); border-radius: 4px 4px 0 0; }
.sala-form-card { border-radius: 12px; overflow: hidden; }
.save-btn { background: linear-gradient(135deg, #8B4513, #5C2E0A) !important; border: none; }
</style>