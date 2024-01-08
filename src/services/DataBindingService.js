class DataBindingService {

	getAllBindingPaths(model) {
		var variables = []
		if (model) {
			for (var id in model.widgets) {
				var widget = model.widgets[id]
				// the rest widget save at some oher place
				if (widget.props && widget.props.rest && widget.props.rest.output) {
					let hints = widget.props.rest.output.hints
					if (hints) {
						for (let key in hints) {
							variables.push(key.replace(/_/g, "."))
						}
					}
                }
                if(widget.props && widget.props.databinding){
                    let databinding = widget.props.databinding;
                    for(let key in databinding){
                        let variable = databinding[key];
                        if(variables.indexOf(variable)<0){
                        variables.push(variable);
                        }
                    }
                }
                // the rest widget save at some oher place
                if(widget.props && widget.props.rest && widget.props.rest.output){
                    let variable = widget.props.rest.output.databinding
                    if(variables.indexOf(variable)<0){
                        variables.push(variable);
                    }
                }
			}
        }

		return variables
	}

	getDefautlBindings(widget) {
		if (widget && widget.type === "Table") {
			return [
				{ label: "Input", value: "default" },
				{ label: "Selected", value: "output" },
				{ label: "Action", value: "action" },
				{ label: "Pagination", value: "pagination" },
			]
		}
		if (widget && widget.type === "Repeater") {
			return [
				{ label: "Input", value: "default" },
				{ label: "Selected", value: "output" },
			]
		}
		if (widget && widget.type === "Paging") {
			return [
				{ label: "# Elements", value: "elements" },
				{ label: "Selected", value: "output" },
			]
		}
		// if ([widget && "TypeAheadTextBox", "DropDown", "MobileDropDown", "CheckBoxGroup", "RadioGroup", "Timeline"].indexOf(widget.type) >= 0) {
		// 	return [
		// 		{ label: "Input & Output", value: "default" },
		// 		{ label: "Options", value: "options" },
		// 	]
		// }

		return [{ label: "Input & Output", value: "default" }]
	}
}

export default new DataBindingService()
