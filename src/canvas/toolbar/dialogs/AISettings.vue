
<template>
     <div class="MatcAiSettings" @keydown.stop="" @keyup.stop="">
        
    
            <div class="MatcAiSettingsBody">
                <template v-if="!hasAcceptedAI">
                    <div class="form-group MatcMarginTop">
                        <label>{{ getNLS('ai.tos') }}</label>
                        <div class="MatcFlexAlignCenter">
                            <CheckBox v-model="hasAcceptedAI" @change=""/>
                            <div @click="hasAcceptedAI = !hasAcceptedAI">
                                {{ getNLS("ai.tosCheck")}}
                            </div>
                        </div>     
                            
                    </div>

                    <div class="MatcCardInfo MatcCard MatcCardSmall" >
                            {{ getNLS('ai.tosMore')}}
                            <a href="https://quant-ux.com/termsofservice/" target="tos">{{ getNLS("ai.tosLink")}} </a> and 
                            <a href="https://quant-ux.com/privacy" target="privacy">{{ getNLS("ai.tosLink2")}} </a>
                    </div>  

                    </template>

                    <template v-else>
        

                    <div class="form-group MatcMarginTop">
                        <label>{{ getNLS('ai.provider') }}</label>
                        <div>
                            <RadioBoxList :qOptions="provider" :qValue="selectedProvider" @change="onChangeProvider"/>
                        </div>                
                    </div>

                    <div>
                        <div class="form-group" v-if="selectedProvider === 'openai'">
                            <label>OpenAI {{ getNLS('ai.token') }}</label>
                            <form autocomplete="off">
                                <input type="password" autocomplete="off" class="form-control" v-model="tokenOpenAI"/>
                            </form>
                        </div>
                        <div class="form-group" v-if="selectedProvider === 'anthropic'">
                            <label>Anthropic {{ getNLS('ai.token') }}</label>
                            <form autocomplete="off">
                                <input type="password" autocomplete="off" class="form-control" v-model="tokenAnthropic"/>
                            </form>
                        </div>
                        <div class="form-group" v-if="selectedProvider === 'gemini'">
                            <label>Gemini {{ getNLS('ai.token') }}</label>
                            <form autocomplete="off">
                                <input type="password" autocomplete="off" class="form-control" v-model="tokenGemini"/>
                            </form>
                        </div>

                        <div class="form-group" v-if="selectedProvider === 'openRouter'">
                            <label>Model</label>
                            <DropDownButton v-model="modelOpenRouter" :options="openRouterModels"></DropDownButton>
                        </div>


                        <div class="form-group" v-if="selectedProvider === 'openRouter'">
                            <label>OpenRouter {{ getNLS('ai.token') }}</label>
                            <form autocomplete="off">
                                <input type="password" autocomplete="off" class="form-control" v-model="tokenOpenRouter"/>
                            </form>
                        </div>
      
                    </div>
                    </template>
             </div>
         

            <div class="MatcButtonBar">
                <div class="MatcButton MatcButtonPrimary" @click="save">Save</div>
                <div class="MatcLinkButton" @click="cancel">Cancel</div>
            </div>
	</div>
</template>
<style lang="scss">
</style>

<script>
import DojoWidget from 'dojo/DojoWidget'
import RadioBoxList from 'common/RadioBoxList'
import CheckBox from 'common/CheckBox'
import Services from 'services/Services'
import DropDownButton from 'page/DropDownButton'
import { te } from 'date-fns/locale';
import Logger from '../../../core/Logger';

export default {
    name: 'AISettings',
    mixins:[DojoWidget],
    data: function () {
        return {
            hasAcceptedAI: false,
            selectedProvider: '',
            tokenOpenAI: '',
            tokenGemini: '',
            tokenAnthropic: '',
            tokenOpenRouter: '',
            modelOpenRouter: 'qwen/qwen3.7-flash',
            openRouterModels:[
                { label: "Deep Seek Flash 4", value: 'deepseek/deepseek-v4-flash' },
                { label: "Qwen 3.8 Flash", value: 'qwen/qwen3.8-flash' }
            ],
            provider: [
                { label: "Quant-UX (OpenAI)", value: 'quxOpenAI' },
                { label: "Quant-UX (OpenRouter)", value: 'quxOpenRouter' },
                { label: "OpenAI", value: 'openai' },
                { label: "Anthropic", value: 'anthropic' },
                { label: "Gemini (Google)", value: "gemini" },
                { label: "OpenRouter (DeepSeek)", value: "openRouter" },
            ]
        }
    },
    components: {RadioBoxList, CheckBox, DropDownButton},
    methods: {
        async save () {
            if (!this.hasAcceptedAI) {
                this.emit('close')
                return
            }

            if (this.isUpdateTos) {
                Logger.warn('AISetting.save() > set tos')
                Services.getUserService().setTos('acceptedAI')
            }

            const value = JSON.stringify({
                'provider': this.selectedProvider,
                'tokenOpenAI': this.tokenOpenAI,
                'tokenGemini': this.tokenGemini,
                'tokenAnthropic': this.tokenAnthropic,
                'tokenOpenRouter': this.tokenOpenRouter,
                'modelOpenRouter': this.modelOpenRouter
            })
            localStorage.setItem('quxAISettings',value)
            this.emit('close')
        },
        cancel() {
            this.emit('close')
        },
        onChangeProvider (aiModel) {
            this.selectedProvider = aiModel
        },
        
        setModel () {
            
        }
        
    },
    async mounted () {
        let user = Services.getUserService().load()
        user = await Services.getUserService().loadById(user.id)
        Logger.log(-1, "AiSettings.mounted() > ", user.acceptedAI)
        if (user.acceptedAI && user.acceptedAI > 0) {
            this.hasAcceptedAI = true
        } else {
            this.isUpdateTos = true
        }

        const saved = localStorage.getItem('quxAISettings')
        if (saved) {
            const data = JSON.parse(saved)
            this.selectedProvider = data.provider
            this.tokenOpenAI = data.tokenOpenAI
            this.tokenGemini = data.tokenGemini
            this.tokenAnthropic = data.tokenAnthropic
            this.tokenOpenRouter = data.tokenOpenRouter
            this.modelOpenRouter = data.modelOpenRouter
        }
    }
}
</script>