import lang from 'dojo/_base/lang'
import css from 'dojo/css'
import Logger from 'common/Logger'

import Vue from "vue";

import UIWidget from 'core/widgets/UIWidget'
import CheckBoxWidget from 'core/widgets/CheckBoxWidget'
import RadioBox from 'core/widgets/RadioBox'
import RadioBox2 from 'core/widgets/RadioBox2'
import SwitchWidget from 'core/widgets/SwitchWidget'
import DropDown from 'core/widgets/DropDown'
import TextBox from 'core/widgets/TextBox'
import Password from 'core/widgets/Password'
import TextArea from 'core/widgets/TextArea'
import DragNDrop from 'core/widgets/DragNDrop'
import Spinner from 'core/widgets/Spinner'
import QDate from 'core/widgets/QDate'
import QDateDropDown from 'core/widgets/QDateDropDown'
import HSlider from 'core/widgets/HSlider'
import TableWidget from 'core/widgets/TableWidget'
import SegmentButton from 'core/widgets/SegmentButton'
import ToggleButton from 'core/widgets/ToggleButton'
import LogicOr from 'core/widgets/LogicOr'
import PolyLine from 'core/widgets/PolyLine'
import VolumeSlider from 'core/widgets/VolumeSlider'
import ImageCarousel from 'core/widgets/ImageCarousel'
import Rating from 'core/widgets/Rating'
import IconToggle from 'core/widgets/IconToggle'
import Stepper from 'core/widgets/Stepper'
import MobileDropDown from 'core/widgets/MobileDropDown'
import TypeAheadTextBox from 'core/widgets/TypeAheadTextBox'
import Label from 'core/widgets/Label'
import Chart from 'core/widgets/Chart'
import HoverDropDown from 'core/widgets/HoverDropDown'
import CheckBoxGroup from 'core/widgets/CheckBoxGroup'
import RadioGroup from 'core/widgets/RadioGroup'
import ChatBot from 'core/widgets/ChatBot'
import LabeledIconToggle from 'core/widgets/LabeledIconToggle'
import SVG from 'core/widgets/SVG'
import Sketch from 'core/widgets/Sketch'
import Repeater from 'core/widgets/Repeater'
import Animation from 'core/Animation'
import Core from 'core/Core'
import SymbolService from 'services/SymbolService'

export default class RenderFactory extends Core {

	constructor(mode) {
		super()
		this.logger = new Logger("RenderFactory");
		if (mode) {
			this.mode = mode
		}
		this._labelNodes = {};
		this._widgetNodes = {};
		this._widgetModels = {};
		this._iconNodes = {};
		this._borderNodes = {};
		this._editNodes = {};
		this._uiWidgets = {};
		this._uiWidgetsStates = {};
		this._containerWidgets = {}
		this._scaleX = 1;
		this._scaleY = 1;
		this.hash = null;
		this.logger.log(2, "constructor", "exit > " + this.mode);
	}


	setScaleFactor(x, y) {
		this.logger.log(2, "setScaleFactor", "entry >" + x + " > " + y);
		this._scaleX = x;
		this._scaleY = y;
	}

	setMode(m) {
		this.logger.log(3, "setMode", "entry >" + m);
		this.mode = m;
	}

	setModel(m) {
		this.model = m;
	}

	setZoomedModel (m) {
		this.zoomedModel = m
	}

	setSymbol (isSymbol) {
		this.isSymbol = isSymbol
	}

	createWidgetAnimation(animationEvent) {
		this.logger.log(3, "createWidgetAnimation", "enter");

		var id = animationEvent.id;
		var widget = this.getAnimationWrapper(id);


		if (widget) {


			/**
			 * Calculate the delta to not update unneeded stuff
			 */
			var fromStyle = {};
			var currentStyle = widget.getAnimatedStyle();
			var toStyle = animationEvent.to.style;
			for (var key in toStyle) {
				fromStyle[key] = currentStyle[key];
			}
			animationEvent.from.style = fromStyle;

			var animFactory = new Animation();
			var anim = animFactory.createWidgetAnimation(widget, animationEvent);

			return anim;

		} else {
			console.warn("createWidgetAnimation() > no widget for id ", id)
		}
	}

	/**********************************************************************
	 * Public access methods!
	 **********************************************************************/


