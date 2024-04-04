import lang from 'dojo/_base/lang'
import Color from 'dojo/_base/Color'
import Core from 'core/Core'

export default class Animation extends Core{

	constructor() {
		super()

		this._inverse = {
			"slideLeft": "slideRight",
			"slideRight": "slideLeft",
			"slideUp": "slideDown",
			"slideDown": "slideUp",
			"fadeIn": "fadeOut",
			"fadeOut": "fadeInt",
			"rotateInTopLeft": "rotateOutTopLeft",
			"zoomIn": "zoomInInverse",
			"slideLeftUp": "slideLeftUpInverse",
			"slideLeftDown": "slideLeftDownInverse",
			"slideRightDown": "slideRightDownInverse",
			"slideRightUp": "slideRightUpInverse"
		}

		this._inverseEasing = {
			"easeElasticIn": "easeElasticOut",
			"easeElasticOut": "easeElasticIn",
			"easeBounceIn": "easeBounceOut",
			"easeBounceOut": "easeBounceIn"
		}

		this._colorAttribs = {
			"color": true,
			"background": true,
			"borderTopColor": true,
			"borderBottomColor": true,
			"borderRightColor": true,
			"borderLeftColor": true,
			"caretBackground": true,
			"caretColor": true,		
			"barColor": true,
			"handleColor": true,
			"handleBorderColor": true,
			"borderColorButton": true,
			"colorForeGround": true,
			"colorButton": true,
			"selectedBackground": true,
			"selectedColor": true,
			"tableHeaderColor": true,
			"tableHeaderBackground": true,
			"weekdayBackground": true,
			"weekendBackground": true,
			"weekdayColor": true,
			"weekendColor": true,
			"headerBackground": true,
			"headerColor": true,
			"headerBorderColor": true,
			"labelColor": true
		}

		this._txtAttribs = {
			"textAlign": true,
			"fontStyle": true,
			"fontFamily": true,
			"borderTopStyle": true,
			"borderBottomStyle": true,
			"borderRightStyle": true,
			"borderLeftStyle": true,
			"textDecoration": true,
			"fontWeight": true,
			"backgroundImage": true,
			"verticalAlign": true,
			"labelFontWeight": true,
			"popupBackground": true,
			"popupBorderColor": true,
			"popupColor": true
		}

		this._shadowAttribs = {
			"boxShadow": true,
			"testShadow": true,
			"popupShadow": true
		}

		this._defaultAnimValues = {
			"opacity": 1,
			"lineHeight": 1,
			"letterSpacing": 1,
			"textDecoration": "none",
			"fontStyle": "normal",
			"fontWeight": "400"
		}
	}

	getInverseAnimation(type) {
		if (this._inverse[type]) {
			return this._inverse[type];
		}
		return null;
	}

	getInverseEasing(type) {
		if (this._inverseEasing[type]) {
			return this._inverseEasing[type];
		}
		return type;
	}


	getAnimationMixedStyle(fromStyle, toStyle, p) {
		var mixedStyle = {};

		/**
		 * FIXME: we have to use both key sets here
		 */
		for (var key in toStyle) {
			var from = fromStyle[key];
			var to = toStyle[key];

			if (this._shadowAttribs[key]) {

				if (!from && to) {
					from = {
						b: 0,
						c: to.c,
						h: 0,
						s: 0,
						v: 0,
						i: to.i
					}
				}

				if (!to && from) {
					to = {
						b: 0,
						c: from.c,
						h: 0,
						s: 0,
						v: 0,
						i: from.i
					}
				}

				if (to && from) {
					var mixedShadow = {
						b: from.b - ((from.b - to.b) * p),
						h: from.h - ((from.h - to.h) * p),
						v: from.v - ((from.v - to.v) * p),
						s: from.s - ((from.s - to.s) * p),
						c: Color.blendColors(new Color(from.c), new Color(to.c), p),
						i: to.i
					};

					mixedStyle[key] = mixedShadow;
				} else {
					console.warn("getAnimationMixedStyle() > No values for " + key)
				}

			} else if (this._colorAttribs[key]) {
				if (from && to && to != "transparent") {
					/**
					 * FIXME: We could cache hre the colors...
					 */
					var c = Color.blendColors(new Color(from), new Color(to), p);
					if (c.a < 1) {
						mixedStyle[key] = c.toCss(true);
					} else {
						mixedStyle[key] = c.toHex();
					}

				} else {
					mixedStyle[key] = to;
				}


			} else if (this._txtAttribs[key]) {

				if (!to && this._defaultAnimValues[key]) {
					to = this._defaultAnimValues[key];
				}
				mixedStyle[key] = to;

			} else if ("backgroundPosition" == key) {

				var mixedPos = {
					top: from.top - ((from.top - to.top) * p),
					left: from.left - ((from.left - to.left) * p)
				}

				mixedStyle[key] = mixedPos;
			} else if ('filter' == key) {
				mixedStyle[key] = this.getMixedFilter(from, to, p);
			} else {

				if (isNaN(from)) {
					if (this._defaultAnimValues[key]) {
						from = this._defaultAnimValues[key];
					} else {
						from = 0;
					}
				}

				var dif = from - to;
				mixedStyle[key] = from - dif * p;
			}
		}
		return mixedStyle;
	}

