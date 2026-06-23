<template>
  <div class="chamada-page">
    <!-- HEADER -->
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ etapa === 'selecao' ? 'Fazer Chamada' : etapa === 'chamando' ? `📋 Chamada: ${turmaSelecionada?.nome || ''}` : '✅ Chamada Finalizada' }}</h1>
        <p class="page-subtitle">
          {{ etapa === 'selecao' ? 'Selecione a turma e inicie a chamada do dia' :
             etapa === 'chamando' ? `Registre a presença das crianças — ${dataHoje}` :
             ` Chamada salva com sucesso!` }}
        </p>
      </div>
    </div>

    <!-- ETAPA 1: SELEÇÃO DE TURMA -->
    <div v-if="etapa === 'selecao'" class="step-selecao">
      <div class="card">
        <div class="card-body">
          <label class="field-label">Selecione a Turma</label>
          <div class="turma-grid">
            <button
              v-for="t in turmas"
              :key="t.id"
              class="turma-card"
              :class="{ selected: turmaSelecionada?.id === t.id }"
              @click="selecionarTurma(t)"
            >
              <div class="turma-emoji">🏫</div>
              <div class="turma-info">
                <div class="turma-nome">{{ t.nome }}</div>
                <div class="turma-prof">{{ t.professor || 'Sem professor' }}</div>
              </div>
              <div class="turma-count">{{ t.total_criancas || 0 }} alunos</div>
            </button>
          </div>
          <div v-if="!turmas.length" class="empty-state">
            <p>Nenhuma turma cadastrada. Cadastre turmas primeiro.</p>
          </div>

          <button class="btn-primary btn-lg" :disabled="!turmaSelecionada" @click="iniciarChamada">
            🚀 Iniciar Chamada
          </button>
        </div>
      </div>
    </div>

    <!-- ETAPA 2: REGISTRAR PRESENÇA -->
    <div v-if="etapa === 'chamando'" class="step-chamada">
      <!-- Info bar -->
      <div class="chamada-stats">
        <div class="stat-item stat-green">
          <span class="stat-value">{{ stats.presentes }}</span>
          <span class="stat-label">Presentes</span>
        </div>
        <div class="stat-item stat-orange">
          <span class="stat-value">{{ stats.justificadas }}</span>
          <span class="stat-label">Justificadas</span>
        </div>
        <div class="stat-item stat-red">
          <span class="stat-value">{{ stats.naoJustificadas }}</span>
          <span class="stat-label">Não Justif.</span>
        </div>
        <div class="stat-item stat-blue">
          <span class="stat-value">{{ stats.pendentes }}</span>
          <span class="stat-label">Pendentes</span>
        </div>
      </div>

      <!-- Lista de alunos -->
      <div class="alunos-grid">
        <div
          v-for="crianca in criancas"
          :key="crianca.id"
          class="aluno-card"
          :class="getStatusClass(crianca._status)"
        >
          <div class="aluno-header">
            <div class="aluno-avatar">{{ crianca.nome?.charAt(0) }}</div>
            <div class="aluno-dados">
              <div class="aluno-nome">{{ crianca.nome }}</div>
              <div class="aluno-info">
                {{ crianca.responsaveis?.[0]?.nome || 'Sem responsável' }} ·
                {{ crianca.responsaveis?.[0]?.telefone || crianca.responsaveis?.[0]?.whatsapp || 'Sem contato' }}
              </div>
            </div>
            <div v-if="crianca._status === 'presente'" class="aluno-status status-presente">✅ Presente</div>
            <div v-else-if="crianca._status === 'ausente_justificada'" class="aluno-status status-justificada">📋 Justif.</div>
            <div v-else-if="crianca._status === 'ausente_nao_justificada'" class="aluno-status status-falta">❌ Falta</div>
            <div v-else class="aluno-status status-pendente">⏳ Pendente</div>
          </div>

          <div class="aluno-actions">
            <button
              class="btn-presenca btn-presente"
              :class="{ active: crianca._status === 'presente' }"
              @click="marcar(crianca, 'presente')"
            >
              ✅ Presente
            </button>
            <button
              class="btn-presenca btn-justificada"
              :class="{ active: crianca._status === 'ausente_justificada' }"
              @click="marcar(crianca, 'ausente_justificada')"
            >
              📋 Justificada
            </button>
            <button
              class="btn-presenca btn-falta"
              :class="{ active: crianca._status === 'ausente_nao_justificada' }"
              @click="marcar(crianca, 'ausente_nao_justificada')"
            >
              ❌ Falta
            </button>
          </div>

          <div v-if="crianca._status === 'ausente_justificada'" class="motivo-input">
            <input
              v-model="crianca._motivo"
              placeholder="Motivo da falta..."
              class="motivo-field"
            />
          </div>

          <div v-if="crianca.endereco?.rua" class="aluno-endereco">
            📍 {{ crianca.endereco.rua }}, {{ crianca.endereco.numero || 'S/N' }}
            {{ crianca.endereco.bairro ? `- ${crianca.endereco.bairro}` : '' }}
          </div>
        </div>
      </div>

      <div class="chamada-footer">
        <button class="btn-secondary btn-lg" @click="cancelarChamada">← Cancelar</button>
        <div class="footer-info">
          <span>{{ stats.presentes + stats.justificadas + stats.naoJustificadas }} de {{ criancas.length }} registrados</span>
        </div>
        <button class="btn-primary btn-lg" @click="finalizarChamada" :disabled="stats.pendentes > 0 || salvando">
          {{ salvando ? '⏳ Salvando...' : '✅ Finalizar Chamada' }}
        </button>
      </div>
      <div v-if="stats.pendentes > 0" class="warning-msg">
        ⚠️ Ainda há {{ stats.pendentes }} criança(s) sem registro. Registre todas antes de finalizar.
      </div>
    </div>

    <!-- ETAPA 3: CONFIRMAÇÃO -->
    <div v-if="etapa === 'finalizado'" class="step-sucesso">
      <div class="card card-sucesso">
        <div class="sucesso-icon">✅</div>
        <h2 class="sucesso-title">Chamada Finalizada!</h2>
        <p class="sucesso-subtitle">Frequência do dia {{ dataHoje }} registrada com sucesso.</p>
        <div class="sucesso-stats">
          <div class="sucesso-stat"><span class="stat-num stat-num-green">{{ statsFinal.presentes }}</span> Presentes</div>
          <div class="sucesso-stat"><span class="stat-num stat-num-orange">{{ statsFinal.justificadas }}</span> Justificadas</div>
          <div class="sucesso-stat"><span class="stat-num stat-num-red">{{ statsFinal.naoJustificadas }}</span> Não Justificadas</div>
        </div>
        <div class="sucesso-actions">
          <button class="btn-primary btn-lg" @click="etapa = 'selecao'; turmaSelecionada = null">📅 Nova Chamada</button>
          <button class="btn-secondary btn-lg" @click="irParaFrequencia">📊 Ver Frequência</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api'