	getAnimationWrapper(id) {

		var widget;
		if (this._uiWidgets[id]) {
			widget = this._uiWidgets[id];
			widget.hash = this.hash
		} else {
			var model = this._widgetModels[id];

			if (model) {
				widget = this.$new(UIWidget);
				widget.model = model;
				widget.hash = this.hash
				widget.style = model.style;
				widget._scaleX = this._scaleX;
				widget._scaleY = this._scaleY;

				var div = this._widgetNodes[id];
				widget._backgroundNodes = [div];
				widget._paddingNodes = [div];
				widget._shadowNodes = [div];
				widget.domNode = div;
				var border = this._borderNodes[id];
				if (border) {
					widget._borderNodes = [border];
					widget._backgroundNodes = [border];
					widget._paddingNodes = [border];
				}
				this._uiWidgets[id] = widget;
			} else {
				console.warn("getAnimationWrapper() > no model for id ", id)
			}
		}
		return widget;
	}


	getAllUIWidgets() {
		return this._uiWidgets;
	}

	getUIWidget(widget) {
		return this._uiWidgets[widget.id];
	}

	getUIWidgetByID(id) {
		return this._uiWidgets[id];
	}

	getWidgetNodeByID(id) {
		return this._widgetNodes[id];
	}

	getLabelNode(model) {
		if (this._uiWidgets[model.id]) {
			return this._uiWidgets[model.id].getLabelNode();
		}
		return this._labelNodes[model.id];
	}

	getLabelNodeById(id) {
		if (this._uiWidgets[id]) {
			return this._uiWidgets[id].getLabelNode();
		}
		return this._labelNodes[id];
	}


	getEditNode(model) {
		return this._editNodes[model.id];
	}

	/**
	 * Resizes a widget
	 * @param {String} id
	 * @param {Position} pos
	 */
	resize(id, pos) {
		var uiWidget = this.getUIWidgetByID(id);
		if (uiWidget) {
			uiWidget.resize(pos);
		} else {
			/**
			 * Images and Icons are sized according to the box dimensions.
			 */
			var widget = this.model.widgets[id];
			if (widget && "Icon" == widget.type) {
				let m = lang.clone(widget);
				m.h = pos.h;
				this._set_icon(null, widget.style, m);
			}
			if (widget && "Image" == widget.type) {
				if (widget.style.backgroundPosition) {
					let m = lang.clone(widget);
					m.h = pos.h;
					m.w = pos.w;
					var div = this.getWidgetNodeByID(widget.id);
					if (div) {
						this._set_backgroundImage(div, widget.style, m);
					}
				}
			}
		}
	}

	/**
	 * Method which will update all container
	 * widgets with the latest version. The createInheretidMethod()
	 * has before updated the children[] list.
	 * @param {inheritedModel} model
	 */
	updatePositions (model) {
		for (let id in this._containerWidgets){
			let uiWidget = this._containerWidgets[id];
			let widget = model.widgets[id];
			if (uiWidget && widget) {
				uiWidget.setZoomedModel(model);
				uiWidget.update(widget)
			}
		}
	}

	updateContainerChild (child, model) {
		if (this._containerWidgets[child.container]) {
			let uiWidget = this._containerWidgets[child.container]
			let widget = model.widgets[child.container];
			if (uiWidget && widget) {
				uiWidget.setZoomedModel(model);
				uiWidget.update(widget)
			}
		}
	}

	/**********************************************************************
	 * Create Method -  The creation of the dom elements
	 **********************************************************************/

	createUIWidget(parent, model) {
		this.createWidgetHTML(parent, model);
		return this._uiWidgets[model.id];
	}

	$new (cls) {
		var ComponentClass = Vue.extend(cls);
		var instance = new ComponentClass();
		instance.mode = this.mode
		instance.$mount(); // pass nothing
		return instance;
	}


