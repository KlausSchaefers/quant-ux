
<template>
     <div class="MatcConditionalStyleSettings">

		 <div class="MatcDialogStepCntr">
			 <div v-for="(cs) in condStyles" :key="cs.id" :class="['MatcDialogStep', {'MatcDialogStepSelected': cs.id === selectedStyle.id}]" @click="selectCondStyle(cs)">
				 <span>
					 {{cs.label}}
				 </span>
				 <span class=" mdi mdi-close-circle" @click="removeConStyle(cs)" />
			 	
			 </div>
			 <a class="MatcLinkButton" @click="addConStyle" >Add Rule</a>
		 </div>

		 <div class="MatcDialogRuleCntr" ref="cntr">

		 </div>

		<div class="MatcDialogRuleCntr" ref="styleCntr">
			<label>Style</label>
			<div class="MactHint" v-if="!showStyle">
				Finish the rule
			</div>
			<div class="" v-if="showStyle">
				<div class=" form-group">
					   <ToolbarColor
                                        :isDialog="true"
                                        :app="model"
										lbl="Background"
                                        :color="selectedStyle.background"
                                        @changing="onChangeColor(selectedStyle, 'background', $event)"
                                        @change="onChangeColor(selectedStyle, 'background', $event)"/>
				</div>

				<div class=" form-group">
					   <ToolbarColor
                                        :isDialog="true"
                                        :app="model"
										lbl="Text"
                                        :color="selectedStyle.background"
                                        @changing="onChangeColor(selectedStyle, 'color', $event)"
                                        @change="onChangeColor(selectedStyle, 'color', $event)"/>
				</div>

			</div>
		 </div>
	 </div>
</template>
<style lang="scss">
	@import '../../../style/components/toolbar_conditional_style.scss';
</style>
<script>
import DojoWidget from 'dojo/DojoWidget'
import lang from 'dojo/_base/lang'
import on from 'dojo/on'
import Logger from 'common/Logger'
import DomBuilder from 'common/DomBuilder'
import Input from 'common/Input'
import Layout from 'core/Layout'
import DropDownButton from 'page/DropDownButton'
import ToolbarColor from '../components/ToolbarColor'

export default {
    name: 'ConditionalStyleSettings',
    mixins:[Layout, DojoWidget],
    data: function () {
        return {
            widget: null,
			showStyle: false,
			conditional: {
				styles: [
					{
							id: 'cs_' + new Date().getTime(),
							label: 'Rule 1',
							databinding : "",
							operation: "",
							parameter : "",
							style: {}
					}
				]
			},
			selectedStyle: 0
        }
    },
    components: {
		ToolbarColor
	},
	computed: {
		condStyles () {
			if (this.conditional) {
				return this.conditional.styles
			}	
			return []
		}
	},
    methods: {
        postCreate (){
			this.logger = new Logger('ConditionalStyleSettings');
			this.db = new DomBuilder();
			this.logger.log(0, "postCreate", "enter > " + this.widgetType);
		},

		setModel (model) {
			this.model = model
		},
		
		setValue(widget){
			//this.widget = lang.clone(widget);
			if (widget.conditional) {
				this.conditional = lang.clone(widget.conditional)
			}
			this.selectedStyle = this.conditional.styles[0]
			this.render(this.selectedStyle);
		},
		
		getValue () {
			return this.conditional;
		},
		
		selectCondStyle (cs) {
			this.selectedStyle = cs
			this.render(this.selectedStyle);
		},

		addConStyle () {
			this.conditional.styles.push({
					id: 'cs_' + new Date().getTime(),
					label: 'Rule ' + (this.conditional.styles.length + 1),
					databinding : "",
					operation: "",
					parameter : "",
					style: {}
			})
		},

		removeConStyle (cs) {
			this.conditional.styles = this.conditional.styles.filter(c => c.id !== cs.id)
		},
		
		render(step){
			this.$refs.cntr.innerHTML="";
	
			this.cleanUpTempListener();
			this.renderDataBinding(step);
			this.renderOperation(step)
			this.renderValue(step)
			this.renderStyle(step)
		},

		renderDataBinding (step) {
		
			var row = this.db.div("form-group").build(this.$refs.cntr);

			let variables = this.getAllAppVariables()
			let hints = this.getHintsAppVariables()

			let options = variables.concat(hints).map(v => {
				return {value: v, label: v}
			})
			this.db.label(null,"Databinding Variable").build(row);
			let input = this.$new(Input, {
				fireOnBlur: true,
				placeholder: "Select Variable",
				formControl: true,
				isDropDown: true
			})
			input.placeAt(row)
			input.setValue(step.databinding)
			input.setHints(options);
			this.tempOwn(on(input, "change", lang.hitch(this, "setDataBinding")));
			
		},

		renderOperation (step){
			if(step.databinding){
			
				let row = this.db.div("form-group").build(this.$refs.cntr);
				this.db.label(null,"Operator").build(row);
				let drpBox = this.$new(DropDownButton, {maxLabelLength:25});
				drpBox.setOptions([
					{"value" : "==", label:"Equals (==)"},
			    	{"value" : "!=", label:"Not Equals (!=)"},
			    	{"value" : ">", label:"Bigger (>)"},
					{"value" : "<", label:"Smaller (<)"},
				  	{"value" : ">=", label:"Bigger Equals (>=)"},
					{"value" : "<=", label:"Smaller Eqauls(<=)"}
				]);
				drpBox.setValue(step.operation)
				drpBox.placeAt(row);
				this.tempOwn(on(drpBox, "change", lang.hitch(this, "setOperation")));
				
				return;
			}
			
		},


		renderValue (step){

			if (step.operation) {
				let row = this.db.div("form-group").build(this.$refs.cntr);
				let text = this.db.formGroup("MatcIgnoreOnKeyPress", "Value", step.parameter, "").build(row);
				this.tempOwn(on(text, "change", lang.hitch(this, "setParameter", text)));
			}
			
		
		},

		renderStyle (step) {
			if (!step.parameter) {
				this.showStyle = false
				return
			}
			this.showStyle = true
	
		},


		renderVariableInput (label, value, callback) {
			let row = this.db.div("form-group").build(this.$refs.cntr);

			let variables = this.getAllAppVariables()
			let hints = this.getHintsAppVariables()

			let options = variables.concat(hints).map(v => {
				return {value: '${' + v + '}', label: v}
			})
			this.db.label(null,label).build(row);
			let input = this.$new(Input, {
				fireOnBlur: true,
				placeholder: "Select Variable",
				formControl: true,
				isDropDown: true
			})
			input.placeAt(row)
			input.setValue(value)
			input.setHints(options);
			this.tempOwn(on(input, "change", callback));
		},

		setParameter (text) {
			const parameter = text.value
			this.selectedStyle.parameter = parameter
			this.render(this.selectedStyle)
		},


		setDataBinding (databinding) {
			this.selectedStyle.databinding = databinding
			this.render(this.selectedStyle)
		},

		setOperation (operation) {
			this.selectedStyle.operation = operation
			this.render(this.selectedStyle)
		},

		onChangeColor (element, key, value) {
			this.selectedStyle[key] = value
			console.debug(this.selectedStyle)
		}
    }, 
    mounted () {
    }
}
</script>