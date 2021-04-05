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
					css.add(this.widgetSizeDiv, "MatcToolbarSectionHidden")
					if(model.name){
						this.widgetName.value = model.name;
					} else {
						this.widgetName.value = "";
					}
					this.widgetName.blur();
				}
				var isLogicWidget = this.hasLogic2.indexOf(model.type) >= 0;
				css.remove(this.lineDiv, "MatcToolbarSectionHidden");
				this.actionBTN.setValue(model, isLogicWidget);

				var widgetViewMode = this.widgetViewModeBtn.getValue();
				if (widgetViewMode == "style") {
					/**
					 * Show data binding etc in prototypiung mode
					 */
					if(this.hasValidation.indexOf(model.type) >= 0 || model.has.validation){
						css.remove(this.validationDiv,"MatcToolbarSectionHidden" );
						this.validationWidget.setValue(model, false);
					}
				}
			},

			showWidgetDesignProperties (model) {
				this.setWidgetViewModes(model);

				var widgetViewMode = this.widgetViewModeBtn.getValue();

				var style = this.getViewModeStyle(model, widgetViewMode);

				this.showProperties();
				this.showWidgetTools();
				this.showDesignTokenBtns(model, 'widget')

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

				this.widgetSize.setModel(this.model);
				this.widgetSize.setValue(model);
				this.positionCheckBox.setValue(style.fixed);


				if (model.type !== 'Label' && model.type !== 'SVGBox') {
					css.remove(this.boxShadowBackgroundDiv, "MatcToolbarSectionHidden")
					this.boxShadow.setValue(style.boxShadow);
					this.boxShadow.setBox(model)

					this.backdropFilter.setValue(style.backdropFilter)
				} else {

					/**
					 * TODO Make her box shadow visible?
					 */
				}


				this.opacity.setValue(style.opacity);

				if (model.has.backgroundImage){
					css.remove(this.imageWidgetDiv, "MatcToolbarSectionHidden")
					this.backgroundImage.setValue(style.backgroundImage);
					this.backgroundImage.setModel(this.model);
					this.backgroundImagePosition.setValue(model);
				}

				if(model.has.backgroundColor ){
					css.remove(this.backgroundColorDiv, "MatcToolbarSectionHidden");
					this.backgroundColor.setValue(style.background);
					this.backgroundColor.setModel(this.model)
					this.backgroundColor.setBox(model);
					this.backgroundColor.setWidgetViewMode(widgetViewMode)
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
					if(this.widgetAlignDiv){
						css.remove(this.widgetAlignDiv, "MatcToolbarSectionHidden");
					}


					if(this.hasData.indexOf(model.type) >=0 || model.has.data) {
						css.remove(this.dataDiv,"MatcToolbarSectionHidden" );
						this.dataWidget.setValue(model);
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

					/**
				 	* Since 4.0.0 we do not show the prototyping properties in the deisgn view
				 	*/
					//css.remove(this.lineDiv, "MatcToolbarSectionHidden");
					//this.actionBTN.setValue(model, isLogicWidget);

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
			}

    },
    mounted () {
    }
}
</script>