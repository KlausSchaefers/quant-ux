import DesignToken from './DesignToken'
import lang from '../../dojo/_base/lang'
import * as SVGUtil from '../../svg/SVGUtil'

export default class SVGController extends DesignToken {

    changeSVGLayer (widgetID, fromPathId, toPathId) {
        this.logger.log(-1, "changeSVGLayer", "enter > widget:" + widgetID + " > path: " + fromPathId + ' -> ' + toPathId);
		this.startModelChange()
        const widget = this.model.widgets[widgetID];
		if(!widget || !widget?.props?.paths){
            this.logger.warn("changeSVGLayer", "exit > NO WIDGET OR PATHS > ", widgetID);
            return
        }

        const command = {
            timestamp : new Date().getTime(),
            type : "SVGPathLayer",
            widgetID : widgetID,
            fromPathId: fromPathId,
            toPathId: toPathId
        };
        this.addCommand(command);
        this.modelSVGPathLayer(widgetID, fromPathId, toPathId, 'top');
		this.commitModelChange(true, true)
    }

    modelSVGPathLayer (widgetID, fromPathId, toPathId, direction) {

        const widget = this.model.widgets[widgetID];
        if(!widget || !widget?.props?.paths){
            this.logger.warn("modelSVGPathLayer", "exit > NO WIDGET OR PATHS > ", widgetID);
            return
        }

        SVGUtil.changePathOrder(widget.props.paths, fromPathId, toPathId, direction)

        this.onModelChanged([{type: 'widget', action:"change", id: widgetID}])
        this.onSVGPathOrderChange(widgetID, fromPathId, toPathId )
        this.render()
    }

    onSVGPathOrderChange (widgetID, fromPathId, toPathId) {
        if (this._canvas) {
            this._canvas.changeSVGPathOrder(widgetID, fromPathId, toPathId)
        }
    }



    undoSVGPathLayer(command){
		this.modelSVGPathLayer(command.widgetID, command.toPathId, command.fromPathId, 'top');
	}


	redoSVGPathLayer(command){
		this.modelSVGPathLayer(command.widgetID, command.fromPathId, command.toPathId, 'top');
	}
   
    /**********************************************************************
	 * Clip Props
	 **********************************************************************/


