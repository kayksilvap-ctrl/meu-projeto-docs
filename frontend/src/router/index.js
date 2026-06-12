import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import CriancasView from '../views/CriancasView.vue'
import TurmasView from '../views/TurmasView.vue'
import FrequenciaView from '../views/FrequenciaView.vue'
import ResumoTurmaView from '../views/ResumoTurmaView.vue'
import RelatoriosView from '../views/RelatoriosView.vue'
import ConfiguracoesView from '../views/ConfiguracoesView.vue'

const routes = [
  { path: '/', component: DashboardView, meta: { title: 'Dashboard' } },
  { path: '/criancas', component: CriancasView, meta: { title: 'Crianças' } },
  { path: '/responsaveis', component: CriancasView, meta: { title: 'Responsáveis' } },
  { path: '/turmas', component: TurmasView, meta: { title: 'Turmas' } },
  { path: '/frequencia', component: FrequenciaView, meta: { title: 'Frequência' } },
  { path: '/resumo', component: ResumoTurmaView, meta: { title: 'Resumo por Turma' } },
  { path: '/relatorios', component: RelatoriosView, meta: { title: 'Relatórios' } },
  { path: '/configuracoes', component: ConfiguracoesView, meta: { title: 'Configurações' } },
]

const router = createRouter({ history: createWebHistory(), routes })
router.beforeEach((to) => { document.title = `${to.meta.title} | Anjo da Guarda` })

export default router