	createWidgetHTML(parent, model) {


		css.add(parent, "MatchWidgetType" + model.type);

		/**
		 * deledate to special rendering method for each widget
		 */
		if (this["_create" + model.type]) {
			this["_create" + model.type](parent, model);
			this._widgetNodes[model.id] = parent;
			this._widgetModels[model.id] = model;
		} else {
			let cls = SymbolService.getWidgetClass(model.type)
			if (cls) {
				this.createWidgetByClass(parent, model, cls)
			} else {
				console.warn("No render method for", model.type);
			}
		}

		/**
		 * now add style for non ui widgets
		 */
		this.setStyle(parent, model);

		if (this._uiWidgets[model.id]) {
			var w = this._uiWidgets[model.id];

			if (this.mode == "simulator") {
				w.wireEvents();
			}
			/**
			 * In case of player or simulator set previews status
			 */
			if (this.mode == "simulator" || this.mode == "view") {

				if (model.inherited) {
					var orgModel = this.model.widgets[model.inherited];
					if (orgModel) {
						if (this._uiWidgetsStates[orgModel.id] != null && this._uiWidgetsStates[orgModel.id] != undefined) {
							w.setState(this._uiWidgetsStates[orgModel.id]);
							this.emit("uiWidgetInit", {
								state: this._uiWidgetsStates[orgModel.id],
								id: model.id
							});
						}
					}

				} else {
					if (this._uiWidgetsStates[model.id] != null && this._uiWidgetsStates[model.id] != undefined) {
						if (model.props && model.props.ignoreStateOnPageLoad) {
							this.logger.log(-1, "createWidgetHTML", "Ingore state for " + model.id);
						} else {
							w.setState(this._uiWidgetsStates[model.id]);
						}
					}
				}
			}
		}
	}

	createWidgetByClass (parent, model, cls) {
		console.debug('createWidgetByClass', model.type)
		var checkBox = this.$new(cls);
		checkBox.placeAt(parent);
		this._uiWidgets[model.id] = checkBox;
	}

	_createRepeater (parent, model) {
		var repeater = this.$new(Repeater);
		repeater.placeAt(parent);
		/**
		 * In the simulator the zoomedModel is not set,
		 * but the modle will do too
		 */
		if (this.zoomedModel){
			repeater.setZoomedModel(this.zoomedModel)
		} else {
			repeater.setZoomedModel(this.model)
		}
		repeater.setSymbol(this.isSymbol)
		this._uiWidgets[model.id] = repeater;
		this._containerWidgets[model.id] = repeater;
	}

	_createCheckBox (parent, model) {
		var checkBox = this.$new(CheckBoxWidget);
		checkBox.placeAt(parent);
		this._uiWidgets[model.id] = checkBox;
	}

	_createCheckBoxGroup(parent, model) {
		var checkBox = this.$new(CheckBoxGroup);
		checkBox.placeAt(parent);
		this._uiWidgets[model.id] = checkBox;
	}

	_createRadioBox(parent, model) {
		var widget = this.$new(RadioBox);
		widget.placeAt(parent);
		this._uiWidgets[model.id] = widget;
	}

	_createRadioBox2(parent, model) {
		var widget = this.$new(RadioBox2);
		widget.placeAt(parent);
		this._uiWidgets[model.id] = widget;
	}

	_createRadioGroup(parent, model) {
		var widget = this.$new(RadioGroup);
		widget.placeAt(parent);
		this._uiWidgets[model.id] = widget;
	}

	_createChatBot(parent, model) {
		var widget = this.$new(ChatBot);
		widget.setMode(this.mode)
		widget.placeAt(parent);
		this._uiWidgets[model.id] = widget;
	}

	_createSketch(parent, model) {
		var widget = this.$new(Sketch);
		widget.placeAt(parent);
		this._uiWidgets[model.id] = widget;
	}

	_createSVG(parent, model) {
		var widget = this.$new(SVG);
		widget.placeAt(parent);
		this._uiWidgets[model.id] = widget;
	}

	_createDragNDrop(parent, model) {
		var widget = this.$new(DragNDrop);
		widget.placeAt(parent);
		this._uiWidgets[model.id] = widget;
	}

	_createIconToggle(parent, model) {
		var widget = this.$new(IconToggle);
		widget.placeAt(parent);
		this._uiWidgets[model.id] = widget;
	}

	_createLabeledIconToggle(parent, model) {
		var widget = this.$new( LabeledIconToggle);
		widget.placeAt(parent);
		this._uiWidgets[model.id] = widget;
	}

	_createStepper(parent, model) {
		var widget = this.$new(Stepper)
		widget.factory = this
		widget.placeAt(parent);
		this._uiWidgets[model.id] = widget;
	}

	_createLogicOr(parent, model) {
		css.add(parent, "MatcLogic");
		var widget = this.$new(LogicOr);
		widget.placeAt(parent);
		this._uiWidgets[model.id] = widget;
	}

