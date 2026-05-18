import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import { INITIALISE_STORE } from './mutations'

const storeData = localStorage.getItem('store')
if (storeData) {
  store.commit(INITIALISE_STORE, JSON.parse(storeData))
}

createApp(App).use(router).use(store).mount('#app')
