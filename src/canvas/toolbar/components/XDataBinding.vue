
<template>
     <div class="MatcDataBinding">
         <div v-if="model" class="MatcDialogTable">
             <table>
                  <tr >
                    <td class="MatcDataBindingCheckCntr">
                        <span class="mdi mdi-database-plus"></span>
                    </td>
                     <td class="MatcDataBindingNameCntr">
                       <Combo
                            :fireOnBlur="true"
                            :top="false"
                            placeholder="Create new variable"
                            :inline="true"
                            :hints="hints"
                            ref="combo"
                            @focus="hasNewTypeSelector = true"
                            @change="onNewVariable"
					        :formControl="true"/>
                    </td>
                     <td>
                        <a class="MatcButton">Create</a>
                        <!--
                         <SegmentButton
                            v-if="hasNewTypeSelector"
                            :options="variableKeys"
                            v-model="newType"
                             :style="'width:' + buttonWidth"
                             @change="setNewType($event)"/>
                             -->
                    </td>
                 </tr>
                 <tr v-for="variable in selectedVaribales" :key="variable.name">
                    <td class="MatcDataBindingCheckCntr">
                         <CheckBox :value="variable.selected" @change="onCheckBox($event, variable.name, variable.type)"/>
                    </td>
                     <td>
                        <input
                            v-if="canChangeVars"
                            :value="variable.name"
                            class="vommondInlineEdit MatcIgnoreOnKeyPress form-control"
                            @keydown.stop=""
                            keyup.stop=""/>
                        <span v-else class="MatcDataBindingVariableName">
                            {{variable.name}}
                        </span>
                    </td>
                     <td :class="{'MatcDataBindingVariableSelected': variable.selected}">
                        <SegmentButton
                            v-if="variable.selected"
                            :options="variableKeys"
                            v-model="variable.type"
                            :style="'width:' + buttonWidth"
                            @change="setType($event, variable.name)"/>
                    </td>
                 </tr>

             </table>
         </div>
	</div>
</template>
<style>

</style>
<script>
import DojoWidget from 'dojo/DojoWidget'
import Util from 'core/Util'
import Logger from 'common/Logger'
// import DropDownButton from 'page/DropDownButton'
import CheckBox from 'common/CheckBox'
import Input from 'common/Input'
import SegmentButton from 'page/SegmentButton'

