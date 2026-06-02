<template>
  <v-hover v-slot="{ isHovering, props }">
    <v-card
      v-bind="props"
      :class="['aluno-card', { 'card-hover': isHovering }]"
      :elevation="isHovering ? 3 : 1"
    >
      <v-card-text class="pa-3 pa-sm-4">
        <v-row align="center" no-gutters>
          <v-col cols="12" sm="5" md="5" class="d-flex align-center mb-2 mb-sm-0">
            <v-avatar :color="avatarColor" size="38" class="mr-3">
              <span class="text-white font-weight-bold">{{ inicial }}</span>
            </v-avatar>
            <div style="min-width:0;flex:1">
              <div class="text-body-2 font-weight-semibold text-primary text-truncate">{{ aluno.nome }}</div>
              <div class="text-caption text-secondary">
                {{ aluno.idade ? `${aluno.idade} anos` : '' }}
                <span v-if="aluno.responsavel" class="ml-1">{{ aluno.responsavel }}</span>
              </div>
            </div>
          </v-col>
          <v-col cols="7" sm="4" md="3" class="text-caption text-secondary">
            <div class="d-flex align-center">
              <v-icon size="14" class="mr-1">mdi-map-marker</v-icon>
              <span class="text-truncate d-inline-block" style="max-width:120px">
                {{ aluno.endereco || '—' }}
              </span>
            </div>
          </v-col>
          <v-col cols="5" sm="3" md="4" class="text-right">
            <div class="d-flex align-center justify-end ga-1">
              <v-chip
                v-if="aluno.status"
                :color="aluno.status === 'presente' ? 'success' : 'error'"
                size="x-small" label class="mr-1"
              >
                {{ aluno.status === 'presente' ? 'Presente' : 'Ausente' }}
              </v-chip>
              <v-btn
                :color="aluno.status === 'presente' ? '#2E7D32' : 'grey lighten-3'"
                :variant="aluno.status === 'presente' ? 'flat' : 'outlined'"
                size="x-small" icon class="btn-presenca"
                @click="marcar('presente')"
              >
                <v-icon :color="aluno.status === 'presente' ? 'white' : '#2E7D32'" size="16">mdi-check</v-icon>
                <v-tooltip activator="parent">Presente</v-tooltip>
              </v-btn>
              <v-btn
                :color="aluno.status === 'ausente' ? '#C62828' : 'grey lighten-3'"
                :variant="aluno.status === 'ausente' ? 'flat' : 'outlined'"
                size="x-small" icon class="btn-presenca"
                @click="marcar('ausente')"
              >
                <v-icon :color="aluno.status === 'ausente' ? 'white' : '#C62828'" size="16">mdi-close</v-icon>
                <v-tooltip activator="parent">Ausente</v-tooltip>
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-hover>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({ aluno: { type: Object, required: true } })
const emit = defineEmits(['registrar'])

const carregando = ref(null)
const colors = ['var(--primary)','var(--primary-light)','#E91E63','#9C27B0','#FF5722','#795548']
const avatarColor = computed(() => colors[(props.aluno.nome?.length || 0) % colors.length])
const inicial = computed(() => props.aluno.nome?.charAt(0)?.toUpperCase() || '?')

async function marcar(status) {
  carregando.value = status
  emit('registrar', { aluno_id: props.aluno.id, status })
  setTimeout(() => { carregando.value = null }, 300)
}
</script>

<style scoped>
.aluno-card {
  border-radius: var(--radius-md) !important;
  border-left: 3px solid var(--secondary);
  transition: var(--transition);
}
.aluno-card:hover { border-left-color: var(--primary); }
.card-hover { transform: translateY(-1px); }
.btn-presenca { transition: var(--transition); min-width: 32px; height: 32px; }
.btn-presenca:hover { transform: scale(1.1); }
.text-truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
</style>