
<template>
    <div :class="{'MatchImportOpenAIDialogDesktop':isDesktop}">
        <div class="MatcToolbarTabs MatcToolbarTabsBig">
                    <a @click="tab='openai'" :class="{'MatcToolbarTabActive': tab === 'openai'}">{{ getNLS('design-gpt.tab-prompt')}}</a>
                    <a @click="tab='settings'" :class="{'MatcToolbarTabActive': tab === 'settings'}">{{ getNLS('design-gpt.tab-settings')}}</a>
                </div>

     
        <div v-if="isPublic">
            <div class="MatchImportDialogCntr">
                {{ getNLS('design-gpt.error-public') }}
            </div>
        </div>
        <div v-else class="MatchImportOpenAIDialogCntr">

            <div class="MatchImportOpenAIDialogInput">
                
                <div v-if="tab === 'settings'">
                    <div class="MatchImportDialogCntr ">
                        
                        <div class="field">
                            <label>{{ getNLS('design-gpt.key-title') }}</label>
                            <input type="text" class="input" v-model="openAIKey" @change="onChangeOpenAIKey"/>

                            <p class="MatchImportOpenAIDialogHint">
                                {{ getNLS('design-gpt.key-hint') }}                          
                                {{ getNLS('design-gpt.key-security') }}
                    
                            </p>

                        </div>

                     
        
                        <div class="field MatcMarginTop">
                            <label>{{ getNLS('design-gpt.gpt-model') }}</label>
                            <div>
                                <RadioBoxList :qOptions="gptModels" :qValue="gptVersion" @change="onChangeModelType"/>
                            </div>
                           
                        </div>
                     

                    </div>
                </div>

                <div v-if="tab === 'openai'">
                    <div class="MatchImportDialogCntr ">
                        <div class="field">
                      
                            <textarea 
                                :placeholder="promptPlaceholder"
                                type="text" 
                                class="input" 
                                v-model="prompt" 
                                @keyup="onKeyUp($event)" 
                                ref="promptBox"></textarea>
                        </div>

                        <div class="MatchImportDialogCntrConfig">
                            <CheckBox 
                                :value="isWireFrame" 
                                :label="getNLS('design-gpt.is-wireframe')" 
                                @change="onChangeWireFrame"/>

                            <CheckBox 
                                :value="isMinimal" 
                                :label="getNLS('design-gpt.is-minimal')" 
                                @change="onChangeMinimal"/>
                        </div>
              
                    </div>
                </div>


                <div class="MatcError">
                    <span v-if="!isRunningAI">{{errorMSG}}</span>
                </div>

                <div class="MatcButtonBar MatcMarginTop" v-if="tab === 'openai'">
                 
                    <a class=" MatcButton" @click.stop="onCreatePreview">
                        {{getNLS('design-gpt.preview') }}
                    </a>     
                    <a class=" MatcButton" v-if="preview" @click.stop="onSave">
                        {{ getNLS('btn.import') }}
                    </a>       
                    <a class=" MatcLinkButton" @click.stop="onCancel">
                        {{ getNLS('btn.cancel') }}</a>
                </div>

                <div class="MatcButtonBar MatcMarginTop" v-if="tab === 'settings'">
                    <a class=" MatcButton" @click.stop="tab = 'openai'">
                        {{getNLS('btn.save') }}
                    </a>
                    <a class=" MatcLinkButton" @click.stop="onCancel">{{ getNLS('btn.cancel') }}</a>
                </div>

            </div>

            <div :class="['MatchImportDialogPreviewCntr' ,{'XXX_MatchImportDialogAIRunning': isRunningAI}]" v-if="tab === 'openai'">
                <div class="MatcHint" v-if="!preview && !isRunningAI">
                    {{ hint }}
                    <div class="MatchImportDialogProgressCntr"> 
                        <div class="MatchImportDialogProgress"></div>
                    </div>
                </div>

                <div ref="simCntr" class="MatchImportOpenAIDialogSimulator">
                </div>

                <div :class="['MatcDesignRoboCntr', {'MatcDesignRoboError': this.errorMSG}]" v-if="!preview && isRunningAI">
                    <div class="MatcDesignRoboBubblez">                        
                        <div class="MatcDesignRoboBubble" v-for="m in robo.messages" :key="m">
                            {{m}}
                        </div>
                    </div>
                    <div class="MatcDesignRoboIcon">
                        <span :class="robo.icon"></span>
                    </div>
                </div>
            </div>



        </div>


        <div ref="iframeCntr" class="iframeCntr"></div>



    </div>