const router = useRouter()
const etapa = ref('selecao')
const turmas = ref([])
const criancas = ref([])
const turmaSelecionada = ref(null)
const salvando = ref(false)
const dataHoje = ref(new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Bahia' }))

const stats = computed(() => {
  const list = criancas.value
  return {
    presentes: list.filter(c => c._status === 'presente').length,
    justificadas: list.filter(c => c._status === 'ausente_justificada').length,
    naoJustificadas: list.filter(c => c._status === 'ausente_nao_justificada').length,
    pendentes: list.filter(c => !c._status).length
  }
})

const statsFinal = ref({ presentes: 0, justificadas: 0, naoJustificadas: 0 })

function getStatusClass(status) {
  if (status._status === 'presente') return 'card-presente'
  if (status._status === 'ausente_justificada') return 'card-justificada'
  if (status._status === 'ausente_nao_justificada') return 'card-falta'
  return ''
}

function selecionarTurma(t) {
  turmaSelecionada.value = t
}

async function iniciarChamada() {
  if (!turmaSelecionada.value) return
  try {
    // A API ja retorna responsaveis e enderecos (otimizado)
    const resp = await api.getCriancas({ turma_id: turmaSelecionada.value.id })
    const hojeISO = new Date().toISOString().split('T')[0]
    const freqResp = await api.getFrequencias({ data: hojeISO, turma_id: turmaSelecionada.value.id })

    const freqHoje = {}
    freqResp.data.forEach(f => { freqHoje[f.crianca_id] = f.status })

    criancas.value = resp.data.map(c => ({
      ...c,
      _status: freqHoje[c.id] || '',
      _motivo: ''
    }))

    etapa.value = 'chamando'
  } catch (e) {
    alert('Erro ao carregar crianças da turma.')
  }
}

function marcar(crianca, status) {
  crianca._status = status
  if (status !== 'ausente_justificada') crianca._motivo = ''
}

async function finalizarChamada() {
  if (stats.value.pendentes > 0 || salvando.value) return
  salvando.value = true

  const hojeISO = new Date().toISOString().split('T')[0]
  // guarda o resumo antes de trocar de etapa
  const resumo = {
    presentes: stats.value.presentes,
    justificadas: stats.value.justificadas,
    naoJustificadas: stats.value.naoJustificadas
  }

  try {
    // Salva TODAS as presenças em UM ÚNICO request (batch).
    // Com better-sqlite3 + transação, 30 inserts levam < 1ms.
    // Antes era 1 request por criança = 30 requests para 30 alunos.
    await api.registrarFrequenciaBatch({
      registros: criancas.value.map(c => ({
        crianca_id: c.id,
        data: hojeISO,
        status: c._status,
        motivo: c._motivo || undefined
      }))
    })

    statsFinal.value = resumo
    etapa.value = 'finalizado'
  } finally {
    salvando.value = false
  }
}

function cancelarChamada() {
  etapa.value = 'selecao'
  turmaSelecionada.value = null
  criancas.value = []
}

function irParaFrequencia() {
  router.push('/frequencia')
}

onMounted(async () => {
  try {
    const resp = await api.getTurmas()
    turmas.value = resp.data
  } catch {}
})
</script>

<style scoped>
.chamada-page { max-width: 1100px; margin: 0 auto; }

.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; flex-wrap: wrap; gap: 12px; }
.page-title { font-size: 1.5rem; font-weight: 700; color: var(--text); }
.page-subtitle { font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px; }

