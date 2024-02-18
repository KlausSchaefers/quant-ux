<script>
import DojoWidget from 'dojo/DojoWidget'
import css from 'dojo/css'
import lang from 'dojo/_base/lang'
import _Tooltip from 'common/_Tooltip'
import ModelUtil from 'core/ModelUtil'

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
	},
    methods: {

		/*****************************************************************************************************
		* widget properties
		****************************************************************************************************/

		showWidgetProperties (model){
			this.logger.log(1,"showWidgetProperties", "entry > ", this.isDataView);

			this.restorePropertiesState();

			/**
			* Since 2.1.6 we have a dedicated data view
			*/
			if (this.isDataView) {
				return this.showWidgetDataProperties(model)
			}

			if (this.isDesignView) {			
				this.showWidgetDesignProperties(model)			
			}

			if (this.isPrototypeView) {
				this.showWidgetPrototypeProperties(model)
			}


		},

		showWidgetPrototypeProperties (model) {
			this.logger.log(1,"showWidgetPrototypeProperties", "entry > ", model);

			this.showProperties();
			this.showWidgetTools();


			if (this.widgetName){
				css.remove(this.widgetNameDiv, "MatcToolbarSectionHidden");	
				if(model.name){
					this.widgetName.value = model.name;
				} else {
					this.widgetName.value = "";
				}
				this.widgetName.blur();
			}

			const isLogicWidget = this.hasLogic2.indexOf(model.type) >= 0;
			css.remove(this.lineDiv, "MatcToolbarSectionHidden");
			this.actionBTN.setValue(model, isLogicWidget);

			const widgetViewMode = this.widgetViewModeBtn.getValue();
			if (widgetViewMode == "style") {
				/**
				 * Show data binding etc in prototypiung mode
				 */
				if(this.hasValidation.indexOf(model.type) >= 0 || model?.has?.validation){
					css.remove(this.validationDiv,"MatcToolbarSectionHidden" );
					this.validationWidget.setValue(model, false);
				}
			}

			if (this.condStyleDiv){
				css.remove(this.condStyleDiv, 'MatcToolbarSectionHidden')
			}

			css.remove(this.tooltipDiv, "MatcToolbarSectionHidden");
			this.tooltipSettings.setWidget(model)
			this.tooltipSettings.setBox(model)

			this.showDesignTokenBtns(model, 'widget')
		},

		showWidgetDesignProperties (model) {

			this.setWidgetViewModes(model);
			const widgetViewMode = this.widgetViewModeBtn.getValue();
			let style = this.getViewModeStyle(model, widgetViewMode);

			if (!style) {
				/**
				 * This can maybe happen of teh wrong viewMode is open?
				 */
				this.logger.error('showWidgetDesignProperties', 'No style > mode: ' + widgetViewMode + " > type: " + model?.type)
				style = {}
			}

			if (!model.has) {
				this.logger.error('showWidgetDesignProperties', 'No has > mode: ' + widgetViewMode + " > type: " + model?.type)
			}
		
			this.showProperties();
			this.showWidgetTools();
			this.showDesignTokenBtns(model, 'widget')

			const isLogicWidget = this.hasLogic2.indexOf(model.type) >=0;
			if(isLogicWidget){
				css.add(this.positionCheckBox.domNode, "hidden");
				css.add(this.widgetSize.domNode, "hidden");
				css.add(this.responsiveDiv, "hidden");
			} else {
				css.remove(this.positionCheckBox.domNode, "hidden");
				css.remove(this.widgetSize.domNode, "hidden");
				css.remove(this.responsiveDiv, "hidden");
			}

			this.widgetSize.setModel(this.model);
			this.widgetSize.setValue(model);
			this.positionCheckBox.setValue(style.fixed);


			if (model.type !== 'Label' && model.type !== 'SVGBox' && model.type !== 'SVGPaths' && !isLogicWidget) {
				css.remove(this.boxShadowBackgroundDiv, "MatcToolbarSectionHidden")
				this.boxShadow.setValue(style.boxShadow);
				this.boxShadow.setBox(model)
				/**
				 * For Icons and IconToggles we use TextShadow and do not
				 * need insert and spread.
				 */
				this.boxShadow.setHasInsertAndSpread(model.type !== 'Icon' && model.type !== 'IconToggle')

				this.backdropFilter.setValue(style.backdropFilter)
			} else {

				/**
				 * TODO Make her box shadow visible?
				 */
			}


			if (model?.has?.backgroundImage){
				css.remove(this.imageWidgetDiv, "MatcToolbarSectionHidden")
				this.backgroundImage.setValue(style.backgroundImage);
				this.backgroundImage.setModel(this.model);
				this.backgroundImagePosition.setValue(model);
				this.imageFilter.setValue(style.filter)

				if (style.backgroundImage) {
					css.remove(this.imageWidgetDeatilsDiv, 'hidden')
				} else {
					css.add(this.imageWidgetDeatilsDiv, 'hidden')
				}
			}

			if(model?.has?.backgroundColor ){
				css.remove(this.backgroundColorDiv, "MatcToolbarSectionHidden");
				this.backgroundColor.setValue(style.background);
				this.backgroundColor.setModel(this.model)
				this.backgroundColor.setBox(model);
				this.backgroundColor.setWidgetViewMode(widgetViewMode)
			}

	
			if (this.hasRotate.indexOf(model.type) >= 0) {
				css.remove(this.imageWidgetRotateDiv, "MatcToolbarSectionHidden");
				this.backgroundImageRotation.setValue(style.backgroundImageRotation);
			} else {
				css.add(this.imageWidgetRotateDiv, "MatcToolbarSectionHidden");
				this.backgroundImageRotation.setValue(style.backgroundImageRotation);
			}

			if(model?.has?.label){
				css.remove(this.textDiv, "MatcToolbarSectionHidden");
				css.remove(this.textColorDiv, "MatcToolbarSectionHidden")

				this.textProperties.hasVerticalAlign(this.hasValign.indexOf(model.type) >= 0)
				this.textProperties.setModel(this.model)
				this.textProperties.setBox(model)
				this.textProperties.setWidgetViewMode(widgetViewMode)
				this.textProperties.setValue(style)

				this.color.setValue(style.color)
				this.color.setModel(this.model)
				this.color.setBox(model)
				this.color.setWidgetViewMode(widgetViewMode)
			} else {
				/**
				 * Since 5.0.0 icons etc will have a color to use design tokens
				 */
				css.remove(this.textColorDiv, "MatcToolbarSectionHidden")
				if (this.hasColor.indexOf(model.type) >=0) {
					this.color.setValue(style.color)
					this.color.setModel(this.model)
					this.color.setBox(model)
					this.color.setWidgetViewMode(widgetViewMode)
				}

			}

			if (this.hasPadding.indexOf(model.type) >=0) {
				css.remove(this.boxDiv, "MatcToolbarSectionHidden");
				this.paddingWidget.setValue(style);
				this.paddingWidget.setModel(this.model)
				this.paddingWidget.setBox(model)
				this.paddingWidget.setWidgetViewMode(widgetViewMode)
			}

			if (widgetViewMode == "style") {
				if (this.responsiveDiv) {
					css.remove(this.responsiveDiv, "MatcToolbarSectionHidden")
					this.responsiveWidget.setValue(model)
				}

				if (this.widgetAlignDiv){
					css.remove(this.widgetAlignDiv, "MatcToolbarSectionHidden");
				}

				if (this.hasData.indexOf(model.type) >=0 || model?.has?.data) {
					css.remove(this.dataDiv,"MatcToolbarSectionHidden" );
					this.dataWidget.setValue(model);
				}

				if (!isLogicWidget) {
					css.remove(this.widgetShapeDiv, "MatcToolbarSectionHidden");
					css.remove(this.widgetSizeDiv, "MatcToolbarSectionHidden")
				}
			} 
			
			if (widgetViewMode == "style"){
				this.showTemplateMarkers("", model.template)
			} else if (widgetViewMode == "error"){
				this.showTemplateMarkers(" (Error)", model.template)
			} else if (widgetViewMode == "active"){
				this.showTemplateMarkers(" (Active)", model.template)
			} else if (widgetViewMode == "hover"){
				this.showTemplateMarkers(" (Hover)", model.template)
			} else if (widgetViewMode == "focus"){
				this.showTemplateMarkers(" (Focus)", model.template)
			} 
			/**
			* Must come at last so radius container is visible...
			*/
			if (model?.has?.border){

				css.remove(this.borderDiv, "MatcToolbarSectionHidden");
				this.boxBorder.setValue(style);
				this.boxBorder.setBox(model)
				this.boxBorder.setWidgetViewMode(widgetViewMode)

				if (this.radiusBox){
					css.remove(this.radiusBox.domNode, "hidden");
					this.radiusBox.setValue(style);
				}

				if (this.boxBorder2){
					this.boxBorder2.setValue(style);
					this.boxBorder2.setBox(model)
					this.boxBorder2.setWidgetViewMode(widgetViewMode)
				}

			} else if (model?.has?.borderRadus || model?.has?.borderRadius){

				if (this.radiusBox){
					css.remove(this.radiusBox.domNode, "hidden");
					this.radiusBox.setValue(style);
				}

			} else {
				if (this.radiusBox) {
					css.add(this.radiusBox.domNode, "hidden");
				}
			}

		

			if(this.hasSVG.indexOf(model.type) >=0) {
				this.showSVGWidgetProperties(model)
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
				if(model.name){
					this.widgetName.value = model.name;
				} else {
					this.widgetName.value = "";
				}
				this.widgetName.blur();
			}
			css.remove(this.widgetNameDiv, "MatcToolbarSectionHidden");
			css.add(this.widgetSizeDiv, "MatcToolbarSectionHidden")
				

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
					widget.reOpenDropDown(null);
					/**
					* We have to call reposition after the render
					* to put the color box at the right place.
					*/
					setTimeout(() => {
						widget.updatePosition();
					}, 10);
				}
			}
		},


		blurWidgetProperties (){
			this.boxBorder.blur();
			this.widgetSize.blur();
		},

		/**
		* Gets the normal style and mixes in the view mode style (overwrites),
		* e.g. for error or so. Example:
		*
		*  - style: {a:1, b:2}
		*  - hover: {a:3}
		*  = {a:3, b:2}
		*
		* Update: For inherited widgets we delegate to the Layout.getInheritedStyle()
		* method.
		*
		*/
		getViewModeStyle (widget, widgetViewMode){
			if (widget && widget.parentWidget) {
				return this.getInheritedStyle(widget, widgetViewMode)
			}
			return ModelUtil.getViewModeStyle(widget,this.model,  widgetViewMode)
		},

		/** Not used */
		getStyleByMode (model, widgetViewMode) {
			if (model.template) {
				if (this.model.templates) {
					const t = this.model.templates[model.template];
					if (t && t[widgetViewMode]) {
						/**
						 * Merge in overwriten styles
						 */
						var merged = lang.clone(t[widgetViewMode]);
						if (model.style) {
							for (let key in model[widgetViewMode]) {
								merged[key] = model[widgetViewMode][key];
							}
						}
						return merged;
					}
				}
			}
			return model.style;
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

			if (this.widgetName) {
				if(model.name){
					this.widgetName.value = model.name;
				} else {
					this.widgetName.value = "";
				}
				this.widgetName.blur();
			}

			css.remove(this.widgetShapeDiv, "MatcToolbarSectionHidden");
			css.remove(this.inheritedWidgetDiv, "MatcToolbarSectionHidden");
		}

    },
    mounted () {
    }
}
</script>