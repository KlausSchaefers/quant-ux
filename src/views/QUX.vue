<template>
  <div class="Matc">
    <LoginPage v-if="isGuest" :user="user" @login="onLogin"/>
    <div class="MatcContainer" v-else>
      <QHeader :user="user" @login="onLogin" @logout="onLogout" v-if="hasHeader"/>
      <router-view  @logout="onLogout"></router-view>
    </div>
    <ErrorDialog ref="errorDialog"></ErrorDialog>
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
import ErrorDialog from 'common/ErrorDialog'
import win from 'dojo/win'
import css from 'dojo/css'

export default {
  name: "home",
  mixins: [],
 data: function() {
    return {
      hasHeader: false,
      isDebug: false,
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
    'QHeader': Header,
    'ErrorDialog': ErrorDialog,
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
      console.debug('onLogout', 'enter')
      this.user = guest
      this.logger.info('onLogout', 'exit >> ' + this.user.email)
    },
    scrollTop () {
      window.scrollTo(0,0)
    },
    initRoute() {
      css.remove(win.body(), 'MatcPublic')
      css.remove(win.body(), 'MatcVisualEditor')
      css.remove(win.body(), 'MatcLight')
      this.scrollTop()
      if (this.$route.meta.hasHeader === true) {
        this.hasHeader = true
			} else {
        this.hasHeader = false
			}
    },
    showErrorDetails (e, trace) {
      if (this.isDebug) {
        this.$refs.errorDialog.show(e, trace)
      }
    }
  },
  watch :{
    '$route' () {
      this.initRoute()
    }
  },
  async mounted() {
    this.logger = new Logger('QUX')
    Logger.setErrorCallback((e,trace) => this.showErrorDetails(e, trace))
    this.initRoute()
    this.user = await Services.getUserService().load()
    this.logger.log(-1, 'mounted', "locale: " + navigator.language)
    window.onerror = (message, source, lineno, colno, error) => {
      this.showErrorDetails(error, source)
      return true;
    };
    this.$root.$on('MatcLogout', (user) => {
        this.onLogout(user)
    })
  }
};
</script>
