<template>
     <div :class="['MatcFlexDialog MatcSimUser MatchImportDialog', {'MatchImportOpenAIDialogDesktop':isDesktop}]">

        <div class="MatcFlexDialogWrapper">


            <div class="MatcToolbarTabs MatcToolbarTabsBig">
                <a @click="tab='openai'" :class="{'MatcToolbarTabActive': tab === 'openai'}">{{ getNLS('sim-user.tab-prompt')}}</a>
               
                <a @click="tab='settings'" :class="{'MatcToolbarTabActive': tab === 'settings'}">{{ getNLS('sim-user.tab-settings')}}</a>
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
              
            </div>

            <div v-show="tab === 'openai'"  class="MatcFlexDialogMain">
                            
                <textarea 
                    :placeholder="promptPlaceholder"
                    type="text" 
                    class="form-control MatcIgnoreOnKeyPress" 
                    v-model="prompt" 
                    @keyup.stop
                    ref="promptBox"></textarea>
                            
             </div>
            

             <div class="MatcError">
                <span>{{errorMSG}}</span>
            </div>

            <div class="MatcButtonBar MatcMarginTop" v-if="tab === 'openai'">
                <a class=" MatcButton MatcButtonPrimary" @click.stop="run"> {{getNLS('design-gpt.preview') }}</a>        
                <a class=" MatcLinkButton" @click.stop="onCancel">{{ getNLS('btn.cancel') }}</a>
            </div>

            <div class="MatcButtonBar MatcMarginTop" v-if="tab === 'waiting'">  
                <a class=" MatcLinkButton" @click.stop="onCancel">{{ getNLS('btn.cancel') }}</a>
            </div>

            <div class="MatcButtonBar MatcMarginTop" v-if="tab === 'settings'">
                <a class=" MatcButton MatcButtonPrimary" @click.stop="saveSettings"> {{getNLS('btn.save') }}</a>
                <a class=" MatcLinkButton" @click.stop="onCancel">{{ getNLS('btn.cancel') }}</a>
            </div>
        </div>
    </div>
</template>
<style scoped>
textarea {
    height: 200px;
}
</style>

<style lang="scss">
  @import "../../../style/components/simuser.scss" ;
</style>


<script>
import DojoWidget from 'dojo/DojoWidget'
import Logger from '../../../core/Logger';
import Services from 'services/Services'

export default {
    name: 'SimUserDialog',
    mixins:[DojoWidget],
    props: [],
    data: function () {
        return {
            tab: 'openai',
            isDesktop: false,
            errorMSG:'',
            prompt: '',
            promptPlaceholder: this.getNLS('sim-user.prompt-placeholder'),
            preview: false,
            openAIKey: ''     
        }
    },
    components: {},
    computed: {
       
    },
    methods: {
        async run () {
            Logger.log(-1, 'SimUserDialog.run()', this.prompt)
            localStorage.setItem('quxOpenSimUserLastPrompt', this.prompt)

            const aiService = Services.getAISimService()
            const events = await aiService.run(this.openAIKey, this.openAIKey, this.prompt)

            this.emit('done', events)
        },
        setModel (model) {
            this.model = model   
        },
        onCancel() {
            this.emit('cancel')
        },

        onChangeOpenAIKey () {
        },

        saveSettings() {
            localStorage.setItem('quxOpenAIKey', this.openAIKey)
            this.tab = 'openai'
        }
    },
    watch: {
    },
    async mounted () {
        this.openAIKey = localStorage.getItem('quxOpenAIKey')
        this.gptVersion = localStorage.getItem('quxOpenAIGPTVersion') ? localStorage.getItem('quxOpenAIGPTVersion') : 'gpt3'
        if (!this.openAIKey) {
            this.tab = 'settings'
        }
        let lastPrompt =  localStorage.getItem('quxOpenSimUserLastPrompt')
        if (lastPrompt) {
            this.prompt = lastPrompt
        }
   
    }
}
</script>