	_createTable(parent, model) {
		var widget = this.$new(TableWidget);
		widget.placeAt(parent);
		this._uiWidgets[model.id] = widget;
	}

	_createBarChart(parent, model) {
		var widget = this.$new(Chart)
		widget.type = "bar"
		widget.placeAt(parent);
		this._uiWidgets[model.id] = widget;
	}

	_createRingChart(parent, model) {
		var widget = this.$new(Chart)
		widget.type = "ring"
		widget.placeAt(parent);
		this._uiWidgets[model.id] = widget;
	}

	_createPieChart(parent, model) {
		var widget = this.$new(Chart)
		widget.type = "pie"
		widget.placeAt(parent);
		this._uiWidgets[model.id] = widget;
	}

	_createMultiRingChart(parent, model) {
		var widget = this.$new(Chart)
		widget.type =  "multiring";
		widget.placeAt(parent);
		this._uiWidgets[model.id] = widget;
	}


	_createVolumeSlider(parent, model) {
		var widget = this.$new(VolumeSlider);
		widget.placeAt(parent);
		this._uiWidgets[model.id] = widget;
	}

	_createPolyLine(parent, model) {
		var widget = this.$new(PolyLine);
		widget.placeAt(parent);
		this._uiWidgets[model.id] = widget;
	}

	_createSegmentButton(parent, model) {
		var widget = this.$new(SegmentButton);
		widget.placeAt(parent);
		this._uiWidgets[model.id] = widget;
	}

	_createTypeAheadTextBox(parent, model) {
		var widget = this.$new(TypeAheadTextBox)
		widget.mode = this.mode
		widget.placeAt(parent);
		this._uiWidgets[model.id] = widget;
	}

	_createImageCarousel(parent, model) {
		var widget = this.$new( ImageCarousel)
		widget.hash = this.hash
		widget.mode = this.mode
		widget.factory = this.factory
		widget.placeAt(parent);
		this._uiWidgets[model.id] = widget;
	}

	_createToggleButton(parent, model) {
		var widget = this.$new(ToggleButton);
		widget.placeAt(parent);
		this._uiWidgets[model.id] = widget;
	}
	_createSwitch(parent, model) {
		var widget = this.$new(SwitchWidget);
		widget.placeAt(parent);
		this._uiWidgets[model.id] = widget;
	}

	_createDropDown(parent, model) {
		var widget = this.$new(DropDown)
		widget.factory = this;
		widget.placeAt(parent);
		this._uiWidgets[model.id] = widget;
	}

	_createHoverDropDown(parent, model) {
		var widget = this.$new(HoverDropDown)
		widget.factory = this;
		widget.placeAt(parent);
		this._uiWidgets[model.id] = widget;
	}


	_createMobileDropDown(parent, model) {
		var widget = this.$new(MobileDropDown);
		widget.factory = this;
		widget.mode = this.mode;
		widget.placeAt(parent);
		this._uiWidgets[model.id] = widget;
	}

	_createHSlider(parent, model) {
		var widget = this.$new(HSlider);
		widget.placeAt(parent);
		this._uiWidgets[model.id] = widget;
	}

	_createTextBox(parent, model) {
		var widget = this.$new(TextBox);
		widget.mode = this.mode
		widget.placeAt(parent);
		this._uiWidgets[model.id] = widget;
	}

	_createRating(parent, model) {
		var widget = this.$new(Rating);
		widget.placeAt(parent);
		this._uiWidgets[model.id] = widget;
	}


	_createDate(parent, model) {
		var widget = this.$new(QDate);
		widget.mode = this.mode
		widget.placeAt(parent);
		this._uiWidgets[model.id] = widget;
		return widget;
	}

	_createPassword(parent, model) {
		var widget = this.$new(Password);
		widget.mode = this.mode;
		widget.placeAt(parent);
		this._uiWidgets[model.id] = widget;
	}

	_createDateDropDown(parent, model) {
		var widget = this.$new(QDateDropDown)
		widget.mode = this.mode
		widget.placeAt(parent);
		this._uiWidgets[model.id] = widget;
	}

	_createTextArea(parent, model) {
		var widget = this.$new(TextArea)
		widget.mode = this.mode;
		widget.placeAt(parent);
		this._uiWidgets[model.id] = widget;
	}

	_createSpinner(parent, model) {
		var widget = this.$new(Spinner)
		widget.mode = this.mode
		widget.placeAt(parent);
		this._uiWidgets[model.id] = widget;
	}

