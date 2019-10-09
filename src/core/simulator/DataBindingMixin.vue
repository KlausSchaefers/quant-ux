<template>
  <div>
  </div>
</template>
<script>

import JSONPath from 'core/JSONPath'

export default {
	name: 'DataBindingMixin',
    methods: {
		setDataBindingByKey (path, value) {
			this.dataBindingValues[path] = value;
			this.emit('onDataBindingChange', this.dataBindingValues)
		},

		getDataBindingByPath (path) {
			this.logger.log(3, "getDataBindingByPath","enter ", path);					
			if (this.dataBindingValues) {
				return JSONPath.get(this.dataBindingValues, path)
			}
		},

		getDefaultDatabinding (path) {
			/**
			 * we might not have matched anything, because the no databinding event was emitted.
			 * This makes sense, because several widgets might be bound to the same value.
			 * To make, navigation work, we get the getValue(). This is error prone,
			 * if we have several widgets!
			 * As the facory cleans up before every rendering, this should be ok
			 */
			for(var id in this.model.widgets){
				var widget = this.model.widgets[id];
				if (widget && widget.props) {
				var databinding = widget.props.databinding;
					for(var key in databinding){
						var variable = databinding[key];
						if (variable === path) {
							let uiWidget = this.renderFactory.getUIWidgetByID(id);
							if (uiWidget) {
								this.logger.log(-1, "getDataBindingByPath"," return default " + path);
								let value = uiWidget.getValue()
								if (value) {
									return value
								}
							}
						}
					}
				}
			}
		},

        onUIWidgetDataBinding (screenID, widgetID, variable, value){
			
			this.dataBindingValues = JSONPath.set(this.dataBindingValues, variable, value)
			/*
			let elements = JSONPath.getJsonPath(variable)
			let current = elements.shift()
			let node = this.dataBindingValues
			let i = 0
			while (current && i < 100) {
				i++
				if (elements.length > 0) {
					if (!node[current]) {
						if (elements[0].toLowerCase) {
						
							node[current] = {}
						} else {
							node[current] = []
						}
					}
					node = node[current]
					current = elements.shift()
				} else {
					node[current] = value;
				}
			}
			*/
			this.emit('onDataBindingChange', this.dataBindingValues)
			
			/**
			 * Find all widgets that are bound to this variable then
			 * 
			 * - call setDataBinding() for each widget. They determine if the accept
			 * 
			 * - if the accept, 
			 *    
			 *     - call getState
			 * 
			 *     - log state for player this.log("WidgetInit", screenID, e.id, null, state);
			 */
			var widgets = this.renderFactory.getAllUIWidgets();
			for(var id in widgets){
				var uiWidget = widgets[id];
				var changed = uiWidget.setDataBinding(variable, value, this);
				if(changed){
					var state = uiWidget.getState();
					this.log("WidgetInit", screenID, id, null, state);
				}
			}
		},
		
		initDataBinding (uiWidget, screen){
			var databinding = this.getDataBinding(uiWidget.model);
			if(databinding ){
				for(var key in databinding){
					var variable = databinding[key];
					var value = this.getDataBindingByPath(variable);
					if(value !== null && value !== undefined){
						var changed = uiWidget.setDataBinding(variable, value, this);
						if(changed){
							var state = uiWidget.getState();
							if (state) {
								this.log("WidgetInit", screen.id, uiWidget.model.id, null, state);
							}
						}
					}
				}
			}
		},

		flushOutputDataBinding (screenID, widgetID) {
			/**
			 * This is needed for clicks in containers. As containers can have 
			 * an output databinding, we want to set here the correct value,
			 * for all subsequent requests.
			 * This methid is only triggered of there are lines. If we want some
			 * click update we have to also onWidgetClicked() method
			 */
			let widget = this.model.widgets[widgetID]
			if (widget && widget.container) {
				let cntrWidget = this.model.widgets[widget.container]
				if (cntrWidget) {
					/**
					 * If there is a container and it has an output defined,
					 * we will read the value of the n-th child and update
					 * the data binding. 
					 */
					let uiWidget = this.renderFactory.getUIWidgetByID(widget.container)
					let databindingSettings = this.getDataBinding(cntrWidget)
					if (uiWidget && databindingSettings && databindingSettings.output) {
						let value = uiWidget.getOutputDataBindingValue(widget.dataBingingIndex)
						if (value != null && value !== undefined) {
							this.onUIWidgetDataBinding(screenID, widgetID, databindingSettings.output, value)
						}
					}
				}
			}
		}
    }
}
</script>