
<template>
    <div class="MatcNavidationEditor ">

        <div class="" v-if="tab === 'icons'">
            <IconTable 
                :value="selectedItem.icon"
                @change="setIcon"
                @cancel="showSettings"
            />
        </div>

        <div class="MatcDialogTable MatcDialogTableScrollable" v-if="tab === 'settings'">
            <table class="MatcToolbarTableSettingsTable" v-if="screens && items">
                <thead>
                    <tr class="MatcFormRow">
                        <th style="width:60px;">Selected</th>
                        <th >Label</th>
                        <th >Screen</th>
                        <th style="width:50px;">Icon</th>
                        <th style=""></th>
                    </tr>
                </thead>
                <tbody>


                <tr v-for="(item, i) in items" :key="item.id" 
                    :class="[{'MatcFormRowDNDHover': i === hoverRow}, {'MatcFormRowDNDSelect': i == dragRow}]"
                    :draggable="isDraggable"
                    @dragstart="onColDragStart($event, i)"
                    @dragover="oColDragOver($event, i)"
                    @dragleave="onColDragLeave($event, i)"
                    @drop="onColDrop($event, i)">
                
                    <td>
                        <div class="">
                            <div class="MatcFormRowDND">
                                <QIcon icon="HandleDND"  @mouseover="isDraggable = true" @mouseout="isDraggable = false" ></QIcon>      
                                <CheckBox
                                    :value="item.selected"
                                    @change="setSelected(item, $event)"
                                    label="" />
                            </div>
                        </div>
                    </td>
                    <td>
                    
                        <input class="form-control " v-model="item.label" />
                      
                    </td>
                    <td class="form-group">
                        <DropDownButton :options="screens" :qMaxLabelLength="30" :value="item.to"
                            @change="setTo(item, $event)" :isDialog="true" />
                    </td>
                    <td class="MatcFormRowIconSelect">
                        <div>
                            <span :class="getItemIcon(item)" @click="showIcons(item)"></span>
                        </div>

                    </td>
            
                    <td class="MatcFormRowRemove">
                        <!-- <span class="mdi mdi mdi-chevron-down" @click="removeItem(i)" />
                        <span class="mdi mdi mdi-chevron-up" @click="removeItem(i)" /> -->
                        <span class="mdi mdi-close " @click="removeItem(i)" />
                    </td>
                </tr>


                <tr class="MatcFormRow">
                    <td></td>
                    <td>
                        <span class="MatcButton MatcButtonXS" @click="addItem">Add Item</span>
                    </td>
              
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>
                </tbody>
            </table>

        </div>

    </div>
</template>
<style lang="scss">
@import "../../../style/components/navigation_editor.scss";
</style>
<style></style>
<script>
import DojoWidget from 'dojo/DojoWidget'
import lang from 'dojo/_base/lang'
import DropDownButton from 'page/DropDownButton'
import IconTable from './IconTable.vue'
import CheckBox from 'common/CheckBox'
import QIcon from 'page/QIcon'

export default {
    name: 'NavigationTable',
    mixins: [DojoWidget],
    props: ["options", "value"],
    data: function () {
        return {
            dragRow: -1,
			hoverRow: -1,
            hasSelect: true,
            isDraggable: false,
            tab: 'settings',
            screens: [],
            selectedItem: {},
            items: []
        }
    },
    components: {
        DropDownButton, IconTable, CheckBox, QIcon
    },
    methods: {
        showSettings () {
            this.tab = 'settings'
        },
        showIcons(item) {
            this.tab = 'icons'
            this.selectedItem= item
        },
        setIcon (icon) {
            this.selectedItem.icon = icon
            setTimeout(() => {
                this.showSettings()
            }, 100)
        },
        getItemIcon(item) {
            if (item.icon) {
                return item.icon;
            }
            return 'mdi no-icon mdi-cancel'
        },
        setSelected (item, selected) {
            this.items.forEach(i => {
                if (i.id === item.id ) {
                    i.selected = selected
                } else {
                    i.selected = false
                }
                
            })
            this.$forceUpdate()
        },
        onColDragStart(e, i) {
            e.dataTransfer.setData("text", i);
            e.dataTransfer.effectAllowed = 'move';
            this.dragRow = i
        },
        oColDragOver(e,i) {
            e.preventDefault();
            this.hoverRow = i
        },

		onColDragLeave () {
			this.hoverRow = -1
		},
        onColDrop(e, i) {
            e.preventDefault();
            const data = e.dataTransfer.getData("text");
            const j = data * 1
            if (this.items[i] && this.items[j]) {
                const temp = this.items[i]
                this.items[i] = this.items[j]
                this.items[j] = temp
                this.$forceUpdate()
            }
            this.dragRow = -1
			this.hoverRow = -1
        },
        onChange() {

        },
        setWidget(widget) {
            if (widget?.props?.navigation) {
                this.setItems(widget.props.navigation)
            }
            this.tab = 'settings'
        },
        setItems(items) {
            this.items = lang.clone(items)
        },
        getValue () {
            return this.items
        },
        setScreens(s) {
            this.screens = s
        },
        setTo(item, value) {
            item.to = value
        },
        removeItem(i) {
            this.$delete(this.items, i)
        },
        addItem() {
            this.items.push({
                id: "n" + new Date().getTime(), label: '', icon: '', to: ""
            })
        }
    },
    watch: {
        value(v) {
            this.setValue(v)
        }
    },
    mounted() {
        if (this.screens) {
            this.setScreens(this.screens)
        }
        if (this.value) {
            this.setItems(this.value)
        }
    }
}
</script>