	getMixedFilter (from, to, p) {
		/**
		 * we expect from and to!
		*/
		if (to && from) {
			var mixedFitler = {
				blur: from.blur - ((from.blur - to.blur) * p),
				grayscale: from.grayscale - ((from.grayscale - to.grayscale) * p),
				hueRotate: from.hueRotate - ((from.hueRotate - to.hueRotate) * p),
				opacity: from.opacity - ((from.opacity - to.opacity) * p),
				contrast: from.contrast - ((from.contrast - to.contrast) * p),
				saturate: from.saturate - ((from.saturate - to.saturate) * p),
				brightness: from.brightness - ((from.brightness - to.brightness) * p)
			};
			return mixedFitler;
		}
	}


	/**
	 * Retuns the mixed animation pos.
	 *
	 * X and Y are the relative changes to the model location
	 *
	 * W & H are the relative changes to the model location
	 *
	 * Keep in sync with Player.initWidgetAnimationPos();
	 */
	getAnimationMixedPos(fromPos, toPos, p) {
		var f = (1 - p);
		var mixed = {
			x: (fromPos.x - toPos.x) * f,
			y: (fromPos.y - toPos.y) * f,
			w: (fromPos.w - toPos.w) * f,
			h: (fromPos.h - toPos.h) * f
		};
		return mixed;
	}


	/**********************************************************
	 * Widget Animation
	 **********************************************************/


	createWidgetAnimation(widget, event) {

		var anim = this.createAnimation();
		anim.duration = event.duration;
		anim.delay = event.delay;
		anim.event = event;
		if (event.easing) {
			anim.setEasing(event.easing);
		}


		var fromStyle = event.from.style;
		var fromPos = event.from.pos;
		var toStyle = event.to.style;
		var toPos = event.to.pos;


		var me = this;
		anim.onRender(p => {
			if (widget) {
				try {
					if (toStyle) {
						var mixedStyle = me.getAnimationMixedStyle(fromStyle, toStyle, p);
						widget.setAnimatedStyle(mixedStyle);
					}

					if (toPos && fromPos) {
						var mixedPos = me.getAnimationMixedPos(fromPos, toPos, p);
						widget.setAnimatedPos(mixedPos, mixedStyle);
					}

				} catch (e) {
					console.error("WidgetAnimation.render() >  ", e);
					console.error("WidgetAnimation.render() >  ", e.stack);
				}
			}
		})

		return anim;

	}


	createAnimationEvent_transformFromParent(widgetID, anim, model, lastScreen) {

		/**
		 * Create BaseEvent
		 */
		var event = this._createAnimationBaseEvent(widgetID, anim);

		var newWidget = model.widgets[widgetID];
		if (newWidget) {
			/**
			 * animFrom has priority!
			 */
			var oldWidget = model.widgets[newWidget.animFrom];
			if (!oldWidget) {
				let widget =  model.widgets[widgetID];
				if (lastScreen && widget) {
					oldWidget = this.getCopyOfLastScreen(model, widget, lastScreen)
				} else {
					console.warn("createAnimationEvent_transformFromParent() > No lastScreen");
				}
			}
			if (oldWidget) {
				/**
				 * 1st check if we have to update the position
				 */
				var newPos = this.getWidgetPostionInScreen(newWidget, model);
				var oldPos = this.getWidgetPostionInScreen(oldWidget, model);
				if (newPos.x != oldPos.x || newPos.y != oldPos.y || newPos.w != oldPos.w || newPos.h != oldPos.h) {
					event.from.pos = oldPos;
					event.to.pos = newPos;
				}

				/**
				 * 2nd check if we have to update style
				 */
				if (!this.objectEquals(newWidget.style, oldWidget.style)) {
					event.from.style = oldWidget.style;
					event.to.style = newWidget.style;
				}

				return event;
			} else {
				console.warn("createAnimationEvent_transformFromParent() > Old widget does not exits", newWidget);
			}
		}
	}

	getCopyOfLastScreen (model, widget, lastScreen){
		var children = lastScreen.children;
		for(var i=0; i< children.length; i++){
			var fromWidget = model.widgets[children[i]];
			if (fromWidget.name === widget.name) {
				return fromWidget
			}
		}
	}

	createAnimationEvent_fadeIn(widgetID, anim) {

		/**
		 * Create BaseEvent
		 */
		var event = this._createAnimationBaseEvent(widgetID, anim);
		event.to.style = {
			opacity: 1
		}
		event.from.style = {
			opacity: 0
		}
		return event;
	}

