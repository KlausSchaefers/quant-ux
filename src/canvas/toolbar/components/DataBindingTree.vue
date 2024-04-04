
<template>
     <div class="MatcDataBinding MatcDataBindingTree">
           <div class="MatcToolbarTabs MatcToolbarTabsBig MatcMarginBottom">
                <a v-for="key in variableKeys" 
                    @click="setVariableType(key.value)"
                    :key="key.value" 
                    :class="{'MatcToolbarTabActive': selectedVaribaleType === key.value}">
                    {{key.label}}
                </a>
         
            </div>
         <div v-if="model" class="MatcDialogTable">
          
    
     
              <table>                  
                 <tbody>
                    <tr class="" v-for="variable in modelVariables" :key="variable.name">
                        <td class="MatcDialogTableSelectCntr">
                            <div class="MatcVerticalCenter">
                                <CheckBox :value="variable.selected" @change="onSelectVariable($event, variable.name)"/>
                            </div>
                         
                        </td>                 
                        <td class="MatcDialogTableMaxRow">                
                            <span class="MatcDataBindingVariableName">
                                {{variable.name}}
                            </span>
                        </td>
                        <td class="MatcDataBindingVariableDefault" v-if="hasDefaults">
                            <input class="MatcIgnoreOnKeyPress form-control" placeholder="default value" v-model="variable.defaultValue"        @keydown.stop=""/>
                        </td>
                        <td></td>
                    </tr>
                 </tbody>
           
                
                  <tr >
                    <td class="MatcDialogTableSelectCntr">
                       
                    </td>
                     <td class="MatcDialogTableMaxRow">
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
                    <td></td>
                 </tr>
             </table>
         </div>
	</div>
</template>
<style lang="scss">
  @import "../../../style/components/databinding.scss";
</style>
<script>
import DojoWidget from 'dojo/DojoWidget'
import Util from 'core/Util'
import Logger from 'common/Logger'
// import DropDownButton from 'page/DropDownButton'
import CheckBox from 'common/CheckBox'
import Input from 'common/Input'
import lang from '../../../dojo/_base/lang'
import DataBindingService from 'services/DataBindingService'

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
            databinding: {},
            selectedVaribaleType: 'default',
            hasDefaults: false,
            variableKeys: []
        }
    },
    components: {
        'CheckBox': CheckBox,
        'Combo': Input
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
        modelVariables () {          
            const selectedVaribale = this.databinding[this.selectedVaribaleType]           
			let result = this.variables.map(v => {
                return {
                    name: v,
                    selected: selectedVaribale === v,
                    defaultValue: '',
                    dataType: "Object"
                }
            })
            return result
        }
    },
    methods: {
        setVariableType (type) {
            this.logger.log(-1, 'setVariableType', 'enter', type)
            this.selectedVaribaleType = type
        },
        onNewVariable (v) {
            this.logger.log(-1, 'onNewVariable', 'enter', v)
            this.$refs.combo.clear()
            if (this.variables.indexOf(v) < 0) {
                this.variables.unshift(v)
            }
            this.onSelectVariable(true, v)
            this.onChange()
        },      
        onSelectVariable (selected, variable) {      
            this.logger.log(-1, 'onSelectVariable', 'enter', selected, variable)     
            if (selected) {
                this.$set(this.databinding, this.selectedVaribaleType,variable)
             } else {
                this.$delete(this.databinding, this.selectedVaribaleType)
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
                this.databinding = lang.clone(this.widget.props.databinding)         
            }
            this.variableKeys = DataBindingService.getDefautlBindings(this.widget)
            if (this.variableKeys.length > 0) {
                this.selectedVaribaleType = this.variableKeys[0].value
            }    
            this.initVariables()
            this.logger.log(-1, 'setWidget() > exit',  this.selectedVaribaleType)
        },
        setVariable (v) {
            if (v.label && v.value) {
                this.logger.log(-1, 'setVariable', 'enter', v.value)
                this.selectedVaribaleType = v.value
            }
        },
        initVariables () {
            var variables = this.getAllAppVariables();
            if (this.variables.length === 0) {
                variables.sort((a, b) => {
                    return a.toLowerCase().localeCompare(b.toLowerCase())
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
        this.logger = new Logger("DataBindingTree")
        if (this.app) {
            this.setModel(this.app)
        }
        if (this.value) {
            this.setWidget(this.value)
        }
    }
}
</script>