<template>

    <div :class="'MatcAiChatMessage ' + roleClass" @click="$emit('click', $event)">
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
    value () {
      const html = MDUtil.makeHtml(this.message.content)
      return html
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
