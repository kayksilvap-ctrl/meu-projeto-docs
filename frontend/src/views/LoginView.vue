<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-logo">
        <div class="logo-icon">🏛️</div>
        <h1 class="logo-title">Anjo da Guarda</h1>
        <p class="logo-subtitle">Gestão de Frequência</p>
      </div>

      <form @submit.prevent="entrar" class="login-form">
        <div class="form-group">
          <label>Email</label>
          <input
            v-model="email"
            type="email"
            placeholder="seu@email.com"
            required
            autocomplete="email"
          />
        </div>
        <div class="form-group">
          <label>Senha</label>
          <input
            v-model="senha"
            type="password"
            placeholder="********"
            required
            autocomplete="current-password"
          />
        </div>

        <div v-if="erro" class="login-erro">{{ erro }}</div>

        <button type="submit" class="btn-entrar" :disabled="loading">
          {{ loading ? '⏳ Entrando...' : '🔐 Entrar' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const email = ref('')
const senha = ref('')
const loading = ref(false)
const erro = ref('')

function entrar() {
  loading.value = true
  erro.value = ''

  // Simula 500ms de "autenticação"
  setTimeout(() => {
    if (email.value === 'admin@anjodaguarda.org' && senha.value === 'admin123') {
      localStorage.setItem('auth_user', JSON.stringify({
        nome: 'Administrador',
        email: 'admin@anjodaguarda.org',
        cargo: 'admin'
      }))
      router.push('/')
    } else {
      erro.value = '✉️ Email ou senha incorretos'
      loading.value = false
    }
  }, 500)
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #F0F2F5 0%, #E8ECF0 100%);
  padding: 20px;
}

.login-card {
  background: white;
  border-radius: 16px;
  padding: 40px 36px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.08);
}

.login-logo {
  text-align: center;
  margin-bottom: 32px;
}

.logo-icon {
  font-size: 3rem;
  margin-bottom: 12px;
}

.logo-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--red);
  margin: 0;
}

.logo-subtitle {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-top: 4px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.form-group input {
  padding: 12px 14px;
  border: 1px solid #E5E7EB;
  border-radius: 10px;
  font-size: 0.9rem;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s;
  background: #FAFAFA;
}

.form-group input:focus {
  border-color: var(--red);
  background: white;
  box-shadow: 0 0 0 3px rgba(229,57,53,0.08);
}

.login-erro {
  padding: 10px 14px;
  background: #FEF2F2;
  border: 1px solid #FEE2E2;
  border-radius: 8px;
  color: #DC2626;
  font-size: 0.82rem;
  text-align: center;
  font-weight: 500;
}

.btn-entrar {
  padding: 14px;
  background: var(--red);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: var(--transition);
  margin-top: 4px;
}

.btn-entrar:hover {
  background: var(--red-dark);
}

.btn-entrar:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>