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
                <AIChatMessage :message="m" @delete="deleteMessage(i)" :key="i" @click="onMessageClick(m, $event)"></AIChatMessage>
            </template>
            <div ref="bodyEnd"></div>


        </div>
        <div class="MatcAiChatFooter">
    
            <ZoomableTextArea 
                :defaultMessage="defaultMessage"
                @change="addMessage" 
                :disabled="status.busy"
                @settings="onSettings"
                @clear="onClear"
            />
            
        </div>
        <div ref="iframeCntr" class="MatcAiChatIFrame"></div>
    </div>

</template>

<style lang="scss">
@import "../../../style/toolbar/ai_chat.scss";
</style>

<script>


import AIChatMessage from './AIChatMessage.vue';
import ZoomableTextArea from './ZoomableTextArea.vue';
import OpenAI from './llm/OpenAI.js';
import Claude from './llm/Claude.js';
import Gemini from './llm/Gemini.js';
import Agent from './Agent.js';
import Logger from '../../../core/Logger.js';
// import QIcon from 'page/QIcon'

export default {
    name: 'AIChat',
    emits: ['change', 'settings', 'add'],
    props: ['defaultMessage'],
    data() {
        return {   
            messages: [
                {
                    content: 'Hello there! How can I help you today?',
                    role: 'assistant'
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
        async runAI() {
            const options = this.getOptions()
            Logger.log(-1, 'AIChat.runAI', options.provider, this.model)
            const llm = this.getLLM(options)
            if (!llm) {
                this.messages.push({
                    "role": "assistant",
                    "content": "Please configure the **AI provider**. Click __here__ or choose Menu > AI Settings",
                    "action": "openSettings"
                })
                return
            } else {
                this.messages.push({
                    "role": "assistant",
                    "content": "Start working..."
                })
            }

            const agent = new Agent(
                llm, 
                this.model, 
                options, 
                (m) => {
                    this.onChangeLastAgentMessage('\n\n' + m + '\n\n')
                }, 
                this.iframeCntr
            )
            const result = await agent.run(this.messages)
            console.debug(result)


            this.onChangeLastAgentMessage("Done!")
            // const result = {

            // }
            // this.$emit('add', result)
        },
        getLLM(options) {

            if (options.provider === 'openai') {
                return new OpenAI(options.token)
            }

            if (options.provider === 'anthropic') {
                return new Claude(options.token, this.selectedModel)
            }
            
            if (options.provider === 'gemini') { 
                return new Gemini(options.token)
            }
        },
        getOptions() {
            const saved = localStorage.getItem('quxAISettings')
            if (saved) {
                const data = JSON.parse(saved)
                return data
            }
        },
        onMessageClick (m, e) {
            if (m.action === 'openSettings') {
                this.$emit('settings', e)
            }
        },
        setModel (m) {
            this.model = m
        },
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
            this.runAI()
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