</template>
<style lang="scss">
@import '../../../style/import_dialog.scss';

.iframeCntr {
    width: 0px;
    height: 0px;
    overflow: hidden;
}
</style>
<script>
import DojoWidget from 'dojo/DojoWidget'
import Logger from 'common/Logger'
import Util from 'core/Util'
import DomBuilder from 'common/DomBuilder'
import domGeom from 'dojo/domGeom'
import ScrollContainer from 'common/ScrollContainer'
import Simulator from 'core/Simulator'
import Services from 'services/Services'
import HTMLImporter from 'core/ai/HTMLImporter'
import * as StyleImporter from 'core/ai/StyleImporter'
import RadioBoxList from 'common/RadioBoxList'
import CheckBox from 'common/CheckBox'

export default {
    name: 'OpenAIDialog',
    mixins: [Util, DojoWidget],
    data: function () {
        return {
            tab: "openai",
            model: null,
            hasContinue: false,
            uploadFiles: [],
            uploadPreviews: [],
            hasZip: false,
            zoom: 1,
            errorMSG: '',
            progressMSG: '',
            progessPercent: 0,
            isPublic: false,
            prompt: '',
            promptPlaceholder: this.getNLS('design-gpt.prompt-placeholder'),
            openAIKey: '',
            preview: null,
            hint: this.getNLS('design-gpt.no-preview'),
            promptHistory: [],
            isWireFrame: false,
            isMinimal: false,
            isRunningAI: false,
            hasRobo: true,
            gptVersion: 'gpt3',
            gptModels: [
                {value: 'gpt3', label: this.getNLS('design-gpt.gpt-model-gpt3')},
                {value: 'gpt4', label: this.getNLS('design-gpt.gpt-model-gpt4')}   
            ],
            robo: {
                icon:'mdi mdi-robot-outline',
                messages: [],
            }
        }
    },
    components: {
        CheckBox,RadioBoxList
    },
    computed: {
        isDesktop () {
            if (this.model && this.model.screenSize.w >= 768) {
                return true
            }
            return false
        }
    },
    methods: {
        setModel(m) {
            this.model = m;
        },

        setPublic(isPublic) {
            this.isPublic = isPublic
        },

        setController(controller) {
            this.controller = controller
        },

        setCanvas(c) {
            this.canvas = c
        },

        setJwtToken(t) {
            this.jwtToken = t
        },

        setZoom(z) {
            this.zoom = z
        },

        onCancel() {
            this.$emit('cancel')
        },

        onKeyUp (e) {
            if (e.key === '#') {
                this.logger.log(-1, 'onKeyUp', '#')
                // show color selector..
                //this.insertAtCursor(this.$refs.promptBox, '333333')
            }
        },

        insertAtCursor(el, newText) {
            const [start, end] = [el.selectionStart, el.selectionEnd];
            el.setRangeText(newText, start, end, 'select');
            el.setSelectionRange(start + newText.length, start + newText.length);
        },

        async onSave() {
            this.logger.log(-1, 'onSave', 'enter')
            this.$emit('save', this.preview)
        },

        saveInScreenCenter() {
            const model = this.preview
            let minX = 1000000
            let minY = 1000000
            Object.values(model.screens).forEach(screen => {
                minX = Math.min(minX, screen.x)
                minY = Math.min(minY, screen.y)
            })
            const pos = this.getCanvasCenter()
            const offsetX = pos.x - minX
            const offsetY = pos.y - minY
            Object.values(model.screens).forEach(screen => {
                screen.x += offsetX
                screen.y += offsetY
                return screen
            })
            Object.values(model.widgets).forEach(widget => {
                widget.x += offsetX
                widget.y += offsetY
                return widget
            })            
            this.controller.addScreensAndWidgets(model);
        },

        async onCreatePreview() {
            this.logger.log(-1, 'onCreatePreview', 'enter')
            this.cleanUp()         
            this.runDesignGPT()
        },

        async runDesignGPT() {
            if (!this.model) {
                this.logger.error('runDesignGPT', 'No model')
                return
            }          
            if (this.prompt.length < 5) {
                this.setError('design-gpt.error-prompt-too-short')
                return
            } 
            this.promptHistory.push(this.prompt)
           
            this.isRunningAI = true
            this.showRunning()
            const result = await this.runGTPT()
            //const result = await aiService.runFake(this.prompt, this.openAIKey, this.model)
            this.isRunningAI = false
            if (result.error) {
                this.hint = this.getNLS('design-gpt.no-preview'),
                this.setError(result.error)
            } else {
                this.html = result.html
                console.debug(this.html)
                this.buildApp(this.html)
            }
        },

        runGTPT () {
            this.logger.log(-1, 'runGTPT', 'enter', this.gptVersion )
            const aiService = Services.getAIService()
            if (this.gptVersion === 'gpt4') {
                return aiService.runGPT4(this.prompt, this.openAIKey, this.model)
            }
            return aiService.runGPT35Turbo(this.prompt, this.openAIKey, this.model)
        },

        showRunning () {
            if (this.hasRobo) {
                this.startRobo()
            } else {
                this.startHints()
            }
        },

        startHints () {
            this.hint = this.getNLS('design-gpt.robo-running-1')
            const [waitingMessages, delayedMessages] = this.getWaitingMessages()
            this.updateHint(waitingMessages, delayedMessages, 0)
        },

        updateHint (waitingMessages, delayedMessages, call = 0, delayedTheshold = 2) {
            this.updateTimeout = setTimeout(() => {
                const m = call > delayedTheshold ? 
                    delayedMessages.pop() : 
                    waitingMessages.pop()   

                if (!this.isRunningAI || !m) {
                    return
                }     
                this.hint = m
                this.updateHint(waitingMessages, delayedMessages, call+1)
            }, 4000 + Math.round(Math.random() * 2000))
        },
        
        startRobo () {
            this.robo.messages = [this.getNLS('design-gpt.robo-running-1')]
            const [waitingMessages, delayedMessages] = this.getWaitingMessages()
            this.robo.icon = 'mdi mdi-robot-excited'
            this.updateRobo(waitingMessages, delayedMessages, 0)
        },

        getWaitingMessages () {
            let waitingMessages = [
                this.getNLS('design-gpt.robo-waiting-1'),
                this.getNLS('design-gpt.robo-waiting-2'),
                this.getNLS('design-gpt.robo-waiting-3'),
                this.getNLS('design-gpt.robo-waiting-4'),
                this.getNLS('design-gpt.robo-waiting-5'),
                this.getNLS('design-gpt.robo-waiting-6'),
                this.getNLS('design-gpt.robo-waiting-7'),
                this.getNLS('design-gpt.robo-waiting-8'),
                this.getNLS('design-gpt.robo-waiting-9'),
            ]
            waitingMessages = waitingMessages
                .map(value => ({ value, sort: Math.random() }))
                .sort((a, b) => a.sort - b.sort)
                .map(({ value }) => value)

        
            let delayedMessages = [
                this.getNLS('design-gpt.robo-delayed-1'),
                this.getNLS('design-gpt.robo-delayed-2'),
                this.getNLS('design-gpt.robo-delayed-3'),
                this.getNLS('design-gpt.robo-delayed-4'),
                this.getNLS('design-gpt.robo-delayed-5'),
                this.getNLS('design-gpt.robo-delayed-6'),
                this.getNLS('design-gpt.robo-delayed-7'),
                this.getNLS('design-gpt.robo-delayed-8'),
            ]
            delayedMessages = delayedMessages
                .map(value => ({ value, sort: Math.random() }))
                .sort((a, b) => a.sort - b.sort)
                .map(({ value }) => value)



            waitingMessages.push(this.getNLS('design-gpt.robo-running-2'))
            return [waitingMessages, delayedMessages]
        },

        updateRobo (waitingMessages, delayedMessages, call = 0, delayedTheshold = 2) {
            this.updateTimeout = setTimeout(() => {
                const m = call > delayedTheshold ? 
                    delayedMessages.pop() : 
                    waitingMessages.pop()   

                if (!this.isRunningAI || !m) {
                    return
                }     
                this.robo.messages.push(m)
                if (call > delayedTheshold) {
                    this.robo.icon = 'mdi mdi-robot-confused'
                }
                this.updateRobo(waitingMessages, delayedMessages, call+1)
            }, 4000 + Math.round(Math.random() * 2000))
        },

        stopRobo() {
            this.robo.messages = [this.getNLS('design-gpt.robo-start-1')]
            this.robo.icon = 'mdi mdi-robot'
        },

        setError (errorKey) {
            this.errorMSG = this.getNLS(errorKey)
            this.robo.icon = "mdi mdi-robot-dead"
            this.robo.messages = [this.errorMSG]
            clearTimeout(this.updateTimeout)
        },


        async buildApp (html) {
            const width = this.model.screenSize.w
            const height = this.model.screenSize.h
            const importer = new HTMLImporter(this.model.lastUUID)
            const result = await importer.html2QuantUX(html, this.$refs.iframeCntr, width, height , {
                isRemoveContainers: this.isMinimal,
                defaultStyle: this.getDefaultStyle()
            })
            if (result) {
                this.preview = result
                this.$nextTick(() => {
                    this.buildPreview(result)
                })              
            }
        },

        getDefaultStyle () {
            if (this.isWireFrame) {
                return StyleImporter.getDefaultStyle(this.model)
            }
            return null
        },

        async buildPreview () {
            if (!this.simulator) {
                const sim = this.renderSimulator(this.$refs.simCntr);
                sim.doNotRunOnLoadAnimation = true
                sim.doNotExecuteScripts = true
                this.simulator = sim;
            }
            this.simulator.setModel(this.preview);
        },

        renderSimulator(cntr) {

            const db = new DomBuilder();

            const domPos = domGeom.position(this.domNode);
            const pos = domGeom.position(cntr);
            pos.h = domPos.h;

            const container = db.div("MatchSimulatorContainer MatcAnimationComposerSimulator")
                .h(pos.h)
                .w(pos.w)
                .build();

            const scroller = this.$new(ScrollContainer, { canDestroy: true });
            scroller.placeAt(container);

            const s = this.$new(Simulator, { mode: "debug", logData: false, runTimerLinesOnScreenLoad: false, isDesktopTest: true, isWiringEvents: true });
            s.scrollListenTarget = "parent";
            s.setHash(this.hash)     
            s.initParent = () => { };
            s.setScrollContainer(scroller);
            scroller.wrap(s.domNode);
            cntr.appendChild(container);
            return s;
        },

        cleanUp() {
            this.errorMSG = ''
            this.hint = this.getNLS('design-gpt.no-preview'),
            clearTimeout(this.updateTimeout)
            this.stopRobo()
            this.preview = null
            if (this.simulator) {
                this.simulator.destroy()
                this.simulator = null
            }
            this.$refs.simCntr.innerHTML = ''
        },

        onChangeWireFrame (v) {
            this.isWireFrame = v
            localStorage.setItem('quxOpenAIIsWireFrame', v)
            if (this.html) {
                //this.cleanUp()
                this.buildApp(this.html)
            }
        },

        onChangeModelType (v) {
            console.debug('onChangeModelType', v)
            this.gptVersion = v
            localStorage.setItem('quxOpenAIGPTVersion', v)
        },

        onChangeMinimal(v) {
            this.isMinimal = v
            localStorage.setItem('quxOpenAIIsMinimal', v)
            if (this.html) {
                //this.cleanUp()
                this.buildApp(this.html)
            }
        },

        getCanvasCenter() {
            if (this.canvas) {
                return {
                    x: Math.max(250, this.getZoomed(-1 * (this.canvas.domPos.x + this.canvas.canvasPos.x - 200), 1 / this.zoom)),
                    y: Math.max(50, this.getZoomed(-1 * (this.canvas.domPos.y + this.canvas.canvasPos.y - 200), 1 / this.zoom)),
                }
            }
            return { x: 0, y: 0 }
        },
        onChangeOpenAIKey () {
            localStorage.setItem('quxOpenAIKey', this.openAIKey)
        }


    },
    mounted() {
        this.logger = new Logger("DesignGPTDialog");
        this.openAIKey = localStorage.getItem('quxOpenAIKey')
        this.isWireFrame = localStorage.getItem('quxOpenAIIsWireFrame')=== 'true' ? true : false
        this.isMinimal = localStorage.getItem('quxOpenAIIsMinimal') === 'true' ? true : false
        this.gptVersion = localStorage.getItem('quxOpenAIGPTVersion') ? localStorage.getItem('quxOpenAIGPTVersion') : 'gpt3'
        if (!this.openAIKey) {
            this.tab = 'settings'
        }
        this.stopRobo()
    }
}
</script>