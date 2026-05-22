import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
})

export default {
  // Alunos
  getAlunos(query = '') {
    const params = query ? { q: query } : {}
    return api.get('/alunos', { params })
  },

  getAluno(id) {
    return api.get(`/alunos/${id}`)
  },

  createAluno(aluno) {
    return api.post('/alunos', aluno)
  },

  updateAluno(id, aluno) {
    return api.put(`/alunos/${id}`, aluno)
  },

  deleteAluno(id) {
    return api.delete(`/alunos/${id}`)
  },

  // Chamadas
  getChamada(data) {
    return api.get('/chamadas', { params: { data } })
  },

  registrarChamada(aluno_id, data, status) {
    return api.post('/chamadas', { aluno_id, data, status })
  },

  // Dashboard
  getDashboard(data) {
    return api.get('/chamadas/dashboard', { params: { data } })
  },

  // Export/Import
  exportarDados() {
    return api.get('/chamadas/export')
  },

  importarDados(dados) {
    return api.post('/chamadas/import', dados)
  },

  // Estatísticas
  getEstatisticas() {
    return api.get('/chamadas/estatisticas')
  },

  // Reset
  resetarDados() {
    return api.delete('/chamadas/reset')
  },

  // Health check
  healthCheck() {
    return api.get('/health')
  }
}