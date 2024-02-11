<template>
  <div>
  </div>
</template>
<script>
import Css3Animation from 'core/Css3Animation'
import lang from 'dojo/_base/lang'

export default {
	name: 'RestMixin',
    methods: {
		onAnimation (screenID, widgetID, e){
			this.logger.log(2,"onAnimation","enter >  sreen:" + screenID + " > widget:" + widgetID + " > taget : " + e.id);

			if(this._animations[e.id]){
				this._animations[e.id].stop();
			}

			if (this.isDestroyed) {
				return;
			}

			const anim = this.renderFactory.createWidgetAnimation(e);
			if(anim){
				anim.run()
				this.log("Animation",screenID, widgetID, null, {animation : anim.event});
				anim.onEnd(lang.hitch(this, "onAnimationEnded", e.id));
				this._animations[e.id]  = anim;
			}
		},

		onAnimationEnded (widgetID){
			delete this._animations[widgetID];
		},


		/**********************************************************
		 * Screen Animation!
		 **********************************************************/

		/**
		 * We create here a animation object like it would be in the model,
		 * and the call the default runScreenAnimation;
		 */
		createScreenTransformAnimation: function(screen, line){
			// FIXME: Merge with exiting one!
			var animations = {widgets : {}, groups:{}};
			var duration = 250;
			if (line.duration){
				duration = line.duration;
			}
			// var group = {};
			/**
			 * Keep somehow in sync with the AnimationComposer.js
			 */
			var from = this.currentScreen;
			var widgets = this.sortChildren(screen.children);
			for(var i=0; i< widgets.length; i++){
				var widget = widgets[i];
				if(!animations.widgets[widget.id]){
					var animation = {duration:duration, delay:0, type: null, easing:line.easing};
					if(this.widgetIsCopyOfOtherScreen(widget, screen.id, from)){
						animation.type = "transformFromParent";
						animations.widgets[widget.id] = animation;
					}
				}

			}
			return animations;
		},


		widgetIsCopyOfOtherScreen (widget, screenID, from){
			if (from){
				var children = from.children;
				for(var i=0; i< children.length; i++){
					var fromWidget = this.model.widgets[children[i]];
					if (fromWidget.name === widget.name) {
						widget.animFrom = fromWidget.id;
						return true;
					}
				}
			}
			return false;
		},


		runOnLoadedScreenAnimation (screenID,line, endCallback){
			this.logger.log(1,"runOnLoadedScreenAnimation","enter >  sreen:" + screenID);
			if (this.doNotRunOnLoadAnimation || this.isDestroyed){
				this.logger.log(1,"runOnLoadedScreenAnimation","exit because do not run!");
				return;
			}
			var screen = this.model.screens[screenID];

			if(screen){
				var anim = this.getScreenAnimation(screen, "ScreenLoaded");
				if (screen._transAnim) {
					/**
					 * If there is an amim, we merge in the transtion stuff, unless
					 * there is already something defined in the animation composer
					 */
					if(anim){
						var widgetTranAnims = screen._transAnim.widgets;
						for (var id in widgetTranAnims){
							if (!anim.widgets[id]){
								anim.widgets[id] = widgetTranAnims[id]
							}
						}

					} else {
						/**
						 * If no anim, but and transition anim,
						 * we take the transition!
						 */
						anim = screen._transAnim;
					}
					delete screen._transAnim;
				}
				if(anim){
					this.runScreenAnimation(screenID, anim, "ScreenLoaded", endCallback);
				}
			}
		},


		runScreenAnimation (screenID, animation, triggerType, endCallBack, progressCallback){
			this.logger.log(1,"runScreenAnimation","enter >  sreen:" + screenID);

			if (this.isDestroyed) {
				console.warn('Simulator.runScreenAnimation() > Destroyed')
				return;
			}
			var animFactory = new Css3Animation();
			var anims2Run = [];


			var widgets = lang.clone(animation.widgets);

			/**
			 * Here we create a copy of the group animations
			 * for every child.
			 *
			 * To make slides work, we also calculate the offsets,
			 * which will be in the Animation factory method used
			 * to correct the *from* position, so the proportions stay the
			 * same during the animation.
			 */
			var groups = animation.groups;
			if(this.model.groups){
				for(var groupID in groups){
					var groupAnim = groups[groupID];
					var group = this.model.groups[groupID];
					if(group && group.children) {

						/**
						 * We can define animations only on top level groups!
						 */
						var children = this.getAllGroupChildren(group);

						var bbox = this.getGroupBoundingBox(group.children);

						for(var i =0; i< children.length; i++){
							var widgetID = children[i];
							var modelWidget = this.model.widgets[widgetID];
							// avoid double animation
							if (!widgets[widgetID]){
								var widgetAnim = lang.clone(groupAnim);
								widgetAnim.offSet = {
									left: modelWidget.x - bbox.x,
									top : modelWidget.y - bbox.y,
									right : (modelWidget.x + modelWidget.w) - (bbox.x + bbox.w),
									bottom : (modelWidget.y + modelWidget.h) - (bbox.y + bbox.h)
								}
								widgets[widgetID] = widgetAnim;

							} else {
								console.warn("runScreenAnimation > Group cannot overwrite widget animation for " + widgetID);
							}

						}
					} else {
						// FIXME: this can happen if the group was deleted
						// We should clean up the animations on widget delete or group delete...
						console.warn("runScreenAnimation() > No Group with id", groupID)
					}
				}
			}


			for(let widgetID in widgets){
				var widgetAnimation = widgets[widgetID];

				/**
				 * Check if we have an factory method
				 */
				if(animFactory["createAnimationEvent_" + widgetAnimation.type]){
					let animationEvent = animFactory["createAnimationEvent_" + widgetAnimation.type](widgetID, widgetAnimation, this.model, this.lastScreen);
					if(animationEvent){
						/**
						 * Like this.renderFactory.createWidgetAnimation(e)
						 */
						var widget = this.renderFactory.getAnimationWrapper(widgetID);
						if(widget){
							let anim = animFactory.createWidgetAnimation(widget, animationEvent);
							/**
							 * Save to run later.
							 */
							if(anim){
								anims2Run.push(anim);
							}
						} else {
							console.warn("runScreenAnimation > Not widget for " + widgetID);
						}
					}
				} else {
					console.warn("runScreenAnimation > Not supported type " + widgetAnimation.type);
				}
			}

			/**
			 * Start the animations only after and have a closure to check
			 * if everything is done. Only then invoke callback
			 */
			var total = anims2Run.length;
			var done = 0;
			var me = this;
			var checkAllDone = function(){
				done++;
				if(total == done){
					me.cleanUpAnimations();
					if(endCallBack){
						endCallBack();
					}
				}
			};

			/**
			 * No run the animations...
			 */
			for(let i=0; i < anims2Run.length; i++){
				let anim = anims2Run[i];
				let widgetID = anim.event.id;
				anim.onEnd(checkAllDone);
				if (progressCallback) {
					anim.onStep(progressCallback);
				}
				anim.run();
				this.logAnimationEvent(screenID, widgetID, anim, triggerType);
			}
			if(total ==0){
				if(endCallBack){
					endCallBack();
				}
			}
			this._widgetAnimations = anims2Run;
		},

		cleanUpAnimations (){
			if(this._widgetAnimations){
				for(var i=0; i < this._widgetAnimations.length; i++){
					//this._widgetAnimations[i].stop();
				}
			}
			delete this._widgetAnimations;
		},

        cleanUpGestureScreenAnim (){
			if(this._screenGestureMoveListener){
				this._screenGestureMoveListener.remove();
				delete this._screenGestureMoveListener;
			}
			if(this._screenGestureMoveListener2){
				this._screenGestureMoveListener2.remove();
				delete this._screenGestureMoveListener2;
			}
			if(this._gesturePressListener){
				this._gesturePressListener.remove();
				delete this._gesturePressListener;
			}

			delete this._screenGestureType;
			delete this._screenGestureLine;
			delete this._screenGestureStartScreenID;
			delete this._screenGestureAnim;
		}
    }
}
</script>