
<template>
     <div class="MatcDataSection"></div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import css from 'dojo/css'
import lang from 'dojo/_base/lang'
import on from 'dojo/on'
import touch from 'dojo/touch'
import Logger from 'common/Logger'
import Dialog from 'common/Dialog'
import DomBuilder from 'common/DomBuilder'
import CheckBox from 'common/CheckBox'
import InputList from 'common/InputList'
import ScrollContainer from 'common/ScrollContainer'
import _Tooltip from 'common/_Tooltip'
import Util from 'core/Util'
import ToolbarColor from 'canvas/toolbar/ToolbarColor'
import InputDropDownButton from 'canvas/toolbar/InputDropDownButton'
import ToolbarDropDownButton from 'canvas/toolbar/ToolbarDropDownButton'
import ToolbarSlider from 'canvas/toolbar/ToolbarSlider'
import ToolbarImage from 'canvas/toolbar/ToolbarImage'
import Table from 'canvas/toolbar/Table'
import DataBinding from 'canvas/toolbar/DataBinding'
import RestSettings from 'canvas/toolbar/RestSettings'
import SymbolService from 'services/SymbolService'
import Preview from 'page/Preview'

export default {
    name: 'DataSection',
    mixins:[_Tooltip, Util, DojoWidget],
    data: function () {
        return {
            mode: "private",
			icons: [],
			previewWidth: 150
        }
    },
    components: {},
    methods: {
        postCreate: function(){
			this.logger = new Logger("DataSection");
			this.db = new DomBuilder();
		},

		setSectionHeader (header){
			this.header = header;
		},

		setUser (user){
			this.user = user;
		},

		setCanvas (canvas){
			this.canvas = canvas;
		},

		setModel (model){
			this.model = model;
		},

		setMode (mode){
			this.mode = mode;
		},

		setIcons (icons) {
			this.icons = icons
		},



		setValue (widget){

			if (this.widget && this.widget.id === widget.id){
				this.logger.log(0, "setValue", "exit because same widget");
				if(this["_update"+type]){
					this["_update"+type](widget);
					this.logger.log(0, "setValue", "exit() >> Update ");
					return;
				}
			}
			this.widget = widget;

			this._cleanUpChildWidgets();
			this.cleanUpTempListener();
			this.domNode.innerHTML="";
			this.cntr = this.db.div("MatcToolbarSectionContent").build(this.domNode);

			var type = widget.type;
			if(this["_show"+type]){
				this["_show"+type](widget);
			} else {
				let props = SymbolService.getWidgetDataProps(type)
				if (props) {
					this.showWidgetByProps(widget, props)
				} else {
					this.logger.log(-1, "setValue", "No Render method for type " + type);
				}
			}

		},

		_setSectionLabel (lbl){
			this.header.firstChild.innerHTML=lbl;
			var chev = document.createElement("span");
			css.add(chev, "MatcToolbarSectionChevron mdi mdi-chevron-down");
			this.header.firstChild.appendChild(chev);
		},

		showWidgetByProps (widget, props) {
			this._setSectionLabel(widget.type);

			props.forEach(p => {
				switch (p.type) {
					case 'Number':
						var options = p.options ? p.options : [10,20,30,40,50,60, 70, 80, 90, 100]
						this._renderInputDropDown(p.label, widget, options, p.key, p.isProp);
						break;

					case 'Color':
						var icon = `<span class="mdi ${p.icon}"></span>`
						if (p.isProp) {
							this._renderColor(p.label, icon, widget.props[p.key], p.key ,"onProperyChanged", true);
						} else {
							this._renderColor(p.label, icon, widget.style[p.key], p.key ,"onStyleChanged", true);
						}

						break;

					case 'Boolean':
						if (p.isProp) {
							this._renderCheck(p.label, widget.props[p.key], p.key, '', 'onProperyChanged');
						} else {
							this._renderCheck(p.label, widget.style[p.key], p.key, '', 'onStyleChanged');
						}
						break;

					case 'Options':
						if (p.isProp) {
							this._renderLabelDropDown(p.label, widget, p.key, p.options, false);
						} else {
							this._renderLabelDropDown(p.label, widget, p.key, p.options, true);
						}
						break;

					default:
						console.error('DataSection.showWidgetByProps() not supported prop', p)
				}
			})
		},

		_showScreenSegment  (widget) {
			this._setSectionLabel("Screen Section");
			// this._renderCheck("Show Scroll",widget.props.scroll, "scroll" );
			
			if (widget.props.screenID) {
				let screen = this.model.screens[widget.props.screenID]
				if (screen) {			
					var div = this.db.div("MatcToolbarGridFull MatcToolbarItem MatcToobarActionCntr" ).build(this.cntr);					
					this.db.span("MatcToolbarSmallIcon mdi mdi-content-duplicate").build(div);
					this.db.span("MatcToolbarItemLabel",  screen.name).build(div);					
					var btn = this.db.span("MatcToobarRemoveBtn ")
						.tooltip("Remove Segment", "vommondToolTipRightBottom")
						.span("mdi mdi-close-circle-outline")
						.build(div);
					this.tempOwn(on(btn, touch.press, lang.hitch(this, "onSegmentScreenSelected", '')));		
				}
			} else {
				var add = this.db.div("MatcToolbarGridFull MatcPointer  MatcToolbarItem").build(this.cntr);
				this.db.span("MatcToolbarSmallIcon mdi mdi-plus-circle").build(add);
				this.db.span("MatcToolbarItemLabel", "Select Segment Screen").build(add);
				this.tempOwn(on(add, touch.press, lang.hitch(this, "_renderSegmentScreen")));
			}

		
			//this._renderButton(lbl, icon, "_renderSegmentScreen");
		},

		_showRepeater (model){
			this._setSectionLabel("Grid");

			this._renderLabelDropDown("Normal", model,"layout",[
				{ value: "rows", icon:"mdi mdi mdi-view-sequential", label : "Rows"},
				{ value:"grid", icon:"mdi mdi-view-grid", label : "Grid"}
			]);

			this._renderCheck("Auto Fill",model.props.auto, "auto" );

			if (model.props.auto === false) {
				//this._renderSlider('Count', model, 'count', 0, 30)
				//this._renderSlider('Vertical Spacing', model, 'distanceY', 0, 100)
				//this._renderSlider('Horizontal Spacing', model, 'distanceX', 0, 100)

				let count = [
					{label: 'Auto', value: -1},
					{label: '1', value: 1},
					{label: '2', value: 2},
					{label: '3', value: 3},
					{label: '4', value: 4},
					{label: '5', value: 5},
					{label: '10', value: 10},
					{label: '20', value: 20},
					{label: '30', value: 30}
				];
				this._renderInputDropDown("Rows",model, count, "rows", true);
				if (model.props.layout === "grid") {
					this._renderInputDropDown("Columns",model, count, "columns", true);
				}

				let margin = [
					{label: 'Auto', value: -1},
					{label: '0', value: 0},
					{label: '8', value: 8},
					{label: '16', value: 16},
					{label: '24', value: 24},
					{label: '30', value: 30},
					{label: '40', value: 40},
					{label: '50', value: 50}
				];

				this._renderInputDropDown("Vertical Spacing ", model, margin, "distanceY", true);
				if (model.props.layout === "grid") {
					this._renderInputDropDown("Horizontal Spacing", model, margin, "distanceX", true);
				}
			}
		},

		_showCheckBoxGroup (model){
			this._setSectionLabel("CheckBox Group");

			this._renderButton("Options", "mdi mdi-settings", "_renderOptionDialog");
			this._renderColor('Hook Color','<span class="mdi mdi-check"></span>',model.style.colorButton, "colorButton" ,"onStyleChanged", true);
			this._renderColor('Background','<span class="mdi mdi-format-color-fill"></span>',model.style.background, "background", "onStyleChanged",true );
			this._renderInputDropDown("Height",model, [10,20,30,40,50,60, 70, 80, 90, 100], "boxHeight", false);

		},

		_showProgressBar (model) {
			this._setSectionLabel("ProgressBar");

			this._renderColor('Foreground','<span class="mdi mdi-format-color-fill"></span>',model.style.foreground, "foreground" ,"onStyleChanged", true);
			this._renderColor('Background','<span class="mdi mdi-format-color-fill"></span>',model.style.background, "background", "onStyleChanged",true );
			this._renderInputDropDown("Progress", model, [10,20,30,40,50,60, 70, 80, 90, 100], "value", true);
		},

		_showRadioGroup (model){
			this._setSectionLabel("Radio Group");

			this._renderButton("Options", "mdi mdi-settings", "_renderOptionDialog");
			this._renderColor('Checked Button','<span class="MatcIconCircle"></span>',model.style.colorButton, "colorButton" );
			this._renderColor('Background','<span class="mdi mdi-format-color-fill"></span>',model.style.background, "background", "onStyleChanged",true );
			this._renderInputDropDown("Height",model, [10,20,30,40,50,60, 70, 80, 90, 100], "boxHeight", false);

		},

		_showRest (){
			this._setSectionLabel("Rest");
			this._renderPrimaryButton("Configuration", "mdi mdi-settings", "_renderRestDialog");
		},

		_showLogicOr (model){
			this._setSectionLabel("Logic");
			this._renderCheck("A / B Test (Select line randomly)",model.props.isRandom, "isRandom" );
		},

		_showBarChart (model){
			this._setSectionLabel("Chart");

			this._renderButton("Values", "mdi mdi-table-large", "_renderTableDialog");

			if(model.props.data && model.props.data[0]){
				var row = model.props.data[0];
				for(var i =0; i< row.length; i++){
					var key = "background" + i;
					this._renderColor('Bar ' + i+1 + " Color",'<span class="mdi mdi-format-color-fill"></span>',model.style[key], key, "onStyleChanged" , true);
				}
			}
		},


		_showRingChart (model){
			this._setSectionLabel("Chart");

			this._renderInputDropDown("Value",model, [0,10,20,30,40,50,60,70,80,90, 100], "value", true);
			this._renderInputDropDown("Width",model, [0,10,20,30,40,50,100], "lineWidth", false);


			this._renderColor('Background','<span class="mdi mdi-format-color-fill"></span>',model.style.background, "background", "onStyleChanged" , true);
			this._renderColor("Foreground",'<span class="mdi mdi-format-color-fill"></span>',model.style.color, "color", "onStyleChanged" , true);

		},


		_showPieChart (model){
			this._setSectionLabel("Chart");
			this._renderButton("Values", "mdi mdi-table-large", "_renderTableDialog");

			if(model.props.data && model.props.data[0]){
				var row = model.props.data[0];
				for(var i =0; i< row.length; i++){
					var key = "background" + i;
					this._renderColor('Bar ' + i+1 + " Color",'<span class="mdi mdi-format-color-fill"></span>',model.style[key], key, "onStyleChanged" , true);
				}
			}
		},


		_showMultiRingChart (model){
			this._setSectionLabel("Chart");
			this._renderButton("Values", "mdi mdi-table-large", "_renderTableDialog");
			this._renderInputDropDown("Width",model, [0,10,20,30,40,50,100], "lineWidth", false);

			if(model.props.data && model.props.data[0]){
				var row = model.props.data[0];
				for(var i =0; i< row.length; i++){
					var key = "background" + i;
					this._renderColor('Bar ' + i+1 + " Color",'<span class="mdi mdi-format-color-fill"></span>',model.style[key], key, "onStyleChanged" , true);
				}
			}

		},


		_showLabel (){
			this._setSectionLabel("Label");
		},


		_showToggleButton (model) {
			this._setSectionLabel("Toggle Button");
			this._renderCheck("Active",model.props.active, "active" );
		},

		_showTextBox (model){
			this._setSectionLabel("TextBox");
			this._renderCheck("Text is placeholder",model.props.placeholder, "placeholder" );
			this._renderCheck("Focus on load",model.props.focus, "focus" );
			this._renderLabelDropDown("Normal", model,"stringCase",[
			         { value: null, icon:"mdi mdi-briefcase-check", label : "Normal"},
      			    { value:"UpperCase", icon:"mdi mdi-briefcase-upload", label : "Upper Case"},
      			    { value: "LowerCase", icon:"mdi mdi-briefcase-download", label : "Lower Case"}
   			]);
		},

		_showTypeAheadTextBox (model){
			this._setSectionLabel("ComboBox");
			this._renderCheck("Text is placeholder",model.props.placeholder, "placeholder" );
			this._renderButton("Options", "mdi mdi-settings", "_renderOptionDialog");
			this._renderBoxColor("Selection", model, "selectedOptionBackground", "selectedOptionColor");
		},



		_showRating (model){
			this._setSectionLabel("Rating");
			this._renderColor('Color','<span class="mdi mdi-star"></span>',model.style.color, "color", "onStyleChanged" , true);

		},

		_showImageCarousel (model){
			this._setSectionLabel("Image Carousel");

			this._renderImagesDropDown(model,"images");
			this._renderDropDown(model,"vertical",[
  			    { value:false, icon:"mdi mdi-swap-horizontal", label : "Horizontal Scrolling"},
   			    { value:true, icon:"mdi mdi-swap-vertical", label : "Vertical Scrolling"}
   			]);
			this._renderReferenceButton(model,"backButton", "No Back Button", "mdi mdi-arrow-left-bold-circle");
			this._renderReferenceButton(model,"nextButton", "No Next Button", "mdi mdi-arrow-right-bold-circle");

		},




		_showIconToggle (model){
			this._setSectionLabel("Icon Toggle");
			this._renderCheck("Active",model.props.active, "active" );
			this._renderColor('Active Color','<span class="' + model.props.activeIcon + '"></span>',model.style.activeColor, "activeColor", "onStyleChanged" , true);
			this._renderColor('Passive Color','<span class="' + model.props.passiveIcon + '"></span>',model.style.passiveColor, "passiveColor", "onStyleChanged" , true);
		},

		_showLabeledIconToggle (model){
			this._setSectionLabel("Icon Toggle");
			this._renderCheck("Active",model.props.active, "active" );
			this._renderColor('Active Color','<span class="' + model.props.activeIcon + '"></span>',model.style.activeColor, "activeColor", "onStyleChanged" , true);
			this._renderColor('Passive Color','<span class="' + model.props.passiveIcon + '"></span>',model.style.passiveColor, "passiveColor", "onStyleChanged" , true);
		},


		_showPassword (model){
			this._setSectionLabel("Password");

			this._renderCheck("Can show clear text", model.props.cleartext, "cleartext" );

			if(model.props.cleartext){
				this._renderCheck("Is visible", model.props.cleartextVisible, "cleartextVisible", "By default the password is visible" );
				this._renderColor('Color','<span class="mdi mdi-format-text"></span>',model.style.cleartextColor, "cleartextColor", "onStyleChanged" , true);
				this._renderInput(model.props, "cleartextHideLabel", "The label to hide the characters");
				this._renderInput(model.props, "cleartextShowLabel", "The label to show the characters");
			}
			this._renderCheck("Focus on load",model.props.focus, "focus" );

		},




		_showTextArea (model){
			this._setSectionLabel("Text Area");
			this._renderCheck("Text is placeholder",model.props.placeholder, "placeholder" );
			this._renderCheck("Focus on load",model.props.focus, "focus" );
		},

		_showDropDown (model){
			this._setSectionLabel("DropDown");
			this._renderButton("Options", "mdi mdi-settings", "_renderOptionDialog");

			this._renderBoxColor("Popup", model, "popupBackground", "popupColor");
			this._renderBoxColor("Selection", model, "selectedOptionBackground", "selectedOptionColor");

			this._renderLabelDropDown("Popup Position", model,"popupPosition",[
       			    { value:"MatcWidgetTypeDropDownPopUber", icon:"mdi mdi-arrow-up-bold-circle", label : "Popup Over"},
       			    { value:null, icon:"mdi mdi-arrow-down-bold-circle", label : "Popup Under"},
			]);
			this._renderColor('Popup Border','<span class="mdi mdi-border-color"></span>',model.style.popupBorderColor, "popupBorderColor" ,"onStyleChanged", true);

		},

		_showHoverDropDown (model){
			this._setSectionLabel("Hover DropDown");
			this._renderButton("Options", "mdi mdi-settings", "_renderOptionDialog");
			this._renderBoxColor("Popup", model, "popupBackground", "popupColor");
			this._renderBoxColor("Selection", model, "selectedOptionBackground", "selectedOptionColor");

			this._renderLabelDropDown("Popup Position", model,"popupPosition",[
       			    { value:"MatcWidgetTypeDropDownPopUber", icon:"mdi mdi-arrow-up-bold-circle", label : "Popup Over"},
       			    { value:null, icon:"mdi mdi-arrow-down-bold-circle", label : "Popup Under"},
			]);
			this._renderColor('Popup Border','<span class="mdi mdi-border-color"></span>',model.style.popupBorderColor, "popupBorderColor" ,"onStyleChanged", true);
		},

		_showMobileDropDown (model){
			this._setSectionLabel("Modal Select");
			this._renderButton("Options", "mdi mdi-settings", "_renderOptionDialog");
			this._renderColor('Popup Text','<span class="mdi mdi-format-text"></span>',model.style.popupColor, "popupColor", "onStyleChanged" , true);
			this._renderColor('Popup Background','<span class="mdi mdi-format-color-fill"></span>',model.style.popupBackground, "popupBackground" ,"onStyleChanged", true);
			this._renderColor('Popup Border','<span class="mdi mdi-border-color"></span>',model.style.popupBorderColor, "popupBorderColor" ,"onStyleChanged", true);
		},

		_showSegmentButton (){
			this._setSectionLabel("Segment Button");
			this._renderButton("Options", "mdi mdi-settings", "_renderOptionDialog");
		},


		_showHSlider (model){
			this._setSectionLabel("Slider");

			this._renderInputDropDown("Position",model, [10,20,30,40,50,60,70,80,90,100], "value", true);
			this._renderInputDropDown("Handle Width",model, [5,10,20,30,40,50, 75,100], "handleWidth");
			this._renderInputDropDown("Handle Radius",model, [0,1,2,3,4,5,10,20,30,40,50, 75,100], "handleRadius");
			this._renderColor('Handle Color','<span class="mdi mdi-format-color-fill"></span>',model.style.handleColor, "handleColor" ,"onStyleChanged", true);
			this._renderColor('Foreground Color','<span class="mdi mdi-format-color-fill"></span>',model.style.barColor, "barColor" ,"onStyleChanged", true);

			//this._renderReferenceButton(model,"valueLabel", "No Label", "mdi mdi-label");
		},


		_showStepper (model){
			this._setSectionLabel("Stepper");
			this._renderInputDropDown("Start Value",model, [0,1,5,10,20,30,40,50,100], "value", true);
			var refs = this.getRef(model, "valueLabel");
			if(refs && refs.length > 0){
				this._renderReferenceButton(model,"valueLabel", "No Label", "mdi mdi-label");
			}
		},

		_showCountingStepper (model){
			this._setSectionLabel("Counting Stepper");
			this._renderInputDropDown("Start Value",model, [0,1,5,10,20,30,40,50,100], "value", true);
		
			this._renderColor('Button Color','<span class="mdi mdi-format-text"></span>',model.style.colorButton, "colorButton" ,"onStyleChanged", true);
			this._renderColor('Button Background','<span class="mdi mdi-format-color-fill"></span>',model.style.backgroundButton, "backgroundButton", "onStyleChanged",true );

		},

		_showSpinner (model){
			this._setSectionLabel("Spinner");
			this._renderButton("Options", "mdi mdi-settings", "_renderOptionDialog");
			this._renderColor('Border','<span class="mdi mdi-border-color"></span>',model.style.borderBoxColor, "borderBoxColor", "onStyleChanged", true );

		},

		_showDateDropDown (model){

			if(model.props.range){
				this._setSectionLabel("Date Range Picker");
			} else {
				this._setSectionLabel("Date Picker");
			}

			/**
			 * FIXME: This should all go into a dialog!
			 */
			this._renderBoxColor("Header", model, "headerBackground", "headerColor");
			this._renderBoxColor("Table Header", model, "tableHeaderBackground", "tableHeaderColor");
			this._renderBoxColor("Selection", model, "selectedBackground", "selectedColor");
			this._renderColor('Popup Border','<span class="mdi mdi-border-color"></span>',model.style.popupBorderColor, "popupBorderColor" ,"onStyleChanged", true);


			if(model.props.range){
				this._renderBoxColor("Range", model, "selectedInRangeBackground", "selectedInRangeColor");
			}

		},

		_showDate (model){

			if(model.props.range){
				this._setSectionLabel("Date Range");
			} else {
				this._setSectionLabel("Calendar");
			}

			/**
			 * FIXME: This should all go into a dialog!
			 */
			this._renderBoxColor("Header", model, "headerBackground", "headerColor");
			this._renderBoxColor("Table Header", model, "tableHeaderBackground", "tableHeaderColor");
			this._renderBoxColor("Selection", model, "selectedBackground", "selectedColor");

			if(model.props.range){
				this._renderBoxColor("Range", model, "selectedInRangeBackground", "selectedInRangeColor");
			}
		},

		_showDragNDrop (model){
			this._setSectionLabel("Drag N Drop");
			this._renderCheck("Vertical Move",model.props.dndY, "dndY" );
			this._renderCheck("Horizontal Move",model.props.dndX, "dndX" );
		},

		_showCheckBox (model){
			this._setSectionLabel("CheckBox");
			this._renderCheck("Checked",model.props.checked, "checked" );
			this._renderColor('Hook Color','<span class="mdi mdi-check"></span>',model.style.colorButton, "colorButton" ,"onStyleChanged", true);
			this._renderColor('Background','<span class="mdi mdi-format-color-fill"></span>',model.style.background, "background", "onStyleChanged",true );

		},

		_showRadioBox (model){
			this._setSectionLabel("RadioBox");
			this._renderCheck("Checked",model.props.checked, "checked" );
			this._renderColor('Checked Button','<span class="MatcIconCircle"></span>',model.style.colorButton, "colorButton" );
			this._renderColor('Background','<span class="mdi mdi-format-color-fill"></span>',model.style.background, "background", "onStyleChanged",true );

		},

		_showRadioBox2 (model){
			this._setSectionLabel("RadioBox");
			this._renderCheck("Checked",model.props.checked, "checked" );
			this._renderColor('Checked Button','<span class="MatcIconCircle"></span>',model.style.colorButton, "colorButton" );
			this._renderColor('Background','<span class="mdi mdi-format-color-fill"></span>',model.style.background, "background", "onStyleChanged",true );

			var lbl = "No Group";
			if (model.props.formGroup){
				lbl = model.props.formGroup + "";
			}

			this._renderButton(lbl, "mdi mdi-settings", "_showFormGroupDialog");

		},

		_showIcon (model){
			this._setSectionLabel("Icon");
			this._renderButton("Icon", "mdi mdi-settings", "_renderIconDialog");
			this._renderColor('Color','<span class="mdi mdi-format-color-fill"></span>',model.style.color, "color", "onStyleChanged", true );
		},

		_showCamera (model){
			this._setSectionLabel("Camera");
			this._renderButton("Icon", "mdi mdi-settings", "_renderIconDialog");
			this._renderColor('Color','<span class="mdi mdi-format-color-fill"></span>',model.style.color, "color", "onStyleChanged", true );
		},


		_showSwitch (model){
			this._setSectionLabel("Switch");
			this._renderCheck("Active",model.props.checked, "checked" );
			this._renderColor('Button Background','<span class="MatcIconCircle"></span>',model.style.colorButton, "colorButton" );
			this._renderColor('Active Background','<span class="mdi mdi-format-color-fill"></span>',model.style.background, "background", "onStyleChanged",true );
			this._renderColor('Passive Background','<span class="mdi mdi-format-color-fill"></span>',model.style.colorForeGround, "colorForeGround", "onStyleChanged",true );
		},



		_showTable (model){
			this._setSectionLabel("Table");

			this._renderButton("Values", "mdi mdi-table-large", "_renderTableDialog");

			this._renderBoxColor("Header", model, "headerBackground", "headerColor");
			this._renderBoxColor("Odd Row", model, "background", "color");
			this._renderBoxColor("Even Row", model, "evenRowBackground", "evenRowColor");


			var row = this.db.div("MatcToobarRow").build(this.cntr);
			//this.db.span("MatcToolbarItemLabel", "Border Style").build(row);
			var border = this.$new(ToolbarDropDownButton, {maxLabelLength: 20});
			border.reposition = true;

			border.setOptions([
			    { value:"Cell", icon:"mdi mdi-border-all", label : "Full Border"},
   			    { value:"HLines", icon:"mdi mdi-border-horizontal", label : "Horizontal Border"},
	   			{ value:"VLines", icon:"mdi mdi-border-vertical", label : "Vertical Border"},
	   			{ value:"None", icon:"mdi mdi-border-none", label : "No Border"},
	   			{ value:"Out", icon:"mdi mdi-border-outside", label : "Outside Border"}
   			]);

			border.setValue(model.props.borderStyle)
			border.setPopupCss("MatcActionAnimProperties");
   			this.own(on(border, "change", lang.hitch(this, "onProperyChanged", "borderStyle")));
			border.placeAt(row);


			this._renderColor('Border Color','<span class="mdi mdi-border-color"></span>',model.style.borderBottomColor, "borderBottomColor" , null, true);
		},



		_renderIgnoreState (widget){
			var row = this.db.div("MatcToobarRow").build(this.cntr);

			var chkBox = this.$new(CheckBox);
			css.add(chkBox.domNode, "MatcToolbarItem");
			chkBox.placeAt(row);
			chkBox.setLabel("Forget State")
			chkBox.setValue(widget.props.ignoreStateOnPageLoad);
			this.tempOwn(on(chkBox, "change", lang.hitch(this, "setIgnoreState")));
			this._addChildWidget(chkBox);
			this.addTooltip(row, "Do not load previous state when showing the widget again.");
		},

		/**********************************************************************
		 * Table
		 **********************************************************************/


		_renderRestDialog (e) {

			var popup = this.db.div("MatcOptionDialog MatcPadding").build();
			var cntr = this.db.div("").build(popup);
			var settings = this.$new(RestSettings);
			settings.setWidget(this.widget);
			settings.setModel(this.model);
			settings.placeAt(cntr);
			var bar = this.db.div("MatcButtonBar MatcMarginTop").build(popup);
			var write = this.db.div("MatcButton", "Ok").build(bar);
			var cancel = this.db.a("MatcLinkButton", "Cancel").build(bar);

			var d = this.canvas.createDialog();
			d.own(on(write, touch.press, lang.hitch(this,"setRest", d, settings)));
			d.own(on(cancel, touch.press, lang.hitch(this, "closeDialog",d, settings)));
			d.own(on(d, "close", () => {
				settings.destroy();
				this.canvas.setState(0);
			}));
			d.popup(popup, e.target);
		},

		setRest (d, settings) {
			let value = settings.getValue()
			this.onProperyChanged('rest', value)
			d.close()
		},

		/**********************************************************************
		 * Segment
		 **********************************************************************/

		_renderSegmentScreen (e) {
			
			var d = new Dialog({overflow:true});

			var div = this.db.div("MatcToolbarScreenListDialog MatcPadding").build();
			this.db.label("", "Select Screen Segment").build(div);
			var cntr = this.db.div("MatcToolbarScreenListDialogCntr").build(div);			
			var list = this.db.div().build();			
			
			var height = Math.min(this.model.screenSize.h / (this.model.screenSize.w / this.previewWidth), 250) ;
		
			this.previews = [];
	
			for(var screenID in this.model.screens){
				/**
				 * Do not show the selected screen or any parents
				 */
				var screen = this.model.screens[screenID];
				if (screen.segment) {
					var wrapper = this.db.div("MatcToolbarScreenListPreviewWrapper MatcCreateBtnElement MatcToolbarDropDownButtonItem").build(list);
					var screenCntr = this.db.div("MatcToolbarScreenListPreview").build(wrapper);
					screenCntr.style.width = this.previewWidth + "px";
					screenCntr.style.height = height + "px";
					var preview = this.$new(Preview);
					preview.setScreenPos({w:this.previewWidth, h:height});
					preview.setModel(this.model);
					preview.setScreen(screenID);
					preview.placeAt(screenCntr);
					this.previews.push(preview);					
					var lbl = this.db.div("MatcCreateBtnElementLabel", screen.name).build(wrapper);
					lbl.style.width = this.previewWidth + "px";					
					d.own(on(wrapper, touch.press, lang.hitch(this, "onSegmentScreenSelected", screenID, d)));
				}
			}		
			
			var scroll = this.$new(ScrollContainer);
			scroll.placeAt(cntr);
			scroll.wrap(list);			
			var bar = this.db.div("MatcButtonBar MatcMarginTop").build(div);					
			var cancel = this.db.a("MatcButton", "Cancel").build(bar);			
		
			d.own(on(cancel, touch.press, lang.hitch(d, "close")));
			d.own(on(d, "close", function () {
				scroll.destroy()
			}))
			d.popup(div, e.target);			
		
		},

		onSegmentScreenSelected (screenID, d) {
			if (d && d.close) {
				d.close()
			}
		
			this.onProperyChanged("screenID", screenID);
		},

		/**********************************************************************
		 * DataBinding
		 **********************************************************************/

		_renderDataBinding (widget, hasIgnoreState = true){
			var icon = "mdi mdi-database-plus";
			var txt = "Add Data Binding";

			var dataBinding = this.getDataBinding(widget);
			if(dataBinding && Object.keys(dataBinding).length > 0){
				icon = "mdi mdi-database";
				txt = Object.values(dataBinding).join(', ')
			}

			var row = this.db.div("MatcToobarRow MatcAction ").build(this.cntr);

			var cntr = this.db.div(" MatcToolbarItem MatcToolbarDropDownButton MatcToolbarGridFull").build(row);
			var lbl = this.db.label("MatcToolbarItemIcon").build(cntr);
			this.db.span(icon).build(lbl);
			this.db.span("MatcToolbarDropDownButtonLabel", txt).build(lbl);

			this.db.span("caret").build(cntr);
			this.tempOwn(on(cntr, touch.press, lang.hitch(this, "_showDataBindingDialog", widget)));

			if (hasIgnoreState) {
				this._renderIgnoreState(widget);
			}
		},

		_showDataBindingDialog (widget){

			var popup = this.db.div("MatcDataBindingDialogXXL MatcPadding").build();
			var cntr = this.db.div("").build(popup);

			let dataBinding = this.$new(DataBinding)
			dataBinding.setModel(this.model)
			dataBinding.setWidget(widget)
			dataBinding.placeAt(cntr)

			var bar = this.db.div("MatcButtonBar MatcMarginTop").build(popup);
			var write = this.db.div("MatcButton", "Ok").build(bar);
			var cancel = this.db.a("MatcLinkButton", "Cancel").build(bar);


			var d = new Dialog({overflow:true});

			d.own(on(write, touch.press, lang.hitch(this,"setDataBinding", d, dataBinding, widget)));
			d.own(on(cancel, touch.press, lang.hitch(d, "close")));
			d.own(on(d, "close", function(){
				dataBinding.destroy();
			}));
			d.popup(popup, this.cntr);
		},

		setDataBinding (d, dataBindingWidget){
			/**
			 * Since 2.1.2 We get a dict form the dataBinding Widgt
			 */
			let value = dataBindingWidget.getValue()

			/**
			 * FIXME: Since 2.1.5 we should add here some other call
			 */
			this.emit("propertyChange", "databinding", value);
			d.close();
		},

		/**********************************************************************
		 * Table
		 **********************************************************************/


		_renderTableDialog (e){

			var me = this;
			var popup = this.db.div("MatcOptionDialog MatcPadding").build();
			var cntr = this.db.div("").build(popup);
			var table = this.$new(Table);
			table.setWidget(this.widget);
			table.placeAt(cntr);
			var bar = this.db.div("MatcButtonBar MatcMarginTop").build(popup);
			var write = this.db.div("MatcButton", "Ok").build(bar);
			var cancel = this.db.a("MatcLinkButton", "Cancel").build(bar);

			var d = this.canvas.createDialog();
			d.own(on(write, touch.press, lang.hitch(this,"setTableData", d, table)));
			d.own(on(cancel, touch.press, lang.hitch(this, "closeDialog",d, table)));
			d.own(on(d, "close", function(){
				table.destroy();
				me.canvas.setState(0);
			}));
			d.popup(popup, e.target);

		},

		setTableData (d, table){

			if(table.dataDirty){
				var data = table.getData();
				this.onProperyChanged("data", data);
			}

			if(table.widthDirty){
				var widths = table.getWidths();
				this.onProperyChanged("widths", widths);
			}


			table.destroy();


			d.close();
		},


		/**********************************************************************
		 * Form Group
		 **********************************************************************/

		_showFormGroupDialog (e){
			this.stopEvent(e);


			var popup = this.db.div("MatcOptionDialog MatcPadding").build();

			var cntr = this.db.div("MatcDialogTable MatcDialogTableXL").build(popup);


			var scroller = this.$new(ScrollContainer);
			scroller.placeAt(cntr);

			var list = this.$new(InputList,{"check" : "single"});
			if (this.widget.props){
				list.setSelected(this.widget.props.formGroup);
			}
			list.setOptions(this.getFormGroups(this.widget));
			scroller.wrap(list.domNode);

			var bar = this.db.div("MatcButtonBar MatcMarginTop").build(popup);

			var write = this.db.div("MatcButton", "Ok").build(bar);
			var cancel = this.db.a("MatcLinkButton", "Cancel").build(bar);

			var d = new Dialog({overflow:true});

			d.own(on(write, touch.press, lang.hitch(this,"setFormGroup", d, list)));
			d.own(on(cancel, touch.press, lang.hitch(d, "close")));
			d.own(on(d, "close", function(){
				list.destroy();
			}));
			d.popup(popup, this.cntr);
		},

		setFormGroup (d, list){
			var value = list.getSelected();
			this.emit("propertyChange", "formGroup", value);
			d.close();
			list.destroy();
		},


		getFormGroups (model){
			var result = [];
			var screen = this.getParentScreen(model);
			if (screen){
				var children = screen.children;
				for(var i=0; i< children.length; i++){
					var widgetID = children[i];
					var widget = this.model.widgets[widgetID];
					if (widget.props && widget.props.formGroup){
						if(result.indexOf(widget.props.formGroup) < 0 ){
							result.push(widget.props.formGroup);
						}
					}
				}
			} else {
				console.warn("getFormGroups() > no screen", model)
			}
			return result;
		},


		/**********************************************************************
		 * Reference
		 **********************************************************************/


		_renderReferenceButton (model, refId,txt, refIcon ){
			var refs = this.getRef(model, refId);

			var icon = "mdi mdi-close";
			var refButton;
			if(refs){
				refButton = refs[0];
				if(refButton){
					icon = refIcon;
					var btn = this.model.widgets[refButton];
					if(btn){
						txt = btn.name;
					}
				}

			}

			var row = this.db.div("MatcToobarRow MatcAction ").build(this.cntr);

			var cntr = this.db.div(" MatcToolbarItem MatcToolbarDropDownButton MatcToolbarGridFull").build(row);
			var lbl = this.db.label("MatcToolbarItemIcon").build(cntr);
			this.db.span(icon).build(lbl);
			this.db.span("MatcToolbarDropDownButtonLabel", txt).build(lbl);


			this.db.span("caret").build(cntr);
			this.tempOwn(on(cntr, touch.press, lang.hitch(this, "_showRefDialog", model, refButton, refId)));

		},

		_showRefDialog (model, refElement, refId, e){
			this.stopEvent(e);


			var popup = this.db.div("MatcOptionDialog MatcPadding").build();

			var cntr = this.db.div("MatcDialogTable MatcDialogTableXL").build(popup);


			var widgetsWidthDistance = this._getSortedReferenceableWidgets(model);


			var scroller = this.$new(ScrollContainer);
			scroller.placeAt(cntr);


			var list = this.$new(InputList,{"check" : "single", "add":false, "remove" : false, "edit":false});
			list.setLabelFct(function(option){
				if(option && option.widget){
					return option.widget.name;
				}
				return option;
			});
			list.isSelected = function(option){
				if(option && option.widget){
					return refElement == option.widget.id
				}
				return false;
			};
			list.setSelected(refElement);
			list.setOptions(widgetsWidthDistance);


			scroller.wrap(list.domNode);

			var bar = this.db.div("MatcButtonBar MatcMarginTop").build(popup);

			var write = this.db.div("MatcButton", "Ok").build(bar);
			var cancel = this.db.a("MatcLinkButton", "Cancel").build(bar);

			var d = new Dialog({overflow:true});

			d.own(on(write, touch.press, lang.hitch(this,"setReference", d, list, model, refId)));
			d.own(on(cancel, touch.press, lang.hitch(d, "close")));
			d.own(on(d, "close", function(){
				list.destroy();
			}));
			d.popup(popup, this.cntr);
		},

		setReference (d, list, model, refId){

			var ref = {};
			if(model.props && model.props.refs){
				ref = lang.clone(model.props.refs);
			}

			var selectedOption = list.getSelected();

			if(selectedOption && selectedOption.widget){
				/**
				 * ATTENTION: Set as array!
				 */
				ref[refId] = [selectedOption.widget.id];

			} else {
				delete ref[refId];
			}
			this.emit("propertyChange", "refs", ref);


			d.close();
			list.destroy();

		},

		_getSortedReferenceableWidgets (){
			var widgetsWidthDistance = [];

			var supportedType = ["Box", "Label", "Icon", "Button"];
			var screen = this.getParentScreen(this.widget);
			var children = screen.children;
			for(var i=0; i< children.length; i++){
				var widgetID = children[i];
				var widget = this.model.widgets[widgetID];
				var type = widget.type;
				if(supportedType.indexOf(type)>=0 ){
					widgetsWidthDistance.push({
						d : 0,
						y : widget.y,
						widget : widget,
					});
				}
			}

			widgetsWidthDistance.sort(function(a,b){
				return a.y -b.y;
			});

			return widgetsWidthDistance;
		},


		/**********************************************************************
		 * Options
		 **********************************************************************/

		_renderOptionDialog (e){
			this.stopEvent(e);

			var popup = this.db.div("MatcOptionDialog MatcPadding").build();

			var cntr = this.db.div("MatcDialogTable").build(popup);

			var scroller = this.$new(ScrollContainer);
			scroller.placeAt(cntr);

			var list = this.$new(InputList, {"check" : "single"});
			list.setSelected(this.widget.props.selected);
			list.setOptions(this.widget.props.options);

			scroller.wrap(list.domNode);

			var bar = this.db.div("MatcButtonBar MatcMarginTop").build(popup);

			var write = this.db.div("MatcButton", "Ok").build(bar);
			var cancel = this.db.a("MatcLinkButton", "Cancel").build(bar);

			var d = new Dialog();
			d.own(on(write, touch.press, lang.hitch(this,"setOptions", d, scroller, list)));
			d.own(on(cancel, touch.press, lang.hitch(this, "closeDialog",d, scroller, list)));
			d.popup(popup, e.target);
		},

		/**********************************************************************
		 * Icons
		 **********************************************************************/
		_renderIconDialog (e){
			this.stopEvent(e);

			var popup = this.db.div("MatcDialogXXL MatcPadding").build();


			var bar = this.db.div("MatcRight").build(popup);

			var div = this.db.div("form-group has-feedback").build(bar);
			var input = this.db.input("MatcCreateSearch MatcIgnoreOnKeyPress form-control").build(div);
			input.type = "search";
			this.db.span("mdi mdi-magnify  form-control-feedback MatcCreateSearchBtn").build(div);


			var cntr = this.db.div("MatcDateSectionIconCntr", "").build(popup);


			var table = this.db.div("").build();

			var scroller = this.$new(ScrollContainer);
			scroller.placeAt(cntr);
			scroller.wrap(table);

			bar = this.db.div("MatcButtonBar MatcMarginTop").build(popup);
			var cancel = this.db.a("MatcLinkButton", "Cancel").build(bar);

			var d = new Dialog();
			d.own(on(cancel, touch.press, lang.hitch(d, "close")));
			d.own(on(table, touch.press, lang.hitch(this, "setIcon", d)));
			d.own(on(input, touch.press, function(e){e.stopPropagation()}));
			d.own(on(input, "keypress", function(e){e.stopPropagation()}));
			d.own(on(input, "keydown", function(e){e.stopPropagation()}));
			d.own(on(input, "keyup", lang.hitch(this,"onIconSearch", input, table)));

			d.popup(popup, e.target);

			var me = this;
			setTimeout(function(){
				input.focus();
				me.renderIconTable(table,"");
			},500);
		},

		renderIconTable (table, filter){
			table.innerHTML="";
			var icons = this.icons;
			// var count =0;
			for (var j = 0; j < icons.length; j++) {
				var icon = icons[j];
				if(!filter || icon.indexOf(filter.toLowerCase()) >=0 ){
					var span = this.db.span("MatcToolbarDropDownButtonItem mdi mdi-"+icons[j]).build(table);
					span.setAttribute("data-matc-icon", icons[j]);
					// count++;
				}
			}
		},

		onIconSearch (input, tbody, e){
			this.stopEvent(e);
			var filter = input.value;
			if(filter.length >= 3){
				this.renderIconTable(tbody, filter);
			} else {
				this.renderIconTable(tbody, "");
			}
		},

		setIcon (d,e){
			d.close();
			var node = e.target;
			if(node){
				var icon = node.getAttribute("data-matc-icon");
				if(icon){
					this.onStyleChanged("icon", "mdi mdi-" +icon);
				}

			}

		},

		setOptions (d, scroller, list){
			this.closeDialog(d, scroller, list);
			var options = list.getOptions();
			var selected = list.getSelected();
			/**
			 * FIXME: This should be a composite command!
			 */
			this.onProperyChanged("options", options);
			this.onProperyChanged("selected", selected);
		},

		closeDialog (d, scroller, list){
			d.close();
			if(scroller && scroller.destroy){
				scroller.destroy();
			}
			if(list && list.destroy){
				list.destroy();
			}
			delete this._optionInputs;
		},


		/**********************************************************************
		 *Helpers
		 **********************************************************************/


		getRef (model, id){
			if(model.props.refs && model.props.refs[id]){
				return model.props.refs[id];
			}
			return null;
		},

		_renderSlider (label, model, prop, min, max){

			var row = this.db.div("MatcToobarRow").build(this.cntr);

			let radius = this.db.div('MatcToolbarRadius').build(row);
			this.db.span('MatcToolbarItemLabel', label).build(radius);

			var slider = this.$new(ToolbarSlider, {max:max, min: min});
			slider.placeAt(radius);
			slider.render()
			slider.setValue(model.props[prop])
			this.own(on(slider, "change", lang.hitch(this, "onProperyChanged", prop)));


			this._addChildWidget(slider);
		},


		_renderCheck (lbl, value, property, tt, callback = 'onProperyChanged'){

			var row = this.db.div("MatcToobarRow").build(this.cntr);
			//this.db.span("MatcToolbarItemLabel", lbl).build(row);

			var chkBox = this.$new(CheckBox);
			css.add(chkBox.domNode, "MatcToolbarItem");
			chkBox.placeAt(row);
			chkBox.setLabel(lbl)
			chkBox.setValue(value);
			this.tempOwn(on(chkBox, "change", lang.hitch(this, callback, property)));
			this._addChildWidget(chkBox);

			if(tt){
				this.addTooltip(row, tt);
			}
		},

		_renderButton (lbl, icon, callback){
			var row = this.db.div("MatcToobarRow ").build(this.cntr);
			var item = this.db.div("MatcToolbarItem MatcToolbarGridFull MatcToolbarDropDownButton").build(row);
			var btn = this.db.span("MatcToolbarItemIcon").build(item);
			this.db.span(icon).build(btn)
			this.db.span("MatcToolbarItemLabel", lbl).build(btn);
			this.tempOwn(on(row, touch.press, lang.hitch(this, callback)));
		},

		_renderPrimaryButton (lbl, icon, callback){
			var row = this.db.div("MatcToobarRow ").build(this.cntr);
			var item = this.db.div("MatcToolbarItem MatcToolbarGridFull").build(row);
			var btn = this.db.span("MatcToolbarButton MatcButton").build(item);
			this.db.span(icon + ' MatcButtonIcon').build(btn)
			this.db.span("MatcButtonIconLabel", lbl).build(btn);
			this.tempOwn(on(row, touch.press, lang.hitch(this, callback)));
		},


		_renderInfo(lbl, icon){
			var row = this.db.div("MatcToobarRow ").build(this.cntr);
			var item = this.db.div("MatcToolbarItem MatcToolbarGridFull MatcToolbarDropDownButton").build(row);
			var btn = this.db.span("MatcToolbarItemIcon").build(item);
			this.db.span(icon).build(btn)
			this.db.span("MatcToolbarItemLabel", lbl).build(btn);
		},

		_renderDropDown (model, prop, options){

			var row = this.db.div("MatcToobarRow").build(this.cntr);

			var drpDwn = this.$new(ToolbarDropDownButton, {maxLabelLength:15});
			css.add(drpDwn.domNode, "MatcToolbarGridFull")
			drpDwn.reposition = true;
			drpDwn.setOptions(options);
			drpDwn.setValue(model.props[prop])
			drpDwn.setPopupCss("MatcActionAnimProperties");
   			this.own(on(drpDwn, "change", lang.hitch(this, "onProperyChanged", prop)));

   			drpDwn.placeAt(row);

			this._addChildWidget(drpDwn);
		},

		_renderLabelDropDown (label, model, prop, options, isStyle){

			var row = this.db.div("MatcToobarRow").build(this.cntr);
			var drpDwn = this.$new(ToolbarDropDownButton, {maxLabelLength:15});
			css.add(drpDwn.domNode, "")
			drpDwn.reposition = true;
			drpDwn.setOptions(options);
			drpDwn.setLabelPostfix(label);
			if (isStyle) {
				drpDwn.setValue(model.style[prop])
			} else {
				drpDwn.setValue(model.props[prop])
			}

			drpDwn.setPopupCss("MatcActionAnimProperties");
			if (isStyle) {
				this.own(on(drpDwn, "change", lang.hitch(this, 'onStyleChanged', prop)));
			} else {
				this.own(on(drpDwn, "change", lang.hitch(this, 'onProperyChanged', prop)));
			}


   			drpDwn.placeAt(row);

   			//this.db.span("MatcToolbarItemLabel", label).build(row);

			this._addChildWidget(drpDwn);

		},

		_renderImagesDropDown (widget){


			var row = this.db.div("MatcToobarRow").build(this.cntr);

			var imageDrpDwn = this.$new(ToolbarImage, {mode:this.mode});
			css.add(imageDrpDwn.domNode, "MatcToolbarGridFull")
			imageDrpDwn.setModel(this.model);
			imageDrpDwn.setCanvas(this.canvas);
			imageDrpDwn.setSelection(widget.props.images);
			imageDrpDwn.setMultiSelection(true);
			imageDrpDwn.setLabel('<span class="mdi mdi-image"></span> <span class="MatcToolbarItemLabel">Images</span>');
			imageDrpDwn.placeAt(row);
			this.tempOwn(on(imageDrpDwn, "change", lang.hitch(this, "onProperyChanged", "images")));


			this._addChildWidget(imageDrpDwn);

			//this.db.span("MatcToolbarItemLabel", "").build(row);

		},




		_renderColor (lbl, icon, value, property, callback, updateColor){

			if(!callback){
				callback ="onStyleChanged";
			}

			var row = this.db.div("MatcToobarRow").build(this.cntr);

			var color = this.$new(ToolbarColor, {hasPicker:true});
			color.placeAt(row);
			if(updateColor){
				color.updateColor = true;
			} else {
				color.updateLabel = true;
			}

			color.setLabel(icon + '<span class="MatcToolbarItemLabel">' + lbl + '</span>');
			color.setModel(this.model);
			color.setValue(value);
			css.add(color.domNode, "MatcToolbarDropDownButton MatcToolbarGridFull");
			this.tempOwn(on(color, "change", lang.hitch(this, callback, property)));
			this.tempOwn(on(color, "changing", lang.hitch(this, "onTempStyleChanged", property)));

			//this.db.span("MatcToolbarItemLabel", lbl).build(row);

			this._addChildWidget(color);

			return color;
		},


		_renderInput (model, property, tt){

			let row = this.db.div("MatcToobarRow MatcToolbarItem  MatcToolbarGridFull").build(this.cntr);
			//this.db.span("MatcToolbarItemLabel",lbl ).build(row);

			var input = this.db.input("MatcIgnoreOnKeyPress MatcToobarInlineEdit").build(row);
			input.value = model[property];

			var callback = lang.hitch(this, "onProperyChanged", property);
			this.tempOwn(on(input, "change", function(){
				callback(input.value);
			}));


			if(tt){
				this.addTooltip(row, tt);
			}


		},


		_renderInputDropDown (lbl, model, options, property, isProp){

			let row = this.db.div("MatcToobarRow ").build(this.cntr);
			var dropDown = this.$new(InputDropDownButton);
			dropDown.reposition = true;
			dropDown.setLabelPostfix("   (" + lbl + ")");
			dropDown.setOptions(options);
			css.add(dropDown.domNode, "MatcToolbarGridFull");
			if(isProp){
				dropDown.setValue(model.props[property])
			} else {
				dropDown.setValue(model.style[property])
			}
			dropDown.placeAt(row);
		//	this.db.span("MatcToolbarItemLabel", lbl + "").build(row);
			if(isProp){
				this.tempOwn(on(dropDown, "change", lang.hitch(this, "onProperyChanged", property)));
			} else {
				this.tempOwn(on(dropDown, "change", lang.hitch(this, "onStyleChanged", property)));
			}
			this._addChildWidget(dropDown);
		},

		_renderBoxColor (lbl, model, propertyBack, propertyColor, propertyBorder){

			let row = this.db.div("MatcToobarRow").build(this.cntr);

			var color = this.$new(ToolbarColor, {hasPicker:true});
			color.placeAt(row);
			color.updateColor = true;
			color.setLabel('<span class="mdi mdi-format-color-fill"></span>' + '<span class="MatcToolbarItemLabel">' + lbl + ' Fill</span>');
			color.setModel(this.model);
			color.setValue(model.style[propertyBack]);
			css.add(color.domNode ,"MatcToolbarGridFull");
			this.tempOwn(on(color, "change", lang.hitch(this, "onStyleChanged", propertyBack)));
			this.tempOwn(on(color, "changing", lang.hitch(this, "onTempStyleChanged", propertyBack)));
			this._addChildWidget(color);

			if(propertyColor){
				row = this.db.div("MatcToobarRow  MatcToolbarGridFull").build(this.cntr);
				color = this.$new(ToolbarColor, {hasPicker:true});
				color.placeAt(row);
				color.updateColor = true;
				color.setLabel('<span class="mdi mdi-format-text"></span>' + '<span class="MatcToolbarItemLabel">' + lbl + ' Font</span>');
				color.setModel(this.model);
				color.setValue(model.style[propertyColor]);
				css.add(color.domNode ,"MatcToolbarGridFull");
				this.tempOwn(on(color, "change", lang.hitch(this, "onStyleChanged", propertyColor)));
				this.tempOwn(on(color, "changing", lang.hitch(this, "onTempStyleChanged", propertyColor)));
				this._addChildWidget(color);
			}

			if(propertyBorder){
				row = this.db.div("MatcToobarRow MatcToolbarGridFull").build(this.cntr);
				color = this.$new(ToolbarColor, {hasPicker:true});
				color.placeAt(row);
				color.updateColor = true;
				color.setLabel('<span class="mdi mdi-border-color"></span>' + '<span class="MatcToolbarItemLabel">' + lbl + ' Border</span>');
				color.setModel(this.model);
				color.setValue(model.style[propertyBorder]);
				css.add(color.domNode ,"MatcToolbarGridFull");
				this.tempOwn(on(color, "change", lang.hitch(this, "onStyleChanged", propertyBorder)));
				this.tempOwn(on(color, "changing", lang.hitch(this, "onTempStyleChanged", propertyBorder)));
				this._addChildWidget(color);
			}
			return color;
		},


		onProperyChanged (key, value){
			this.logger.log(2, "onProperyChanged", "enter > "+ key + " > " + value);
			this.emit("propertyChange", key, value);
		},

		onStyleChanged (key, value){
			this.logger.log(2, "onStyleChanged", "enter > "+ key + " > " + value);
			this.emit("stypeChange", key, value);
		},

		onTempStyleChanged  (key, value){
			this.logger.log(0, "onTempStyleChanged", "enter > "+ key + " > " + value);
			this.emit("stypeChanging", key, value);
		},

		_addChildWidget (w){
			if(!this._childWidgets){
				this._childWidgets =[];
			}
			this._childWidgets.push(w);
		},

		_cleanUpChildWidgets (){
			if(this._childWidgets){
				for(var i=0; i< this._childWidgets.length; i++){
					this._childWidgets[i].destroy();
				}
			}

			delete this._childWidgets;
		}
    },
    mounted () {
    }
}
</script>