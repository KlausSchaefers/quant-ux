
<template>
     <div class="MatcToolbarTableSettings">
     
    
      <div class="MatcToolbarTabs MatcToolbarTabsBig">
            <a @click="tab='output'" :class="{'MatcToolbarTabActive': tab === 'output'}">Columns</a>
            <a @click="tab='input'" :class="{'MatcToolbarTabActive': tab === 'input'}">Data</a>
            <a @click="tab='input'" :class="{'MatcToolbarTabActive': tab === 'input'}">Style</a>
            <a @click="tab='auth'" :class="{'MatcToolbarTabActive': tab === 'auth'}">CheckBox</a>
            <a @click="tab='params'" :class="{'MatcToolbarTabActive': tab === 'params'}" >Actions</a>
            <a @click="tab='preview'" :class="{'MatcToolbarTabActive': tab === 'preview'}"></a>
        </div>

        <div>
            {{style.headerBackground}}
            <ToolbarColor 
                :isDialog="true" 
                icon="mdi mdi-border-color" 
                :app="model" 
                :color="style.headerBackground" 
                @change="onChange"/>

            <ToolbarColor :isDialog="true" icon="mdi mdi-format-color-fill" :app="model" @change="onChange"/>
            
        </div>

	</div>
</template>

<script>
import DojoWidget from 'dojo/DojoWidget'
import Logger from 'common/Logger'
import lang from 'dojo/_base/lang'
import ToolbarColor from 'canvas/toolbar/ToolbarColor'
// import SegmentButton from 'page/SegmentButton'
// import DropDownButton from 'page/DropDownButton'


export default {
    name: 'TableSettings',
    mixins:[DojoWidget],
    props:["app", "value"],
    data: function () {
        return {
            tab: '',
            widget: '',
            model: '',
            settings: {},
            style: ''
        }
    },
    components: {
        'ToolbarColor': ToolbarColor
       // 'SegmentButton': SegmentButton
    },
    computed: {
        
    },
    methods: {
        setWidget (w) {
            this.widget = w
            this.settings = lang.clone(this.widget.settings)
            this.style = lang.clone(this.widget.style)
		},
		
		setModel  (m){
            this.model = m;
        },
        onChange (c) {
            console.debug('onChange', c)
        }
    },
    watch: {
        value (v) {
            this.setWidget(v)
        }
    },
    mounted () {
        this.logger = new Logger("TableSettings")
         if (this.app) {
            this.setModel(this.app)
            console.debug(this.model)
        }
        if (this.value) {
            this.setWidget(this.value)
            console.debug(this.value)
        }
    }
}
</script>