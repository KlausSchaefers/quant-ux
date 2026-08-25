<template>

    <div :class="'MatcAiChatMessage ' + roleClass + ' ' + errorClass" @click="$emit('click', $event)">
        <div v-html="value" class="MatcAiChatMessageBody">
        </div>
    </div>
         
</template>


<script>


// import { marked } from 'marked'
// import { IconX } from '@tabler/icons-vue';
import MDUtil from '../../../util/MDUtil';

export default {
  props: ['message'],
  emits: ['delete'],
  data() {
    return {
       
    }
  },
  components: {
   //IconX
  },
  computed: {
    hasMeta () {
      return this.message?.meta?.length > 0
    },
    value () {
      if (this.message.errors) {
        const html = MDUtil.makeHtml(this.message.errors)
        return html
      }
      const html = MDUtil.makeHtml(this.message.content)
      return html
    },
    errorClass () {
      if (this.message.errors) {
        return 'MatcAiChatMessageError'
      }
      return ''
    },
    roleClass () {
      const role = this.message.role
      return 'MatcAiChatMessage' + role.charAt(0).toUpperCase() + role.slice(1)
    }
  },
  methods: {
    onDelete() {
      this.$emit('delete')
    }
  },
  watch: {
    
  },
  mounted() {
  }
}
</script>