/* === ETAPA SELEÇÃO === */
.step-selecao .card { background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); padding: 32px; }
.card-body { display: flex; flex-direction: column; gap: 20px; }
.field-label { font-size: 0.9rem; font-weight: 600; color: var(--text); }

.turma-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; }
.turma-card {
  display: flex; align-items: center; gap: 14px; padding: 16px 20px;
  border: 2px solid #E5E7EB; border-radius: 12px; background: white;
  cursor: pointer; transition: all 0.2s ease; text-align: left; font-family: inherit;
}
.turma-card:hover { border-color: #3B82F6; background: #F8FAFF; }
.turma-card.selected { border-color: #E53935; background: #FFF5F5; box-shadow: 0 0 0 3px rgba(229,57,53,0.1); }
.turma-emoji { font-size: 2rem; }
.turma-info { flex: 1; min-width: 0; }
.turma-nome { font-size: 1rem; font-weight: 600; color: var(--text); }
.turma-prof { font-size: 0.78rem; color: var(--text-secondary); margin-top: 2px; }
.turma-count { font-size: 0.78rem; color: var(--text-secondary); white-space: nowrap; font-weight: 500; background: #F3F4F6; padding: 4px 10px; border-radius: 20px; }

/* === ETAPA CHAMADA === */
.chamada-stats { display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }
.stat-item { flex: 1; min-width: 100px; padding: 14px 16px; border-radius: 10px; text-align: center; }
.stat-green { background: #E8F5E9; }
.stat-orange { background: #FFF8E1; }
.stat-red { background: #FFEBEE; }
.stat-blue { background: #E3F2FD; }
.stat-value { font-size: 1.5rem; font-weight: 700; display: block; }
.stat-label { font-size: 0.75rem; font-weight: 500; margin-top: 2px; display: block; }
.stat-green .stat-value { color: #22C55E; } .stat-green .stat-label { color: #16A34A; }
.stat-orange .stat-value { color: #F59E0B; } .stat-orange .stat-label { color: #D97706; }
.stat-red .stat-value { color: #E53935; } .stat-red .stat-label { color: #C62828; }
.stat-blue .stat-value { color: #3B82F6; } .stat-blue .stat-label { color: #2563EB; }

.alunos-grid { display: grid; grid-template-columns: 1fr; gap: 12px; margin-bottom: 20px; }

.aluno-card {
  background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  padding: 16px 20px; border-left: 4px solid #E5E7EB; transition: all 0.2s ease;
}
.aluno-card.card-presente { border-left-color: #22C55E; background: #F0FDF4; }
.aluno-card.card-justificada { border-left-color: #F59E0B; background: #FFFBEB; }
.aluno-card.card-falta { border-left-color: #E53935; background: #FEF2F2; }

.aluno-header { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
.aluno-avatar {
  width: 40px; height: 40px; border-radius: 10px;
  background: linear-gradient(135deg, #E53935, #C62828);
  color: white; display: flex; align-items: center; justify-content: center;
  font-size: 1.1rem; font-weight: 700; flex-shrink: 0;
}
.aluno-dados { flex: 1; min-width: 0; }
.aluno-nome { font-size: 0.95rem; font-weight: 600; color: var(--text); }
.aluno-info { font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.aluno-status { font-size: 0.78rem; font-weight: 600; padding: 3px 10px; border-radius: 20px; white-space: nowrap; }
.status-presente { background: #DCFCE7; color: #16A34A; }
.status-justificada { background: #FEF3C7; color: #D97706; }
.status-falta { background: #FEE2E2; color: #DC2626; }
.status-pendente { background: #F3F4F6; color: #9CA3AF; }

.aluno-actions { display: flex; gap: 8px; flex-wrap: wrap; }
.btn-presenca {
  flex: 1; min-width: 100px; padding: 10px 14px; border: 2px solid #E5E7EB;
  border-radius: 10px; background: white; font-size: 0.82rem; font-weight: 500;
  cursor: pointer; transition: all 0.2s ease; font-family: inherit; text-align: center;
}
.btn-presente:hover { border-color: #22C55E; background: #F0FDF4; }
.btn-presente.active { border-color: #22C55E; background: #22C55E; color: white; }
.btn-justificada:hover { border-color: #F59E0B; background: #FFFBEB; }
.btn-justificada.active { border-color: #F59E0B; background: #F59E0B; color: white; }
.btn-falta:hover { border-color: #E53935; background: #FEF2F2; }
.btn-falta.active { border-color: #E53935; background: #E53935; color: white; }

.motivo-input { margin-top: 8px; }
.motivo-field {
  width: 100%; padding: 8px 14px; border: 1px solid #E5E7EB;
  border-radius: 8px; font-size: 0.82rem; font-family: inherit;
  outline: none; transition: border-color 0.2s;
}
.motivo-field:focus { border-color: #F59E0B; box-shadow: 0 0 0 3px rgba(245,158,11,0.1); }

.aluno-endereco { font-size: 0.75rem; color: var(--text-secondary); margin-top: 8px; padding-top: 8px; border-top: 1px solid #E5E7EB; }

.chamada-footer {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px; background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  gap: 12px; flex-wrap: wrap;
}
.footer-info { text-align: center; font-size: 0.82rem; color: var(--text-secondary); font-weight: 500; }

.warning-msg { margin-top: 8px; padding: 10px 16px; background: #FEF3C7; color: #92400E; border-radius: 8px; font-size: 0.82rem; font-weight: 500; text-align: center; }

/* === ETAPA SUCESSO === */
.card-sucesso { text-align: center; padding: 48px 32px; }
.sucesso-icon { font-size: 3.5rem; margin-bottom: 16px; }
.sucesso-title { font-size: 1.5rem; font-weight: 700; color: var(--text); margin-bottom: 8px; }
.sucesso-subtitle { font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 24px; }
.sucesso-stats { display: flex; justify-content: center; gap: 24px; margin-bottom: 32px; }
.sucesso-stat { text-align: center; font-size: 0.85rem; color: var(--text-secondary); }
.stat-num { font-size: 1.8rem; font-weight: 700; display: block; margin-bottom: 4px; }
.stat-num-green { color: #22C55E; }
.stat-num-orange { color: #F59E0B; }
.stat-num-red { color: #E53935; }
.sucesso-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }

/* === BOTOES GLOBAIS === */
.btn-primary {
  padding: 12px 24px; background: #E53935; color: white; border: none;
  border-radius: 10px; font-weight: 600; font-size: 0.9rem;
  cursor: pointer; font-family: inherit; transition: all 0.2s ease;
}
.btn-primary:hover { background: #C62828; transform: translateY(-1px); }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
.btn-secondary {
  padding: 12px 24px; background: #F3F4F6; color: var(--text);
  border: 1px solid #E5E7EB; border-radius: 10px; font-weight: 500;
  font-size: 0.9rem; cursor: pointer; font-family: inherit; transition: all 0.2s ease;
}
.btn-secondary:hover { background: #E5E7EB; }
.btn-lg { padding: 14px 28px; font-size: 0.95rem; }

.empty-state { padding: 32px; text-align: center; color: var(--text-secondary); font-size: 0.9rem; }

/* === RESPONSIVO === */
@media (max-width: 960px) {
  .page-title { font-size: 1.2rem; }
  .chamada-stats { gap: 8px; }
  .stat-item { padding: 10px 12px; min-width: 80px; }
  .stat-value { font-size: 1.2rem; }
  .aluno-actions { flex-direction: column; }
  .btn-presenca { min-width: auto; }
  .sucesso-stats { gap: 16px; }
  .stat-num { font-size: 1.4rem; }
}
@media (max-width: 600px) {
  .turma-grid { grid-template-columns: 1fr; }
  .chamada-footer { flex-direction: column; }
  .btn-lg { width: 100%; }
}
</style>