<template>
    <div class="MatcAiChat">
        <!-- <div class="MatcAiChatHeader">
            <div>
                Chat
            </div>
            <IconTrash :size="16" stroke="2" @click="clear" class="luisa-icon"></IconTrash>
        </div> -->
        <div class="MatcAiChatBody">


            <template v-for="(m, i) in messages">
                <AIChatMessage :message="m" @delete="deleteMessage(i)" :key="i"></AIChatMessage>
            </template>
            <div ref="bodyEnd"></div>


        </div>
        <div class="MatcAiChatFooter">
            <ZoomableTextArea 
                @change="addMessage" 
                :disabled="status.busy"
                @settings="onSettings"
                @clear="onClear"
            />
            
        </div>
        
    </div>

</template>

<style lang="scss">
@import "../../../style/toolbar/ai_chat.scss";
</style>

<script>


import AIChatMessage from './AIChatMessage.vue';
import ZoomableTextArea from './ZoomableTextArea.vue';
// import QIcon from 'page/QIcon'

export default {
    emits: ['change', 'settings'],
    props: {
    },
    data() {
        return {   
            messages: [
                {
                    content: 'Hello, how can I help',
                    role: 'assistant'
                },
                {
                    content: 'Please do this and that',
                    role: 'user'
                }
            ],
            showSettings: false,
            isWorking: false,
            flexEngine: 'yoga',
            size: 'd',
            app: null,  
            useHTML: false,
            useCustomDLS: true,
            selectedScreen: '',
            progressMessage: 'Thinking...',
            isDebug: false,
            claudeKey: '',
            openAIKey: '',
            geminiKey: '',
            status: {
                busy: false,
                messages: []
            },
            isIframeOpen: false,
            selectedModel: 'gpt-4.1',
            models: [
                { label: "OpenAI - GPT-4.1", value: "gpt-4.1" },
                { label: "OpenAI - GPT-4o-Mini", value: "gpt-4o-mini" },
                { label: "OpenAI - GPT-4o-Namo", value: 'gpt-4.1-nano' },
                { label: "OpenAI - GPT-5-Nano", value: 'gpt-5-nano' },
                { label: "OpenAI - GPT 5.6 Terra", value: 'gpt-5.6-terra' },
                { label: "Claude - Sonnet", value: 'claude-sonnet-4-5-20250929' },
                { label: "Gemini - 2.5 Flash", value: "gemini-2.5-flash" },
                { label: "Gemini - 3 Pro", value: "gemini-3-pro-preview" }
            ]
        }

    },
    components: {
        AIChatMessage, ZoomableTextArea//, QIcon
    },
    computed: {
        statusMessage() {
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
        onClear() {
            this.messages = []
            this.onChange()
        },
        onSettings(e) {
            console.debug('onSettings')
            this.$emit('settings', e)
        },
        deleteMessage(i) {
            this.messages.splice(i, 1)
            this.onChange()
        },
        addMessage(txt) {
            if (txt.trim()) {
                this.messages.push({
                    "role": "user",
                    "content": txt
                })
            }
            this.$emit('change', this.messages)
            this.onChange()
        },
        onChangeLastAgentMessage(txt) {
            this.messages[this.messages.length - 1].content += txt
            this.onChange()
        },
        clearAgentMessages() {
            this.messages = this.messages.filter(m => m.role !== "assistant");
            this.onChange()
        },
        onAgentMessage(txt) {
            this.messages.push({
                "role": "assistant",
                "content": txt
            })
            this.onChange()
        },
        onChange() {
            // const s = JSON.stringify(this.messages)
            // localStorage.setItem('luisaMessages', s)
            setTimeout(() => {
                if (this.$refs.bodyEnd) {
                    this.$refs.bodyEnd.scrollIntoViewIfNeeded(true)
                }
            }, 50)
        }
    },
    mounted() {
     
    }
}
</script>
