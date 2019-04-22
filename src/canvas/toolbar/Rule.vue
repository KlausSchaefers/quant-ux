
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

export default {
    name: 'Rule',
    mixins:[DojoWidget],
    data: function () {
        return {
            widgetOutputTypes: {
				"ToggleButton" : "active",
				"SegmentButton" : "options",
				"DropDown" : "options",
				"TextBox" : "string", 
				"TextArea" : "string", 
				"Password" : "string", 
				"CheckBox" : "checked", 
				"RadioBox" : "checked",
				"RadioBox2" : "checked",
				"HSlider" : "int", 
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
        postCreate: function(){
			this.logger = new Logger({"className":"de.vommond.matc.canvas.toolbar.Validation"});
			this.db = new DomBuilder();
		},
		
				
		setModel:function(model){
			this.model = model;
		},
		
		getValidationModel:function(widget){
			if(widget.props && widget.props.validation){
				return widget.props.validation;
			}
			return {};
		},
		
		
		setScreenIDs:function(ids){
			this.screenIDs = ids;
		},
		
		setValue:function(line){
			this.line = lang.clone(line);
			this.value = this.line.rule;
			if(!this.value){
				this.value = {
					"widget" : null,
					"operation" : null,
					"value" : null
				};
			}
			
			this.render(this.value);

		},
		
		getValue:function(){
			return this.value;
		},
		
		

		isValid:function(){
		
			return this.value.widget!=null && this.value.operator !=null;
		},
		
		
		render:function(rule){
			this.domNode.innerHTML="";
			this.cleanUpTempListener();
			this.renderWidget(rule);
			this.renderOperator(rule);
			this.renderValue(rule);
		},
		
		
		renderWidget:function(rule){
			var row = this.db.div("form-group").build(this.domNode);
			this.db.label(null,"Widget").build(row);
			var drpBox = this.$new(DropDownButton, {maxLabelLength:25});
			drpBox.setOptions(this.getUIWidgets());
			drpBox.setValue(rule.widget)
			drpBox.placeAt(row);
			this.tempOwn(on(drpBox, "change", lang.hitch(this, "setWidget")));
			console.debug("renderWidget", "exit")
		},
		
		getUIWidgets:function(){
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
		
		renderOperator:function(rule){
			
			if(rule.widget){
				var widget = this.model.widgets[rule.widget];
				if(widget){
					
					var row = this.db.div("form-group").build(this.domNode);
					this.db.label(null,"Operator").build(row);
					var drpBox = this.$new(DropDownButton, {maxLabelLength:25});
					drpBox.setOptions(this.getOperators(widget));
					drpBox.setValue(rule.operator)
					drpBox.placeAt(row);
					this.tempOwn(on(drpBox, "change", lang.hitch(this, "setOperator")));

				} else {
					console.warn("renderOperator() > No widget with id",rule.widget );
				}
				
			}
		},
		
		
		getOperators:function( widget){
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
					        result.push({"value" : "contains", label:"Contains"});
					        
					    	
					        break;
					    default:
					    	//console.warn("getOperators() > not supported validaton string type", valType, val)
					}
					
				}
				
			}
			return result;
		},
		
		
		renderValue:function(rule){
			if(rule.widget && rule.operator && rule.operator != "isValid"){
				var widget = this.model.widgets[rule.widget];
				if(widget){
					var row = this.db.div("form-group").build(this.domNode);
					
					
					var type = this.widgetOutputTypes[widget.type];
					
					if(this["renderValue_" +type]){
						this["renderValue_" +type](row, widget, rule);
					} 
					
				} else {
					console.debug("renderValue() > No widget with id", rule.widget);
				}
				
			}
		},
		
		renderValue_options:function(row, widget, rule){
			this.db.label(null,"Value").build(row);
			
			var drpBox = this.$new(DropDownButton,{maxLabelLength:25});
			drpBox.setOptions(this.getOptions(widget));
			drpBox.setValue(rule.value)
			drpBox.placeAt(row);
			this.tempOwn(on(drpBox, "change", lang.hitch(this, "setRuleValue")));	
		},
		
		renderValue_string:function(row, widget, rule){
			
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
		
		renderValue_int:function(row, widget, rule){
							
			var number = this.db.formGroup("MatcIgnoreOnKeyPress", "Value", rule.value, "").build(this.domNode);
			this.tempOwn(on(number, "keyup", lang.hitch(this, "setRuleValueNumber", number, "int")));
		
		},

		
		
		getOptions:function(widget){
			var result = [];
			var options = widget.props.options;
	    	if(options){
	    		for(var i =0; i< options.length; i++){
	    			result.push({"value" : options[i], label:options[i]});
	    		}
	    	}
	    	return result;
		},
			

			
	
		setWidget:function(id){
			this.value.widget = id;
			this.value.operator = null;
			this.value.value = null;
			this.render(this.value);
			this._onChange();
		},
		
		setOperator:function(value){
			this.value.operator = value;
			this.render(this.value);
			this._onChange();
		},
		
		setRuleValue:function(value){
			this.value.value = value;
			this._onChange();
		},
		
		setRuleValueText:function(input){
			this.value.value = input.value;
			this._onChange();
		},
		
		setText:function(input){
			this.value.text = input.value;
			this._onChange();
		},
		
		
		setRuleValueNumber:function(input, type){

			
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
		
		

		_onChange:function(){
			
		}
    }, 
    mounted () {
    }
}
</script>