	_createScreen() {

	}

	_createButton(parent, model) {
		css.add(parent, "MatcEventedWidget");
		var border = this._createBorder(parent, model);
		this._createInlineEdit(border, model);
	}

	_createBox(parent, model) {
		var border = this._createBorder(parent, model);

		/**
		 * FIXME: Make this smart.
		 */
		return border;
	}


	_createLabel(parent, model) {
		var widget = this.$new(Label);
		widget.placeAt(parent);
		this._uiWidgets[model.id] = widget;
		//this._createInlineEdit(parent, model);
	}

	_createImage(parent, model) {
		//css.add(parent, "MatcEventedWidget");
		if (model.style.backgroundImage) {
			css.remove(parent, "MatchWidgetTypeImage");
		} else {
			var span = document.createElement("span");
			css.add(span, "glyphicon glyphicon-picture");
		}
	}


	_createIcon(parent, model) {
		//css.add(parent, "MatcEventedWidget");
		var border = this._createBorder(parent, model);
		var icon = document.createElement("span");
		this._iconNodes[model.id] = icon;
		border.appendChild(icon);
	}

	_createHotSpot(parent) {
		css.add(parent, "MatcEventedWidget");
	}


	_createInlineEdit(parent, model) {
		//this.logger.log(5,"_createInlineEdit", "entry > " +  this.mode);
		var inlineEdit = document.createElement("div");
		css.add(inlineEdit, "MatcInlineEditable");
		this._labelNodes[model.id] = inlineEdit;
		if (!model.props.label) {
			/**
			 * Show default label in edit mode!
			 */
			if (this.mode == "edit") {
				this.setInnerHTML(inlineEdit, "");
			}
		} else {
			this.setInnerHTML(inlineEdit, model.props.label);
		}
		parent.appendChild(inlineEdit);
		return inlineEdit;
	}

	_createBorder(parent, model) {
		var border = document.createElement("div");
		css.add(border, "MatcBorderNode");
		parent.appendChild(border);
		this._borderNodes[model.id] = border;
		return border;
	}


	/**********************************************************************
	 * CSS related methods!
	 **********************************************************************/


	setStyle(parent, model) {
		var style = this.getStyle(model, parent);
		if (style) {
			if (!this._uiWidgets[model.id]) {
				style = this.getStyle(model, parent);
				if (style) {
					for (var p in style) {
						/**
						 * check if we have a special function for
						 * the property
						 */
						if (this["_set_" + p]) {
							this["_set_" + p](parent, style, model);
						} else {
							if (style[p] != null) {
								parent.style[p] = style[p];
							} else {
								console.warn("The style", p, " is no value!", model);
							}
						}
					}
				}
			} else {
				try {
					var w = this._uiWidgets[model.id];
					w.isSimulator = this.mode == "simulator"
					w.setFactory(this);
					w.render(model, style, this._scaleX, this._scaleY);
				} catch (e) {
					this.logger.error("setStyle", "Error", e);
				}
			}
		}

		/**
		 * FIXME: add some marker for invissible elements
		 */
	}

	_set_fixed() {
		// do nothing implement in Simulator.createBox()
	}


	_set_icon(parent, style, model) {

		var icon = this._iconNodes[model.id];

		if (icon) {
			var height = model.h;
			if (style.borderTopWidth) {
				height -= this.getZoomed(style.borderTopWidth, this._scaleY);
			}
			if (style.borderBottomWidth) {
				height -= this.getZoomed(style.borderBottomWidth, this._scaleY);
			}

			/**
			 * Reset icon???
			 */
			icon.className = style.icon;
			icon.style.fontSize = height + "px";
		}
	}

	_set_fontSize(parent, style) {
		var size = (style.fontSize * this._scaleX);
		if (this._scaleX < 1) {
			size = size * 0.95;
		}
		parent.style.fontSize = size + "px";
	}

	_set_rotate(parent, style,) {
		var trans = "rotate(" + Math.round(style.rotate) + "deg)";
		parent.style.transform = trans;
		parent.style.webkitTransform = trans;
		parent.style.transformOrigin = "50% 50%";
		parent.style.webkitTransformOrigin = "50% 50%";
	}