export default {
    name: 'DataBinding',
    mixins:[DojoWidget, Util],
    props:["app", "value", "canChangeVars"],
    data: function () {
        return {
            model: null,
            widget: null,
            hasNewTypeSelector: false,
            newType: "default",
            variables: [],
            checked:{},
            databinding: {}
        }
    },
    components: {
        'CheckBox': CheckBox,
        'Combo': Input,
        'SegmentButton': SegmentButton
        // 'DropDownButton': DropDownButton
    },
    computed: {
        buttonWidth () {
            return this.variableKeys.length * 80 + 'px'
        },
        dataTypes () {
            return ["Number", "String", "Boolean", "Object", "Array"].map(a => {
                return {
                    label: a,
                    value: a
                }
            })
        },
        variableKeys () {
            if (this.widget.type === 'Table') {
                return [
                    { label: "Input", value: "default" },
                    { label: "Selected", value: "output" },
                    { label: "Action", value: "action" }
                    // { label: "Pagination", value: "pagination" }
                ]
            }
            if (this.widget.type === 'Repeater') {
                return [
                    { label: "In", value: "default" },
                    { label: "Selected", value: "output" }
                ]
            }
            if (this.widget.type === 'Paging') {
                return [
                    { label: "Pages", value: "elements" },
                    { label: "Selected", value: "output" }
                ]
            }
            if (['TypeAheadTextBox', 'DropDown', 'MobileDropDown', 'CheckBoxGroup', 'RadioGroup', 'Timeline'].indexOf(this.widget.type) >= 0) {
                return [
                    { label: "Default", value: "default" },
                    { label: "Options", value: "options" }
                ]
            }
            return [
                { label: "Default", value: "default" }
            ]
        },
        hints () {
           	var hints = this.getHintsAppVariables();
			hints = hints.map(h => {
				return {
					label: h,
					value: h
				}
            })
            return hints
        },
        selectedVaribales () {
            let values2Keys = {}
            for (let key in this.databinding) {
                let value = this.databinding[key]
                values2Keys[value] = key
            }
			let result = this.variables.map(v => {
                return {
                    name: v,
                    selected: this.checked[v],
                    defaultValue: '',
                    dataType: "Object",
                    type: values2Keys[v]
                }
            })
            return result
        }
    },
    methods: {
        onNewVariable (v) {
            this.logger.log(-1, 'onNewVariable', 'enter', v)
            this.$refs.combo.clear()
            if (this.variables.indexOf(v) < 0) {
                this.variables.unshift(v)
            }
            this.setNewVariableKey(v)
            this.unCheckNotAssigned()
            this.checked[v] = true
            this.onChange()
        },
        unCheckNotAssigned () {
            this.logger.log(-1, 'unCheckNotAssigned', 'enter')
            let dataBindingValues = Object.values(this.databinding)
            for (let value in this.checked) {
                if (dataBindingValues.indexOf(value) < 0) {
                    this.checked[value] = false
                }
            }
        },
        setNewVariableKey (v) {
            /**
             * Try to set the type by taking teh foirst free databinding
             */
            for (let i = 0; i < this.variableKeys.length; i++) {
                let key = this.variableKeys[i].value
                if (this.databinding[key] === undefined || this.databinding[key] === null) {
                    this.$set(this.databinding, key, v)
                    this.logger.log(-1, 'setNewVariableKey', 'exit > Free key taken: ' + key)
                    return;
                }
            }
            /**
             * Take the first one, most likely default
             */
            let key = this.variableKeys[0].value
            this.$set(this.databinding, key, v)
            this.logger.log(-1, 'setNewVariableKey', 'exit > Default key taken: ' + key)
        },
        onCheckBox (selected, name, key) {
            this.checked[name] = selected

            if (selected) {
                this.setNewVariableKey(name)
            } else {
                this.$delete(this.databinding, key)
            }
            this.onChange()
            this.unCheckNotAssigned()
        },
        onSelectVariable (v, key = "default") {
            this.$set(this.databinding, key, v)
            this.onChange()
        },
        setNewType (newKey) {
            this.newType = newKey
        },
        setType (newKey, name) {
            let oldKey = this.getCurrentKey(name)
            if (oldKey) {
                this.$delete(this.databinding, oldKey)
            }
            this.onSelectVariable(name, newKey)
            this.onChange()
            this.unCheckNotAssigned()
        },
        getCurrentKey(name) {
            for (let oldKey in this.databinding) {
                let value = this.databinding[oldKey]
                if (value === name) {
                    return oldKey
                }
            }
        },
        getValue () {
            return this.databinding
        },
        onChange () {
            this.emit('change', this.databinding)
        },
        setModel (v) {
            this.model = v
        },
        setWidget (v) {
            this.widget = v
            if (this.widget.props && this.widget.props.databinding) {
                this.databinding = this.widget.props.databinding
            }
            Object.values(this.databinding).forEach(value => {
                this.checked[value] = true
            })
            this.initVariables()
        },
        initVariables () {
            var variables = this.getAllAppVariables();
            if (this.variables.length === 0) {
                variables.sort((a, b) => {
                    return a.localeCompare(b)
                })
            }
            this.variables = variables
            if (this.variables.length === 0) {
                setTimeout(() => {
                    if (this.$refs.combo) {
                        this.$refs.combo.focus()
                    }
                }, 200)
            }
        }
    },
    watch: {
        value (v) {
            this.setWidget(v)
        }
    },
    mounted () {
        this.logger = new Logger("DataBinding")
        if (this.app) {
            this.setModel(this.app)
        }
        if (this.value) {
            this.setWidget(this.value)
        }
    }
}
</script>