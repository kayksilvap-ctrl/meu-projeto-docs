import axios from 'axios'

// On Vercel, the backend service is at /_/backend/api
// On local dev, the Vite proxy forwards /api to localhost:3000
const baseURL = import.meta.env.VITE_API_BASE || '/api'

const http = axios.create({ baseURL, timeout: 10000 })

export { http }
export default {
  // Turmas
  getTurmas: () => http.get('/turmas'),
  createTurma: (d) => http.post('/turmas', d),
  updateTurma: (id, d) => http.put(`/turmas/${id}`, d),
  deleteTurma: (id) => http.delete(`/turmas/${id}`),

  // Crianças
  getCriancas: (params) => http.get('/criancas', { params }),
  getCrianca: (id) => http.get(`/criancas/${id}`),
  createCrianca: (d) => http.post('/criancas', d),
  updateCrianca: (id, d) => http.put(`/criancas/${id}`, d),
  deleteCrianca: (id) => http.delete(`/criancas/${id}`),

  // Frequências
  getFrequencias: (params) => http.get('/frequencias', { params }),
  registrarFrequencia: (d) => http.post('/frequencias', d),
  getDashboard: (params) => http.get('/frequencias/dashboard', { params }),
  getRelatorios: () => http.get('/frequencias/relatorios'),

  // Utilitários
  health: () => http.get('/health'),
  exportarDados: () => http.get('/export'),
  importarDados: (d) => http.post('/import', d),
  resetarDados: () => http.delete('/reset'),
  getEstatisticas: () => http.get('/estatisticas'),
}