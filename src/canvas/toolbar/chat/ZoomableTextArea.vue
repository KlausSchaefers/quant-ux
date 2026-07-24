<template>
    <div :class="['MatcZoomableTextArea', {'MatcZoomableTextAreaMax': isMax}]">
        <div class="MatcZoomableTextAreaBackdrop" @click="isMax=false">
            <div :class="['MatcZoomableTextAreaIconInput MatcToobarInput MatcToobarInputBorder' , {'MatcToobarInputFocus': hasFocus}]" @click.stop>
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
  props: ['disabled', 'defaultMessage'],
  emits: ['change', 'settings', 'clear'],
  data() {
    return {
        hasFocus: false,
        text: '',
        isMax: false
    }
  },
  components: {
    QIcon
    // IconWindowMaximize, IconWindowMinimize
  },
  computed: {
  
  },
  methods: {
    onSettings (e) {
      this.$emit('settings', e)
    },
    onClear () {
      this.$emit('clear')
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
  }
}
</script>
