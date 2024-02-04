
<template>
	<div class="MatcAnimationComposer">
	</div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import css from 'dojo/css'
import lang from 'dojo/_base/lang'
import on from 'dojo/on'
import touch from 'dojo/touch'
import domGeom from 'dojo/domGeom'
import _Tooltip from 'common/_Tooltip'
import Logger from 'common/Logger'
import DomBuilder from 'common/DomBuilder'
import RangeSlider from 'common/RangeSlider'
import ToolbarDropDownButton from 'canvas/toolbar/components/ToolbarDropDownButton'
import Util from 'core/Util'
import Simulator from 'core/Simulator'
import ScrollContainer from 'common/ScrollContainer'
import Core from 'core/Core'

export default {
	name: 'AnimationComposer',
	mixins: [_Tooltip, Util, DojoWidget],
	data: function () {
		return {
			maxTime: 50,
			jwtToken: 'NoTokenComposer',
			hash: "NoHashComposer"
		}
	},
	components: {},
	methods: {
		postCreate() {
			this.logger = new Logger({ "className": "ActionSettings" });
			this.logger.log(0, "postCreate", "enter > ");
		},

		setJwtToken(t) {
			this.jwtToken = t
		},

		setHash(h) {
			this.logger.log(-1, "setHash", "enter");
			this.hash = h
		},


		setModel(m) {
			this.orgModel = lang.clone(m);
			this.model = this.createInheritedModel(m);
			this.model = Core.addContainerChildrenToModel(this.model);
		},

		setType(type) {
			this.type = type;
		},

		setWidget(w) {
			this.logger.log(0, "setWidget", "enter > " + w.id);
			this.widget = w;
		},

		setScreen(s) {
			this.logger.log(0, "setScreen", "enter > " + s.id);
			this.screen = s;
			this.render(s);
		},

		render(screen) {

			screen = this.model.screens[screen.id];


			this.domNode.innerHTML = "";
			this.cleanUpTempListener();

			var db = new DomBuilder();

			/**
			 * Create basic layout and render it, so the simulator can grap the space!
			 */
			var cntr = db.div("container-fluid").build();
			var row = db.div("row").build(cntr);
			var simCntr;
			var widgetCntr;

			if (this.model.type == "desktop" || this.model.type == "tablet") {
				simCntr = db.div("col-md-5 MatcAnimationComposerColumn MatcAnimationComposerPreview").build(row);
				widgetCntr = db.div("col-md-7 MatcAnimationComposerColumn MatcAnimationComposerTableCntr").build(row);
			} else {
				simCntr = db.div("col-md-3 MatcAnimationComposerColumn MatcAnimationComposerPreview").build(row);
				widgetCntr = db.div("col-md-9 MatcAnimationComposerColumn MatcAnimationComposerTableCntr").build(row);
			}
			this.domNode.appendChild(cntr);

			/**
			 * Render Simulator and surpress onLoadAniamtion
			 */
			var sim = this.renderSimulator(simCntr, screen);
			sim.doNotRunOnLoadAnimation = true
			sim.setHash(this.hash)
			sim.setStartScreen(screen);
			sim.setModel(this.orgModel);
			this.simulator = sim;


			/**
			 * Render the awesome
			 */
			this.renderAnimationControlls(widgetCntr, screen, this.type);

			/**
			 * run once
			 */
			this.runAnimation(sim, screen);
		},

		renderAnimationControlls(parent, screen, event) {


			this._typeWidgets = {};
			this._easingWidgets = {};
			this._rangeWidgets = {};

			this._typeGroups = {};
			this._easingGroups = {};
			this._rangeGroups = {};

			var animation = this.getScreenAnimation(screen, event);

			animation = this.initDefaultAnimation(animation, screen);

			var domPos = domGeom.position(this.domNode);
			var db = new DomBuilder();

			var div = db.div("MatcAnimationComposerTableCntr").h(domPos.h).build();

			var tbl = db.table("MatcAnimationComposerTable").build(div);

			// add header
			this.renderTableHeader(tbl, db)

			var scroller = this.$new(ScrollContainer, { canDestroy: true });
			scroller.placeAt(parent);
			scroller.wrap(div);

			/**
			 * First render groups
			 * FIXME: Groups and widhet should be mxied and sorted by X
			 */

			let rows = this.getSortedRows(animation, screen, this.model)

			rows.forEach(row => {
				this.renderAnimLine(tbl, db, row.anim, row.element, row.isGroup);
			})

			this.tempOwn(on(this.domNode, touch.out, lang.hitch(this, "unSelectWidget")));

		},

		getSortedRows(animation, screen, model) {
			let result = []

			let widgets = this.sortChildrenByY(screen.children, model);
			for (let i = 0; i < widgets.length; i++) {
				let widget = widgets[i];
				let anim = animation.widgets[widget.id];
				if (anim) {
					result.push({
						anim: anim,
						isGroup: false,
						element: widget,
						y: widget.y
					})
				}
			}

			if (model.groups && animation.groups) {
				var groups = model.groups
				for (let groupId in groups) {
					let group = groups[groupId];
					let anim = animation.groups[groupId];
					if (anim) {
						let boundingBox = this.getBoundingBox(group.children);
						result.push({
							anim: anim,
							isGroup: true,
							element: group,
							y: boundingBox.y
						})
					}
				}
			}

			result.sort((a, b) => {
				return a.y - b.y
			})


			return result
		},

		renderTableHeader(tbl, db) {
			let th = db.thead().tr().build(tbl);
			db.td("", "").build(th);
			let timeCntr = db.td("MatcAnimationComposerTabelTime", "").build(th);
			let stepCntr = db.div("MatcAnimationComposerTableSteps").build(timeCntr);
			let tickCntr = db.div("MatcAnimationComposerTableTicks").build(timeCntr);
			db.td("", "").build(th);
			db.td("", "").build(th);

			db.span("MatcAnimationComposerTableStep").div("", 0).build(stepCntr)
			for (let i = 1; i <= 10; i++) {
				let p = Math.round((i / 10) * this.maxTime) / 10;
				db.span("MatcAnimationComposerTableStep").div("", p).build(stepCntr)
			}

			for (let i = 0; i < 100; i++) {
				db.span("MatcAnimationComposerTableTick").div().build(tickCntr)
			}

			this.timeBar = db.div("MatcAnimationComposerTimeBar").build(timeCntr);
		},

		renderAnimLine(tbl, db, anim, widget, isGroup) {

			var tr = db.tr().build(tbl);
			this.tempOwn(on(tr, touch.out, lang.hitch(this, "stopEvent")));

			db.td("MatcAnimationComposerRowName", widget.name).build(tr);

			if (isGroup) {
				this.tempOwn(on(tr, touch.over, lang.hitch(this, "selectGroup", widget)));
			} else {
				this.tempOwn(on(tr, touch.over, lang.hitch(this, "selectWidget", widget)));
			}

			var rangeTd = db.td("MatcAnimationComposerRowRange").build(tr);

			var typeTD = db.td("MatcAnimationComposerRowType").build(tr);
			var typeDrpDown = this.$new(ToolbarDropDownButton);
			typeDrpDown.setPopupCss("MatcAnimationComposerActionPopUp");
			typeDrpDown.reposition = true;
			typeDrpDown.hasLabelTxt = false;
			typeDrpDown.setOptions(this.getAnimationTypes(widget, isGroup, typeDrpDown, anim));
			typeDrpDown.setValue(anim.type);
			typeDrpDown.placeAt(typeTD);


			const easingTD = db.td("MatcAnimationComposerRowEasing").build(tr);
			const easingDrpDown = this.$new(ToolbarDropDownButton);
			easingDrpDown.setPopupCss("MatcAnimationComposerActionPopUp");
			easingDrpDown.setIcon('AnimationEasing');
			easingDrpDown.reposition = true;
			easingDrpDown.updateLabel = false;
			easingDrpDown.setOptions([
				{ value: null, label: "Default Easing", icon: "AnimationEasing" },
				{ value: "linear", label: "Linear", icon: "AnimationEasing" },
				{ value: "easeInQuad", label: "Ease-In", icon: "AnimationEasing" },
				{ value: "easeOutQuad", label: "Ease-Out", icon: "AnimationEasing" },
				{ value: "easeInOutQuad", label: "Ease-In-Out", icon: "AnimationEasing" },
				{ value: "easeElasticIn", label: "Ease-lastic-In", icon: "AnimationEasing" },
				{ value: "easeElasticOut", label: "Ease-Elastic-Out", icon: "AnimationEasing" },
				{ value: "easeBounceIn", label: "Ease-Bounce-In", icon: "AnimationEasing" },
				{ value: "easeBounceOut", label: "Ease-Bounce-Out", icon: "AnimationEasing" }
			]);
			easingDrpDown.setValue(anim.easing);
			easingDrpDown.placeAt(easingTD);

			/**
			 * Add slider last so table is layoutet...
			 */
			var rangeSlider = this.$new(RangeSlider, { min: 0, max: this.maxTime });
			rangeSlider.placeAt(rangeTd);
			rangeSlider.valueFunction = function (v) {
				if (v > 0) {
					return (v / 10) + "s";
				}
				return "";
			};
			rangeSlider.setValue({ start: anim.delay / 100, end: (anim.delay + anim.duration) / 100 });
			this.own(rangeSlider.on('change', () => {
				if (anim.type === null) {
					anim.type = 'fadeIn'
					typeDrpDown.setValue(anim.type)
				}
			}))

			if (isGroup) {
				this._typeGroups[widget.id] = typeDrpDown;
				this._easingGroups[widget.id] = easingDrpDown;
				this._rangeGroups[widget.id] = rangeSlider;
			} else {
				this._typeWidgets[widget.id] = typeDrpDown;
				this._easingWidgets[widget.id] = easingDrpDown;
				this._rangeWidgets[widget.id] = rangeSlider;
			}

		},

		initDefaultAnimation(animations, screen) {
			if (!animations) {
				animations = { widgets: {}, groups: {} };
			}
			// first version just had widgets...
			if (!animations.groups) {
				animations.groups = {};
			}


			// var group = {};
			var widgets = this.sortChildrenByY(screen.children, this.model);
			for (let i = 0; i < widgets.length; i++) {
				let widget = widgets[i];
				let group = this.getTopParentGroup(widget.id);
				if (group) {
					if (!animations.groups[group.id]) {
						let animation = { duration: 0, delay: 0, type: null, easing: null };
						if (this.groupIsCopyOfOtherScreen(group, screen.id)) {
							//animation.type = "transformFromParent";
						}
						animations.groups[group.id] = animation;
					}
				} else {
					/**
					 * If no animation create a default one!
					 */
					if (!animations.widgets[widget.id]) {
						let animation = { duration: 0, delay: 0, type: null, easing: null };
						if (this.widgetIsCopyOfOtherScreen(widget, screen.id)) {
							//animation.type = "transformFromParent";
						}
						animations.widgets[widget.id] = animation;
					}
				}
			}
			return animations;
		},

		widgetIsCopyOfOtherScreen(widget, screenID) {
			if (widget.copyOf) {
				var org = this.model.widgets[widget.copyOf];
				if (org) {
					var orgScreen = this.getParentScreen(org);
					if (orgScreen) {
						return orgScreen.id != screenID;
					}
				}
			}
			return false;
		},

		groupIsCopyOfOtherScreen(group) {
			if (group.copyOf && this.model.groups) {
				group = this.model.groups[group.id];
				if (group) {
					let isCopy = true;
					let children = group.children;
					for (let i = 0; i < children.length; i++) {
						let widget = this.model.widgets[children[i]];
						isCopy = isCopy && this.widgetIsCopyOfOtherScreen(widget);
					}
					return isCopy;
				}
			}
			return false;
		},

		selectGroup(group, e) {
			this.stopEvent(e);

			if (this._selected != group.id) {
				this._selected = group.id;

				if (this.simulator) {
					let children = this.getAllGroupChildren(group)
					this.simulator.highlight(children);
					this.simulator.scrollIntoView(children);
				}
			}
		},

		selectWidget(widget, e) {
			this.stopEvent(e);
			if (this._selected != widget.id) {
				this._selected = widget.id;

				if (this.simulator) {
					this.simulator.highlight([widget.id]);
					this.simulator.scrollIntoView([widget.id]);
				}
			}
		},

		unSelectWidget() {
			this.selected = null;
			this.simulator.highlight();
		},

		getAnimationTypes: function (w, isGroup, btn, anim) {
			var types;
			if (isGroup) {
				types = [
					{ value: null, label: "No Animation", icon: "DeleteX" },
					{ value: "fadeIn", label: "Fade In", icon: "AnimationFadeIn" },
					{ value: "fadeOut", label: "Fade Out", icon: "AnimationFadeOut" },
					{ value: "slideLeft", label: "Left Slide", icon: "AnimationLeft" },
					{ value: "slideRight", label: "Right Slide", icon: "AnimationRight" },
					{ value: "slideUp", label: "Up Slide", icon: "AnimationUp" },
					{ value: "slideDown", label: "Down Slide", icon: "AnimationDown" }
				];
			} else {

				var defaultRotate = 90;
				if (anim.rotate != null && anim.rotate != undefined) {
					defaultRotate = anim.rotate;
				}
				types = [
					{ value: null, label: "No Animation", icon: "DeleteX" },
					{ value: "transformFromParent", label: "Transform", icon: "AnimationTransform" },
					{ value: "fadeIn", label: "Fade In", icon: "AnimationFadeIn" },
					{ value: "fadeOut", label: "Fade Out", icon: "AnimationFadeOut" },
					{ value: "zoomIn", label: "Zoom In", icon: "AnimationZoom" },
					{ value: "slideLeft", label: "Left Slide", icon: "AnimationLeft" },
					{ value: "slideRight", label: "Right Slide", icon: "AnimationRight" },
					{ value: "slideUp", label: "Up Slide", icon: "AnimationUp" },
					{ value: "slideDown", label: "Down Slide", icon: "AnimationDown" },
					{ value: "growRight", label: "Grow Right", icon: "AnimationGrowRight" },
					{ value: "growLeft", label: "Grow Left", icon: "AniamtionGrowLeft" },
					{ value: "growUp", label: "Grow Up", icon: "AnimationGrowUp" },
					{ value: "growDown", label: "Grow Down", icon: "AnimationGrowDown" },
					{ value: "rotate", label: "Rotate", icon: "AnimationRotate", dialog: { value: defaultRotate, label: "Rotate by", unit: "deg" } }
				];

			}

			if (w.copyOf) {
				//types.splice(1, 0,  {value:"transformFromParent", label:"Transform", icon:"mdi mdi-auto-fix"});
			}

			return types;
		},


		renderSimulator(cntr, screen) {

			var db = new DomBuilder();

			var domPos = domGeom.position(this.domNode);
			var pos = domGeom.position(cntr);
			pos.w -= 30;
			pos.h = domPos.h;

			/**
			 * HACK: Change screen size so we have a
			 * nice full length
			 */
			var f = screen.w / pos.w;
			this.model.screenSize.w = pos.w * f;
			this.model.screenSize.h = pos.h;

			var container = db.div("MatchSimulatorContainer MatcAnimationComposerSimulator")
				.h(pos.h)
				.w(pos.w)
				.build();

			var scroller = this.$new(ScrollContainer, { canDestroy: true });
			scroller.placeAt(container);

			var s = this.$new(Simulator, { mode: "debug", logData: false, runTimerLinesOnScreenLoad: false, isDesktopTest: true, isWiringEvents: false });
			s.scrollListenTarget = "parent";
			/**
			 * We do not want to resize the parent.
			 * Therefore we replace the method with an empty one
			 */
			s.initParent = () => { };

			//s.setScrollContainer(scroller);
			scroller.wrap(s.domNode);
			cntr.appendChild(container);

			/**
			 * Add a dic above the simulator with the same height to capture
			 * events
			 */
			s.afterScreenRendered = (screen) => {
				db.div(" MatcAnimationComposerSimulatorCover")
					.h(screen.h)
					.w(screen.w)
					.build(container);
			}


			let runBack = db.div("MatcAnimationComposerSimulatorRun").build(cntr);
			db.span("MatcMiddle mdi mdi-play-circle").build(runBack);
			this.tempOwn(on(runBack, touch.press, lang.hitch(this, "runAnimation", s, screen)));

			return s;
		},

		runAnimation(simulator, screen) {
			var animation = this.getValue();
			css.add(this.domNode, "MatcAnimationComposerAniamtionRunning");
			simulator.cleanUpAnimations();
			simulator.runScreenAnimation(screen.id, animation, this.type, lang.hitch(this, "onAnimationEnded"), lang.hitch(this, "onAnimationStep"));
			this.currentTimeBarPos = 0;
		},

		onAnimationStep(step) {
			if (this.timeBar) {
				var p = (step / this.maxTime)
				if (p > this.currentTimeBarPos) {
					this.timeBar.style.left = p + "%"
					this.currentTimeBarPos = p;
				}
			}
		},

		onAnimationEnded() {
			css.remove(this.domNode, "MatcAnimationComposerAniamtionRunning");
		},


		getValue() {
			var animations = { widgets: {}, groups: {} };


			if (this._rangeGroups) {
				for (let id in this._rangeGroups) {
					let range = this._rangeGroups[id].getValue();
					let type = this._typeGroups[id].getValue();
					let easing = this._easingGroups[id].getValue();

					if (type != null && range.end > 0) {
						var animation = {
							duration: (range.end - range.start) * 100,
							delay: range.start * 100,
							type: type,
							easing: easing
						};
						animations.groups[id] = animation;
					}
				}
			}

			if (this._rangeWidgets) {
				for (let id in this._rangeWidgets) {
					let range = this._rangeWidgets[id].getValue();
					let type = this._typeWidgets[id].getValue();
					let easing = this._easingWidgets[id].getValue();

					if (type != null && range.end > 0) {
						let animation = {
							duration: (range.end - range.start) * 100,
							delay: range.start * 100,
							type: type,
							easing: easing
						};

						if (type == "rotate") {
							animation.rotate = this._typeWidgets[id].getDialogValue("rotate");
						}
						animations.widgets[id] = animation;
					}
				}
			}
			return animations;
		},

		sortChildrenByY(children, model) {
			let result = []
			for (var i = 0; i < children.length; i++) {
				var widgetID = children[i];
				var widget = model.widgets[widgetID];
				if (widget) {
					result.push(widget)
				}
			}
			result.sort((a, b) => {
				return a.y - b.y
			})
			return result
		},

		destroy: function () {
			if (this.simulator) {
				this.simulator.destroy();
			}
		}
	},
	mounted() {
	}
}
</script>