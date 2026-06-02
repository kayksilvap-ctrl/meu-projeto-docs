import axios from 'axios'
const api = axios.create({ baseURL: '/api', timeout: 10000 })

export default {
  // Turmas
  getTurmas: () => api.get('/turmas'),
  createTurma: (d) => api.post('/turmas', d),
  updateTurma: (id, d) => api.put(`/turmas/${id}`, d),
  deleteTurma: (id) => api.delete(`/turmas/${id}`),

  // Crianças
  getCriancas: (params) => api.get('/criancas', { params }),
  getCrianca: (id) => api.get(`/criancas/${id}`),
  createCrianca: (d) => api.post('/criancas', d),
  updateCrianca: (id, d) => api.put(`/criancas/${id}`, d),
  deleteCrianca: (id) => api.delete(`/criancas/${id}`),

  // Frequências
  getFrequencias: (params) => api.get('/frequencias', { params }),
  registrarFrequencia: (d) => api.post('/frequencias', d),
  getDashboard: (params) => api.get('/frequencias/dashboard', { params }),
  getRelatorios: () => api.get('/frequencias/relatorios'),

  // Health
  health: () => api.get('/health'),
}