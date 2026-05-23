import { createRouter, createWebHistory } from 'vue-router'
import GameBoard from './views/GameBoard.vue'
// import GameStats from 

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'GameBoard',
      component: GameBoard
    },
    {
      path: '/stats',
      name: 'Stats',
      component: () => import('./views/GameStats.vue')
    }
  ]
})
