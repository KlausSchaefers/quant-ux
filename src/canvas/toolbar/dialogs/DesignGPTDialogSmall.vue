
<template>
    <div :class="['MatcFlexDialog', {'MatchImportOpenAIDialogDesktop':isDesktop}]">

        <div class="MatcFlexDialogWrapper">


            <div class="MatcToolbarTabs MatcToolbarTabsBig">
                <a @click="tab='openai'" :class="{'MatcToolbarTabActive': tab === 'openai'}">{{ getNLS('design-gpt.tab-prompt')}}</a>
                <a @click="tab='preview'" :class="[{'MatcToolbarTabActive': tab === 'preview'}, {'MatcToolbarTabDisabled': !preview}]">{{ getNLS('design-gpt.tab-preview')}}</a>
                <a @click="tab='settings'" :class="{'MatcToolbarTabActive': tab === 'settings'}">{{ getNLS('design-gpt.tab-settings')}}</a>
            </div>

            
            <div v-if="tab === 'settings'"  class="MatcFlexDialogMain">
                <div class="form-group">
                    <label>{{ getNLS('design-gpt.key-title') }}</label>
                    <form autocomplete="off">
                        <input type="password" autocomplete="off" class="form-control" v-model="openAIKey" @change="onChangeOpenAIKey"/>
                    </form>
                </div>

                <p class="MatchImportOpenAIDialogWarn">
                    {{ getNLS('design-gpt.key-hint-1') }}
                    {{ getNLS('design-gpt.key-hint-2') }}
                    {{ getNLS('design-gpt.key-hint-3') }}
                    <a href="https://platform.openai.com/">openai.com</a>.
                    {{ getNLS('design-gpt.key-hint-5') }}
                </p>

                <div class="form-group MatcMarginTop">
                    <label>{{ getNLS('design-gpt.gpt-model') }}</label>
                    <div>
                        <RadioBoxList :qOptions="gptModels" :qValue="gptVersion" @change="onChangeModelType"/>
                    </div>                
                </div>
            </div>

            <div v-show="tab === 'openai'"  class="MatcFlexDialogMain">
                            
                <textarea 
                    :placeholder="promptPlaceholder"
                    type="text" 
                    class="input" 
                    v-model="prompt" 
                    @keyup="onKeyUp($event)"
                    ref="promptBox"></textarea>
                
            </div>

                
            <div v-show="tab === 'waiting'"  class="MatcFlexDialogMain MatchImportOpenAIDialogWaiting">
             
                <div class="MatcHintCntr">
                        <div class="MatcHint">
                            <p>{{ getNLS('design-gpt.waiting-details') }}</p>
                        </div>
                
                        <div class="MatchImportDialogProgressCntr MatcMarginTop" >
                            <div class="MatchImportDialogProgress"></div>
                        </div>
                </div>

                <div class="MatchImportOpenAIDialogHint">
                    <h1>
                        {{ getNLS('design-gpt.hint-did-you-know') }}
                    </h1>
                    {{hint.hint}}
                    <p>
                        "<AnimatedLabel :value="hint.prompt" :duration="70"/>"
                    </p>
                </div>

                  
            </div>

            <div v-show="tab === 'preview'" class="MatcFlexDialogMain MatchImportOpenAIDialogPreview">
                    <div :class="['MatchImportDialogPreviewCntr' ,{'MatchImportDialogAIRunning': isRunningAI}]">
                        <div class="MatcHint" v-if="!preview && !isRunningAI">
                            {{getNLS('design-gpt.no-preview')}}
                        </div>

                        <div ref="simCntr" class="MatchImportOpenAIDialogSimulator">
                        </div>
                    </div>

                    <div class="MatchImportDialogCntrConfig form-group">

                        <CheckBox 
                            :value="isWireFrame" 
                            :label="getNLS('design-gpt.is-wireframe')" 
                            @change="onChangeWireFrame"/>

                        <CheckBox 
                            :value="isCustomStyles" 
                            :label="getNLS('design-gpt.is-custom-styles')" 
                            @change="onChangeCustomStyles"/>

                        <CheckBox 
                            :value="isMinimal" 
                            :label="getNLS('design-gpt.is-minimal')" 
                            @change="onChangeMinimal"/>
                    </div>
           
            </div>

            <div class="MatcError">
                <span>{{errorMSG}}</span>
            </div>

            <div class="MatcButtonBar MatcMarginTop" v-if="tab === 'openai'">
                <a class=" MatcButton MatcButtonPrimary" @click.stop="onCreatePreview"> {{getNLS('design-gpt.preview') }}</a>        
                <a class=" MatcLinkButton" @click.stop="onCancel">{{ getNLS('btn.cancel') }}</a>
            </div>

            <div class="MatcButtonBar MatcMarginTop" v-if="tab === 'waiting'">  
                <a class=" MatcLinkButton" @click.stop="onCancel">{{ getNLS('btn.cancel') }}</a>
            </div>

            <div class="MatcButtonBar MatcMarginTop" v-if="tab === 'preview'">
                <a class=" MatcButton MatcButtonPrimary" v-show="preview" @click.stop="onSave">{{ getNLS('btn.import') }} </a>       
                <a class=" MatcLinkButton" @click.stop="onCancel">{{ getNLS('btn.cancel') }}</a>
            </div>

            <div class="MatcButtonBar MatcMarginTop" v-if="tab === 'settings'">
                <a class=" MatcButton MatcButtonPrimary" @click.stop="saveSettings"> {{getNLS('btn.save') }}</a>
                <a class=" MatcLinkButton" @click.stop="onCancel">{{ getNLS('btn.cancel') }}</a>
            </div>

      

        </div>

        <div ref="iframeCntr" class="iframeCntr"></div>
    </div>
