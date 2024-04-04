
<template>
    <div class="MatcToolbarTableSettings">

        <div class="MatcToolbarTabs MatcToolbarTabsBig">
            <a @click="tab = 'data'" :class="{ 'MatcToolbarTabActive': tab === 'data' }">Data</a>
            <a @click="tab = 'columns'" :class="{ 'MatcToolbarTabActive': tab === 'columns' }">Columns</a>
            <a @click="tab = 'actions'" :class="{ 'MatcToolbarTabActive': tab === 'actions' }">Actions</a>
        </div>

        <div class="MatcToolbarTableSettingsCntr">

            <div v-if="tab === 'data'" class="">
                <DataTable v-if="widget" :columns="props.columns" :tableData="props.data" @colNameChange="setColumnName"
                    @change="setData" />
            </div>


            <div v-if="tab === 'actions'" class="MatcDialogTable MatcDialogTableScrollable">
                <table class="MatcToolbarTableSettingsTable">
                    <thead>
                        <tr class="MatcFormRow">
                            <th style="width:120px;">ID</th>
                            <th style="width:120px;">Label</th>
                            <th style="width:50px;">Color</th>
                            <th style="width:50px;">Background</th>
                            <th style="width:50px;">Show on Hover</th>
                            <th style="width:50px"></th>
                        </tr>
                    </thead>
                    <tbody>

                        <tr :class="['MatcFormRow', { 'MatcFormRowDNDHover': i === hoverRow }, { 'MatcFormRowDNDSelect': i == dragRow }]"
                            v-for="(action, i) in props.tableActions" :key="i" :draggable="isDraggable"
                            @dragstart="onActionDragStart($event, i)" @dragover="onActionDragOver($event, i)"
                            @dragleave="onActionDragLeave($event, i)" @drop="onActionDrop($event, i)">
                            <td>
                                <div class="MatcFormRowDND">
                                    <QIcon icon="HandleDND" @mouseover="isDraggable = true" @mouseout="isDraggable = false">
                                    </QIcon>
                                    <input class="form-control" v-model="action.id" />
                                </div>
                            </td>
                            <td>
                                <input class="form-control" v-model="action.label" />
                            </td>
                            <td>
                                <ToolbarColor :isDialog="true" :app="model" :color="action.color"
                                    @change="onChangeActionColor(action, 'color', $event)" />
                            </td>
                            <td>
                                <ToolbarColor :isDialog="true" :app="model" :color="action.background"
                                    @change="onChangeActionColor(action, 'background', $event)" />
                            </td>
                            <td>
                                <CheckBox v-model="action.isHover" label="" />
                            </td>

                            <td class="MatcFormRowRemove">
                                <QIcon icon="DeleteX" @click="removeAction(i)"></QIcon>

                            </td>
                        </tr>


                        <tr class="MatcFormRow">
                            <td>
                                <span class="MatcButton MatcButtonXS" @click="addAction">Add Action</span>
                            </td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                        </tr>
                    </tbody>
                </table>


            </div> <!-- End Actions -->


            <div v-if="tab === 'columns'" class="MatcDialogTable MatcDialogTableScrollable">
                <table class="MatcToolbarTableSettingsTable">
                    <thead>
                        <tr class="MatcFormRow">
                            <th style="width:160px;">Name</th>
                            <th style="width:160px;">Data Binding</th>
                            <th style="width:100px;">Editable</th>
                            <th style="width:60px;">Color</th>
                            <th style="width:60px;">Background</th>
                            <th style="width:60px;">Width</th>
                            <th style="width:50px;"></th>
                        </tr>
                    </thead>
                    <tbody>

                        <tr 
                            :class="['MatcFormRow', { 'MatcFormRowDNDHover': i === hoverRow }, { 'MatcFormRowDNDSelect': i == dragRow }]"
                             v-for="(column, i) in props.columns" :key="i" :draggable="isDraggable"
                            @dragstart="onColDragStart($event, i)" @dragover="onColDragOver($event, i)"
                            @drop="onColDrop($event, i)"  @dragleave="onCol($event, i)">

                            <td>
                                <div class="MatcFormRowDND">
                                    <QIcon icon="HandleDND" @mouseover="isDraggable = true" @mouseout="isDraggable = false">
                                    </QIcon>
                                    <input class="form-control" v-model="column.label" />
                                </div>
                            </td>
                            <td>
                                <input class="form-control" placeholder="Databinding Variable"
                                    v-model="column.databinding" />
                            </td>
                            <td>
                                <CheckBox v-model="column.isEditable" label="" />
                            </td>

                            <td>
                                <ToolbarColor :isDialog="true" :app="model" :color="column.color"
                                    @changing="onChangeColumnColor(column, 'color', $event)"
                                    @change="onChangeColumnColor(column, 'color', $event)" />
                            </td>

                            <td>
                                <ToolbarColor :isDialog="true" :app="model" :color="column.background"
                                    @changing="onChangeColumnColor(column, 'background', $event)"
                                    @change="onChangeColumnColor(column, 'background', $event)" />
                            </td>
                            <td>
                                <input class="form-control" :value="column.width"
                                    @change="setColumnWidth(column, $event)" />
                            </td>
                            <td class="MatcFormRowRemove">
                                <QIcon icon="DeleteX" @click="removeColumn(i)"></QIcon>

                            </td>
                        </tr>

                        <tr>
                            <td>
                                <span class="MatcButton MatcButtonXS" @click="addColumn">Add Column</span>
                            </td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
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
import DataTable from './DataTable'
import QIcon from 'page/QIcon'

