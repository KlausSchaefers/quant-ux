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
                :cssMode="cssMode"
                @mode="onCSSMode"
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
import * as Util from '../../../ai/AIUtil.js'
import Agent from '../../../ai/Agent.js';
import CachedLLM from '../../../ai/llm/CachedLLM.js';
import HTML2QUX from '../../../ai/HTML2QUX'
import Logger from '../../../core/Logger.js';
// import QIcon from 'page/QIcon'

export default {
    name: 'AIChat',
    emits: ['change', 'settings', 'add'],
    props: ['defaultMessage', 'isDebug'],
    data() {
        return {   
            messages: [
                {
                    content: 'Hello there! How can I help you today?',
                    role: 'assistant'
                }
            ],
            cssMode: 'wireframe',
            isWorking: false,
            selectedScreen: '',
            progressMessage: 'Thinking...',
            status: {
                busy: false
            }
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
            const options = Util.getOptions()
            Logger.log(-1, 'AIChat.runAI', options.provider, this.model.screenSize)
            const llm = Util.getLLM(options, this.isDebug)
       
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

            this.status.busy = true;

            try {
                const html2QUX = new HTML2QUX(this.$refs.iframeCntr)
                const agent = new Agent(
                    llm, 
                    this.model, 
                    options, 
                    html2QUX,
                    (m) => {
                        this.onChangeLastAgentMessage('\n\n' + m + '\n\n')
                    }
                )
                const result = await agent.run(this.messages)
                this.onChangeLastAgentMessage("Done!")
                this.status.busy = false;
                this.$emit('agentResult', result)
            } catch (err) {
                Logger.error('AIChat.runAI() >', err)
                this.status.busy = false;
                this.onChangeLastAgentMessage("Error!")
            }    
        },
        onMessageClick (m, e) {
            if (m.action === 'openSettings') {
                this.$emit('settings', e)
            }
        },
        setModel (m) {
            //console.debug('setModel', m)
            this.model = m
        },
        onCSSMode(cssMode) {
            this.cssMode = cssMode
            localStorage.setItem('quxAICssMode', cssMode)
        },
        onClear() {
            this.messages = []
            CachedLLM.clearCache()
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
        },
        initSettings() {
            const mode = localStorage.getItem('quxAICssMode')
            if (mode) {
                this.cssMode = mode    
            }
        }
    },
    mounted() {
        this.initSettings()
    }
}
</script>
