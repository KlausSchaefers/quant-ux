<script>
import DojoWidget from 'dojo/DojoWidget'
import lang from 'dojo/_base/lang'
import css from 'dojo/css'
import on from 'dojo/on'
import touch from 'dojo/touch'
// import win from 'dojo/win'
import _Tooltip from 'common/_Tooltip'
import CheckBox from 'common/CheckBox'
// import Dialog from 'common/Dialog'
import DomBuilder from 'common/DomBuilder'
import ScrollContainer from 'common/ScrollContainer'
import ToolbarDropDownButton from 'canvas/toolbar/ToolbarDropDownButton'
import ToolbarSelector from 'canvas/toolbar/ToolbarSelector'
import ToolbarToggleButton from 'canvas/toolbar/ToolbarToggleButton'
import ToolbarColor from 'canvas/toolbar/ToolbarColor'
import ToolbarImage from 'canvas/toolbar/ToolbarImage'
// import ToolbarBorder from 'canvas/toolbar/ToolbarBorder'
import BoxShadow from 'canvas/toolbar/BoxShadow'
import TextShadow from 'canvas/toolbar/TextShadow'
import BoxSize from 'canvas/toolbar/BoxSize'
import BoxBorder from 'canvas/toolbar/BoxBorder'
import BoxBorder2 from 'canvas/toolbar/BoxBorder2'
import BoxPadding from 'canvas/toolbar/BoxPadding'
import InputDropDownButton from 'canvas/toolbar/InputDropDownButton'
import CreateButton from 'canvas/toolbar/CreateButton'
import ActionButton from 'canvas/toolbar/ActionButton'
import DataSection from 'canvas/toolbar/DataSection'
// import TabContainer from 'canvas/toolbar/TabContainer'
// import ChildSection from 'canvas/toolbar/ChildSection'
import ScreenImportAdd from 'canvas/toolbar/ScreenImportAdd'
import ScreenList from 'canvas/toolbar/ScreenList'
import ValidationSection from 'canvas/toolbar/ValidationSection'
// import ActionSettings from 'canvas/toolbar/ActionSettings'
import Downloader from 'canvas/toolbar/Downloader'
import ToolbarImagePosition from 'canvas/toolbar/ToolbarImagePosition'
import Radius from 'canvas/toolbar/Radius'
import CSSExporter from 'canvas/toolbar/CSSExporter'
import Resize from 'canvas/toolbar/Resize'
import Services from 'services/Services'
import RulerSection from 'canvas/toolbar/RulerSection'
import LowCodeSection from 'canvas/toolbar/LowCodeSection'
import CallBackSection from 'canvas/toolbar/CallBackSection'
import LowCodeResponsiveSection from 'canvas/toolbar/LowCodeResponsiveSection'
import ImageRotate from 'canvas/toolbar/ImageRotate'

// import ContactButton from 'canvas/toolbar/ContactButton'
// import Notification from 'page/Notification'
// import HelpButton from 'help/HelpButton'

