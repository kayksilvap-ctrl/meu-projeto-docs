import axios from 'axios'

const http = axios.create({ baseURL: '/api', timeout: 10000 })

// Se a API exigir token (API_TOKEN no backend), defina VITE_API_TOKEN no build do frontend
if (import.meta.env.VITE_API_TOKEN) {
  http.defaults.headers.common['x-api-token'] = import.meta.env.VITE_API_TOKEN
}

export { http }
export default {
  getTurmas: () => http.get('/turmas'),
  createTurma: (d) => http.post('/turmas', d),
  updateTurma: (id, d) => http.put(`/turmas/${id}`, d),
  deleteTurma: (id) => http.delete(`/turmas/${id}`),
  getCriancas: (params) => http.get('/criancas', { params }),
  getCrianca: (id) => http.get(`/criancas/${id}`),
  createCrianca: (d) => http.post('/criancas', d),
  updateCrianca: (id, d) => http.put(`/criancas/${id}`, d),
  deleteCrianca: (id) => http.delete(`/criancas/${id}`),
  getFrequencias: (params) => http.get('/frequencias', { params }),
  registrarFrequencia: (d) => http.post('/frequencias', d),
  getDashboard: (params) => http.get('/frequencias/dashboard', { params }),
  getRelatorios: () => http.get('/frequencias/relatorios'),
  getResumoFrequencia: (params) => http.get('/frequencias/resumo', { params }),
  health: () => http.get('/health'),
  exportarDados: () => http.get('/export'),
  importarDados: (d) => http.post('/import', d),
  resetarDados: () => http.delete('/reset'),
  getEstatisticas: () => http.get('/estatisticas'),
}