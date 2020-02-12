
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
                        icon="MatcToolbarColorIndicator"
                        :app="model"
                        :color="style[field.value]"
                        @change="onChangeStyle(field.value, $event)"/>
                </div>

                <div class="MatcFormRow">
                    <label>Header Style</label>
                    <div :class="['MatcFormRow MatcToolbarTableSettingsCheckRow', {'MatcToolbarTableSettingsCheckRowActive': style.headerFontWeight === 700}] " >
                        <CheckBox :value="style.headerFontWeight === 700" label="Bold" @change="onChangeHeaderWeight($event)" />             
                    </div>
                    <div :class="['MatcFormRow MatcToolbarTableSettingsCheckRow', {'MatcToolbarTableSettingsCheckRowActive': style.headerFontStyle === 'italic'}] " >
                        <CheckBox :value="style.headerFontStyle === 'italic'" label="Italic" @change="onChangeHeaderStyle($event)" />             
                    </div>
                </div>

            </div> <!-- End style -->

            <div v-if="tab === 'border'" class="">

                <div class="MatcFormRow">
                     <label>Border Type </label>
                     <div 
                        v-for="option in borderOptions" 
                        :key="option.value" 
                        :class="['MatcFormRow MatcToolbarTableSettingsCheckRow', {'MatcToolbarTableSettingsCheckRowActive': style.borderStyle === option.value}] " 
                        @click="setBorderStyle(option.value)"> 
                        <CheckBox :value="style.borderStyle === option.value"/>
                        <label> {{option.label}}</label>
                        <span :class="option.icon"/>
                     </div>
                </div>

                <div class="MatcFormRow" v-if="style.borderStyle !== 'None'">
                    <label>Border Color </label>
                    <ToolbarColor
                        :isDialog="true"
                        icon="MatcToolbarColorIndicator"
                        :app="model"
                        :color="style.borderBottomColor"
                        @change="onChangeStyle('borderBottomColor', $event)"/>
                </div>

                <div class="MatcFormRow" v-if="style.borderStyle !== 'None'">
                    <label>Border Width </label>
                    <input class="form-control form-control-xs" v-model="style.borderBottomWidth"/>
                </div>
            </div> <!-- End Border -->

            <div v-if="tab === 'checkbox'" class="">

                <div class="MatcFormRow">
                    <CheckBox :value="style.checkBox" label="Show Checkbox" @change="onChangeStyle('checkBox', $event)"/>      
                </div>

                <div v-if="style.checkBox">
                    <div class="MatcFormRow">
                        <label>Size </label>
                        <input class="form-control form-control-xs" v-model="style.checkBoxSize"/>
                    </div>

                    <div class="MatcFormRow">
                        <label>Hook Color</label>
                        <ToolbarColor
                            :isDialog="true"
                            icon="MatcToolbarColorIndicator"
                            :app="model"
                            :color="style.checkBoxHookColor"
                            @change="onChangeStyle('checkBoxHookColor', $event)"/>
                    </div>

                    <div class="MatcFormRow">
                        <label>Background</label>
                        <ToolbarColor
                            :isDialog="true"
                            icon="MatcToolbarColorIndicator"
                            :app="model"
                            :color="style.checkBoxBackground"
                            @change="onChangeStyle('checkBoxBackground', $event)"/>
                    </div>

                    <div class="MatcFormRow">
                        <label>Border Color </label>
                        <ToolbarColor
                            :isDialog="true"
                            icon="MatcToolbarColorIndicator"
                            :app="model"
                            :color="style.checkBoxBorderColor"
                            @change="onChangeStyle('checkBoxBorderColor', $event)"/>
                    </div>

                    <div class="MatcFormRow">
                        <label>Border Radius </label>
                        <input class="form-control form-control-xs" v-model="style.checkBoxBorderRadius"/>
                    </div>
                </div>
         

            </div> <!-- End Check -->

            <div v-if="tab === 'actions'" class="">
                    <div class="MatcFormRow" v-for="(action, i) in props.actions" :key="i">
                        <input class="form-control" v-model="action.label"/>
                        <ToolbarColor
                            :isDialog="true"
                            icon="MatcToolbarColorIndicator"
                            :app="model"
                            :color="action.color"
                            @change="onChangeActionColor(action, $event)"/>
                        
                        <a class="MatcFormRowHoverAction" @click="removeAction(i)"> Remove</a>
                    </div>

                    <div class="MatcFormRow">
                        <input class="form-control" placeholder="Enter action name" @change="addAction"/>
                    </div>

            </div> <!-- End Actions -->
        </div>

	</div>
