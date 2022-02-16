
<template>
     <div class="MatcRule MatcVariableAction"></div>
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
			console.debug('VariableActionSettings.setModel', model)
			this.model = model
		},
		
		setValue(action){
			this.action = lang.clone(action);
			this.render(this.action);
		},
		
		getValue(){
			return this.action;
		},
		
		
		render(action){
			this.domNode.innerHTML="";
			if (!action.steps ||! action.steps[0]) {
				action.steps = [{databinding: '', operation: '', parameter:''}]
			}
			const step = action.steps[0]
			console.debug('Action', action, step)
			this.cleanUpTempListener();
			this.renderDataBinding(step);
			this.renderOperation(step)
			this.renderValue(step)
		},

		renderDataBinding (step) {
		
			var row = this.db.div("form-group").build(this.domNode);

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
			
				let row = this.db.div("form-group").build(this.domNode);
				this.db.label(null,"Operator").build(row);
				let drpBox = this.$new(DropDownButton, {maxLabelLength:25});
				drpBox.setOptions([
					{"value" : "set", label:"Set"},
					{"value" : "plus", label:"Plus"},
					{"value" : "minus", label:"Minus"},
					{"value" : "append", label:"Add to list"},
					{"value" : "remove", label:"Remove from list"},
					{"value" : "toggle", label:"Toggle"},
				]);
				drpBox.setValue(step.operation)
				drpBox.placeAt(row);
				this.tempOwn(on(drpBox, "change", lang.hitch(this, "setOperation")));
				
				return;
			}
			
		},


		renderValue (step){
			let row = this.db.div("form-group").build(this.domNode);
			if (step.operation === 'set' || step.operation === 'minus' || step.operation === 'plus') {
				
				let text = this.db.formGroup("MatcIgnoreOnKeyPress", "Value", step.parameter, "").build(row);
				this.tempOwn(on(text, "keyup", lang.hitch(this, "setParameter", text)));
			}
			if (step.operation === 'append') {
				let text = this.db.formGroupTextArea("MatcIgnoreOnKeyPress", "Value", step.parameter, "").build(row);
				this.tempOwn(on(text, "keyup", lang.hitch(this, "setParameter", text)));
			}
			
			if (step.operation === 'remove') {
				let text = this.db.formGroup("MatcIgnoreOnKeyPress", "Remove last X elemens", step.parameter, "").build(row);
				this.tempOwn(on(text, "keyup", lang.hitch(this, "setParameter", text)));
			}

			if (step.operation === 'toggle') {
				let text = this.db.formGroup("MatcIgnoreOnKeyPress", "Value 1", step.parameter, "").build(row);
				this.tempOwn(on(text, "keyup", lang.hitch(this, "setParameter", text)));

				let row2 = this.db.div("form-group").build(this.domNode);
				let text2 = this.db.formGroup("MatcIgnoreOnKeyPress", "Value 2", step.parameter2, "").build(row2);
				this.tempOwn(on(text2, "keyup", lang.hitch(this, "setParameter2", text2)));
			}
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
			console.debug('setDataBinding', databinding)
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