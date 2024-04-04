
<template>
     <div class="MatcRule"></div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import css from 'dojo/css'
import lang from 'dojo/_base/lang'
import on from 'dojo/on'
import Logger from 'common/Logger'
import DomBuilder from 'common/DomBuilder'
import DropDownButton from 'page/DropDownButton'
import Input from 'common/Input'
import SegmentButton from 'page/SegmentButton'
import Layout from 'core/Layout'

export default {
    name: 'Rule',
	mixins:[Layout, DojoWidget],
	props: ['l', 'app'],
    data: function () {
        return {
            widgetOutputTypes: {
				"ToggleButton" : "active",
				"SegmentButton" : "options",
				"SegmentPicker" : "options",
				"DropDown" : "options",
				"MobileDropDown" : "options",
				"TextBox" : "string",
				"TextArea" : "string",
				"Password" : "string",
				"CheckBox" : "checked",
				"RadioBox" : "checked",
				"RadioBox2" : "checked",
				"IconToggleButton": "checked",
				"VisualPicker": "checked",
				"HSlider" : "int",
				"CountingStepper": "int",
				"Spinner" : "options",
				"Switch" : "active",
				"DragNDrop" : "pos",
				"Date" : "date",
				"DateDropDown" : "date",
				"RadioGroup": "options",
				"CheckBoxGroup": "options"
			}
        }
    },
    components: {},
    methods: {
        postCreate (){
			this.logger = new Logger("Rule");
			this.db = new DomBuilder();
		},

		setModel (model){
			this.model = model;
		},

		getValidationModel (widget){
			if(widget.props && widget.props.validation){
				return widget.props.validation;
			}
			return {};
		},

		setScreenIDs (ids){
			this.screenIDs = ids;
		},

		setValue (line){
			this.line = lang.clone(line);
			this.value = this.line.rule;
			if(!this.value){
				this.value = {
					"restResponseStatus": "200",
					"databinding": "",
					"widget" : null,
					"operation" : null,
					"value" : null
				};
			}
			/**
			 * Make sure old rules work. New rules will have a type
			 */
			if (!this.value.type) {
				this.value.type = 'widget'
			}
			this.render(this.value);
		},

		getValue (){
			return this.value;
		},

		isValid (){
			if (this.value.type === 'widget') {
				return this.value.widget!=null && this.value.operator !=null;
			}
			if (this.value.type === 'databinding') {
				return this.value.databinding !=null && this.value.operator !=null;
			}
			return true
		},

		render (rule){
			this.domNode.innerHTML="";
			this.cleanUpTempListener();
			this.renderType(rule);
			this.renderDataBinding(rule);
			this.renderRest(rule);
			this.renderWidget(rule);
			this.renderOperator(rule);
			this.renderValue(rule);
		},

		renderType (rule) {
			var row = this.db.div("form-group").build(this.domNode);
			this.db.label(null,"Rule Type").build(row);
			var drpBox = this.$new(SegmentButton, {maxLabelLength:25});
			drpBox.setOptions(this.getTypeOption());
			drpBox.setValue(rule.type)
			drpBox.placeAt(row);
			this.tempOwn(on(drpBox, "change", lang.hitch(this, "setType")));
		},

		renderDataBinding (rule) {
			if (rule.type == 'databinding') {
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
				input.setValue(rule.databinding)
				input.setHints(options);
				this.tempOwn(on(input, "change", lang.hitch(this, "setDataBinding")));
			}
		},

		renderRest (rule) {
			if (rule.type == 'rest') {
				var row = this.db.div("form-group").build(this.domNode);
				this.db.label(null,"Response Type").build(row);
				var drpBox = this.$new(SegmentButton, {maxLabelLength:25});
				drpBox.setOptions([
					{value: "200", label: "OK"},
					{value: "4xx", label: "Error"},
				]);
				drpBox.setValue(rule.restResponseStatus)
				drpBox.placeAt(row);
				this.tempOwn(on(drpBox, "change", lang.hitch(this, "setRest")));
			}
		},



		renderWidget (rule){
			if (rule.type == 'widget') {
				var row = this.db.div("form-group").build(this.domNode);
				this.db.label(null,"Widget").build(row);
				var drpBox = this.$new(DropDownButton, {maxLabelLength:25});
				drpBox.setOptions(this.getUIWidgets());
				drpBox.setValue(rule.widget)
				drpBox.placeAt(row);
				this.tempOwn(on(drpBox, "change", lang.hitch(this, "setWidget")));
			}
		},

		renderOperator (rule){
			if(rule.widget){
				var widget = this.model.widgets[rule.widget];
				if(widget){
					let row = this.db.div("form-group").build(this.domNode);
					this.db.label(null,"Operator").build(row);
					let drpBox = this.$new(DropDownButton, {maxLabelLength:25});
					drpBox.setOptions(this.getOperators(widget));
					drpBox.setValue(rule.operator)
					drpBox.placeAt(row);
					this.tempOwn(on(drpBox, "change", lang.hitch(this, "setOperator")));
				} else {
					console.warn("renderOperator() > No widget with id",rule.widget );
				}
				return;
			}
			if (rule.type === 'databinding' && rule.databinding) {
				let row = this.db.div("form-group").build(this.domNode);
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
				drpBox.setValue(rule.operator)
				drpBox.placeAt(row);
				this.tempOwn(on(drpBox, "change", lang.hitch(this, "setOperator")));
				return;
			}
		},


		renderValue (rule){
			console.debug('renderValue', rule)
			if (rule.widget && rule.operator && rule.operator != "isValid") {
				let widget = this.model.widgets[rule.widget];
				if (widget) {
					let row = this.db.div("form-group").build(this.domNode);
					let type = this.widgetOutputTypes[widget.type];
					if (this["renderValue_" +type]) {
						this["renderValue_" +type](row, widget, rule);

						let rowCheckBox = this.db.div("form-group").build(this.domNode);
						this.renderValue_isBinding(rowCheckBox, rule)
					}
				} else {
					console.debug("renderValue() > No widget with id", rule.widget);
				}
			} else if (rule.databinding && rule.operator) {
				let row = this.db.div("form-group").build(this.domNode);
				let text = this.db.formGroup("MatcIgnoreOnKeyPress", "Value", rule.value, "").build(row);
				this.tempOwn(on(text, "keyup", lang.hitch(this, "setRuleValueText", text)));

				let rowCheckBox = this.db.div("form-group").build(this.domNode);
				this.renderValue_isBinding(rowCheckBox, rule)
			}
		},

		renderValue_options (row, widget, rule){
			this.db.label(null,"Value").build(row);

			var drpBox = this.$new(DropDownButton,{maxLabelLength:25});
			drpBox.setOptions(this.getOptions(widget));
			drpBox.setValue(rule.value)
			drpBox.placeAt(row);
			this.tempOwn(on(drpBox, "change", lang.hitch(this, "setRuleValue")));
		},

		renderValue_string (row, widget, rule){

			if(widget.props && widget.props.validation){
				var val = widget.props.validation;
				var valType = val.type;
				switch(valType){
					case "int":	{
						let number = this.db.formGroup("MatcIgnoreOnKeyPress", "Value", rule.value, "").build(this.domNode);
						this.tempOwn(on(number, "keyup", lang.hitch(this, "setRuleValueNumber", number, "int")));
						break;
					}

					case "double": {
						let number = this.db.formGroup("MatcIgnoreOnKeyPress", "Value", rule.value, "").build(this.domNode);
						this.tempOwn(on(number, "keyup", lang.hitch(this, "setRuleValueNumber", number, "double")));
						break;
					}

				  default: {
				    let text = this.db.formGroup("MatcIgnoreOnKeyPress", "Value", rule.value, "").build(row);
						this.tempOwn(on(text, "keyup", lang.hitch(this, "setRuleValueText", text)));
						break;
					}
				}
			} else {
				let text = this.db.formGroup("MatcIgnoreOnKeyPress", "Value", rule.value, "").build(row);
				this.tempOwn(on(text, "keyup", lang.hitch(this, "setRuleValueText", text)));
			}


		},

		renderValue_isBinding (row) {
			this.db.span('MatcHint', 'Use ${variable} synthax to compare against databinding variables.').build(row)
		},

		renderValue_int (row, widget, rule){
			var number = this.db.formGroup("MatcIgnoreOnKeyPress", "Value", rule.value, "").build(this.domNode);
			this.tempOwn(on(number, "keyup", lang.hitch(this, "setRuleValueNumber", number, "int")));
		},

		getOperators (widget){
			var result = [];
			var type = this.widgetOutputTypes[widget.type];
			switch(type){
				case "checked":
							result.push({"value" : "checked", label:"Checked"});
							result.push({"value" : "notchecked", label:"Not Checked"});
			        break;
				case "active":
							result.push({"value" : "active", label:"Active"});
							result.push({"value" : "notactive", label:"Not Active"});
			        break;
			    case "date":
			    		result.push({"value" : "isValid", label:"Is valid"});
			        break;
			    case "string":
			        result.push({"value" : "isValid", label:"Is valid"});
			        result.push({"value" : "==", label:"Equals (==)"});
							result.push({"value" : "!=", label:"Not Equals (!=)"});
							result.push({"value" : "contains", label: "Matches (~)"})
			        break;
			    case "int":
			        result.push({"value" : "isValid", label:"Is valid"});
			        result.push({"value" : "==", label:"Equals (==)"});
							result.push({"value" : "!=", label:"Not Equals (!=)"});
							result.push({"value" : ">", label:"Bigger (>)"});
							result.push({"value" : "<", label:"Smaller (<)"});
							result.push({"value" : ">=", label:"Bigger Equals (>=)"});
							result.push({"value" : "<=", label:"Smaller Eqauls(<=)"});
			        break;
			    case "options":
							result.push({"value" : "==", label:"Equals"});
							result.push({"value" : "!=", label:"Not Equals"});
			        break;
			    default:
			    	console.warn("getOperators() > not supported type", widget.type, type)
			}

			if(type == "string"){

				if(widget.props && widget.props.validation){
					var val = widget.props.validation;
					var valType = val.type;

					switch(valType){
						case "int":
								result.push({"value" : ">", label:"Bigger (>)"});
								result.push({"value" : "<", label:"Smaller (<)"});
								result.push({"value" : ">=", label:"Bigger Equals (>=)"});
								result.push({"value" : "<=", label:"Smaller Eqauls(<=)"});
								break;
						case "double":
								result.push({"value" : ">", label:"Bigger (>)"});
								result.push({"value" : "<", label:"Smaller (<)"});
								result.push({"value" : ">=", label:"Bigger Equals (>=)"});
								result.push({"value" : "<=", label:"Smaller Eqauls(<=)"});
								break;
					  case "string":
					      result.push({"value" : "contains", label:"Contains"})
					      break;
					  default:
					    	//console.warn("getOperators() > not supported validaton string type", valType, val)
					}

				}

			}
			return result;
		},

		getTypeOption () {
			let widget = this.getFromWidget()
			if (widget && widget.type === 'Rest') {
				return [
					{value: "widget", label: "Widget"},
					{value: "databinding", label: "DataBinding"},
					{value: "rest", label: "Rest"}
				]
			}
			return [
					{value: "widget", label: "Widget"},
          {value: "databinding", label: "DataBinding"}
			]
		},

		getFromWidget () {
			for(let id in this.model.widgets){
				let widget = this.model.widgets[id];
				if (widget.id === this.line.from) {
					return widget;
				}
			}
		},

		getUIWidgets (){
			var result = [];

			if(this.screenIDs && this.screenIDs.length >0){
				let _ids = {};
				for(let j=0; j< this.screenIDs.length; j++){
					let screenID = this.screenIDs[j];
					let screen = this.model.screens[screenID];
					if(screen){
						let children = screen.children;
						for(let i=0; i< children.length; i++){
							let id = children[i];
							let widget = this.model.widgets[id];
							if(this.widgetOutputTypes[widget.type] && !_ids[widget.id]){
								result.push({"value" : widget.id, label:widget.name});
								_ids[widget.id] = true;
							} else {
								console.warn("getUIWidgets() > No widget with id : " , id);
							}
						}
					} else {
						console.warn("getUIWidgets() > No screen with id : " , screenID);
					}
				}
			} else {
				for(let id in this.model.widgets){
					let widget = this.model.widgets[id];
					if(this.widgetOutputTypes[widget.type]){
						result.push({"value" : widget.id, label:widget.name});
					}
				}
			}

			result.sort(function (a, b){
				return a.label.localeCompare(b.label);
			});

			return result;
		},

		getOptions (widget){
			var result = [];
			var options = widget.props.options;
	    	if(options){
	    		for(var i =0; i< options.length; i++){
	    			result.push({"value" : options[i], label:options[i]});
	    		}
	    	}
	    	return result;
		},

		setType (type) {
			this.value.type = type;
			this.value.operator = null;
			this.value.value = null;
			this.value.databinding = null;
			this.value.widget = null;
			this.render(this.value);
			this._onChange();
		},

		setDataBinding (databinding) {
			this.value.databinding = databinding;
			this.value.operator = null;
			this.value.value = null;
			this.render(this.value);
			this._onChange();
		},

		setRest (restResponseStatus) {
			this.value.restResponseStatus = restResponseStatus;
			this.value.operator = null;
			this.value.value = null;
			this.render(this.value);
			this._onChange();
		},

		setWidget (id){
			this.value.widget = id;
			this.value.operator = null;
			this.value.value = null;
			this.value.databinding = null;
			this.render(this.value);
			this._onChange();
		},

		setOperator (value){
			this.value.operator = value;
			this.render(this.value);
			this._onChange();
		},

		setRuleValue (value){
			this.value.value = value;
			this._onChange();
		},

		setRuleValueText (input){
			this.value.value = input.value;
			this._onChange();
		},

		setText (input){
			this.value.text = input.value;
			this._onChange();
		},


		setRuleValueNumber (input, type){

			if(type == "int"){
				let min = input.value;
				let re = /^-?[0-9]+$/;
				if( re.test(min)){
					min = parseInt(min);
					this.value.value = min;
					css.remove(input.parentNode, "has-error");
				} else {
					css.add(input.parentNode, "has-error");
				}
			}
			if(type == "double"){
				let min = input.value;
				let re = /^-?[0-9]+((\.|,)[0-9]+)?$/;
				if( re.test(min)){
					min = parseInt(min);
					this.value.value = min;
					css.remove(input.parentNode, "has-error");
				} else {
					css.add(input.parentNode, "has-error");
				}
			}

			this._onChange();
		},

		_onChange (){

		}
    },
    mounted () {
		if (this.app) {
			this.setModel(this.app)
		}
		if (this.l) {
			this.setValue(this.l)
		}
    }
}
</script>