
<template>
     <div class="MatcToolbarRestSettings">
     
    
      <div class="MatcToolbarTabs MatcToolbarTabsBig">
            <a @click="tab='output'" :class="{'MatcToolbarTabActive': tab === 'output'}">Columns</a>
            <a @click="tab='input'" :class="{'MatcToolbarTabActive': tab === 'input'}">Data</a>
            <a @click="tab='input'" :class="{'MatcToolbarTabActive': tab === 'input'}">Style</a>
            <a @click="tab='auth'" :class="{'MatcToolbarTabActive': tab === 'auth'}">CheckBox</a>
            <a @click="tab='params'" :class="{'MatcToolbarTabActive': tab === 'params'}" >Actions</a>
            <a @click="tab='preview'" :class="{'MatcToolbarTabActive': tab === 'preview'}"></a>
        </div>


	</div>
</template>

<script>
import DojoWidget from 'dojo/DojoWidget'
import Logger from 'common/Logger'
// import SegmentButton from 'page/SegmentButton'
// import DropDownButton from 'page/DropDownButton'


export default {
    name: 'TableSettings',
    mixins:[DojoWidget],
    props:["app", "value"],
    data: function () {
        return {
            tab: ''
        }
    },
    components: {
       // 'SegmentButton': SegmentButton
    },
    computed: {
        
    },
    methods: {
    },
    watch: {
        value (v) {
            this.setWidget(v)
        }
    },
    mounted () {
        this.logger = new Logger("TableSettings")
    }
}
</script>