	createAnimationEvent_slideLeft(widgetID, anim, model) {

		/**
		 * Create BaseEvent
		 */
		var event = this._createAnimationBaseEvent(widgetID, anim);
		var widget = model.widgets[widgetID];
		if (widget) {
			var pos = this.getWidgetPostionInScreen(widget, model);
			var screen = this.getParentScreen(widget, model);
			if (screen) {
				event.to.pos = {
					x: pos.x,
					y: pos.y,
					w: pos.w,
					h: pos.h
				};
				event.from.pos = {
					x: screen.w + pos.w,
					y: pos.y,
					w: pos.w,
					h: pos.h
				}


				if (anim.offSet) {
					event.from.pos.x += anim.offSet.left;
				}
			}
		}
		return event;
	}

	createAnimationEvent_slideRight(widgetID, anim, model) {

		/**
		 * Create BaseEvent
		 */
		var event = this._createAnimationBaseEvent(widgetID, anim);
		var widget = model.widgets[widgetID];
		if (widget) {
			var pos = this.getWidgetPostionInScreen(widget, model);
			event.to.pos = {
				x: pos.x,
				y: pos.y,
				w: pos.w,
				h: pos.h
			};
			event.from.pos = {
				x: 0 - pos.w,
				y: pos.y,
				w: pos.w,
				h: pos.h
			}


			if (anim.offSet) {
				event.from.pos.x += anim.offSet.right;
			}


		}
		return event;
	}


	createAnimationEvent_rotate(widgetID, anim) {

		/**
		 * Create BaseEvent
		 */
		var event = this._createAnimationBaseEvent(widgetID, anim);

		event.to.style = {
			rotate: anim.rotate
		};

		event.from.style = {
			rotate: 0
		};

		return event;
	}

	createAnimationEvent_zoomIn(widgetID, anim, model) {

		/**
		 * Create BaseEvent
		 */
		var event = this._createAnimationBaseEvent(widgetID, anim);
		var widget = model.widgets[widgetID];
		if (widget) {
			var pos = this.getWidgetPostionInScreen(widget, model);
			event.to.pos = {
				x: pos.x,
				y: pos.y,
				w: pos.w,
				h: pos.h
			};
			event.from.pos = {
				x: pos.x + pos.w / 2,
				y: pos.y + pos.h / 2,
				w: 0,
				h: 0,
				c: true
			}

		}
		return event;
	}

	createAnimationEvent_zoomOut(widgetID, anim, model) {

		/**
		 * Create BaseEvent
		 */
		var event = this._createAnimationBaseEvent(widgetID, anim);
		var widget = model.widgets[widgetID];
		if (widget) {
			var pos = this.getWidgetPostionInScreen(widget, model);
			event.from.pos = {
				x: pos.x,
				y: pos.y,
				w: pos.w,
				h: pos.h
			};
			event.to.pos = {
				x: pos.x,
				y: pos.y,
				w: 0,
				h: 0,
			}

		}
		return event;
	}



	createAnimationEvent_slideUp(widgetID, anim, model) {

		/**
		 * Create BaseEvent
		 */
		var event = this._createAnimationBaseEvent(widgetID, anim);
		var widget = model.widgets[widgetID];
		if (widget) {
			var screen = this.getParentScreen(widget, model);
			if (screen) {
				var pos = this.getWidgetPostionInScreen(widget, model);
				event.to.pos = {
					x: pos.x,
					y: pos.y,
					w: pos.w,
					h: pos.h
				};
				event.from.pos = {
					x: pos.x,
					y: screen.h + pos.h,
					w: pos.w,
					h: pos.h
				}
			}

			if (anim.offSet) {
				event.from.pos.y += anim.offSet.top;
			}
		}
		return event;
	}




	createAnimationEvent_slideDown(widgetID, anim, model) {

		/**
		 * Create BaseEvent
		 */
		var event = this._createAnimationBaseEvent(widgetID, anim);
		var widget = model.widgets[widgetID];
		if (widget) {
			var pos = this.getWidgetPostionInScreen(widget, model);
			event.to.pos = {
				x: pos.x,
				y: pos.y,
				w: pos.w,
				h: pos.h
			};
			event.from.pos = {
				x: pos.x,
				y: 0 - pos.h,
				w: pos.w,
				h: pos.h
			}

			if (anim.offSet) {
				event.from.pos.y += anim.offSet.bottom;
			}
		}
		return event;
	}

	createAnimationEvent_growRight(widgetID, anim, model) {

		/**
		 * Create BaseEvent
		 */
		var event = this._createAnimationBaseEvent(widgetID, anim);
		var widget = model.widgets[widgetID];
		if (widget) {
			var screen = this.getParentScreen(widget, model);
			if (screen) {
				var pos = this.getWidgetPostionInScreen(widget, model);
				event.to.pos = {
					x: pos.x,
					y: pos.y,
					w: pos.w,
					h: pos.h
				};
				event.from.pos = {
					x: pos.x,
					y: pos.y,
					w: 0,
					h: pos.h
				}
			}

		}
		return event;
	}

