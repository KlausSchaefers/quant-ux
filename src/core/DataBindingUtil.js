export function getAllAppVariables(model) {

    const variables = [];

    for (let id in model.widgets) {
        let widget = model.widgets[id];
        if (widget.props && widget.props.databinding) {
            let databinding = widget.props.databinding;
            for (let key in databinding) {
                let variable = databinding[key];
                if (variables.indexOf(variable) < 0) {
                    variables.push(variable);
                }
            }
        }
        // the rest widget save at some oher place
        if (widget.props && widget.props.rest && widget.props.rest.output) {
            let variable = widget.props.rest.output.databinding
            if (variables.indexOf(variable) < 0) {
                variables.push(variable);
            }
        }
    }

    return variables;
}

export function getHintsAppVariables(model) {

    const variables = [];

    for (let id in model.widgets) {
        let widget = model.widgets[id];
        if (widget.props && widget.props.rest && widget.props.rest.output) {
            let hints = widget.props.rest.output.hints;
            if (hints) {
                for (let key in hints) {
                    variables.push(key.replace(/_/g, '.'))
                }
            }
        }
    }

    return variables;
}

export function getSchema(model) {
    if (model.schema) {
        return model.schema
    }
    return {}
}