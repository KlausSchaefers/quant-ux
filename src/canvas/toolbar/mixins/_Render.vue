<script>
import DojoWidget from 'dojo/DojoWidget'
import lang from 'dojo/_base/lang'
import css from 'dojo/css'
import on from 'dojo/on'
import touch from 'dojo/touch'

import _Tooltip from 'common/_Tooltip'
import CheckBox from 'common/CheckBox'

import DomBuilder from 'common/DomBuilder'
import ScrollContainer from 'common/ScrollContainer'
import ToolbarSelector from 'canvas/toolbar/components/ToolbarSelector'

import ToolbarColor from 'canvas/toolbar/components/ToolbarColor'
import ToolbarImage from 'canvas/toolbar/components/ToolbarImage'

import BoxShadow from 'canvas/toolbar/components/BoxShadow2'
import BoxSize from 'canvas/toolbar/components/BoxSize'
import BoxBorder from 'canvas/toolbar/components/BoxBorder'
import BoxBorder2 from 'canvas/toolbar/components/BoxBorder2'
import BoxPadding from 'canvas/toolbar/components/BoxPadding'

import ActionButton from 'canvas/toolbar/components/ActionButton'
import DataSection from 'canvas/toolbar/components/DataSection'
import ScreenList from 'canvas/toolbar/components/ScreenList'
import ValidationSection from 'canvas/toolbar/components/ValidationSection'

import Downloader from 'canvas/toolbar/components/Downloader'
import ToolbarImagePosition from 'canvas/toolbar/components/ToolbarImagePosition'
import Radius from 'canvas/toolbar/components/Radius'
import CSSExporter from 'canvas/toolbar/components/CSSExporter'
import Resize from 'canvas/toolbar/components/Resize'

import RulerSection from 'canvas/toolbar/components/RulerSection'
import LowCodeSection from 'canvas/toolbar/components/LowCodeSection'
import CallBackSection from 'canvas/toolbar/components/CallBackSection'
import LowCodeResponsiveSection from 'canvas/toolbar/components/LowCodeResponsiveSection'
import ImageRotate from 'canvas/toolbar/components/ImageRotate'
import TextProperties from 'canvas/toolbar/components/TextProperties'
import BackdropFilter from 'canvas/toolbar/components/BackdropFilter'
import Filter from 'canvas/toolbar/components/Filter'
import TooltipSection from 'canvas/toolbar/components/TooltipSection'
import Alignment from 'canvas/toolbar/components/Alignment'

import DesignTokenBtn from 'canvas/toolbar/components/DesignTokenBtn'
import DesignTokenList from 'canvas/toolbar/components/DesignTokenList'

import Services from 'services/Services'
import {iconDOM} from 'page/QIconUtil'

