import { createRouter, createWebHistory } from 'vue-router'
import GameBoard from './views/GameBoard.vue'

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'GameBoard',
      component: GameBoard
    }
  ]
})
