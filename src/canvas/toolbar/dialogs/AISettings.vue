
<template>
     <div class="MatcAiSettings" @keydown.stop="" @keyup.stop="">
        
            <!-- <p class="MatcCard MatcCardWarning MatcCardS">
                {{ getNLS('ai.access_token_info') }}
            </p> -->

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

export default {
    name: 'AISettings',
    mixins:[DojoWidget],
    data: function () {
        return {
            selectedProvider: '',
            tokenOpenAI: '',
            tokenGemini: '',
            tokenAnthropic: '',
            provider: [
                { label: "OpenAI", value: 'openai' },
                { label: "Anthropic", value: 'anthropic' },
                { label: "Gemini (Google)", value: "gemini" },
                // { label: "Other", value: "other" }
            ]
        }
    },
    components: {RadioBoxList},
    methods: {
        save () {
            const value = JSON.stringify({
                'provider': this.selectedProvider,
                'tokenOpenAI': this.tokenOpenAI,
                'tokenGemini': this.tokenGemini,
                'tokenAnthropic': this.tokenAnthropic
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
    mounted () {
        const saved = localStorage.getItem('quxAISettings')
        if (saved) {
            const data = JSON.parse(saved)
            this.selectedProvider = data.provider
            this.tokenOpenAI = data.tokenOpenAI
            this.tokenGemini = data.tokenGemini
            this.tokenAnthropic = data.tokenAnthropic
        }
    }
}
</script>