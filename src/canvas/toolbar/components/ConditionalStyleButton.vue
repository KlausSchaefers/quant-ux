
<template>
     <div class="MatcConditionalStyle MatcToolbarItem">
         Style
	</div>
</template>
<style lang="scss">
	@import '../../../style/scss/toolbar_conditional_style.scss';
</style>
<script>
import DojoWidget from 'dojo/DojoWidget'
import Util from 'core/Util'

export default {
    name: 'BoxSize',
    mixins:[Util, DojoWidget],
    data: function () {
        return {
            value: null,
           
        }
    },
    components: {},
    methods: {
    
    },
    mounted () {
    }
}
</script>