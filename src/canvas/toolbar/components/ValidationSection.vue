
<template>
	<div class="MatcDataSection">
	</div>
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
import ScrollContainer from 'common/ScrollContainer'
import ToolbarDropDownButton from './ToolbarDropDownButton'
import DataSection from './DataSection'
import Validation from './Validation'
import {iconDOM} from 'page/QIconUtil'

export default {
    name: 'ValidationSection',
    mixins:[DataSection, DojoWidget],
    data: function () {
        return {

        }
    },
    components: {},
    methods: {
      	postCreate (){
			this.logger = new Logger("ValidationSection");
			this.db = new DomBuilder();
		},

		setSectionHeader (header){
			this.header = header;
		},


		setModel (model){
			this.model = model;
		},

		beforeShow () {
			this._setSectionLabel('Data')
		},

		_showScreenSegment  (model) {
			this._renderDataBinding(model, false);
		},

		_showProgressBar (model){
			this._renderDataBinding(model, false);
		},

		_showTree (model){
			this._renderDataBinding(model, false);
		},

		_showTable (model){
			this._renderDataBinding(model, false);
		},

		_showPaging (model){
			this._renderDataBinding(model, false);
		},

		_showVerticalNavigation (model){
			this._renderDataBinding(model, false);
		},

		_showRadioGroup (model){
			this._renderDataBinding(model);
			var validation = this.getValidationModel(model);
			this._renderRequired(validation);
			this._renderValidationLabels(validation, model);
		},


		_showCheckBoxGroup (model){
			this._renderDataBinding(model);
			var validation = this.getValidationModel(model);
			this._renderRequired(validation);
			this._renderValidationLabels(validation, model);
		},

		_showRepeater (model){
			this._renderButton("Data", "mdi mdi-table-large", "_renderTableDialog");
			this._renderDataBinding(model, false);
		},

		_showVisualPicker(model) {
			this._renderDataBinding(model, false);
		},

		_showProgessSegments (model) {
			this._renderDataBinding(model, false);
		},

		_showImageCarousel(model){
			this._renderDataBinding(model, false);
		},

		_showImagePaging (model) {
			this._renderDataBinding(model, false);
		},

		_showLabeledIconToggle (model){
			this._renderDataBinding(model);
		},

		_showIconToggleButton (model){
			this._renderDataBinding(model);
		},

		_showButton (model){
			this._setSectionLabel('Content')
			this._renderTextArea(model.props, 'label', 'Label value', 'Enter a message')
		},

		_showStepper (model){
			this._renderDataBinding(model);
		},

		_showCountingStepper (model){
			this._renderDataBinding(model);
		},

		_showLabel (model){
			this._renderDataBinding(model);
			this._renderSubSection('Content')
			this._renderTextArea(model.props, 'label', 'Label value', 'Enter a message')

			if (model?.props?.animated) {		
				if (model.props.animation === 'chat') {
					this._renderSubSection('Animated Text')
					this._setSectionLabel("Chat Label");
					this._renderInputDropDown("Typing Speed", model, [1, 2, 3, 4, 5], "duration", true, 'float');
					//this._renderCheck("Show dots (...)",model.props.animationDots, "animationDots" );
				} else {
					this._renderSubSection('Animation Number')
					this._renderInputDropDown("Min",model, [0,1,5,10,20, 50, 100], "min", true);
					this._renderInputDropDown("Max",model, [0,1,5,10,20, 50, 100], "max", true);
					this._renderInputDropDown("Duration (s)",model, [0,1,2, 3, 4, 5], "duration", true, 'float');
				}		
			}
		},


		_showLabeledTextBox (model){
			this._renderDataBinding(model);
			var validation = this.getValidationModel(model);
			this._renderRequired(validation);
			this._renderTextBoxValidation(validation);
			this._renderValidationLabels(validation, model);
		},

		_showLabeledTextArea (model){
			this._renderDataBinding(model);
			var validation = this.getValidationModel(model);
			this._renderRequired(validation);
			this._renderTextBoxValidation(validation);
			this._renderValidationLabels(validation, model);
		},


		_showSpinner (model){
			this._renderDataBinding(model);
		},

		_showHSlider (model){
			this._renderDataBinding(model);
		},

		_showToggleButton (model){
			this._renderDataBinding(model);
		},

		_showTimeline (model){
			this._renderDataBinding(model);
		},

		_showCamera (model){
			this._renderDataBinding(model);
		},

		_showUpload (model){
			this._renderDataBinding(model);
		},

		_showUploadPreview (model){
			this._renderDataBinding(model, false);
		},

		_showIconToggle (model){
			this._renderDataBinding(model);
		},

		_showSegmentButton (model){
			this._renderDataBinding(model);
		},

		_showLockSlider (model){
			this._renderDataBinding(model);
		},

		_showSegmentPicker(model){
			this._renderDataBinding(model);
		},

		_showRating (model){
			this._renderDataBinding(model);
		},

		_showRadioBox2 (model){
			this._renderIgnoreState(model);
		},

		_showDragNDropTarget (model){
			this._renderDataBinding(model);

			//this._renderCheck("Vertical Move",model.props.dndY, "dndY" );
			//this._renderCheck("Horizontal Move",model.props.dndX, "dndX" );
		},

		_showBarChart (model){
			this._renderDataBinding(model, false);
		},

		_showRingChart (model){
			this._renderDataBinding(model, false);
		},

		_showPieChart (model){
			this._renderDataBinding(model, false);
		},

		_showMultiRingChart(model){
			this._renderDataBinding(model, false);
		},

		_showTypeAheadTextBox (model){
			this._renderDataBinding(model);

			var validation = this.getValidationModel(model);
			this._renderRequired(validation);
			this._renderTextBoxValidation(validation);
			this._renderValidationLabels(validation, model);
		},


		_showTextBox (model){

			this._renderDataBinding(model);

			var validation = this.getValidationModel(model);
			this._renderRequired(validation);
			this._renderTextBoxValidation(validation);
			this._renderValidationLabels(validation, model);

		},

		_showSortableList(model){
			this._renderDataBinding(model);
		},


		_showRadioTable(model) {
			this._renderDataBinding(model);
		},

		_showSwitch (model){

			var validation = this.getValidationModel(model);
			this._renderRequired(validation);
			this._renderValidationLabels(validation, model);

		},

		_showDropDown (model){
			this._renderDataBinding(model);

			var validation = this.getValidationModel(model);
			this._renderRequired(validation);
			this._renderValidationLabels(validation, model);
		},

		_showMobileDropDown (model){
			this._renderDataBinding(model);

			var validation = this.getValidationModel(model);
			this._renderRequired(validation);
			this._renderValidationLabels(validation, model);
		},



		_showPassword (model){
			this._renderDataBinding(model);

			var validation = this.getValidationModel(model);
			this._renderRequired(validation);
			this._renderTextBoxValidation(validation);
			this._renderValidationLabels(validation, model);

		},


		_showDate (model){
			this._renderDataBinding(model);

			var validation = this.getValidationModel(model);
			this._renderRequired(validation);
			if(!model.props.range){
				this._renderDateValidation(validation);
			}
			this._renderValidationLabels(validation, model);
		},

		_showDateDropDown (model){
			this._renderDataBinding(model);

			var validation = this.getValidationModel(model);
			this._renderRequired(validation);
			if(!model.props.range){
				this._renderDateValidation(validation);
			}
			this._renderValidationLabels(validation, model);
		},

		_showTextArea (model){
			this._renderDataBinding(model);

			var validation = this.getValidationModel(model);
			this._renderRequired(validation);
			this._renderValidationLabels(validation, model);
		},


		_showScript (model){
			this._setSectionLabel("Run on");
		
			this._renderLabelDropDown("Icon", model, "trigger",[
				{ value:"databinding", icon:"mdi mdi-database-edit-outline", label : "Data Changes"},
				{ value:null, icon:"mdi mdi-cursor-default-click-outline", label : "Click"}
			]);
		},


		_showCheckBox (model){
			this._renderDataBinding(model);
			var validation = this.getValidationModel(model);
			this._renderRequired(validation);
			this._renderValidationLabels(validation, model);
		},


		_showLabeledRadioBox (model){
			this._renderDataBinding(model);
			const validation = this.getValidationModel(model);
			this._renderRequired(validation);
			this._renderValidationLabels(validation, model);
		},


		_showLabeledCheckBox (model){
			this._renderDataBinding(model);
			const validation = this.getValidationModel(model);
			this._renderRequired(validation);
			this._renderValidationLabels(validation, model);
		},

		/**********************************************************************
		 * Validation
		 **********************************************************************/

		_renderDateValidation (validation){


			var currentValue = validation.date;
			if(!currentValue){
				currentValue = "Set Correct Date";
			}

			var row = this.db.div("MatcToobarRow MatcAction").build(this.cntr);
			var drpBox = this.$new(ToolbarDropDownButton, {maxLabelLength:15});
			drpBox.reposition=true;
			drpBox.setOptions([
				{"value" : null, label:"No Validation", icon:"mdi mdi-close", callback:lang.hitch(this, "removeDateValidation")},
							{"value" : "date", label:currentValue, icon:"mdi mdi-calendar", callback:lang.hitch(this, "showDateValidation")},
						]);
			drpBox.setPopupCss("MatcActionAnimProperties");
			drpBox.setValue(validation.type)
			drpBox.placeAt(row);

			this.addTooltip(row, "Select the data type for validation");
			this._addChildWidget(drpBox);
		},

		showDateValidation (e){
			this.stopEvent(e);

			var popup = this.db.div(" MatcPadding").build();
			var cntr = this.db.div("").build(popup);
			var validation = this.$new(Validation, {widgetType:"date"});
			validation.setValue(this.widget);

			validation.placeAt(cntr);

			var bar = this.db.div("MatcButtonBar MatcMarginTop").build(popup);
			var write = this.db.div("MatcButton MatcButtonPrimary", "Ok").build(bar);
			var cancel = this.db.a("MatcLinkButton", "Cancel").build(bar);
	

			var d = new Dialog({overflow:true});

			d.own(on(write, touch.press, lang.hitch(this,"setCustomDateValidation", d, validation)));
			d.own(on(cancel, touch.press, lang.hitch(d, "close")));
			d.own(on(d, "close", function(){
				validation.destroy();
			}));
			d.popup(popup, this.cntr);
		},

		setCustomDateValidation (d, validation){
			var isValid = validation.isValid();
			if(isValid){

				var val = validation.getValue();
				val = lang.clone(val);
				val.type="date";
				this.emit("propertyChange", "validation", val);

				d.close();
			} else {
				d.shake();
			}
		},

		removeDateValidation (){
			var val = this.getValidationModel(this.widget);
			val = lang.clone(val);
			val.type = null;
			val.date = null;
			this.emit("propertyChange", "validation", val);
		},

		getErrorLabels (model){
			var errorLabels = this.getRef(model, "errorLabels");
			if(!errorLabels){

				if(model.props.validation && model.props.validation.errorLabels){
					console.warn("getErrorLabels() > legacy code!!!", model.id);
					errorLabels = model.props.validation.errorLabels;
				}

			}
			return errorLabels;
		},

		_renderValidationLabels (validation, model){

			if(validation.required || (validation.type != null && validation.type !=undefined)){

				const errorLabels = this.getErrorLabels(model);
				const row = this.db
					.div("MatcToobarRow MatcAction ")
					.build(this.cntr);

				let txt =  "No Label";
				let icon = "ReferenceNone";
				if(errorLabels && errorLabels.length > 0){
					icon = "Reference";
					txt = "Change Labels...";
				}

				const cntr = this.db
					.div(" MatcToolbarItem MatcToolbarDropDownButton MatcToolbarIconButton ")
					.build(row);
				cntr.appendChild(iconDOM(icon));

				const lbl = this.db.label("MatcToolbarItemIcon").build(cntr);
				
				this.db.span("MatcToolbarDropDownButtonLabel", txt).build(lbl);

				this.tempOwn(on(cntr, touch.press, lang.hitch(this, "_showErrorLabelDialog", validation, model)));

			}
		},


		_showErrorLabelDialog (validation,model, e){

			this.stopEvent(e);

			const popup = this.db.div("MatcOptionDialog MatcDialog MatcPadding").build();

			const cntr = this.db.div("MatcDialogTable MatcDialogTableXL").build(popup);

			const list = {};

			const widgetsWidthDistance = this._getSortedErrorLabels();

			const tbl = this.db.table("").build(cntr);
			const tbody = this.db.tbody().build(tbl);

			const errorLabels = this.getErrorLabels(model);


			for(let i=0; i< widgetsWidthDistance.length; i++){
				const widget = widgetsWidthDistance[i].w;
				const widgetID = widget.id;
				const tr = this.db.tr().build(tbody);

				let td = this.db.td("MatcDialogTableSelectCntr").build(tr);
				
				const chkBox = this.$new(CheckBox);
				chkBox.setValue((errorLabels && errorLabels.indexOf(widgetID) >=0));
				chkBox.placeAt(td);

				td = this.db.td("MatcDialogTableCheckBoxLabel").span().build(tr);
				if(widget.props.label){
					td.innerHTML = widget.name + " - &quot" + widget.props.label + "&quot";
				}else {
					td.innerHTML = widget.name;
				}
				list[widgetID] = chkBox;
			}

			const scroller = this.$new(ScrollContainer);
			scroller.placeAt(cntr);
			scroller.wrap(tbl);

			const bar = this.db
				.div("MatcButtonBar MatcMarginTop")
				.build(popup);
	
			const write = this.db
				.div("MatcButton MatcButtonPrimary", "Ok")
				.build(bar);

			const cancel = this
				.db.a("MatcLinkButton", "Cancel")
				.build(bar);

			const d = new Dialog({overflow:true});

			d.own(on(write, touch.press, lang.hitch(this,"setErrorLabels", d, list, model)));
			d.own(on(cancel, touch.press, lang.hitch(d, "close")));
			d.own(on(d, "close", function(){
				for(let id in list){
					list[id].destroy();
				}
			}));
			d.popup(popup, this.cntr);

		},

		_getSortedErrorLabels (){
			var widgetsWidthDistance = [];

			var supportedType = ["Box", "Label", "Icon"];

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
						w : widget,
					});
				}
			}

			widgetsWidthDistance.sort(function(a,b){
				return a.y -b.y;
			});

			return widgetsWidthDistance;
		},

		_distance (){

		},

		setErrorLabels (d, list, model){
			var errorLabels = [];
			for(let id in list){
				var chk = list[id];
				if(chk.getValue()){
					errorLabels.push(id);
				}
			}

			var ref = {};
			if(model.props && model.props.refs){
				ref = lang.clone(model.props.refs);
			}
			ref["errorLabels"] = errorLabels;

			this.emit("propertyChange", "refs", ref);
			d.close();
		},


		_renderRequired (validation){

			var row = this.db.div("MatcToobarRow").build(this.cntr);

			var chkBox = this.$new(CheckBox);
			css.add(chkBox.domNode, "MatcToolbarItem");
			chkBox.placeAt(row);
			chkBox.setLabel("Required")
			chkBox.setValue(validation.required);
			this.tempOwn(on(chkBox, "change", lang.hitch(this, "setRequiredChanged")));
			this._addChildWidget(chkBox);
			this.addTooltip(row, "The field has to be filled.");
		},

		_renderTextBoxValidation (validation){

			var row = this.db.div("MatcToobarRow MatcAction").build(this.cntr);
			var drpBox = this.$new(ToolbarDropDownButton, {maxLabelLength:15});
			css.add(drpBox.domNode, "  MatcToolbarIconNoSmooth");
			drpBox.reposition=true;
			drpBox.setOptions([
				{"value" : null, label:"No Validation", icon:"mdi mdi-close"},
							{"value" : "email", label:"Email", icon:"mdi mdi-email"},
							{"value" : "int", label:"Number", icon:"mdi mdi-numeric-1-box"},
							{"value" : "double", label:"Decimal", icon:"mdi mdi-numeric-1-box"},
							{"value" : "date", label:"Date", icon:"mdi mdi-calendar"},
							{"value" : "time", label:"Time", icon:"mdi mdi-clock"},
							{"value" : "phone", label:"Phone Number", icon:"mdi mdi-phone"},
							{"value" : "custom", label:"Custom...", callback : lang.hitch(this, "showDataTypeDialog"), icon:"mdi mdi-checkbox-marked-circle"},
						]);
			drpBox.setPopupCss("MatcActionAnimProperties");
			drpBox.setValue(validation.type)
			drpBox.placeAt(row);
			this.tempOwn(on(drpBox, "change", lang.hitch(this, "setValidationDataType")));
			this.addTooltip(row, "Select the data type for validation");
			this._addChildWidget(drpBox);

		},

		getValidationModel (widget){
			if(widget.props && widget.props.validation){
				return widget.props.validation;
			}
			return {};
		},

		setRequiredChanged (value){
			var val = this.getValidationModel(this.widget);
			val = lang.clone(val);
			val.required = value;
			this.emit("propertyChange", "validation", val);
		},

		setIgnoreState (value) {
			this.emit("propertyChange", "ignoreStateOnPageLoad", value);
		},

		setValidationDataType (value){
			var val = this.getValidationModel(this.widget);
			val = lang.clone(val);
			val.type = value;
			this.emit("propertyChange", "validation", val);
		},


		showDataTypeDialog (e){

			this.stopEvent(e);

			var popup = this.db.div(" MatcPadding").build();

			var cntr = this.db.div("").build(popup);


			var validation = this.$new(Validation);
			validation.setValue(this.widget);
			validation.placeAt(cntr);

			var bar = this.db.div("MatcButtonBar MatcMarginTop").build(popup);
			var cancel = this.db.a("MatcLinkButton MatcButtonPrimary", "Cancel").build(bar);
			var write = this.db.div("MatcButton", "Ok").build(bar);

			var d = new Dialog({overflow:true});

			d.own(on(write, touch.press, lang.hitch(this,"setCustomValidation", d, validation)));
			d.own(on(cancel, touch.press, lang.hitch(d, "close")));
			d.own(on(d, "close", function(){
				validation.destroy();
			}));
			d.popup(popup, this.cntr);
		},

		setCustomValidation (d, validation){
			var isValid = validation.isValid();
			if(isValid){

				var val = validation.getValue();
				val = lang.clone(val);
				this.emit("propertyChange", "validation", val);

				d.close();
			} else {
				d.shake();
			}
		}
    },
    mounted () {
    }
}
</script>