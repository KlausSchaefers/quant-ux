<script>
import on from 'dojo/on'
import lang from 'dojo/_base/lang'
import domStyle from 'dojo/domStyle'
import css from 'dojo/css'
import win from 'dojo/_base/win'

export default {
    name: '_DragNDrop',
    mixins:[],
    data: function () {
        return {
            dragnDropIsActive: true,
            dragNDropMinTimeSpan: 0
        }
    },
    components: {},
    methods: {

    	registerDragOnDrop (node, id, startCallback, moveCallback, endCallback, clickCallback, targetNode){

			// new method overload. We can attach the start event to a different node, then to one to be moved!
			if (!targetNode) {
				targetNode = node;
			}
			var listener = on(targetNode,"mousedown", lang.hitch(this,"onDragStart", node, id, startCallback, moveCallback, endCallback,clickCallback));

			if(!this._dragNDropListeners){
				this._dragNDropListeners = [];
			}
			this._dragNDropListeners.push(listener);
		},

		setDragNDropActive (active){
			this.dragnDropIsActive = active;
		},

		allignPosition (){
			// template method that could be corrected by children!
		},

		onDragStart (node, id, startCallback, moveCallback, endCallback, clickCallback, e){

			try{
				if(!this.dragnDropIsActive){
					return;
				}

				this.stopEvent(e);
				this.onDragCleanup();
				this._dragNDropNode = node;
				css.add(node,"VommondDnDStart");

				this._dragnDropStartCallback = startCallback;
				this._dragnDropMoveCallback = moveCallback;
				this._dragnDropEndCallback = endCallback;
				this._dragnDropClickCallback = clickCallback;
				this._dragnDropID = id;

				/**
				 * We set the start time and also reset the timespan in which all events
				 * are ignored. The user can after calling the start event overwrite this...
				 */
				this._dragnDropStartTime = new Date().getTime();
				this._dragNDropMinTime = this.dragNDropMinTimeSpan;

				/**
				 * FIXME This could also be the model positions. Lets hope this
				 * is for now always the same!
				 */
				this._dragNDropStartPos = this.domUtil.getPos(node);
				this._dragnDropMousePos = this._getMousePosition(e);
				this._dragNDropRenderJobs = {};

				this._dragNDropMove = on(win.body(),"mousemove", lang.hitch(this,"onDragMove"));
				this._dragNDropUp = on(win.body(),"mouseup", lang.hitch(this,"onDragEnd"));

				if (this[this._dragnDropStartCallback]){
					try {
						const modelPos = this[this._dragnDropStartCallback](this._dragnDropID, this._dragNDropNode, this._dragNDropStartPos,e);

						if(modelPos){
							this._dragNDropStartPos = modelPos;
						}  else {
							console.debug('onDragStart() NO DND model pos')
						}
					} catch(e){
						if(this.logger){
							this.logger.sendError(e);
							this.logger.error("onDragStart", "Could not indluce callback " + this._dragnDropStartCallback, e);
						} else {
							console.error("onDragStart() > Error invoking " + this._dragnDropStartCallback);
						}
					}
				}
			} catch(e){
				if(this.logger){
					this.logger.error("onDragStart", "Could not start " + this._dragnDropStartCallback, e);
					this.logger.sendError(e);
				} else {
					console.error("onDragStart() > Could not start " + this._dragnDropStartCallback);
				}
			}

		},

		setDnDMinTime (t){
			this.logger.log(2,"setDnDMinTime", "enter > " + t);
			this._dragNDropMinTime = t;
		},

		onDragMove (e){
			try {
				this.stopEvent(e);

				const now = new Date().getTime();
				/**
				 * We prevent any dnd action for the first 250 ms to avoid unwanted
				 * movements that can happen due to the touchpad
				 */
				if(now - this._dragnDropStartTime < this._dragNDropMinTime){
					return;
				}

				/**
				 * Sometimes there might be still a listener.
				 * We stop that now.
				 */
				if(!this._dragNDropNode){
					this.onDragCleanup();
					return;
				}

				const pos = this._getMousePosition(e);
				const difX = pos.x - this._dragnDropMousePos.x;
				const difY = pos.y - this._dragnDropMousePos.y;
				const x = this._dragNDropStartPos.x + difX;
				const y = this._dragNDropStartPos.y + difY;

				/**
				 * Only start DND if there was a real mouse movement.
				 * In Chrome a move event is sometimes fired right
				 * after the click
				 */
				if(!this._dragNDropStarted){

					if(Math.abs(difX) > 2 || Math.abs(difY) > 2){
						this.logger.log(2,"onDragMove", "Start DND");
						this._dragNDropStarted = true;
					} else {
						this.logger.log(2,"onDragMove", "Exit DND");
						return;
					}
				}

				/**
				 * add css to make it look good
				 */
				css.add(this._dragNDropNode,"VommondDnDMove");

				/**
				 * compute new model(!!!) position
				 */
				let newPos = {
					x: x,
					y: y,
					h: this._dragNDropStartPos.h,
					w: this._dragNDropStartPos.w
				};

				/**
				 * calculate new position on
				 * grid or ruler
				 */
				newPos = this.allignPosition(newPos, e);

				this._dragNDropLastPos = newPos;

				/**
				 * calculate the dif now based on the corrected value
				 */
				const dif = {
					x : difX - (x-newPos.x),
					y : difY - (y-newPos.y)
				};

				/**
				 * if there a callback check if the move is ok.
				 */
				let isInArea = true;
				if (this[this._dragnDropMoveCallback]){
					try {
						//console.debug("move callback", this._dragnDropMoveCallback)
						isInArea = this[this._dragnDropMoveCallback](this._dragnDropID, this._dragNDropNode, newPos, dif, e);
					} catch (e) {
						if(this.logger){
							this.logger.error("onDragMove", "Error invoking " + this._dragnDropMoveCallback, e);
							this.logger.sendError(e);
						} else {
							console.error("onDragMove() > Error invoking " + this._dragnDropMoveCallback);
						}
					}
				}

				if (isInArea !== false){
					/**
					 * we have a render queue, and have to put a new
					 * job in the queue
					 */
					const job = {
						div : this._dragNDropNode,
						pos : newPos,
						id : this._dragnDropID
					};
					this.addDragNDropRenderJob(job);
					if(!window.requestAnimationFrame){
						console.warn("No requestAnimationFrame()");
						this._dragNDropUpDateUI();
					} else {
						var callback = lang.hitch(this, "_dragNDropUpDateUI");
						requestAnimationFrame(callback);
					}
				}
			} catch(e){
				if(this.logger){
					this.logger.error("onDragMove", "Error...", e);
					this.logger.sendError(e);
				} else {
					console.error("onDragMove() > Error");
				}
			}

			return false;
		},

		addDragNDropRenderJob (job){
			this._dragNDropRenderJobs[job.id] = job;
		},

		/**
		 * runs async as requestAnimationFrame...
		 */
		_dragNDropUpDateUI (){

			if(!this._dragNDropNode){
				this.onDragCleanup();
				return;
			}

			/**
			 * update all
			 */
			let updateResizeHandlers = false;
			for(let id in this._dragNDropRenderJobs){
				const job = this._dragNDropRenderJobs[id];
				const div = job.div;
				const pos = job.pos;
				if(div){
					this.domUtil.setPos(div, pos)
					/**addDragNDropRenderJob
					 * check if have to update also the resize handlers
					 */
					//console.debug(this._resizeHandlerBox.id, id)
					if(this._resizeHandlerBox && id == this._resizeHandlerBox.id){
						updateResizeHandlers = true;
					}
				}
			}

			/**
			 * check here
			 */
			if(this._dragNDropRenderResizeHandlerJob && updateResizeHandlers){
				this._updateResizeHandlers(this._dragNDropRenderResizeHandlerJob);
			}

			/**
			 * clean job queue
			 */
			this._dragNDropRenderJobs = {};
			delete this._dragNDropRenderResizeHandlerJob;
		},


		onDragEnd (e){
			//console.debug("onDragEnd", this._dragnDropEndCallback );
			try{
				this.stopEvent(e);

				if(!this._dragnDropMousePos){
					console.warn("onDragEnd() > No _dragnDropMousePos" );
					this.onDragCleanup();
					return;
				}
				const pos = this._getMousePosition(e);
				const difX = pos.x - this._dragnDropMousePos.x;
				const difY = pos.y - this._dragnDropMousePos.y;
				const x = this._dragNDropStartPos.x + difX;
				const y = this._dragNDropStartPos.y + difY;

				/**
				 * Take the last dnd position, in because otherwise
				 * the aligner might make trouble
				 */
				let newPos = this._dragNDropLastPos;
				if(!newPos){
					newPos = {
						x: x,
						y: y,
						h: this._dragNDropStartPos.h,
						w: this._dragNDropStartPos.w
					};
				}

				const dif = {
					x : difX - (x-newPos.x),
					y : difY - (y-newPos.y)
				};

				if(this._dragNDropStarted){
					if(this[this._dragnDropEndCallback]){
						try{
							this[this._dragnDropEndCallback](this._dragnDropID, this._dragNDropNode, newPos,dif, e);
						}catch(e){
							if(this.logger){
								this.logger.error("onDragEnd", "Error invoking drop end " + this._dragnDropEndCallback, e);
								this.logger.sendError(e);
							} else {
								console.error("onDragEnd() > Error invoking drop end" + this._dragnDropEndCallback);
							}
						}

					}
				} else {
					if(this[this._dragnDropClickCallback]){
						try{
							this[this._dragnDropClickCallback](this._dragnDropID, this._dragNDropNode, newPos,e);
						}catch(e){
							if(this.logger){
								this.logger.error("onDragEnd", "Error invoking click " + this._dragnDropClickCallback, e);
								this.logger.sendError(e);
							} else {
								console.error("onDragEnd() > Error invoking click" + this._dragnDropClickCallback);
							}
						}
					}
				}



				this.onDragCleanup();
			} catch(e){
				if(this.logger){
					this.logger.error("onDragEnd", "Error", e);
					this.logger.sendError(e);
				} else {
					console.error("onDragEnd() > Error");
				}
			}
		},

		onDragCleanup (){
			if(this._dragNDropNode){
				css.remove(this._dragNDropNode,"VommondDnDStart");
				css.remove(this._dragNDropNode,"VommondDnDMove");
			}

			this._dragnDropMoveCallback = null;
			this._dragnDropEndCallback = null;
			this._dragnDropClickCallback=null;
			this._dragNDropRenderJobs = null;
			this._dragNDropNode = null;
			if(this._dragNDropMove){
				this._dragNDropMove.remove();
			}
			delete this._dragNDropMove;
			if(this._dragNDropUp){
				this._dragNDropUp.remove();
			}
			delete this._dragNDropUp;
			this._dragNDropStarted = false;
			delete this._dragNDropLastPos;
			delete this._dragNDropRenderHandlerJob;
			delete this._dragnDropStartTime;
		},

		getStylePos (node){
			var s = domStyle.get(node);
			var x = s.left.replace("px","") *1 ;
			var y = s.top.replace("px","") *1;
			return {x : x , y : y};
		},


		cleanUpDragNDropListenerListener (){
			if(this._dragNDropListeners){
				for(var i=0; i < this._dragNDropListeners.length; i++){
					this._dragNDropListeners[i].remove();
				}
				this._dragNDropListeners = null;
			}
		}
    }
}
</script>