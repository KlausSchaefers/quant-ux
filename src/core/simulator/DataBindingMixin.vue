<template>
  <div>
  </div>
</template>
<script>

export default {
	name: 'ScrollMixin',
    methods: {
        onUIWidgetDataBinding (screenID, widgetID, variable, value){
			this.dataBindingValues[variable] = value;
			
			/**
			 * Find all widgets that are bound to this variable then
			 * 
			 * - call setDataBinding() or innerHTML in case of Label
			 * 
			 * - call getState
			 * 
			 * - log state for player this.log("WidgetInit", screenID, e.id, null, state);
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