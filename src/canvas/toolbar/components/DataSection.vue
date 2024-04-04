
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
import OptionsList from 'common/OptionsList'
import ScrollContainer from 'common/ScrollContainer'
import _Tooltip from 'common/_Tooltip'
import Util from 'core/Util'
import ToolbarColor from './ToolbarColor'
import InputDropDownButton from './InputDropDownButton'
import ToolbarDropDownButton from './ToolbarDropDownButton'
import ToolbarSlider from './ToolbarSlider'
import ToolbarImage from './ToolbarImage'
import Table from './Table'
import DataBinding from './DataBindingTree'
import RestSettings from './RestSettings'
import SymbolService from 'services/SymbolService'
import Preview from 'page/Preview'
import TableSettings from './TableSettings'
import DropDownTree from './DropDownTree'
import ImageRotate from './ImageRotate'
import ChartAnimationSettings from './ChartAnimationSettings'
import DataBindingButton from './DataBindingButton'
import BoxShadow from './BoxShadow2'
import DomUtil from 'core/DomUtil'
import ScriptEdior from '../dialogs/ScriptEditor.vue'
import NavidationEditor from './NavigationTable'
import IconTable from './IconTable'
import {iconDOM} from 'page/QIconUtil'

export default {
    name: 'DataSection',
    mixins:[_Tooltip, Util, DojoWidget],
    data: function () {
        return {
            mode: "private",
			icons: [],
			previewWidth: 150,
			borderStyles: [
				{ value:"Cell", icon:"TableBorderAll", label : "Full Border"},
				{ value:"HLines", icon:"TableBorderHor", label : "Horizontal Border"},
				{ value:"VLines", icon:"TableBorderVer", label : "Vertical Border"},
				{ value:"None", icon:"TableBorderNone", label : "No Border"},
				{ value:"Out", icon:"TableBorderOuter", label : "Outside Border"}
			]
        }
    },
    components: {},
    methods: {
   		postCreate (){
				this.logger = new Logger("DataSection");
				this.db = new DomBuilder();
			},

		setSectionHeader (header){
			this.header = header;
		},

		setUser (user){
			this.user = user;
		},

		setJwtToken(t) {
			this.jwtToken = t
		},

		setHash(h) {
			this.hash = h
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

		setSVGIcons (svgIcons) {
			this.svgIcons = svgIcons
		},

		setValue (widget, isDataView = false){

			this.isDataView = isDataView
			const type = widget.type;

			if (this.widget && this.widget.id === widget.id){
				this.logger.log(-1, "setValue", "exit because same widget", type);
				if (this["_update"+type]){
					this["_update"+type](widget);
					this.logger.log(0, "setValue", "exit() >> Update ");
					return;
				}
			}
			this.widget = widget;

			this._cleanUpChildWidgets();
			this.cleanUpTempListener();
			this.domUtil.removeAllChildNodes(this.domNode)
			this.cntr = this.db
				.div("MatcToolbarSectionContent")
				.build(this.domNode);

	
			if(this["_show"+type]){
				this.beforeShow()
				this["_show"+type](widget);
			} else {
				const props = SymbolService.getWidgetDataProps(type)
				if (props) {
					this.showWidgetByProps(widget, props)
				} else {
					this.logger.log(-1, "setValue", "No Render method for type " + type);
				}
			}

		},

		beforeShow () {
			// template method for validate
		},

		_setSectionLabel (lbl){
			this.header.firstChild.innerHTML=lbl;
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

		_showVisualPicker(model) {
			this._setSectionLabel("Visual Picker");
			
			this._renderCheck("Checked",model.props.checked, "checked" );
			this._renderInputDropDown("Icon Size", model, [8,12,16,24,32,40, 48, 64, 96, 128], "iconSize", false);

			this._renderButton("Icon", "Settings", "_renderIconDialog");
			this._renderColor('Icon Color','<span class="mdi mdi-check"></span>',model.style.iconColor, "iconColor" ,"onStyleChanged", true);
		
			this._renderButton("Checked Icon", "Settings", (e) => this._renderIconDialog(e, 'popIcon'));
			this._renderColor('Checked Color','<span class="mdi mdi-check"></span>',model.style.popColor, "popColor" ,"onStyleChanged", true);
			this._renderColor('Checked Background','<span class="Color"></span>',model.style.popBackground, "popBackground", "onStyleChanged",true );

			const lbl = model.props.formGroup ? model.props.formGroup + "" : "No Group";
			this._renderButton(lbl, "Settings", "_showFormGroupDialog");
		},

		
		_showIconToggleButton(model) {
			this._setSectionLabel("Icon Toggle Button");
			
			this._renderCheck("Checked",model.props.checked, "checked" );
			this._renderInputDropDown("Icon Size", model, [8,12,16,24,32,40, 48, 64, 96, 128], "iconSize", false);
			this._renderButton("Icon", "Settings", "_renderIconDialog");

			const lbl = model.props.formGroup ? model.props.formGroup + "" : "No Group";
			this._renderButton(lbl, "Settings", "_showFormGroupDialog");
		},

		_showIFrameWidget(model) {
			this._setSectionLabel("IFrame");
			this._renderInput(model.props, "url", "The URL to link", "https://yourlink.com");
			
		},

		_showScreenSegment  (widget) {
			this._setSectionLabel("Screen Section");
			// this._renderCheck("Show Scroll",widget.props.scroll, "scroll" );

			if (widget.props.screenID) {
				const screen = this.model.screens[widget.props.screenID]
				if (screen) {
					const div = this.db.div(" MatcToolbarItem MatcToobarActionCntr MatcToolbarIconButton" ).build(this.cntr);
					div.appendChild(iconDOM("ScreenSegment"))
					this.db.span("MatcToolbarItemLabel",  screen.name).build(div);
					const btn = this.db.span("MatcToobarRemoveBtn ")
						.tooltip("Remove Segment", "vommondToolTipRightBottom")
						.build(div);
					
						btn.appendChild(iconDOM("DeleteX"))

					this.tempOwn(on(btn, touch.press, lang.hitch(this, "onSegmentScreenSelected", '')));

					//this._renderCheck("Snapp on scroll",widget.props.snapp, "snapp" );
		
				}
			} else {
				const add = this.db.div(" MatcPointer  MatcToolbarItem MatcToolbarIconButton").build(this.cntr);
				add.appendChild(iconDOM("Plus"))
				this.db.span("MatcToolbarItemLabel", "Select Segment Screen").build(add);
				this.tempOwn(on(add, touch.press, lang.hitch(this, "_renderSegmentScreen")));
			}


			//this._renderButton(lbl, icon, "_renderSegmentScreen");
		},

		_showRepeater (model){
			this._setSectionLabel("Repeater");

			this._renderLabelDropDown("Normal", model,"layout",[
				{ value: "rows", icon:"Rows", label : "Rows"},
				{ value:"grid", icon:"Grid", label : "Grid"}
			]);

			this._renderCheck("Auto Fill",model.props.auto, "auto" );

			if (model.props.auto === false) {

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

		_showVerticalNavigation() {
			this._setSectionLabel("Vertical Naigation");
			this._renderButton("Values", "DataTable", "_renderTableDialog");
		},

		_showTree (model){
			this._setSectionLabel("Tree");
			this._renderButton("Values", "SettingsTree", "_renderTableDialog");

			//this._renderBoxColor("Hover", model, "hoverBackground", "hoverColor");
			//this._renderBoxColor("Selected", model, "selectedBackground", "selectedColor");

			//this._renderInputDropDown("Indicator Width",model, [0,1,2,3,4,5, 10], "selectedBorderWidth", false);
			//this._renderColor('Indicator Color','<span class="Color"></span>',model.style.selectedBorderColor, "selectedBorderColor", "onStyleChanged",true );

			this._renderLabelDropDown("Icon", model, "icon",[
					{ value:"mdi mdi-chevron-down", icon:"mdi mdi-chevron-down", label : "Chevron"},
					{ value:"mdi mdi-menu-down", icon:"mdi mdi-menu-down", label : "Arrow"},
					{ value:"mdi mdi-menu-down-outline", icon:"mdi mdi-menu-down-outline", label : "Arrow Outline"},
					{ value:"nulll", icon:"mdi mdi-close", label : "No Icon"}
			], true);

			this._renderCheck("Collapsed",model.props.collapsed, "collapsed" );
		},


		_showTimeline (model){
			this._setSectionLabel("Timeline");

			this._renderButton("Options", "SettingsList", "_renderOptionDialog");

			let style = model.style

			this._renderDropDownTree("Line", "mdi mdi-cursor-text", [
				{
					label: "Background",
					type: "color",
					value: style.lineBackground,
					key:'lineBackground',
					icon: 'Color',
					isStyle: true
				},
				{
					label: "Width",
					type: "int",
					value: style.lineWidth,
					key:'lineWidth',
					icon: 'mdi mdi-pound',
					options: [1, 2, 5, 8, 16, 24, 32, 40, 48, 60],
					isStyle: true
				}
			])

			this._renderDropDownTree("Circles", "mdi mdi-checkbox-blank-circle-outline", [
				{
					label: "Background",
					type: "color",
					value: style.cicleBackground,
					key:'cicleBackground',
					icon: 'Color',
					isStyle: true
				},
				{
					label: "Border Color",
					type: "color",
					value: style.cicleBorderColor,
					key:'cicleBorderColor',
					icon: 'mdi mdi-border-color',
					isStyle: true
				},
				{
					label: "Border Width",
					type: "int",
					value: style.circleBorderWidth,
					key:'circleBorderWidth',
					icon: 'mdi mdi-pound',
					options: [1, 2, 3, 4, 5, 8, 10, 20],
					isStyle: true
				},
				{
					label: "Size",
					type: "int",
					value: style.circleSize,
					key:'circleSize',
					icon: 'mdi mdi-arrow-all',
					options: [5, 8, 16, 24, 32, 40, 48, 60],
					isStyle: true
				},
				{
					label: "Spacing",
					type: "int",
					value: style.elementSpacing,
					key:'elementSpacing',
					icon: 'mdi mdi-arrow-collapse-up',
					options: [-1, 8, 16, 24, 32, 40, 48, 60],
					isStyle: true
				}
			])

			this._renderDropDownTree("Active Circles", "mdi mdi-checkbox-blank-circle", [
				{
					label: "Background",
					type: "color",
					value: style.cicleActiveBackground,
					key:'cicleActiveBackground',
					icon: 'Color',
					isStyle: true
				},
				{
					label: "Border Color",
					type: "color",
					value: style.cicleActiveBorderColor,
					key:'cicleActiveBorderColor',
					icon: 'mdi mdi-border-color',
					isStyle: true
				},
					{
					label: "Text Color",
					type: "color",
					value: style.cicleActiveTextColor,
					key:'cicleActiveTextColor',
					icon: 'mdi mdi-format-text',
					isStyle: true
				}
			])

		},

		_showIconButton(model) {
			this._setSectionLabel("Icon Button");
			this._renderButton("Icon", "Settings", "_renderIconDialog");
			this._renderInputDropDown("Space",model, [4, 8, 12, 16, 24, 320], "iconMargin", false);
			this._renderColor('Color','<span class="Color"></span>',model.style.iconColor, "iconColor", "onStyleChanged", true );
		},

		_showCheckBoxGroup (model){
			this._setSectionLabel("CheckBox Group");

			this._renderButton("Options", "SettingsList", "_renderOptionDialog");
			
			this._renderRandom(model)
			this._renderColor('Hook Color','<span class="mdi mdi-check"></span>',model.style.colorButton, "colorButton" ,"onStyleChanged", true);
			if (!model.has?.backgroundColor) {
				this._renderColor('Background','<span class="Color"></span>',model.style.background, "background", "onStyleChanged",true );
			}
			this._renderInputDropDown("Height",model, [8, 12, 16, 24, 32, 40, 64, 80, 120], "boxHeight", false);

		},

		_showProgressBar (model) {
			this._setSectionLabel("Progress Bar");

			this._renderColor('Foreground','<span class="Color"></span>',model.style.foreground, "foreground" ,"onStyleChanged", true);
			this._renderColor('Background','<span class="Color"></span>',model.style.background, "background", "onStyleChanged",true );
			this._renderInputDropDown("Progress", model, [10,20,30,40,50,60, 70, 80, 90, 100], "value", true);
		},

		_showProgessSegments (model) {
			this._setSectionLabel("Progress Steps");

			this._renderInputDropDown("Border Width",model, [0, 1, 2, 3, 4, 8], "borderTopWidth", false);
			this._renderColor('Border','<span class="Color"></span>',model.style.borderTopColor, "borderTopColor" ,"onStyleChanged", true);
			this._renderColor('Active Background','<span class="Color"></span>',model.style.activeBackground, "activeBackground", "onStyleChanged",true );
			
			this._renderSubSection()
			this._renderColor('Background','<span class="Color"></span>',model.style.background, "background", "onStyleChanged",true );
			this._renderColor('Active Border','<span class="Color"></span>',model.style.activeBorderColor, "activeBorderColor" ,"onStyleChanged", true);

			this._renderSubSection()
			this._renderInputDropDown("Progress", model, [0, 1, 2, 3, 4, 5], "value", true);
			this._renderInputDropDown("# Elements", model, [1, 2, 3, 4, 5, 10], "max", true);
			this._renderInputDropDown("Gap", model, [4, 8, 16, 32], "gap", true);
		},

		_showImagePaging (model) {
			this._setSectionLabel("Paging");

			this._renderInputDropDown("Border Width",model, [0, 1, 2, 3, 4, 8], "borderTopWidth", false);
			this._renderColor('Border','<span class="Color"></span>',model.style.borderTopColor, "borderTopColor" ,"onStyleChanged", true);
			this._renderColor('Active Border','<span class="Color"></span>',model.style.activeBorderColor, "activeBorderColor" ,"onStyleChanged", true);
			
			this._renderSubSection()					
			this._renderColor('Background','<span class="Color"></span>',model.style.background, "background", "onStyleChanged",true );
			this._renderColor('Active Background','<span class="Color"></span>',model.style.activeBackground, "activeBackground", "onStyleChanged",true );

			this._renderSubSection()		
			this._renderInputDropDown("Selected", model, [1, 2, 3, 4, 5], "value", true);
			this._renderInputDropDown("# Elements", model, [1, 2, 3, 4, 5, 10], "max", true)
		},

		_showRadioTable(model) {
			this._setSectionLabel("Radio Table");
			this._renderButton("Values", "DataTable", "_renderTableDialog");
			this._renderRandom(model)
			this._renderInputDropDown("Label Width",model, [64, 96, 128, 196, 256], "labelWidth", false);
			this._renderInputDropDown("Radio Size",model, [8, 12, 16, 24, 32, 40], "radioSize", false);	
			this._renderColor('Checked Button','<span class="MatcIconCircle"></span>',model.style.colorButton, "colorButton" );		
		},

		_showRadioGroup (model){
			this._setSectionLabel("Radio Group");

			this._renderButton("Options", "SettingsList", "_renderOptionDialog");			
			this._renderRandom(model)
			this._renderColor('Checked Button','<span class="MatcIconCircle"></span>',model.style.colorButton, "colorButton" );		
			if (!model.has?.backgroundColor) {
				this._renderColor('Background','<span class="Color"></span>',model.style.background, "background", "onStyleChanged",true );
			}
			this._renderInputDropDown("Height",model, [8, 12, 16, 24, 32, 40], "boxHeight", false);
		},

		_showSortableList(model){
			this._setSectionLabel("Preference List");

			this._renderButton("Options", "SettingsList", "_renderNonSelectableOptionDialog");
			
			this._renderRandom(model)
			this._renderColor('Arrow Color','<span class="Color"></span>',model.style.arrowColor, "arrowColor", "onStyleChanged",true );
			this._renderColor('Arrow Color Hover','<span class="Color"></span>',model.style.arrowColorHover, "arrowColorHover", "onStyleChanged",true );
			this._renderColor('Arrow Color Disabled','<span class="Color"></span>',model.style.arrowColorPassive, "arrowColorPassive", "onStyleChanged",true );
		
			this._renderInputDropDown("Button Size",model, [8, 12, 16, 24, 32, 40], "buttonSize", false);	
			this._renderInputDropDown("Button Gap",model, [4, 8, 12, 16, 24, 32], "buttonGap", false);
		},

		_showRest (model){
			this._setSectionLabel("Rest");
			this._renderButton("Configuration", "Settings", "_renderRestDialog");

			this._renderLabelDropDown("Icon", model, "trigger",[
				{ value:null, icon:"EventClick", label : "Click Trigger"},
				{ value:"load", icon:"EventLoaded", label : "Loaded Trigger"},
				{ value:"repeat", icon:"EventTimer", label : "Repeat Trigger"}
			]);

			if (model?.props?.trigger === 'repeat') {
				this._renderInputDropDown("Seconds",model, [1, 2, 3, 4, 5, 10, 64, 80, 120], "delay", true);
			}

		},

		_showScript (model){
			this._setSectionLabel("Script");
			this._renderButton("Edit Script", "mdi mdi-code-tags", "_renderScriptDialog");


			this._renderLabelDropDown("Icon", model, "trigger",[
				{ value:null, icon:"EventClick", label : "Click Trigger"},
				{ value:"databinding", icon:"EventData", label : "Data Trigger"},
				{ value:"load", icon:"EventLoaded", label : "Loaded Trigger"},
				{ value:"repeat", icon:"EventTimer", label : "Repeat Trigger"}
			]);

			if (model?.props?.trigger === 'repeat') {
				this._renderInputDropDown("Seconds",model, [1, 2, 3, 4, 5, 10, 64, 80, 120], "delay", true);
			}

		},

		_showLogicOr (model){
			this._setSectionLabel("Logic");
			this._renderCheck("A / B Test",model.props.isRandom, "isRandom" );
		},

		_showBarChart (model){
			this._setSectionLabel("Chart");

			this._renderButton("Values", "DataTable", "_renderTableDialog");

			if (model?.props?.isLine) {
				this._renderInputDropDown("Width",model, [0, 1, 2, 3, 4, 5, 8, 16, 24, 32], "lineWidth", false);
			}

			if (model.props.data && model.props.data[0]){
				const row = model.props.data[0];
				for(let i = 0; i < row.length; i++){
				
				
					if (model.has.fill) {

						const key = "background" + i;
						this._renderColor('' + this.getNiceNumber(i+1) + " Fill-Color",'<span class="Color"></span>',model.style[key], key, "onStyleChanged" , true, true);
				

						const key2 = "color" + i;
						this._renderColor('' + this.getNiceNumber(i+1) + " Line-Color",'<span class="Color"></span>',model.style[key2], key2, "onStyleChanged" , true, true);
				
					} else {
						const key = "background" + i;
						this._renderColor('' + this.getNiceNumber(i+1) + " Color",'<span class="Color"></span>',model.style[key], key, "onStyleChanged" , true, true);
					}
				}
			}


			this._renderChartAnimation(model)
		},

		getNiceNumber(n) {
			if (n === 1) {
				return '1st'
			}
			if (n === 1) {
				return '2nd'
			}
			if (n === 3) {
				return '3rd'
			}
			return n + 'th'
		},

		_showStackedRingChart(model) {
			this._setSectionLabel("Chart");

			this._renderButton("Values", "DataTable", "_renderTableDialog");
			this._renderInputDropDown("Width",model, [0, 1, 2, 3, 4, 5, 8, 16, 24, 32], "lineWidth", false);

			if (model.props.data && model.props.data[0]){
				const row = model.props.data[0];
				for(let i = 0; i < row.length; i++){
					const key = "background" + i;
					this._renderColor('' + this.getNiceNumber(i+1) + " Color",'<span class="Color"></span>',model.style[key], key, "onStyleChanged" , true, true);
				}
			}
			this._renderChartAnimation(model)
		},


		_showRingChart (model){
			this._setSectionLabel("Chart");

			this._renderInputDropDown("Value",model, [0,10,20,30,40,50,60,70,80,90, 100], "value", true);
			this._renderInputDropDown("Width",model, [0, 4, 8, 12, 16, 24, 32, 40, 64], "lineWidth", false);
			this._renderColor('Background','<span class="Color"></span>',model.style.background, "background", "onStyleChanged" , true, true);
			this._renderColor("Foreground",'<span class="Color"></span>',model.style.color, "color", "onStyleChanged" , true, true);

			this._renderChartAnimation(model)
		},

		_renderChartAnimation() {
			this._renderButton("Animation", "Animation", "_renderChartAnimationDialog");		
		},


		_showPieChart (model){
			this._setSectionLabel("Chart");
			this._renderButton("Values", "DataTable", "_renderTableDialog");

			if(model.props.data && model.props.data[0]){
				const row = model.props.data[0];
				for(let i =0; i< row.length; i++){
					const key = "background" + i;
					this._renderColor('' + this.getNiceNumber(i+1) + " Color",'<span class="Color"></span>',model.style[key], key, "onStyleChanged" , true, true);
				}
			}
			this._renderChartAnimation(model)
		},


		_showMultiRingChart (model){
			this._setSectionLabel("Chart");
			this._renderButton("Values", "DataTable", "_renderTableDialog");
			this._renderInputDropDown("Width",model, [0, 4, 8, 12, 16, 24, 32, 40, 64], "lineWidth", false);

			if(model.props.data && model.props.data[0]){
				const row = model.props.data[0];
				for(let i =0; i< row.length; i++){
					const key = "background" + i;
					this._renderColor('' + this.getNiceNumber(i+1) + " Color",'<span class="Color"></span>',model.style[key], key, "onStyleChanged" , true, true);
				}
			}
			this._renderChartAnimation(model)
		},


		_showLabel (model){
			if (!model?.props?.animated) {
				this._setSectionLabel("Label");
			}
		},

		_showToggleButton (model) {
			this._setSectionLabel("Toggle Button");
			this._renderCheck("Active",model.props.active, "active" );
		},

		_showTextBox (model){
			this._setSectionLabel("TextBox");
			this._renderCheck("Text is placeholder",model.props.placeholder, "placeholder" );
			//this._renderCheck("Animate placeholder",model.props.animate, "animate" );
			this._renderCheck("Focus on load",model.props.focus, "focus" );
			this._renderLabelDropDown("Normal", model,"stringCase",[
				{ value: null, icon:"LetterNormal", label : "Normal"},
				{ value:"UpperCase", icon:"LetterUpper", label : "Upper Case"},
				{ value: "LowerCase", icon:"LetterLower", label : "Lower Case"}
			]);
		},

		_showLabeledTextBox(model) {
			this._setSectionLabel("Labeled Text Box");
			this._renderCheck("Focus on load",model.props.focus, "focus" );
			this._renderColor('Label Color','<span class="mdi mdi-border-color"></span>',model.style.labelColor, "labelColor" ,"onStyleChanged", true);
			this._renderInputDropDown("Label Size",model, [
				{value: -1, label: 'Auto'},
				{value: 8, label: '8'},
				{value: 12, label: '12'},
				{value: 16, label: '16'},
				{value: 18, label: '18'},
				{value: 20, label: '20'},
				{value: 24, label: '24'},
				{value: 32, label: '32'},
			], "labelFontSize", false);
			this._renderInputDropDown("Input Size",model, [
				{value: -1, label: 'Auto'},
				{value: 16, label: '16'},
				{value: 18, label: '18'},
				{value: 20, label: '20'},
				{value: 24, label: '24'},
				{value: 32, label: '32'},
				{value: 40, label: '40'},
				{value: 56, label: '56'},
				{value: 64, label: '64'},
			], "inputHeight", false);
			this._renderInputDropDown("Horizontal Offset",model, [0,4, 8, 12, 16, 20], "labelOffset", false);
			this._renderInput(model.props, "placeholderLabel", "", 'Placeholder');
		},


		_showLabeledTextArea(model) {
			this._setSectionLabel("Labeled Text Area");
			this._renderCheck("Focus on load",model.props.focus, "focus" );
			this._renderColor('Label Color','<span class="mdi mdi-border-color"></span>',model.style.labelColor, "labelColor" ,"onStyleChanged", true);
			this._renderInputDropDown("Label Size",model, [
				{value: -1, label: 'Auto'},
				{value: 8, label: '8'},
				{value: 12, label: '12'},
				{value: 16, label: '16'},
				{value: 18, label: '18'},
				{value: 20, label: '20'},
				{value: 24, label: '24'},
				{value: 32, label: '32'},
			], "labelFontSize", false);
			this._renderInputDropDown("Input Size",model, [
				{value: -1, label: 'Auto'},
				{value: 48, label: '48'},
				{value: 64, label: '64'},
				{value: 96, label: '96'},
				{value: 128, label: '128'},
				{value: 256, label: '256'},
				{value: 512, label: '512'}
			], "inputHeight", false);
			this._renderInputDropDown("Horizontal Offset",model, [0,4, 8, 12, 16, 20], "labelOffset", false);
			this._renderInput(model.props, "placeholderLabel", "", 'Placeholder');
		},


		_showTypeAheadTextBox (model){
			this._setSectionLabel("ComboBox");
			this._renderCheck("Text is placeholder",model.props.placeholder, "placeholder" );
			this._renderButton("Options", "SettingsList", "_renderOptionDialog");
			this._renderBoxColor("Selection", model, "selectedOptionBackground", "selectedOptionColor");

			this._renderBoxColor("Popup", model, "popupBackground", "popupColor");
			this._renderBoxColor("Selection", model, "selectedOptionBackground", "selectedOptionColor");
			this._renderColor('Popup Border','<span class="mdi mdi-border-color"></span>',model.style.popupBorderColor, "popupBorderColor" ,"onStyleChanged", true);
			this._renderCheck("Merge borders",model.props.hideUpperBorder, "hideUpperBorder" );
			this._renderShadowPicker("Popup",model, "popupShadow");
		},

		_showRating (model){
			this._setSectionLabel("Rating");
			this._renderColor('Color','<span class="mdi mdi-star"></span>',model.style.color, "color", "onStyleChanged" , true);
			this._renderDropDown(model,"selected",[
				{ value:0, label : "0 Star"},
				{ value:1, label : "1 Star"},
				{ value:2, label : "2 Stars"},
				{ value:3, label : "3 Stars"},
				{ value:4, label : "4 Stars"},
				{ value:5, label : "5 Stars"}
			]);
		},

		_showImageCarousel (model){
			this._setSectionLabel("Image Carousel");

			this._renderImagesDropDown(model,"images");
			this._renderDropDown(model,"vertical",[
						{ value:false, icon:"ScrollHorizontal", label : "Horizontal Scrolling"},
						{ value:true, icon:"ScrollVertical", label : "Vertical Scrolling"}
				]);
			this._renderReferenceButton(model,"backButton", "No Back Button", "Reference", "ReferenceNone");
			this._renderReferenceButton(model,"nextButton", "No Next Button", "Reference", "ReferenceNone");

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
				this._renderInput(model.props, "cleartextHideLabel", "The label to hide the characters", 'e.g. Hide');
				this._renderInput(model.props, "cleartextShowLabel", "The label to show the characters", 'e.g. Show');
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
			this._renderButton("Options", "SettingsList", "_renderOptionDialog");

			this._renderBoxColor("Popup", model, "popupBackground", "popupColor");
			this._renderBoxColor("Selection", model, "selectedOptionBackground", "selectedOptionColor");

		
			this._renderColor('Popup Border','<span class="mdi mdi-border-color"></span>',model.style.popupBorderColor, "popupBorderColor" ,"onStyleChanged", true);
			this._renderCheck("Merge borders",model.props.hideUpperBorder, "hideUpperBorder" );
		
			this._renderLabelDropDown("Popup Position", model,"popupPosition",[
					{ value:"MatcWidgetTypeDropDownPopUber", icon:"mdi mdi-arrow-up-bold-circle", label : "Popup Over"},
					{ value:null, icon:"mdi mdi-arrow-down-bold-circle", label : "Popup Under"},
			]);
			this._renderShadowPicker("Popup",model, "popupShadow");

		},

		_showHoverDropDown (model){
			this._setSectionLabel("Hover DropDown");
			this._renderButton("Options", "SettingsList", "_renderOptionDialog");
			this._renderBoxColor("Popup", model, "popupBackground", "popupColor");
			this._renderBoxColor("Selection", model, "selectedOptionBackground", "selectedOptionColor");
			this._renderCheck("Merge borders",model.props.hideUpperBorder, "hideUpperBorder" );
		
			this._renderLabelDropDown("Popup Position", model,"popupPosition",[
				{ value:"MatcWidgetTypeDropDownPopUber", icon:"mdi mdi-arrow-up-bold-circle", label : "Popup Over"},
				{ value:null, icon:"mdi mdi-arrow-down-bold-circle", label : "Popup Under"},
			]);
			this._renderColor('Popup Border','<span class="mdi mdi-border-color"></span>',model.style.popupBorderColor, "popupBorderColor" ,"onStyleChanged", true);
			this._renderShadowPicker("Popup",model, "popupShadow");

		},

		_showMobileDropDown (model){
			this._setSectionLabel("Modal Select");
			this._renderButton("Options", "SettingsList", "_renderOptionDialog");
			this._renderColor('Popup Text','<span class="mdi mdi-format-text"></span>',model.style.popupColor, "popupColor", "onStyleChanged" , true);
			this._renderColor('Popup Background','<span class="Color"></span>',model.style.popupBackground, "popupBackground" ,"onStyleChanged", true);
			this._renderColor('Popup Border','<span class="mdi mdi-border-color"></span>',model.style.popupBorderColor, "popupBorderColor" ,"onStyleChanged", true);
		},

		_showSegmentButton (model){
			this._setSectionLabel("Segment Button");
			this._renderButton("Options", "SettingsList", "_renderOptionDialog");
			this._renderCheck("Multi Selection", model.props.multi, "multi" );
		},

		_showSegmentPicker (model){
			this._setSectionLabel("Segment Picker");
			this._renderButton("Options", "SettingsList", "_renderOptionDialog");
			this._renderColor('Select Text','<span class="mdi mdi-format-text"></span>',model.style.selectedColor, "selectedColor" ,"onStyleChanged", true);
			this._renderColor('Select Background','<span class="Color"></span>',model.style.selectedBackground, "selectedBackground" ,"onStyleChanged", true);
		},

		_showLockSlider (model){
			this._setSectionLabel("Lock Slider");
			this._renderButton("Icon", "Settings", "_renderIconDialog");
			this._renderColor('Icon Color','<span class="Color"></span>',model.style.iconColor, "iconColor" ,"onStyleChanged", true);
			this._renderColor('Handle Color','<span class="Color"></span>',model.style.handleColor, "handleColor" ,"onStyleChanged", true);
			this._renderColor('Foreground','<span class="Color"></span>',model.style.foregroundColor, "foregroundColor" ,"onStyleChanged", true);
		},


		_showPaging (model){
			this._setSectionLabel("Paging");
			this._renderInputDropDown("Max",model, [1,5,15,20], "max", true);
			this._renderInputDropDown("Value",model, [1,2,3,4,5,10,15,20], "selected", true);
			this._renderInputDropDown("Visible Elements",model, [0,1,2,3,4,5,10,15,20], "maxVisisble", true);

			this._renderLabelDropDown("Popup Position", model,"justifyContent",[
				{ value:"left", icon:"mdi  mdi-arrow-collapse-left", label : "Left"},
				{ value:"right", icon:"mdi  mdi-arrow-collapse-right", label : "Right"},
				{ value:"center", icon:"mdi mdi-arrow-split-vertical", label : "Center"},
				{ value: null, icon:"mdi mdi-arrow-expand-horizontal", label : "Full Width"},
			]);
		},

		_showHSlider (model){
			this._setSectionLabel("Slider");

			this._renderInputDropDown("Value",model, [10,20,30,40,50,60,70,80,90,100], "value", true);
			this._renderInputDropDown("Min",model, [0,1,5,10,20,50,100, 200], "min", true);
			this._renderInputDropDown("Max",model, [0,1,5,10,20,50,100, 200], "max", true);
		
			this._renderSubSection()
			this._renderColor('Handle Color','<span class="Color"></span>',model.style.handleColor, "handleColor" ,"onStyleChanged", true);
			this._renderColor('Foreground Color','<span class="Color"></span>',model.style.barColor, "barColor" ,"onStyleChanged", true);

		
			this._renderInputDropDown("Handle Width",model, [4, 8, 12, 16, 24, 32, 40, 64, 80, 120], "handleWidth");
			this._renderInputDropDown("Handle Radius",model, [4, 8, 12, 16, 24, 32, 40, 64, 80, 120], "handleRadius");
			this._renderShadowPicker("Handle",model, "handleShadow");

			//this._renderReferenceButton(model,"valueLabel", "No Label", "mdi mdi-label");
		},


		_showStepper (model){
			this._setSectionLabel("Stepper");
			this._renderInputDropDown("Start Value",model, [0,1,5,10,20,30,40,50,100], "value", true);
			var refs = this.getRef(model, "valueLabel");
			if(refs && refs.length > 0){
				this._renderReferenceButton(model,"valueLabel", "No Label", "Reference");
			}
		},

		_showCountingStepper (model){
			this._setSectionLabel("Counting Stepper");
			this._renderInputDropDown("Start Value",model, [0,1,5,10,20,30,40,50,100], "value", true);

			this._renderColor('Button Color','<span class="mdi mdi-format-text"></span>',model.style.colorButton, "colorButton" ,"onStyleChanged", true);
			this._renderColor('Button Background','<span class="Color"></span>',model.style.backgroundButton, "backgroundButton", "onStyleChanged",true );

		},

		_showSpinner (model){
			this._setSectionLabel("Spinner");
			this._renderButton("Options", "SettingsList", "_renderOptionDialog");
			this._renderColor('Border','<span class="mdi mdi-border-color"></span>',model.style.borderBoxColor, "borderBoxColor", "onStyleChanged", true );

		},

		_showDateDropDown (model){

			if(model.props.range){
				this._setSectionLabel("Date Range Picker");
			} else {
				this._setSectionLabel("Date Picker");
			}

			// const options = [
			// 	{
			// 		label: "Header Background",
			// 		type: "color",
			// 		value: style.headerBackground,
			// 		key:'headerBackground',
			// 		icon: 'Color',
			// 		isStyle: true
			// 	},
			// 	{
			// 		label: "Header Color",
			// 		type: "color",
			// 		value: style.headerColor,
			// 		key:'headerColor',
			// 		icon: 'mdi mdi-pound',
			// 		isStyle: true
			// 	},

			// 	{
			// 		label: "Table Background",
			// 		type: "color",
			// 		value: style.tableHeaderBackground,
			// 		key:'tableHeaderBackground',
			// 		icon: 'Color',
			// 		isStyle: true
			// 	},
			// 	{
			// 		label: "Table Color",
			// 		type: "color",
			// 		value: style.tableHeaderColor,
			// 		key:'tableHeaderColor',
			// 		icon: 'mdi mdi-pound',
			// 		isStyle: true
			// 	},

				
			// 	{
			// 		label: "Popup Border",
			// 		type: "color",
			// 		value: style.popupBorderColor,
			// 		key:'popupBorderColor',
			// 		icon: 'mdi mdi-pound',
			// 		isStyle: true
			// 	}
			// ]


			// if(model.props.range){
			// 	//this._renderBoxColor("Range", model, "selectedInRangeBackground", "selectedInRangeColor");
			// 	options.push({
			// 		label: "Range Background",
			// 		type: "color",
			// 		value: style.selectedInRangeBackground,
			// 		key:'selectedInRangeBackground',
			// 		icon: 'mdi mdi-pound',
			// 		isStyle: true
			// 	})
			// 	options.push({
			// 		label: "Range Color",
			// 		type: "color",
			// 		value: style.selectedInRangeColor,
			// 		key:'selectedInRangeColor',
			// 		icon: 'mdi mdi-pound',
			// 		isStyle: true
			// 	})
			// }

			// this._renderDropDownTree("Colors", "Color", options)
	

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

		_showDragNDropTarget (model){
			this._setSectionLabel("Drop Target");
			this._renderLabelDropDown("Normal", model,"layout",[
				{ value: null, icon:"NoGrid", label : "No snapping"},
				{ value: "rows", icon:"Rows", label : "Snapp Rows"},
				{ value: "columns", icon: 'Columns', label: "Snapp Columns"},
				{ value: "grid", icon:"Grid", label : "Snapp Grid"}
			]);

			if (model.props.layout === 'rows' || model.props.layout === 'grid' || model.props.layout === 'columns') {
				this._renderInputDropDown("Gap", model, [4, 8, 16, 32], "gap", false);
			}

			//this._renderCheck("Vertical Move",model.props.dndY, "dndY" );
			//this._renderCheck("Horizontal Move",model.props.dndX, "dndX" );
		},


		_showCheckBox (model){
			this._setSectionLabel("CheckBox");
			this._renderCheck("Checked",model.props.checked, "checked" );
			this._renderColor('Hook Color','<span class="mdi mdi-check"></span>',model.style.colorButton, "colorButton" ,"onStyleChanged", true);
			this._renderColor('Background','<span class="Color"></span>',model.style.background, "background", "onStyleChanged",true );
		},

		_showLabeledCheckBox (model){
			this._setSectionLabel("CheckBox");
			this._renderCheck("Checked",model.props.checked, "checked" );
			this._renderColor('Hook Color','<span class="mdi mdi-check"></span>',model.style.colorButton, "colorButton" ,"onStyleChanged", true);
			this._renderColor('Background','<span class="Color"></span>',model.style.background, "background", "onStyleChanged",true );
			this._renderInputDropDown("Gap", model, [4, 8, 16, 32], "gap", true);
		},


		_showRadioBox (model){
			this._setSectionLabel("RadioBox");
			this._renderCheck("Checked",model.props.checked, "checked" );
			this._renderColor('Checked Button','<span class="MatcIconCircle"></span>',model.style.colorButton, "colorButton" );
			this._renderColor('Background','<span class="Color"></span>',model.style.background, "background", "onStyleChanged",true );

		},

		_showLabeledRadioBox (model){
			this._setSectionLabel("RadioBox");
			this._renderCheck("Checked",model.props.checked, "checked" );
			this._renderColor('Hook Color','<span class="mdi mdi-check"></span>',model.style.colorButton, "colorButton" ,"onStyleChanged", true);
			this._renderColor('Background','<span class="Color"></span>',model.style.background, "background", "onStyleChanged",true );
			this._renderInputDropDown("Gap", model, [4, 8, 16, 32], "gap", true);

			const lbl=  model.props.formGroup ? model.props.formGroup + "" : "No Group";
			this._renderButton(lbl, "Settings", "_showFormGroupDialog");
		},

		_showRadioBox2 (model){
			this._setSectionLabel("RadioBox");
			this._renderCheck("Checked",model.props.checked, "checked" );
			this._renderColor('Checked Button','<span class="MatcIconCircle"></span>',model.style.colorButton, "colorButton" );
			this._renderColor('Background','<span class="Color"></span>',model.style.background, "background", "onStyleChanged",true );

			const lbl=  model.props.formGroup ? model.props.formGroup + "" : "No Group";
			this._renderButton(lbl, "Settings", "_showFormGroupDialog");
		},

		_showIcon (model){
			this._setSectionLabel("Icon");
			this._renderButton("Icon", "Settings", "_renderIconDialog");

			const row = this.db.div("MatcToobarRow").build(this.cntr);
			const rotate = this.$new(ImageRotate)
			rotate.placeAt(row)
			this.tempOwn(on(rotate, "change", lang.hitch(this, 'onStyleChanged', 'backgroundImageRotation')));
			this.tempOwn(on(rotate, "changing", lang.hitch(this, "onTempStyleChanged", 'backgroundImageRotation')));
			rotate.setValue(model.style.backgroundImageRotation)
			this._addChildWidget(rotate);
		},

		_showSVGIcon(model) {
			this._setSectionLabel("Icon");
			this._renderButton("Icon", "Settings", e => this._renderSVGIconDialog(e, model));

			this._renderInputDropDown("Stroke Width", model, [0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4, 8], "strokeWidth", false);



			const row = this.db.div("MatcToobarRow").build(this.cntr);
			const rotate = this.$new(ImageRotate)
			rotate.placeAt(row)
			this.tempOwn(on(rotate, "change", lang.hitch(this, 'onStyleChanged', 'backgroundImageRotation')));
			this.tempOwn(on(rotate, "changing", lang.hitch(this, "onTempStyleChanged", 'backgroundImageRotation')));
			rotate.setValue(model.style.backgroundImageRotation)
			this._addChildWidget(rotate);
		},

		_showCamera (model){
			this._setSectionLabel("Camera");
			this._renderButton("Icon", "Settings", "_renderIconDialog");
			this._renderColor('Color','<span class="Color"></span>',model.style.color, "color", "onStyleChanged", true );
		},


		_showSwitch (model){
			this._setSectionLabel("Switch");
			this._renderCheck("Active",model.props.checked, "checked" );
			this._renderColor('Button Background','<span class="MatcIconCircle"></span>',model.style.colorButton, "colorButton" );
			this._renderColor('Active Background','<span class="Color"></span>',model.style.background, "background", "onStyleChanged",true );
			this._renderColor('Passive Background','<span class="Color"></span>',model.style.colorForeGround, "colorForeGround", "onStyleChanged",true );
		},


		_showTable (model){
			this._setSectionLabel("Table");

			this._renderButton("Settings", "TableData", "_renderTableSettings");


			let style = model.style
			let props = model.props

			this._renderDropDownTree("Odd Rows", "Color", [
				{
					label: "Background",
					type: "color",
					value: style.background,
					key:'background',
					icon: 'Color',
					isStyle: true
				},
				{
					label: "Color",
					type: "color",
					value: style.color,
					key:'color',
					icon: 'mdi mdi-format-text',
					isStyle: true
				}
			])

			this._renderDropDownTree("Even Rows", "Color", [
				{
					label: "Background",
					type: "color",
					value: style.evenRowBackground,
					key:'evenRowBackground',
					icon: 'Color',
					isStyle: true
				},
				{
					label: "Color",
					type: "color",
					value: style.evenRowColor,
					key:'evenRowColor',
					icon: 'mdi mdi-format-text',
					isStyle: true
				}
			])

			this._renderDropDownTree("Hover", "Color", [	
				{
					label: "Background",
					type: "color",
					value: style.hoverBackground,
					key:'hoverBackground',
					icon: 'Color',
					isStyle: true
				},
				{
					label: "Color",
					type: "color",
					value: style.hoverColor,
					key:'hoverColor',
					icon: 'mdi mdi-format-text',
					isStyle: true
				}
			])

			this._renderDropDownTree("Header", "TableHeader", [
				{
					label: "Sticky",
					type: "check",
					key:"headerSticky",
					value: style.headerSticky === true,
					valueTrue: true,
					valueFalse: false,
					isStyle: true
				},
				{
					label: "Background",
					type: "color",
					value: style.headerBackground,
					key:'headerBackground',
					icon: 'Color',
					isStyle: true
				},
				{
					label: "Color",
					type: "color",
					value: style.headerColor,
					key:'headerColor',
					icon: 'mdi mdi-format-text',
					isStyle: true
				},
				{
					label: "Bold",
					type: "check",
					key:"headerFontWeight",
					value: style.headerFontWeight === 700,
					valueTrue: 700,
					valueFalse: 400,
					isStyle: true
				},
				{
					label: "Italic",
					type: "check",
					key:"headerFontStyle",
					value: style.headerFontStyle === 'italic',
					valueTrue: 'italic',
					valueFalse: 'normal',
					isStyle: true
				},
				{
					label: "Underline",
					type: "check",
					key:"headerTextDecoration",
					value: style.headerTextDecoration === 'underline',
					valueTrue: 'underline',
					valueFalse: 'none',
					isStyle: true
				},
				{
					label: "Bottom Border Width",
					type: "int",
					value: style.headerBottomBorderWidth,
					key:'headerBottomBorderWidth',
					icon: 'mdi mdi-pound',
					options: [0, 1, 2, 3, 4, 5, 8, 10, 20],
					isStyle: true
				},
			])

			let selectedBorderStyle = this.borderStyles.find(s => s.value === props.borderStyle)
			let borderStyleIcon = selectedBorderStyle ? selectedBorderStyle.icon : 'mdi mdi-border-color'
			this._renderDropDownTree("Border", borderStyleIcon, [
				{
					label: "Border Style",
					type: "list",
					value: props.borderStyle,
					key:'borderStyle',
					icon: 'TableBorderAll',
					options: this.borderStyles,
					isStyle: false
				},
				{
					label: "Border Color",
					type: "color",
					value: style.borderBottomColor,
					key:'borderBottomColor',
					icon: 'mdi mdi-border-color',
					isStyle: true
				},
				{
					label: "Border Width",
					type: "int",
					value: style.borderBottomWidth,
					key:'borderBottomWidth',
					icon: 'mdi mdi-pound',
					options: [1, 2, 3, 4, 5, 8, 10, 20],
					isStyle: true
				},
			])

			this._renderDropDownTree("Selectable", "CheckBoxOn", [
				{
					label: "Show Checkbox",
					type: "check",
					value: style.checkBox,
					key:'checkBox',
					icon: '',
					valueTrue: true,
					valueFalse: false,
					isStyle: true
				},
				{
					label: "Hook Color",
					type: "color",
					value: style.checkBoxHookColor,
					key:'checkBoxHookColor',
					icon: 'mdi mdi-check',
					isStyle: true
				},
				{
					label: "Background",
					type: "color",
					value: style.checkBoxBackground,
					key:'checkBoxBackground',
					icon: 'Color',
					isStyle: true
				},
				{
					label: "Size",
					type: "int",
					value: style.checkBoxSize,
					key:'checkBoxSize',
					icon: 'mdi mdi-swap-vertical',
					options: [style.fontSize, 10, 12, 16, 20, 24, 32],
					isStyle: true
				},
				{
					label: "Border Color",
					type: "color",
					value: style.checkBoxBorderColor,
					key:'checkBoxBorderColor',
					icon: 'mdi mdi-border-color',
					isStyle: true
				},
				{
					label: "Border Radius",
					type: "int",
					value: style.checkBoxBorderRadius,
					key:'checkBoxBorderRadius',
					icon: 'mdi mdi-vector-radius',
					options: [1, 2, 3, 4, 5, 8, 10, 20, 30, 50],
					isStyle: true
				},
				{
					label: "Border Width",
					type: "int",
					value: style.checkBoxBorderWidth,
					key:'checkBoxBorderWidth',
					icon: 'mdi mdi-pound',
					options: [1, 2, 3, 4, 5, 8, 10, 20, 30, 50],
					isStyle: true
				}
			])

			//this._renderButton("Columns & Actions", "Settings", "_renderTableSettings");
		},


		_renderIgnoreState (widget){
			const row = this.db.div("MatcToobarRow").build(this.cntr);
			const chkBox = this.$new(CheckBox);
			css.add(chkBox.domNode, "MatcToolbarItem");
			chkBox.placeAt(row);
			chkBox.setLabel("Forget State")
			chkBox.setValue(widget.props.ignoreStateOnPageLoad);
			this.tempOwn(on(chkBox, "change", lang.hitch(this, "setIgnoreState")));
			this._addChildWidget(chkBox);
			this.addTooltip(row, "Do not load previous state when showing the widget again.");
		},

		_showNavBar (model){
			this._setSectionLabel("NavBar");

			this._renderButton("Navigation", "Navigation", "_renderNavBarDialog");

			this._renderInputDropDown("Spacing",model, [
				{value: -1, label: 'Auto'},
				{value: 0, label: 'None'},
				{value: 8, label: '8'},
				{value: 12, label: '12'},
				{value: 16, label: '16'},
				{value: 18, label: '18'},
				{value: 20, label: '20'},
				{value: 24, label: '24'},
				{value: 32, label: '32'},
				{value: 40, label: '40'}
			], "gap", false);

			if (model.props.type === 'MobileBottom') {
				this._renderInputDropDown("Icon Size",model, [
				{value: 8, label: '8'},
				{value: 12, label: '12'},
				{value: 16, label: '16'},
				{value: 18, label: '18'},
				{value: 20, label: '20'},
				{value: 24, label: '24'},
				{value: 28, label: '28'},
				{value: 32, label: '32'},
				{value: 40, label: '40'}
			], "iconSize", false);
			}
	
		},


		_showNavMenu (model){
			this._setSectionLabel("Navigation Menu");

			this._renderButton("Navigation", "Navigation", "_renderNavBarDialog");

			this._renderBoxColor("Popup", model, "popupBackground", "popupColor");
			this._renderBoxColor("Selection", model, "selectedOptionBackground", "selectedOptionColor");
			this._renderColor('Popup Border','<span class="mdi mdi-border-color"></span>',model.style.popupBorderColor, "popupBorderColor" ,"onStyleChanged", true);
			this._renderCheck("Merge borders",model.props.hideUpperBorder, "hideUpperBorder" );
			this._renderLabelDropDown("Popup Position", model,"popupPosition",[
					{ value:"MatcWidgetTypeDropDownPopUber", icon:"mdi mdi-arrow-up-bold-circle", label : "Popup Over"},
					{ value:null, icon:"mdi mdi-arrow-down-bold-circle", label : "Popup Under"},
			]);
			this._renderShadowPicker("Popup",model, "popupShadow");
	
		},





		/**********************************************************************
		 * Script
		 **********************************************************************/

		_renderScriptDialog (e) {

   			const dialogCSS = (this.model.type === 'desktop' || this.model.type === 'tablet') ? 'MatcScriptEditorDialogXL' : ''
			const popup = this.db.div("MatcScriptEditorDialog MatcDialog MatcPadding " + dialogCSS).build();
			const cntr = this.db.div("").build(popup);
			const settings = this.$new(ScriptEdior);
			const bar = this.db.div("MatcButtonBar MatcMarginTop").build(popup);
			const write = this.db.div("MatcButton MatcButtonPrimary", "Ok").build(bar);
			const cancel = this.db.a("MatcLinkButton", "Cancel").build(bar);

			const d = this.canvas.createDialog();
			d.own(on(write, touch.press, lang.hitch(this,"setScript", d, settings)));
			d.own(on(cancel, touch.press, lang.hitch(this, "closeDialog",d, settings)));
			d.own(on(d, "close", () => {
				settings.destroy();
				this.canvas.setState(0);
			}));
			d.onOpen(() => {
				settings.placeAt(cntr);
				settings.setHash(this.hash);
				settings.setWidget(this.widget);
				settings.setModel(this.model);
			})
			if (e && e.target) {
				d.popup(popup, e.target);
			} else {
				d.popup(popup, this.domNode);
			}
			
		},

		setScript (d, settings) {
			const value = settings.getValue()
			this.onProperyChanged('script', value)
			d.close()
		},

		/**********************************************************************
		 * NavBar
		 **********************************************************************/

		 _renderNavBarDialog (e) {

			const popup = this.db.div("MatcDialog MatcPadding").build();

			const cntr = this.db.div("").build(popup);

			const editor = this.$new(NavidationEditor);
			const screens = Object.values(this.model.screens).map(s => {
				return {label: s.name, value: s.id}
			})
			screens.push({
				label: 'None', value: '', css: "passive"
			})
			editor.setScreens(screens);
			editor.setWidget(this.widget);
			editor.placeAt(cntr)

			const bar = this.db.div("MatcButtonBar MatcMarginTop").build(popup);
			const write = this.db.div("MatcButton MatcButtonXS MatcButtonPrimary", "Ok").build(bar);
			const cancel = this.db.a("MatcLinkButton MatcButtonXS", "Cancel").build(bar);

			const d = new Dialog();
			d.own(on(write, touch.press, lang.hitch(this,"setNavBar", d, editor)));
			d.own(on(cancel, touch.press, lang.hitch(this, "closeDialog",d, editor)));
			d.popup(popup, e.target);
		},

		setNavBar (d, editor) {
			d.close()
			const navigation = editor.getValue()
			this.onProperyChanged("navigation", navigation);
		},

		/**********************************************************************
		 * REST
		 **********************************************************************/


		_renderChartAnimationDialog (e){
			this.stopEvent(e);
			let db = new DomBuilder();
			let popup = db.div(" MatcPadding").build();
			let cntr = db.div("").build(popup);

			let settings = this.$new(ChartAnimationSettings);
			settings.setWidget(this.widget);
			settings.placeAt(cntr);

			let bar = db.div("MatcButtonBar MatcMarginTop").build(popup);
			let write = db.div("MatcButton MatcButtonPrimary", "Save").build(bar);
			let cancel = db.a("MatcLinkButton", "Cancel").build(bar);
			
			let d = new Dialog({overflow:true});

			d.own(on(write, touch.press, lang.hitch(this,"setChartAnimation", d, settings, this.widget)));
			d.own(on(cancel, touch.press, lang.hitch(d, "close")));
			d.own(on(d, "close", () => {
				settings.destroy();
			}));
			d.popup(popup, e.target);
		
		},

		setChartAnimation (d, settings) {
			const newAnimation = settings.getValue()
			console.debug('setChartAnimation', newAnimation)
			this.onProperyChanged('animation', newAnimation),
			d.close()
		},



		_renderRestDialog (e) {

			const popup = this.db.div("MatcDialog MatcPadding").build();
			const cntr = this.db.div("").build(popup);
			const settings = this.$new(RestSettings);
			settings.setWidget(this.widget);
			settings.setModel(this.model);
			settings.placeAt(cntr);
			const bar = this.db.div("MatcButtonBar MatcMarginTop").build(popup);
			const write = this.db.div("MatcButton MatcButtonPrimary", "Ok").build(bar);
			const cancel = this.db.a("MatcLinkButton", "Cancel").build(bar);
			const d = this.canvas.createDialog();
			d.own(on(write, touch.press, lang.hitch(this,"setRest", d, settings)));
			d.own(on(cancel, touch.press, lang.hitch(this, "closeDialog",d, settings)));
			d.own(on(d, "close", () => {
				settings.destroy();
				this.canvas.setState(0);
			}));
			if (e && e.target) {
				d.popup(popup, e.target);
			} else {
				d.popup(popup, this.domNode);
			}
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
					preview.setJwtToken(this.jwtToken);
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

			const dataBindingBtn = this.$new(DataBindingButton)
			dataBindingBtn.setWidget(widget)
			dataBindingBtn.setDataView(this.isDataView)
			dataBindingBtn.setModel(this.model)
			dataBindingBtn.placeAt(this.cntr)
			dataBindingBtn.on('showDialog', (variable) => this._showDataBindingDialog(widget, variable))
			dataBindingBtn.on('change', (value) => {
				this.emit("propertyChange", "databinding", value);
			})


			if (hasIgnoreState) {
				this._renderSurveyBindig(widget)
				this._renderIgnoreState(widget);
			}
		},


		_renderSurveyBindig (widget) {

			var row = this.db.div("MatcToobarRow").build(this.cntr);

			var chkBox = this.$new(CheckBox);
			css.add(chkBox.domNode, "MatcToolbarItem");
			chkBox.placeAt(row);
			chkBox.setLabel("Survey element")
			chkBox.setValue(widget.props.isSurveyElement);
			this.tempOwn(on(chkBox, "change", lang.hitch(this, "setSurveyElement")));
			this._addChildWidget(chkBox);
			this.addTooltip(row, "User inout will be saved and shown in the survey section.");
		},

		setSurveyElement (value) {
			this.emit("propertyChange", "isSurveyElement", value);
		},

		_showDataBindingDialog (widget, variable){

			var popup = this.db.div("MatcDialog MatcDataBindingDialogXXL MatcPadding").build();
			var cntr = this.db.div("").build(popup);

			let dataBinding = this.$new(DataBinding)
			dataBinding.setModel(this.model)
			dataBinding.setWidget(widget)
			dataBinding.setVariable(variable)
			dataBinding.placeAt(cntr)

			var bar = this.db.div("MatcButtonBar MatcMarginTop").build(popup);
			var write = this.db.div("MatcButton MatcButtonPrimary", "Ok").build(bar);
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

		// setDataBinding (d, dataBindingWidget){
		// 	/**
		// 	 * Since 2.1.2 We get a dict form the dataBinding Widgt
		// 	 */
		// 	const value = dataBindingWidget.getValue()
		// 	const schema = dataBindingWidget.getSchema()
		// 	const data = dataBindingWidget.getData()
		// 	this.emit("dataBindingChange", value, schema, data);
		// 	d.close();
		// },


		/**********************************************************************
		 * Table
		 **********************************************************************/

		_renderTableSettings (e) {
			var me = this;
			var popup = this.db.div("MatcToolbarTableSettingsDialog MatcDialog MatcPadding").build();
			var cntr = this.db.div("").build(popup);
			var table = this.$new(TableSettings);
			table.setModel(this.model)
			table.setWidget(this.widget);
			table.placeAt(cntr);
			var bar = this.db.div("MatcButtonBar MatcMarginTop").build(popup);
			var write = this.db.div("MatcButton MatcButtonPrimary", "Ok").build(bar);
			var cancel = this.db.a("MatcLinkButton", "Cancel").build(bar);

			var d = this.canvas.createDialog();
			d.overflow = true
			d.own(on(write, touch.press, lang.hitch(this,"setTableSettings", d, table)));
			d.own(on(cancel, touch.press, lang.hitch(this, "closeDialog",d, table)));
			d.own(on(d, "close", function(){
				table.destroy();
				me.canvas.setState(0);
			}));
			d.popup(popup, e.target);
		},

		setTableSettings (dialog, settings) {
			const value = settings.getValue()
			this.emit("propertyMultiChange", {
				tableActions: value.tableActions,
				columns: value.columns,
				data: value.data
			})
			settings.destroy();
			dialog.close();
		},


		// setTableSettings (dialog, settings) {
		// 	let value = settings.getValue()

		// 	this.onProperyChanged("tableActions", value.tableActions);
		// 	this.onProperyChanged("columns", value.columns);

		// 	settings.destroy();
		// 	dialog.close();
		// },

		_renderStyledTableDialog (e) {
			this._renderTableDialog(e, 26)
		},

		_renderTableDialog (e, maxColumns = 8){
		
			const popup = this.db.div("MatcToolbarTableSettingsDialog MatcDialog MatcPadding").build();
			const cntr = this.db.div("").build(popup);
			const table = this.$new(Table, {columns: maxColumns});
			table.placeAt(cntr);
			const bar = this.db.div("MatcButtonBar MatcMarginTop").build(popup);
			const write = this.db.div("MatcButton MatcButtonPrimary", "Ok").build(bar);
			const cancel = this.db.a("MatcLinkButton", "Cancel").build(bar);

			const d = this.canvas.createDialog();
			d.own(on(write, touch.press, lang.hitch(this,"setTableData", d, table)));
			d.own(on(cancel, touch.press, lang.hitch(this, "closeDialog",d, table)));
			d.own(on(d, "close", () => {
				table.destroy();
				this.canvas.setState(0);
			}));
			d.onOpen(() => {
				// render table only after dialog is open
				table.setWidget(this.widget);
			})
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

			var popup = this.db.div("MatcDialog MatcOptionDialog MatcPadding").build();
			var cntr = this.db.div("MatcDialogTable").build(popup);
			var scroller = this.$new(ScrollContainer);
			scroller.placeAt(cntr);

			var list = this.$new(InputList,{"check" : "single", 'checkNewOption': true});
			if (this.widget.props){
				list.setSelected(this.widget.props.formGroup);
			}
			list.setOptions(this.getFormGroups(this.widget));
			scroller.wrap(list.domNode);

			var bar = this.db.div("MatcButtonBar MatcMarginTop").build(popup);
			var write = this.db.div("MatcButton MatcButtonPrimary", "Ok").build(bar);
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
			console.debug("setFormGroup", value)
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


		_renderReferenceButton (model, refId,txt, refIcon, noRefIcon = 'ReferenceNone'){
			var refs = this.getRef(model, refId);

			var icon = noRefIcon
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
			var cntr = this.db.div(" MatcToolbarItem MatcToolbarIconButton ").build(row);
			cntr.appendChild(iconDOM(icon))
			this.db.span("MatcToolbarDropDownButtonLabel", txt).build(cntr);
			this.tempOwn(on(cntr, touch.press, lang.hitch(this, "_showRefDialog", model, refButton, refId)));

		},

		_showRefDialog (model, refElement, refId, e){
			console.debug('_showRefDialog')
			this.stopEvent(e);
			var popup = this.db.div("MatcDialog MatcOptionDialog MatcPadding").build();

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

			var write = this.db.div("MatcButton MatcButtonPrimary", "Ok").build(bar);
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

		 _renderNonSelectableOptionDialog (e) {
			this._renderOptionDialog(e, 'none')
		 },

		_renderOptionDialog (e, type = 'single'){
			this.stopEvent(e);

			const popup = this.db
				.div("MatcDialog MatcOptionDialog MatcPadding").build();

			const cntr = this.db
				.div("MatcDialogTable").build(popup);

			const scroller = this.$new(ScrollContainer);
			scroller.placeAt(cntr);

			const list = this.$new(OptionsList, {"check" : type});
			list.setSelected(this.widget.props.selected);
			list.setOptions(this.widget.props.options);

			scroller.wrap(list.domNode);

			const bar = this.db
				.div("MatcButtonBar MatcMarginTop").build(popup);
			const write = this.db
				.div("MatcButton MatcButtonPrimary", "Ok").build(bar);
			const cancel = this.db
				.a("MatcLinkButton", "Cancel").build(bar);

			const d = new Dialog();
			d.own(on(write, touch.press, lang.hitch(this,"setOptions", d, scroller, list)));
			d.own(on(cancel, touch.press, lang.hitch(this, "closeDialog",d, scroller, list)));
			d.popup(popup, e.target);
		},

		/**********************************************************************
		 * Icons
		 **********************************************************************/
		 _renderSVGIconDialog (e, model, iconKey = 'svg'){
			this.logger.log(-1, '_renderIconDialog', 'enter', iconKey)
			this.stopEvent(e);

			const popup = this.db
				.div("MatcDialog  MatcPadding")
				.build();

			const value = model.props.svg
			const table = this.$new(IconTable, {value: value, isSVG:true})
			table.placeAt(popup)
			table.on("change", svg => {
				this.onProperyChanged(iconKey, svg);
				d.close()
			})
			const bar = this.db.div("MatcButtonBar MatcMarginTop").build(popup);
			const cancel = this.db.a("MatcButton MatcButtonPrimary MatcButtonXS", "Cancel").build(bar);

			const d = new Dialog();
			d.hasCSSAnimation = false
			d.own(on(cancel, touch.press, lang.hitch(d, "close")));
			d.popup(popup, e.target);
			
		},

		_renderIconDialog (e, iconKey = 'icon'){
			this.logger.log(-1, '_renderIconDialog', 'enter', iconKey)
			this.stopEvent(e);

			const popup = this.db
				.div("MatcDialog MatcPadding")
				.build();
		
			const value = this.getSelectedIcon(iconKey)
			const table = this.$new(IconTable, {value: value, isSVG:false})
			table.placeAt(popup)
			table.on("change", icon => {
				this.onStyleChanged(iconKey, icon);
				d.close()
			})

			const bar = this.db.div("MatcButtonBar MatcMarginTop").build(popup);
			const cancel = this.db.a("MatcButton MatcButtonPrimary MatcButtonXS", "Cancel").build(bar);

			const d = new Dialog();
			d.hasCSSAnimation = false
			d.own(on(cancel, touch.press, lang.hitch(d, "close")));	
			d.popup(popup, e.target);
		},

		getSelectedIcon (iconKey= 'icon') {
			if (this.widget && this.widget.style) {
				return this.widget.style[iconKey]
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


		_renderShadowPicker (label, model, prop) {

			var row = this.db.div("MatcToobarRow").build(this.cntr);

			let radius = this.db.div('').build(row);
		
			let picker = this.$new(BoxShadow)
			picker.placeAt(radius)
			//picker.setLabelPrefixFix(label)
			picker.setValue(model.style[prop])
			this.tempOwn(on(picker, "change", lang.hitch(this, "onStyleChanged", prop)));
			this.tempOwn(on(picker, "changing", lang.hitch(this, "onTempStyleChanged", prop)));
		
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

		_renderRandom (model) {
			if (model.has.random) {
				this._renderCheck('Randomize Order', model.props.randomize, 'randomize')
			}
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

		_renderSpacer () {
			this.db.div("MatcToobarRow MatcToobarRowSpacer ").build(this.cntr);
		},

		_renderSubSection(lbl) {
			this.db
				.div("MatcToobarRow MatcToobarSubSection ")
				.build(this.cntr);

			if (lbl) {
				this.db
					.div("MatcToobarSubSectionLabel", lbl)
					.build(this.cntr);
			}
		},

		_renderButton (lbl, icon, callback){
			const row = this.db.div("MatcToobarRow ").build(this.cntr);
			const item = this.db.div("MatcToolbarItem  MatcToolbarIconButton").build(row);
		
			const i = iconDOM(icon)
			item.appendChild(i)
			this.db.span("MatcToolbarItemLabel", lbl).build(item);
			this.tempOwn(on(row, touch.press, lang.hitch(this, callback)));
		},

		_renderDropDownTree (lbl, icon, options) {
			var row = this.db.div("MatcToobarRow").build(this.cntr);

			var drpDwn = this.$new(DropDownTree, {hasPicker:true});
			css.add(drpDwn.domNode, "")
			drpDwn.reposition = true;
			drpDwn.setOptions(options);
			drpDwn.setModel(this.model)
			drpDwn.setIcon(icon)
			drpDwn.setLabel(lbl)
			drpDwn.setPopupCss("MatcActionAnimProperties");

			this.tempOwn(on(drpDwn, "change", (option, value) => {
				if (option.isStyle) {
					this.onStyleChanged(option.key, value)
				} else {
					this.onProperyChanged(option.key, value)
				}
			}))
			this.tempOwn(on(drpDwn, "changing", (option, value) => {
				if (option.isStyle) {
					this.onTempStyleChanged(option.key, value)
				}
			}))

				drpDwn.placeAt(row);

			this._addChildWidget(drpDwn);
		},

		_renderPrimaryButton (lbl, icon, callback){
			const row = this.db.div("MatcToobarRow MatcMarginBottomXS").build(this.cntr);
			const item = this.db.div("MatcToolbarItem ").build(row);
			const btn = this.db.span("MatcToolbarButton MatcButton MatcToolbarButtonPrimary").build(item);
			this.db.span(icon + ' MatcButtonIcon').build(btn)
			this.db.span("MatcButtonIconLabel", lbl).build(btn);
			this.tempOwn(on(row, touch.press, lang.hitch(this, callback)));
		},


		_renderInfo(lbl, icon){
			var row = this.db.div("MatcToobarRow ").build(this.cntr);
			var item = this.db.div("MatcToolbarItem  MatcToolbarDropDownButton").build(row);
			var btn = this.db.span("MatcToolbarItemIcon").build(item);
			this.db.span(icon).build(btn)
			this.db.span("MatcToolbarItemLabel", lbl).build(btn);
		},

		_renderDropDown (model, prop, options){

			var row = this.db.div("MatcToobarRow").build(this.cntr);

			var drpDwn = this.$new(ToolbarDropDownButton, {maxLabelLength:15});
			css.add(drpDwn.domNode, "")
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
			this._addChildWidget(drpDwn);
		},

		_renderImagesDropDown (widget){

			var row = this.db.div("MatcToobarRow").build(this.cntr);

			var imageDrpDwn = this.$new(ToolbarImage, {mode:this.mode});
			css.add(imageDrpDwn.domNode, "")
			imageDrpDwn.setJwtToken(this.jwtToken)
			imageDrpDwn.setModel(this.model);
			imageDrpDwn.setCanvas(this.canvas);
			imageDrpDwn.setSelection(widget.props.images);
			imageDrpDwn.setMultiSelection(true);
			//imageDrpDwn.setLabel('<span class="mdi mdi-image"></span> <span class="MatcToolbarItemLabel">Images</span>');
			imageDrpDwn.placeAt(row);
			this.tempOwn(on(imageDrpDwn, "change", lang.hitch(this, "onProperyChanged", "images")));


			this._addChildWidget(imageDrpDwn);

		},

		_renderColor (lbl, icon, value, property, callback, updateColor, hasGradient = false){

			if(!callback){
				callback ="onStyleChanged";
			}

			var row = this.db.div("MatcToobarRow").build(this.cntr);

			var color = this.$new(ToolbarColor, {hasPicker:true, hasGradient: hasGradient});
			color.placeAt(row);
			if(updateColor){
				color.updateColor = true;
			} else {
				color.updateLabel = true;
			}

			color.setLabel(lbl);
			color.setModel(this.model);
			color.setValue(value);
			color.setBox(this.widget)
			color.setCssProps([property])
			css.add(color.domNode, " ");
			this.tempOwn(on(color, "change", lang.hitch(this, callback, property)));
			this.tempOwn(on(color, "changing", lang.hitch(this, "onTempStyleChanged", property)));

			//this.db.span("MatcToolbarItemLabel", lbl).build(row);

			this._addChildWidget(color);

			return color;
		},


		_renderInput (model, property, tt, placeholder=""){

			let row = this.db.div("MatcToobarRow MatcToolbarItem  ").build(this.cntr);
			//this.db.span("MatcToolbarItemLabel",lbl ).build(row);

			var input = this.db.input("MatcIgnoreOnKeyPress MatcToobarInlineEdit").build(row);
			input.value = model[property];
			input.placeholder = placeholder

			var callback = lang.hitch(this, "onProperyChanged", property);
			this.tempOwn(on(input, "change", function(){
				callback(input.value);
			}));
			if(tt){
				this.addTooltip(row, tt);
			}
		},

		_renderTextArea (model, property, tt, placeholder=""){

			const row = this.db
				.div("MatcToolBarTextArea MatcToolbarItem  ")
				.build(this.cntr);
			
			const textarea = this.db
				.textarea("MatcIgnoreOnKeyPress MatcToobarInput")
				.build(row);

			if(tt){
				this.addTooltip(row, tt);
			}

			const value = model[property]
			textarea.value = model[property];
			textarea.placeholder = placeholder

			const onChangeListener = () => {
				if (value !== textarea.value) {
					this.onProperyChanged(property, textarea.value);
				}		
			}
			this._addBlurListener(textarea)		
			this.tempOwn(on(textarea, "blur", onChangeListener));
	
		
		},


		_renderInputDropDown (lbl, model, options, property, isProp, type = false){

			const row = this.db.div("MatcToobarRow ").build(this.cntr);
			const dropDown = this.$new(InputDropDownButton);
			if (type) {
				dropDown.type = type
			}
			dropDown.reposition = true;
			dropDown.setLabelPostfix("   (" + lbl + ")");
			dropDown.setOptions(options);
			css.add(dropDown.domNode, "");
			if(isProp){
				dropDown.setValue(model.props[property])
			} else {
				dropDown.setValue(model.style[property])
			}
			dropDown.placeAt(row);
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
			color.setLabel(lbl + ' Fill');
			color.setCssProps([propertyBack])
			color.setModel(this.model);
			color.setValue(model.style[propertyBack]);
			css.add(color.domNode ,"");
			this.tempOwn(on(color, "change", lang.hitch(this, "onStyleChanged", propertyBack)));
			this.tempOwn(on(color, "changing", lang.hitch(this, "onTempStyleChanged", propertyBack)));
			this._addChildWidget(color);

			if(propertyColor){
				row = this.db.div("MatcToobarRow  ").build(this.cntr);
				color = this.$new(ToolbarColor, {hasPicker:true});
				color.placeAt(row);
				color.setCssProps([propertyColor])
				color.setLabel(lbl + ' Text');
				color.setModel(this.model);
				color.setValue(model.style[propertyColor]);
				css.add(color.domNode ,"");
				this.tempOwn(on(color, "change", lang.hitch(this, "onStyleChanged", propertyColor)));
				this.tempOwn(on(color, "changing", lang.hitch(this, "onTempStyleChanged", propertyColor)));
				this._addChildWidget(color);
			}

			if(propertyBorder){
				row = this.db.div("MatcToobarRow ").build(this.cntr);
				color = this.$new(ToolbarColor, {hasPicker:true});
				color.placeAt(row);
				color.setCssProps([propertyBorder])
				color.setLabel(lbl + ' Border');
				color.setModel(this.model);
				color.setValue(model.style[propertyBorder]);
				css.add(color.domNode ,"");
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
			this.logger.log(2, "onTempStyleChanged", "enter > "+ key + " > " + value);
			this.emit("stypeChanging", key, value);
		},

		_addChildWidget (w){
			if(!this._childWidgets){
				this._childWidgets =[];
			}
			this._childWidgets.push(w);
		},

		_addBlurListener (input) { // must of blur()
			if (!this._blurListener) {
				this._blurListener = []
			}
			this._blurListener.push(input)
		},

		blur () {
			this.logger.log(1, "blur", "enter");
			if(this._blurListener){
				try {
					for(let i=0; i< this._blurListener.length; i++){
						if (this._blurListener[i].blur) {
							this._blurListener[i].blur();
						}				
					}
				} catch (err) {
					this.logger.error("blur", "Some error", err);
					this.logger.sendError(err)
				}
				
			}
		},

		_cleanUpChildWidgets (){
			if(this._childWidgets){
				for(var i=0; i< this._childWidgets.length; i++){
					this._childWidgets[i].destroy();
				}
			}
			delete this._childWidgets;
			delete this._blurListener
		}
    },
    mounted () {
			this.domUtil = new DomUtil()
    }
}
</script>