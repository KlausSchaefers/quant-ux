import lang from 'dojo/_base/lang'
import css from 'dojo/css'
import Logger from 'common/Logger'

import Vue from "vue";

import UIWidget from 'core/widgets/UIWidget'
import CheckBoxWidget from 'core/widgets/CheckBoxWidget'
import RadioBox from 'core/widgets/RadioBox'
import RadioBox2 from 'core/widgets/RadioBox2'
import SwitchWidget from 'core/widgets/SwitchWidget'
import Button from 'core/widgets/Button'
import DropDown from 'core/widgets/DropDown'
import TextBox from 'core/widgets/TextBox'
import Password from 'core/widgets/Password'
import TextArea from 'core/widgets/TextArea'
import DragNDrop from 'core/widgets/DragNDrop'
import DragNDropTarget from 'core/widgets/DragNDropTarget'
import Spinner from 'core/widgets/Spinner'
import QDate from 'core/widgets/QDate'
import QDateDropDown from 'core/widgets/QDateDropDown'
import HSlider from 'core/widgets/HSlider'
import TableWidget from 'core/widgets/TableWidget'
import SegmentButton from 'core/widgets/SegmentButton'
import SegmentPicker from 'core/widgets/SegmentPicker'
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
import LabeledIconToggle from 'core/widgets/LabeledIconToggle'
import Rest from 'core/widgets/Rest'
import Vector from 'core/widgets/Vector'
import Sketch from 'core/widgets/Sketch'
import Repeater from 'core/widgets/Repeater'
import Upload from 'core/widgets/Upload'
import UploadPreview from 'core/widgets/UploadPreview'
import WebLink from 'core/widgets/WebLink'
import ProgressBar from 'core/widgets/ProgressBar'
import ScreenSegment from 'core/widgets/ScreenSegment'
import LockSlider from 'core/widgets/LockSlider'
import Script from 'core/widgets/Script'
import IconToggleButton from 'core/widgets/IconToggleButton'
import IFrameWidget from 'core/widgets/IFrameWidget'
import ProgessSegments from 'core/widgets/ProgessSegments'
import ImagePaging from 'core/widgets/ImagePaging'
import LabeledRadioBox from 'core/widgets/LabeledRadioBox'
import LabeledCheckBox from 'core/widgets/LabeledCheckBox'
import LabeledTextBox from 'core/widgets/LabeledTextBox'
import LabeledTextArea from 'core/widgets/LabeledTextArea'
import Navigation from 'core/widgets/Navigation'
import NavMenu from 'core/widgets/NavMenu'
import SVGIcon from 'core/widgets/SVGIcon'

