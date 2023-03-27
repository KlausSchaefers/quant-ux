
<template>
    <div class="">

     
        <div v-if="isPublic">
            <div class="MatchImportDialogCntr">
                {{ getNLS('design-gpt.error-public') }}
            </div>
        </div>
        <div v-else class="MatchImportOpenAIDialogCntr">

            <div class="MatchImportOpenAIDialogInput">
                <div class="MatcToolbarTabs MatcToolbarTabsBig">
                    <a @click="tab='openai'" :class="{'MatcToolbarTabActive': tab === 'openai'}">{{ getNLS('design-gpt.tab-prompt')}}</a>
                    <a @click="tab='settings'" :class="{'MatcToolbarTabActive': tab === 'settings'}">{{ getNLS('design-gpt.tab-settings')}}</a>
                </div>

                <div v-if="tab === 'settings'">
                    <div class="MatchImportDialogCntr ">
                        
                        <div class="field">
                            <label>{{ getNLS('design-gpt.key-title') }}</label>
                            <input type="text" class="input" v-model="openAIKey" @change="onChangeOpenAIKey"/>
                        </div>

                        <div class="">
                            {{ getNLS('design-gpt.key-hint') }}
                          
                        </div>
                        <div class="MatcMarginTop">
                            <b>
                                {{ getNLS('design-gpt.key-security') }}
                            </b>
                        </div>
                    </div>
                </div>

                <div v-if="tab === 'openai'">
                    <div class="MatchImportDialogCntr ">
                        <div class="field">
                            <label>{{ getNLS('design-gpt.prompt') }}</label>
                            <textarea 
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
                    {{ errorMSG }}
                </div>

                <div class="MatcButtonBar MatcMarginTop" v-if="tab === 'openai'">
                    
                    <a class=" MatcButton" @click.stop="onCreatePreview">
                        {{getNLS('design-gpt.preview') }}
                    </a>
                    <a class=" MatcButton" v-if="preview" @click.stop="onSave">{{ getNLS('btn.import') }}</a>
                    <a class=" MatcLinkButton" @click.stop="onCancel">{{ getNLS('btn.cancel') }}</a>
                </div>

                <div class="MatcButtonBar MatcMarginTop" v-if="tab === 'settings'">
                    <a class=" MatcButton" @click.stop="tab = 'openai'">
                        {{getNLS('btn.save') }}
                    </a>
                    <a class=" MatcLinkButton" @click.stop="onCancel">{{ getNLS('btn.cancel') }}</a>
                </div>

            </div>

            <div :class="['MatchImportDialogPreviewCntr' ,{'MatchImportDialogAIRunning': isRunningAI}]">
                <!-- <div class="MatcHint" v-if="!preview">
                    {{ hint }}
                    <div class="MatchImportDialogProgressCntr"> 
                        <div class="MatchImportDialogProgress"></div>
                    </div>
                </div> -->

              
             
                <div ref="simCntr" class="MatchImportOpenAIDialogSimulator" v-show="preview">
                </div>

                <div class="MatcDesignRoboCntr" v-if="!preview">
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
//import SegmentButton from 'page/SegmentButton'
import CheckBox from 'common/CheckBox'

export default {
    name: 'OpenAIDialog',
    mixins: [Util, DojoWidget],
    data: function () {
        return {
            tab: "openai",
            hasContinue: false,
            uploadFiles: [],
            uploadPreviews: [],
            hasZip: false,
            zoom: 1,
            errorMSG: '',
            progressMSG: '',
            progessPercent: 0,
            isPublic: false,
            prompt: 'Create a simple login page with a forget password link. make the buttons red. put the labels above the input elements.',
            openAIKey: '',
            preview: null,
            hint: this.getNLS('design-gpt.no-preview'),
            promptHistory: [],
            isWireFrame: false,
            isMinimal: false,
            isRunningAI: false,
            robo: {
                icon:'mdi mdi-robot-outline',
                messages: [],
            }
        }
    },
    components: {
        CheckBox
    },
    computed: {
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
            this.hint = this.getNLS('design-gpt.busy')
            this.runDesignGPT()
        },

        async runDesignGPT() {
            if (!this.model) {
                this.errorMSG = 'No model'
            }
           
            this.promptHistory.push(this.prompt)
           
            const aiService = Services.getAIService()
            this.isRunningAI = true
            this.startRobo()
            const result = await aiService.runFake(this.prompt, this.openAIKey, this.model) // await aiService.runGPT35Turbo(this.prompt, this.openAIKey, this.model)
            this.isRunningAI = false
            if (result.error) {
                this.setError(result.error)
            } else {
                this.html = result.html
                console.debug(this.html)
                this.buildApp(this.html)
            }
        },

        startRobo () {
            this.robo.messages = [this.getNLS('design-gpt.robo-running-1')]
            let waitingMessages = [
                this.getNLS('design-gpt.robo-waiting-1'),
                this.getNLS('design-gpt.robo-waiting-2'),
                this.getNLS('design-gpt.robo-waiting-3'),
                this.getNLS('design-gpt.robo-waiting-4'),
                this.getNLS('design-gpt.robo-waiting-5'),
                this.getNLS('design-gpt.robo-waiting-6'),
                this.getNLS('design-gpt.robo-waiting-7'),
                this.getNLS('design-gpt.robo-waiting-8'),
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
            this.robo.icon = 'mdi mdi-robot-excited'
            this.updateRobo(waitingMessages, delayedMessages, 0)
        },

        updateRobo (waitingMessages, delayedMessages, call = 0, delayedTheshold = 2) {
            setTimeout(() => {
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
        if (!this.openAIKey) {
            this.tab = 'settings'
        }
        this.stopRobo()
    }
}
</script>