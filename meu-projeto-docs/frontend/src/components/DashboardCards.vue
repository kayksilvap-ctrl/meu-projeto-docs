<template>
  <v-row>
    <v-col v-for="card in cards" :key="card.label" cols="6" lg="3">
      <v-hover v-slot="{ isHovering, props }">
        <v-card
          v-bind="props"
          :elevation="isHovering ? 3 : 1"
          :class="['dashboard-card', { 'card-hover': isHovering }]"
        >
          <v-card-text class="pa-4">
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption font-weight-medium text-secondary">{{ card.label }}</div>
                <div class="text-h4 font-weight-bold mt-1" :style="{ color: card.color }">
                  {{ animatedValue(card.key) }}{{ card.suffix || '' }}
                </div>
              </div>
              <v-avatar :color="card.bg" size="44" class="card-avatar" :style="{ border: '2px solid ' + card.color }">
                <v-icon :color="card.color" size="22">{{ card.icon }}</v-icon>
              </v-avatar>
            </div>
          </v-card-text>
          <div class="progress-track">
            <div class="progress-fill" :style="{ width: card.percent + '%', background: card.color }"></div>
          </div>
        </v-card>
      </v-hover>
    </v-col>
  </v-row>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  dados: { type: Object, default: () => ({ total_alunos: 0, presentes: 0, ausentes: 0, taxa_presenca: 0 }) }
})

const animated = ref({ total_alunos: 0, presentes: 0, ausentes: 0, taxa_presenca: 0 })

watch(() => props.dados, (v) => {
  Object.keys(v).forEach(key => animate(key, v[key]))
}, { immediate: true })

function animate(key, target) {
  const start = animated.value[key]
  const duration = 600
  const startTime = performance.now()
  function update(t) {
    const p = Math.min((t - startTime) / duration, 1)
    const eased = 1 - Math.pow(1 - p, 3)
    animated.value[key] = Math.round(start + (target - start) * eased)
    if (p < 1) requestAnimationFrame(update)
  }
  requestAnimationFrame(update)
}

function animatedValue(key) { return animated.value[key] }

const cards = computed(() => [
  { key: 'total_alunos', label: 'Total de Alunos', icon: 'mdi-account-group', color: 'var(--primary)', bg: 'var(--gold-light)', percent: 100, suffix: '' },
  { key: 'presentes', label: 'Presentes', icon: 'mdi-check-circle', color: '#2E7D32', bg: '#E8F5E9', percent: props.dados.total_alunos > 0 ? (props.dados.presentes / props.dados.total_alunos) * 100 : 0, suffix: '' },
  { key: 'ausentes', label: 'Ausentes', icon: 'mdi-close-circle', color: '#C62828', bg: '#FFEBEE', percent: props.dados.total_alunos > 0 ? (props.dados.ausentes / props.dados.total_alunos) * 100 : 0, suffix: '' },
  { key: 'taxa_presenca', label: 'Taxa de Presença', icon: 'mdi-percent', color: 'var(--primary)', bg: 'var(--gold-light)', percent: props.dados.taxa_presenca, suffix: '%' }
])
</script>

<style scoped>
.dashboard-card { border-radius: var(--radius-md) !important; transition: var(--transition); overflow: hidden; }
.card-hover { transform: translateY(-2px); }
.card-avatar { box-shadow: var(--shadow-sm); }
.progress-track { height: 3px; background: #eee; }
.progress-fill { height: 100%; transition: width 0.6s ease; }
</style>