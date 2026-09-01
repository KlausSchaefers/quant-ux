<template>
    <div class="MatcAiChat">
   
        <div class="MatcAiChatBody">


            <template v-for="(m, i) in messages">
                <AIChatMessage :message="m" @delete="deleteMessage(i)" :key="i" @click="onMessageClick(m, $event)"></AIChatMessage>
            </template>
            <div ref="bodyEnd"></div>


        </div>
        <div class="MatcAiChatFooter">
            <div class="MatcAiChatSelection">
                <template v-if="selection?.length" >
                    <span >Selection <QIcon icon="DeleteX" @click="clearSelection"/></span>
                    
                </template>
            </div>
            <ZoomableTextArea 
                :defaultMessage="defaultMessage"
                :cssMode="cssMode"
                :usage="currentAIUssage"
                @mode="onCSSMode"
                @change="addMessage" 
                :disabled="status.busy"
                @settings="onSettings"
                @clear="onClear"
            />
            <div ref="iframeCntr" class="MatcAiChatIFrame"></div>
        </div>
      
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
import QIcon from 'page/QIcon';
import AgentMemory from '../../../ai/AgentMemory'
import Services from 'services/Services'

export default {
    name: 'AIChat',
    emits: ['change', 'settings', 'add'],
    props: {
        'defaultMessage': {
            default: '',
            type: String
        }, 
        'isDebug': {
            default: location.href.indexOf('localhost') > 0,
            type: Boolean
        }},
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
            },
            selection:[],
            currentAIUssage: ''
        }

    },
    components: {
        AIChatMessage, ZoomableTextArea, QIcon
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
                    "action": "openSettings",
                    "errors": "",
                    "reasoning": [],
                    "meta": []
                })
                return
            } else {
                this.messages.push({
                    "role": "assistant",
                    "content": "Start working...",
                    "errors": "",
                    "reasoning": [],
                    "meta": []
                })
            }

            this.status.busy = true;

            try {
                const context = {
                    model: this.model,
                    selection: this.selection,
                    memory: this.agentMemory
                }
                const html2QUX = new HTML2QUX(this.$refs.iframeCntr)
                const agent = new Agent(
                    llm, 
                    context,
                    options, 
                    html2QUX,
                    this.onProgress
                )
                const result = await agent.run(this.messages)
             
                this.status.busy = false;
                this.$emit('agentResult', result)

                this.updateUsage()
            } catch (err) {
                //Logger.error('AIChat.runAI() >', err)
                if (err.message === 'error-no-token-left') {
                    this.onProgress('error', "Sorry, your free AI budget is all used. Open the AI settings and use a different AI provider with your own API token.")
                } else {
                    this.onProgress('error', "Error!")
                }
                this.status.busy = false;
            }    
        },
        onProgress(type, message) {
            const last = this.messages[this.messages.length - 1]
            if (type === 'status') {
                last.content += `\n${message}\n`
            }
            if (type === 'error') {
                last.errors += `\n\n${message}\n\n`
            }
            if (type === 'llm') {
                if (!last.meta) {
                    last.meta = []
                }
                last.meta.push(message)
            }
            if (type === 'reasoning') {
                if (!last.reasoning) {
                    last.reasoning = []
                }
                last.reasoning.push(message)
            }
            this.onChange()
        },
        onMessageClick (m, e) {
            if (m.action === 'openSettings') {
                this.$emit('settings', e)
            }
        },
        setModel (m) {
            this.model = m
        },
        setSelection(s) {
            this.selection = s
        },
        clearSelection() {
            this.selection = []
        },
        onCSSMode(cssMode) {
            this.cssMode = cssMode
            Util.setCSSMode(cssMode)
        },
        onClear() {
            this.messages = []
            CachedLLM.clearCache()
            this.agentMemory.clear()
            this.onChange()
        },
        onSettings(e) {
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
                    "content": txt,
                    "meta": [],
                    "reasoning": [],
                    "errors": ""
                })
            }
            this.runAI()
            this.$emit('change', this.messages)
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
        async updateUsage () {
            // const options = Util.getOptions()
            // if (options.provider && options.provider.indexOf('qux') >=0 ) {
            //     let user = Services.getUserService().load()
            //     user = await Services.getUserService().loadById(user.id)
            //     const p = (user.aiUsage || 0) / 20
            //     this.currentAIUssage = 'Usage: ' + Math.round(p * 100) + '%';
            //     return
            // }
            // this.currentAIUssage = ''
        },
        initSettings() {
            this.cssMode = Util.getCSSMode()    
            this.agentMemory = new AgentMemory()
        },
        getMemory() {
            return this.agentMemory
        }
    },
    mounted() {
        this.initSettings()
        this.updateUsage()
    }
}
</script>
