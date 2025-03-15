<template>
     <div :class="['MatcFlexDialog MatcSimUser MatchImportDialog', {'MatchImportOpenAIDialogDesktop':isDesktop}]">

        <div class="MatcFlexDialogWrapper">


            <div class="MatcToolbarTabs MatcToolbarTabsBig">
                <a @click="tab='openai'" :class="{'MatcToolbarTabActive': tab === 'openai'}">{{ getNLS('sim-user.tab-prompt')}}</a>
               
                <a @click="tab='settings'" :class="{'MatcToolbarTabActive': tab === 'settings'}">{{ getNLS('sim-user.tab-settings')}}</a>
            </div>

            <div v-if="tab === 'settings'"  class="MatcFlexDialogMain">

                <div class="form-group">
                    <label>{{ getNLS('sim-user.rounds') }}</label>
                    <input type="text" class="form-control MatcIgnoreOnKeyPress" v-model="rounds" placeholder="Simulation Rounds" />
                </div>

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

                      
                <div class="form-group MatcFlexGrow">
                    <label>{{ getNLS('sim-user.task') }}</label>
                    <textarea 
                        :placeholder="promptPlaceholder"
                        type="text" 
                        class="form-control MatcIgnoreOnKeyPress" 
                        v-model="prompt" 
                        @keyup.stop
                        ref="promptBox"></textarea>
                </div>

             </div>
            
            <div v-show="tab === 'running'"  class="MatcFlexDialogMain">

                <div class="MatchDialogProgress">            
                        <div class="MatchDialogProgressCntr " >
                            <div class="MatctDialogProgressBar"></div>
                        </div>

                        <div class="MatcHint MatcMarginTop">
                            <p>{{ getNLS('sim-user.waiting-details') }} {{currentRound}} / {{rounds}}</p>
                        </div>
                
                </div>
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
            persona: 'You are an average person with some background in IT. You can use the browsxer and gmail and write simeple mails in word',
            errorMSG:'',
            prompt: '',
            promptPlaceholder: this.getNLS('sim-user.prompt-placeholder'),
            preview: false,
            openAIKey: '',
            rounds: 5,
            currentRound: 0,
        }
    },
    components: {},
    computed: {
       
    },
    methods: {
        async run () {
            Logger.log(-1, 'SimUserDialog.run()', this.prompt)
            localStorage.setItem('quxOpenSimUserLastPrompt', this.prompt)

            this.tab = 'running'
            this.currentRound = 1

            const aiService = Services.getAISimService()
            aiService.onProgress(e => {
                this.updateProgress(e)
            })
            const events = await aiService.run(
                this.prompt, 
                this.persona, 
                this.openAIKey,
                this.model,
                this.rounds
            )
            aiService.destroy()


            this.tab = 'openai'
            this.currentRound = 0

            this.emit('done', events)
            this.$emit('done', events)
        },
        setModel (model) {
            this.model = model   
        },
        onCancel() {
            this.emit('cancel')
        },

        onChangeOpenAIKey () {
        },

        updateProgress() {
            this.currentRound += 1
        },

        saveSettings() {
            localStorage.setItem('quxOpenAIKey', this.openAIKey)
            localStorage.setItem('quxOpenSimUserLastRounds', this.rounds)
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

        let rounds = localStorage.getItem('quxOpenSimUserLastRounds')
        if (rounds) {
            this.rounds = rounds * 1
        }
   
    }
}
</script>