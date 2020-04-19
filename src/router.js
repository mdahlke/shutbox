import Vue from 'vue'
import Router from 'vue-router'
import GameBoard from './views/GameBoard.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'GameBoard',
      component: GameBoard
    },
  ]
})
