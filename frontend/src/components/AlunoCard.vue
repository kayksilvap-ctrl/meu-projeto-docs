<template>
  <v-hover v-slot="{ isHovering, props: hoverProps }">
    <v-card
      v-bind="hoverProps"
      :class="['aluno-card', { 'elevated-card': isHovering }]"
      :elevation="isHovering ? 6 : 2"
    >
      <v-card-text class="pa-3 pa-sm-4">
        <v-row align="center" no-gutters>
          <!-- Aluno Info -->
          <v-col cols="12" sm="6" md="5" class="d-flex align-center mb-2 mb-sm-0">
            <v-avatar :color="avatarColor" size="40" class="mr-3">
              <span class="text-white font-weight-bold">{{ inicial }}</span>
            </v-avatar>
            <div class="min-width-0">
              <div class="font-weight-bold text-truncate" style="color: #8B4513; font-size: 1rem;">
                {{ aluno.nome }}
              </div>
              <div class="text-caption text-grey">
                <v-icon size="14" class="mr-1">mdi-calendar</v-icon>
                {{ aluno.idade ? `${aluno.idade} anos` : 'Idade não informada' }}
                <span v-if="aluno.responsavel" class="ml-2">
                  <v-icon size="14" class="mr-1">mdi-account-star</v-icon>
                  {{ aluno.responsavel }}
                </span>
              </div>
            </div>
          </v-col>

          <!-- Endereço -->
          <v-col cols="12" sm="6" md="3" class="text-caption text-grey mb-2 mb-sm-0">
            <div class="d-flex align-center">
              <v-icon size="14" class="mr-1">mdi-map-marker</v-icon>
              <span class="text-truncate d-inline-block" style="max-width: 140px;">
                {{ aluno.endereco || 'Endereço não informado' }}
              </span>
            </div>
          </v-col>

          <!-- Status + Actions -->
          <v-col cols="12" md="4" class="text-center text-md-right">
            <div class="d-flex align-center justify-sm-start justify-md-end flex-wrap ga-1">
              <!-- Status atual -->
              <v-chip
                v-if="aluno.status"
                :color="aluno.status === 'presente' ? 'success' : 'error'"
                size="small"
                class="mr-2"
                label
              >
                <v-icon start size="14">
                  {{ aluno.status === 'presente' ? 'mdi-check-circle' : 'mdi-close-circle' }}
                </v-icon>
                {{ aluno.status === 'presente' ? 'Presente' : 'Ausente' }}
              </v-chip>

              <!-- Botões Presente / Ausente -->
              <div class="d-flex ga-1">
                <v-btn
                  :color="aluno.status === 'presente' ? '#2E7D32' : 'grey lighten-2'"
                  :variant="aluno.status === 'presente' ? 'flat' : 'outlined'"
                  :icon="aluno.status === 'presente'"
                  size="small"
                  class="btn-presenca"
                  @click="marcar('presente')"
                  :loading="carregando === 'presente'"
                >
                  <v-icon :color="aluno.status === 'presente' ? 'white' : '#2E7D32'">mdi-check</v-icon>
                  <v-tooltip activator="parent" location="top">Presente</v-tooltip>
                </v-btn>

                <v-btn
                  :color="aluno.status === 'ausente' ? '#C62828' : 'grey lighten-2'"
                  :variant="aluno.status === 'ausente' ? 'flat' : 'outlined'"
                  :icon="aluno.status === 'ausente'"
                  size="small"
                  class="btn-presenca"
                  @click="marcar('ausente')"
                  :loading="carregando === 'ausente'"
                >
                  <v-icon :color="aluno.status === 'ausente' ? 'white' : '#C62828'">mdi-close</v-icon>
                  <v-tooltip activator="parent" location="top">Ausente</v-tooltip>
                </v-btn>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-hover>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  aluno: { type: Object, required: true }
})

const emit = defineEmits(['registrar'])

const carregando = ref(null)

const colors = ['#8B4513', '#A0522D', '#5C2E0A', '#D2691E', '#CD853F', '#8B7355']
const avatarColor = computed(() => {
  const index = (props.aluno.nome?.length || 0) % colors.length
  return colors[index]
})

const inicial = computed(() => {
  return props.aluno.nome?.charAt(0)?.toUpperCase() || '?'
})

async function marcar(status) {
  carregando.value = status
  emit('registrar', { aluno_id: props.aluno.id, status })
  // Pequeno delay para feedback visual
  setTimeout(() => {
    carregando.value = null
  }, 300)
}
</script>

<style scoped>
.aluno-card {
  transition: all 0.3s ease;
  border-left: 3px solid #FFD700;
  border-radius: 8px !important;
  background: white;
}

.aluno-card:hover {
  border-left-color: #8B4513;
}

.elevated-card {
  transform: translateY(-2px);
}

.btn-presenca {
  transition: all 0.3s ease;
  min-width: 36px;
  height: 36px;
}

.btn-presenca:hover {
  transform: scale(1.1);
}

.min-width-0 {
  min-width: 0;
  flex: 1;
}

.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>