export default {
    name: '_Render',
    mixins:[_Tooltip, DojoWidget],
    data: function () {
        return {
					hasPadding : ["Button", "DateDropDown", "DropDown", "TypeAheadTextBox", "MobileDropDown", "Label", "TextBox",
								"TextArea", "Password", "SegmentButton", "ToggleButton", "Table", 'Tree', 'VerticalNavigation', 'Paging'],
					hasData : ["ToggleButton", "DateDropDown", "SegmentButton", "DropDown", "MobileDropDown", "TextBox", "TextArea", "Password",
								"CheckBox", "RadioBox", "RadioBox2", "HSlider", "Spinner", "Switch", "DragNDrop", "Date", "DateDropDown", "Icon", "Table", "Rating",
								"IconToggle","HoverDropDown", "ImageCarousel", "Stepper", "TypeAheadTextBox", "BarChart", "RingChart", "PieChart", "MultiRingChart",
								"LabeledIconToggle", "LogicOr", "CheckBoxGroup", "RadioGroup", "Repeater", "Camera", "Rest",
								'ProgressBar', 'ScreenSegment', 'CountingStepper', "Tree", "VerticalNavigation", 'IconButton', 'Timeline'],
					hasActiveData: ["DateDropDown"],
					// validation == databining
					hasValidation : ["TextBox", "TextArea", "TypeAheadTextBox", "Password", "CheckBox", "Switch", "Date", "DateDropDown",
									"MobileDropDown", "DropDown", "Label", "SegmentButton", "Spinner", "HSlider", "Stepper","Rating" ,
									"IconToggle", "TypeAheadTextBox", "ToggleButton", "CheckBoxGroup", "RadioGroup",
									"RadioBox2", "Upload", "Camera", "UploadPreview", 'Repeater', 'ProgressBar', 'ImageCarousel',
									'RingChart', 'BarChart', 'PieChart', 'MultiRingChart', 'CountingStepper', 'Tree', 'VerticalNavigation',
									'Table', 'Paging', 'Timeline', 'LabeledIconToggle'],
					hasLogic2: ["LogicOr", "Rest"],
					hasErrorViewMode : ["TextBox", "Password", "CheckBox", "Switch", "DropDown", "MobileDropDown", "DateDropDown", "TypeAheadTextBox"],
					hasFocusViewMode : ["TextBox", "Password", "DropDown", "MobileDropDown", "TextArea", "TypeAheadTextBox"],
					hasCheckedViewMode : ["CheckBox", "RadioBox"],
					hasActiveViewMode : ["SegmentButton", "ToggleButton","VolumeSlider", "Tree", "VerticalNavigation", 'Paging', 'Upload'],
					hasHoverViewMode: ["Box", "Button", "Label", "ToggleButton", "DragNDrop", "Upload", "WebLink", "Tree", "VerticalNavigation", "Stepper", "Paging"],
					hasPopupViewMode: ["DropDown", "DateDropDown", "MobileDropDown"],
					hasValign: ["Box", "Button", "Label", "Upload", "WebLink", "IconButton", "Paging"],
					hasRotate: ['Image', 'Icon'],
					hideAction: ['ScreenSegment'],
					colorWidgets: [],
					isDataView: false,

      }
	},
    components: {},
    methods: {
        onModeChange:function(){

			if (this.domNode && this.selectBtn){
				css.remove(this.selectBtn, "MatcToolbarItemActive");
				css.remove(this.addSection, "MatcToolbarItemActive");
				css.remove(this.moveTool, "MatcToolbarItemActive");
				css.remove(this.editTool, "MatcToolbarItemActive");
				css.remove(this.importSection, "MatcToolbarItemActive");
				css.remove(this.hotspotTool, "MatcToolbarItemActive" );
				css.remove(this.textTool, "MatcToolbarItemActive");
				css.remove(this.rectangleTool, "MatcToolbarItemActive" );
				css.remove(this.addLogicSection, "MatcToolbarItemActive" );
				css.remove(this.addRestSection, "MatcToolbarItemActive" );


				if(this.mode == "select"){
					css.add(this.selectBtn, "MatcToolbarItemActive");
				}
				if(this.mode == "move"){
					css.add(this.moveTool, "MatcToolbarItemActive");
				}
				if(this.mode == "edit"){
					css.add(this.editTool, "MatcToolbarItemActive");
				}
				if(this.mode == "add"){
					css.add(this.addSection, "MatcToolbarItemActive");
				}
				if(this.mode == "import"){
					css.add(this.importSection, "MatcToolbarItemActive");
				}
				if(this.mode == "hotspot"){
					css.add(this.hotspotTool, "MatcToolbarItemActive" );
				}
				if(this.mode == "addText"){
					css.add(this.textTool, "MatcToolbarItemActive" );
				}
				if(this.mode == "addBox"){
					css.add(this.rectangleTool, "MatcToolbarItemActive" );
				}
				if(this.mode == "addLogic"){
					css.add(this.addLogicSection, "MatcToolbarItemActive" );
				}
				if(this.mode == "addRest"){
					css.add(this.addRestSection, "MatcToolbarItemActive" );
				}
			} else {
				console.error("Toolvar_Render.onModeChange() > View Destoyed...")
			}
		},


		setWidgetViewModel:function(){
			if(this._selectedWidget){
				this.hideAllSections();
				this.showWidgetProperties(this._selectedWidget);
			}
		},

		/**********************************************************************
		 * Tooling rendering!
		 **********************************************************************/


		toolCopyPasteStyleStart:function(){
			css.add(this.copyStyleBtn,"MatcToolbarItemActive");
		},

		toolCopyPasteStyleEnd:function(){
			css.remove(this.copyStyleBtn,"MatcToolbarItemActive");
		},

		toolAlignStart:function(value){
			this.toolAlignEnd();
			if(this.align){
				css.add(this.align.domNode,"MatcToolbarItemActive");
			} else {
				var node = this.alignButtons[value];
				if(node){
					css.add(node,"MatcToolbarItemActive");
				}
			}
		},

		toolAlignEnd:function(){
			if(this.align){
				css.remove(this.align.domNode,"MatcToolbarItemActive");
			} else {
				for(var key in this.alignButtons){
					css.remove(this.alignButtons[key],"MatcToolbarItemActive");
				}
			}
		},

		toolUpdateWidgetButton:function(){
			this.createBTN.highlight();
		},

		toolNewLine:function(e){
			var screens = [];
			for(var id in this.model.screens){
				screens.push(this.model.screens[id]);
			}
			this.onNewLine(e)
		},

		toolNewTransformLine:function(e){
			this.onNewTransformLine(e);

		},


		/**********************************************************************
		 * Rending stuff
		 **********************************************************************/

		renderToolbar:function(){
			this.logger.log(2,"renderToolbar", "enter");

			this.jwtToken = Services.getUserService().getToken()

			/**
			 * now we have to factory and create a menu
			 * for the widgets
			 */
			this.createBTN = this.$new(CreateButton);
			this.createBTN.setModel(this.model);
			this.tempOwn(on(this.createBTN, "change", lang.hitch(this, "onNewThemeObject")));
			this.tempOwn(on(this.createBTN, "importsChange", lang.hitch(this, "onImportChange")));
			css.add(this.createBTN.domNode, "MatcToolbarItem MatcToolbarDropDownButtonMiddle");
			this.createBTN.placeAt(this.addSection);


			this.screenCreateBtn = this.$new(ScreenImportAdd, {mode: this.mode});
			this.screenCreateBtn.setModel(this.model);
			this.tempOwn(this.screenCreateBtn.on( "onAdd", lang.hitch(this, "onNewThemeObject")));
			this.tempOwn(this.screenCreateBtn.on("onUpload", lang.hitch(this, "onThemedMultiScreen")));
			this.tempOwn(this.screenCreateBtn.on("onImport", lang.hitch(this, "showImportDialog")));

			css.add(this.screenCreateBtn.domNode, "MatcToolbarItem MatcToolbarDropDownButtonMiddle");
			this.screenCreateBtn.placeAt(this.addScreenSection);

			this.own(on(this.addLogicSection, touch.release, lang.hitch(this, "onNewLogicObject")));
			this.own(on(this.addRestSection, touch.release, lang.hitch(this, "onNewRestObject")));

			/**
			 * set model
			 */
			this.own(on(this.simulatorButton, touch.press, lang.hitch(this, "startSimilator")));

			/**
			 * Tools section
			 */
			this.layer = this.$new(ToolbarDropDownButton, {arrowPosition:false});
			this.layer.setLabel('<span class="mdi mdi-layers"></span><label class="MatcToolbarLabel">Order</label>');
			css.add(this.layer.domNode, "MatcToolbarDropDownButtonWide");
			this.layer.updateLabel = false;
			this.layer.setOptions([
			  {value: "front", label: "Bring to front (CTRL-&uarr;)", icon:"mdi mdi-arrange-bring-to-front"},
			  {value: "forward", label: "Bring forward", icon:"mdi mdi-arrange-bring-forward"},
			  {value: "backward", label: "Send backward", icon:"mdi mdi-arrange-send-backward"},
			  {value: "back", label: "Send back (CTRL-&darr;)", icon:"mdi mdi-arrange-send-to-back"}
			]);
			this.layer.updateSelection = false;
			this.own(on(this.layer, "change", lang.hitch(this, "onToolWidgetLayer")));
			this._placeAt(this.layer, this.toolsDiv);
			this.addTooltip(this.layer.domNode, "Change the layer of the element");

			this.createSpacer(this.toolsDiv);


			this.template = this.createToolBarItem('<span class="mdi mdi-puzzle"></span> <label class="MatcToolbarLabel">Make Symbol</label>', lang.hitch(this,"onToolCreateTemplate"), null, this.templateDiv);
			this.templateUpdate = this.createToolBarItem('<span class="mdi mdi-puzzle"></span> <label class="MatcToolbarLabel">Update Symbol</label>', lang.hitch(this,"onToolUpdateTemplate"), null, this.templateDiv);

			this.replicateBtn = this.createToolBarItem('<span class="MatcIconMirror mdi mdi-tab-unselected"></span> <label class="MatcToolbarLabel">Clone</label>', lang.hitch(this,"onToolbarReplicate"), null, this.templateDiv);

			this.distributeBtn = this.createToolBarItem('<span class="mdi mdi-view-grid"></span> <label class="MatcToolbarLabel">Responsive Resize</label>', lang.hitch(this,"onToolbarDistribute"), null, this.groupDIV);

			if(this.user.role=="admin"){
				this.createSpacer(this.templateDiv);
				this.createThemeBtn = this.createToolBarItem('<span class="glyphicon glyphicon-cloud-download"></span>', lang.hitch(this,"onToolCreateTheme"), null, this.templateDiv);
			}

			/**
			 * Notification
			 */

			// this.contactBtn = this.$new(ContactButton);
			/// this.contactBtn.placeAt(this.notificationSection);

			// this.helpBtn = this.$new(HelpButton, {isToolbar:true})
			// this.helpBtn.placeAt(this.notificationSection);

			// this.notificationBTN = this.$new(Notification);
			// this.notificationBTN.placeAt(this.notificationSection);

			this.logger.log(3,"renderToolbar", "exit");

		},



		render:function(){
			this.logger.log(3,"render", "entry");


			this.properties = document.createElement("div");
			css.add(this.properties, "MatcToobarPropertiesSectionCntr")


			this.sections = [];

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
			this._renderWidgetName();

			this._renderWidgetResponsive();

			this._renderInheritedWidget()

			this._renderWidgetLine();



			this._renderData();

			this._renderValidation();

			this._renderWidgetView();

			this._renderWidgetBackground();

			this._renderWidgetBorder();

			this._renderWidgetText();

			this._renderWidgetBox();

			/**
			 * render screen properties
			 */
			this._renderScreenName();

			this._renderScreen();

			this._renderScreenBackground();

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


		renderToolTips:function(){

			this.addTooltip(this.home, "Click here to exit");
			this.addTooltip(this.simulatorButton, "Start Simulation (No data will be stored)");


			this.addTooltip(this.addScreenSection, "Add / Import Screens (S)", "vommondToolTipLeft");
			this.addTooltip(this.addSection, "Add Widgets (W)", "vommondToolTipLeft");
			this.addTooltip(this.importSection, "Importing screens", "vommondToolTipLeft");
			this.addTooltip(this.editTool, "Edit mode", "vommondToolTipLeft");
			this.addTooltip(this.moveTool, "Move Canvas (SPACE)", "vommondToolTipLeft");
			this.addTooltip(this.commentBtn, "Add Comment", "vommondToolTipLeft");
			this.addTooltip(this.selectBtn, "Start Selection Tool (A)", "vommondToolTipLeft");
			this.addTooltip(this.hotspotTool, "Create Hotspot (H) over uploaded images", "vommondToolTipLeft");
			this.addTooltip(this.textTool, "Create Text (T)", "vommondToolTipLeft");
			this.addTooltip(this.rectangleTool, "Create Rectangle (R)", "vommondToolTipLeft");
			this.addTooltip(this.addLogicSection, "Create Logic Element to split links", "vommondToolTipLeft");
			this.addTooltip(this.addRestSection, "Web Service (BETA)", "vommondToolTipLeft");
			this.addTooltip(this.distributeBtn, "Distribute (D) object equally");

			this.addTooltip(this.undo, "Undo (CTRL+Z)");
			this.addTooltip(this.redo, "Redo (CTRL+Y)");

			this.addTooltip(this.copyBtn, "Copy (CTRL+C)");
			this.addTooltip(this.pasteBtn, "Paste (CTRL+V)");
			this.addTooltip(this.deleteBtn, "Remove (DELETE)");
			this.addTooltip(this.copyStyleBtn, "Copy Style");
			this.addTooltip(this.signupSection, "Sign Up for Free to save your changes...");
			this.addTooltip(this.template, "Create a reusable symbol. You can find it in the widget menu.");


			this.addTooltip(this.groupBTN, "Group (CTRL-G)");
			this.addTooltip(this.replicateBtn, "Clone selection (C)");
		},


		/***************************************************************************
		 * Icons
		 ***************************************************************************/

		async initIcons (){
			let icons = await Services.getSymbolService().getIcons()
			this._onIconsLoaded(icons)
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

		_renderGroupName:function(){
			var parent = this.createSection("Group Name");

			var content = document.createElement("div");
			css.add(content, "MatcToolbarSectionContent");
			parent.appendChild(content);

			this.groupName = this.createInput(content, "Group Name");
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
			this.addTooltip(this.groupPositionCheckBox.domNode, "The element will not scroll in the simualtor.")
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

			//let cntr = document.createElement("div");
			// css.add(cntr, '')

			//var statusBar = this.canvas.getStatusBar();

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


		_renderWidgetAlign:function(){

			var content = document.createElement("div");
			css.add(content, "MatcToolbarSectionContent");

			this.alignButtons = {};
			this.distButtons = {};

			var values = ["vertical", "horizontal"];

			for(let i=0; i< values.length; i++){
				let value = values[i];

				let a = document.createElement("a");
				css.add(a,"MatcToolbarItem MatcToolbarAlignButton");
				content.appendChild(a);

				let icon = document.createElement("span");
				css.add(icon, 'MatcToolbarIcon-' + value);
				a.appendChild(icon);

				let bar = document.createElement("span");
				css.add(bar, 'MatcToolbarIcon-' + value + "-bar");
				icon.appendChild(bar);

				this.tempOwn(on(a, touch.press, lang.hitch(this,"onToolDistributeElements", value)));

				this.alignButtons[value] = a;
				this.distButtons[value] = a;
				this.addTooltip(a, "Distribute <b>" + value + "</b>. ");
			}


			let icon = document.createElement("span");
			css.add(icon, 'MatcToolbarSpacer');
			content.appendChild(icon);


			values = ["top", "bottom", "left", "right", "vertical", "horizontal"];
			for(let i=0; i< values.length; i++){
				let value = values[i];
				let a = document.createElement("a");
				css.add(a,"MatcToolbarItem MatcToolbarAlignButton");
				content.appendChild(a);

				let icon = document.createElement("span");
				css.add(icon, 'glyphicon glyphicon-object-align-' + value);
				a.appendChild(icon);

				this.tempOwn(on(a, touch.press, lang.hitch(this,"onToolAlignElements", value)));
				this.alignButtons[value] = a;

				this.addTooltip(a, "Align <b>" + value + "</b>. After click select element to align to");
			}
			this.properties.appendChild(content);
			this.widgetAlignDiv = content;
		},

		_renderWidgetName:function(){

			var parent = this.createSection("Widget");

			var content = document.createElement("div");
			css.add(content, "MatcToolbarSectionContent");
			parent.appendChild(content);

			this.widgetName = this.createInput(content, "Widget Name");
			this.own(on(this.widgetName, "change", lang.hitch(this, "onWidgetNameChange")));

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
			this.widgetNameDiv = parent;
			this.widgetSizeDiv = widgetSizeDiv
		},

		_renderWidgetResponsive:function(){

			var parent = this.createSection("Constraints", true);

			var content = document.createElement("div");
			css.add(content, "MatcToolbarSectionContent");
			parent.appendChild(content);

			this.responsiveWidget = this.$new(Resize);
			this.responsiveWidget.setModel(this.model);
			this.responsiveWidget.placeAt(content);
			this.own(on(this.responsiveWidget, "change", lang.hitch(this, "setWidgetProps", "resize")));


			this.positionCheckBox = this.$new(CheckBox);
			this.positionCheckBox.setLabel("Fixed In Simulator");
			this.addTooltip(this.positionCheckBox.domNode, "The element will not scroll in the simualtor.")
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
			var parent = this.createSection("Rendering", true);
			var content = document.createElement("div");
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


		_renderData:function(){
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
			this.dataWidget.setCanvas(this.canvas);
			this.dataWidget.placeAt(dataDiv);
			this.dataWidget.setSectionHeader(parent);
			this.own(on(this.dataWidget, "propertyChange", lang.hitch(this, "setWidgetProps")));
			this.own(on(this.dataWidget, "stypeChange", lang.hitch(this, "setWidgetStyle")));
			this.own(on(this.dataWidget, "stypeChanging", lang.hitch(this, "setTempWidgetStyle")));
			this.own(on(this.dataWidget, "stypeMutlitChange", lang.hitch(this, "setWidgetMultiStyle")));

			this.properties.appendChild(parent);
			this.dataDiv = parent;
		},

		_renderValidation:function(){

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
			this.own(on(this.validationWidget, "stypeChange", lang.hitch(this, "setWidgetStyle")));
			this.own(on(this.validationWidget, "stypeMutlitChange", lang.hitch(this, "setWidgetMultiStyle")));

			this.properties.appendChild(parent);
			this.validationDiv = parent;
		},


		_renderWidgetLine:function(){

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


		_renderWidgetBox:function(){

			var parent = this.createSection( "Padding", true);

			var content = document.createElement("div");
			css.add(content, "MatcToolbarSectionContent");
			parent.appendChild(content);

			this.paddingWidget = this.$new(BoxPadding);
			this.own(on(this.paddingWidget, "change", lang.hitch(this, "setWidgetMultiStyle")));
			this.paddingWidget.placeAt(content);


			this.boxDiv = parent;
			this.properties.appendChild(parent);
		},

		_renderWidgetBackground:function(){

			var parent = this.createSection( "Background", true);

			var content = document.createElement("div");
			css.add(content, "MatcToolbarSectionContent");
			parent.appendChild(content);


			// background color
			this.backgroundColor = this.$new(ToolbarColor, {hasGradient : true, hasPicker:true, chevron:false});
			this.backgroundColor.updateLabel = true;
			this.backgroundColor.keepOpenOnTypeSelection = "widget";
			this.backgroundColor.setLabel('<span class="MatcToolbarColorIndicator"></span>');
			this.backgroundColor.setModel(this.model);
			this._placeAt(this.backgroundColor, content);
			this.own(on(this.backgroundColor, "change", lang.hitch(this, "setWidgetStyle", "background")));
			this.own(on(this.backgroundColor, "changing", lang.hitch(this, "setTempWidgetStyle", "background")));

			this.addTooltip(this.backgroundColor.domNode, "Background Color");
			this.colorWidgets.push(this.backgroundColor);

			// background image
			this.backgroundImage = this.$new(ToolbarImage, {mode:this.mode});
			this.backgroundImage.setCanvas(this.canvas);
			this.backgroundImage.setJwtToken(this.jwtToken);
			this.backgroundImage.setLabel('<span class="mdi mdi-image"></span>');
			this.own(on(this.backgroundImage, "change", lang.hitch(this, "setWidgetStyle", "backgroundImage")));
			this._placeAt(this.backgroundImage,content);
			this.addTooltip(this.backgroundImage.domNode, "Background Image");


			this.boxShadow = this.$new(BoxShadow);
			this.boxShadow.setModel(this.model)
			this.own(on(this.boxShadow, "change", lang.hitch(this, "setWidgetStyle", "boxShadow")));
			this._placeAt(this.boxShadow,content);
			this.addTooltip(this.boxShadow.domNode, "Box Shadow");

			this.opacity = this.$new(ToolbarDropDownButton);
			this.opacity.setLabel('<span class="mdi mdi-contrast"></span>');
			this.opacity.updateLabel = false;
			this.opacity.reposition = true;
			this.opacity.setOptions(this._getOpacity());
			this.own(on(this.opacity, "change", lang.hitch(this, "setWidgetStyle", "opacity")));
			this._placeAt(this.opacity, content);
			this.addTooltip(this.opacity.domNode, "Opacity");

			// background image position
			this.backgroundImagePosition = this.$new(ToolbarImagePosition, {mode:this.mode});
			this.backgroundImagePosition.setJwtToken(this.jwtToken);
			this.backgroundImagePosition.setLabel('<span class="mdi mdi-crop"></span>');
			this.own(on(this.backgroundImagePosition, "change", lang.hitch(this, "setWidgetMultiStyle")));
			this._placeAt(this.backgroundImagePosition, content);
			this.addTooltip(this.backgroundImagePosition.domNode, "Image Position");

			// rotate
			this.backgroundImageRotation = this.$new(ImageRotate);
			this.own(on(this.backgroundImageRotation, "change", lang.hitch(this, "setWidgetStyle", "backgroundImageRotation")));
			this.own(on(this.backgroundImageRotation, "changing", lang.hitch(this, "setTempWidgetStyle", "backgroundImageRotation")));
			this._placeAt(this.backgroundImageRotation, content);
			this.addTooltip(this.backgroundImageRotation.domNode, "Image Rotation");

			this.backgroundColorDiv = parent;
			this.properties.appendChild(parent);

		},


		_renderWidgetBorder:function(){

			var parent = this.createSection("Border", true, "toggleBoxBorder");

			var content = document.createElement("div");
			css.add(content, "MatcToolbarSectionContent MatcToolbarBoxBorderDetails");
			parent.appendChild(content);

			this.boxBorder = this.$new(BoxBorder);
			this.boxBorder.setModel(this.model);
			this.own(on(this.boxBorder, "change", lang.hitch(this, "setWidgetMultiStyle")));
			this.own(on(this.boxBorder, "changing", lang.hitch(this, "setTempMultiWidgetStyle")));

			this._placeAt(this.boxBorder, content);

			content = document.createElement("div");
			css.add(content, "MatcToolbarSectionContent MatcToolbarBoxBorderNoDetails");
			parent.appendChild(content);

			this.boxBorder2 = this.$new(BoxBorder2, {colorWidgets:this.colorWidgets});
			this.boxBorder2.setModel(this.model);
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

		_renderInheritedWidget:function(){

			var parent = this.createSection('Inherited Widget', true);

			var content = document.createElement("div");
			css.add(content, "MatcToolbarSectionContent");
			parent.appendChild(content);

			var db = new DomBuilder();
			db.div("MatcToolbarGridFull MatcToolbarItem ").h(80)
				.span("", "This widget is inherited form a master screen. To change it, you have to enbale editing.")
				.build(content);

			var enable = db
				.div("MatcToolbarGridFull MatcToolbarItem")
				.div("MatcToolbarButton MatcButton", "Enable Editing")
				.build(content);

			this.own(on(enable, "click", lang.hitch(this, "enableInheritedWidget")));

			this.properties.appendChild(parent);
			this.inheritedWidgetDiv = parent;
		},

		_renderWidgetText:function(){

			var parent = this.createSection('Text', true);

			var content = document.createElement("div");
			css.add(content, "MatcToolbarSectionContent");
			parent.appendChild(content);


			this.family = this.$new(ToolbarDropDownButton);
			this.family.setOptions(this._getFontFamilies());
			this.family.reposition = true;
			this.addTooltip(this.family.domNode, "Font Family");

			this.own(on(this.family, "change", lang.hitch(this, "setWidgetStyle", "fontFamily")));
			this._placeAt(this.family, content);


			this.fontSize = this.$new(InputDropDownButton);
			this.fontSize.setOptions(["Auto",10,12,14,18,20,24,28,32,40,50,60,70,80,100,120]);
			this.fontSize.reposition = true;
			this.own(on(this.fontSize, "change", lang.hitch(this, "setWidgetStyle", "fontSize")));
			this._placeAt(this.fontSize, content);
			this.addTooltip(this.fontSize.domNode, "Font Size");

			this.createSpacer(content);


			this.color = this.$new(ToolbarColor, {hasPicker:true, chevron:false});
			this.color.keepOpenOnTypeSelection = "widget";
			this.color.reposition = true;
			this.color.updateLabel = true;
			this.color.setModel(this.model);
			this.color.setLabel('<span class="MatcToolbarColorIndicator"></span>');
			this.own(on(this.color, "change", lang.hitch(this, "setWidgetStyle", "color")));
			this.own(on(this.color, "changing", lang.hitch(this, "setTempWidgetStyle", "color")));
			this._placeAt(this.color, content);
			this.addTooltip(this.color.domNode, "Font Color");
			this.colorWidgets.push(this.color);


			this.fontWeight= this.$new(ToolbarToggleButton);
			this.fontWeight.setLabel("");
			this.fontWeight.setCss("mdi mdi-format-bold");
			this.own(on(this.fontWeight, "change", lang.hitch(this, "toggleStyle", "fontWeight", "bold")));
			this._placeAt(this.fontWeight, content);
			this.addTooltip(this.fontWeight.domNode, "Bold");

			this.fontStyle = this.$new(ToolbarToggleButton);
			this.fontStyle.setLabel("");
			this.fontStyle.setCss("mdi mdi-format-italic");
			this.own(on(this.fontStyle, "change", lang.hitch(this, "toggleStyle", "fontStyle", "italic")));
			this._placeAt(this.fontStyle, content);
			this.addTooltip(this.fontStyle.domNode, "Italic");

			this.textDecoration = this.$new(ToolbarToggleButton);
			this.textDecoration.setLabel("");
			this.textDecoration.setCss("mdi mdi-format-underline");
			this.own(on(this.textDecoration, "change", lang.hitch(this, "toggleStyle", "textDecoration", "underline")));
			this._placeAt(this.textDecoration, content);
			this.addTooltip(this.textDecoration.domNode, "Underline");

			this.strikeThrough = this.$new(ToolbarToggleButton);
			this.strikeThrough.setLabel('S');
			this.strikeThrough.setCss("MatcToolbarStrikeTrought");
			this.own(on(this.strikeThrough, "change", lang.hitch(this, "toggleStyle", "textDecoration", "line-through")));
			//this._placeAt(this.strikeThrough, content);
			this.addTooltip(this.strikeThrough.domNode, "Strikethrough");

			this.createSpacer(content);


			this.textAlign = this.$new(ToolbarSelector);
			this.textAlign.setOptions([
				{ value:"left", icon:"mdi mdi-format-align-left"},
			    { value:"center", icon:"mdi mdi-format-align-center"},
			    { value:"right", icon:"mdi mdi-format-align-right"},
			    { value:"justify", icon:"mdi mdi-format-align-justify"}
			]);
			this.own(on(this.textAlign, "change", lang.hitch(this, "setWidgetStyle", "textAlign")));
			this._placeAt(this.textAlign, content);
			this.addTooltip(this.textAlign.domNode, "Text Alignment");

			this.createSpacer(content);


			/**
			 * advanced text stuff
			 */
			var advanced = document.createElement("div");
			css.add(advanced, "MatcToolbarSectionContent");
			parent.appendChild(advanced);

			this.textShadow = this.$new(TextShadow);
			this.textShadow.setModel(this.model)
			this.own(on(this.textShadow, "change", lang.hitch(this, "setWidgetStyle", "textShadow")));
			this._placeAt(this.textShadow, advanced);
			this.addTooltip(this.textShadow.domNode, "Text Shadow");

			this.lineHeight = this.$new(ToolbarDropDownButton);
			this.lineHeight.setOptions([1, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6,1.7,1.8,1.9, 2, 2.5, 3]);
			this.lineHeight.setLabel('<span class="mdi mdi-format-line-spacing"></span>');
			this.lineHeight.reposition = true;
			this.lineHeight.updateLabel  =false;
			this.own(on(this.lineHeight, "change", lang.hitch(this, "setWidgetStyle", "lineHeight")));
			this._placeAt(this.lineHeight, advanced);
			this.addTooltip(this.lineHeight.domNode, "Line Height");

			this.letterSpacing = this.$new(ToolbarDropDownButton);
			this.letterSpacing.setOptions([0,1,2,4,5,6,7,8,9,10,20,30]);
			this.letterSpacing.setLabel('<span class="glyphicons glyphicons-text-width"></span>');
			this.letterSpacing.reposition = true;
			this.letterSpacing.updateLabel  =false;
			this.own(on(this.letterSpacing, "change", lang.hitch(this, "setWidgetStyle", "letterSpacing")));
			this._placeAt(this.letterSpacing, advanced);
			this.addTooltip(this.letterSpacing.domNode, "Letter Spacing");

			this.verticalAlign = this.$new(ToolbarDropDownButton);
			this.verticalAlign.setOptions([
			 { value:"top", icon:"mdi mdi-format-vertical-align-top"},
			 { value:"middle", icon:"mdi mdi-format-vertical-align-center"},
			 { value:"bottom", icon:"mdi mdi-format-vertical-align-bottom"},
      ]);
			this.verticalAlign.setLabel('<span class="glyphicons glyphicons-text-width"></span>');
			this.verticalAlign.reposition = true;
			this.verticalAlign.updateLabel  = true;
			this.own(on(this.verticalAlign, "change", lang.hitch(this, "setWidgetStyle", "verticalAlign")));
			this._placeAt(this.verticalAlign, advanced);
			this.addTooltip(this.verticalAlign.domNode, "Vertical Align");


			this.properties.appendChild(parent);
			this.textDiv = parent;
			this.textAdvancedDiv = advanced;
		},


		/*****************************************************************************************************
		 * Multli Widget
		 ****************************************************************************************************/

		_renderMultiPosition:function(){

			var parent = this.createSection("Position");

			var content = document.createElement("div");
			css.add(content, "MatcToolbarSectionContent");
			parent.appendChild(content);


			this.multiPositionCheckBox = this.$new(CheckBox);
			this.multiPositionCheckBox.setLabel("Fixed In Simulator");
			this.addTooltip(this.multiPositionCheckBox.domNode, "The element will not scroll in the simualtor.")
			css.add(this.multiPositionCheckBox.domNode, "MatcToolbarItem");
			this.own(on(this.multiPositionCheckBox, "change", lang.hitch(this, "setWidgetStyle", "fixed")));
			this.multiPositionCheckBox.placeAt(content)


			this.properties.appendChild(parent);
			this.multiPositionDiv = parent;
		},


		/*****************************************************************************************************
		 * Render screen
		 ****************************************************************************************************/
		_renderScreenName:function(){

			var parent = this.createSection("Screen Name");

			var content = document.createElement("div");
			css.add(content, "MatcToolbarSectionContent");
			parent.appendChild(content);

			this.screenName = this.createInput(content, "Screen Name");
			this.own(on(this.screenName, "change", lang.hitch(this, "onScreenNameChange")));


			this.screenSize = this.$new(BoxSize, {mode:"widthAndHeight"});
			this.own(on(this.screenSize, "change", lang.hitch(this, "setScreenSize")));
			this.screenSize.placeAt(content);

			this.properties.appendChild(parent);
			this.screenNameDiv = parent;
		},


		_renderScreenBackground:function(){

			var parent = this.createSection( "Background", true);
			var content = document.createElement("div");
			css.add(content, "MatcToolbarSectionContent");
			parent.appendChild(content);

			/**
			 * back ground color is for every one :-D
			 */
			this.screenBackgroundColor = this.$new(ToolbarColor, {hasGradient:true, hasPicker:true, chevron:false});
			this.screenBackgroundColor.updateLabel  = true;
			this.screenBackgroundColor.keepOpenOnTypeSelection = "screen";
			this.screenBackgroundColor.setLabel('<span class="MatcToolbarColorIndicator"></span>');
			this.screenBackgroundColor.setModel(this.model);
			this.own(on(this.screenBackgroundColor, "change", lang.hitch(this, "setScreenStyle", "background")));
			this.own(on(this.screenBackgroundColor, "changing", lang.hitch(this, "setTempScreenStyle", "background")));
			this._placeAt(this.screenBackgroundColor, content);

			this.screenBackgroundImage = this.$new(ToolbarImage, {mode:this.mode});
			this.screenBackgroundImage.setJwtToken(this.jwtToken)
			this.screenBackgroundImage.setLabel('<span class="mdi mdi-image"></span>');
			this.screenBackgroundImage.setCanvas(this.canvas);
			this.own(on(this.screenBackgroundImage, "change", lang.hitch(this, "setScreenStyle", "backgroundImage")));
			this._placeAt(this.screenBackgroundImage, content);

			this.properties.appendChild(parent);
			this.screenBackDiv = parent;
		},


		_renderScreenActions:function(){

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


		_renderScreenAnimations:function(){

			var parent = this.createSection("Animations");

			var content = document.createElement("div");
			css.add(content, "MatcToolbarSectionContent");
			parent.appendChild(content);

			/**
			 * Animation
			 */
			var db = new DomBuilder();

			var add = db.div("MatcToolbarGridFull MatcPointer MatcToolbarItem ").build(content);
			db.span("MatcToolbarSmallIcon mdi mdi-video").build(add);
			db.span("MatcToolbarItemLabel", "Loading Animation").build(add);
			this.tempOwn(on(add, touch.press, lang.hitch(this, "showAnimationDialog", "ScreenLoaded")));

			this.properties.appendChild(parent);
			this.screenAnimationDiv = parent;
		},

		_renderScreenInheritance:function(){
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
			css.add(item, " MatcToolbarGridFull");
			content.appendChild(item);


			this.screenSegmentCheckbox = this.$new(CheckBox);
			this.screenSegmentCheckbox.setLabel("Segment");
			this.addTooltip(this.screenSegmentCheckbox.domNode, "The screen can be imcluded in others")
			css.add(this.screenSegmentCheckbox.domNode, "MatcToolbarItem");
			this.own(on(this.screenSegmentCheckbox, "change", lang.hitch(this, "setScreenSegement", "segment")));
			this.screenSegmentCheckbox.placeAt(item)

			item = document.createElement("div");
			css.add(item, " MatcToolbarGridFull");
			content.appendChild(item);

			this.screenOverlayCheckBox = this.$new(CheckBox);
			this.screenOverlayCheckBox.setLabel("Overlay");
			this.addTooltip(this.screenOverlayCheckBox.domNode, "The screen will be shown as an overlay")
			css.add(this.screenOverlayCheckBox.domNode, "MatcToolbarItem");
			this.own(on(this.screenOverlayCheckBox, "change", lang.hitch(this, "setScreenStyle", "overlay")));
			this.screenOverlayCheckBox.placeAt(item)

			item = document.createElement("div");
			css.add(item, " MatcToolbarGridFull");
			content.appendChild(item);

			this.screenFixedOverlayCheckBox = this.$new(CheckBox);
			this.screenFixedOverlayCheckBox.setLabel("Fixed as overlay");
			this.addTooltip(this.screenFixedOverlayCheckBox.domNode, "The element will not scroll in the simualtor when shows as overlay")
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


			var db = new DomBuilder();
			var add = db.div("MatcToolbarGridFull MatcPointer MatcToolbarItem ").build(content);
			db.span("MatcToolbarSmallIcon mdi mdi-video").build(add);
			db.span("MatcToolbarItemLabel", "Animations").build(add);
			this.tempOwn(on(add, touch.press, lang.hitch(this, "showAnimationDialog", "ScreenLoaded")));
			this.addTooltip(add, "Define an animation which is run when the screen is loaded");


			this.properties.appendChild(parent);
			this.screenDIV = parent;
		},



		/*****************************************************************************************************
		 * ANIMATION Properties
		 ****************************************************************************************************/

		showAnimationDialog:function(type, e){
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

		showSaveButton:function(){
			if(this.user.role=="guest"){
				// css.remove(this.signupSection,"MatcToolbarSectionHidden" );
			}
		},


		showProperties:function(){
			css.remove(this.propertiesCntr, "MatcToolbarSectionHidden");
			if(this.canvas){
				css.add(this.canvas.scrollRight, "MatcCanvasScrollBarRightOpen");
			}
			css.add(this.widgetViewSection, "MatcToobarViewSectionVisible");
		},

		hideProperties:function(){

			css.add(this.propertiesCntr, "MatcToolbarSectionHidden");
			if(this.canvas){
				css.remove(this.canvas.scrollRight, "MatcCanvasScrollBarRightOpen");
			}
			css.remove(this.widgetViewSection, "MatcToobarViewSectionVisible");

		},


		storePropertiesState:function(){

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

		restorePropertiesState:function(){

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
		 * group properties
		 ****************************************************************************************************/
		showGroupProperties:function(model){
			this.logger.log(2,"showGroupProperties", "entry > ");

			if (this.isDataView) {
				return this.showGroupDataProperties(model)
			}

			this.showProperties();

			if(this.widgetAlignDiv){
				css.remove(this.widgetAlignDiv, "MatcToolbarSectionHidden");
			}

			if (this.responsiveGroupDiv) {
				css.remove(this.responsiveGroupDiv, "MatcToolbarSectionHidden")
			}

			css.remove(this.groupNameDiv, "MatcToolbarSectionHidden");
			css.remove(this.groupActionDiv, "MatcToolbarSectionHidden");
			css.remove(this.childDiv,"MatcToolbarSectionHidden" );

			this.groupActionBTN.setValue(model);
			this.responsiveGroupWidget.setValue(model)

			/**
			 * Since 2.1.3 we have sub groups
			 */
			if(model.name){
				this.groupName.value = model.name;
			} else {
				this.groupName.value = "";
			}
			this.groupName.blur();

			var fixed = true;
			for(var i=0; i< model.children.length;i++){
				var id = model.children[i];
				var widget = this.model.widgets[id];
				fixed = fixed && widget.style.fixed === true;
			}

			if(this.screenExport && this.screenDownloadDiv) {
				css.remove(this.screenDownloadDiv, "MatcToolbarSectionHidden");
				this.screenExport.setWidgets(model.children);
			}
			this.groupPositionCheckBox.setValue(fixed);
		},

		showGroupDataProperties (model) {
			this.showProperties();

			css.remove(this.groupNameDiv, "MatcToolbarSectionHidden");
			// css.remove(this.groupActionDiv, "MatcToolbarSectionHidden");
			css.remove(this.lowCodeDiv, "MatcToolbarSectionHidden")
			css.remove(this.lowCodeResponsiveDiv, "MatcToolbarSectionHidden")
			//css.remove(this.callBackDiv, "MatcToolbarSectionHidden")

			this.groupActionBTN.setValue(model);
			this.groupName.value = model.name ? model.name : "";
			this.groupName.blur();
			this.lowCodeSection.setValue(model, true)
			this.lowCodeResponsiveSection.setValue(model, true)

			//this.callbackSection.setValue(model)

		},

		showMultiProperties:function(model){

			if(this.widgetAlignDiv){
				css.remove(this.widgetAlignDiv, "MatcToolbarSectionHidden");
			}

			this.showProperties();

			if(model.length >2){
				this.showDistButtons();
			}

			css.remove(this.childDiv,"MatcToolbarSectionHidden" );
			css.remove(this.multiPositionDiv, "MatcToolbarSectionHidden");


			var fixed = true;
			var wrap = true;
			for(var i=0; i< model.length;i++){
				var id = model[i];
				var widget = this.model.widgets[id];
				if(widget){
					fixed = fixed && widget.style.fixed === true;
					wrap = wrap && widget.style.wrap === true;
				} else {
					console.warn("showMultiProperties() > No widget with id" , id)
				}

			}
			this.multiPositionCheckBox.setValue(fixed);


			// this.childWidget.setMulti(model);

			this._showMultiVisualProperties(model);
		},

		_showMultiVisualProperties:function(ids){

			var widgetViewMode = "style";
			var style = null;
			var widgets = [];
			var hasLabel = true;
			var hasPadding = true;
			var hasBorder = true;
			var hasBackground = true;
			for(var i=0; i< ids.length;i++){
				var id = ids[i];
				var widget = this.model.widgets[id];
				if(widget){
					widgets.push(widget);
					if(!style){
						style = this.getViewModeStyle(widget, widgetViewMode);
					}
					/**
					 * Fill up missing values..
					 */
					var widgetStyle = lang.clone(widget[widgetViewMode]);
					for(var key in widgetStyle){
						if(!style[key]){
							style[key] = widgetStyle[key];
						}
					}
				}
			}

			if(style){

				if(hasBackground){
					css.remove(this.backgroundColorDiv, "MatcToolbarSectionHidden");
					this.backgroundColor.setValue(style.background);
					this.backgroundImage.setValue(style.backgroundImage);
					this.backgroundImage.setModel(this.model);
					this.boxShadow.setValue(style.boxShadow);
					this.opacity.setValue(style.opacity);
				}

				if(hasBorder){
					css.remove(this.borderDiv, "MatcToolbarSectionHidden");

					this.boxBorder.setValue(style);
					if (this.boxBorder2){
						this.boxBorder2.setValue(style);
					}
					if (this.radiusBox){
						css.remove(this.radiusBox.domNode, "hidden");
						this.radiusBox.setValue(style);
					}
				} else {
					if (this.radiusBox) {
						css.add(this.radiusBox.domNode, "hidden");
					}
				}

				if(hasLabel){
					css.remove(this.textDiv, "MatcToolbarSectionHidden");

					this.family.setValue(style.fontFamily);
					this.fontSize.setValue(style.fontSize);
					this.fontWeight.setValue(style.fontWeight == "bold");
					this.fontStyle.setValue(style.fontStyle == "italic");
					this.textDecoration.setValue(style.textDecoration == "underline");
					this.color.setValue(style.color);
					this.textAlign.setValue(style.textAlign);


					css.remove(this.textAdvancedDiv,  "MatcToolbarSectionHidden");
					this.textShadow.setValue(style.textShadow);
					this.lineHeight.setValue(style.lineHeight);
					this.letterSpacing.setValue(style.letterSpacing);
					this.strikeThrough.setValue(style.textDecoration == "line-through")

					if (this.verticalAlign) {
						this.verticalAlign.setValue(style.verticalAlign);
					}

				}


				if(hasPadding){
					css.remove(this.boxDiv, "MatcToolbarSectionHidden");
					this.paddingWidget.setValue(style);
				}

				if(this.screenExport && this.screenDownloadDiv) {
					css.remove(this.screenDownloadDiv, "MatcToolbarSectionHidden");
					this.screenExport.setWidgets(ids);
				}


			}


		},

		/*****************************************************************************************************
		 * ruler properties
		 ****************************************************************************************************/

		showRulerProperties (screen, ruler) {
			this.logger.log(0,"showRulerProperties", "entry > ");
			this.restorePropertiesState();
			this.showProperties();
			css.remove(this.rulerSectionDIV, "MatcToolbarSectionHidden");
			this.rulerSection.setValue(screen, ruler)
		},

		/*****************************************************************************************************
		 * widget properties
		 ****************************************************************************************************/

		showWidgetProperties:function(model){
			this.logger.log(1,"showWidgetProperties", "entry > ", this.isDataView);

			this.restorePropertiesState();
			/**
			 * Since 2.1.6 we have a dedicated data view
			 */
			if (this.isDataView) {
				return this.showWidgetDataProperties(model)
			}

			this.setWidgetViewModes(model);

			this.restorePropertiesState();

			var widgetViewMode = this.widgetViewModeBtn.getValue();

			var style = this.getViewModeStyle(model, widgetViewMode);

			// var props = this.getInheritedStyle(model, "props"); // model.props;


			this.showProperties();
			this.showWidgetTools();

			var isLogicWidget = this.hasLogic2.indexOf(model.type) >=0;
			if(isLogicWidget){
				css.add(this.positionCheckBox.domNode, "hidden");
				css.add(this.widgetSize.domNode, "hidden");
				css.add(this.responsiveDiv, "hidden");
			} else {
				css.remove(this.positionCheckBox.domNode, "hidden");
				css.remove(this.widgetSize.domNode, "hidden");
				css.remove(this.responsiveDiv, "hidden");
			}


			// this.widgetSize.setCanvasSettings(this.settings)
			this.widgetSize.setModel(this.model);
			this.widgetSize.setValue(model);

			this.positionCheckBox.setValue(style.fixed);

			//this.lockedCheckBox.setValue(style.locked);


			if(model.has.backgroundColor || model.has.backgroundImage){

				css.remove(this.backgroundColorDiv, "MatcToolbarSectionHidden");

				if(model.has.backgroundColor){
					css.remove(this.backgroundColor.domNode, "MatcToolbarSectionHidden");
					this.backgroundColor.setValue(style.background);
				} else {
					css.add(this.backgroundColor.domNode, "MatcToolbarSectionHidden");
				}

				if(model.has.backgroundImage){
					this.backgroundImage.setValue(style.backgroundImage);
					this.backgroundImage.setModel(this.model);
					css.remove(this.backgroundImage.domNode, "MatcToolbarSectionHidden");
					if (this.backgroundImagePosition) {
						css.remove(this.backgroundImagePosition.domNode, "MatcToolbarSectionHidden");
						this.backgroundImagePosition.setValue(model);
					}
				} else {
					css.add(this.backgroundImage.domNode, "MatcToolbarSectionHidden");
					if (this.backgroundImagePosition) {
						css.add(this.backgroundImagePosition.domNode, "MatcToolbarSectionHidden");
					}
				}

				this.boxShadow.setValue(style.boxShadow);
				this.opacity.setValue(style.opacity);
			}

			if (this.hasRotate.indexOf(model.type) >= 0) {
					css.remove(this.backgroundImageRotation.domNode, "MatcToolbarSectionHidden");
					this.backgroundImageRotation.setValue(style.backgroundImageRotation);
			} else {
					css.add(this.backgroundImageRotation.domNode, "MatcToolbarSectionHidden");
					this.backgroundImageRotation.setValue(style.backgroundImageRotation);
			}

			if(model.has.label){
				css.remove(this.textDiv, "MatcToolbarSectionHidden");

				this.family.setValue(style.fontFamily);
				this.fontSize.setValue(style.fontSize);
				this.fontWeight.setValue(style.fontWeight == "bold");
				this.fontStyle.setValue(style.fontStyle == "italic");
				this.textDecoration.setValue(style.textDecoration == "underline");
				this.color.setValue(style.color);
				this.textAlign.setValue(style.textAlign);

				css.remove(this.textAdvancedDiv,  "MatcToolbarSectionHidden");
				this.textShadow.setValue(style.textShadow);
				this.lineHeight.setValue(style.lineHeight);
				this.letterSpacing.setValue(style.letterSpacing);
				this.strikeThrough.setValue(style.textDecoration == "line-through");
			}

			if(this.hasValign.indexOf(model.type) >=0){
				css.remove(this.verticalAlign.domNode, "hidden");
				if(style.verticalAlign){
					this.verticalAlign.setValue(style.verticalAlign);
				} else {
					this.verticalAlign.setValue("top");
				}
			}

			if (this.hasPadding.indexOf(model.type) >=0) {
				css.remove(this.boxDiv, "MatcToolbarSectionHidden");
				this.paddingWidget.setValue(style);
			}

			if (widgetViewMode == "style") {

				if (this.responsiveDiv) {
					css.remove(this.responsiveDiv, "MatcToolbarSectionHidden")
					this.responsiveWidget.setValue(model)
				}

				if(this.widgetAlignDiv){
					css.remove(this.widgetAlignDiv, "MatcToolbarSectionHidden");
				}

				if(this.hasData.indexOf(model.type) >=0 || model.has.data) { // if(model.has.data){
					css.remove(this.dataDiv,"MatcToolbarSectionHidden" );
					this.dataWidget.setValue(model);
				}

				if(this.hasValidation.indexOf(model.type) >= 0 || model.has.validation){
					css.remove(this.validationDiv,"MatcToolbarSectionHidden" );
					this.validationWidget.setValue(model, false);
				}

				if(this.widgetName){
					css.remove(this.widgetNameDiv, "MatcToolbarSectionHidden");
					css.remove(this.widgetSizeDiv, "MatcToolbarSectionHidden")
					if(model.name){
						this.widgetName.value = model.name;
					} else {
						this.widgetName.value = "";
					}
					this.widgetName.blur();
				}
				css.remove(this.lineDiv, "MatcToolbarSectionHidden");

				this.actionBTN.setValue(model, isLogicWidget);

			} else if (widgetViewMode == "hover"){
				this.showTemplateMarkers(" (Hover)")
			} else if (widgetViewMode == "error"){
				this.showTemplateMarkers(" (Error)")
			}

			if(model.template){
				this.showTemplateMarkers();
			}

			/**
			 * Must come at last so radius container is visible...
			 */
			if (model.has.border){

				css.remove(this.borderDiv, "MatcToolbarSectionHidden");
				this.boxBorder.setValue(style);

				if (this.radiusBox){
					css.remove(this.radiusBox.domNode, "hidden");
					this.radiusBox.setValue(style);
				}
				if (this.boxBorder2){
					this.boxBorder2.setValue(style);
				}

			} else if (model.has.borderRadus){

				if (this.radiusBox){
					css.remove(this.radiusBox.domNode, "hidden");
					this.radiusBox.setValue(style);
				}

			} else {
				if (this.radiusBox) {
					css.add(this.radiusBox.domNode, "hidden");
				}
			}

			/**
			 * Check if we reopen color
			 */
			if (this.settings && this.settings.keepColorWidgetOpen){
				this.reopenColorWidget(model);
			}

			if (this.screenExport && this.screenDownloadDiv) {
				css.remove(this.screenDownloadDiv, "MatcToolbarSectionHidden");
				this.screenExport.setWidgets([model.id]);
			}


		},

		/**
		 * Since 2.1.6 we have the dataview
		 */
		showWidgetDataProperties (model) {
			this.logger.log(-1,"showWidgetDataProperties", "enter");

			this.showProperties();

			/**
			 * Make sure the widget name is set, so
			 * the flushing will work!
			 */
			if (this.widgetName){
				css.remove(this.widgetNameDiv, "MatcToolbarSectionHidden");
				css.add(this.widgetSizeDiv, "MatcToolbarSectionHidden")
				if(model.name){
					this.widgetName.value = model.name;
				} else {
					this.widgetName.value = "";
				}
				this.widgetName.blur();
			}

			if (this.hasValidation.indexOf(model.type) >= 0 || model.has.validation){
				css.remove(this.validationDiv,"MatcToolbarSectionHidden" );
				this.validationWidget.setValue(model, true);
			}
			this.lowCodeSection.setValue(model)
			this.callbackSection.setValue(model)
			this.lowCodeResponsiveSection.setValue(model)

			css.remove(this.lowCodeDiv, "MatcToolbarSectionHidden")
			css.remove(this.callBackDiv, "MatcToolbarSectionHidden")
			css.remove(this.lowCodeResponsiveDiv, "MatcToolbarSectionHidden")
		},

		reopenColorWidget:function(){
			this.logger.log(3,"reopenColorWidget", "exit");
			var now = new Date().getTime();

			this.colorWidgets.sort(function(a,b) {
				return b.lastClose - a.lastClose
			});

			var widget = this.colorWidgets[0];
			if (widget){
				if (now - widget.lastClose < 100){
					// fixme: this can can lead to some stupid
					// flickering because the scroll position in the
					// option panel might be after the show. This leads to
					widget.showDropDown(null);
					/**
					 * We have to call reposition after the render
					 * to put the color box at the right place.
					 */
					setTimeout(function(){
						widget.updatePosition();
					}, 10);
				}
			}
		},


		blurWidgetProperties:function(){
			this.boxBorder.blur();
			this.widgetSize.blur();
		},

		/**
		 * Gets the normal style and mixes in the view mode style,
		 * e.g. for error or so. Dunno how this works actually with templates
		 *
		 * Update: For inherited widgets we delegate to the Layout.getInheritedStyle()
		 * method.
		 *
		 * FIMXE: This might not work for templates, inherited widgets!
		 */
		getViewModeStyle:function(model, widgetViewMode){
			if (model && model.parentWidget) {
				return this.getInheritedStyle(model, widgetViewMode)
			}

			var normal = this.getStyle(model);

			if(model[widgetViewMode]){
				var viewStyle = model[widgetViewMode];
				var mixed = lang.clone(normal);
				for(var key in viewStyle){
					mixed[key] = viewStyle[key];
				}
				return mixed;
			}
			return normal;
		},

		setWidgetViewModes:function(model){

			css.remove(this.widgetViewSection, "MatcToolbarSectionHidden");

			var type = model.type
			if(this.hasErrorViewMode.indexOf(type) >= 0){
				this.widgetViewModeBtn.showOption("error");
			} else {
				this.widgetViewModeBtn.hideOption("error");
			}

			if(this.hasFocusViewMode.indexOf(type) >= 0){
				this.widgetViewModeBtn.showOption("focus");
			} else {
				this.widgetViewModeBtn.hideOption("focus");
			}


			if(this.hasCheckedViewMode.indexOf(type) >=0){
				this.widgetViewModeBtn.showOption("checked");
			} else {
				this.widgetViewModeBtn.hideOption("checked");
			}

			if(this.hasHoverViewMode.indexOf(type) >=0){
				this.widgetViewModeBtn.showOption("hover");
			} else {
				this.widgetViewModeBtn.hideOption("hover");
			}

			if(this.hasActiveViewMode.indexOf(type)>=0){
				this.widgetViewModeBtn.showOption("active");
			} else {
				this.widgetViewModeBtn.hideOption("active");
			}
		},


		showInheritedWidgetProperties:function (model) {
			this.logger.log(-1,"showInheritedWidgetProperties", "entry > ");

			this.setWidgetViewModes(model);

			this.restorePropertiesState();

			this.showProperties();


			css.add(this.positionCheckBox.domNode, "hidden");
			css.add(this.widgetSize.domNode, "hidden");
			css.add(this.widgetSize.domNode, "hidden");
			css.add(this.radiusBox.domNode, "hidden");

			if(model.name){
				this.widgetName.value = model.name;
			} else {
				this.widgetName.value = "";
			}
			this.widgetName.blur();

			css.remove(this.widgetNameDiv, "MatcToolbarSectionHidden");
			css.remove(this.inheritedWidgetDiv, "MatcToolbarSectionHidden");
		},



		/*****************************************************************************************************
		 * tool properties
		 ****************************************************************************************************/


		showTools:function(){

			css.remove(this.toolsDiv, "MatcToolbarSectionHidden");
			css.remove(this.toolsCntrDiv, "MatcToolbarSectionHidden");
			css.remove(this.distributeBtn, "hidden");
			css.remove(this.replicateBtn, "hidden");

			if(this._selectedMulti ||this._selectedGroup ){
				css.remove(this.groupDIV, "MatcToolbarSectionHidden");
				if(this._selectedGroup){
					css.add(this.groupBTN, "MatcToolbarItemActive");
					css.add(this.distributeBtn, "hidden");
				} else {
					css.remove(this.groupBTN, "MatcToolbarItemActive");
				}
			} else {
				css.add(this.groupDIV, "MatcToolbarSectionHidden");
			}

		},

		showTemplate:function(model){
			css.remove(this.templateDiv, "MatcToolbarSectionHidden");
			if(model.template){
				/**
				 * FIXME: we should also check for hover, error and such... This should
				 * however be well tested.
				 */
				var count = this.countProps(model.style);
				if (count > 0) {
					css.remove(this.templateUpdate, "MatcToolbarItemDisbaled hidden");
				} else {
					css.add(this.templateUpdate, "MatcToolbarItemDisbaled");
				}
				css.add(this.template, "MatcToolbarItemDisbaled hidden");
			} else {
				css.remove(this.template, "MatcToolbarItemDisbaled hidden");
				css.add(this.templateUpdate, "MatcToolbarItemDisbaled hidden");
			}

		},

		showTemplateMarkers:function(lbl){
			css.add(this.domNode, "MatcToolbarTemplateMarkerVisible");
			if(this.templateMarkers && lbl){
				for(var i=0; i< this.templateMarkers.length; i++){
					this.templateMarkers[i].innerHTML=lbl;
				}
			}
		},

		hideTools:function(){
			css.add(this.toolsDiv, "MatcToolbarSectionHidden");
		},

		showCopyPaste:function(){
			this.logger.log(3,"showCopyPaste", "entry");

			css.remove(this.copyPasteDiv, "MatcToolbarSectionHidden");
			css.remove(this.deleteBtn, "MatcToolbarItemDisbaled");
			css.remove(this.copyBtn, "MatcToolbarItemDisbaled");

			if(this.canvas && this.canvas.hasCopy()){
				css.remove(this.pasteBtn, "MatcToolbarItemDisbaled");
			}

			if(this._selection != "multi" && this._selection != "screen"){
				css.remove(this.copyStyleBtn, "MatcToolbarItemDisbaled");
			}
		},

		hideWidgetTools:function(){
			css.add(this.toolsCntrDiv,"MatcToolbarSectionHidden");
			css.add(this.verticalAlign.domNode, "hidden");
		},


		showWidgetTools:function(){
			css.remove(this.toolsCntrDiv,"MatcToolbarSectionHidden");
		},


		hideDisButtons:function(){
			for(var id in this.distButtons){
				css.add(this.distButtons[id], "MatcToolbarItemPassive");
			}
		},

		showDistButtons:function(){
			for(var id in this.distButtons){
				css.remove(this.distButtons[id], "MatcToolbarItemPassive");
			}
		},


		hideCopyPaste:function(){
			this.logger.log(3,"hideCopyPaste", "entry");


			css.add(this.copyBtn, "MatcToolbarItemDisbaled");
			if(this.canvas && !this.canvas.hasCopy()){
				css.add(this.pasteBtn, "MatcToolbarItemDisbaled");
			}

			css.add(this.deleteBtn, "MatcToolbarItemDisbaled");
			css.add(this.copyStyleBtn, "MatcToolbarItemDisbaled");

			this.logger.log(3,"hideCopyPaste", "exit");
		},


		hideNotNeededButtons:function(){
			this.logger.log(3,"hideNotNeededButtons", "entry");

			try{
				var screenCount = this.getObjectLength(this.model.screens);
				if(screenCount > 0) {
					this._removeCss(this.simulatorSection, "MatcToolbarSectionHidden");
					this._removeCss(this.undoSection, "MatcToolbarSectionHidden");
					this._removeCss(this.commentSection, "MatcToolbarSectionHidden");
					this._removeCss(this.copyPasteDiv,"MatcToolbarSectionHidden");
					this._removeCss(this.editTool,"MatcToolbarSectionHidden");
					this._removeCss(this.moveTool,"MatcToolbarSectionHidden");
					this._removeCss(this.commentBtn,"MatcToolbarSectionHidden");
					this._removeCss(this.selectBtn, "MatcToolbarSectionHidden");
					this._removeCss(this.addSection, "MatcToolbarSectionHidden");
					this._removeCss(this.hotspotTool, "MatcToolbarSectionHidden");
					this._removeCss(this.rectangleTool, "MatcToolbarSectionHidden");
					this._removeCss(this.textTool, "MatcToolbarSectionHidden");
					this._removeCss(this.addLogicSection, "MatcToolbarSectionHidden");
					this._removeCss(this.addRestSection, "MatcToolbarSectionHidden");

				} else {
					this._addCss(this.simulatorSection, "MatcToolbarSectionHidden");
					this._addCss(this.commentSection, "MatcToolbarSectionHidden");
					this._addCss(this.copyPasteDiv,"MatcToolbarSectionHidden");
					this._addCss(this.editTool,"MatcToolbarSectionHidden");
					this._addCss(this.moveTool,"MatcToolbarSectionHidden");
					this._addCss(this.commentBtn,"MatcToolbarSectionHidden");
					this._addCss(this.selectBtn, "MatcToolbarSectionHidden");
					this._addCss(this.addSection, "MatcToolbarSectionHidden");
					this._addCss(this.hotspotTool, "MatcToolbarSectionHidden");
					this._addCss(this.rectangleTool, "MatcToolbarSectionHidden");
					this._addCss(this.textTool, "MatcToolbarSectionHidden");
					this._addCss(this.addLogicSection, "MatcToolbarSectionHidden");
					this._addCss(this.addRestSection, "MatcToolbarSectionHidden");

					if(!this.controller.canUndo()){
						this._addCss(this.undoSection, "MatcToolbarSectionHidden");
					}

					this.screenCreateBtn.showDropDown();
				}
			} catch(e ){
				this.logger.sendError(e);
			}

		},

		_removeCss:function(node, cls){
			if(node){
				css.remove(node, cls);
			} else {
				var e = new Error("_removeCss() > Node is null");
				this.logger.sendError(e);
			}
		},

		_addCss:function(node, cls){
			if(node){
				css.add(node, cls);
			} else {
				var e = new Error("_addCss() > Node is null");
				this.logger.sendError(e);
			}
		},


		/*****************************************************************************************************
		 * screen properties
		 ****************************************************************************************************/


		showScreenProperties:function(model){
			this.logger.log(0,"showScreenProperties", "entry");


			this.showProperties();

			if (this.isDataView) {
				return this.showScreenDataProperties(model)
			}

			if(this.screenDIV){
				css.remove(this.screenDIV, "MatcToolbarSectionHidden");
			}

			css.remove(this.screenNameDiv, "MatcToolbarSectionHidden");
			css.remove(this.screenBackDiv, "MatcToolbarSectionHidden");
			css.remove(this.screenParentsDiv, "MatcToolbarSectionHidden");
			css.remove(this.screenDownloadDiv, "MatcToolbarSectionHidden");

			if(this.screenActionDiv){
				css.remove(this.screenActionDiv, "MatcToolbarSectionHidden");
				this.screenActionBTN.setScreen(model);
			}
			if(this.screenAnimationDiv){
				css.remove(this.screenAnimationDiv, "MatcToolbarSectionHidden")
			}

			var style = model.style;
			if (style) {

				this.screenStart.setValue(model.props.start);
				this.screenBackgroundImage.setValue(style.backgroundImage);
				this.screenBackgroundImage.setModel(this.model);
				this.screenBackgroundColor.setValue(style.background);

				this.screenOverlayCheckBox.setValue(style.overlay);

				/**
					* Since 2.2.2 we show the segemnt box
					*/
				if (this.screenSegmentCheckbox) {
					this.screenSegmentCheckbox.setValue(model.segment)
					css.remove(this.screenSegmentCheckbox.domNode, "hidden");
				}

				if(style.overlay){
					css.remove(this.screenFixedOverlayCheckBox.domNode, "hidden");
					css.remove(this.screenBlurOverlayCheckBox.domNode, "hidden");
					css.remove(this.screenBackgroundOverlayCheckBox.domNode, "hidden")
				} else {
					css.add(this.screenFixedOverlayCheckBox.domNode, "hidden");
					css.add(this.screenBlurOverlayCheckBox.domNode, "hidden");
					css.add(this.screenBackgroundOverlayCheckBox.domNode, "hidden")
				}
				this.screenFixedOverlayCheckBox.setValue(style.fixed);
				this.screenBlurOverlayCheckBox.setValue(style.blur);
				this.screenBackgroundOverlayCheckBox.setValue(style.hasBackground);
			} else {
				console.warn("_Render.showScreenProperties() > No Style", model)
			}

			this.screenParentList.setScreen(model);
			//this.childWidget.setScreen(model);

			if(model.name){
				this.screenName.value = model.name;
			} else {
				this.screenName.value = "";
			}
			this.screenName.blur();

			if(this.screenDownLoad) {
				css.remove(this.screenDownLoad.domNode, "MatcHidden")
				this.screenDownLoad.setModel(this.model, model.id);
			}
			if(this.screenExport) {
				this.screenExport.setScreen(model, model.id);
			}

			if(this.screenSize){
				css.remove(this.screenSize.domNode, 'MatcHidden')
				this.screenSize.setModel(this.model);
				this.screenSize.setValue(model);
			}

			this.restorePropertiesState();

			this.logger.log(2,"showWidgetProperties", "exit");
		},


		showScreenDataProperties (model) {
			this.showProperties();

			if(model.name){
				this.screenName.value = model.name;
			} else {
				this.screenName.value = "";
			}
			this.screenName.blur();

			css.add(this.screenSize.domNode, 'MatcHidden')
			css.remove(this.screenNameDiv, "MatcToolbarSectionHidden");
			css.remove(this.callBackDiv, "MatcToolbarSectionHidden")
			this.callbackSection.setValue(model, 'screen')
		},


		hideAllSections:function(){
			this.logger.log(2,"hideAllSections", "entry");

			this.hideProperties();
			this.hideWidgetTools();

			if(this.screenDIV){
				css.add(this.screenDIV, "MatcToolbarSectionHidden");
			}
			css.add(this.screenNameDiv, "MatcToolbarSectionHidden");
			css.add(this.screenBackDiv, "MatcToolbarSectionHidden");
			css.add(this.screenParentsDiv, "MatcToolbarSectionHidden");
			css.add(this.screenDownloadDiv, "MatcToolbarSectionHidden");
			css.add(this.screenDownLoad.domNode, "MatcHidden")

			if(this.screenActionDiv){
				css.add(this.screenActionDiv, "MatcToolbarSectionHidden");
			}
			if(this.screenAnimationDiv){
				css.add(this.screenAnimationDiv,"MatcToolbarSectionHidden" );
			}

			if (this.rulerSectionDIV) {
				css.add(this.rulerSectionDIV, "MatcToolbarSectionHidden");
			}


			css.add(this.templateDiv, "MatcToolbarSectionHidden");
			css.add(this.multiPositionDiv, "MatcToolbarSectionHidden");

			css.add(this.textDiv, "MatcToolbarSectionHidden");
			css.add(this.textAdvancedDiv,  "MatcToolbarSectionHidden");
			css.add(this.borderDiv, "MatcToolbarSectionHidden");
			css.add(this.boxDiv, "MatcToolbarSectionHidden");
			css.add(this.childDiv,"MatcToolbarSectionHidden" );
			css.add(this.inheritedWidgetDiv, "MatcToolbarSectionHidden");
			css.add(this.dataDiv,"MatcToolbarSectionHidden" );
			css.add(this.validationDiv, "MatcToolbarSectionHidden");
			css.add(this.backgroundColorDiv, "MatcToolbarSectionHidden");
			css.add(this.lowCodeDiv, "MatcToolbarSectionHidden")
			css.add(this.callBackDiv, "MatcToolbarSectionHidden")
			css.add(this.lowCodeResponsiveDiv, "MatcToolbarSectionHidden")

			if (this.responsiveDiv){
				css.add(this.responsiveDiv, "MatcToolbarSectionHidden")
			}
			if (this.responsiveGroupDiv) {
				css.add(this.responsiveGroupDiv, "MatcToolbarSectionHidden")
			}
			if(this.widgetAlignDiv){
				css.add(this.widgetAlignDiv, "MatcToolbarSectionHidden");
			}

			css.add(this.lineDiv,"MatcToolbarSectionHidden" );

			css.add(this.toolsDiv, "MatcToolbarSectionHidden");

			css.add(this.widgetNameDiv, "MatcToolbarSectionHidden");


			css.add(this.groupDIV, "MatcToolbarSectionHidden");
			css.add(this.groupNameDiv, "MatcToolbarSectionHidden");
			css.add(this.groupActionDiv, "MatcToolbarSectionHidden");

			css.add(this.widgetViewSection, "MatcToolbarSectionHidden");


			css.remove(this.domNode, "MatcToolbarTemplateMarkerVisible");


			this.hideDisButtons();


			this.logger.log(3,"hideAllSections", "exit");
		},


		showRemoveButton:function(callback){
			this._removeBTN = this.createToolBarItem('<span class="glyphicon glyphicon-trash"></span>', callback, "MatcToolbarItemRemove");

		},


		toggleBoxBorder:function(e){
			this.stopEvent(e);
			if (this.borderDiv){
				css.toggle(this.borderDiv, "MatcToolbarBoxBorderSimple")
			}
		},



		/*****************************************************************************************************
		 * Helpers
		 ****************************************************************************************************/


		createInput:function(content,placeholder){
			var div = document.createElement("div");
			css.add(div, " MatcToolbarItem MatcToolbarGridFull");
			content.appendChild(div);

			let input = document.createElement("input");
			css.add(input, "MatcIgnoreOnKeyPress MatcToobarInlineEdit MatcToobarInput");
			div.appendChild(input);

			if(placeholder){
				input.placeholder = placeholder;
			}
			return input;
		},


		createSection:function(lbl, hasTemplateMarker, settingsCallback){

			var parent = document.createElement("div");
			css.add(parent, "MatcToolbarSection");

			var header = this.createSectionHeader( parent, lbl,hasTemplateMarker, settingsCallback);

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

		createSectionHeader:function(parent, lbl, hasTemplateMarker, settingsCallback){
			var div = document.createElement("div");
			css.add(div,"MatcToolbarSectionLabel");
			parent.appendChild(div);

			div.textContent = lbl;

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
				var settings = document.createElement("span");
				css.add(settings, "MatcToolbarSectionSettingsIcon mdi mdi-settings");
				div.appendChild(settings);
				this.own(on(settings, touch.press, lang.hitch(this, settingsCallback)));
			}

			var chev = document.createElement("span");
			css.add(chev, "MatcToolbarSectionChevron mdi mdi-chevron-down");
			div.appendChild(chev);

			return div;
		},



		createSpacer:function(parent){
			var span = document.createElement("span");
			css.add(span,"MatcToolbarSeperator");
			if(!parent){
				this.properties.appendChild(span);
			} else {
				parent.appendChild(span);
			}
			return span;
		},

		createToolBarItem:function(label, callback, clazz, parent){
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

		createToolBarButton:function(label, clazz, parent){

			var item = document.createElement("div");
			css.add(item, "MatcToolbarItem ");
			parent.appendChild(item);

			var btn = document.createElement("div");
			css.add(btn, "MatcButton MatcToolbarButton " + clazz);
			btn.innerHTML=label
			item.appendChild(btn);

			return item;
		},

		cleanUpUI:function(){
			this.hideAllSections();
			this.hideCopyPaste();

			if(this.distributeBtn) {
				css.remove(this.distributeBtn, "MatcToolbarItemActive");
			}

			if(this.replicateBtn) {
				css.remove(this.replicateBtn, "MatcToolbarItemActive");
			}
		},

		_getFontFamilies:function(){
			let fonts = [
					{ value: 'Helvetica Neue,Helvetica,Arial,sans-serif', label: "Helvetica Neue",  css:"MatchFont MatchFontHelvetica"},
					{ value:"Arial, sans-serif", label:"Arial", css:"MatchFont MatchFontArial"},
					{ value: 'Arial Black, Gadget, sans-serif', label : "Arial Black", css:"MatchFont MatchFontArialBlack"},

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
			if (this.family){
				this.family.setOptions(this._getFontFamilies());
			}
		},

		updateImports () {
			if (this.createBTN) {
				this.createBTN.updateImports()
			}
		},

		_getCreateList:function(){

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


		_placeAt:function(widget, node){
			widget.placeAt(node);
			this._addChildWidget(widget);
		},

		_addChildWidget:function(w){
			if(!this._childWidgets){
				this._childWidgets = [];
			}
			this._childWidgets.push(w);
		},

		_destroyChildWidget:function(){
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