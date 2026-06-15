<template>
  <v-dialog v-model="dialogVisible" max-width="700">
    <v-card>
      <v-card-title class="form-header pa-4">
        <v-icon color="#FFD700" size="28" class="mr-2">mdi-chart-bar</v-icon>
        <span class="text-white font-weight-bold">Estatísticas</span>
        <v-spacer></v-spacer>
        <v-btn icon variant="text" color="white" @click="fechar" size="small">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text class="pa-4" v-if="carregando">
        <div class="d-flex justify-center pa-8">
          <v-progress-circular indeterminate color="#8B4513" size="48"></v-progress-circular>
        </div>
      </v-card-text>

      <v-card-text class="pa-4" v-else-if="erro">
        <v-alert type="error" variant="tonal">
          Erro ao carregar estatísticas. Verifique se há chamadas registradas.
        </v-alert>
      </v-card-text>

      <v-card-text class="pa-4" v-else>
        <!-- Resumo -->
        <v-row class="mb-4">
          <v-col cols="6" sm="4">
            <div class="text-center pa-3 rounded-lg" style="background: #FFF8DC;">
              <div class="text-h5 font-weight-bold" style="color: #8B4513;">{{ stats.media_presenca }}%</div>
              <div class="text-caption text-grey">Média de Presença (30 dias)</div>
            </div>
          </v-col>
          <v-col cols="6" sm="4">
            <div class="text-center pa-3 rounded-lg" style="background: #E8F5E9;">
              <div class="text-h5 font-weight-bold" style="color: #2E7D32;">{{ stats.total_presentes }}</div>
              <div class="text-caption text-grey">Total Presenças</div>
            </div>
          </v-col>
          <v-col cols="6" sm="4">
            <div class="text-center pa-3 rounded-lg" style="background: #FFEBEE;">
              <div class="text-h5 font-weight-bold" style="color: #C62828;">{{ stats.total_ausentes }}</div>
              <div class="text-caption text-grey">Total Ausências</div>
            </div>
          </v-col>
        </v-row>

        <v-divider class="mb-4"></v-divider>

        <!-- Gráfico de barras simples -->
        <h3 class="font-weight-bold mb-3" style="color: #8B4513;">
          <v-icon color="#FFD700" class="mr-1">mdi-chart-timeline-variant</v-icon>
          Últimos 30 Dias
        </h3>

        <div class="chart-container pa-3" v-if="stats.dias && stats.dias.length > 0">
          <div class="d-flex align-end" style="height: 150px; gap: 3px;">
            <div
              v-for="(dia, idx) in stats.dias"
              :key="idx"
              class="bar-group d-flex flex-column align-center"
              style="flex: 1; min-width: 0;"
            >
              <div class="d-flex ga-1 w-100 justify-center">
                <div
                  class="bar-presente rounded-t"
                  :style="{ height: calcularAltura(dia.presentes, 'presente') + 'px' }"
                  :title="`${dia.data}: ${dia.presentes} presentes`"
                ></div>
                <div
                  class="bar-ausente rounded-t"
                  :style="{ height: calcularAltura(dia.ausentes, 'ausente') + 'px' }"
                  :title="`${dia.data}: ${dia.ausentes} ausentes`"
                ></div>
              </div>
              <div class="text-caption text-grey mt-1" style="font-size: 0.55rem; writing-mode: vertical-lr;" v-if="stats.dias.length <= 15">
                {{ formatarData(dia.data) }}
              </div>
            </div>
          </div>
          <div class="d-flex justify-center mt-2 ga-4">
            <div class="d-flex align-center">
              <div class="bar-legend presente mr-1"></div>
              <span class="text-caption">Presente</span>
            </div>
            <div class="d-flex align-center">
              <div class="bar-legend ausente mr-1"></div>
              <span class="text-caption">Ausente</span>
            </div>
          </div>
        </div>

        <div v-else class="text-center pa-6 text-grey">
          <v-icon size="48" class="mb-2">mdi-chart-bar-off</v-icon>
          <p>Nenhum dado de chamada nos últimos 30 dias.</p>
          <p class="text-caption">Registre chamadas para ver as estatísticas.</p>
        </div>
      </v-card-text>

      <v-card-actions class="pa-4 bg-grey-lighten-4">
        <v-spacer></v-spacer>
        <v-btn variant="text" color="grey" @click="fechar">Fechar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import api from '../api'

const props = defineProps({
  modelValue: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue'])

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const stats = ref({
  media_presenca: 0,
  total_presentes: 0,
  total_ausentes: 0,
  dias: []
})
const carregando = ref(false)
const erro = ref(false)
const maxValor = ref(10)

function fechar() {
  emit('update:modelValue', false)
}

watch(dialogVisible, async (val) => {
  if (val) {
    await carregarEstatisticas()
  }
})

async function carregarEstatisticas() {
  carregando.value = true
  erro.value = false
  try {
    const response = await api.getEstatisticas()
    stats.value = response.data

    // Calcular altura máxima para o gráfico
    let max = 0
    if (stats.value.dias) {
      stats.value.dias.forEach(d => {
        const total = d.presentes + d.ausentes
        if (total > max) max = total
      })
    }
    maxValor.value = Math.max(max, 10)
  } catch (error) {
    console.error('Erro ao carregar estatísticas:', error)
    erro.value = true
  } finally {
    carregando.value = false
  }
}

function calcularAltura(valor, tipo) {
  const max = maxValor.value
  const ratio = max > 0 ? valor / max : 0
  return Math.max(ratio * 120, tipo === 'presente' ? 2 : 2)
}

function formatarData(dataStr) {
  if (!dataStr) return ''
  const parts = dataStr.split('-')
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}`
  }
  return dataStr
}
</script>

<style scoped>
.form-header {
  background: linear-gradient(135deg, #8B4513 0%, #5C2E0A 100%);
}

.chart-container {
  background: white;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.bar-group {
  transition: all 0.3s ease;
}

.bar-presente {
  background: linear-gradient(180deg, #4CAF50, #2E7D32);
  width: 100%;
  max-width: 12px;
  min-width: 4px;
  transition: height 0.5s ease;
  border: 1px solid rgba(0,0,0,0.1);
}

.bar-ausente {
  background: linear-gradient(180deg, #EF5350, #C62828);
  width: 100%;
  max-width: 12px;
  min-width: 4px;
  transition: height 0.5s ease;
  border: 1px solid rgba(0,0,0,0.1);
}

.bar-legend {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.bar-legend.presente {
  background: #4CAF50;
}

.bar-legend.ausente {
  background: #EF5350;
}

.rounded-lg {
  border-radius: 8px;
}
</style>