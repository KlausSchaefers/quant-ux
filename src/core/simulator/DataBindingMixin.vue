<template>
  <div>
  </div>
</template>
<script>

import JSONPath from 'core/JSONPath'

export default {
	name: 'DataBindingMixin',
    methods: {

		setSystemVariable (key, value) {
			this.logger.log(-1, "setSystemVariable","enter " + key, value);
			this.setDataBindingByKey('_qux.' + key, value)
		},

		/**
		 * Since 3.0.17 we set default values to data binding
		 */
		initDefaultDataBinding (model) {
			this.logger.log(3, "initDefaultDataBinding","enter ");

			let bindingsCount = {}
			Object.values(model.widgets).forEach(w => {
				let databinding = this.getDataBinding(w)
				if (databinding && databinding.default) {
					let defaultVariable = databinding.default
					/**
					 * We could make this even better and check if we alswas have different states.
					 */
					if (!bindingsCount[defaultVariable]) {
						bindingsCount[defaultVariable] = 1
					} else {
						bindingsCount[defaultVariable] = bindingsCount[defaultVariable] + 1
					}
				}
			})

			this.logger.log(1, "initDefaultDataBinding","counts ", this.bindingsCount);

			/**
			 * We should avoid overwriting stuff here, e.g.
			 * if we have two widhets pointing to the same value
			 */
			Object.values(model.widgets).forEach(w => {
				let databinding = this.getDataBinding(w)
				if (databinding && databinding.default && w.props) {
					let defaultVariable = databinding.default
					if (bindingsCount[defaultVariable] === 1) {
						let props = w.props
						if (props.checked === true || props.checked === false) {
							this.logger.log(5, "initDefaultDataBinding", "set (checked):" + w.name, props.checked);
							this.setDataBindingByKey(defaultVariable, props.checked)
						} else if (props.selected) {
							this.logger.log(5, "initDefaultDataBinding", "set (selected): " + w.name, props.selected);
							this.setDataBindingByKey(defaultVariable, props.selected)
						} else if (props.value) {
							this.logger.log(-1, "initDefaultDataBinding", "set (value): " + w.name, props.value);
							this.setDataBindingByKey(defaultVariable, props.value)
						} else if (props.active === true || props.active === false) {
							this.logger.log(-1, "initDefaultDataBinding", "set (active): " + w.name, props.active);
							this.setDataBindingByKey(defaultVariable, props.active)
						} else {
							// this.logger.log(6, "initDefaultDataBinding", "Could not set default: " + w.name, w.props);
						}
					} else {
						this.logger.log(-1, "initDefaultDataBinding","do not init ", defaultVariable);
					}
				}
			})
			this.logger.log(-1, "initDefaultDataBinding","exit ", this.dataBindingValues);

			/**
			 * Once we introduce default values via a UI configuration, we
			 * should add that here!
			 */
		},


		setDataBindingByKey (path, value) {
			if (this.dataBindingValues) {
				JSONPath.set(this.dataBindingValues, path, value)
				this.emit('onDataBindingChange', this.dataBindingValues)
			}
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
			for(let id in this.model.widgets){
				const widget = this.model.widgets[id];
				if (widget && widget.props) {
				const databinding = widget.props.databinding;
					for(let key in databinding){
						const variable = databinding[key];
						if (variable === path) {
							const uiWidget = this.renderFactory.getUIWidgetByID(id);
							if (uiWidget) {
								this.logger.log(-1, "getDataBindingByPath"," return default " + path);
								const value = uiWidget.getValue()
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
			this.emit('onDataBindingChange', this.dataBindingValues)
			this.updateAllDataBindings(screenID, variable, value)
		},

		updateAllDataBindings (screenID, variable, value) {
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
			const widgets = this.renderFactory.getAllUIWidgets();
			for(let id in widgets){
				const uiWidget = widgets[id];
				const changed = uiWidget.setDataBinding(variable, value, this);
				if(changed){
					const state = uiWidget.getState();
					this.log("WidgetInit", screenID, id, null, state);
				}
			}
		},

		initDataBinding (uiWidget, screen){
			var databinding = this.getDataBinding(uiWidget.model);
			if (databinding ){
				for (var key in databinding){
					var variable = databinding[key];
					var value = this.getDataBindingByPath(variable);
					if (value !== null && value !== undefined){
						var changed = uiWidget.setDataBinding(variable, value, this);
						if (changed){
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
		},

		replaceDataBinding (newValues) {
			 this.dataBindingValues = newValues
			const screenID = this.currentScreen.id
			const widgets = this.renderFactory.getAllUIWidgets();
			for(let id in widgets){
                const uiWidget = widgets[id];
         
                if (uiWidget.model && uiWidget.model.props && uiWidget.model.props.databinding) {
                    const databinding = uiWidget.model.props.databinding
                    for (let key in databinding) {
                        const variable = databinding[key]
                        const value = JSONPath.get(this.dataBindingValues, variable)
                        this.logger.log(-1,"renderScriptDataBinding","set  > " +  variable + ': ' , value);
                        const changed = uiWidget.setDataBinding(variable, value, this);
                        if(changed){
                            const state = uiWidget.getState();
                            this.log("WidgetInit", screenID, id, null, state);
                        }
                    }
                }
            }
		}
    }
}
</script>