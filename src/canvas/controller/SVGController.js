import DesignToken from './DesignToken'

export default class SVGController extends DesignToken {
   
	setSVGPathProps (widgetID, pathID, key, value){
        this.logger.log(1, "setSVGPathProps", "enter > widget:" + widgetID + " > path: " + pathID);
		if (value === '') {
			this.logger.warn("setSVGPathProps", "exit EMPYT name > " + widgetID);
			return
		}

		const widget = this.model.widgets[widgetID];
		if(!widget || !widget?.props?.paths){
            this.logger.warn("setSVGPathName", "exit > NO WIDGET OR PATHS > ", widget);
            return
        }

        const path = widget.props.paths.find(p => p.id === pathID)
        if (!path) {
            this.logger.warn("setSVGPathName", "exit NO PATH > " + pathID);
            return
        }

        if (path[key] === value) {
            this.logger.warn("setSVGPathName", "exit NO CHANGE > " + value);
            return
        }

        const command = {
            timestamp : new Date().getTime(),
            type : "SVGPathName",
            o : path.name,
            n : value,
            key: key,
            widgetID : widgetID,
            pathID: pathID
        };
        this.addCommand(command);
        this.modelSVGPathName(widgetID, pathID,key, value);
	}

	modelSVGPathName (widgetID, pathID, key, value){
		const widget = this.model.widgets[widgetID];
        if(!widget || !widget?.props?.paths){
            this.logger.warn("modelSVGPathName", "exit > NO WIDGET OR PATHS > " + widgetID);
            return
        }
        const path = widget.props.paths.find(p => p.id === pathID)
        if (!path) {
            this.logger.warn("modelSVGPathName", "exit NO PATH > " + pathID);
            return
        }
		path[key] = value;
		this.onModelChanged([{type: 'widget', action:"change", id: widgetID}])
        this.render();
		this.onSVGPathKeyChange(widgetID, pathID, key, value)
	}

    onSVGPathKeyChange (widgetID, pathID, key, value) {
        if (this._canvas) {
            this._canvas.changeSVGProps(widgetID, pathID, key, value)
        }
        if (this.toolbar) {
            this.toolbar.showSVGPathProps(pathID, key, value)
        }
    }

	undoSVGPathName (command){
		this.modelSVGPathName(command.widgetID, command.pathID, command.key, command.o);

	}


	redoSVGPathName(command){
		this.modelSVGPathName(command.widgetID, command.pathID, command.key, command.n);
	}
}