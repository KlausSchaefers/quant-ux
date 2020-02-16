
<template>
     <div class="MatcToolbarTableSettings">

      <div class="MatcToolbarTabs MatcToolbarTabsBig">
            <a @click="tab='actions'" :class="{'MatcToolbarTabActive': tab === 'actions'}">Actions</a>
            <a @click="tab='columns'" :class="{'MatcToolbarTabActive': tab === 'columns'}">Columns</a>
        </div>

        <div class="MatcToolbarTableSettingsCntr">
         

            <div v-if="tab === 'actions'" class="MatcDialogTable">
                    <table  class="MatcToolbarTableSettingsTable">
                       <tbody>
                            <tr class="MatcFormRow">
                                <td style="width:320px;">Name</td>
                                <td style="width:70px;">Color</td>
                                <td style="width:70px;">Hover</td>
                                <!--
                                <th style="width:70px; text-align=center;"><span class="mdi mdi-format-color-fill"/></th>
                                <th style="width:70px; text-align=center;"><span class="mdi mdi-border-color"/></th>
                                <th style="width:70px; text-align=center;"><span class="mdi mdi-vector-radius"/></th>
                                <th style="width:70px; text-align=center;"><span class="mdi mdi-arrow-all"/></th>
                                -->
                                <td style="width:120px"></td>
                           
                            </tr>
                      
                     
                            <tr class="MatcFormRow">
                                <td>
                                    <input class="form-control vommondInlineEdit" placeholder="Enter action name" @change="addAction"/>
                                </td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr class="MatcFormRow" v-for="(action, i) in props.tableActions" :key="i">
                                <td>
                                    <input class="form-control vommondInlineEdit" v-model="action.label"/>
                                </td>
                                <td>
                                    <ToolbarColor
                                        :isDialog="true"
                                        icon="MatcToolbarColorIndicator"
                                        :app="model"
                                        :color="action.color"
                                        @change="onChangeActionColor(action, 'color', $event)"/>
                                </td>
                                <td>
                                    <CheckBox 
                                        v-model="action.isHover" 
                                        label="" />

                                </td>
                                <!--
                                <td>
                                    <ToolbarColor
                                        :isDialog="true"
                                        icon="MatcToolbarColorIndicator"
                                        :app="model"
                                        :color="action.background"
                                        @change="onChangeActionColor(action, 'background', $event)"/>
                                </td>
                                <td>
                                    <ToolbarColor
                                        :isDialog="true"
                                        icon="MatcToolbarColorIndicator"
                                        :app="model"
                                        :color="action.borderColor"
                                        @change="onChangeActionColor(action, 'borderColor', $event)"/>
                                </td>
                                <td>
                                    <input class="form-control form-control-xs" v-model="action.borderRadius"/>
                                </td>
                                <td>
                                    <input class="form-control form-control-xs" v-model="action.padding"/>
                                </td>
                                -->
                                <td>
                                    <a class="MatcFormRowHoverAction" @click="removeAction(i)"> Remove</a>
                                </td>
                            </tr>
                        </tbody>
                    </table>

         
            </div> <!-- End Actions -->


            <div v-if="tab === 'columns'" class="MatcDialogTable">
                   <table  class="MatcToolbarTableSettingsTable">
                        <tbody>
                            <tr>
                                <td style="width:320px;">Name</td>
                                <td style="width:320px;">Data Binding</td>
                                <td style="width:120px"></td>
                            </tr>
                    
                            <tr>
                                <td>
                                    <input class="form-control vommondInlineEdit" placeholder="Enter column data binding" @change="addColumn"/>
                                </td>
                                <td></td>
                                <td></td>
                            </tr>
                     
                            <tr class="MatcFormRow" v-for="(column, i) in props.columns" :key="i">
                                <td>
                                    <input class="form-control vommondInlineEdit" v-model="column.label"/>
                                </td>
                                <td>
                                    <input class="form-control vommondInlineEdit" placeholder="Databinding Variable" v-model="column.databinding"/>
                                </td>
                              
                                <td>
                                    <a class="MatcFormRowHoverAction" @click="removeColumn(i)"> Remove</a>
                                </td>
                            </tr>
                        </tbody>
                    </table>

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
            tab: 'actions',
            widget: '',
            model: '',
            settings: {},
            style: {},
            props: {
                tableActions: [],
                columns: []
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
            this.style = lang.clone(this.widget.style)
            this.props = lang.clone(this.widget.props)
            if (!this.props.tableActions) {
                this.$set(this.props, 'tableActions', [])
            }
            if (!this.props.columns) {
                this.$set(this.props, 'columns', [])
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
            let color = this.props.tableActions.length > 0 ? this.props.tableActions[0].color : '#333333'
            let background = this.props.tableActions.length > 0 ? this.props.tableActions[0].background : '#ffffff'
            let borderColor = this.props.tableActions.length > 0 ? this.props.tableActions[0].borderColor : '#333333'
            this.props.tableActions.push({
                label: input.value,
                callback: '',
                padding: 5,
                background: background,
                borderColor: borderColor,
                borderRadius: 2,
                borderWidth: 1,
                color: color,
                isHover: false
            })
            input.value = ''
        },
        removeAction (i) {
            this.$delete(this.props.tableActions, i)
        },
        onChangeActionColor (action, key, color) {
            this.$set(action, key, color)
        },

        addColumn (e) {
            let input = e.target
            this.props.columns.push({
                label: input.value,
                databinding: ''
            })
            input.value = ''
        },

        removeColumn (i) {
            this.$delete(this.props.columns, i)
        },

        getValue () {
            return {
                'tableActions': this.props.tableActions,
                'columns': this.props.columns
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