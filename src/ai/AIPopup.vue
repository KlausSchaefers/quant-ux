<template>
    <div :class="['MatcAiEditor', {'MatcAiEditorFocus' : hasFocus}]" v-show="isVisible">


            <div class="MatcAiEditorCloseIcon" v-if="!disabled">
                <QIcon icon="Close" @click.stop="close" />
            </div>


            <textarea class="MatcIgnoreOnKeyPress " 
                @focus="hasFocus = true" 
                @blur="hasFocus = false"
                @keyup.enter="onEnter"
                v-model="text" 
                ref="textarea" 
                :disabled="disabled">
            </textarea>
       
            <div class="MatcAiEditorActionIcons">
                <QIcon icon="Settings" @click.stop="onSettings" />
                <!-- <QIcon icon="Delete" @click.stop="onClear" /> -->
                <div class="MatcAiEditorActionPopup" ref="cssModePopup">
                    <div :class="['MatcAiEditorActionPopupLabel', { 'MatcAiEditorActionPopupLabelActive': showCssModeMenu }]"
                        @click.stop="toggleCssModeMenu">
                        {{ cssModeLabel }}
                    </div>
                    <ul class="MatcAiEditorActionPopupMenu" v-show="showCssModeMenu">
                        <li v-for="mode in cssModes" :key="mode.value"
                            :class="{ 'MatcAiEditorActionPopupMenuItemActive': mode.value === cssMode }"
                            @click.stop="selectCssMode(mode.value)">
                            {{ mode.label }}
                        </li>
                    </ul>
                </div>
            </div>


        <div ref="iframeCntr" class="MatcAiChatIFrame"></div>
    </div>

</template>

<style lang="scss">
@import "../style/canvas/canvas_ai_editor.scss";
</style>

<script>

import OpenAI from './llm/OpenAI.js';
import Claude from './llm/Claude.js';
import Gemini from './llm/Gemini.js';
import CachedLLM from './llm/CachedLLM.js';
import Agent from './Agent.js';
import HTML2QUX from './HTML2QUX'
import Logger from 'core/Logger.js';
import QIcon from 'page/QIcon'

export default {
    name: 'AIEditor',
    emits: ['change', 'settings', 'add'],
    props: ['defaultMessage', 'isDebug'],
    data() {
        return {
            hasFocus: false,
            text: '',
            messages: [
                {
                    content: 'Hello there! How can I help you today?',
                    role: 'assistant'
                }
            ],
            cssMode: 'wireframe',
            cssModes: [
                { label: "Wireframe", value: "wireframe" },
                { label: "Creative", value: "creative" },
                { label: "Use Styles", value: 'dls' }
            ],
            showCssModeMenu: false,
            isVisible: false,
            isWorking: false,
            disabled: false,
            selectedScreen: '',
            progressMessage: 'Thinking...',
            status: {
                busy: false,
                messages: []
            }
        }

    },
    components: {
        QIcon
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
        },
        cssModeLabel() {
            const found = this.cssModes.find(o => o.value === this.cssMode)
            if (found) {
                return found.label
            }
            return this.cssModes[0].label
        }
    },
    methods: {
        show(pos) {
            Logger.log(-1, 'AIEditor.show()', pos)
            this.isVisible = true
            this.$el.style.top = pos.y + 'px'
            this.$el.style.left = pos.x + 'px'

            setTimeout(() => {
                this.$refs.textarea.focus()
            }, 100)
        },

        close() {
            this.isVisible = false
        },

        async runAI() {
            const options = this.getOptions()
            Logger.log(-1, 'AIEditor', options.provider, this.model.screenSize)
            let llm = this.getLLM(options)
            if (this.isDebug) {
                Logger.error('AIChat.runAI() > use cache')
                llm = new CachedLLM(llm)
            }

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
            // const result = {

            // }
            this.$emit('agentResult', result)
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
                data.cssMode = this.cssMode
                return data
            }
        },
        setModel(m) {
            this.model = m
        },
        selectCssMode (mode) {
            this.cssMode = mode
            this.showCssModeMenu = false
            localStorage.setItem('quxAICssMode', this.cssMode)
        },
        toggleCssModeMenu () {
            this.showCssModeMenu = !this.showCssModeMenu
        },
        onEnter (e) {
            if (e.shiftKey) {
                return
            }
            this.isMax = false
            this.$refs.textarea.blur()
            this.onChange()
            this.showCssModeMenu = false
        },
        onClear() {
            this.messages = []
            CachedLLM.clearCache()
            this.onChange()
        },
        onSettings(e) {
            this.$emit('settings', e)
        },
        deleteMessage(i) {
            this.messages.splice(i, 1)
            this.onChange()
        },
        onChange () {

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
