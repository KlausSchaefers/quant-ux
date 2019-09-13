<template>
  <div>
  </div>
</template>
<script>

export default {
	name: 'ScrollMixin',
    methods: {
		setDataBindingByPath (path, value) {
			this.dataBindingValues[path] = value;
		},

		getDataBindingByPath (path) {
			this.logger.log(-1, "getDataBindingByPath","enter " + path);					
			if (this.dataBindingValues) {
				// check if we have some match. For now widgets could emit
				// values with a dot! The 
				if (this.dataBindingValues[path]) {
					return this.dataBindingValues[path]
				}
				if (path.indexOf('.') >=0 ){
					console.warn('getDataBindingByPath() not implemented yet');
				}

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

			}
		},

        onUIWidgetDataBinding (screenID, widgetID, variable, value){
			/**
			 * FIXME: Add here support for paths!
			 */
			this.dataBindingValues[variable] = value;
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
				var changed = uiWidget.setDataBinding(variable, value);
				if(changed){
					var state = uiWidget.getState();
					this.log("WidgetInit", screenID, id, null, state);
				}
			}
		},
		
		initDataBinding (uiWidget, screen){
			console.debug("initDataBinding")
			var databinding = this.getDataBinding(uiWidget.model);
			if(databinding ){
				for(var key in databinding){
					var variable = databinding[key];
					if(this.dataBindingValues[variable]){
						var value = this.dataBindingValues[variable];
						var changed = uiWidget.setDataBinding(variable, value);
						if(changed){
							var state = uiWidget.getState();
							this.log("WidgetInit", screen.id, uiWidget.model.id, null, state);
						}
					}
				}
			}
		}
    }
}
</script>