<template>
  <div class="Matc">
    <LoginPage v-if="isGuest" :user="user" @login="onLogin"/>
    <div class="MatcContainer" v-else>
      <Header :user="user" @login="onLogin" @logout="onLogout"/>
      <router-view></router-view>
    </div>
  </div>
</template>
<style>
  @import url("../../public/style/matc.css");
  @import url("../../public/style/qux.css");
</style>
<script>
import LoginPage from 'views/LoginPage'
import Header from 'views/Header'
import Services from 'services/Services'
import Logger from 'common/Logger'
import win from 'dojo/win'
import css from 'dojo/css'

export default {
  name: "home",
  mixins: [],
 data: function() {
    return {     
      user: {
        id: -1,
        name: "Guest",
        email: "guest@quant-ux.com",
        role: "guest",
        lastlogin: 0,
        lastNotification: 0,
        tos: false,
        paidUntil: 0,
        plan: "Free"
      }
    }
  },
  components: {
    'Header': Header,
    'LoginPage': LoginPage
  },
  computed: {
    isGuest () {
      return this.user.role === 'guest'
    }
  },
  methods: {
    onLogin (user) {
      this.user = user
      this.logger.info('onLogin', 'exit >> ' + this.user.email)
    },
    onLogout (guest) {
      this.user = guest
      this.logger.info('onLogin', 'exit >> ' + this.user.email)
    },
    scrollTop () {
      window.scrollTo(0,0)
    },
  },
  watch :{
    '$route' () {
      css.remove(win.body(), 'MatcPublic')
      css.remove(win.body(), 'MatcVisualEditor')
      css.remove(win.body(), 'MatcLight')
      this.scrollTop()
    }
  },
  async mounted() {
    this.logger = new Logger('MATC')
    this.user = Services.getUserService().load()
    this.logger.info('mounted', 'exit >> ' + this.user.email)
    this.$root.$on('MatcLogout', (user) => {
				this.onLogout(user)
		})
  }
};
</script>
