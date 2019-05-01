import lang from 'dojo/_base/lang'
import Animation from 'core/Animation'

export default class extends Animation {

	// enbale this method to have CSS widget animation!
	// we would have to somehow set all the transition
	// propertz on all the 
	//createAnimation (a, b) {
	//	
	//}

	/**
	 * Change to createAnimation to also make widgets run smooth.
	 * 
	 * FIXME: transform stuff does nto work well with this...
	 * @param {} oldScreen 
	 * @param {*} newScreen 
	 */
	createScreenAnimation(oldScreen, newScreen) {

		return {

			startTime: 0,

			duration: this.defaultAnimationDuration,

			easing: function (t) {
				return t * (2 - t)
			},

			css3Easing: "ease-out",

			finished: false,

			divOld: oldScreen,

			divNew: newScreen,

			setStart(t) {
				this.startTime = t;
			},

			setModel(m) {
				this.model = m;
			},

			setDuration(t) {
				this.duration = t;
			},

			setEasing(name) {

				this.css3Easing = null;

				/**
				 * FIXME: Get JS and CSS3 in sync!
				 * 
				 * https://github.com/gre/bezier-easing/blob/master/src/index.js
				 */
				switch (name) {
					case "linear":
						this.easing = function (t) {
							return t
						};
						this.css3Easing = "linear";
						break;

					case "easeInQuad":
						this.easing = function (t) {
							return t * t
						};
						this.css3Easing = "ease-in";
						break;

					case "easeOutQuad":
						this.easing = function (t) {
							return t * (2 - t)
						};
						this.css3Easing = "ease-out";
						break;

					case "easeInOutQuad":
						this.easing = function (t) {
							return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t
						};
						this.css3Easing = "ease";
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

			onEnd(fct) {
				this.endCallback = fct;
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
				this._runJS();
			},

			onRender(fct) {
				this.renderCallback = fct;
			},

			time(now) {
				var t = Math.max(0, now - this.startTime);
				var p = Math.min(1, t / this.duration);

				if (this.easing) {
					p = this.easing(p);
				}

				if (this.renderCallback) {
					this.renderCallback(p)
				}


				/**
				 * ok we are done. No clean up and call the end callback. we just cal this once
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
				if (this.css3Easing) {
					this._runCSS();
				} else {
					this._runJS();
				}
			},


			_runCSS() {

				var css3Transition = "all " + this.duration + "ms";

				if (this.divOld) {
					this.divOld.style.transition = css3Transition;
					this.divOld.style.webkitTransition = css3Transition;


					this.divOld.style.transitionTimingFunction = this.css3Easing;
					this.divOld.style.webkitTransitionTimingFunction = this.css3Easing;

				}

				if (this.divNew) {
					this.divNew.style.transition = css3Transition;
					this.divNew.style.webkitTransition = css3Transition;

					this.divNew.style.transitionTimingFunction = this.css3Easing;
					this.divNew.style.webkitTransitionTimingFunction = this.css3Easing;
				}

				if (this.renderCallback) {
					/**
					 * start transition a little bit later...
					 */
					setTimeout(lang.hitch(this, "renderCallback", 1), 10);
				}


				setTimeout(lang.hitch(this, "_finish"), this.duration + 60);
			},

			_runJS() {
				if (this.duration > 0) {
					if (!this.startTime) {
						this.startTime = new Date().getTime();
					}
					var now = new Date().getTime();
					var t = now - this.startTime;
					if (t < this.duration && !this.finished) {
						var callback = lang.hitch(this, "_runJS");
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
			},

			_finish() {
				//console.debug("css3_finish");
				if (this.endCallback) {
					this.endCallback();
				}

				if (this.finishCallback) {
					this.finishCallback();
				}

				if (this.divOld) {
					this.divOld.style.transition = "none";
					this.divOld.style.webkitTransition = "none";
				}

				if (this.divNew) {
					this.divNew.style.transition = "none";
					this.divNew.style.webkitTransition = "none";
				}
			},

			stop() {
				this.finished = true;
			}


		};

	}

}