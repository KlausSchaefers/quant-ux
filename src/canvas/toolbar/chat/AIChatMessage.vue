<template>

    <div :class="'MatcAiChatMessage ' + roleClass" >
        
        <div v-html="value" class="MatcAiChatMessageBody">

        </div>
    </div>
         
</template>


<script>


// import { marked } from 'marked'
// import { IconX } from '@tabler/icons-vue';

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
      // const html = marked(this.message.content)
      return this.message.content
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