	_set_boxShadow(parent, style, model) {
		var shadow = style.boxShadow;

		var node = this._borderNodes[model.id];
		if (node) {
			parent = node;
		}
		if (shadow) {
			var v = this.getZoomed(shadow.v, this._scaleY);
			var h = this.getZoomed(shadow.h, this._scaleX);
			var b = this.getZoomed(shadow.b, Math.max(this._scaleY, this._scaleX));
			var s = this.getZoomed(shadow.s, Math.max(this._scaleY, this._scaleX));
			var inset = shadow.i ? "inset" : "";
			parent.style.boxShadow = h + "px " + v + "px " + b + "px " + s + "px " + shadow.c + " " + inset;

		} else {
			parent.style.boxShadow = "none";
		}
	}

	_set_textShadow(parent, style) {
		var shadow = style.textShadow;
		if (shadow) {
			var v = this.getZoomed(shadow.v, this._scaleY);
			var h = this.getZoomed(shadow.h, this._scaleX);
			var b = this.getZoomed(shadow.b, Math.max(this._scaleY, this._scaleX));
			parent.style.textShadow = h + "px " + v + "px " + b + "px " + shadow.c;
		} else {
			parent.style.textShadow = "none";
		}
	}

	_set_valign(parent, style, model) {

		if (this._labelNodes[model.id]) {
			var node = this._labelNodes[model.id];
			var valign = style.valign;
			css.remove(node, "MatcWidgeValignMiddle MatcWidgeValignBottom")
			if (valign == "middle") {
				css.add(node, "MatcWidgeValignMiddle");
			}
			if (valign == "bottom") {
				css.add(node, "MatcWidgeValignBottom");
			}

			/**
			 * We would have to fix other alignment to :-(
			 */
		}
	}


	_set_borderStyle(parent, style, model) {
		var node = this._borderNodes[model.id];
		if (!node) {
			node = parent;
		}
		node.style.borderStyle = style.borderStyle;
	}

	_set_borderTopWidth(parent, style, model) {
		var node = this._borderNodes[model.id];
		if (!node) {
			node = parent;
		}
		var w = this._getBorderWidth(style.borderTopWidth);
		node.style.borderTopWidth = w + "px";
	}

	_set_borderBottomWidth(parent, style, model) {
		var node = this._borderNodes[model.id];
		if (!node) {
			node = parent;
		}
		var w = this._getBorderWidth(style.borderBottomWidth);
		node.style.borderBottomWidth = w + "px";
	}

	_set_borderLeftWidth(parent, style, model) {
		var node = this._borderNodes[model.id];
		if (!node) {
			node = parent;
		}
		var w = this._getBorderWidth(style.borderLeftWidth);
		node.style.borderLeftWidth = w + "px";
	}

	_set_borderRightWidth(parent, style, model) {
		var node = this._borderNodes[model.id];
		if (!node) {
			node = parent;
		}
		var w = this._getBorderWidth(style.borderRightWidth);
		node.style.borderRightWidth = w + "px";
	}


	/**
	 * Border radius
	 */

	_set_borderRadius(parent, style, model) {
		var node = this._borderNodes[model.id];
		if (!node) {
			node = parent;
		}
		var w = this.getZoomed(style.borderRadius, this._scaleX) + "px";
		node.style.borderRadius = w;
		parent.style.borderRadius = w;
	}

	_set_borderTopLeftRadius(parent, style, model) {
		var node = this._borderNodes[model.id];
		if (!node) {
			node = parent;
		}
		var w = this._getBorderWidth(style.borderTopLeftRadius) + "px";
		node.style.borderTopLeftRadius = w;
		parent.style.borderTopLeftRadius = w;
	}

	_set_borderTopRightRadius(parent, style, model) {
		var node = this._borderNodes[model.id];
		if (!node) {
			node = parent;
		}
		var w = this._getBorderWidth(style.borderTopRightRadius) + "px";
		node.style.borderTopRightRadius = w;
		parent.style.borderTopRightRadius = w;
	}

	_set_borderBottomLeftRadius(parent, style, model) {
		var node = this._borderNodes[model.id];
		if (!node) {
			node = parent;
		}
		var w = this._getBorderWidth(style.borderBottomLeftRadius) + "px";
		node.style.borderBottomLeftRadius = w;
		parent.style.borderBottomLeftRadius = w;
	}

	_set_borderBottomRightRadius(parent, style, model) {
		var node = this._borderNodes[model.id];
		if (!node) {
			node = parent;
		}
		var w = this._getBorderWidth(style.borderBottomRightRadius) + "px";
		node.style.borderBottomRightRadius = w;
		parent.style.borderBottomRightRadius = w;
	}


