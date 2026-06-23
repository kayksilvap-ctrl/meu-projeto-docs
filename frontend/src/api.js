import axios from 'axios'

const http = axios.create({ baseURL: '/api', timeout: 30000 })

if (import.meta.env.VITE_API_TOKEN) {
  http.defaults.headers.common['x-api-token'] = import.meta.env.VITE_API_TOKEN
}

// Response interceptor - global error handling
http.interceptors.response.use(
  response => response,
  error => {
    if (error.code === 'ECONNABORTED') {
      console.error('⚠️ Timeout da API - tente novamente')
    } else if (error.response?.status === 429) {
      console.error('⚠️ Muitas requisições - aguarde um momento')
    } else if (error.response?.status === 500) {
      console.error('⚠️ Erro interno do servidor')
    } else if (!error.response) {
      console.error('⚠️ Servidor indisponível')
    }
    return Promise.reject(error)
  }
)

export { http }
export default {
  getTurmas: () => http.get('/turmas'),
  createTurma: (d) => http.post('/turmas', d),
  updateTurma: (id, d) => http.put(`/turmas/${id}`, d),
  deleteTurma: (id) => http.delete(`/turmas/${id}`),
  getCriancas: (params) => http.get('/criancas', { params, timeout: 15000 }),
  getCrianca: (id) => http.get(`/criancas/${id}`),
  createCrianca: (d) => http.post('/criancas', d),
  updateCrianca: (id, d) => http.put(`/criancas/${id}`, d),
  deleteCrianca: (id) => http.delete(`/criancas/${id}`),
  getFrequencias: (params) => http.get('/frequencias', { params }),
  registrarFrequencia: (d) => http.post('/frequencias', d),
  registrarFrequenciaBatch: (d) => http.post('/frequencias/batch', d),
  getDashboard: (params) => http.get('/frequencias/dashboard', { params }),
  getRelatorios: () => http.get('/frequencias/relatorios'),
  getResumoFrequencia: (params) => http.get('/frequencias/resumo', { params }),
  health: () => http.get('/health'),
  exportarDados: () => http.get('/export'),
  importarDados: (d) => http.post('/import', d),
  resetarDados: () => http.delete('/reset'),
  getEstatisticas: () => http.get('/estatisticas'),
}