
<template>
     <div class="MatcToolbarTableSettings">


      <div class="MatcToolbarTabs MatcToolbarTabsBig">
            <a @click="tab='style'" :class="{'MatcToolbarTabActive': tab === 'style'}">Style</a>
            <a @click="tab='border'" :class="{'MatcToolbarTabActive': tab === 'border'}">Border</a>
            <a @click="tab='checkbox'" :class="{'MatcToolbarTabActive': tab === 'checkbox'}">CheckBox</a>
            <a @click="tab='actions'" :class="{'MatcToolbarTabActive': tab === 'actions'}">Actions</a>
            <a @click="tab='columns'" :class="{'MatcToolbarTabActive': tab === 'columns'}" v-if="hasDataBinding">Columns</a>
        </div>

        <div class="MatcToolbarTableSettingsCntr">
            <div v-if="tab === 'style'" class="">

                <div v-for="field in fields.style" :key="field.value" class="MatcFormRow">
                    <label>{{field.label}}</label>
                    <ToolbarColor
                        :isDialog="true"
                        :icon="icon.text"
                        :app="model"
                        :color="style[field.value]"
                        @change="onChangeStyle(field.value, $event)"/>
                </div>

            </div> <!-- End style -->

             <div v-if="tab === 'border'" class="">


                <div class="MatcFormRow">
                     <label>Border Type </label> Style: {{style.borderStyle}}
                     <div v-for="option in borderOptions" :key="option.value">
                         <CheckBox :label="option.label" :value="style.borderStyle == option.value" @change="setBorderStyle(option.label)"/>
                     </div>

                </div>


                <div class="MatcFormRow">
                    <label>Border Color </label>
                    <ToolbarColor
                        :isDialog="true"
                        :icon="icon.text"
                        :app="model"
                        :color="style.borderBottomColor"
                        @change="onChangeStyle('borderBottomColor', $event)"/>
                </div>
            </div> <!-- End Border -->
        </div>

	</div>
</template>

<script>
import DojoWidget from 'dojo/DojoWidget'
import Logger from 'common/Logger'
import lang from 'dojo/_base/lang'
import ToolbarColor from 'canvas/toolbar/ToolbarColor'
// import SegmentButton from 'page/SegmentButton'
import CheckBox from 'common/CheckBox'
// import DropDownButton from 'page/DropDownButton'


export default {
    name: 'TableSettings',
    mixins:[DojoWidget],
    props:["app", "value"],
    data: function () {
        return {
            tab: 'style',
            widget: '',
            model: '',
            settings: {},
            style: '',
            hasDataBinding: true,
            icon: {
                fill: 'MatcToolbarColorIndicator',
                text: 'MatcToolbarColorIndicator',
                border: 'mdi mdi-border-color'
            },
            borderOptions: [
			    { value:"Cell", icon:"mdi mdi-border-all", label : "Full Border"},
   			    { value:"HLines", icon:"mdi mdi-border-horizontal", label : "Horizontal Border"},
	   			{ value:"VLines", icon:"mdi mdi-border-vertical", label : "Vertical Border"},
	   			{ value:"None", icon:"mdi mdi-border-none", label : "No Border"},
	   			{ value:"Out", icon:"mdi mdi-border-outside", label : "Outside Border"}
   			],
            fields: {
                style: [
                    {
                        label: 'Header Background',
                        value: 'headerBackground',
                        type: 'Color'
                    },
                    {
                        label: 'Header Color',
                        value: 'headerColor',
                        type: 'Color'
                    },{
                        label: 'Odd Row Background',
                        value: 'background',
                        type: 'Color'
                    },
                    {
                        label: 'Odd Row Color',
                        value: 'color',
                        type: 'Color'
                    },
                    {
                        label: 'Even Row Background',
                        value: 'evenRowBackground',
                        type: 'Color'
                    },
                    {
                        label: 'Even Row Color',
                        value: 'evenRowColor',
                        type: 'Color'
                    }
                ]
            }
        }
    },
    components: {
        'ToolbarColor': ToolbarColor,
        // 'SegmentButton': SegmentButton,
        'CheckBox': CheckBox
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
        onChangeStyle (key, value) {
            console.debug('onChangeStyle', key, value)
        },
        setBorderStyle (value) {
            console.debug('setBorderStyle', value)
            this.style.borderStyle = value
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