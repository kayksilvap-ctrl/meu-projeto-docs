import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', component: () => import('../views/DashboardView.vue'), meta: { title: 'Dashboard' } },
  { path: '/criancas', component: () => import('../views/CriancasView.vue'), meta: { title: 'Crianças' } },
  { path: '/responsaveis', component: () => import('../views/ResponsaveisView.vue'), meta: { title: 'Responsáveis' } },
  { path: '/turmas', component: () => import('../views/TurmasView.vue'), meta: { title: 'Turmas' } },
  { path: '/fazer-chamada', component: () => import('../views/FazerChamadaView.vue'), meta: { title: 'Fazer Chamada' } },
  { path: '/frequencia', component: () => import('../views/FrequenciaView.vue'), meta: { title: 'Frequência' } },
  { path: '/resumo', component: () => import('../views/ResumoTurmaView.vue'), meta: { title: 'Resumo por Turma' } },
  { path: '/relatorios', component: () => import('../views/RelatoriosView.vue'), meta: { title: 'Relatórios' } },
  { path: '/configuracoes', component: () => import('../views/ConfiguracoesView.vue'), meta: { title: 'Configurações' } },
]

const router = createRouter({ history: createWebHistory(), routes })
router.beforeEach((to) => { document.title = `${to.meta.title} | Anjo da Guarda` })

export default router