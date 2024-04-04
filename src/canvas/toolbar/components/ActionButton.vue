
<template>
	<div class="MatcAction">
	</div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import css from 'dojo/css'
import lang from 'dojo/_base/lang'
import on from 'dojo/on'
import touch from 'dojo/touch'
//import topic from 'dojo/topic'
import _Tooltip from 'common/_Tooltip'
import DomBuilder from 'common/DomBuilder'
import CheckBox from 'common/CheckBox'
import Dialog from 'common/Dialog'
import ToolbarDropDownButton from './ToolbarDropDownButton'
import Rule from './Rule'
import ActionSettings from './ActionSettings'
import WorkflowSettings from './WorkflowSettings'
import Util from 'core/Util'
import DomUtil from 'core/FastDomUtil'
import { iconDOM } from 'page/QIconUtil'

export default {
	name: 'ActionButton',
	mixins: [_Tooltip, Util, Rule, DojoWidget],
	data: function () {
		return {
			reposition: true,
			mode: "TopDown"
		}
	},
	components: {},
	methods: {
		postCreate() {
		},

		setModel(m) {
			this.model = m;
		},

		setCanvasSettings(settings) {
			if (settings) {
				this.hasProtoMoto = settings.hasProtoMoto
			}
		},

		setScreen(screen) {

			this.domUtil.removeAllChildNodes(this.domNode)
			this.cleanUpTempListener();

			const db = new DomBuilder();
			const parent = db.div().build();

			const lines = this.getFromLines(screen);
			for (let i = 0; i < lines.length; i++) {
				const line = lines[i];
				this.renderNewSchool(db, parent, line, false);
				db.div("MatcToolbarSeparator").build(parent);
			}

			const btn = db
				.div("MatcToolbarItem")
				.div(" MatcToolbarButton MatcButton")
				.tooltip("Add Link to other screen")
				.build(parent);

			db.span("mdi mdi-link-variant MatcButtonIcon").build(btn);
			db.span("MatcButtonIconLabel", "Add Link").build(btn);
			this.tempOwn(on(btn, touch.press, lang.hitch(this, "onNewLine")));

			this.domNode.appendChild(parent);
		},

		setValue(widget, isLogicWidget) {

			this.widget = widget;

			this.domUtil.removeAllChildNodes(this.domNode)
			this.cleanUpTempListener();

			const db = new DomBuilder();
			const parent = db.div("MatcActionCntr").build();

			if (isLogicWidget) {
				const lines = this.getFromLines(widget);
				for (let i = 0; i < lines.length; i++) {
					const line = lines[i];
					const to = this.getToBox(line);

					if (to) {
						let icon = "Link"; //this.getAppTypeIcon(this.model);
						if (this.hasLogic(to)) {
							icon = "MatcToolbarIconAddLogic mdi mdi-checkbox-blank"
						}
						if (this.hasRest(to)) {
							icon = "Cloud"
						}
						if (this.hasScript(to)) {
							icon = "Code"
						}

						const item = db.div("MatcToolbarItem MatcToobarActionCntr MatcToolbarIconButton").build(parent);

						item.appendChild(iconDOM(icon))

				
						db.span("MatcToolbarItemLabel", to.name).build(item);
						const btn = db.span("MatcToobarRemoveBtn ").build(item);
						btn.appendChild(iconDOM("DeleteX"))
						this.tempOwn(on(btn, touch.press, lang.hitch(this, "onRemoveLineByID", line.id)));


						if (!this.hasScript(widget)) {
							if (widget.props && !widget.props.isRandom) { // new since 6
								if (line.rule) {
									const lbl = this.getRuleLabel(line.rule);
									const row = db.div("MatcToobarRow").build(parent);
									const item = db.div("MatcToolbarItem  MatcToolbarDropDownButton MatcToolbarIconButton").build(row);
									item.appendChild(iconDOM("EditPencil"))
									db.span("", lbl).build(item);
									this.tempOwn(on(item, touch.press, lang.hitch(this, "onEditRule", line)));
								} else {
									const row = db.div("MatcToobarRow").build(parent);
									const item = db.div("MatcToolbarItem  MatcToolbarDropDownButton MatcToolbarIconButton").build(row);
							
									item.appendChild(iconDOM("Plus"))
									const span = db.label("MatcToolbarItemIcon").build(item);
									db.span("MatcToolbarDropDownButtonLabel", "Add Rule").build(span);
									this.tempOwn(on(item, touch.press, lang.hitch(this, "onEditRule", line)));
								}
							}
						}


						if (i < lines.length - 1) {
							db.div("MatcToolbarSeparator").build(parent);
						}

					}

				}

				// script does only allow one line!
				if (!this.hasScript(widget) || lines.length === 0) {
					const btn = db
						.div("MatcToolbarItem")
						.div(" MatcToolbarButton MatcButton MatcToolbarButtonPrimary")
						.tooltip("Add Link to other screen")
						.build(parent);

					btn.appendChild(iconDOM("Link"))
					db.span("MatcButtonIconLabel", "Add Link").build(btn);
					this.tempOwn(on(btn, touch.press, lang.hitch(this, "onNewLine")));
				}

			} else {
				let line = this.getLineFrom(widget);
				let action = widget.action;
				if (!line && !action) {
					/**
					 * Thing set, show drop down
					 */
					let row = db.div("MatcToolbarItem").build(parent);
					let btn = this.$new(ToolbarDropDownButton, { maxLabelLength: 20 });
					btn.setLabel('<span class="mdi mdi-plus-circle-outline"></span><span class="MatcButtonIconLabel">Add Action</span>');
					btn.updateLabel = false;
					btn.setOptions(this.getLineTypes());
					btn.setPopupCss("MatcMultiActionDropDownPopup");
					btn.reposition = true;
					css.add(btn.domNode, "MatcMultiActionDropDown MatcToolbarButton MatcButton");
					btn.placeAt(row);
					//    btn.setShowListener(() => {
					// 	   topic.publish("matc/canvas/fadeout", {});
					//    });
					//    btn.setHideListener(() => {
					// 	   topic.publish("matc/canvas/fadein", {});
					//    });

				} else if (action) {

					let actionCntr = db.div("MatcToobarActionSelector").build(parent);

					let btn = this.$new(ToolbarDropDownButton, { maxLabelLength: 20 });
					btn.setOptions([
						{ value: 'back', label: "Navigate Back", icon: "NavigateBack" },
						{ value: 'workflow', label: "Simple Formula", icon: "mdi mdi-flask-empty-plus-outline" }
						//{value:'hide', label:"Hide & Show ", icon:"mdi mdi-eye-outline"},
					]);
					btn.setValue(action.type);
					btn.setPopupCss("MatcActionAnimProperties");
					btn.updateLabel = true;
					btn.reposition = true;
					css.add(btn.domNode, "");
					btn.placeAt(actionCntr);
					this.tempOwn(on(btn, "change", lang.hitch(this, "setActionType", action)));
					//this.addTooltip(btn.domNode, "Select action type");

					let removeBtn = db.span("MatcToobarRemoveBtn ")
						.tooltip("Remove Action", "vommondToolTipRightBottom")
						.build(actionCntr);
					
					removeBtn.appendChild(iconDOM("DeleteX"))

					this.tempOwn(on(removeBtn, touch.press, lang.hitch(this, "onRemoveAction", action)));

					if (action.type === 'workflow') {
						this.renderWorkFlowAction(parent, db, action)
					}


				} else {
					this.renderNewSchool(db, parent, line, true);
				}
			}
			this.domNode.appendChild(parent);
		},



		/**
		 * This seems to be really slow. Maybe because of the call of $new()?
		 */
		renderNewSchool(db, parent, line, isWidget) {
			var to = this.getToBox(line);
			if (!to) {
				return;
			}

			let icon = "Link"; //this.getAppTypeIcon(this.model);
			if (this.hasLogic(to)) {
				icon = "OR"
			}

			if (this.hasRest(to)) {
				icon = "Cloud"
			}

			let item = db.div("MatcToolbarItem MatcToobarActionCntr MatcToolbarIconButton").build(parent);
			item.appendChild(iconDOM(icon))
			db.span("MatcToolbarItemLabel", to.name).build(item);

			let btn = db.span("MatcToobarRemoveBtn ").tooltip("Remove Link", "vommondToolTipRightBottom").build(item);
			btn.appendChild(iconDOM("DeleteX"))
			this.tempOwn(on(btn, touch.press, lang.hitch(this, "onRemoveLineByID", line.id)));

			btn = this.$new(ToolbarDropDownButton, { maxLabelLength: 20 });
			btn.setOptions(this.getEventTypes(line, isWidget, btn));
			btn.setValue(line.event);
			btn.setPopupCss("MatcActionAnimProperties");
			btn.updateLabel = true;
			btn.reposition = true;
			btn.placeAt(parent);
			this.tempOwn(on(btn, "change", lang.hitch(this, "onLineEventByID", line.id)));
			//this.addTooltip(btn.domNode, "Select event type");


			const iconAndLabel = this.getAnimationIconAndLabel(line)
			item = db.div("MatcToolbarItem MatcToobarActionCntr MatcToolbarIconButton ").build(parent);
			item.appendChild(iconDOM(iconAndLabel.icon))
			db.span("MatcToolbarItemLabel", iconAndLabel.label).build(item);
			this.tempOwn(on(item, touch.press, lang.hitch(this, "showActionSettings", line, item)));

			/**
			 *  Since 
			 */

			if (isWidget && !line.isTemplateTransition) {
				btn = this.$new(ToolbarDropDownButton, { maxLabelLength: 20 });
				btn.setOptions([
					{ value: false, label: "No validation", icon: "Close" },
					{ value: true, label: "All fields valid", icon: "mdi mdi-check" },
				]);
				btn.setValue((line.validation != null && line.validation != undefined && line.validation.all));
				btn.setPopupCss("MatcActionAnimProperties");
				btn.updateLabel = true;
				btn.reposition = true;
				btn.placeAt(parent);
				this.tempOwn(on(btn, "change", lang.hitch(this, "onLineValidation")));
				//this.addTooltip(btn.domNode, "Select an animation for the screen transition");
			}

			/**
			 * Move this and the timer options int
			 */
			if (!line.isTemplateTransition) {
				var scrollChkBox = this.$new(CheckBox);
				scrollChkBox.setLabel("Keep scroll position");
				css.add(scrollChkBox.domNode, "MatcToolbarItem");
				//this.addTooltip(scrollChkBox.domNode, "BETA: Scroll to same position after the new screen is loaded.");
				scrollChkBox.placeAt(parent);
				scrollChkBox.setValue(line.scroll);
				this.tempOwn(on(scrollChkBox, "change", lang.hitch(this, "onLineScrollByID", line.id)));
			}

		},

		getLineTypes() {
			let result = [
				{ value: false, label: "Link to other screen", shortcut:'L', icon: "Link", callback: lang.hitch(this, "onNewLine") },
				{ value: true, label: "Navigate Back", icon: "NavigateBack", callback: lang.hitch(this, "onActionBack") },
				{ value: true, label: "Animation", icon: "Animation", callback: lang.hitch(this, "onNewTransfromLine") }
				//{value:true, label:"Simple Formuala", icon:"mdi mdi-flask-empty-plus-outline", callback:lang.hitch(this, "onActionWorkflow")}
			]
			return result;
		},

		getEventTypes(line, isWidget, btn) {

			if (line.isTemplateTransition) {
				return [
					{ value: "click", label: "Click", icon: "EventClick" },
					{ value: "mouseover", label: "Mouse Over", icon: "mdi mdi-cursor-default" },
					{ value: "mouseout", label: "Mouse Out", icon: "mdi mdi-cursor-default-outline" }
				]
			}


			if (this.widget && (this.widget.type == "DragNDropTarget")) {
				return [
					{ value: "click", label: "Drop", icon: "EventClick" },
					{ value: "hover", label: "Hover", icon: "EventHover" }
				]
			}


			if (this.widget && (this.widget.type == "TextBox" || this.widget.type == "Password")) { //
				return [
					{ value: "click", label: "Click", icon: "EventClick" },
					{ value: "InputChange", label: "Change", icon: "mdi mdi-contain-end" },
					{ value: "KeyboardEnter", label: "Keyboard Return", icon: "mdi mdi-keyboard-return" },
					{ value: "KeyboardUp", label: "Key Up", icon: "mdi mdi-arrow-expand-up" }
				]
			}

			var triggers = [
				{ value: "click", label: "Click", icon: "EventClick" },
				{ value: "swipeLeft", label: "Left Swipe", icon: "EventSwipeLeft" },
				{ value: "swipeRight", label: "Right Swipe", icon: "EventSwipeRight" },
				{ value: "swipeUp", label: "Up Swipe", icon: "EventSwipeUp" },
				{ value: "swipeDown", label: "Down Swipe", icon: "EventSwipeDown" },
				{ value: "scroll", label: "Scrolled in view", icon: "Scroll" }
			]

			/**
			 * Screens have also a timer...
			 */
			if (!isWidget) {
				var timerLbl = "Timer";
				if (line.timer) {
					timerLbl = "Timer ( " + line.timer + "s )";
				}
				triggers.push({ value: "timer", label: timerLbl, icon: "EventTimer", callback2: lang.hitch(this, "onTimerSelected", btn, line) });
				triggers.push({ value: "loaded", label: 'Loaded', icon: "EventLoaded" });
			} else {
				triggers.push({ value: "hover", label: "Hover", icon: "EventHover" });
			}

			return triggers;
		},

		onSetActionCallback(widget, action, event, input, e) {
			this.stopEvent(e)
			let newAction = lang.clone(action)
			newAction.callbacks = [
				{
					method: input.value,
					event: event
				}
			]
			this.emit("updateAction", newAction);
		},

		setActionCallback(dialog, input, action, widget, e) {
			action.callback = input.value
			this.stopEvent(e);
			dialog.close();
			this.emit("updateAction", widget.id, { 'callback': input.value });
		},



		onTimerSelected(btn, line) {

			var timerValue = 1.5;
			if (line.timer != null && line.timer != undefined) {
				timerValue = line.timer;
			}

			var db = new DomBuilder();
			var div = db.div("MatcToolbarDropDownButtonDialog").build();
			db.span("", "Move to the next screen after ").build(div);
			var input = db.input("MatcToolbarDropDownButtonInlineEdit MatcIgnoreOnKeyPress", timerValue).build(div);
			db.span("", "seconds.").build(div);

			/**
			 * Focus and select the new input
			 */
			setTimeout(function () {
				input.focus();
				input.select();
			}, 50);

			/**
			 * Listen to some keyboard events..
			 */
			var me = this;
			this.tempOwn(on(input, "keyup", function (e) {
				var keyCode = e.keyCode ? e.keyCode : e.which;
				/**
				 * Close on ESC
				 */
				if (27 == keyCode) {
					btn.hideDropDown();
				}
				/**
				 * Change will not be fired if the users presses enter without changing the value!
				 */
				if (13 == keyCode && timerValue == input.value) {
					me.onLineTimerAndDurationByID(line.id, input, btn, line);
				}
			}));
			this.tempOwn(on(input, "change", lang.hitch(this, "onLineTimerAndDurationByID", line.id, input, btn, line)));
			this.tempOwn(on(div, touch.press, lang.hitch(this, "stopPropagation")));


			btn.setContent(div);

		},


		getAnimationIconAndLabel(line) {

			var result = {
				"label": "No Animation",
				"icon": "Close"
			};

			switch (line.animation) {
				case "slideLeft":
					result.icon = "AnimationLeft";
					result.label = "Left Slide";
					break;

				case "slideRight":
					result.icon = "AnimationRight";
					result.label = "Right Slide";
					break;

				case "slideUp":
					result.icon = "AnimationUp";
					result.label = "Up Slide";
					break;

				case "slideDown":
					result.icon = "AnimationDown";
					result.label = "Down Slide";
					break;

				case "fadeIn":
					result.icon = "AnimationFadeIn";
					result.label = "Fade In";
					break;

				case "transform":
					result.icon = "AnimationTransform";
					result.label = "Transform";
					break;

				case "zoomIn":
					result.icon = "AnimationTransform";
					result.label = "Zoom In";
					break;

				// legacy stuff
				case "zoomOut":
					result.icon = "mdi mdi-select-all";
					result.label = "Zoom Out";
					break;

				case "popup":
					result.icon = "AnimationZoom";
					result.label = "Popup";
					break;

				case "rotateInTopLeft":
					result.icon = "mdi mdi-screen-rotation";
					result.label = "Rotate (Top Left)";
					break;

					case "slideLeftDown":
					result.icon = "mdi mdi-arrow-bottom-left";
					result.label = "Down Left Slide";
					break;

				case "slideLeftUp":
					result.icon = "mdi mdi-arrow-top-left";
					result.label = "Up Left Slide";
					break;

				case "slideRightDown":
					result.icon = "mdi mdi-arrow-bottom-right";
					result.label = "Up Right Slide";
					break;

				case "slideRightUp":
					result.icon = "mdi mdi-arrow-top-right";
					result.label = "Down Right Slide";
					break;

				default:
					break;

			}

			if (line.duration) {
				result.label += " ( " + line.duration / 1000 + " s )";
			}
			return result;
		},

		showActionSettings(line, node, e) {
			this.stopEvent(e);
			let db = new DomBuilder();
			let popup = db.div(" MatcPadding").build();
			let cntr = db.div("").build(popup);

			let settings = this.$new(ActionSettings);
			settings.setValue(line);
			settings.placeAt(cntr);

			let bar = db.div("MatcButtonBar MatcMarginTop").build(popup);
			let write = db.div("MatcButton MatcButtonPrimary", "Save").build(bar);
			let cancel = db.a("MatcLinkButton", "Cancel").build(bar);
		

			let d = new Dialog({ overflow: true });

			d.own(on(write, touch.press, lang.hitch(this, "setAnimation", d, settings, line)));
			d.own(on(cancel, touch.press, lang.hitch(d, "close")));
			d.own(on(d, "close", () => {
				settings.destroy();
			}));
			d.popup(popup, node);
			this.tempOwn(settings.on("change", lang.hitch(this, "updateLine", line.id)));
		},

		showScreenAnim(d, line, e) {
			this.stopEvent(e);
			d.close();
			this.emit("showScreenAnimation", line);
		},

		setAnimation(d, settings, line, e) {
			this.stopEvent(e);
			d.close();
			this.emit("updateLineByID", line.id, settings.getValue());
		},

		onActionBack() {
			this.emit("newAction", { type: "back" });
		},

		setActionType(action, type) {
			action.type = type
			this.emit("updateAction", action);
		},

		/*******************************************************************
		 *  Variable Action
		 *******************************************************************/
		renderWorkFlowAction(item, db, action) {
			let label = 'Create Formula'
			if (action.steps && action.steps[0]) {
				let step = action.steps[0]
				label = this.getWorkFlowLabel(step)
			}
			let row = db.div('MatcToolbarItem MatcToolbarDropDownButton MatcToolbarFormularLabel', label).build(item)
			this.tempOwn(on(row, touch.press, lang.hitch(this, "showEditWorkflow", action)));
		},

		getWorkFlowLabel(step) {
			let label = 'Edit Formula'

			if (step.operation === 'set') {
				label = `${step.databinding} = ${step.parameter}`
			}

			if (step.operation === 'minus') {
				label = `${step.databinding} = ${step.parameter} -  ${step.parameter2}`
			}

			if (step.operation === 'plus') {
				label = `${step.databinding} = ${step.parameter} + ${step.parameter2}`
			}

			if (step.operation === 'multiply') {
				label = `${step.databinding} = ${step.parameter} * ${step.parameter2}`
			}

			if (step.operation === 'devide') {
				label = `${step.databinding} = ${step.parameter} * ${step.parameter2}`
			}

			if (step.operation === 'increment') {
				label = `${step.databinding} += ${step.parameter}`
			}

			if (step.operation === 'decrement') {
				label = `${step.databinding} -= ${step.parameter}`
			}

			if (step.operation === 'toggle') {
				label = `${step.databinding} = ${step.parameter} ? ${step.parameter2}`
			}

			return label
		},


		onActionWorkflow() {
			this.emit("newAction", { type: "workflow", steps: [] });
		},

		showEditWorkflow(action, e) {


			var db = new DomBuilder();

			this.stopEvent(e);

			var popup = db.div(" MatcPadding").build();

			var cntr = db.div("").build(popup);

			var settings = this.$new(WorkflowSettings);
			settings.setModel(this.model)
			settings.setValue(action);
			settings.placeAt(cntr);


			var bar = db.div("MatcButtonBar MatcMarginTop").build(popup);
			var write = db.div("MatcButton MatcButtonPrimary", "Save").build(bar);
			var cancel = db.a("MatcLinkButton", "Cancel").build(bar);

			var d = new Dialog({ overflow: true });

			d.own(on(write, touch.press, lang.hitch(this, "setActionWorkflow", d, settings, action)));
			d.own(on(cancel, touch.press, lang.hitch(d, "close")));
			d.own(on(d, "close", function () {
				settings.destroy();
			}));
			d.popup(popup, e.target);
		},

		setActionWorkflow(d, settings, action) {
			let updatedAction = settings.getValue()
			action.steps = updatedAction.steps
			this.emit("updateAction", action);
			d.close()
		},

		onActionJS() {
			/**
			 * Show Popup
			 */
			this.emit("newAction", { type: "js" });
		},

		onRemoveAction(action, e) {
			this.stopEvent(e);
			this.emit("removeAction", action);
		},


		onNewLine(e) {
			this.emit("newLine", e);
		},

		onNewTransfromLine(e) {
			this.emit("newTransformLine", e);
		},

		updateLine(id, data) {
			this.emit("updateLineByID", id, data);
		},

		onRemoveLineByID(id) {
			this.emit("removeLineById", id);
		},

		setLinePropertyByID(id, prop, value) {
			this.emit("setLinePropertyByID", id, prop, value);
		},

		onLineTimerByID(id, input) {

			var value = input.value;

			if (this.isNumber(value)) {
				this.emit("setLinePropertyByID", id, "timer", value);
			} else {
				console.warn("onLineTimerByID > Data Warng")
			}
		},

		onLineTimerAndDurationByID(id, input, btn, line) {
			var value = input.value;

			if (line.timer != value) {
				if (this.isNumber(value)) {
					this.emit("setLinePropertyByID", id, "event", "timer");
					this.emit("setLinePropertyByID", id, "timer", value);
				} else {
					console.warn("onLineTimerAndDurationByID > Data Warng")
					btn.hideDropDown();
				}
			} else {
				console.debug("onLineTimerAndDurationByID() > same value, no change");
			}


		},

		isNumber(n) {
			return !isNaN(parseFloat(n)) && isFinite(n);
		},

		onRemoveLine(e) {
			this.emit("removeLine", e);
		},

		onLineValidation(value) {
			var val = { all: value }
			this.emit("setLineProperty", "validation", val);
		},


		onLineHideByID(id, value) {
			this.emit("setLinePropertyByID", id, "hidden", value);
		},

		onLineScrollByID(id, value) {
			this.emit("setLinePropertyByID", id, "scroll", value);
		},


		onLineEventByID(id, value) {
			// FIXME: Copz line and do one change!
			this.emit("setLinePropertyByID", id, "event", value);

			if (value == "swipeLeft") {
				this.emit("setLinePropertyByID", id, "animation", "slideLeft");
				this.emit("setLinePropertyByID", id, "duration", 250);

			} else if (value == "swipeRight") {
				this.emit("setLinePropertyByID", id, "animation", "slideRight");
				this.emit("setLinePropertyByID", id, "duration", 250);

			} else if (value == "swipeUp") {
				this.emit("setLinePropertyByID", id, "animation", "slideUp");
				this.emit("setLinePropertyByID", id, "duration", 250);

			} else if (value == "swipeDown") {
				this.emit("setLinePropertyByID", id, "animation", "slideDown");
				this.emit("setLinePropertyByID", id, "duration", 250);
			}
		},


		getRuleLabel(rule) {

			var lbl = "???";
			var widget = this.model.widgets[rule.widget];
			if (widget) {
				lbl = widget.name + " ";
			} else {
				if (rule.databinding) {
					lbl = '${' + rule.databinding + '}'
				} else {
					if (rule.restResponseStatus === '200') {
						lbl = 'Request OK'
					}
					if (rule.restResponseStatus === '4xx') {
						lbl = 'Request ERROR'
					}
				}
			}


			switch (rule.operator) {
				case "isValid":
					lbl += " is valid";
					break;

				case "checked":
					lbl += " == checked";
					break;

				case "notchecked":
					lbl += " != checked";
					break;

				case "active":
					lbl += " == active";
					break;

				case "notactive":
					lbl += " != active";
					break;

				case "contains":
					lbl += " ~ ";
					break;

				case "==":
					lbl += " == ";
					break;

				case "!=":
					lbl += " != ";
					break;

				case ">":
					lbl += " &gt; ";
					break;

				case "<":
					lbl += " &lt; ";
					break;

				case ">=":
					lbl += " &gt;= ";
					break;

				case "<=":
					lbl += " &lt;= ";
					break;

				default:
					console.warn("getRuleLabel() > not supported operator", rule.operator)
			}

			if (rule.value) {
				lbl += rule.value;
			}


			return lbl;
		},

		onEditRule(line, e) {
			try {
				var db = new DomBuilder();

				this.stopEvent(e);

				var popup = db.div(" MatcDialog MatcPadding").build();

				var cntr = db.div("").build(popup);


				var rule = this.$new(Rule);
				rule.setModel(this.model);
				rule.setScreenIDs(this.getScreenIDs());
				rule.setValue(line);
				rule.placeAt(cntr);

				var bar = db.div("MatcButtonBar MatcMarginTop").build(popup);
				var write = db.div("MatcButton MatcButtonPrimary", "Save").build(bar);
				var cancel = db.a("MatcLinkButton", "Cancel").build(bar);

				var d = new Dialog({ overflow: true });

				d.own(on(write, touch.press, lang.hitch(this, "setRule", d, rule, line)));
				d.own(on(cancel, touch.press, lang.hitch(d, "close")));
				d.own(on(d, "close", function () {
					rule.destroy();
				}));
				d.popup(popup, this.domNode);
			} catch (e) {
				console.error(e);
				console.error(e.stack)
			}

		},

		getScreenIDs() {
			let toLines = []
			if (this.widget) {
				toLines = this.getToLines(this.widget);
			}
			let screenIDs = [];
			for (let i = 0; i < toLines.length; i++) {
				let fromWidgetID = toLines[i].from;
				let fromWidget = this.model.widgets[fromWidgetID];
				if (fromWidget) {
					let screen = this.getParentScreen(fromWidget)
					if (screen) {
						screenIDs.push(screen.id);
					} else {
						console.warn("getScreenIDs() > muito rules not supported.. ");
					}
				} else {
					let screen = this.model.screens[fromWidgetID];
					if (screen) {
						screenIDs.push(screen.id);
					}
				}
			}
			return screenIDs;
		},

		setRule(d, ruleWidget, line) {
			if (ruleWidget.isValid()) {
				var rule = ruleWidget.getValue();
				if (rule) {
					this.setLinePropertyByID(line.id, "rule", rule);
					d.close();
				}
			} else {
				/**
				 * FIXME: Show warning message??
				 */
				d.shake();
			}
		}
	},
	mounted() {
		this.domUtil = new DomUtil()
	}
}
</script>