	createAnimationEvent_growLeft(widgetID, anim, model) {

		/**
		 * Create BaseEvent
		 */
		var event = this._createAnimationBaseEvent(widgetID, anim);
		var widget = model.widgets[widgetID];
		if (widget) {
			var screen = this.getParentScreen(widget, model);
			if (screen) {
				var pos = this.getWidgetPostionInScreen(widget, model);
				event.to.pos = {
					x: pos.x,
					y: pos.y,
					w: pos.w,
					h: pos.h
				};
				event.from.pos = {
					x: pos.x + pos.w,
					y: pos.y,
					w: 0,
					h: pos.h
				}
			}

		}
		return event;
	}


	createAnimationEvent_growUp(widgetID, anim, model) {

		/**
		 * Create BaseEvent
		 */
		var event = this._createAnimationBaseEvent(widgetID, anim);
		var widget = model.widgets[widgetID];
		if (widget) {
			var screen = this.getParentScreen(widget, model);
			if (screen) {
				var pos = this.getWidgetPostionInScreen(widget, model);
				event.to.pos = {
					x: pos.x,
					y: pos.y,
					w: pos.w,
					h: pos.h
				};
				event.from.pos = {
					x: pos.x,
					y: pos.y + pos.h,
					w: pos.w,
					h: 0
				}
			}

		}
		return event;
	}

	createAnimationEvent_growDown(widgetID, anim, model) {

		/**
		 * Create BaseEvent
		 */
		var event = this._createAnimationBaseEvent(widgetID, anim);
		var widget = model.widgets[widgetID];
		if (widget) {
			var screen = this.getParentScreen(widget, model);
			if (screen) {
				var pos = this.getWidgetPostionInScreen(widget, model);
				event.to.pos = {
					x: pos.x,
					y: pos.y,
					w: pos.w,
					h: pos.h
				};
				event.from.pos = {
					x: pos.x,
					y: pos.y,
					w: pos.w,
					h: 0
				}
			}

		}
		return event;
	}

	createAnimationEvent_fadeOut(widgetID, anim) {

		/**
		 * Create BaseEvent
		 */
		var event = this._createAnimationBaseEvent(widgetID, anim);
		event.to.style = {
			opacity: 0
		}
		event.from.style = {
			opacity: 1
		}
		return event;
	}

	_createAnimationBaseEvent(widgetID, anim) {
		return {
			duration: anim.duration,
			delay: anim.delay,
			easing: anim.easing,
			from: {
				style: null,
				pos: null
			},
			to: {
				style: null,
				pos: null
			},
			id: widgetID
		};
	}



	/**********************************************************
	 * Screen Animation!
	 **********************************************************/




	createScreen_fadeIn(screen, oldScreen, newScreen, overlay) {

		/**
		 * put invisible
		 */
		if (newScreen) {
			newScreen.style.opacity = 0;
		} else if (oldScreen) {
			oldScreen.style.opacity = 0;
		}
		var anim = this.createScreenAnimation(oldScreen, newScreen);
		anim.duration = 250;
		if (!overlay) {
			anim.onFinish(lang.hitch(this, "removeScreen", oldScreen, newScreen));
		}

		anim.onRender(function (p) {
			if (newScreen) {
				newScreen.style.opacity = p;
			} else if (oldScreen) {
				oldScreen.style.opacity = p;
			}
		});

		return anim;
	}

	createScreen_fadeOut(screen, oldScreen, newScreen, overlay) {

		/**
		 * put invisible
		 */
		if (newScreen) {
			newScreen.style.opacity = 1;
		} else if (oldScreen) {
			oldScreen.style.opacity = 1;
		}

		var anim = this.createScreenAnimation(oldScreen, newScreen);
		anim.duration = 250;
		if (!overlay) {
			anim.onFinish(lang.hitch(this, "removeScreen", oldScreen, newScreen));
		}
		anim.onRender(function (p) {
			if (newScreen) {
				newScreen.style.opacity = 1 - p;
			} else if (oldScreen) {
				oldScreen.style.opacity = 1 - p;
			}
		});

		return anim;
	}


	createScreen_slideDown(screen, oldScreen, newScreen, overlay) {

		/**
		 * put new screen to left
		 */
		if (newScreen) {
			this._set_y(screen.h * -1, newScreen);
		}

		var me = this;

		var anim = this.createScreenAnimation(oldScreen, newScreen);
		anim.duration = 250;
		if (!overlay) {
			anim.onFinish(lang.hitch(this, "removeScreen", oldScreen, newScreen));
		}
		anim.onRender(function (p) {
			if (oldScreen) {
				me._set_y(Math.round(screen.h * (p)), oldScreen);
			}
			if (newScreen) {
				me._set_y(Math.round(screen.h * (1 - p)) * -1, newScreen);
			}
		});

		return anim;

	}


