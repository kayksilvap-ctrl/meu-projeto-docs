import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000
})

export default {
  // Salas
  getSalas() {
    return api.get('/salas')
  },
  getSala(id) {
    return api.get(`/salas/${id}`)
  },
  createSala(sala) {
    return api.post('/salas', sala)
  },
  updateSala(id, sala) {
    return api.put(`/salas/${id}`, sala)
  },
  deleteSala(id) {
    return api.delete(`/salas/${id}`)
  },

  // Alunos
  getAlunos(query = '', sala_id = '') {
    const params = {}
    if (query) params.q = query
    if (sala_id) params.sala_id = sala_id
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
  getChamada(data, sala_id = '') {
    const params = { data }
    if (sala_id) params.sala_id = sala_id
    return api.get('/chamadas', { params })
  },
  registrarChamada(aluno_id, data, status) {
    return api.post('/chamadas', { aluno_id, data, status })
  },

  // Dashboard
  getDashboard(data, sala_id = '') {
    const params = { data }
    if (sala_id) params.sala_id = sala_id
    return api.get('/chamadas/dashboard', { params })
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

  // Health
  healthCheck() {
    return api.get('/health')
  }
}