import CountingStepper from 'core/widgets/CountingStepper'
import Tree from 'core/widgets/Tree'
import IconButton from 'core/widgets/IconButton'
import Paging from 'core/widgets/Paging'
import Timeline from 'core/widgets/Timeline'
import SVGBox from 'core/widgets/SVGBox'
import SVGPaths from 'core/widgets/SVGPaths'
import VisualPicker from 'core/widgets/VisualPicker'
import SortableList from 'core/widgets/SortableList'
import RadioTable from 'core/widgets/RadioTable'

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
		this._imageNodes = {};
		this._borderNodes = {};
		this._editNodes = {};
		this._uiWidgets = {};
		this._uiWidgetsStates = {};
		this._containerWidgets = {}
		this._scaleX = 1;
		this._scaleY = 1;
		this._componentClassCache = {}
		this.hash = null;
		this.isPublic = false
		this.styleKeysForResize = [
			'fontSize',
			"borderTopLeftRadius", "borderTopRightRadius", "borderBottomRightRadius", "borderBottomLeftRadius",
			"borderTopWidth", "borderRightWidth", "borderBottomWidth", "borderLeftWidth",
			'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
			'boxShadow', 'textShadow', 'letterSpacing', 'icon', 'backgroundImage']
		this.logger.log(2, "constructor", "exit > " + this.mode);
	}


	setScaleFactor(x, y) {
		this.logger.log(2, "setScaleFactor", "entry >" + x + " > " + y);
		this._scaleX = x;
		this._scaleY = y;
	}

	setPublic (p) {
		this.logger.log(3, "setPublic", "enter", p);
		this.isPublic = p
	}

	setHash (h) {
		this.logger.log(1, "setHash", "enter");
		this.hash = h
	}

	setJwtToken (t) {
		this.logger.log(1, "setJwtToken", "enter");
		this.jwtToken = t
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
			widget.jwtToken = this.jwtToken

		} else {
			var model = this._widgetModels[id];

			if (model) {
				widget = this.$new(UIWidget);

				widget._isAnimWrapper = true
				widget.model = model;
				widget.hash = this.hash
				widget.jwtToken = this.jwtToken

				widget.style = model.style;
				widget._scaleX = this._scaleX;
				widget._scaleY = this._scaleY;

				var div = this._widgetNodes[id];
				widget._backgroundNodes = [div];
				widget._paddingNodes = [div];
				widget._shadowNodes = [div];
				widget._iconNodes = [this._iconNodes[id]]
				widget._imageNodes = [this._imageNodes[id]]
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
			const uiWidget = this._containerWidgets[id];
			const widget = model.widgets[id];
			if (uiWidget && widget) {
				try {
					uiWidget.setZoomedModel(model);
					uiWidget.update(widget)
				} catch (err){
					this.logger.error('updatePositions', 'Cannot render', + widget?.type)
					this.logger.sendError(err)
				}
			}
		}
	}

	/**
	 * Repeater can rerender its childnre
	 */
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

	updateSegementChild (widget, model) {
		for (let i=0; i< widget.segmentParent.length; i++){
			let parentID = widget.segmentParent[i]
			let uiWidget = this.getUIWidgetByID(parentID)
			if (uiWidget) {
				uiWidget.setZoomedModel(model);
				uiWidget.updateChild(widget)
			}
		}
	}

	updateWidgetHTML (parent, model) {
		this.setStyle(parent, model, true, false);
	}

	reizeWidgetHTML (parent, model) {
		/**
		 * Add here a list of props to be resized, e.g. borderwidth but not color
		 */
		this.setStyle(parent, model, true, true);
	}

	updateLabel (widget) {
		const uiWidget = this.getUIWidgetByID(widget.id);
		if (!uiWidget) {
			let node = this._labelNodes[widget.id]
			if (node) {
				this.setInnerHTML(node, widget.props.label)
			}
		}
	}

	updateWidget(widget) {
		let parent = this._widgetNodes[widget.id];
		if (parent) {
			this.setStyle(parent, widget, true, false);
		}
		const uiWidget = this.getUIWidgetByID(widget.id);
		if (!uiWidget) {
			const labelNode = this._labelNodes[widget.id]
			if (labelNode) {
				this.setInnerHTML(labelNode, widget.props.label)
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
		const ComponentClass = Vue.extend(cls);
		const instance = new ComponentClass();
		instance.mode = this.mode
		instance.$mount(); // pass nothing
		/**
		 * We have to set the JWT token!
		 */
		instance.setJwtToken(this.jwtToken)
		instance.hash = this.hash
		instance.setPublic(this.isPublic)
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
		this.setStyle(parent, model, false);

		if (this._uiWidgets[model.id]) {
			const w = this._uiWidgets[model.id];
			if (this.mode == "simulator") {
				try {
					w.wireEvents();
					w.onSimulatoStarted()
				} catch (err) {
					this.logger.error("createWidgetHTML", "Could not wire events for " + w.type);
					this.logger.sendError(err)
				}
			}
			/**
			 * In case of player or simulator set previews status
			 */
			if (this.mode == "simulator" || this.mode == "view") {
				if (model.inherited) {
					const orgModel = this.model.widgets[model.inherited];
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
		const checkBox = this.$new(cls);
		checkBox.placeAt(parent);
		this._uiWidgets[model.id] = checkBox;
	}

	_createScreenSegment (parent, model) {
		const segement = this.$new(ScreenSegment)
		segement.placeAt(parent);
		/**
		 * In the simulator the zoomedModel is not set,
		 * but the modle will do too
		 */
		if (this.zoomedModel){
			segement.setZoomedModel(this.zoomedModel)
		} else {
			segement.setZoomedModel(this.model)
		}
		segement.setSymbol(this.isSymbol)

		this._uiWidgets[model.id] = segement;
		this._containerWidgets[model.id] = segement;
	}

	_createLabeledTextBox(parent, model) {
		const widget = this.$new(LabeledTextBox)
		widget.placeAt(parent);
		this._uiWidgets[model.id] = widget;
	}

	_createSVGIcon(parent, model) {
		const widget = this.$new(SVGIcon)
		widget.placeAt(parent);
		this._uiWidgets[model.id] = widget;
	}

	_createRadioTable(parent, model) {
		const widget = this.$new(RadioTable)
		widget.placeAt(parent);
		this._uiWidgets[model.id] = widget;
	}

	_createSortableList(parent, model) {
		const widget = this.$new(SortableList)
		widget.placeAt(parent);
		this._uiWidgets[model.id] = widget;
	}

	_createLabeledTextArea(parent, model) {
		const widget = this.$new(LabeledTextArea)
		widget.placeAt(parent);
		this._uiWidgets[model.id] = widget;
	}

	_createProgessSegments(parent, model) {
		const widget = this.$new(ProgessSegments)
		widget.placeAt(parent);
		this._uiWidgets[model.id] = widget;
	}

	_createIFrameWidget(parent, model) {
		const widget = this.$new(IFrameWidget)
		widget.placeAt(parent);
		this._uiWidgets[model.id] = widget;
	}

	_createIconButton(parent, model) {
		var widget = this.$new(IconButton);
		widget.placeAt(parent);
		this._uiWidgets[model.id] = widget;
	}

	_createImagePaging(parent, model) {
		const widget = this.$new(ImagePaging)
		widget.placeAt(parent);
		this._uiWidgets[model.id] = widget;
	}

	_createVisualPicker(parent, model) {
		const widget = this.$new(VisualPicker);
		widget.placeAt(parent);
		this._uiWidgets[model.id] = widget;
	}

	_createSVGBox(parent, model) {
		const widget = this.$new(SVGBox);
		widget.placeAt(parent);
		this._uiWidgets[model.id] = widget;
	}

	_createSVGPaths(parent, model) {
		const widget = this.$new(SVGPaths);
		widget.placeAt(parent);
		this._uiWidgets[model.id] = widget;
	}

	_createTree(parent, model) {
		const widget = this.$new(Tree);
		widget.placeAt(parent);
		this._uiWidgets[model.id] = widget;
	}

	_createNavBar(parent, model) {		
		const widget = this.$new(Navigation);
		widget.placeAt(parent);
		this._uiWidgets[model.id] = widget;
	}

	_createNavMenu(parent, model) {		
		const widget = this.$new(NavMenu);
		widget.placeAt(parent);
		this._uiWidgets[model.id] = widget;
	}	

	_createTimeline (parent, model) {
		const widget = this.$new(Timeline)
		widget.placeAt(parent);
		this._uiWidgets[model.id] = widget;
	}

	_createVerticalNavigation(parent, model) {
		const widget = this.$new(Tree);
		widget.placeAt(parent);
		this._uiWidgets[model.id] = widget;
	}

	_createCountingStepper (parent, model) {
		const stepper = this.$new(CountingStepper)
		stepper.placeAt(parent);
		this._uiWidgets[model.id] = stepper;
	}

	_createRepeater (parent, model) {
		const repeater = this.$new(Repeater);
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

	_createDragNDropTarget (parent, model) {
		const dnd = this.$new(DragNDropTarget);
		if (this.zoomedModel){
			dnd.setZoomedModel(this.zoomedModel)
		} else {
			dnd.setZoomedModel(this.model)
		}

		dnd.placeAt(parent);
		this._uiWidgets[model.id] = dnd;
	}

	_createWebLink (parent, model) {
		const upload = this.$new(WebLink);
		upload.placeAt(parent);
		this._uiWidgets[model.id] = upload;
	}

	_createProgressBar(parent, model) {
		const upload = this.$new(ProgressBar);
		upload.placeAt(parent);
		this._uiWidgets[model.id] = upload;
	}

	_createUpload (parent, model) {
		const upload = this.$new(Upload);
		upload.placeAt(parent);
		this._uiWidgets[model.id] = upload;
	}

	_createUploadPreview(parent, model) {
		const upload = this.$new(UploadPreview);
		upload.hash = this.hash
		upload.placeAt(parent);
		this._uiWidgets[model.id] = upload;
	}

	_createCamera (parent, model) {
		const upload = this.$new(Upload);
		upload.placeAt(parent);
		this._uiWidgets[model.id] = upload;
	}

	_createCheckBox (parent, model) {
		const checkBox = this.$new(CheckBoxWidget);
		checkBox.placeAt(parent);
		this._uiWidgets[model.id] = checkBox;
	}

	_createCheckBoxGroup(parent, model) {
		const checkBox = this.$new(CheckBoxGroup);
		checkBox.placeAt(parent);
		this._uiWidgets[model.id] = checkBox;
	}

	_createRest(parent, model) {
		const widget = this.$new(Rest);
		widget.placeAt(parent);
		this._uiWidgets[model.id] = widget;
	}

	_createRadioBox(parent, model) {
		const widget = this.$new(RadioBox);
		widget.placeAt(parent);
		this._uiWidgets[model.id] = widget;
	}

	_createRadioBox2(parent, model) {
		const widget = this.$new(RadioBox2);
		widget.placeAt(parent);
		this._uiWidgets[model.id] = widget;
	}

	_createRadioGroup(parent, model) {
		const widget = this.$new(RadioGroup);
		widget.placeAt(parent);
		this._uiWidgets[model.id] = widget;
	}

	_createSketch(parent, model) {
		var widget = this.$new(Sketch);
		widget.hash = this.hash
		widget.placeAt(parent);
		this._uiWidgets[model.id] = widget;
	}

	_createVector(parent, model) {
		var widget = this.$new(Vector);
		widget.hash = this.hash
		widget.placeAt(parent);
		this._uiWidgets[model.id] = widget;
	}

	_createPaging(parent, model) {
		var widget = this.$new(Paging);
		widget.placeAt(parent);
		this._uiWidgets[model.id] = widget;
	}

	_createDragNDrop(parent, model) {
		var widget = this.$new(DragNDrop);
		widget.placeAt(parent);
		if (this.zoomedModel){
			widget.setZoomedModel(this.zoomedModel)
		} else {
			widget.setZoomedModel(this.model)
		}
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

	_createIconToggleButton(parent, model) {
		var widget = this.$new( IconToggleButton);
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

	_createStackedRingChart(parent, model) {
		var widget = this.$new(Chart)
		widget.type =  "stackedring";
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

	_createScript(parent, model) {
		var widget = this.$new(Script);
		widget.placeAt(parent);
		this._uiWidgets[model.id] = widget;
	}

	_createLockSlider(parent, model) {
		var widget = this.$new(LockSlider);
		widget.placeAt(parent);
		this._uiWidgets[model.id] = widget;
	}

	_createSegmentButton(parent, model) {
		var widget = this.$new(SegmentButton);
		widget.placeAt(parent);
		this._uiWidgets[model.id] = widget;
	}

	_createSegmentPicker(parent, model) {
		var widget = this.$new(SegmentPicker);
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

	/**
	 * Create buddons with plain JS. This is 2x faster
	 * than using a dedicated VUE component
	 */
	_createButton(parent, model) {
		css.add(parent, "MatcEventedWidget");
		const border = this._createBorder(parent, model);
		this._createInlineEdit(border, model);
	}

	/**
	 * Using a VUE widget is much slower!
	 */
	_createButtonSlow(parent, model) {
		const widget = this.$new(Button)
		widget.mode = this.mode
		widget.placeAt(parent);
		this._uiWidgets[model.id] = widget;
	}


	_createBox(parent, model) {
		const border = this._createBorder(parent, model);
		return border;
	}


	_createLabel(parent, model) {
		const widget = this.$new(Label, {mode: this.mode});
		widget.placeAt(parent);
		this._uiWidgets[model.id] = widget;
	}

	_createLabeledRadioBox(parent, model) {
		const widget = this.$new(LabeledRadioBox, {mode: this.mode});
		widget.placeAt(parent);
		this._uiWidgets[model.id] = widget;
	}

	_createLabeledCheckBox(parent, model) {
		const widget = this.$new(LabeledCheckBox, {mode: this.mode});
		widget.placeAt(parent);
		this._uiWidgets[model.id] = widget;
	}


	_createImage(parent, model) {
		/**
		 * Since 3.0.41 we add another div so we can rotate
		 */
		const imgCntr =  document.createElement("div")
		css.add(imgCntr, 'MatchWidgetTypeImageCntr')
		parent.appendChild(imgCntr)
		this._imageNodes[model.id] = imgCntr
		css.add(parent, "MatchWidgetTypeImage");
	}

	_createIcon(parent, model) {
		//css.add(parent, "MatcEventedWidget");
		const border = this._createBorder(parent, model);
		const icon = document.createElement("span");
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
				this.setTextContent(inlineEdit, "");
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


	setStyle(parent, model, isUpdate = false, isResize = false) {
		var style = this.getStyle(model, parent);
		if (style) {
			if (!this._uiWidgets[model.id]) {
				/**
				 * Remove this get style???
				 */
				style = this.getStyle(model, parent);
				if (style) {
					this.setStyle2DomNode(parent, style, model, isResize)
				}
			} else {
				try {
					var w = this._uiWidgets[model.id];
					w.isSimulator = this.mode == "simulator"
					w.setFactory(this);
					/**
					 * Since 3.0.29 we try to optimize scaleing operations. This could make
					 * some widgets, that have a lot of children, much faster.rr
					 */
					if (isResize) {
						w.updateScale(model, style, this._scaleX, this._scaleY)
					} else {
						w.render(model, style, this._scaleX, this._scaleY, isUpdate);
					}

				} catch (e) {
					this.logger.error("setStyle", "Error", e);
				}
			}
		}
	}

	setStyle2DomNode (parent, style, model, isResize = false) {

		/**
		 * Since 3.0.32 we just update some props on zoom
		 */
		if (isResize === true) {

			for (let i=0; i < this.styleKeysForResize.length; i++) {
				let p = this.styleKeysForResize[i]
				if (style[p] !== null && style[p] !== 0) {
					if (this["_set_" + p]) {
						this["_set_" + p](parent, style, model);
					} else {
							parent.style[p] = style[p];
					}
				}
			}
		} else {
			/**
			 * For design tokens we might have the weird situation, that the
			 * shadow styles were injected in ModelUtils. After detaching the token,
			 * the none method would not be called.
			 */
			/*
			if (style['textShadow'] === undefined) {
				this._set_textShadow(parent, style, model)
			}
			if (style['boxShadow'] === undefined) {
				this._set_boxShadow(parent, style, model)
			}
			*/

			for (let p in style) {
				if (this["_set_" + p]) {
					this["_set_" + p](parent, style, model);
				} else {
					if (style[p] != null) {
						parent.style[p] = style[p];
					} else {
						//console.warn("The style", p, " is no value!", model);
					}
				}
			}
		}
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

			if (style.iconSizeFactor) {
				height = Math.round(style.iconSizeFactor * height)
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
		/**
		 * Since 3.0.32 we round
		 */
		parent.style.fontSize = Math.round(size) + "px";
	}

	_set_rotate(parent, style,) {
		var trans = "rotate(" + Math.round(style.rotate) + "deg)";
		parent.style.transform = trans;
		parent.style.webkitTransform = trans;
		parent.style.transformOrigin = "50% 50%";
		parent.style.webkitTransformOrigin = "50% 50%";
	}

	_set_boxShadow(parent, style, model) {
		/**
		 * For icons we treat the boxShadow as in textShadow
		 */
		if (model.type === 'Icon') {
			this._set_icon_boxShadow(parent, style, model)
		} else {
			let shadow = style.boxShadow;
			let node = this._borderNodes[model.id];
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

	_set_icon_boxShadow(parent, style, model) {
		let node = this._iconNodes[model.id]
		if (node) {
			let shadow = style.boxShadow;
			if (shadow) {
				var v = this.getZoomed(shadow.v, this._scaleY);
				var h = this.getZoomed(shadow.h, this._scaleX);
				var b = this.getZoomed(shadow.b, Math.max(this._scaleY, this._scaleX));
				node.style.textShadow = h + "px " + v + "px " + b + "px " + shadow.c;
			} else {
				node.style.textShadow = "none";
			}
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

	_set_backdropFilter(parent, style) {
		let backdropFilter = style.backdropFilter
		if (backdropFilter) {
			let blur = backdropFilter.blur
			blur = this.getZoomed(blur, this._scaleX)
			parent.style.backdropFilter = `blur(${blur}px)`
		} else {
			parent.style.backdropFilter = 'none';
		}
	}

	_set_filter(parent, style) {
		let filter = style.filter
		if (filter) {
			let result = []

			if (filter.blur) {
				let blur = filter.blur
				blur = this.getZoomed(blur, this._scaleX)
				result.push(`blur(${blur}px)`)
			}

			if (filter.grayscale) {
				result.push(`grayscale(${filter.grayscale}%)`)
			}

			if (filter.opacity) {
				result.push(`opacity(${filter.opacity}%)`)
			}

			if (filter.contrast !== undefined) {
				result.push(`contrast(${filter.contrast}%)`)
			}

			if (filter.brightness !== undefined) {
				result.push(`brightness(${filter.brightness}%)`)
			}

			if (filter.saturate !== undefined) {
				result.push(`saturate(${filter.saturate}%)`)
			}

			if (filter.hueRotate !== undefined) {
				result.push(`hue-rotate(${filter.hueRotate * 360 / 100}deg)`)
			}

			parent.style.filter = result.join(' ')
		} else {
			parent.style.filter = 'none';
		}
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
			let value = "(" + background.direction + "deg";
			const sortedColors = background.colors.slice()
			sortedColors.sort((a, b) => {
				return a.p - b.p
			})
			for (let i = 0; i < sortedColors.length; i++) {
				const color = sortedColors[i];
				value += "," + color.c + " " + color.p + "% ";
			}
			value + ");";
			/**
			 * FIXME: Add suppoprt for radial as well
			 */
			parent.style.background = "linear-gradient" + value;
			parent.style.background = "-webkit-linear-gradient" + value;
		} else {
			/**
			 * For gradient bug: If we have an image, we just set the color,
			 * otherwise the complete background to also overwrite gradients.
			 */
			if (style.backgroundImage){
				parent.style.backgroundColor = style.background;
			} else {
				parent.style.background = style.background;
			}
		}
	}


	_set_backgroundPosition() {

	}

	_set_backgroundSize() {

	}

	_set_backgroundImageRotation (parent, style, model) {
		let imgCntr = this._imageNodes[model.id]
		if (imgCntr) {
			imgCntr.style.transform = `rotate(${style.backgroundImageRotation}deg)`

		} else {
			let iconNode = this._iconNodes[model.id]
			if (iconNode) {
				iconNode.style.transform = `rotate(${style.backgroundImageRotation}deg)`
				css.add(parent, 'MatchWidgetTypeIconRotated')
			}
		}
	}

	_set_backgroundImageRepeat() {
		// will be handled in _set_backgroundImage()
	}

	/**
	 * background image
	 */
	_set_backgroundImage(parent, style, model) {

		let node = this._borderNodes[model.id];
		if (node) {
			parent = node;
		}
		/**
		 * Since 3.0.41 we have child which will get the image
		 */
		let imgCntr = this._imageNodes[model.id]
		if (imgCntr) {
			parent = imgCntr
		}

		let img = style.backgroundImage;
		css.add(parent, "MatcScreenImage");
		if (img) {
			if (img.w > img.h) {
				css.add(parent, "MatcScreenImageHorizontal");
			} else {
				css.add(parent, "MatcScreenImageVertical");
			}
			if (this.hash) {
				parent.style.backgroundImage = "url(/rest/images/" + this.hash + "/" + img.url + ")";
			} else if (this.jwtToken) {
				parent.style.backgroundImage = "url(/rest/images/" + img.url + "?token=" + this.jwtToken+ ")";
			} else {
				if (!this.isPublic) {
					this.logger.warn('_set_backgroundImage', 'error > no token or hash')
					this.logger.sendError(new Error('RenderFactgoryNoToken'))
				}
				parent.style.backgroundImage = "url(/rest/images/" + img.url + ")";
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

			if (style.backgroundImageRepeat) {
				parent.style.backgroundRepeat = "repeat";
			} else {
				parent.style.backgroundRepeat = "no-repeat";
			}

			parent.style.border = "none";
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
				context.strokeStyle = "#000";
				context.strokeWidth = 2;
				context.imageSmoothingEnabled = false;
				context.stroke();
				parent.style.backgroundImage = "url(" + c.toDataURL("image/png") + ")";
				parent.style.border = "1px solid #000";
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
		this._iconNodes = {}
		this._imageNodes = {};
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

	destroyWidgetsById(ids) {
		this.logger.log(1, "destroyWidgets", "enter > ", ids)
		ids.forEach(id => {
			const w = this._uiWidgets[id]
			if (w) {
				if (this.mode == "simulator" || this.mode == "view") {
					const widget = this.model.widgets[id];
					if (widget && widget.inherited) {
						id = widget.inherited;
					}
					this._uiWidgetsStates[id] = w.getState();
				}
				w.beforeDestroy()
				delete this._uiWidgets[id]
			}
		})
	}
}