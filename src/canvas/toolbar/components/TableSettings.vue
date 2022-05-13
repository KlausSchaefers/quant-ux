
<template>
     <div class="MatcToolbarTableSettings">

      <div class="MatcToolbarTabs MatcToolbarTabsBig">
            <a @click="tab='columns'" :class="{'MatcToolbarTabActive': tab === 'columns'}">Columns</a>
            <a @click="tab='actions'" :class="{'MatcToolbarTabActive': tab === 'actions'}">Actions</a>
        </div>

        <div class="MatcToolbarTableSettingsCntr">


            <div v-if="tab === 'actions'" class="MatcDialogTable MatcDialogTableScrollable">
                    <table  class="MatcToolbarTableSettingsTable">
                        <thead>
                            <tr class="MatcFormRow">
                                <th style="width:270px;">Label</th>
                                <th style="width:70px;">Color</th>
                                <th style="width:70px;">Hover</th>
                                <th style="width:270px;">Action</th>
                                 <th style="width:120px"></th>
                            </tr>
                        </thead>
                       <tbody>
                           


                            <tr class="MatcFormRow" v-for="(action, i) in props.tableActions" :key="i">
                                <td>
                                    <input class="form-control vommondInlineEdit" v-model="action.label"/>
                                </td>
                                <td>
                                    <ToolbarColor
                                        :isDialog="true"
                                        :app="model"
                                        :color="action.color"
                                        @change="onChangeActionColor(action, 'color', $event)"/>
                                </td>
                                <td>
                                    <CheckBox
                                        v-model="action.isHover"
                                        label="" />

                                </td>
                                <td>
                                    <input class="form-control vommondInlineEdit" v-model="action.callback"/>
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
                                    <a class="MatcFormRowHoverAction" @click="removeAction(i)">
                                        <span class="mdi mdi-close"/>
                                    </a>
                                </td>
                            </tr>


                            <tr class="MatcFormRow">
                                <td>

                                    <span class="MatcButton MatcButtonActive" @click="addAction">Add Action</span>
                                   
                                </td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                        </tbody>
                    </table>


            </div> <!-- End Actions -->


            <div v-if="tab === 'columns'" class="MatcDialogTable MatcDialogTableScrollable">
                   <table  class="MatcToolbarTableSettingsTable">
                       <thead>
                            <tr class="MatcFormRow">
                                <th style="width:120px;">Name</th>
                                <th style="width:160px;">Data Binding</th>
                                <th style="width:120px;">Editable</th> 
                                <th style="width:120px;">Color</th> 
                                <th style="width:270px;">Background</th> 
                            </tr>
                       </thead>
                        <tbody>
                       

                       
                            <tr class="MatcFormRow" v-for="(column, i) in props.columns" :key="i">
                         
                                <td>
                                    <span class="form-control-label">
                                        {{column.label}}
                                    </span>
                                </td>
                                <td>
                                    <input class="form-control vommondInlineEdit" placeholder="Databinding Variable" v-model="column.databinding"/>
                                </td>
                                <td>
                                    <CheckBox
                                        v-model="column.isEditable"
                                        label="" />
                                </td>

                                <td>
                                    <ToolbarColor
                                        :isDialog="true"
                                        :app="model"
                                        :color="column.color"
                                        @changing="onChangeColumnColor(column, 'color', $event)"
                                        @change="onChangeColumnColor(column, 'color', $event)"/>
                                </td>
                               
                                <td>
                                    <ToolbarColor
                                        :isDialog="true"
                                        :app="model"
                                        :color="column.background"
                                        @changing="onChangeColumnColor(column, 'background', $event)"
                                        @change="onChangeColumnColor(column, 'background', $event)"/>
                                </td>

                            </tr>

                            <tr v-if="false">
                                <td>
                                    <span class="MatcButton MatcButtonActive" @click="addColumn">Add Column</span>
                                </td>
                                <td></td>
                            
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
import ToolbarColor from './ToolbarColor'
import CheckBox from 'common/CheckBox'

export default {
    name: 'TableSettings',
    mixins:[DojoWidget],
    props:["app", "value", "hasDataBinding"],
    data: function () {
        return {
            tab: 'columns',
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

            this.updateColumns(w)
		},

        updateColumns (w) {
            if (w.props.data) {
                const header = this.getHeader(w.props.data)
                header.forEach((c,i) => {
                    if (!this.props.columns[i]) {
                        this.props.columns[i] = {
                            label: c,
                            isEditable: false,
                            isSortable: false,
                            isSearchable: false
                        }
                    } else {
                        this.props.columns[i].label = c
                    }
                })

                if (this.props.columns.length > header.length) {
                     this.props.columns =  this.props.columns.slice(0, header.length)
                }
            }
        },

        getHeader (data) {
            if (data.substring){
                const firstRow = data.split('\n')[0]
                if (firstRow) {
                   return firstRow.split(',')
                }
                return []
            }
            return data[0]
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

        onChangeColumnColor (column, key, color) {
            this.$set(column, key, color)
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