	/**
	 * color
	 */

	_set_borderColor(parent, style, model) {
		var node = this._borderNodes[model.id];
		if (!node) {
			node = parent;
		}
		node.style.borderColor = style.borderColor;
	}

	_set_borderTopColor(parent, style, model) {
		var node = this._borderNodes[model.id];
		if (!node) {
			node = parent;
		}
		node.style.borderTopColor = style.borderTopColor;
	}

	_set_borderBottomColor(parent, style, model) {
		var node = this._borderNodes[model.id];
		if (!node) {
			node = parent;
		}
		node.style.borderBottomColor = style.borderBottomColor;
	}

	_set_borderRightColor(parent, style, model) {
		var node = this._borderNodes[model.id];
		if (!node) {
			node = parent;
		}
		node.style.borderRightColor = style.borderRightColor;
	}

	_set_borderLeftColor(parent, style, model) {
		var node = this._borderNodes[model.id];
		if (!node) {
			node = parent;
		}
		node.style.borderLeftColor = style.borderLeftColor;
	}

	_set_borderTopStyle(parent, style, model) {
		var node = this._borderNodes[model.id];
		if (!node) {
			node = parent;
		}
		node.style.borderTopStyle = style.borderTopStyle;
	}

	_set_borderBottomStyle(parent, style, model) {
		var node = this._borderNodes[model.id];
		if (!node) {
			node = parent;
		}
		node.style.borderBottomStyle = style.borderBottomStyle;
	}

	_set_borderRightStyle(parent, style, model) {
		var node = this._borderNodes[model.id];
		if (!node) {
			node = parent;
		}
		node.style.borderRightStyle = style.borderRightStyle;
	}

	_set_borderLeftStyle(parent, style, model) {
		var node = this._borderNodes[model.id];
		if (!node) {
			node = parent;
		}
		node.style.borderLeftStyle = style.borderLeftStyle;
	}


	/**
	 * vertical align
	 */
	_set_verticalAlign(parent, style, model) {
		var label = this.getLabelNode(model);
		if (label) {
			// reset class.. this is a little hacky! We should not do this too often!
			label.className = "MatcInlineEditable";
			if (style.textAlign) {
				css.add(label, "MatcInlineEditVAlign-" + style.verticalAlign + "-" + style.textAlign);
			} else {
				css.add(label, "MatcInlineEditVAlign-" + style.verticalAlign);
			}
		}
	}


	/**
	 * padding
	 */
	_setScalledPadding(key, parent, style, model) {
		var node = this._borderNodes[model.id];
		if (!node) {
			node = parent;
		}
		if (style[key] < 0) {
			node.style[key] = "0px";
		} else {
			var w = this._getBorderWidth(style[key]);
			node.style[key] = w + "px";
		}
	}




	_set_paddingTop(parent, style, model) {
		this._setScalledPadding("paddingTop", parent, style, model);
	}

	_set_paddingLeft(parent, style, model) {
		this._setScalledPadding("paddingLeft", parent, style, model);
	}

	_set_paddingRight(parent, style, model) {
		this._setScalledPadding("paddingRight", parent, style, model);
	}

	_set_paddingBottom(parent, style, model) {
		this._setScalledPadding("paddingBottom", parent, style, model);
	}

	/**
	 * padding
	 */
	_set_opacity(parent, style) {

		/**
		 * Invisible elements should let clicks through...
		 */
		if (style.opacity === 0) {
			css.add(parent, "MatcHidden");
		} else {
			css.remove(parent, "MatcHidden");
		}
		if (style.opacity <= 1) {
			parent.style.opacity = style.opacity;
		}


	}

	_set_disabled(parent, style) {
		if (style.disabled) {

			parent.disabled = true;
			console.debug("_set_disabled", parent.disabled)
		}

	}

	/**
	 * background image
	 */
	_set_background(parent, style, model) {
		var node = this._borderNodes[model.id];
		if (node) {
			parent = node;
		}
		var background = style.background;
		if (background && background.colors) {
			var value = "(" + background.direction + "deg";
			for (var i = 0; i < background.colors.length; i++) {
				var color = background.colors[i];
				value += "," + color.c + " " + color.p + "% ";
			}
			value + ");";
			parent.style.background = "linear-gradient" + value;
			parent.style.background = "-webkit-linear-gradient" + value;
		} else {
			parent.style.backgroundColor = style.background;
		}
	}


