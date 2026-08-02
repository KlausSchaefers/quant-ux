<template>
    <div :class="['MatcAiEditor', {'MatcAiEditorFocus' : hasFocus}, {'MatcAiEditorBusy': status.busy}]" v-show="isVisible">


            <div class="MatcAiEditorCloseIcon">
                <QIcon icon="Close" @click.stop="close" />
            </div>

            <template v-if="!status.busy">
            <textarea class="MatcIgnoreOnKeyPress " 
                @focus="hasFocus = true" 
                @blur="hasFocus = false"
                @keyup.enter="onEnter"
                v-model="userPrompt" 
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
            </template>
            <div v-else :class="'MatcAiEditorStatusCntr ' + this.message.type">
                <div class="MatcAiEditorProgressCntr">
                    <div class="MatcAiEditorProgressBar"></div>
                </div>
                <div class="MatcAiEditorStatusMessage">
                    {{this.message.content}}
                </div>
            
            </div>


        <div ref="iframeCntr" class="MatcAiChatIFrame"></div>
    </div>

</template>

<style lang="scss">
@import "../style/canvas/canvas_ai_editor.scss";
</style>

<script>

import CachedLLM from './llm/CachedLLM.js';
import Agent from './Agent.js';
import HTML2QUX from './HTML2QUX'
import * as Util from './AIUtil.js'
import Logger from 'core/Logger.js';
import QIcon from 'page/QIcon'

export default {
    name: 'AIEditor',
    emits: ['change', 'settings', 'add'],
    props: ['defaultMessage'],
    data() {
        return {
            hasFocus: false,
            userPrompt: 'Make a website about dogs...',
            message: {
                content: '',
                type: 'info',
            },
            cssMode: 'wireframe',
            cssModes: [
                { label: "Wireframe", value: "wireframe" },
                { label: "Creative", value: "creative" },
                { label: "Use Styles", value: 'dls' }
            ],
            showCssModeMenu: false,
            isVisible: false,
            disabled: false,
            selectedScreen: '',
            isDebug: true,
            status: {
                busy: false
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
                if (this.$refs.textarea) {
                    this.$refs.textarea.focus()
                }
            }, 100)
        },

        close() {
            this.isVisible = false
            if (this.agent) {
                this.agent.cancel()
            }
            delete this.agent
        },

        async runAI(userPrompt) {
            const options = Util.getOptions()
            Logger.log(-1, 'AIEditor', options.provider, this.model.screenSize)
            const llm = Util.getLLM(options, this.isDebug)
        
            this.status.busy = true
            if (!llm) {
                this.setMessage('No LLM provider defined. Open the AI settings in the main menu! ', 'error')
                return
            }

            this.setMessage('Working', 'info')
          

            try {
                const html2QUX = new HTML2QUX(this.$refs.iframeCntr)
                this.agent = new Agent(
                    llm,
                    this.model,
                    options,
                    html2QUX,
                    (m) => {
                        this.setMessage(m, 'info')
                    }
                )
                const result = await this.agent.run([{
                    "role": "user",
                    "content": userPrompt
                }])

                this.setMessage("Done!")

                if (this.isVisible) {
                    this.$emit('agentResult', result)
                }
            
            } catch (err) {
                this.setMessage("Error!", 'error')
                
            }
            this.status.busy = false
        },
       
        setMessage(msg, type) {
            this.message.content = msg
            this.message.type = type
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
            this.$refs.textarea.blur()
            this.onChange()
            this.showCssModeMenu = false
            this.runAI(this.userPrompt)
        
            this.userPrompt = ''
        },
        onClear() {
            CachedLLM.clearCache()
            this.onChange()
        },
        onSettings(e) {
            this.$emit('settings', e)
        },
        onChange () {

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
