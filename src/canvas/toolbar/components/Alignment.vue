
<template>
     <div class="MatcAlignment">	
         <a :class="'MatcAlignmentElement ' + o" v-for="o in distOptions" :key="o.value" @click="onDist(o)">
            <span class="MatcAlignmentLine1"/>
            <span class="MatcAlignmentLine2"/>
            <span class="MatcAlignmentBlock1"/>
        </a>
        <a :class="'MatcAlignmentElement ' + o" v-for="o in alignOptions" :key="o.value" @click="onAlign(o)">
            <span class="MatcAlignmentLine1"/>
            <span class="MatcAlignmentBlock1"/>
            <span class="MatcAlignmentBlock2"/>
        </a>
	</div>
</template>
<style lang="scss">
	@import '../../../style/scss/toolbar_align.scss';
</style>

<script>
import DojoWidget from 'dojo/DojoWidget'
import _Tooltip from 'common/_Tooltip'


export default {
    name: 'Alignment',
    mixins:[_Tooltip, DojoWidget],
    data: function () {
        return {
            distOptions: ["vertical", "horizontal"],
            alignOptions: [
                "top", "bottom", "left", "right", "vertical", "horizontal"
            ]
        }
    },
    components: {},
    methods: {
        onDist (o) {
            this.emit('dist', o)
        },
        onAlign (o) {
            this.emit('align', o)
        }
    }, 
    mounted () {
    }
}
</script>