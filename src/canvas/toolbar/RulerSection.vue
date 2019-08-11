
<template>
     <div class="MatcToolbarItem">		
		<CheckBox label="Is sticky ruler" :value="sticky" @change="onStickyChange"/>
        <div v-if="sticky" class="MatcHint MatcMarginTop">
            Sticky mode
        </div>
	</div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
// import css from 'dojo/css'
// import lang from 'dojo/_base/lang'
// import on from 'dojo/on'
// import touch from 'dojo/touch'
import CheckBox from 'common/CheckBox'

export default {
    name: 'BoxBorder',
    mixins:[DojoWidget],
    data: function () {
        return {
            sticky: false
        }
    },
    components: {
        'CheckBox': CheckBox
    },
    methods: {
        onStickyChange (value){
            console.debug('onStickyChange', value)
            this.sticky = value
            this.onChange()
        },
        onChange () {
    	    this.emit("change", {
                sticky: this.sticky
            });
        },
        setValue (screen, ruler) {
            console.debug('setValue', ruler)
            this.sticky = ruler.sticky === true
            this.screen = screen
        }
    }, 
    mounted () {
    }
}
</script>