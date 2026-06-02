<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Configurações</h1>
        <p class="page-subtitle">Configurações gerais do sistema</p>
      </div>
    </div>

    <div class="config-grid">
      <div class="card">
        <h3 class="card-title">Informações do Sistema</h3>
        <div class="config-item"><span>Nome</span><span>Associação Anjo da Guarda</span></div>
        <div class="config-item"><span>Versão</span><span>2.0.0</span></div>
        <div class="config-item"><span>Backend</span><span>Node.js + Express + SQLite</span></div>
        <div class="config-item"><span>Frontend</span><span>Vue 3 + Chart.js</span></div>
      </div>

      <div class="card">
        <h3 class="card-title">Dados</h3>
        <button class="btn-danger" @click="resetar" :disabled="resetando">
          {{ resetando ? 'Resetando...' : '🗑️ Resetar Todos os Dados' }}
        </button>
        <p class="text-secondary mt-2" style="font-size:0.8rem">Remove permanentemente todos os cadastros e registros de frequência.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const resetando = ref(false)

async function resetar() {
  if (!confirm('⚠️ ATENÇÃO: Todos os dados serão apagados permanentemente.\n\nTem certeza?')) return
  resetando.value = true
  try {
    await axios.delete('http://localhost:3000/api/turmas/reset').catch(() => {})
    alert('Dados resetados com sucesso!')
  } catch { alert('Erro ao resetar.') }
  finally { resetando.value = false }
}
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.page-title { font-size: 1.5rem; font-weight: 700; color: var(--text); }
.page-subtitle { font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px; }
.config-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; max-width: 800px; }
@media (max-width: 768px) { .config-grid { grid-template-columns: 1fr; } }
.card { background: white; border-radius: var(--radius); padding: 24px; box-shadow: var(--shadow); }
.card-title { font-size: 0.9rem; font-weight: 600; color: var(--text); margin-bottom: 16px; }
.config-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #F3F4F6; font-size: 0.85rem; }
.config-item span:last-child { font-weight: 500; }
.btn-danger { padding: 10px 20px; background: var(--red); color: white; border: none; border-radius: var(--radius-sm); font-weight: 600; font-size: 0.85rem; cursor: pointer; font-family: inherit; transition: var(--transition); }
.btn-danger:hover { background: var(--red-dark); }
.btn-danger:disabled { opacity: 0.6; cursor: not-allowed; }
.text-secondary { color: var(--text-secondary); }
.mt-2 { margin-top: 8px; }
</style>