export default {
    name: 'TableSettings',
    mixins: [DojoWidget],
    props: ["app", "value", "hasDataBinding"],
    data: function () {
        return {
            dragRow: -1,
            hoverRow: -1,
            isDraggable: false,
            tab: 'data',
            widget: '',
            model: '',
            settings: {},
            style: {},
            props: {
                tableActions: [],
                columns: [],
                data: []
            }
        }
    },
    components: {
        'ToolbarColor': ToolbarColor,
        'CheckBox': CheckBox,
        'DataTable': DataTable,
        'QIcon': QIcon
    },
    computed: {

    },
    methods: {
        onActionDragStart(e, i) {
            e.dataTransfer.setData("text", i);
            e.dataTransfer.effectAllowed = 'move';
            this.dragRow = i
        },
        onActionDragOver(e, i) {
            e.preventDefault();
            this.hoverRow = i
        },
        onActionDragLeave() {
            this.hoverRow = -1
        },
        onActionDrop(e, i) {
            e.preventDefault();
            const data = e.dataTransfer.getData("text");
            const j = data * 1
            if (this.props.tableActions[i] && this.props.tableActions[j]) {
                const temp = this.props.tableActions[i]
                this.props.tableActions[i] = this.props.tableActions[j]
                this.props.tableActions[j] = temp
                this.$forceUpdate()
            }
            this.dragRow = -1
            this.hoverRow = -1
        },
        onColDragStart(e, i) {
            e.dataTransfer.setData("text", i);
            e.dataTransfer.effectAllowed = 'move';
            this.dragRow = i
        },
        onColDragOver(e, i) {
            e.preventDefault();
            this.hoverRow = i
        },
        onColDragLeave() {
            this.hoverRow = -1
        },
        onColDrop(e, i) {
            e.preventDefault();
            const data = e.dataTransfer.getData("text");
            const j = data * 1
            if (this.props.columns[i] && this.props.columns[j]) {
                const temp = this.props.columns[i]
                this.props.columns[i] = this.props.columns[j]
                this.props.columns[j] = temp
                this.$forceUpdate()
            }
            this.dragRow = -1
            this.hoverRow = -1
        },
        setWidget(w) {
            this.widget = w
            this.style = lang.clone(this.widget.style)
            this.props = lang.clone(this.widget.props)
            if (!this.props.tableActions) {
                this.$set(this.props, 'tableActions', [])
            }
            // legacy tables might not have columns
            if (!this.props.columns) {
                const parsedCols = this.parseCols(w)
                this.$set(this.props, 'columns', parsedCols)
            }
        },

        parseCols(widget) {
            if (!widget.props.data) {
                return []
            }
            const data = widget.props.data
            const header = data[0]
            return header.map(h => {
                return {
                    label: h,
                    width: 100,
                    isEditable: false,
                    isSortable: false,
                    isSearchable: false
                }
            })
        },

        addColumn() {
            this.props.columns.push({
                label: '',
                width: 100,
                isEditable: false,
                isSortable: false,
                isSearchable: false
            })
        },

        getHeader(data) {
            if (data.substring) {
                const firstRow = data.split('\n')[0]
                if (firstRow) {
                    return firstRow.split(',')
                }
                return []
            }
            return data[0]
        },

        setModel(m) {
            this.model = m;
        },
        setData(data) {
            this.logger.log(4, 'setData', "enter")
            this.props.data = data
        },
        setColumnName(i, name) {
            this.logger.log(-1, 'setColumnName', "set " + i + " to " + name)
            this.props.columns[i].label = name
        },
        setColumnWidth(col, e) {
            const value = e.target.value
            const er = /^-?[0-9]+$/;
            const isInt = er.test(value);
            if (isInt) {
                col.width = value * 1
            } else {
                this.logger.log(-1, 'setColumnWidth', "Wrong value", value)
            }
        },
        onChangeStyle(key, value) {
            this.logger.log(0, 'onChangeStyle', key, value)
            this.$set(this.style, key, value)
        },
        onChangeProps(key, value) {
            this.logger.log(0, 'onChangeProps', key, value)
            this.$set(this.props, key, value)
        },
        setBorderStyle(value) {
            this.onChangeStyle('borderStyle', value)
        },
        addAction(e) {
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
        removeAction(i) {
            this.$delete(this.props.tableActions, i)
        },
        removeColumn(i) {
            this.$delete(this.props.columns, i)
        },
        onChangeActionColor(action, key, color) {
            this.$set(action, key, color)
        },

        onChangeColumnColor(column, key, color) {
            this.$set(column, key, color)
        },

        getValue() {
            return {
                'tableActions': this.props.tableActions,
                'columns': this.props.columns,
                'data': this.props.data
            }
        }

    },
    watch: {
        value(v) {
            this.setWidget(v)
        }
    },
    mounted() {
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