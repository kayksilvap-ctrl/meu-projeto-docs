import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import AlunosView from '../views/AlunosView.vue'
import ChamadaView from '../views/ChamadaView.vue'
import SalasView from '../views/SalasView.vue'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: DashboardView,
    meta: { title: 'Dashboard' }
  },
  {
    path: '/salas',
    name: 'Salas',
    component: SalasView,
    meta: { title: 'Salas' }
  },
  {
    path: '/alunos',
    name: 'Alunos',
    component: AlunosView,
    meta: { title: 'Alunos' }
  },
  {
    path: '/chamada',
    name: 'Chamada',
    component: ChamadaView,
    meta: { title: 'Chamada Diária' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title || 'Sistema de Chamada'} | Anjo da Guarda`
  next()
})

export default router