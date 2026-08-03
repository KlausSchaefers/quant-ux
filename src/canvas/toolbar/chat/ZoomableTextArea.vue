<template>
    <div :class="['MatcZoomableTextArea', {'MatcZoomableTextAreaMax': isMax}, {'MatcZoomableTextAreaDisabled': disabled}]">
        <div class="MatcZoomableTextAreaBackdrop" @click="close">
            <div :class="['MatcZoomableTextAreaIconInput  MatcToobarInputBorder' , {'MatcToobarInputFocus': hasFocus}]" @click.stop>
                <textarea class="MatcIgnoreOnKeyPress " 
                  @focus="hasFocus=true"
                  @blur="hasFocus=false"
                  @keyup.enter="onEnter" 
                  v-model="text" 
                  ref="textarea" 
                  :disabled="disabled">
                </textarea>
                <div class="MatcZoomableTextAreaCloseIcon" v-if="!disabled">
                  <QIcon icon="Maximize" @click.stop="show"  v-if="!isMax"/>
                  <QIcon icon="Minimize" @click.stop="close" v-else/>
                </div>

                <div class="MatcZoomableTextAreaActionIcons">
                  <QIcon icon="Settings" @click="onSettings"/>
                  <QIcon icon="Delete" @click="onClear" />
                  <div class="MatcZoomableTextAreaActionPopup" ref="cssModePopup">
                    <div :class="['MatcZoomableTextAreaActionPopupLabel', {'MatcZoomableTextAreaActionPopupLabelActive': showCssModeMenu}]" @click.stop="toggleCssModeMenu">
                      {{cssModeLabel}}
                    </div>
                    <ul class="MatcZoomableTextAreaActionPopupMenu" v-show="showCssModeMenu">
                      <li v-for="mode in cssModes"
                        :key="mode.value"
                        :class="{'MatcZoomableTextAreaActionPopupMenuItemActive': mode.value === cssMode}"
                        @click="selectCssMode(mode.value)">
                        {{mode.label}}
                      </li>
                    </ul>
                  </div>
                  <QIcon icon="ArrowUp" @click="onSend" />
              </div>
            </div>
        </div>
    </div>
        

</template>

<style lang="scss">
@import "../../../style/toolbar/zoomable_textarea.scss";
</style>

<script>

import QIcon from 'page/QIcon'
// import { IconWindowMaximize, IconWindowMinimize } from '@tabler/icons-vue';

export default {
  props: ['disabled', 'defaultMessage', 'cssMode'],
  emits: ['change', 'settings', 'clear', 'mode'],
  data() {
    return {
        hasFocus: false,
        text: '',
        isMax: false,
        showCssModeMenu: false,
        cssModes: [
            { label: "Wireframe Minimal", value: "wireframe_minimal" },
            { label: "Wireframe", value: "wireframe" },
            { label: "Creative", value: "creative" },
            { label: "Use Styles", value: 'dls' }
        ]
    }
  },
  components: {
    QIcon
    // IconWindowMaximize, IconWindowMinimize
  },
  computed: {
    cssModeLabel() {
      const found = this.cssModes.find(o => o.value === this.cssMode)
      if (found) {
        return found.label
      }
      return this.cssModes[0].label
    }
  },
  methods: {
    onSettings (e) {
      this.$emit('settings', e)
    },
    onClear () {
      this.$emit('clear')
    },
    toggleCssModeMenu () {
      this.showCssModeMenu = !this.showCssModeMenu
    },
    selectCssMode (mode) {
      this.$emit('mode', mode)
      this.showCssModeMenu = false
    },
    onDocumentClick (e) {
      if (this.showCssModeMenu && this.$refs.cssModePopup && !this.$refs.cssModePopup.contains(e.target)) {
        this.showCssModeMenu = false
      }
    },
    show() {
      this.isMax=true
      this.$refs.textarea.focus()
    },
    close() {
      this.isMax=false
      setTimeout(() => {
        this.$refs.textarea.focus()
      }, 50)
    },
    onEnter (e) {
        if (e.shiftKey) {
            return
        }
        this.isMax = false
        this.$refs.textarea.blur()
        this.onChange()
        this.showCssModeMenu = false
    },
    onSend() {
      this.text = this.text + '\n'
      this.onChange()
    },
    onChange () {
        this.$emit('change', this.text)
        this.text = ''
    }
  },
  watch: {
    
  },
  mounted() {
    if (this.defaultMessage) {
      this.text = this.defaultMessage
    }
    document.addEventListener('click', this.onDocumentClick)
  },
  beforeUnmount() {
    document.removeEventListener('click', this.onDocumentClick)
  }
}
</script>
