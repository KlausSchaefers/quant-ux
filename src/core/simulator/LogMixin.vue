<template>
  <div>
  </div>
</template>
<script>
import lang from 'dojo/_base/lang'
import topic from 'dojo/topic'
import Services from 'services/Services'

export default {
	name: 'RestMixin',
    methods: {
        /**
		 * Log animation events. Pos is relative for correct playback!
		 */
		logAnimationEvent (screenID, widgetID, anim, triggerType){
			const event = lang.clone(anim.event);
			event.triggerType = triggerType;
			if(event.to.pos){
				event.to.pos = this.getRelativePosition(event.to.pos);
			}
			if(event.from.pos){
				event.from.pos = this.getRelativePosition(event.from.pos);
			}
			this.log("Animation",screenID, widgetID, null, {animation : event});
		},

		getRelativePosition (pos){
			return {
				x : Math.min(1,Math.round((pos.x / this.currentScreen.w ) * 1000) / 1000),
				y : Math.min(1,Math.round((pos.y / this.currentScreen.h ) * 1000) / 1000),
				w : Math.min(1,Math.round((pos.w / this.currentScreen.w ) * 1000) / 1000),
				h : Math.min(1,Math.round((pos.h / this.currentScreen.h ) * 1000) / 1000)
			};
    	},

		logLine (line, screenID){
			this.screenHistory.push({screenID:screenID, line:line});
		},

		logSessionStart (screenID){
			this.log("SessionStart",screenID, null, null, {
				"device" : {
					"w" : this.screenPos.w,
					"h" : this.screenPos.h,
					"qr" : this.qr
				}
			});
		},

		log (type, screenID, widgetID, e, widgetEvent){
			this.logger.log(2,"log","enter > type:" + type+ " > sreen:" + screenID + " > widget:" + widgetID);

			topic.publish("MatcSimulatorEvent", type, screenID, widgetID);

			const event = this.createBaseEvent(type, screenID, widgetID);

			const mouse = this.getMouse(e,this.isFixedPosition(widgetID));
			event.x = mouse.x,
			event.y = mouse.y;

			if(widgetEvent){
				if(widgetEvent.type || widgetEvent.value){
					event.state ={
						type : widgetEvent.type,
						value : widgetEvent.value,
					};

					if (widgetEvent.hidden) {
						event.hidden = true
					}

					if(widgetEvent.children){
						event.state.children = widgetEvent.children;
					}

					if(widgetEvent.options){
						event.state.options = widgetEvent.options;
					}

				}

				if(widgetEvent.device){
					event.device =  widgetEvent.device;
				}

				if(widgetEvent.gesture){
					event.gesture = widgetEvent.gesture;
				}


				if(widgetEvent.noheat){
					event.noheat = widgetEvent.noheat;
				}

				if(widgetEvent.time){
					event.time = widgetEvent.time;
				}

				if(widgetEvent.animation){
					event.animation = widgetEvent.animation;
				}

				if(widgetEvent.overlay){
					event.overlay = widgetEvent.overlay;
				}
			}

			if(this.currentOverlay && !event.overlay){
				event.overlay = this.currentOverlay.id;
			}

			if(this.logData){
				this.sendEvent(event);
			} else {
				if (type!="Animation" && type!="MouseOut" && type!="MouseOver"){
					//console.debug("log() > NOT SAVED >> " , type, " > s:" , screenID, " > w:", widgetID, " > state:", event.state, " > anim:", event.animation, " > overlay:", event.overlay);
				}
			}

			this.emit("event", event);
		},


		logShowOverlay (overlay){
			this.log("OverlayLoaded", this.currentScreen.id, null, null, {overlay : overlay.id});
		},

		logHideOverlay (overlay){
			this.log("OverlayRemoved", this.currentScreen.id, null, null, {overlay : overlay.id});
		},

		isFixedPosition (widgetID){
			const widget = this.model.widgets[widgetID];
			if(widget && widget.style.fixed){
				return true;
			}
			return false;
		},

		isFixedOverlay (){
			if(this.currentOverlay && this.currentOverlay.style.fixed){
				return true;
			}
			return false;
		},

		/**********************************************************
		 * Helper
		 **********************************************************/

		createBaseEvent (type, screenID, widgetID){
			const user = this.getUser();
			const session = this.getSession();
			const event = {
				session : session,
				user : user,
				screen : screenID,
				widget : widgetID,
				type : type,
				time : new Date().getTime(),
				scrollTop : this.currentScrollTopRelative
			};
			return event;
		},

		async sendEvent (event){
			this.eventCount++;
			if (this.eventCount > this.maxEventCount) {
				console.warn('sendMouse() Too many events')
				//return;
			}
			/**
			 * depending on the mode, we have to use different REST end points :-(
			 */
			if(this.qr || this.hash){
				const res = await Services.getModelService().saveEvent(this.model.id, this.hash, event)
				this.onSaved(res)
			}
			event = false

			/**
			 * we force to send the mouse!!
			 */
			this.sendMouse();
		},

		onSaved (){
			this.logger.log(2,"onSaved","enter");
		}
    }
}
</script>