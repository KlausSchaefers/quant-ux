
<template>
     <div class="MatcRule MatcWorkFlowSettings MatcWorkFlowSettingsSimple">

		 <div class="MatcWorkFlowSettingsSteps">
			 Step 1
		 </div>

		 <div class="MatcWorkFlowSettingsCntr" ref="cntr">

		 </div>
	 </div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import lang from 'dojo/_base/lang'
import on from 'dojo/on'
import Logger from 'common/Logger'
import DomBuilder from 'common/DomBuilder'
import Input from 'common/Input'
import Layout from 'core/Layout'
import DropDownButton from 'page/DropDownButton'

export default {
    name: 'VariableActionSettings',
    mixins:[Layout, DojoWidget],
    data: function () {
        return {
            arrowSize: 10
        }
    },
    components: {},
    methods: {
        postCreate (){
			this.logger = new Logger('VariableActionSettings');
			this.db = new DomBuilder();
			this.logger.log(0, "postCreate", "enter > " + this.widgetType);
		},

		setModel (model) {
			this.model = model
		},
		
		setValue(action){
			this.action = lang.clone(action);
			this.selectedStep = 0
			this.render(this.action);
		},
		
		getValue(){
			return this.action;
		},
		
		
		render(action){
			this.$refs.cntr.innerHTML="";
			if (!action.steps) {
				action.steps = []
			}
			if (!action.steps[this.selectedStep]) {
				action.steps[this.selectedStep] = {databinding: '', operation: '', parameter:''}
			}
			const step = action.steps[this.selectedStep]
			this.cleanUpTempListener();
			this.renderDataBinding(step);
			this.renderOperation(step)
			this.renderValue(step)
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
					{"value" : "set", label:"Set"},
					{"value" : "plus", label:"Plus"},
					{"value" : "minus", label:"Minus"},
					{"value" : "multiply", label:"Multiply"},
					{"value" : "devide", label:"Devide"},
					{"value" : "increment", label:"Increment"},
					{"value" : "decrement", label:"Decrement"},
			
					{"value" : "toggle", label:"Toggle"},
				]);
				drpBox.setValue(step.operation)
				drpBox.placeAt(row);
				this.tempOwn(on(drpBox, "change", lang.hitch(this, "setOperation")));
				
				return;
			}
			
		},


		renderValue (step){
			
			if (step.operation === 'set' || step.operation === 'decrement' || step.operation === 'increment') {
				let row = this.db.div("form-group").build(this.$refs.cntr);
				let text = this.db.formGroup("MatcIgnoreOnKeyPress", "Value", step.parameter, "").build(row);
				this.tempOwn(on(text, "keyup", lang.hitch(this, "setParameter", text)));
			}
			if (step.operation === 'append') {
				let row = this.db.div("form-group").build(this.$refs.cntr);
				let text = this.db.formGroupTextArea("MatcIgnoreOnKeyPress", "Value", step.parameter, "").build(row);
				this.tempOwn(on(text, "keyup", lang.hitch(this, "setParameter", text)));
			}
			
			if (step.operation === 'remove') {
				let row = this.db.div("form-group").build(this.$refs.cntr);
				let text = this.db.formGroup("MatcIgnoreOnKeyPress", "Remove last X elemens", step.parameter, "").build(row);
				this.tempOwn(on(text, "keyup", lang.hitch(this, "setParameter", text)));
			}

			if (step.operation === 'toggle') {
				let row = this.db.div("form-group").build(this.$refs.cntr);
				let text = this.db.formGroup("MatcIgnoreOnKeyPress", "Value 1", step.parameter, "").build(row);
				this.tempOwn(on(text, "keyup", lang.hitch(this, "setParameter", text)));

				let row2 = this.db.div("form-group").build(this.$refs.cntr);
				let text2 = this.db.formGroup("MatcIgnoreOnKeyPress", "Value 2", step.parameter2, "").build(row2);
				this.tempOwn(on(text2, "keyup", lang.hitch(this, "setParameter2", text2)));
			}


			if (step.operation === 'plus' || step.operation === 'multiply' || step.operation === 'devide' || step.operation === 'minus') {
				this.renderVariableInput("Variable 1", step.parameter, (parameter) => {
					this.action.steps[0].parameter = parameter
				})
				this.renderVariableInput("Variable 2", step.parameter2, (parameter) => {
					this.action.steps[0].parameter2 = parameter
				})
			}
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
			this.action.steps[0].parameter = parameter
		},

		setParameter2 (text) {
			const parameter = text.value
			this.action.steps[0].parameter2 = parameter
		},

		setDataBinding (databinding) {
			this.action.steps[0].databinding = databinding
			this.render(this.action)
		},

		setOperation (operation) {
			this.action.steps[0].operation = operation
			this.render(this.action)
		}
    }, 
    mounted () {
    }
}
</script>