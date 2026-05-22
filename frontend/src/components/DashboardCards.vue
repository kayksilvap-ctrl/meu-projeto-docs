<template>
  <v-row>
    <v-col cols="12" sm="6" md="3">
      <v-hover v-slot="{ isHovering, props }">
        <v-card
          v-bind="props"
          :class="['dashboard-card', { 'card-hover': isHovering }]"
          :elevation="isHovering ? 8 : 3"
        >
          <v-card-text class="pa-4">
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption text-grey font-weight-medium">Total de Alunos</div>
                <div class="text-h4 font-weight-bold card-value mt-1">
                  {{ animatedValue(dados.total_alunos) }}
                </div>
              </div>
              <v-avatar color="primary" size="50" class="card-icon">
                <v-icon color="white" size="28">mdi-account-group</v-icon>
              </v-avatar>
            </div>
          </v-card-text>
          <v-progress-linear
            :model-value="100"
            color="#FFD700"
            height="3"
          ></v-progress-linear>
        </v-card>
      </v-hover>
    </v-col>

    <v-col cols="12" sm="6" md="3">
      <v-hover v-slot="{ isHovering, props }">
        <v-card
          v-bind="props"
          :class="['dashboard-card', { 'card-hover': isHovering }]"
          :elevation="isHovering ? 8 : 3"
        >
          <v-card-text class="pa-4">
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption text-grey font-weight-medium">Presentes Hoje</div>
                <div class="text-h4 font-weight-bold mt-1" style="color: #2E7D32;">
                  {{ animatedValue(dados.presentes) }}
                </div>
              </div>
              <v-avatar color="success" size="50" class="card-icon">
                <v-icon color="white" size="28">mdi-check-circle</v-icon>
              </v-avatar>
            </div>
          </v-card-text>
          <v-progress-linear
            :model-value="dados.total_alunos > 0 ? (dados.presentes / dados.total_alunos) * 100 : 0"
            color="success"
            height="3"
          ></v-progress-linear>
        </v-card>
      </v-hover>
    </v-col>

    <v-col cols="12" sm="6" md="3">
      <v-hover v-slot="{ isHovering, props }">
        <v-card
          v-bind="props"
          :class="['dashboard-card', { 'card-hover': isHovering }]"
          :elevation="isHovering ? 8 : 3"
        >
          <v-card-text class="pa-4">
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption text-grey font-weight-medium">Ausentes Hoje</div>
                <div class="text-h4 font-weight-bold mt-1" style="color: #C62828;">
                  {{ animatedValue(dados.ausentes) }}
                </div>
              </div>
              <v-avatar color="error" size="50" class="card-icon">
                <v-icon color="white" size="28">mdi-close-circle</v-icon>
              </v-avatar>
            </div>
          </v-card-text>
          <v-progress-linear
            :model-value="dados.total_alunos > 0 ? (dados.ausentes / dados.total_alunos) * 100 : 0"
            color="error"
            height="3"
          ></v-progress-linear>
        </v-card>
      </v-hover>
    </v-col>

    <v-col cols="12" sm="6" md="3">
      <v-hover v-slot="{ isHovering, props }">
        <v-card
          v-bind="props"
          :class="['dashboard-card', { 'card-hover': isHovering }]"
          :elevation="isHovering ? 8 : 3"
        >
          <v-card-text class="pa-4">
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption text-grey font-weight-medium">Taxa de Presença</div>
                <div class="text-h4 font-weight-bold mt-1" style="color: #8B4513;">
                  {{ animatedValue(dados.taxa_presenca) }}%
                </div>
              </div>
              <v-avatar color="#FFD700" size="50" class="card-icon">
                <v-icon color="#8B4513" size="28">mdi-percent</v-icon>
              </v-avatar>
            </div>
          </v-card-text>
          <v-progress-linear
            :model-value="dados.taxa_presenca"
            color="#8B4513"
            height="3"
          ></v-progress-linear>
        </v-card>
      </v-hover>
    </v-col>
  </v-row>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  dados: {
    type: Object,
    default: () => ({
      total_alunos: 0,
      presentes: 0,
      ausentes: 0,
      taxa_presenca: 0
    })
  }
})

const animatedValues = ref({
  total_alunos: 0,
  presentes: 0,
  ausentes: 0,
  taxa_presenca: 0
})

watch(() => props.dados, (novos) => {
  animateValue('total_alunos', novos.total_alunos)
  animateValue('presentes', novos.presentes)
  animateValue('ausentes', novos.ausentes)
  animateValue('taxa_presenca', novos.taxa_presenca)
}, { immediate: true })

function animateValue(key, target) {
  const start = animatedValues.value[key]
  const duration = 800
  const startTime = performance.now()

  function update(currentTime) {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3) // easeOutCubic
    const current = Math.round(start + (target - start) * eased)

    animatedValues.value[key] = current

    if (progress < 1) {
      requestAnimationFrame(update)
    }
  }

  requestAnimationFrame(update)
}

function animatedValue(key) {
  return animatedValues.value[key]
}
</script>

<style scoped>
.dashboard-card {
  border-radius: 12px !important;
  transition: all 0.3s ease;
  border-top: 3px solid #FFD700;
  overflow: hidden;
}

.card-hover {
  transform: translateY(-4px);
}

.card-icon {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card-value {
  transition: all 0.3s ease;
}

.text-h4 {
  font-family: 'Montserrat', sans-serif;
}
</style>