
import lang from 'dojo/_base/lang'
import win from 'dojo/win'
import Logger from 'common/Logger'
import Core from 'core/Core'
import CoreUtil from 'core/CoreUtil'

export default class ShareController extends Core{

	constructor (){
		super()
		this.logger = new Logger("ShareContoller");
		this.logger.log(2,"constructor", "exit");
	}

	/**********************************************************************
	 * Dependencies
	 **********************************************************************/

	setCanvas (c){
		this.logger.log(3,"setCanvas", "entry");
		this._canvas = c;
	}

	setToolbar (t){
		this.logger.log(3,"setToolbar", "entry");
		this.toolbar = t;
	}

	setModelService (s) {
		this.modelService = s
	}

	setModelFactory (f){
		this.logger.log(3,"setModelFactory", "entry");
		this.factory = f;
	}

	setModel (m, screenID){
		this.logger.log(2,"setModel", "entry > " + screenID);
		this.model = m;

		// Zoom out if large model!
		var count = this.countProps(m.screens);
		if (count > 4) {
			if(this._canvas){
				this._canvas.zoom = 0.25;
				this._canvas.zoomLevelPos = 2;
			}
		}

		this.inheritedModel = this.createInheritedModel(m);
		this.oldModel = lang.clone(m);
		this.render(screenID);

		if(this.toolbar){
			this.toolbar.setModel(m);
		}

		if (this._canvas) {
			this._canvas.setFonts(m.fonts)
		}

		this.logger.log(3,"setModel", "entry > " + screenID);
	}


	setMode (mode){
		this.logger.log(0,"setMode", "entry > " + mode);
		if (this.toolbar) {
			this.toolbar.setMode(mode);
		}
		this._canvas.setMode(mode);
	}

	setSinglePage (enabled){
		this.logger.log(0,"setSinglePage", "entry > " + enabled);
	}


	getZoomFactor (){
		if(this._canvas){
			return this._canvas.getZoomFactor();
		}
		return 1;
	}

	/**********************************************************************
	 * Canvas Delegates
	 **********************************************************************/

	render (screenID){
		this.logger.log(2,"render", "enter > screenID : " + screenID);

		if(this._canvas){
			let inheritedModel = CoreUtil.createInheritedModel(this.model)
			requestAnimationFrame(() => {
				this._canvas.setModel(inheritedModel);
				this._canvas.render(inheritedModel);
				if(screenID){
					this._canvas.moveToScreen(screenID);
				}
			})
		}
	}

	_requestRendering (screenID){
		if(this._zoomedModel){
			this._canvas.render(this._zoomedModel);
			if(screenID){
				this._canvas.moveToScreen(screenID);
			}
		}
		this._zoomedModel = null;
	}

	_zoomToScreen (screenID){
		if(screenID && this.model.screens[screenID]){
			/**
			 * here we make sure the selected screen fits in the
			 * browser window. We simply find the smallest possible
			 * zoom factor and subtract 0.2 to make sure it fits in
			 * browser
			 */
			var screen = this.model.screens[screenID];
			let winBox = win.getBox();
			let x =  winBox.w / screen.w;
			let y =  winBox.h / screen.h;
			var zoom = (Math.floor( Math.min(x,y) * 10) / 10) -0.2 ;
			this._canvas.setZoom(zoom);

		}
	}

	/**********************************************************************
	 * Selection methods
	 **********************************************************************/

	onWidgetSelected (id){
		this.logger.log(0,"onWidgetSelected", "enter > "+ id);
		var widget = this.inheritedModel.widgets[id];
		if(widget){
			if(this.toolbar){
				this.toolbar.onWidgetSelected(widget);
			}
		} else {
			console.warn("onWidgetSelected() > No width with id", id);
		}
	}


	onScreenSelected (id){
		this.logger.log(1,"onScreenSelected", "enter > "+ id);
		var screen = this.model.screens[id];
		if(this.toolbar){
			this.toolbar.onScreenSelected(screen);
		}
	}

	onCanvasSelected (){
		this.logger.log(1,"onCanvasSelected", "enter ");
		if(this.toolbar){
			this.toolbar.onCanvasSelected();
		}
	}

	onLineSelected (id){
		this.logger.log(1,"onLineSelected", "enter > " + id);
		var line = this.model.lines[id];
		if(this.toolbar){
			this.toolbar.onLineSelected(line);
		}
	}

	onMultiSelect (selection){
		this.logger.log(1,"onMultiSelect", "enter > ");
		if(this.toolbar){
			/**
			 * TODO: get all the model elements
			 */
			this.toolbar.onMultiSelect(selection);
		}
	}

	onGroupSelected (id){
		this.logger.log(1,"onGroupSelected", "enter > " + id);
		if(this.model.groups && this.model.groups[id]){
			if(this.toolbar){
				var group = this.model.groups[id];
				this.toolbar.onGroupSelect(group);
			}
		}
	}

	unSelect (){
		if(this._canvas){
			this._canvas.unSelect();

		}
		if(this.toolbar){
			this.toolbar.cleanUp();
		}
	}


	showSuccess (msg){
		if(this._canvas){
			this._canvas.showSuccess(msg);
		}
	}

	showError (msg){
		if(this._canvas){
			this._canvas.showError(msg);
		}
	}

}