import Vue from 'vue'
import App from './App.vue'
import router from './router'
import VueI18n from 'vue-i18n'

Vue.use(VueI18n)
Vue.config.productionTip = false

new Vue({
  router,
  i18n: new VueI18n({
    locale: navigator.language,
    fallbackLocale: 'en',
    messages: {
      'en': require('./nls/en.json'),
      'cn': require('./nls/cn.json'),
    }
  }),
  render: h => h(App)
}).$mount('#app')