	_set_backgroundPosition() {

	}

	_set_backgroundSize() {

	}

	/**
	 * background image
	 */
	_set_backgroundImage(parent, style, model) {

		var node = this._borderNodes[model.id];
		if (node) {
			parent = node;
		}

		var img = style.backgroundImage;
		css.add(parent, "MatcScreenImage");
		if (img) {
			if (img.w > img.h) {
				css.add(parent, "MatcScreenImageHorizontal");
			} else {
				css.add(parent, "MatcScreenImageVertical");
			}
			if (this.hash) {
				parent.style.backgroundImage = "url(/rest/images/" + this.hash + "/" + img.url + ")";
			} else {
				var url = "url(/rest/images/" + img.url + ")";
				parent.style.backgroundImage = url;
			}

			if (style.backgroundSize) {
				parent.style.backgroundSize = style.backgroundSize + "%";
			} else {
				parent.style.backgroundSize = "100%"; // 100%
			}

			if (style.backgroundPosition) {
				var pos = style.backgroundPosition;
				parent.style.backgroundPosition = Math.round(pos.left * model.w) + "px " + Math.round(pos.top * model.h) + "px";
			} else {
				parent.style.backgroundPosition = "0 0"; // 100%
			}


			parent.style.backgroundRepeat = "no-repeat";
		} else {
			/**
			 * Images get a placeholder x... mixture of canvas and css border
			 * to make crisp image... We make to background image 2x larger
			 * so the browser can smooth a little too
			 */
			if (model.type == "Image") {
				var w = model.w * 2;
				var h = model.h * 2;
				var c = document.createElement("canvas");
				var context = c.getContext("2d");
				c.width = w;
				c.height = h;
				h += 0.5;
				w += 0.5;
				var n = 0.5;
				context.moveTo(n, n);
				context.lineTo(w, h);
				context.moveTo(w, n);
				context.lineTo(n, h);
				context.strokeStyle = "#333";
				context.strokeWidth = 2;
				context.imageSmoothingEnabled = false;
				context.stroke();
				parent.style.backgroundImage = "url(" + c.toDataURL("image/png") + ")";
				parent.style.border = "1px solid #777";
			}

		}

	}


	_set_css(parent, style) {
		css.add(parent, style.css);
	}



	_set_letterSpacing(parent, style) {
		parent.style.letterSpacing = (style.letterSpacing * this._scaleX) + "px";
	}

	/**********************************************************************
	 * helper methods!
	 **********************************************************************/



	_getBorderWidth(w) {
		if (w > 0) {
			return Math.max(1, this.getZoomed(w, this._scaleX));
		}
		return 0;
	}


	_defaultRendering(p) {
		return p != "fontSize" && p.indexOf("border") < 0 && p != "backgroundImage";
	}

	cleanUp() {
		this.logger.log(2, "cleanUp", "entry");


		if (!this._widgetsToDestroy) {
			this._widgetsToDestroy = [];
		}
		for (var id in this._uiWidgets) {
			var w = this._uiWidgets[id];

			/**
			 * In simulator mode we store the state and do not destroy the widgets,
			 * because the should be shown in the simualror
			 */
			if (this.mode == "simulator" || this.mode == "view") {
				var widget = this.model.widgets[id];

				/**
				 * if the widget is inherited, use the id of the parent
				 * to make sure the field has every where the same value
				 */
				if (widget && widget.inherited) {
					id = widget.inherited;
				}
				this._uiWidgetsStates[id] = w.getState();
				w.beforeDestroy();

				/**
				 * destroy later (after animas are done)
				 */
				this._widgetsToDestroy.push(w);

			} else {
				w.destroy();
			}

		}

		this._labelNodes = {};
		this._borderNodes = {};
		this._editNodes = {};
		this._uiWidgets = {};
		this._widgetNodes = {};
		this._containerWidgets = {}
	}


	destroyWidgets() {
		this.logger.log(2, "destroyWidgets", "enter > ");
		if (this._widgetsToDestroy) {
			for (var i = 0; i < this._widgetsToDestroy.length; i++) {
				this._widgetsToDestroy[i].destroy();
			}
		}
		delete this._widgetsToDestroy;
	}
}