export default {
    name: '_Render',
    mixins:[_Tooltip, DojoWidget],
    data: function () {
        return {
			hasPadding : ["Button", "DateDropDown", "DropDown", "TypeAheadTextBox", "MobileDropDown", "Label", "TextBox", 'LockSlider',
						"TextArea", "Password", "SegmentButton", "SegmentPicker", "ToggleButton", "Table", 'Tree', 
						'VerticalNavigation', 'Paging', 'LabeledTextBox', 'NavBar', 'NavMenu', 'LabeledTextArea', 
						'SortableList', 'RadioTable', 'DragNDropTarget'],
			
			hasData : ["ToggleButton", "DateDropDown", "SegmentButton", "SegmentPicker", "DropDown", "MobileDropDown", "TextBox", "TextArea", "Password",
						"CheckBox", "RadioBox", "RadioBox2", "HSlider", "Spinner", "Switch", "DragNDrop", "Date", "DateDropDown", "Icon", "Table", "Rating",
						"IconToggle","HoverDropDown", "ImageCarousel", "Stepper", "TypeAheadTextBox", "BarChart", "RingChart", "PieChart", "MultiRingChart",
						"LabeledIconToggle", "LogicOr", "CheckBoxGroup", "RadioGroup", "Repeater", "Camera", "Rest", 'LockSlider', "StackedRingChart",
						'ProgressBar', 'ScreenSegment', 'CountingStepper', "Tree", "VerticalNavigation", 'IconButton', 'Timeline', 'VisualPicker', 
						'Script', 'IconToggleButton', 'ProgessSegments', 'ImagePaging', 'LabeledCheckBox', 'LabeledRadioBox', 'LabeledTextBox', 'NavBar', 
						'NavMenu', 'LabeledTextArea', 'SortableList', 'RadioTable', 'DragNDropTarget'],
			hasActiveData: ["DateDropDown"],
			// validation == databining
			hasValidation : ["TextBox", "TextArea", "TypeAheadTextBox", "Password", "CheckBox", "Switch", "Date", "DateDropDown",
							"MobileDropDown", "DropDown", "Label", "SegmentButton", "SegmentPicker", "Spinner", "HSlider", "Stepper","Rating" ,
							"IconToggle", "TypeAheadTextBox", "ToggleButton", "CheckBoxGroup", "RadioGroup",
							"RadioBox2", "Upload", "Camera", "UploadPreview", 'Repeater', 'ProgressBar', 'ImageCarousel',
							'RingChart', 'BarChart', 'PieChart', 'MultiRingChart', 'CountingStepper', 'Tree', 'VerticalNavigation',
							'Table', 'Paging', 'Timeline', 'LabeledIconToggle', 'VisualPicker', 'LockSlider', 'IconToggleButton', 'ScreenSegment', 
							'ProgessSegments', 'ImagePaging', 'LabeledCheckBox', 'LabeledRadioBox', 'Button', 'LabeledTextBox',
							'LabeledTextArea', 'SortableList', 'RadioTable', 'DragNDropTarget'],

			hasColor: ['Icon', 'SVGIcon'],

			hasLogic2: ["LogicOr", "Rest", "Script"],

			hasErrorViewMode : ["TextBox", "Password", "CheckBox", "Switch", "DropDown", "MobileDropDown", "DateDropDown", 
								"TypeAheadTextBox", "CheckBoxGroup", "RadioGroup", 'LabeledCheckBox', 'LabeledRadioBox', 'LabeledTextBox', 'LabeledTextArea'],

			hasFocusViewMode : ["TextBox", "Password", "DropDown", "MobileDropDown", "TextArea", "TypeAheadTextBox", 'LabeledTextBox', 'LabeledTextArea'],
			hasCheckedViewMode : ["CheckBox", "RadioBox", "RadioBox2"],

			hasActiveViewMode : ["SegmentButton", "ToggleButton","VolumeSlider", "Tree", "VerticalNavigation", 
								'Paging', 'Upload', 'IconToggleButton', 'NavBar', 'DragNDrop'],
			
			hasHoverViewMode: ["Box", "Button", "Label", "ToggleButton", "DragNDrop", "Upload", "WebLink", "Tree", "Camera",
								"VerticalNavigation", "Stepper", "Paging", "VisualPicker", 'IconToggleButton', 'IconButton', 
								'DragNDropTarget', 'LabeledTextBox', 'NavBar', 'TextBox', 'LabeledTextBox', 'NavMenu', 
								"DropDown", 'LabeledTextArea', 'SortableList', 'RadioTable', 'Icon', 'SVGIcon'],
								
			hasPopupViewMode: ["DropDown", "DateDropDown", "MobileDropDown", 'NavMenu'],
			hasValign: ["Box", "Button", "Label", "Upload", "WebLink", "IconButton", "Paging", 
						"ToggleButton", "SegmentButton", "SegmentPicker", "DragNDrop", "DragNDropTarget"],
			hasRotate: ['Image', 'Icon'],
			hasSVG: ['SVGPaths'],
			hideAction: ['ScreenSegment']
      }
	},
    components: {},
    methods: {
        onModeChange (){
		},


		setWidgetViewModel (){
			if(this._selectedWidget){
				this.hideAllSections();
				this.showWidgetProperties(this._selectedWidget);
				this.showTools();
				this.showTemplate(this._selectedWidget);
			}
		},


		/**********************************************************************
		* Rending stuff
		**********************************************************************/

		renderToolbar (){
			this.logger.log(2,"renderToolbar", "enter");

			this.jwtToken = Services.getUserService().getToken()

			/**
			* now we have to factory and create a menu
			* for the widgets
			*/
			this.createBTN = this.$refs.createButton
			this.createBTN.setUser(this.user);
			this.createBTN.setModel(this.model);
			this.createBTN.setJwtToken(this.jwtToken)
			this.tempOwn(on(this.createBTN, "change", lang.hitch(this, "onNewThemeObject")));
			this.tempOwn(on(this.createBTN, "importsChange", lang.hitch(this, "onImportChange")));
			this.tempOwn(on(this.createBTN, "removeTemplate", lang.hitch(this, "onRemoveTemplate")));
			//css.add(this.createBTN.domNode, "MatcToolbarItem MatcToolbarDropDownButtonMiddle");

			/**
			* set model
			*/
		
			this.template = this.$refs.templateBTN.domNode

			//this.replicateBtn = this.createToolBarItem('<span class="mdi mdi-view-grid-plus-outline"></span>', lang.hitch(this,"onToolbarReplicate"), null, this.templateDiv);
			// this.distributeBtn = this.createToolBarItem('<span class="mdi mdi-arrow-expand-horizontal"></span>', lang.hitch(this,"onToolbarDistribute"), null, this.groupDIV);		
			// this.createThemeBtn = this.createToolBarItem('<span class="mdi mdi-ninja"></span>', lang.hitch(this,"onToolCreateTheme"), null, this.developerDiv);
			

			this.logger.log(3,"renderToolbar", "exit");
		},



		renderProperties (){
			this.logger.log(3,"render", "entry");


			this.properties = document.createElement("div");
			css.add(this.properties, "MatcToobarPropertiesSectionCntr")


			this.sections = [];

			this.designTokenBtns = []

			this.propertiesStates = {};

			this._renderWidgetAlign();

			this._renderMultiPosition();


			/**
			* render group and multi properties
			*/
			this._renderGroupName();

			this._renderGroupResponsive();

			this._renderGroupAction();

			/**
			* render widget properties;
			*/
			this._renderWidgetShape();

			this._renderWidgetName()

			this._renderWidgetResponsive();

			this._renderInheritedWidget()

			this._renderWidgetLine();

			this._renderData();

			this._renderValidation();

			this._renderWidgetToolTip();

			this._renderWidgetView();

			this._renderWidgetImage()

			this._renderWidgetBackground();

			this._renderWidgetBorder();

			this._renderWidgetColor();

			this._renderWidgetText();

			this._renderSVGEditButton()

			this._renderWidgetBoxShadow()

			this._renderWidgetBox();

			this._renderSVGBox()
			this._renderSVGTransform()
			this._renderSVGFill()
			this._renderSVGStroke()
		


			//this._renderConditionalStyle()

			/**
			* render screen properties
			*/

			this._renderScreenShape()

			this._renderScreenName();

			this._renderScreen();

			this._renderScreenAnimations()

			this._renderScreenBackground();

			this._renderScreenImage()

			this._renderScreenActions();

			this._renderScreenInheritance();

			this._renderScreenDownload();

			/**
			*
			*/
			this._renderLowCode();

			/**
			* Ruler
			*/
			this._renderRuler();

			/**
			* render canavs
			*/
			this._renderDesignTokens()
			this._renderDesignTokensDownload();

			
		

			/**
			* Hide everything
			*/
			this.hideAllSections();


			/**
			* Now assemble final ui. hook in properties panel and make toolSection Visible!
			*/
			this.scroller = this.$new(ScrollContainer);
			this.scroller.placeAt(this.propertiesCntr);
			this.scroller.wrap(this.properties, 40);

			this.renderToolTips();

			this.hideNotNeededButtons();
			this.initIcons();
		},


		renderToolTips (){

			this.addTooltip(this.simulatorButton, this.getNLS("tooltip.simulate"));
			this.addTooltip(this.addScreenBtn, this.getNLS("tooltip.screen"));
	
			this.addTooltip(this.editBtn, this.getNLS("tooltip.edit"));
			this.addTooltip(this.moveBtn, this.getNLS("tooltip.move"));
			this.addTooltip(this.commentBtn,this.getNLS("tooltip.comment"));
			this.addTooltip(this.distributeBtn, this.getNLS("tooltip.distribute"));
			this.addTooltip(this.groupBTN,this.getNLS("tooltip.group"));
			this.addTooltip(this.ungroupBTN, this.getNLS("tooltip.ungroup"));
			this.addTooltip(this.replicateBtn, this.getNLS("tooltip.clone"));
			if (this.gridResizeBtn) {
				this.addTooltip(this.gridResizeBtn, this.getNLS("tooltip.resizeGrid"));
			}


		},


		/***************************************************************************
		* Icons
		***************************************************************************/

		async initIcons (){
			const icons = await Services.getSymbolService().getIcons()
			this._onIconsLoaded(icons)
			if (this.model.version >= 5) { 
				const svgIcons = await Services.getSymbolService().getSVGIcons()
				this._onSVGIconsLoaded(svgIcons)
			}
		},

		_onSVGIconsLoaded (svgIcons){
			this.logger.log(-2, "_onSVGIconsLoaded", "enter");
			this._matcIcons;

			if (this.createBTN){
				this.createBTN.setSVGIcons(svgIcons);
			}

			if (this.dataWidget){
				this.dataWidget.setSVGIcons(svgIcons);
			}
		},

		_onIconsLoaded (icons){
			this.logger.log(2, "_onIconsLoaded", "enter > " + icons.length);
			this._matcIcons;

			if (this.createBTN){
				this.createBTN.setIcons(icons);
			}

			if (this.dataWidget){
				this.dataWidget.setIcons(icons);
			}
		},

		_renderDesignTokens () {

			var parent = this.createSection("");
			css.add(parent, 'MatcToolbarSectionNoBorder')

			var content = document.createElement("div");
			css.add(content, "");
			parent.appendChild(content);

			this.designTokenList = this.$new(DesignTokenList)
			this.designTokenList.placeAt(content)
			this.own(on(this.designTokenList, "change", lang.hitch(this, "changeDesignToken")));
			this.own(on(this.designTokenList, "delete", lang.hitch(this, "deleteDesignToken")));
			this.designTokenList.setFontFamilies(this._getFontFamilies());

			this.properties.appendChild(parent);
			this.designTokenDiv = parent;
		},


		_renderDesignTokensDownload () {

			var parent = this.createSection("Export");

			var content = document.createElement("div");
			css.add(content, "MatcToolbarSectionContent");
			parent.appendChild(content);

			this.designTokenExport = this.$new(CSSExporter);
			this.designTokenExport.setHash(this.hash);
			this.designTokenExport.setModel(this.model);
			this.designTokenExport.placeAt(content);

			this.properties.appendChild(parent);
			this.designTokenDownloadDiv = parent;
		},

		/*****************************************************************************************************
		* Ruler Settings
		****************************************************************************************************/

		_renderRuler () {

			var parent = this.createSection("Ruler");

			var content = document.createElement("div");
			css.add(content, "MatcToolbarSectionContent");
			parent.appendChild(content);

			this.rulerSection = this.$new(RulerSection);
			this.rulerSection.placeAt(content)
			this.own(on(this.rulerSection, "changeProps", lang.hitch(this, "setRulerProperties")));
			this.own(on(this.rulerSection, "changeV", lang.hitch(this, "setRulerPosition")));

			this.properties.appendChild(parent);
			this.rulerSectionDIV = parent;
		},

		/*****************************************************************************************************
		* Group Settings
		****************************************************************************************************/

		_renderGroupName (){
			var parent = this.createSection("Name");

			var content = document.createElement("div");
			css.add(content, "MatcToolbarSectionContent");
			parent.appendChild(content);

			this.groupName = this.createInput(content, "Group Name");
			css.add(this.groupName, "MatcToobarNameInput")
			this.own(on(this.groupName, "change", lang.hitch(this, "onGroupNameChange")));

			this.properties.appendChild(parent);
			this.groupNameDiv = parent;
		},

		_renderGroupResponsive (){

			var parent = this.createSection("Constraints", true);

			var content = document.createElement("div");
			css.add(content, "MatcToolbarSectionContent");
			parent.appendChild(content);

			this.responsiveGroupWidget = this.$new(Resize);
			this.responsiveGroupWidget.setModel(this.model);
			this.responsiveGroupWidget.placeAt(content);
			this.own(on(this.responsiveGroupWidget, "change", lang.hitch(this, "setGroupProperties", "resize")));

			this.groupPositionCheckBox = this.$new(CheckBox);
			this.groupPositionCheckBox.setLabel("Fixed In Simulator");
			this.addTooltip(this.groupPositionCheckBox.domNode, "The element will not scroll in the simulator.")
			css.add(this.groupPositionCheckBox.domNode, "MatcToolbarItem");
			this.own(on(this.groupPositionCheckBox, "change", lang.hitch(this, "setWidgetStyle", "fixed")));
			this.groupPositionCheckBox.placeAt(content)

			this.responsiveGroupDiv = parent;
			this.properties.appendChild(parent);
		},


		_renderGroupAction (){

			var parent = this.createSection("Action");

			var content = document.createElement("div");
			css.add(content, "MatcToolbarSectionContent");
			parent.appendChild(content);

			this.groupActionBTN = this.$new(ActionButton);
			this.groupActionBTN.placeAt(content);
			this.groupActionBTN.setModel(this.model);

			this.own(on(this.groupActionBTN, "toggleLine", lang.hitch(this, "toggleLineHide")));
			this.own(on(this.groupActionBTN, "newLine", lang.hitch(this, "toolNewLine")));
			this.own(on(this.groupActionBTN, "newTransformLine", lang.hitch(this, "toolNewTransformLine")));

			this.own(on(this.groupActionBTN, "removeLine", lang.hitch(this, "removeLine")));
			this.own(on(this.groupActionBTN, "removeLineById", lang.hitch(this, "removeLineById")));
			this.own(on(this.groupActionBTN, "setLineProperty", lang.hitch(this, "setLineProperty")));
			this.own(on(this.groupActionBTN, "setLinePropertyByID", lang.hitch(this, "setLinePropertyByID")));
			this.own(on(this.groupActionBTN, "updateLineByID", lang.hitch(this, "updateLineByID")));
			this.own(on(this.groupActionBTN, "newAction", lang.hitch(this, "newAction")));
			this.own(on(this.groupActionBTN, "removeAction", lang.hitch(this, "removeAction")));
			this.own(on(this.groupActionBTN, "updateAction", lang.hitch(this, "updateAction")));

			this.properties.appendChild(parent);
			this.groupActionDiv = parent;
		},

		

		/*****************************************************************************************************
		* Render widgets
		****************************************************************************************************/


		_renderWidgetView() {

			var content = document.createElement("div");
			css.add(content, "MatcToobarViewSection")
			this.widgetViewModeBtn = this.$new(ToolbarSelector);
			this.widgetViewModeBtn.setOptions([
				{label :"Normal", value:"style"},
				{label :"Hover", value:"hover"},
				{label :"Focus", value:"focus"},
				{label :"Checked", value:"checked"},
				{label :"Active", value:"active"},
				{label :"Error", value:"error"}
			]);
			this.widgetViewModeBtn.placeAt(content);
			this.widgetViewModeBtn.setValue("style");
			this.own(on(this.widgetViewModeBtn, "change", lang.hitch(this, "setWidgetViewModel")));

			this.propertiesCntr.appendChild(content);
			this.widgetViewSection = content;
		},


		_renderWidgetAlign (){
			const content = document.createElement("div");
			css.add(content, "MatcToolbarSectionContent  MatcToolbarSectionBorder");

			this.alignmentBtn = this.$new(Alignment)
			this.alignmentBtn.setModel(this.model)
			this.alignmentBtn.placeAt(content)
			this.alignmentBtn.on('align', (v,e) => this.onToolAlignElements(v,e))
			this.alignmentBtn.on('dist', (v,e) => this.onToolDistributeElements(v,e))

			this.properties.appendChild(content);
			this.widgetAlignDiv = content;
		},

		_renderWidgetName () {
			var parent = this.createSection("Name");

			var content = document.createElement("div");
			css.add(content, "MatcToolbarSectionContent");
			parent.appendChild(content);

			this.widgetName = this.createInput(content, "Widget Name");
			css.add(this.widgetName, "MatcToobarNameInput")
			this.own(on(this.widgetName, "change", lang.hitch(this, "onWidgetNameChange")));

			this.properties.appendChild(parent);
			this.widgetNameDiv = parent;
		},

		_renderWidgetShape (){

			var parent = this.createSection("Shape");

			var content = document.createElement("div");
			css.add(content, "MatcToolbarSectionContent");
			parent.appendChild(content);

			let widgetSizeDiv = document.createElement("div");
			content.appendChild(widgetSizeDiv)

			this.widgetSize = this.$new(BoxSize);
			this.own(on(this.widgetSize, "change", lang.hitch(this, "setWidgetSize")));
			this.widgetSize.placeAt(widgetSizeDiv);

			/**
			* Radius
			*/
			this.radiusBox = this.$new(Radius);
			this.own(on(this.radiusBox, "change", lang.hitch(this, "setWidgetMultiStyle")));
			this.own(on(this.radiusBox, "changing", lang.hitch(this, "setTempMultiWidgetStyle")));
			this.radiusBox.placeAt(widgetSizeDiv)

			this.properties.appendChild(parent);
			this.widgetShapeDiv = parent;
			this.widgetSizeDiv = widgetSizeDiv
		},

		_renderWidgetResponsive (){

			const parent = this.createSection("Constraints", true);

			const content = document.createElement("div");
			css.add(content, "MatcToolbarSectionContent");
			parent.appendChild(content);

			this.responsiveWidget = this.$new(Resize);
			this.responsiveWidget.setModel(this.model);
			this.responsiveWidget.placeAt(content);
			this.own(on(this.responsiveWidget, "change", lang.hitch(this, "setWidgetProps", "resize")));


			this.positionCheckBox = this.$new(CheckBox);
			this.positionCheckBox.setLabel("Fixed In Simulator");
			this.addTooltip(this.positionCheckBox.domNode, "The element will not scroll in the simulator.")
			css.add(this.positionCheckBox.domNode, "MatcToolbarItem");
			this.own(on(this.positionCheckBox, "change", lang.hitch(this, "setWidgetStyle", "fixed")));
			this.positionCheckBox.placeAt(content)

			this.responsiveDiv = parent;
			this.properties.appendChild(parent);
		},

		_renderLowCode () {

			/**
			* LowCode
			*/
			let parent = this.createSection("Rendering", true);
			let content = document.createElement("div");
			css.add(content, "MatcToolbarSectionContent");
			parent.appendChild(content);

			this.lowCodeSection = this.$new(LowCodeSection);
			this.own(on(this.lowCodeSection, "changeStyle", lang.hitch(this, "setWidgetStyle")));
			this.own(on(this.lowCodeSection, "changeProps", lang.hitch(this, "setWidgetProps")));
			this.own(on(this.lowCodeSection, "changeGroupProps", lang.hitch(this, "setGroupProperties")));
			this.own(on(this.lowCodeSection, "changeGroupStyle", lang.hitch(this, "setGroupStyle")));
			this.lowCodeSection.placeAt(content)

			this.lowCodeDiv = parent;
			this.properties.appendChild(parent);

			/**
			* Callbacks
			*/
			parent = this.createSection("Callbacks", true);
			content = document.createElement("div");
			css.add(content, "MatcToolbarSectionContent");
			parent.appendChild(content);

			this.callbackSection = this.$new(CallBackSection);
			this.own(on(this.callbackSection, "changeStyle", lang.hitch(this, "setWidgetStyle")));
			this.own(on(this.callbackSection, "changeProps", lang.hitch(this, "setWidgetProps")));
			this.own(on(this.callbackSection, "changeScreenProps", lang.hitch(this, "setScreenProps")));
			this.callbackSection.placeAt(content)

			this.callBackDiv = parent;
			this.properties.appendChild(parent);


			/**
			* Responsive
			*/
			parent = this.createSection("Responsive", true);
			content = document.createElement("div");
			css.add(content, "MatcToolbarSectionContent");
			parent.appendChild(content);

			this.lowCodeResponsiveSection = this.$new(LowCodeResponsiveSection);
			this.own(on(this.lowCodeResponsiveSection, "changeStyle", lang.hitch(this, "setWidgetStyle")));
			this.own(on(this.lowCodeResponsiveSection, "changeProps", lang.hitch(this, "setWidgetProps")));
			this.own(on(this.lowCodeResponsiveSection, "changeGroupProps", lang.hitch(this, "setGroupProperties")));
			this.own(on(this.lowCodeResponsiveSection, "changeGroupStyle", lang.hitch(this, "setGroupStyle")));
			this.lowCodeResponsiveSection.placeAt(content)

			this.lowCodeResponsiveDiv = parent;
			this.properties.appendChild(parent);
		},


		_renderData (){
			var parent = this.createSection("Settings");

			var content = document.createElement("div");
			css.add(content, "");
			parent.appendChild(content);

			var dataDiv = document.createElement("div");
			content.appendChild(dataDiv);

			this.dataWidget = this.$new(DataSection);
			this.dataWidget.setModel(this.model);
			this.dataWidget.setMode(this.mode);
			this.dataWidget.setUser(this.user);
			this.dataWidget.setJwtToken(this.jwtToken);
			this.dataWidget.setHash(this.hash)
			this.dataWidget.setCanvas(this.canvas);
			this.dataWidget.placeAt(dataDiv);
			this.dataWidget.setSectionHeader(parent);
			this.own(on(this.dataWidget, "propertyChange", lang.hitch(this, "setWidgetProps")));
			this.own(on(this.dataWidget, "propertyMultiChange", lang.hitch(this, "setWidgetMultiProps")));
			this.own(on(this.dataWidget, "stypeChange", lang.hitch(this, "setWidgetStyle")));
			this.own(on(this.dataWidget, "stypeChanging", lang.hitch(this, "setTempWidgetStyle")));
			this.own(on(this.dataWidget, "stypeMutlitChange", lang.hitch(this, "setWidgetMultiStyle")));

			this.properties.appendChild(parent);
			this.dataDiv = parent;
		},

		_renderValidation (){

			var parent = this.createSection("Data");

			var content = document.createElement("div");
			css.add(content, "");
			parent.appendChild(content);

			var dataDiv = document.createElement("div");
			content.appendChild(dataDiv);


			this.validationWidget = this.$new(ValidationSection);
			this.validationWidget.setModel(this.model);
			this.validationWidget.setCanvas(this.canvas);
			this.validationWidget.placeAt(dataDiv);
			this.validationWidget.setSectionHeader(parent);
			this.own(on(this.validationWidget, "propertyChange", lang.hitch(this, "setWidgetProps")));
			this.own(on(this.validationWidget, "propertyMultiChange", lang.hitch(this, "setWidgetMultiProps")));
			this.own(on(this.validationWidget, "dataBindingChange", lang.hitch(this, "setWidgetDataBinding")));
			this.own(on(this.validationWidget, "stypeChange", lang.hitch(this, "setWidgetStyle")));
			this.own(on(this.validationWidget, "stypeMutlitChange", lang.hitch(this, "setWidgetMultiStyle")));


			this.properties.appendChild(parent);
			this.validationDiv = parent;
		},


		_renderWidgetLine (){

			var parent = this.createSection("Action");

			var content = document.createElement("div");
			css.add(content, "MatcToolbarSectionContent");
			parent.appendChild(content);

			this.actionBTN = this.$new(ActionButton);
			this.actionBTN.placeAt(content);
			this.actionBTN.setModel(this.model);
			this.own(on(this.actionBTN, "toggleLine", lang.hitch(this, "toggleLineHide")));
			this.own(on(this.actionBTN, "newLine", lang.hitch(this, "toolNewLine")));
			this.own(on(this.actionBTN, "newTransformLine", lang.hitch(this, "toolNewTransformLine")));
			this.own(on(this.actionBTN, "removeLine", lang.hitch(this, "removeLine")));
			this.own(on(this.actionBTN, "removeLineById", lang.hitch(this, "removeLineById")));
			this.own(on(this.actionBTN, "setLinePropertyByID", lang.hitch(this, "setLinePropertyByID")));
			this.own(on(this.actionBTN, "setLineProperty", lang.hitch(this, "setLineProperty")));
			this.own(on(this.actionBTN, "updateLineByID", lang.hitch(this, "updateLineByID")));
			this.own(on(this.actionBTN, "newAction", lang.hitch(this, "newAction")));
			this.own(on(this.actionBTN, "removeAction", lang.hitch(this, "removeAction")));
			this.own(on(this.actionBTN, "updateAction", lang.hitch(this, "updateAction")));
			this.own(on(this.actionBTN, "showScreenAnimation", lang.hitch(this, "showAdvancedAnimationDialog")));

			this.properties.appendChild(parent);
			this.lineDiv = parent;
		},

		_renderWidgetToolTip (cssProps = ['tooltipBackground', 'tooltipColor', 'tooltipFontSize']) {



			this.designTokenTooltipBtn = this.createDesignTokenBtn('tooltip', cssProps)

			var parent = this.createSection("Tooltip", true, this.designTokenTooltipBtn);

			var content = document.createElement("div");
			css.add(content, "MatcToolbarSectionContent");
			parent.appendChild(content);

			this.tooltipSettings = this.$new(TooltipSection)
			this.tooltipSettings.setModel(this.model)
			this.tooltipSettings.placeAt(content)
			this.tooltipSettings.setCssProps(cssProps);
			this.own(on(this.tooltipSettings, "onChangeStyle", lang.hitch(this, "setWidgetMultiStyle")));
			this.own(on(this.tooltipSettings, "onChangeText", lang.hitch(this, "setWidgetProps", "tooltipText")));

			this.properties.appendChild(parent);
			this.tooltipDiv = parent;
		},


		_renderWidgetBox (cssProps = ['paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight']){

			this.designTokenPaddingBtn = this.createDesignTokenBtn('padding', cssProps)

			var parent = this.createSection( "Padding", true, this.designTokenPaddingBtn);

			var content = document.createElement("div");
			css.add(content, "MatcToolbarSectionContent");
			parent.appendChild(content);

			this.paddingWidget = this.$new(BoxPadding);
			this.own(on(this.paddingWidget, "change", lang.hitch(this, "setWidgetMultiStyle")));
			this.paddingWidget.setCssProps(cssProps);
			this.paddingWidget.placeAt(content);


			this.boxDiv = parent;
			this.properties.appendChild(parent);
		},

		_renderConditionalStyle () {
			const parent = this.createSection("Conditional Style (all)");

			var content = document.createElement("div");
			css.add(content, "MatcToolbarSectionContent");
			parent.appendChild(content);

			//this.condStyle = this.$new(ConditionalStyleButton)
			this.condStyle.placeAt(content)

					
			this.properties.appendChild(parent);
			this.condStyleDiv = parent;
		},

		_renderWidgetBackground (){

			this.designTokenBackground = this.createDesignTokenBtn('color', ['background'])

			var parent = this.createSection( "Background", true, this.designTokenBackground);

			var content = document.createElement("div");
			css.add(content, "MatcToolbarSectionContent");
			parent.appendChild(content);


			// background color
			this.backgroundColor = this.$new(ToolbarColor, {hasGradient : true, hasPicker:true, chevron:false, hex:true});
			this.backgroundColor.updateLabel = true;
			this.backgroundColor.keepOpenOnTypeSelection = "widget";
			this.backgroundColor.setModel(this.model);
			this.backgroundColor.setCssProps(['background'])
			this._placeAt(this.backgroundColor, content);
			this.own(on(this.backgroundColor, "change", lang.hitch(this, "setWidgetStyle", "background")));
			this.own(on(this.backgroundColor, "changing", lang.hitch(this, "setTempWidgetStyle", "background")));


			this.addTooltip(this.backgroundColor.domNode, "Background Color");
			this.colorWidgets.push(this.backgroundColor);

			this.backgroundColorDiv = parent;
			this.properties.appendChild(parent);
		},

		_renderWidgetImage () {

			var parent = this.createSection( "Image", true);

			var content = document.createElement("div");
			css.add(content, "MatcToolbarSectionContent");
			parent.appendChild(content);


			// background image
			let row = document.createElement('div')
		
			content.append(row)
			this.backgroundImage = this.$new(ToolbarImage, {mode:this.mode});
			this.backgroundImage.setCanvas(this.canvas);
			this.backgroundImage.setJwtToken(this.jwtToken);
			this.own(on(this.backgroundImage, "change", lang.hitch(this, "setWidgetStyle", "backgroundImage")));
			this._placeAt(this.backgroundImage,row);
			this.addTooltip(this.backgroundImage.domNode, "Background Image");


			let imageDetailsDiv  = document.createElement('div')
			content.append(imageDetailsDiv)

			row = document.createElement('div')

			imageDetailsDiv.append(row)
			this.imageFilter = this.$new(Filter)
			//this.imageFilter.setModel(this.model)
			this.own(on(this.imageFilter, "change", lang.hitch(this, "setWidgetStyle", "filter")));
			this.own(on(this.imageFilter, "changing", lang.hitch(this, "setTempWidgetStyle", "filter")));
			this._placeAt(this.imageFilter, row);
			this.addTooltip(this.imageFilter.domNode, "Image Filter");


			// background image position
			row = document.createElement('div')
	
			imageDetailsDiv.append(row)
			this.backgroundImagePosition = this.$new(ToolbarImagePosition, {mode:this.mode});
			this.backgroundImagePosition.setJwtToken(this.jwtToken);
			this.own(on(this.backgroundImagePosition, "change", lang.hitch(this, "setWidgetMultiStyle")));
			this._placeAt(this.backgroundImagePosition, row);
			this.addTooltip(this.backgroundImagePosition.domNode, "Image Position");

			// rotate
			row = document.createElement('div')
			imageDetailsDiv.append(row)
			this.backgroundImageRotation = this.$new(ImageRotate);
			this.own(on(this.backgroundImageRotation, "change", lang.hitch(this, "setWidgetStyle", "backgroundImageRotation")));
			this.own(on(this.backgroundImageRotation, "changing", lang.hitch(this, "setTempWidgetStyle", "backgroundImageRotation")));
			this._placeAt(this.backgroundImageRotation, row);
			this.addTooltip(this.backgroundImageRotation.domNode, "Image Rotation");

			this.imageWidgetDiv = parent;
			this.imageWidgetDeatilsDiv = imageDetailsDiv
			this.imageWidgetRotateDiv = row
			this.properties.appendChild(parent);
		},


		_renderWidgetBoxShadow (){

			this.designTokenBoxShadow = this.createDesignTokenBtn('boxShadow', ['boxShadow'])

			var parent = this.createSection( "Effects", true, this.designTokenBoxShadow);

			var content = document.createElement("div");
			css.add(content, "MatcToolbarSectionContent");
			parent.appendChild(content);

			let row = document.createElement("div");
			//css.add(row, 'MatcToobarRowHover')
			content.appendChild(row)

			this.boxShadow = this.$new(BoxShadow);
			this.boxShadow.setModel(this.model)
			this.boxShadow.setCssProps(['boxShadow'])
			this.own(on(this.boxShadow, "change", lang.hitch(this, "setWidgetStyle", "boxShadow")));
			this.own(on(this.boxShadow, "changing", lang.hitch(this, "setTempWidgetStyle", "boxShadow")));
			this._placeAt(this.boxShadow,row);


			row = document.createElement("div");
			//css.add(row, 'MatcToobarRowHover')
			content.appendChild(row)
			this.backdropFilter = this.$new(BackdropFilter)
			this.backdropFilter.setModel(this.model)
			this.backdropFilter.setCssProps(['backdropFilter'])
			this.own(on(this.backdropFilter, "change", lang.hitch(this, "setWidgetStyle", "backdropFilter")));
			this.own(on(this.backdropFilter, "changing", lang.hitch(this, "setTempWidgetStyle", "backdropFilter")));
			this._placeAt(this.backdropFilter,row);

			this.boxShadowBackgroundDiv = parent;
			this.properties.appendChild(parent);

		},


		_renderWidgetBorder (cssProps = ['borderTopWidth', 'borderRightWidth', 'borderLeftWidth', 'borderBottomWidth', 'borderTopColor', 'borderBottomColor', 'borderRightColor', 'borderLeftColor']){

			this.designTokenBorder = this.createDesignTokenBtn('stroke', cssProps)

			var parent = this.createSection("Border", true, this.designTokenBorder, "toggleBoxBorder");

			var content = document.createElement("div");
			css.add(content, "MatcToolbarSectionContent MatcToolbarBoxBorderDetails");
			parent.appendChild(content);

			this.boxBorder = this.$new(BoxBorder);
			this.boxBorder.setModel(this.model);
			this.boxBorder.setCssProps(cssProps)
			this.own(on(this.boxBorder, "change", lang.hitch(this, "setWidgetMultiStyle")));
			this.own(on(this.boxBorder, "changing", lang.hitch(this, "setTempMultiWidgetStyle")));

			this._placeAt(this.boxBorder, content);

			content = document.createElement("div");
			css.add(content, "MatcToolbarSectionContent MatcToolbarBoxBorderNoDetails");
			parent.appendChild(content);

			this.boxBorder2 = this.$new(BoxBorder2, {colorWidgets:this.colorWidgets});
			this.boxBorder2.setModel(this.model);
			this.boxBorder2.setCssProps(cssProps)
			this.own(on(this.boxBorder2, "change", lang.hitch(this, "setWidgetMultiStyle")));
			this.own(on(this.boxBorder2, "changing", lang.hitch(this, "setTempMultiWidgetStyle")));
			this._placeAt(this.boxBorder2, content);

			this.properties.appendChild(parent);
			this.borderDiv = parent;

			/**
			* Hide complex widget. If not slider is fucked up
			*/
			css.add(parent, "MatcToolbarBoxBorderSimple");
		},

		_renderInheritedWidget (){
			const db = new DomBuilder();
			const parent = this.createSection('Inherited Widget', true);

			const content = document.createElement("div");
			css.add(content, "MatcToolbarSectionContent");
			parent.appendChild(content);
			
			db.div(" MatcToolbarItem ").h(80)
				.span("", "This widget is inherited form a master screen. To change it, you have to enbale editing.")
				.build(content);

				const enable = db
				.div(" MatcToolbarItem")
				.div("MatcToolbarButton MatcButton", "Enable Editing")
				.build(content);

			this.own(on(enable, "click", lang.hitch(this, "enableInheritedWidget")));

			this.properties.appendChild(parent);
			this.inheritedWidgetDiv = parent;
		},

		_renderWidgetColor (cssProps = ['color']) {


			this.designTokenText = this.createDesignTokenBtn('color', cssProps)
			var parent = this.createSection('Color', true, this.designTokenText);

			var content = document.createElement("div");
			css.add(content, "MatcToolbarSectionContent");
			parent.appendChild(content);



			this.color = this.$new(ToolbarColor, {hasPicker:true, chevron:false, hex:true});
			this.color.keepOpenOnTypeSelection = "widget";
			this.color.reposition = true;
			this.color.updateLabel = true;
			this.color.setModel(this.model);
			this.color.setCssProps(cssProps)
			this.own(on(this.color, "change", lang.hitch(this, "setWidgetStyle", "color")));
			this.own(on(this.color, "changing", lang.hitch(this, "setTempWidgetStyle", "color")));
			this._placeAt(this.color, content);
			this.addTooltip(this.color.domNode, "Font Color");
			/**
			 * FIXME: We should not expose child widgets...
			 */
			this.colorWidgets.push(this.color)


			this.properties.appendChild(parent);
			this.textColorDiv = parent;

		},

		_renderWidgetText (cssProps = ['fontSize', 'fontWeight', 'fontFamily', 'textAlign', 'letterSpacing', 'lineHeight', 'fontStyle', 'verticalAlign', 'fontWeight', 'textDecoration', 'textShadow']){


			this.designTokenText = this.createDesignTokenBtn('text', cssProps)
			var parent = this.createSection('Text', true, this.designTokenText);

			this.textProperties = this.$new(TextProperties)
			this.textProperties.setModel(this.model)
			this.textProperties.setCssProps(cssProps)
			this.textProperties.setFontFamilies(this._getFontFamilies())
			this.textProperties.placeAt(parent)
			this.own(on(this.textProperties, "change", lang.hitch(this, "setWidgetStyle")));
			this.own(on(this.textProperties, "changing", lang.hitch(this, "setTempWidgetStyle")));
			this.own(on(this.textProperties, "toggle", lang.hitch(this, "toggleStyle")));

			this.properties.appendChild(parent);
			this.textDiv = parent;

		},


		/*****************************************************************************************************
		* Multli Widget
		****************************************************************************************************/

		_renderMultiPosition (){

			var parent = this.createSection("Position");

			var content = document.createElement("div");
			css.add(content, "MatcToolbarSectionContent");
			parent.appendChild(content);


			this.multiPositionCheckBox = this.$new(CheckBox);
			this.multiPositionCheckBox.setLabel("Fixed In Simulator");
			this.addTooltip(this.multiPositionCheckBox.domNode, "The element will not scroll in the simulator.")
			css.add(this.multiPositionCheckBox.domNode, "MatcToolbarItem");
			this.own(on(this.multiPositionCheckBox, "change", lang.hitch(this, "setWidgetStyle", "fixed")));
			this.multiPositionCheckBox.placeAt(content)


			this.properties.appendChild(parent);
			this.multiPositionDiv = parent;
		},


		/*****************************************************************************************************
		* Render screen
		****************************************************************************************************/
		_renderScreenName (){

			var parent = this.createSection("Name");

			var content = document.createElement("div");
			css.add(content, "MatcToolbarSectionContent");
			parent.appendChild(content);

			this.screenName = this.createInput(content, "Screen Name");
			css.add(this.screenName, "MatcToobarNameInput")
			this.own(on(this.screenName, "change", lang.hitch(this, "onScreenNameChange")));

			this.properties.appendChild(parent);
			this.screenNameDiv = parent;
		},

		_renderScreenShape (){

			var parent = this.createSection("Shape");

			var content = document.createElement("div");
			css.add(content, "MatcToolbarSectionContent");
			parent.appendChild(content);


			this.screenSize = this.$new(BoxSize, {mode:"widthAndHeight"});
			this.own(on(this.screenSize, "change", lang.hitch(this, "setScreenSize")));
			this.screenSize.placeAt(content);

			this.properties.appendChild(parent);
			this.screenShapeDiv = parent;
		},

		_renderScreenBackground (cssProps = ['background']){


			this.designTokenScreenBackground = this.createDesignTokenBtn('color', cssProps)

			var parent = this.createSection( "Background", true, this.designTokenScreenBackground);
			var content = document.createElement("div");
			css.add(content, "MatcToolbarSectionContent");
			parent.appendChild(content);

			/**
			* back ground color is for every one :-D
			*/
			this.screenBackgroundColor = this.$new(ToolbarColor, {hasGradient:true, hasPicker:true, chevron:false, hex:true});
			this.screenBackgroundColor.updateLabel  = true;
			this.screenBackgroundColor.keepOpenOnTypeSelection = "screen";
			this.screenBackgroundColor.setCssProps(cssProps)
			this.screenBackgroundColor.setModel(this.model);
			this.own(on(this.screenBackgroundColor, "change", lang.hitch(this, "setScreenStyle", "background")));
			this.own(on(this.screenBackgroundColor, "changing", lang.hitch(this, "setTempScreenStyle", "background")));
			this._placeAt(this.screenBackgroundColor, content);


			this.properties.appendChild(parent);
			this.screenBackDiv = parent;
		},


		_renderScreenImage () {

			var parent = this.createSection( "Image", true);

			var content = document.createElement("div");
			css.add(content, "MatcToolbarSectionContent");
			parent.appendChild(content);

			this.screenBackgroundImage = this.$new(ToolbarImage, {mode:this.mode});
			this.screenBackgroundImage.setJwtToken(this.jwtToken)
			this.screenBackgroundImage.setCanvas(this.canvas);
			this.own(on(this.screenBackgroundImage, "change", lang.hitch(this, "setScreenStyle", "backgroundImage")));
			this._placeAt(this.screenBackgroundImage, content);

			this.screenImageRepeat = this.$new(CheckBox);
			this.screenImageRepeat.setLabel("Repeat Image");
			css.add(this.screenImageRepeat.domNode, "MatcToolbarItem");
			this.own(on(this.screenImageRepeat, "change", lang.hitch(this, "setScreenStyle", "backgroundImageRepeat")));

			const screenImageRepeatDiv = document.createElement('div')
			content.append(screenImageRepeatDiv)
			this.screenImageRepeat.placeAt(screenImageRepeatDiv)

			this.screenImageRepeatDiv = screenImageRepeatDiv
			this.screenImageDiv = parent;
			this.properties.appendChild(parent);
		},


		_renderScreenActions (){

			var parent = this.createSection("Actions");


			var content = document.createElement("div");
			css.add(content, "MatcToolbarSectionContent");
			parent.appendChild(content);

			this.screenActionBTN = this.$new(ActionButton);
			this.screenActionBTN.placeAt(content);
			this.screenActionBTN.setModel(this.model);
			this.own(on(this.screenActionBTN, "toggleLine", lang.hitch(this, "toggleLineHide")));
			this.own(on(this.screenActionBTN, "newLine", lang.hitch(this, "toolNewLine")));
			this.own(on(this.screenActionBTN, "newTransformLine", lang.hitch(this, "toolNewTransformLine")));
			this.own(on(this.screenActionBTN, "removeLine", lang.hitch(this, "removeLine")));
			this.own(on(this.screenActionBTN, "removeLineById", lang.hitch(this, "removeLineById")));
			this.own(on(this.screenActionBTN, "setLinePropertyByID", lang.hitch(this, "setLinePropertyByID")));
			this.own(on(this.screenActionBTN, "setLineProperty", lang.hitch(this, "setLineProperty")));
			this.own(on(this.screenActionBTN, "updateLineByID", lang.hitch(this, "updateLineByID")));
			this.own(on(this.screenActionBTN, "newAction", lang.hitch(this, "newAction")));
			this.own(on(this.screenActionBTN, "removeAction", lang.hitch(this, "removeAction")));
			this.own(on(this.screenActionBTN, "updateAction", lang.hitch(this, "updateAction")));

			this.properties.appendChild(parent);
			this.screenActionDiv = parent;
		},


		_renderScreenAnimations (){

			var parent = this.createSection("Animations");

			var content = document.createElement("div");
			css.add(content, "MatcToolbarSectionContent");
			parent.appendChild(content);

			/**
			* Animation
			*/
			var db = new DomBuilder();

			var add = db.div(" MatcPointer MatcToolbarItem MatcToolbarIconButton").build(content);
			add.appendChild(iconDOM('Animation'))
			db.span("MatcToolbarItemLabel", "Loading Animation").build(add);
			this.tempOwn(on(add, touch.press, lang.hitch(this, "showAnimationDialog", "ScreenLoaded")));

			this.properties.appendChild(parent);
			this.screenAnimationDiv = parent;
		},

		_renderScreenInheritance (){
			var parent = this.createSection( "Master Screens");

			var content = document.createElement("div");
			css.add(content, "MatcToolbarSectionContent");
			parent.appendChild(content);

			this.screenParentList = this.$new(ScreenList);
			this.screenParentList.setJwtToken(this.jwtToken);
			this.screenParentList.setModel(this.model);
			this.screenParentList.placeAt(content);
			this.own(on(this.screenParentList, "change", lang.hitch(this, "setScreenParent")));

			this.properties.appendChild(parent);
			this.screenParentsDiv = parent;
		},

		_renderScreenDownload () {

			var parent = this.createSection( "Export");

			var content = document.createElement("div");
			css.add(content, "MatcToolbarSectionContent");
			parent.appendChild(content);

			this.screenDownLoad = this.$new(Downloader);
			this.screenDownLoad.setModel(this.model);
			this.screenDownLoad.setJwtToken(this.jwtToken);
			this.screenDownLoad.placeAt(content);

			this.screenExport = this.$new(CSSExporter);
			this.screenExport.setHash(this.hash);
			this.screenExport.setModel(this.model);
			this.screenExport.placeAt(content);

			this.properties.appendChild(parent);
			this.screenDownloadDiv = parent;

		},

		_renderScreen (){

			var parent = this.createSection( "Settings");

			var content = document.createElement("div");
			css.add(content, "MatcToolbarSectionContent");
			parent.appendChild(content);

			this.screenStart = this.$new(CheckBox);
			this.screenStart.setLabel("Start Screen");
			css.add(this.screenStart.domNode, "MatcToolbarItem");
			this.own(on(this.screenStart, "change", lang.hitch(this, "setScreenStart", "start")));
			this._placeAt(this.screenStart, content);

			var item = document.createElement("div");
			css.add(item, " ");
			content.appendChild(item);


			this.screenSegmentCheckbox = this.$new(CheckBox);
			this.screenSegmentCheckbox.setLabel("Segment");
			this.addTooltip(this.screenSegmentCheckbox.domNode, "The screen can be included in others")
			css.add(this.screenSegmentCheckbox.domNode, "MatcToolbarItem");
			this.own(on(this.screenSegmentCheckbox, "change", lang.hitch(this, "setScreenSegement", "segment")));
			this.screenSegmentCheckbox.placeAt(item)

			item = document.createElement("div");
			css.add(item, " ");
			content.appendChild(item);

			this.screenOverlayCheckBox = this.$new(CheckBox);
			this.screenOverlayCheckBox.setLabel("Overlay");
			this.addTooltip(this.screenOverlayCheckBox.domNode, "The screen will be shown as an overlay")
			css.add(this.screenOverlayCheckBox.domNode, "MatcToolbarItem");
			this.own(on(this.screenOverlayCheckBox, "change", lang.hitch(this, "setScreenStyle", "overlay")));
			this.screenOverlayCheckBox.placeAt(item)

			item = document.createElement("div");
			css.add(item, " ");
			content.appendChild(item);

			this.screenFixedOverlayCheckBox = this.$new(CheckBox);
			this.screenFixedOverlayCheckBox.setLabel("Fixed as overlay");
			this.addTooltip(this.screenFixedOverlayCheckBox.domNode, "The element will not scroll in the simulator when shows as overlay")
			css.add(this.screenFixedOverlayCheckBox.domNode, "MatcToolbarItem");
			this.own(on(this.screenFixedOverlayCheckBox, "change", lang.hitch(this, "setScreenStyle", "fixed")));
			this.screenFixedOverlayCheckBox.placeAt(item)


			this.screenBlurOverlayCheckBox = this.$new(CheckBox);
			this.screenBlurOverlayCheckBox.setLabel("Blur Background");
			this.addTooltip(this.screenBlurOverlayCheckBox.domNode, "The background screen will be blured")
			css.add(this.screenBlurOverlayCheckBox.domNode, "MatcToolbarItem");
			this.own(on(this.screenBlurOverlayCheckBox, "change", lang.hitch(this, "setScreenStyle", "blur")));
			this.screenBlurOverlayCheckBox.placeAt(item)

			/**
			* Since 2.4 we allow to show the background
			*/
			this.screenBackgroundOverlayCheckBox = this.$new(CheckBox);
			this.screenBackgroundOverlayCheckBox.setLabel("Show Background");
			this.addTooltip(this.screenBackgroundOverlayCheckBox.domNode, "The background color will be shown")
			css.add(this.screenBackgroundOverlayCheckBox.domNode, "MatcToolbarItem");
			this.own(on(this.screenBackgroundOverlayCheckBox, "change", lang.hitch(this, "setScreenStyle", "hasBackground")));
			this.screenBackgroundOverlayCheckBox.placeAt(item)


			//var db = new DomBuilder();
			//var add = db.div(" MatcPointer MatcToolbarItem ").build(content);
			//db.span("MatcToolbarSmallIcon mdi mdi-video").build(add);
			//db.span("MatcToolbarItemLabel", "Animations").build(add);
			//this.tempOwn(on(add, touch.press, lang.hitch(this, "showAnimationDialog", "ScreenLoaded")));
			//this.addTooltip(add, "Define an animation which is run when the screen is loaded");


			this.properties.appendChild(parent);
			this.screenDIV = parent;
		},



		/*****************************************************************************************************
		* ANIMATION Properties
		****************************************************************************************************/

		showAnimationDialog (type, e){
			this._showAnimationComposer(this._selectedScreen, type, e.target);
		},

		showAdvancedAnimationDialog:function(line){
			var screen = this.model.screens[line.to];
			if (screen) {
				this._showAnimationComposer(screen, "ScreenLoaded");
			} else {
				console.debug("showAdvancedAnimationDialog() > No Screen for ", line);
			}
		},


		/*****************************************************************************************************
		* show properties section and make sure the scroll bar is moved too!
		****************************************************************************************************/

		showSaveButton (){
			if(this.user.role=="guest"){
				// css.remove(this.signupSection,"MatcToolbarSectionHidden" );
			}
			
		},


		showProperties (){
			css.remove(this.propertiesCntr, "MatcToolbarSectionHidden");
			if(this.canvas){
				css.add(this.canvas.scrollRight, "MatcCanvasScrollBarRightOpen");
				css.add(this.canvas.scrollBottom, "MatcCanvasScrollBarBottomOpen");
			}
			//this.hasEditModeButton = hasEditModeButton
			css.add(this.widgetViewSection, "MatcToobarViewSectionVisible");
		},

		hideProperties (){
			css.add(this.propertiesCntr, "MatcToolbarSectionHidden");
			if(this.canvas){
				css.remove(this.canvas.scrollRight, "MatcCanvasScrollBarRightOpen");
				css.remove(this.canvas.scrollBottom, "MatcCanvasScrollBarBottomOpen");
			}
			css.remove(this.widgetViewSection, "MatcToobarViewSectionVisible");
		},


		storePropertiesState (){

			if(this._selectionID && this.propertiesCntr){
				var state = {x : 0, scrollTop : -1, sections :[]};
				for(var i=0; i< this.sections.length; i++){
					var section = this.sections[i];
					state.sections[i] = css.contains(section, "MatcToolbarSectionCollabsed");
				}
				// TODO: This forces a reflow :(
				// state.scrollTop = this.propertiesCntr.scrollTop;
				state.view = this.widgetViewModeBtn.getValue();
				this.propertiesStates[this._selectionID] = state;
			}
		},

		restorePropertiesState (){

			var settings = this.getSettings();

			if(this._selectionID != this._currentSelectionID){
				if(settings.storePropView){
					if(this._selectionID && this.propertiesStates[this._selectionID]){

						if(this._selectionID != this._currentSelectionID){
							let state =this.propertiesStates[this._selectionID];
							for(let i=0; i< this.sections.length; i++){
								let section = this.sections[i];
								if(state.sections[i]){
									css.add(section, "MatcToolbarSectionCollabsed");
								} else {
									css.remove(section, "MatcToolbarSectionCollabsed");
								}
							}
							if(state.scrollTop >=0){
								/**
								* somehow delay the setting of the scroll a little
								* so it is correctly rendered.
								*/
								requestAnimationFrame(() => {
									this.propertiesCntr.scrollTop = state.scrollTop;
								});
							}
							this.widgetViewModeBtn.setValue(state.view);
						}
					} else {
						/**
						* Default behavior, expand all and scroll to top
						*/
						for(let i=0; i< this.sections.length; i++){
							let section = this.sections[i];
							css.remove(section, "MatcToolbarSectionCollabsed");
						}
						let me = this;
						setTimeout(function(){
							me.propertiesCntr.scrollTop = 0;
						},1);

						this.widgetViewModeBtn.setValue("style");
					}
				} else {
					/**
					* always scroll to top
					*/
					let me = this;
					setTimeout(function(){
						me.propertiesCntr.scrollTop = 0;
					},1);
				}
			}

			this._currentSelectionID  = this._selectionID;
		},


		/*****************************************************************************************************
		* Helpers
		****************************************************************************************************/


		createInput (content,placeholder){
			var div = document.createElement("div");
			css.add(div, " MatcToolbarItem ");
			content.appendChild(div);

			let input = document.createElement("input");
			css.add(input, "MatcIgnoreOnKeyPress MatcToobarInlineEdit MatcToobarInput");
			div.appendChild(input);

			if(placeholder){
				input.placeholder = placeholder;
			}
			return input;
		},


		createSection (lbl, hasTemplateMarker, plusCallback, settingsCallback){

			var parent = document.createElement("div");
			css.add(parent, "MatcToolbarSection");

			var header = this.createSectionHeader( parent, lbl,hasTemplateMarker, plusCallback, settingsCallback);

			/**
			* store the value somehow in a cookie? and use it during restore??
			*/
			this.own(on(header, touch.press, function(){
				css.toggle(parent, "MatcToolbarSectionCollabsed");
				return false;
			}));

			this.sections.push(parent);

			return parent;
		},

		createSectionHeader (parent, lbl, hasTemplateMarker, designTokenWidget, settingsCallback){
			var div = document.createElement("div");
			if (lbl){
				css.add(div,"MatcToolbarSectionLabel");
				parent.appendChild(div);
				div.textContent = lbl;
			}

			if(hasTemplateMarker){
				var span = document.createElement("span");
				css.add(span, "MatcToolbarSectionMarker");
				span.textContent=" *";
				div.appendChild(span);

				if(!this.templateMarkers){
					this.templateMarkers = [];
				}
				this.templateMarkers.push(span);
			}

			if (settingsCallback){
				const icon = iconDOM('SettingsCog', 'MatcToolbarSectionSettingsIcon')
				div.appendChild(icon);
				this.own(on(icon, touch.press, lang.hitch(this, settingsCallback)));
			}

			if (designTokenWidget) {
				let cntr = document.createElement("span");
				css.add(cntr, "MatcToolbarSectionDesignSystemCntr");
				designTokenWidget.placeAt(cntr)
				div.appendChild(cntr);
			}

			//var chev = document.createElement("span");
			//css.add(chev, "MatcToolbarSectionChevron mdi mdi-chevron-down");
			//div.appendChild(chev);

			return div;
		},

		createDesignTokenBtn (tokenType, cssProps) {
			let btn = this.$new(DesignTokenBtn)
			btn.setTokenType(tokenType)
			btn.setCssProps(cssProps)
			this.own(on(btn, "new", lang.hitch(this, "newDesignToken")));
			this.own(on(btn, "link", lang.hitch(this, "linkDesignToken")));
			this.own(on(btn, "unlink", lang.hitch(this, "unlinkDesignToken")));
			this.designTokenBtns.push(btn)
			return btn
		},

		createToolBarItem (label, callback, clazz, parent){
			var a = document.createElement("a");
			css.add(a,"MatcToolbarItem");
			a.innerHTML =label;
			if(clazz){
				css.add(a, clazz);
			}
			if(callback){
				this.tempOwn(on(a, touch.press, lang.hitch(this, callback)));
			}
			if(!parent){
				this.properties.appendChild(a);
			} else {
				parent.appendChild(a);
			}
			return a;
		},

		createToolBarButton (label, clazz, parent){

			var item = document.createElement("div");
			css.add(item, "MatcToolbarItem ");
			parent.appendChild(item);

			var btn = document.createElement("div");
			css.add(btn, "MatcButton MatcToolbarButton " + clazz);
			btn.innerHTML=label
			item.appendChild(btn);

			return item;
		},

		cleanUpUI (){
			this.hideAllSections();
			this.hideCopyPaste();

			if(this.distributeBtn) {
				css.remove(this.distributeBtn, "MatcToolbarItemActive");
			}

			if(this.replicateBtn) {
				css.remove(this.replicateBtn, "MatcToolbarItemActive");
			}
		},

		_getFontFamilies (){
			let fonts = [
				{ value: 'Helvetica Neue,Helvetica,Arial,sans-serif', label: "Helvetica Neue",  css:"MatchFont MatchFontHelvetica"},
				{ value:"Arial, sans-serif", label:"Arial", css:"MatchFont MatchFontArial"},
				{ value: 'Arial Black, Gadget, sans-serif', label : "Arial Black", css:"MatchFont MatchFontArialBlack"},

				{ value: 'Inter, sans-serif', label: "Inter",  css:"MatchFont MatchSourceInter"},
				{ value: 'Source Sans Pro, sans-serif', label: "Source Sans Pro",  css:"MatchFont MatchSourceSansPro"},
				{ value: 'Roboto, sans-serif', label: "Roboto",  css:"MatchFont MatchFontRoboto"},

				{ value:"Comic Sans MS, cursive, sans-serif", label:"Comic Sans MS", css:"MatchFont MatchFontComic"},
				{ value:"Impact, Charcoal, sans-serif", label:"Impact", css:"MatchFont MatchFontImpact"},
				{ value:"Lucida Sans Unicode, Lucida Grande, sans-serif", label:"Lucida", css:"MatchFont MatchFontLucida"},
				{ value:"Tahoma, Geneva, sans-serif", label:"Tahoma", css:"MatchFont MatchFontTahoma"},

				{ css:"MatcToolbarPopUpLine"},
				{ value:"Georgia, serif", label:"Georgia", css:"MatchFont MatchFontGeorgia"},
				{ value : '"Palatino Linotype", "Book Antiqua", Palatino, serif', label:"Palatino", css: "MatchFontPalatino"},
				{ value: 'Times New Roman, Times, serif', label:"Times New Roman", css:" MatchFont MatchFontTimesNewRoman"},

				{ css:"MatcToolbarPopUpLine"},
				{ value:"Courier New, Courier, monospace", label:"Courier New", css:"MatchFont MatchFontCourier"}
			];

			if (this.model.fonts) {
				fonts.push({ css:"MatcToolbarPopUpLine"});
				this.model.fonts.forEach(f => {
					if (f){
						fonts.push({
							value: f.name,
							label: f.name,
							font: f.name,
							css: 'MatchFont'
						})
					}
				})
			}

			fonts.push({ css:"MatcToolbarPopUpLine"})
			fonts.push({ value:"", label:"More...", css:"MatchFont", callback: lang.hitch(this, 'showFontDialog')})

			return fonts
		},

		updateFontFamilies () {
			if (this.textProperties){
				this.textProperties.setFontFamilies(this._getFontFamilies());
				this.designTokenList.setFontFamilies(this._getFontFamilies());
			}
		},

		updateImports () {
			if (this.createBTN) {
				this.createBTN.updateImports()
			}
		},

		_getCreateList (){
			console.error('_getCreateList() IS DECRCATED')
			return [
				{value: "Screen", label: "Screen"},
				{css:"MatcToolbarPopUpLine"},
				{value:null, label:"Widgets", children: [
					{value: "Box", label: "Box"},
					{value: "Button", label: "Button"},
					{value: "Label", label: "Label"},
					{value: "Image", label: "Image"},
					{value: "HotSpot", label: "HotSpot"},
					{value: "TextBox", label: "TextBox"}
				]},
				{css:"MatcToolbarPopUpLine"},
				{value: "Templates", label: "Templates", children: this._getTemplates()}
			];

		},

		_getTemplates:function(){
			var result = [];

			if(this.model.templates){
				for(var id in this.model.templates){
					var t = this.model.templates[id];
					if(t.visible){
						var option = {
								value : id,
								label : t.name,
								removeable :true,
								callback:lang.hitch(this, "onNewTemplate", id, t.type)
						};
						result.push(option);
					}

				}
			}
			return result;
		},

		_getOpacity:function(){
			var values= [];
			for(var i=1; i< 11; i++){
				values.push({ value: (i /10), label:i*10 +"%"});
			}
			return values;
		},


		_placeAt (widget, node){
			widget.placeAt(node);
			this._addChildWidget(widget);
		},

		_addChildWidget (w){
			if(!this._childWidgets){
				this._childWidgets = [];
			}
			this._childWidgets.push(w);
		},

		_destroyChildWidget (){
//			if(this._childWidgets){
//				for(var i=0; i< this._childWidgets.length; i++){
//					//this._childWidgets[i].destroy();
//				}
//			}
			delete this._childWidgets;
		}
    },
    mounted () {
    }
}
</script>
