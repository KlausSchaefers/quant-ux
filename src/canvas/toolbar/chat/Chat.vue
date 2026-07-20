<template>
    <div class="luisa-chat">
        <div class="luisa-chat-header">
            <div>
               Chat
            </div>
            <!-- <IconTrash :size="16" stroke="2" @click="clear" class="luisa-icon"></IconTrash> -->
         </div>
        <div class="luisa-chat-body">
           
                
                <template v-for="(m,i) in messages">
                    <ChatMessage :message="m" @delete="deleteMessage(i)" :key="i"></ChatMessage>
                </template>
                <div ref="bodyEnd"></div>        
        

        </div>
        <div class="luisa-padding">
            <ZoomableTextArea v-if="!showSettings" @change="addMessage" :disabled="status.busy" />
        </div>
    </div>

</template>

<style lang="scss">
  @import "../../../style/toolbar/chat.scss";
</style>

<script>


import ChatMessage from './ChatMessage.vue';
import ZoomableTextArea from './ZoomableTextArea.vue';


export default {
  emits: ['change'],
  inject: ['status'],
  props: {
  },
  data() {
    return {
        openAIKey:'',
        messages: [],
        showSettings: false
    }
  },
  components: {
    ChatMessage, ZoomableTextArea
  },
  computed: {
    statusMessage () {
        if (this.status.busy) {
            return {
                role: 'agent',
                content: this.status.messages.join('\n\n')
            }
        }  
        return ''
    }
  },
  methods: {
    clear () {
        this.messages = []
        this.onChange()
    },
    deleteMessage (i) {
        this.messages.splice(i, 1)
        this.onChange()
    },
    addMessage (txt) {
        if (txt.trim()) {
            this.messages.push({
                "role": "user",
                "content": txt
            })
        }
        this.$emit('change', this.messages)
        this.onChange()
    },
    onSaveOpenAI(e) {
        if (e.target.value) {
            this.openAIKey = e.target.value
            localStorage.setItem('luisaOpenAIKey', this.openAIKey)
            this.showSettings = false
        }
        
    },
    onChangeLastAgentMessage (txt) {
        this.messages[this.messages.length-1].content += txt
        this.onChange()
    },
    clearAgentMessages() {
        this.messages = this.messages.filter(m => m.role !== "agent");
        this.onChange()
    },
    onAgentMessage (txt) {
        this.messages.push({
            "role": "agent",
            "content": txt
        })
        this.onChange()
    },
    onChange () {
        const s = JSON.stringify(this.messages)
        localStorage.setItem('luisaMessages', s)
        setTimeout(() => {
            if (this.$refs.bodyEnd) {
                this.$refs.bodyEnd.scrollIntoViewIfNeeded(true)
            }
        }, 50)
    }
  },
  mounted() {
    this.openAIKey = localStorage.getItem('luisaOpenAIKey')
    if (!this.openAIKey) {
        this.showSettings = true
    } 
    let s =  localStorage.getItem('luisaMessages')
    if (s) {
        this.messages = JSON.parse(s)
    }
    if (this.messages.length === 0) {
        this.messages.push(            {
            "role": "ui",
            "content": "Hi there! \n\n Please describe the UI I should create for you."
        })
    }
  }
}
</script>
