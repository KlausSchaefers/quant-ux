
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
                            @change="onNewVariable"
					        :formControl="true"/>
                    </td>
                     <td>
                        
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
                     <td>
                        <SegmentButton 
                            v-if="variable.selected" 
                            :options="variableKeys" 
                            v-model="variable.type" 
                            style="width:100px" @change="setType($event, variable.name)"/>
                    </td>
                 </tr>
                
             </table>
         </div>
	</div>
</template>
<style scoped>
    @import url("../../../public/style/databinding.css");
</style>
<script>
import DojoWidget from 'dojo/DojoWidget'
import Util from 'core/Util'
import Logger from 'common/Logger'
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
            variables: [],
            databinding: {}
        }
    },
    components: {
        'CheckBox': CheckBox,
        'Combo': Input,
        'SegmentButton': SegmentButton
    },
    computed: {
        variableKeys () {
            if (this.widget.type === 'Repeater') {
                return [
                    {
                        label: "In",
                        value: "default"
                    },
                    {
                        label: "Out",
                        value: "output"
                    }
                ]
            } else {
                return [
                    {
                        label: "In & out",
                        value: "default"
                    }
                ]
            }
           
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
                    selected: values2Keys[v] !== null && values2Keys[v] !== undefined,
                    type: values2Keys[v]
                }
            })
            return result
        }
    },
    methods: {
        onNewVariable (v) {
            this.$refs.combo.clear()
            this.variables.unshift(v)
            this.onSelectVariable(v)
            this.onChange()
        },
        onCheckBox (selected, name, key) {
            if (selected) {
                this.onSelectVariable(name)
            } else {
                this.$delete(this.databinding, key)
                this.onChange()
            }
        },
        onSelectVariable (v, key = "default") {
            this.$set(this.databinding, key, v)
            this.onChange()
        },
        setType (newKey, name) {
            console.debug('setType', newKey, name)
            let oldKey = null
            for (oldKey in this.databinding) {
                let value = this.databinding[oldKey]
                if (value === name) {
                    break
                }
            }
            if (oldKey) {
                this.$delete(this.databinding, oldKey)
                this.onSelectVariable(name, newKey)
            }
            this.onChange()
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
        }
    }, 
    watch: {
        value (v) {
            this.setWidget(v)
        }
    },
    mounted () {
        this.logger = new Logger("RestSettings")
        if (this.app) {
            this.setModel(this.app)
        }
        if (this.value) {
            this.setWidget(this.value)
        }
    }
}
</script>