	createScreen_slideUp(screen, oldScreen, newScreen, overlay) {

		/**
		 * put new screen to left
		 */
		if (newScreen) {
			this._set_y(screen.h, newScreen);
		}

		var me = this;

		var anim = this.createScreenAnimation(oldScreen, newScreen);
		anim.duration = 250;
		if (!overlay) {
			anim.onFinish(lang.hitch(this, "removeScreen", oldScreen, newScreen));
		}
		anim.onRender(function (p) {
			if (oldScreen) {
				me._set_y(-1 * Math.round(screen.h * (p)), oldScreen);
			}
			if (newScreen) {
				me._set_y(Math.round(screen.h * (1 - p)), newScreen);
			}
		});

		return anim;

	}



	createScreen_slideLeft(screen, oldScreen, newScreen, overlay) {
		/**
		 * put new screen to left
		 */
		if (newScreen) {
			this._set_x(screen.w, newScreen);
		}

		var me = this;

		var anim = this.createScreenAnimation(oldScreen, newScreen);
		anim.duration = 100;
		if (!overlay) {
			anim.onFinish(lang.hitch(this, "removeScreen", oldScreen, newScreen));
		}
		anim.onRender(function (p) {
			if (oldScreen) {
				me._set_x(-1 * Math.round(screen.w * (p)), oldScreen);
			}
			if (newScreen) {
				me._set_x(Math.round(screen.w * (1 - p)), newScreen);
			}
		});

		return anim;

	}


	createScreen_slideRight(screen, oldScreen, newScreen, overlay) {


		/**
		 * put new screen to right
		 */
		if (newScreen) {
			this._set_x(screen.w * -1, newScreen);
		}

		var me = this;

		var anim = this.createScreenAnimation(oldScreen, newScreen);
		anim.duration = 100;
		if (!overlay) {
			anim.onFinish(lang.hitch(this, "removeScreen", oldScreen, newScreen));
		}
		anim.onRender(function (p) {
			if (oldScreen) {
				me._set_x(Math.round(screen.w * (p)), oldScreen);
			}
			if (newScreen) {
				me._set_x(Math.round(screen.w * (1 - p)) * -1, newScreen);
			}
		});

		return anim;
	}


	createScreen_rotateInTopLeft(screen, oldScreen, newScreen, overlay) {


		/**
		 * put new screen to right
		 */
		var startDeg = -90;
		if (newScreen) {
			newScreen.style.transform = "rotate(" + startDeg + "deg)";
			newScreen.style.webkitTransform = "rotate(" + startDeg + "deg)";
			newScreen.style.transformOrigin = "0 0";
			newScreen.style.webkitTransformOrigin = "0 0";
		}
		var anim = this.createScreenAnimation(oldScreen, newScreen);
		anim.duration = 100;
		if (!overlay) {
			anim.onFinish(lang.hitch(this, "removeScreen", oldScreen, newScreen));
		}
		anim.onRender(function (p) {
			if (newScreen) {
				var d = startDeg * (1 - p);
				var trans = "rotate(" + d + "deg)";
				newScreen.style.transform = trans;
				newScreen.style.webkitTransform = trans;
			}
		});

		return anim;
	}

	createScreen_rotateOutTopLeft(screen, oldScreen, newScreen, overlay) {

		/**
		 * put new screen to right
		 */
		var startDeg = -90;
		if (oldScreen) {
			oldScreen.style.transform = "rotate(" + 0 + "deg)";
			oldScreen.style.webkitTransform = "rotate(" + 0 + "deg)";
			oldScreen.style.transformOrigin = "0 0";
			oldScreen.style.webkitTransformOrigin = "0 0";
		}
		var anim = this.createScreenAnimation(oldScreen, newScreen);
		anim.duration = 100;
		if (!overlay) {
			anim.onFinish(lang.hitch(this, "removeScreen", oldScreen, newScreen));
		}
		anim.onRender(function (p) {
			if (oldScreen) {
				var d = startDeg * (p);
				var trans = "rotate(" + d + "deg)";
				oldScreen.style.transform = trans;
				oldScreen.style.webkitTransform = trans;
			}
		});

		return anim;
	}


	createScreen_zoomIn(screen, oldScreen, newScreen, overlay) {

		/**
		 * put new screen to right
		 */
		var startValue = 0.0;
		if (newScreen) {
			newScreen.style.transform = "scale(" + startValue + ")";
			newScreen.style.webkitTransform = "scale(" + startValue + ")";
			newScreen.style.transformOrigin = "50% 50%";
			newScreen.style.webkitTransformOrigin = "50% 50%";
		}

		var anim = this.createScreenAnimation(oldScreen, newScreen);
		anim.duration = 100;
		if (!overlay) {
			anim.onFinish(lang.hitch(this, "removeScreen", oldScreen, newScreen));
		}
		anim.onRender(function (p) {
			if (newScreen) {
				var d = p;
				var trans = "scale(" + d + ")";

				newScreen.style.transform = trans;
				newScreen.style.webkitTransform = trans;
			}
		});

		return anim;
	}