</template>
<style lang="scss">
@import '../../../style/components/flex_dialog.scss';
@import '../../../style/components/gpt_dialog.scss';


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
import AnimatedLabel from 'common/AnimatedLabel'
import YAMLImporter from '../../../core/ai/YAMLImporter'

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
            hint: this.getNLS('design-gpt.hint-1'),
            promptHistory: [],
            isWireFrame: false,
            isMinimal: false,
            isRunningAI: false,
            isCustomStyles: false,
            isToggleWireFrameAndCustom: false,
            hasRobo: true,
            openAITemperature: 2,
            gptVersion: 'gpt4-turbo-yaml',
            gptModels: [
                // {value: 'gpt3', label: this.getNLS('design-gpt.gpt-model-gpt3')},
                // {value: 'gpt4', label: this.getNLS('design-gpt.gpt-model-gpt4')},          
                {value: 'gpt4-turbo-yaml', label: this.getNLS('design-gpt.gpt-model-gpt4-turbo-yaml')},
                {value: 'gpt4-turbo', label: this.getNLS('design-gpt.gpt-model-gpt4-turbo')}     
            ],
            robo: {
                icon:'mdi mdi-robot-outline',
                messages: [],
            }
        }
    },
    components: {
        CheckBox,RadioBoxList,AnimatedLabel
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

        async onCreatePreview() {
            this.logger.log(-1, 'onCreatePreview', 'enter')
            this.cleanUp()         
            this.runDesignGPT()
        },

        async runDesignGPT() {
            if (!this.model) {
                this.logger.error('runDesignGPT', 'No model')
                this.setError('design-gpt.error-no-model')
                return
            }          
            if (!this.prompt || this.prompt.length < 5) {
                this.setError('design-gpt.error-prompt-too-short')
                return
            } 
            if (!this.openAIKey || this.openAIKey.length < 5) {
                this.setError('design-gpt.error-server-no-key')
                this.tab = 'settings'
                return
            }

            localStorage.setItem('quxOpenAILastPrompt', this.prompt)

            this.promptHistory.push(this.prompt)
            this.tab = 'waiting'
            this.isRunningAI = true
            this.startHints()
            const result = await this.runGTPT()
            //const result = await Services.getAIService().runFake(40000)
            this.isRunningAI = false
            if (result.error) {
                this.hint = this.getNLS('design-gpt.no-preview'),
                this.setError(result.error)
            } else {
                if (result.html) {
                    this.html = result.html
                    this.yaml = ''
                    this.buildAppHTML(this.html)
                }
                if (result.yaml) {
                    this.yaml = result.yaml
                    this.html = ''
                    this.buildAppYAML(this.yaml)
                }
     
            }
        },

        runGTPT () {
            this.logger.log(-1, 'runGTPT', 'enter', this.gptVersion )
            const aiService = Services.getAIService()
            if (this.gptVersion === 'gpt4') {
                return aiService.runGPT4(this.prompt, this.openAIKey, this.model, {isCustomStyles: this.isCustomStyles})
            }
            if (this.gptVersion === 'gpt4-turbo') {
                return aiService.runGPT4Turbo(this.prompt, this.openAIKey, this.model, {isCustomStyles: this.isCustomStyles})
            }
            if (this.gptVersion === 'gpt4-turbo-yaml') {

                //return aiService.runFakeYamlBug()
                return aiService.runGPT4TurboYaml(this.prompt, this.openAIKey, this.model, {isCustomStyles: this.isCustomStyles})
            }

            return aiService.runGPT35Turbo(this.prompt, this.openAIKey, this.model, {isCustomStyles: this.isCustomStyles})
        },


        startHints () {
            const waitingMessages = this.getWaitingMessages()
            this.updateHint(waitingMessages, 0)
        },

        updateHint (waitingMessages, call = 0) {
            const m = waitingMessages.pop()   
            if (!this.isRunningAI || !m) {
                return
            }     
            this.hint = m
            this.updateTimeout = setTimeout(() => {
                this.updateHint(waitingMessages, call+1)
            }, 15000)
        },
        
        getWaitingMessages () {
            const waitingMessages = []
            for (let i = 1; i <= 5; i++) {
                waitingMessages.push({
                    hint: this.getNLS('design-gpt.hint-' + i),
                    prompt: this.getNLS('design-gpt.hint-' + i + '-prompt'),
                })
            }
            return waitingMessages
                .map(value => ({ value, sort: Math.random() }))
                .sort((a, b) => a.sort - b.sort)
                .map(({ value }) => value)
        },

        setError (errorKey) {
            this.errorMSG = this.getNLS(errorKey)
            this.robo.icon = "mdi mdi-robot-dead"
            this.robo.messages = [this.errorMSG]
            clearTimeout(this.updateTimeout)
        },

        buildAppYAML (yaml) {
            this.tab = 'preview'
            const width = this.model.screenSize.w
            const height = this.model.screenSize.h
            const importer = new YAMLImporter(this.model.lastUUID)
            const result = importer.yamlQuantUX(yaml, this.$refs.iframeCntr, width, height , {
                isRemoveContainers: this.isMinimal,
                isWireFrame: this.isWireFrame,
                customStyle: this.getCustomerStyles()
            })

            if (result) {
                this.preview = result
                this.$nextTick(() => {
                    this.buildPreview(result)
                })              
            }
        },

        async buildAppHTML (html) {
            this.tab = 'preview'
            try {
                const width = this.model.screenSize.w
                const height = this.model.screenSize.h
                const importer = new HTMLImporter(this.model.lastUUID)
                const result = await importer.html2QuantUX(html, this.$refs.iframeCntr, width, height , {
                    isRemoveContainers: this.isMinimal,
                    customStyle: this.getCustomerStyles(),
                    defaultStyle: this.getDefaultStyle()
                })
                if (result) {
                    this.preview = result
                    this.$nextTick(() => {
                        this.buildPreview(result)
                    })              
                } 
            } catch (err) {
                this.hint = this.getNLS('design-gpt.no-preview'),
                this.setError('design-gpt.error-yaml')
            }
        },

        getCustomerStyles () {
            if (this.isCustomStyles) {
                return StyleImporter.getCustomStyle(this.model)
            }
            return null
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

            const s = this.$new(Simulator, { 
                mode: "debug", 
                logData: false, 
                runTimerLinesOnScreenLoad: false, 
                isDesktopTest: true, 
                isWiringEvents: true 
            });
            s.scrollListenTarget = "parent";
            s.setHash(this.hash)     
            s.initParent = () => { };
            //s.setScrollContainer(scroller);
            scroller.wrap(s.domNode);
            cntr.appendChild(container);
            return s;
        },

        cleanUp() {
            this.errorMSG = ''
            this.hint = this.getNLS('design-gpt.no-preview'),
            clearTimeout(this.updateTimeout)
   
            this.preview = null
            if (this.simulator) {
                this.simulator.destroy()
                this.simulator = null
            }
            if (this.$refs.simCntr) {
                this.$refs.simCntr.innerHTML = ''
            }
        },

        onChangeOpenAITemperature () {        
        },

        onChangeModelType (v) {
            this.gptVersion = v
        },

        onChangeOpenAIKey () {
        },

        onChangeWireFrame (v) {
            this.isWireFrame = v
            if (this.isWireFrame && this.isToggleWireFrameAndCustom) {
                this.isCustomStyles = false
            }
            this.saveOptions()
        },

        onChangeCustomStyles (v) {
            this.isCustomStyles = v
            if (this.isCustomStyles && this.isToggleWireFrameAndCustom) {
                this.isWireFrame = false
            }
            this.saveOptions()
        },

        onChangeMinimal(v) {
            this.isMinimal = v
            this.saveOptions()           
        },

        saveOptions () {
            localStorage.setItem('quxOpenAIIsWireFrame', this.isWireFrame)
            localStorage.setItem('quxOpenAIIsMinimal', this.isMinimal)
            localStorage.setItem('quxOpenAIIsCustomStyles', this.isCustomStyles)
            if (this.html) {
                this.buildAppHTML(this.html)
            }
            if (this.yaml) {
                this.buildAppYAML(this.yaml)
            }
        },

        saveSettings() {
            localStorage.setItem('quxOpenAITemperature', this.openAITemperature)
            localStorage.setItem('quxOpenAIGPTVersion', this.gptVersion)
            localStorage.setItem('quxOpenAIKey', this.openAIKey)
            this.tab = 'openai'
        }  

    },
    mounted() {
        this.logger = new Logger("DesignGPTDialog");
        this.openAIKey = localStorage.getItem('quxOpenAIKey')
        this.isWireFrame = localStorage.getItem('quxOpenAIIsWireFrame')=== 'true' ? true : false
        this.isMinimal = localStorage.getItem('quxOpenAIIsMinimal') === 'true' ? true : false
        this.isCustomStyles = localStorage.getItem('quxOpenAIIsCustomStyles') === 'true' ? true : false
        this.gptVersion = localStorage.getItem('quxOpenAIGPTVersion') ? localStorage.getItem('quxOpenAIGPTVersion') : 'gpt3'
        if (!this.openAIKey) {
            this.tab = 'settings'
        }
        let lastPrompt =  localStorage.getItem('quxOpenAILastPrompt')
        if (lastPrompt) {
            this.prompt = lastPrompt
        }
        // if (location.href.indexOf('localhost') > 0) {
        //     this.prompt = `

        //     `
        // }
    }
}
</script>