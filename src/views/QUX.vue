<template>
  <div class="Matc">
    <LoginPage v-if="isGuest" :user="user" @login="onLogin"/>
    <div class="MatcContainer" v-else>
      <Header :user="user" @login="onLogin" @logout="onLogout" v-if="false"/>
      <router-view ></router-view>
    </div>
  </div>
</template>
<style lang="scss">
  @import "../style/matc.scss";
  @import "../style/qux.scss";
</style>
<style lang="sass">
  @import "../style/bulma.sass"
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
      if (this.$route.meta.isDarkHeader) {
				css.add(win.body(), 'MatcDarkHeaderPage')
			} else {
				css.remove(win.body(), 'MatcDarkHeaderPage')
			}
    }
  },
  async mounted() {
    this.logger = new Logger('QUX')
    this.user = await Services.getUserService().load()
    this.logger.log(-1, 'mounted', "locale: " + navigator.language)
    this.$root.$on('MatcLogout', (user) => {
        this.onLogout(user)
    })
  }
};
</script>