	createScreen_zoomInInverse(screen, oldScreen, newScreen, overlay) {
		var anim = this.createScreenAnimation(oldScreen, newScreen);
		anim.duration = 100;
		if (!overlay) {
			anim.onFinish(lang.hitch(this, "removeScreen", oldScreen, newScreen));
		}
		anim.onRender(function (p) {
			if (oldScreen) {
				var d = (1 - p);
				var trans = "scale(" + d + ")";
				oldScreen.style.transform = trans;
				oldScreen.style.webkitTransform = trans;
			}
		});

		return anim;
	}


	createScreen_slideLeftDown(screen, oldScreen, newScreen, overlay) {
		// var startValue = 0.0;
		if (newScreen) {
			var trans = "translate(" + screen.w + "px, " + -1 * screen.h + "px)";
			newScreen.style.transform = trans;
			newScreen.style.webkitTransform = trans;
		}

		var anim = this.createScreenAnimation(oldScreen, newScreen);
		anim.duration = 100;
		if (!overlay) {
			anim.onFinish(lang.hitch(this, "removeScreen", oldScreen, newScreen));
		}
		anim.onRender(function (p) {
			if (newScreen) {
				var d = (1 - p);
				var trans = "translate(" + Math.round(d * screen.w) + "px, " + Math.round(-1 * d * screen.h) + "px)";
				newScreen.style.transform = trans;
				newScreen.style.webkitTransform = trans;
			}
		});

		return anim;
	}

	createScreen_slideLeftDownInverse(screen, oldScreen, newScreen, overlay) {
		var anim = this.createScreenAnimation(oldScreen, newScreen);
		anim.duration = 100;
		if (!overlay) {
			anim.onFinish(lang.hitch(this, "removeScreen", oldScreen, newScreen));
		}
		anim.onRender(function (p) {
			if (oldScreen) {
				var d = (p);
				var trans = "translate(" + Math.round(d * screen.w) + "px, " + Math.round(-1 * d * screen.h) + "px)";
				oldScreen.style.transform = trans;
				oldScreen.style.webkitTransform = trans;
			}
		});
		return anim;
	}



	createScreen_slideLeftUp(screen, oldScreen, newScreen, overlay) {

		if (newScreen) {
			var trans = "translate(" + screen.w + "px, " + screen.h + "px)";
			newScreen.style.transform = trans;
			newScreen.style.webkitTransform = trans;
		}

		var anim = this.createScreenAnimation(oldScreen, newScreen);
		anim.duration = 100;
		if (!overlay) {
			anim.onFinish(lang.hitch(this, "removeScreen", oldScreen, newScreen));
		}
		anim.onRender(function (p) {
			if (newScreen) {
				var d = (1 - p);
				var trans = "translate(" + Math.round(d * screen.w) + "px, " + Math.round(d * screen.h) + "px)"
				newScreen.style.transform = trans;
				newScreen.style.webkitTransform = trans;
			}
		});

		return anim;
	}

	createScreen_slideLeftUpInverse(screen, oldScreen, newScreen, overlay) {
		var anim = this.createScreenAnimation(oldScreen, newScreen);
		anim.duration = 100;
		if (!overlay) {
			anim.onFinish(lang.hitch(this, "removeScreen", oldScreen, newScreen));
		}
		anim.onRender(function (p) {
			if (oldScreen) {
				var d = (p);
				var trans = "translate(" + Math.round(d * screen.w) + "px, " + Math.round(d * screen.h) + "px)"
				oldScreen.style.transform = trans;
				oldScreen.style.webkitTransform = trans;
			}
		});
		return anim;
	}



	createScreen_slideRightUp(screen, oldScreen, newScreen, overlay) {

		if (newScreen) {
			var trans = "translate(" + -1 * screen.w + "px, " + screen.h + "px)";
			newScreen.style.transform = trans;
			newScreen.style.webkitTransform = trans;
		}

		var anim = this.createScreenAnimation(oldScreen, newScreen);
		anim.duration = 100;
		if (!overlay) {
			anim.onFinish(lang.hitch(this, "removeScreen", oldScreen, newScreen));
		}
		anim.onRender(function (p) {
			if (newScreen) {
				var d = (1 - p);
				var trans = "translate(" + Math.round(-1 * d * screen.w) + "px, " + Math.round(d * screen.h) + "px)";
				newScreen.style.transform = trans;
				newScreen.style.webkitTransform = trans;
			}
		});

		return anim;
	}

	createScreen_slideRightUpInverse(screen, oldScreen, newScreen, overlay) {

		var anim = this.createScreenAnimation(oldScreen, newScreen);
		anim.duration = 100;
		if (!overlay) {
			anim.onFinish(lang.hitch(this, "removeScreen", oldScreen, newScreen));
		}
		anim.onRender(function (p) {
			if (oldScreen) {
				var d = (p);
				var trans = "translate(" + Math.round(-1 * d * screen.w) + "px, " + Math.round(d * screen.h) + "px)";
				oldScreen.style.transform = trans;
				oldScreen.style.webkitTransform = trans;
			}
		});

		return anim;
	}

