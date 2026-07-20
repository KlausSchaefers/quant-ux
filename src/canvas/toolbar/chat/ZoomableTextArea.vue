<template>
    <div :class="['luisa-zoom-textarea', {'luisa-zoom-textarea-max': isMax}]">
        <div class="luisa-zoom-textarea-backdrop" @click="isMax=false">
            <div class="luisa-icon-input" @click.stop>
                <textarea class="luisa-input luisa-input-fw" @change="onChange" @keyup.enter="onEnter" v-model="text" ref="textarea" :disabled="disabled"></textarea>
                <template v-if="!disabled">
                  <!-- <IconWindowMaximize v-if="!isMax" :size="16"  class="luisa-icon" @click.stop="show"/>
                  <IconWindowMinimize v-else :size="16"  class="luisa-icon" @click.stop="isMax=false"/> -->
                </template>
            </div>
        </div>
    </div>
        

</template>


<script>

// import { IconWindowMaximize, IconWindowMinimize } from '@tabler/icons-vue';

export default {
  props: ['disabled'],
  emits: ['change'],
  data() {
    return {
        text: '',
        isMax: false
    }
  },
  components: {
    // IconWindowMaximize, IconWindowMinimize
  },
  computed: {
  
  },
  methods: {
    show() {
      this.isMax=true
      this.$refs.textarea.focus()
    },
    onEnter (e) {
        if (e.shiftKey) {
            return
        }
        this.isMax = false
        this.$refs.textarea.blur()
       // this.onChange()
    },
    onChange () {
        this.$emit('change', this.text)
        this.text = ''
    }
  },
  watch: {
    
  },
  mounted() {
  }
}
</script>
