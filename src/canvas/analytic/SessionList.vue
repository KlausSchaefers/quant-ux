
<template>
  <div class="MatcToolbarSessionCntr MatcScrollContainer">
    <div class="MatcToolbarSessionList ">
      <div v-for="s in sortedSession" :key="s.id" class="MatcToobarRow MatcToolbarIconButton" 
        @click="toggleSession(s)" 
        @mouseout="onMouseOut(s, $event)"
        @dblclick="onEdit(s)"
        @mouseover="onMouseOver(s, $event)">
        <CheckBox :value="selected[s.session]"></CheckBox>
        <div class="MatcToolbarSessionLabels">
          <input 
            v-if="s.session === selectedSession" 
            class="MatcIgnoreOnKeyPress"
            :value="s.label" 
            @change="onChangeSessionLabel(s, $event)" 
            ref="sessionInput" 
            @click.stop>
          <span v-else>{{s.label}}</span>
          <div class="MatcToolbarSessionListDetails">
            <div>{{s.date}}</div>
            <div>{{s.duration}}s</div>
          </div>
        </div>
        <div class="MatcToobarRowRightIcon">
          <QIcon icon="PlayVideo" @click.stop="onPlay(s, $event)"/>
        </div>
      </div>
    </div>

  </div>
</template>
  

<style lang="scss">
@import "../../style/components/session_list.scss";
</style>
  
<script>
import DojoWidget from "dojo/DojoWidget";
import Logger from "common/Logger";
import CheckBox from 'common/CheckBox'
import QIcon from 'page/QIcon'

export default {
  name: "SessionList",
  props: [],
  mixins: [DojoWidget],
  data: function () {
    return {
      sessions: [],
      selected: {},
      order: 'date',
      selectedSession: ''
    };
  },
  components: {
    'CheckBox': CheckBox,
    'QIcon': QIcon
  },
  computed: {
    sortedSession() {
      const order = this.order
      return this.sessions.toSorted((a, b) => {
        if (order === 'duration') {
          return b.duration - a.duration
        }
        if (order === 'date') {
          return a.start - b.start
        }
        if (order === 'weirdness') {
          return b.weirdness - a.weirdness
        }
        return b.size - a.size
      })
    }
  },
  methods: {
    onChangeSessionLabel (s, e) {
      const label = e.target.value.trim()
      s.label = label
      this.selectedSession = false
      this.emit("label", s.session, label)
    },
    onEdit (s) {
      this.selectedSession = s.session
      setTimeout(() => {
        const input = this.$refs.sessionInput[0]
        if (input) {
          input.focus()
          input.select()
        }
      }, 100)
    },
    onPlay(s,e) {
      this.emit("play", s, e)
    },
    onMouseOver (s) {
      this.emit("hover",s)
    },
    onMouseOut () {
      this.emit("hover", null)
    },
    onChange () {
      this.emit("select", this.selected)
    },
    getSelected () {
      return this.selected
    },
    toggleSession (s) {
      this.$set(this.selected, s.session, !this.selected[s.session])
      this.$forceUpdate()
      this.onChange()
    },
    setSessions(s) {
      this.sessions = s
      this.sessions.forEach(s => {
          this.selected[s.session] = true
      })
      this.onChange()
    },
    setOrder (o) {
      this.order = o
    },
    setAllSelected(value) {
      this.sessions.forEach(s => {
          this.selected[s.session] = value
      })
      this.$forceUpdate()
      //this.onChange()
    }
  },
  mounted() {
    this.logger = new Logger("SessionList");
    this.logger.log(2, "constructor", "entry");
  },
};
</script>