	createScreen_slideRightDown(screen, oldScreen, newScreen, overlay) {

		if (newScreen) {
			var trans = "translate(" + -1 * screen.w + "px, " + -1 * screen.h + "px)";
			newScreen.style.transform = trans;
			newScreen.style.webkitTransform = trans;
		}

		var anim = this.createScreenAnimation(oldScreen, newScreen);
		anim.duration = 100;
		if (!overlay) {
			anim.onFinish(lang.hitch(this, "removeScreen", oldScreen, newScreen));
		}
		anim.onRender(function (p) {
			if (newScreen) {
				var d = (1 - p);
				var trans = "translate(" + Math.round(-1 * d * screen.w) + "px, " + Math.round(-1 * d * screen.h) + "px)";
				newScreen.style.transform = trans;
				newScreen.style.webkitTransform = trans;
			}
		});

		return anim;
	}


	createScreen_slideRightDownInverse(screen, oldScreen, newScreen, overlay) {

		var anim = this.createScreenAnimation(oldScreen, newScreen);
		anim.duration = 100;
		if (!overlay) {
			anim.onFinish(lang.hitch(this, "removeScreen", oldScreen, newScreen));
		}
		anim.onRender(function (p) {
			if (oldScreen) {
				var d = (p);
				var trans = "translate(" + Math.round(-1 * d * screen.w) + "px, " + Math.round(-1 * d * screen.h) + "px)";
				oldScreen.style.transform = trans;
				oldScreen.style.webkitTransform = trans;
			}
		});

		return anim;
	}





	createScreenAnimation(a, b) {
		return this.createAnimation(a, b);
	}

