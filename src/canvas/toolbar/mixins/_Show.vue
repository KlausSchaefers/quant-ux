<script>
import DojoWidget from 'dojo/DojoWidget'
import css from 'dojo/css'
import lang from 'dojo/_base/lang'
import _Tooltip from 'common/_Tooltip'

export default {
    name: '_Show',
    mixins:[_Tooltip, DojoWidget],
    data: function () {
        return {
					colorWidgets: []
      }
	},
    components: {},
		computed: {
			isDataView () {
				return this.canvasViewMode === 'data'
			}
		},
    methods: {


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
				css.remove(this.lowCodeDiv, "MatcToolbarSectionHidden")
				css.remove(this.lowCodeResponsiveDiv, "MatcToolbarSectionHidden")

				this.groupActionBTN.setValue(model);
				this.groupName.value = model.name ? model.name : "";
				this.groupName.blur();
				this.lowCodeSection.setValue(model, true)
				this.lowCodeResponsiveSection.setValue(model, true)

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
			}

    },
    mounted () {
    }
}
</script>