</template>

<script>
import DojoWidget from 'dojo/DojoWidget'
import Logger from 'common/Logger'
import lang from 'dojo/_base/lang'
import ToolbarColor from 'canvas/toolbar/ToolbarColor'
import CheckBox from 'common/CheckBox'

export default {
    name: 'TableSettings',
    mixins:[DojoWidget],
    props:["app", "value", "hasDataBinding"],
    data: function () {
        return {
            tab: 'style',
            widget: '',
            model: '',
            settings: {},
            style: {},
            props: {},
            borderOptions: [
                { value:"None", icon:"mdi mdi-border-none", label : "No Border"},
			    { value:"Cell", icon:"mdi mdi-border-all", label : "Full Border"},
   			    { value:"HLines", icon:"mdi mdi-border-horizontal", label : "Horizontal Border"},
	   			{ value:"VLines", icon:"mdi mdi-border-vertical", label : "Vertical Border"},
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
        'CheckBox': CheckBox
    },
    computed: {

    },
    methods: {
        setWidget (w) {
            this.widget = w
            this.settings = lang.clone(this.widget.settings)
            this.style = lang.clone(this.widget.style)
            this.props = lang.clone(this.widget.props)
            if (!this.style.borderStyle) {
               this.$set(this.style, 'borderStyle', 'None') 
            }
            if (!this.style.checkBoxSize) {
               this.$set(this.style, 'checkBoxSize', 20)
            }
            if (this.style.checkBox === undefined) {
               this.$set(this.style, 'checkBox', false)
            }
            if (!this.style.checkBoxBorderColor) {
                this.$set(this.style, 'checkBoxBorderColor', '#333333')
            }
            if (!this.style.checkBoxHookColor) {
               this.$set(this.style, 'checkBoxHookColor', '#333333')
            }
            if (!this.style.checkBoxBackground) {
               this.$set(this.style, 'checkBoxBackground', '#ffffff')
            }
            if (!this.style.checkBoxBorderRadius) {
               this.$set(this.style, 'checkBoxBorderRadius', 2)
            }
            if (!this.props.actions) {
                this.$set(this.props, 'actions', [])
            }

		},

		setModel  (m){
            this.model = m;
        },
        onChangeStyle (key, value) {
            this.logger.log(0, 'onChangeStyle', key, value)
            this.$set(this.style, key, value)
        },
        onChangeProps (key, value) {
            this.logger.log(0, 'onChangeProps', key, value)
            this.$set(this.props, key, value)
        },
        setBorderStyle (value) {
            this.onChangeStyle('borderStyle', value)
        },
        addAction (e) {
            let input = e.target
            let color = this.props.actions.length > 0 ? this.props.actions[0].color : '#333333'
            this.props.actions.push({
                label: input.value,
                callback: '',
                color: color
            })
            input.value = ''
        },
        removeAction (i) {
            this.$delete(this.props.actions, i)
        },
        onChangeActionColor (action, color) {
            action.color = color
        },
        onChangeHeaderWeight (value) {
            if (value) {
                this.onChangeStyle('headerFontWeight', 700)
            } else {
                this.onChangeStyle('headerFontWeight', 400)
            }
        },
        onChangeHeaderStyle (value) {
            if (value) {
                this.onChangeStyle('headerFontStyle', 'italic')
            } else {
                this.onChangeStyle('headerFontStyle', null)
            }
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
        }
        if (this.value) {
            this.setWidget(this.value)
        }
    }
}
</script>