<template>
  <div class="MatcPadding MatcDialog" id="">
    <h1>Big Data - {{ app.name }}</h1>

    <button @click="run()">Run ({{ loop }} / {{ sessionCount }})</button>
    <button @click="clear()">Cleat</button>
  </div>
</template>
  
<style lang="scss">
  @import "../style/matc.scss";
</style>
  
<script>
import Services from "services/Services";

export default {
  name: "home",
  mixins: [],
  data: function () {
    return {
      hash: '',
      app: {},
      loop: 0,
      sessionCount: 30,
      eventsPerSession: 350
    };
  },
  components: {
  },
  methods: {
    async clear () {

      const events = await Services.getModelService().findEvents(this.app.id)
      const sessions = new Set()
      events.forEach(e => sessions.add(e.session))

      sessions.forEach(async s => {
        await Services.getModelService().deleteEventsBySession(this.app.id, s)
      })

    },
    async run() {
      // let widgets = Object.values(this.app.widgets)
      let screens = Object.values(this.app.screens)
      let startScreen = screens.find(s => s.props.start === true)

      for (let s = 0; s < this.sessionCount; s++) {
        this.loop = s
        const eventsPerSession = 300 + Math.round(Math.random() * 100)
        const sessionID = 's' + s + new Date().getTime()
        const user = { id: 'u' + s, name: 'U' + s }
        this.send(sessionID, user, 'ScreenLoaded', startScreen.id, null, 0)
        this.send(sessionID, user, 'SessionStart', startScreen.id, null, 1)
        console.debug('---- Start Session ', s, eventsPerSession, '-------')

        for (let i = 0; i < eventsPerSession; i++) {
          const cLicksInScreen = Math.round(Math.random() * 20)
          const currentScreen = screens[Math.floor(Math.random() * screens.length)]
          this.send(sessionID, user, 'ScreenLoaded', currentScreen.id, null, 0)
          let promisses = []
          for (let c = 0; c < cLicksInScreen && i < eventsPerSession; c++) {
            i++
            const currentWidgetId = currentScreen.children[Math.floor(Math.random() * currentScreen.children.length)]
            let promise = this.send(sessionID, user, 'WidgetClick', currentScreen.id, currentWidgetId, i)
            promisses.push(promise)
          }

          await Promise.all(promisses)
        }
      }

      this.loop = 0


    },
    send(sessionId, user, type, screenID, widgetId, i) {
      let y = -1
      let x = 1
      if (widgetId) {
        const widget = this.app.widgets[widgetId]
        const screen = this.app.screens[screenID]
        const pos = {
          x: widget.x - screen.x + (widget.w / 2),
          y: widget.y - screen.y + (widget.h / 2)
        }

        x = Math.min(1, Math.round((pos.x / screen.w) * 1000) / 1000)
        y = Math.min(1, Math.round((pos.y / screen.h) * 1000) / 1000)

      }

      const now = new Date().getTime()
      const event = {
        session: sessionId,
        user: user,
        screen: screenID,
        widget: widgetId,
        time: now + i * 1000,
        type: type,
        y: y,
        x: x,
        scrollTop: 0,
        appID: this.app.id
      }

      return Services.getModelService().saveEvent(this.app.id, this.hash, event)
    },
    async loadApp() {
      this.app = await Services.getModelService().findAppByHash(this.hash)
    }
  },
  mounted() {
    this.loadApp()
  }
};
</script>
  