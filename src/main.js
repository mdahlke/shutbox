import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import {INITIALISE_STORE} from './mutations';
Vue.config.productionTip = false

new Vue({
  router,
  store,
  beforeCreate() {
    let storeDataObj;
    let storeData = localStorage.getItem('store');
    
    if (storeData) {
      storeDataObj = JSON.parse(storeData);
      store.commit(INITIALISE_STORE, storeDataObj);
    }
    
  },
  render: h => h(App)
}).$mount('#app')
