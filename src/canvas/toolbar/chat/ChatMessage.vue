<template>

    <div :class="'luisa-chat-message luisa-chat-message-' + message.role" >
        <div class="luisa-chat-message-header">
          <!-- <IconX :size="16" stroke="1" class="luisa-icon" @click="onDelete"></IconX> -->
        </div>
        <div v-html="value" class="luisa-chat-message-body">

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
