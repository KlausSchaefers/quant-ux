
<template>
     <div class="MatcCustomFonts" @keydown.stop="" @keyup.stop="">
        
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
</template>
<style lang="scss">
 @import '../../../style/canvas/CustomFonts.scss';
</style>

<script>
import DojoWidget from 'dojo/DojoWidget'

export default {
    name: 'AISettings',
    mixins:[DojoWidget],
    data: function () {
        return {
           
        }
    },
    components: {},
    methods: {
        
        setModel () {
            
        }
        
    },
    mounted () {
    }
}
</script>