	setSVGPathProps (widgetID, pathID, key, value){		
        this.logger.log(1, "setSVGPathProps", "enter > widget:" + widgetID + " > path: " + pathID);
		if (value === '') {
			this.logger.warn("setSVGPathProps", "exit EMPYT name > " + widgetID);
			return
		}

		const widget = this.model.widgets[widgetID];
		if(!widget || !widget?.props?.paths){
            this.logger.warn("setSVGPathName", "exit > NO WIDGET OR PATHS > ", widgetID);
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

		this.startModelChange()
        const command = {
            timestamp : new Date().getTime(),
            type : "SVGPathProps",
            o : path.name,
            n : value,
            key: key,
            widgetID : widgetID,
            pathID: pathID
        };
        this.addCommand(command);
        this.modelSVGPathProps(widgetID, pathID,key, value);
		this.commitModelChange(true, true)
	}

	modelSVGPathProps (widgetID, pathID, key, value){
		const widget = this.model.widgets[widgetID];
        if(!widget || !widget?.props?.paths){
            this.logger.warn("modelSVGPathProps", "exit > NO WIDGET OR PATHS > " + widgetID);
            return
        }
        const path = widget.props.paths.find(p => p.id === pathID)
        if (!path) {
            this.logger.warn("modelSVGPathProps", "exit NO PATH > " + pathID);
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

	undoSVGPathProps(command){
		this.modelSVGPathProps(command.widgetID, command.pathID, command.key, command.o);
	}


	redoSVGPathProps(command){
		this.modelSVGPathProps(command.widgetID, command.pathID, command.key, command.n);
	}

    /**********************************************************************
	* Widget position and props
	**********************************************************************/
	updateSVGWidget (id, pos, props){
		this.logger.log(-1,"updateSVGWidget", "enter > ");

		const widget = this.model.widgets[id];
		if (!widget) {
			this.logger.log(-1,"updateSVGWidget", "exit > no widdget with id ");
			return 
		}

		const zoomedPos = this.getUnZoomedBox(pos, this._canvas.getZoomFactor());
        if (this.isPositionEqual(widget, zoomedPos) && this.objectEquals(widget.props, props)) {
            this.logger.log(-1,"updateSVGWidget", "exit > No change");
            return
        }
	
		const command = this.createSVGWidgeUpdateCommand(id, zoomedPos, props);
		if(command){
			this.startModelChange()
			this.addCommand(command);
			this.modelSVGWidgetUpdate(id, pos, props);
			this.checkTemplateAutoUpdate([{id: id, type:'widget', action:'change', prop:'props'}])
			// FIXME: calling this.renderWidget(widget, 'props') will not update the bounding box
			this.render()
			this.commitModelChange(true, true)
			return widget
		}
	}

    isPositionEqual (source, target) {
        return source.w === target.w && source.h === target.h && source.x === target.x &&  source.y === target.y
    }

	createSVGWidgeUpdateCommand (id, pos, props) {
	
		const widget = this.model.widgets[id];
		if (widget){
			const command = {
				timestamp : new Date().getTime(),
				type : "SVGWidgetUpdate",
				oldProps : lang.clone(widget.props),
				newProps : lang.clone(props),
				oldPos: {
					x: widget.x,
					y: widget.y,
					w: widget.w,
					h: widget.h
				},
				newPos: {
					x: pos.x,
					y: pos.y,
					w: pos.w,
					h: pos.h
				},
				modelId : id
			};
			return command;
		}
	}

	modelSVGWidgetUpdate (id, pos, props) {
		const widget = this.model.widgets[id];
		if (widget){
			widget.props = props
			this.updateBox(pos, widget)

			/**
			 * remove from parent screen if set.
			 */
			this.cleanUpParent(widget);

			/**
			 * update parent screen
			 */
			const parent = this.getHoverScreen(widget);
			if(parent){
				parent.children.push(widget.id);
			}

			this.setLastChangedWidget(widget)
			this.onModelChanged([{type: 'widget', action:"change", "prop": "position", id: id}])
		}
	}

	undoSVGWidgetUpdate(command) {
		this.modelSVGWidgetUpdate(command.modelId, command.oldPos, command.oldProps)
		this.render()
	}

	redoSVGWidgetUpdate(command) {
		this.modelSVGWidgetUpdate(command.modelId, command.newPos, command.newProps)
		this.render()
	}


	/**********************************************************************
	* Widget Props
	**********************************************************************/
	updateSVGWidgetProps (id, props){
		this.logger.log(-1,"updateSVGWidgetProps", "enter > ");

		const widget = this.model.widgets[id];
		if (!widget) {
			this.logger.log(-1,"updateSVGWidgetProps", "exit > no widdget with id ");
			return 
		}
      
		const command = this.createSVGWidgePropstUpdateCommand(id, props);
		if(command){
			this.startModelChange()
			this.addCommand(command);
			this.modelSVGWidgetPropsUpdate(id, props);
			this.checkTemplateAutoUpdate([{id: id, type:'widget', action:'change', prop:'props'}])
			this.render()
			this.commitModelChange()
			return widget
		}
	}

	createSVGWidgePropstUpdateCommand (id, props) {
	
		const widget = this.model.widgets[id];
		if (widget){
			const command = {
				timestamp : new Date().getTime(),
				type : "SVGWidgePropstUpdate",
				oldProps : lang.clone(widget.props),
				newProps : lang.clone(props),				
				modelId : id
			};
			return command;
		}
	}

	modelSVGWidgetPropsUpdate (id, props) {
		const widget = this.model.widgets[id];
		if (widget){
			widget.props = props
			this.setLastChangedWidget(widget)
			this.onModelChanged([{type: 'widget', action:"change", "prop": "position", id: id}])
		}
	}

	undoSVGWidgePropstUpdate(command) {
		this.modelSVGWidgetPropsUpdate(command.modelId, command.oldProps)
		this.render()
	}

	redoSVGWidgePropstUpdate(command) {
		this.modelSVGWidgetPropsUpdate(command.modelId, command.newProps)
		this.render()
	}

	/**********************************************************************
	* Toolbar delegates
	**********************************************************************/

	onSVGPathsMoved (paths, bbox) {
		this.logger.log(3,"onSVGPathsMoved", "enter > ");
		if(this.toolbar){
			this.toolbar.onSVGPathsMoved(paths, bbox);
		}
	}

	onSVGPathsSelected (paths, bbox) {
		this.logger.log(3,"onSVGPathsSelected", "enter > ");
		if(this.toolbar){
			this.toolbar.onSVGPathsSelected(paths, bbox);
		}
	}

	onSVGCommandStackChange (hasUndo, hasRedo) {
		this.logger.log(3,"onSVGPathsSelected", "enter > ");
		if(this.toolbar){
			this.toolbar.onSVGCommandStackChange(hasUndo, hasRedo);
		}
	}
}