	/**
	 * Create base animation object. An animation has
	 * the following live cicle:
	 *
	 * 1) startTime is set
	 *
	 * 2) run() can optional be called called. If no startTime is set, the current time is used. Run call requestAnimationFrame()
	 * unil the duration is finished. Run is for the simulator basically.
	 *
	 * 3) time() is called, weather by code or run(). The method calculates the percentage of the
	 * animation and calls the renderCalback.
	 *
	 * 4) if time > duration we call stop...
	 *
	 */
	createAnimation() {
		// FIXME: Move to own class
		return {

			startTime: 0,

			duration: this.defaultAnimationDuration,

			delay: 0,

			endTime: -1,

			easing: function (t) {
				return t * (2 - t)
			}, // easeOutQuad

			finished: false,

			setStart: function (t) {
				this.startTime = t;
			},

			setModel: function (m) {
				this.model = m;
			},

			setDuration: function (t) {
				this.duration = t;
			},

			setDelay: function (d) {
				/**
				 * In the old API the value might be null!
				 */
				if (d) {
					this.delay = d;

				}
			},

			setEasing: function (name) {

				switch (name) {
					case "linear":
						this.easing = function (t) {
							return t
						};
						break;

					case "easeInQuad":
						this.easing = function (t) {
							return t * t
						};
						break;

					case "easeOutQuad":
						this.easing = function (t) {
							return t * (2 - t)
						};
						break;

					case "easeInOutQuad":
						this.easing = function (t) {
							return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t
						};
						break;

					case "easeElasticIn":
						{
							let tau = 2 * Math.PI;
							let a = 1;
							let p = 0.3;
							let s = Math.asin(1 / (a = Math.max(1, a))) * (p /= tau);
							this.easing = function (t) {
								return a * Math.pow(2, 10 * --t) * Math.sin((s - t) / p)
							};
							break;
						}

					case "easeElasticOut":
						{
							let tau = 2 * Math.PI;
							let a = 1;
							let p = 0.3;

							let s = Math.asin(1 / (a = Math.max(1, a))) * (p /= tau);
							this.easing = function (t) {
								return 1 - a * Math.pow(2, -10 * (t = +t)) * Math.sin((t + s) / p);
							};
							break;
						}

					case "easeBounceIn":
						{
							let b1 = 4 / 11,
								b2 = 6 / 11,
								b3 = 8 / 11,
								b4 = 3 / 4,
								b5 = 9 / 11,
								b6 = 10 / 11,
								b7 = 15 / 16,
								b8 = 21 / 22,
								b9 = 63 / 64,
								b0 = 1 / b1 / b1;
							var bounceOut = function (t) {
								return (t = +t) < b1 ? b0 * t * t : t < b3 ? b0 * (t -= b2) * t + b4 : t < b6 ? b0 * (t -= b5) * t + b7 : b0 * (t -= b8) * t + b9;
							}
							this.easing = function (t) {
								return 1 - bounceOut(1 - t);
							};
							break;
						}

					case "easeBounceOut":
						{
							let b1 = 4 / 11,
								b2 = 6 / 11,
								b3 = 8 / 11,
								b4 = 3 / 4,
								b5 = 9 / 11,
								b6 = 10 / 11,
								b7 = 15 / 16,
								b8 = 21 / 22,
								b9 = 63 / 64,
								b0 = 1 / b1 / b1;
							this.easing = function (t) {
								return (t = +t) < b1 ? b0 * t * t : t < b3 ? b0 * (t -= b2) * t + b4 : t < b6 ? b0 * (t -= b5) * t + b7 : b0 * (t -= b8) * t + b9;
							};
							break;
						}

					default:
						console.warn("setEasing() > Not implemented", name);
						break;
				}

			},

			onFinish(fct) {
				this.finishCallback = fct;
			},

			stop() {
				this.finished = true;
			},

			onEnd(fct) {
				this.endCallback = fct;
			},

			onStep(fct) {
				this.stepCallback = fct;
			},

			onRender(fct) {
				this.renderCallback = fct;
			},

			/**
			 * can be called to indicate delayed execution
			 */
			isDelayed() {
				if (this.renderCallback) {
					this.renderCallback(0)
				}
			},

			setP(p) {

				this.lastP = p;
				if (this.easing) {
					p = this.easing(p);
				}
				if (this.renderCallback) {
					this.renderCallback(p)
				}
			},

			cont() {
				var now = new Date().getTime();
				this.startTime = now - Math.round(this.duration * (this.lastP));
				this.run();
			},


			getP(t, delay, duration) {
				var p = 0;
				if (t > delay) {
					p = Math.min(1, (t - delay) / duration);
				}
				if (this.easing) {
					p = this.easing(p);
				}
				return Math.min(1, p);
			},

			time(now) {

				var t = Math.max(0, now - this.startTime);
				var p = this.getP(t, this.delay, this.duration);

				if (this.renderCallback) {
					this.renderCallback(p)
				}


				/**
				 * ok we are done. No clean up and call the end callback. we just cal this once
				 *
				 * FIXME: Shouldn't the thing stop only when the time is
				 *
				 * t >= this.duration + this.delay
				 *
				 * Otherwise an easing function might once output one and we are fucked
				 */
				if (p == 1 && !this.finished) {

					if (this.endCallback) {
						this.endCallback();
					}

					if (this.finishCallback) {
						this.finishCallback();
					}
					this.finished = true;
				}
			},


			run() {

				if (this.duration > 0) {
					if (!this.startTime) {
						this.startTime = new Date().getTime();
					}
					var now = new Date().getTime();
					var t = now - this.startTime;

					if (this.stepCallback) {
						this.stepCallback(t)
					}

					if (t < this.duration + this.delay && !this.finished) {
						var callback = lang.hitch(this, "run");
						requestAnimationFrame(callback);
					}
					this.time(now);
				} else {
					if (this.renderCallback) {
						this.renderCallback(1)
					}
					if (this.endCallback) {
						this.endCallback();
					}

					if (this.finishCallback) {
						this.finishCallback();
					}
					this.finished = true;
				}

			}
		};

	}



	/***************************************************************************
	 *Helper
	 ***************************************************************************/

	removeScreen(oldScreen, newScreen) {
		newScreen.style.transform = "";
		newScreen.style.webkitTransform = "";
		newScreen.style.transformOrigin = "";
		newScreen.style.webkitTransformOrigin = "";
		var parent = oldScreen.parentNode;
		if (parent) {
			parent.removeChild(oldScreen);
		} else {
			//console.warn("removeScreen(), No parent for", oldScreen);
		}
	}

	_set_x(x, node) {
		var trans = "translateX(" + x + "px)";
		node.style.transform = trans;
		node.style.webkitTransform = trans;
	}

	_set_y(y, node) {
		var trans = "translateY(" + y + "px)";
		node.style.transform = trans;
		node.style.webkitTransform = trans;
	}

	objectEquals(v1, v2) {

		if (typeof (v1) !== typeof (v2)) {
			return false;
		}

		if (typeof (v1) === "function") {
			return v1.toString() === v2.toString();
		}

		if (v1 instanceof Object && v2 instanceof Object) {
			if (this.countProps(v1) !== this.countProps(v2)) {
				return false;
			}
			var r = true;
			for (let k in v1) {
				r = this.objectEquals(v1[k], v2[k]);
				if (!r) {
					return false;
				}
			}
			return true;
		} else {
			if (v1 === v2) {
				return true;
			} else {
				return false;
			}

		}
	}

	countProps(obj) {
		var count = 0;
		for (let k in obj) {
			if (obj.hasOwnProperty(k)) {
				count++;
			}
		}
		return count;
	}

	getP(t, delay, duration) {


		var p = 0;
		if (t > delay) {
			p = Math.min(1, (t - delay) / duration);
		}

		if (this.easing) {
			p = this.easing(p);
		}


		return Math.min(1, p);
	}
}