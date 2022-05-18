<script>
import DojoWidget from 'dojo/DojoWidget'
import css from 'dojo/css'
import lang from 'dojo/_base/lang'
import _Tooltip from 'common/_Tooltip'

export default {
    name: '_ShowGroup',
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
		showGroupProperties (model){
			this.logger.log(2,"showGroupProperties", "entry > ");
			this.showProperties();
			if (this.isDataView) {
				return this.showGroupDataProperties(model)
			}
			if (this.isDesignView) {
				this.showGroupDesignProperties(model)
			}
			if (this.isPrototypeView) {
				this.showGroupPrototypeProperties(model)
			}
		},

		showGroupPrototypeProperties (model) {

			if (model.name){
				this.groupName.value = model.name;
			} else {
				this.groupName.value = "";
			}
			this.groupName.blur();
			css.remove(this.groupNameDiv, "MatcToolbarSectionHidden");

			css.remove(this.groupActionDiv, "MatcToolbarSectionHidden");
			this.groupActionBTN.setValue(model);

			if (this.condStyleDiv) {
				css.remove(this.condStyleDiv, 'MatcToolbarSectionHidden')
			}
			
		},

		showGroupDesignProperties (model) {

			this.showDesignTokenBtns(model, 'group')

			if(this.widgetAlignDiv){
				css.remove(this.widgetAlignDiv, "MatcToolbarSectionHidden");
			}

			if (this.responsiveGroupDiv) {
				css.remove(this.responsiveGroupDiv, "MatcToolbarSectionHidden")
			}

			css.remove(this.groupNameDiv, "MatcToolbarSectionHidden");
			css.remove(this.childDiv,"MatcToolbarSectionHidden" );
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
				if (widget) {
					fixed = fixed && widget.style.fixed === true;
				}
			}

			if(this.screenExport && this.screenDownloadDiv) {
				css.remove(this.screenDownloadDiv, "MatcToolbarSectionHidden");
				this.screenExport.setWidgets(model.children);
			}
			this.groupPositionCheckBox.setValue(fixed);
		},

		showGroupDataProperties (model) {

			css.remove(this.groupNameDiv, "MatcToolbarSectionHidden");
			css.remove(this.lowCodeDiv, "MatcToolbarSectionHidden")
			css.remove(this.lowCodeResponsiveDiv, "MatcToolbarSectionHidden")

			this.groupActionBTN.setValue(model);
			this.groupName.value = model.name ? model.name : "";
			this.groupName.blur();
			this.lowCodeSection.setValue(model, true)
			this.lowCodeResponsiveSection.setValue(model, true)

		},

		showMultiProperties (model){

			this.showProperties();

			if(this.widgetAlignDiv){
				css.remove(this.widgetAlignDiv, "MatcToolbarSectionHidden");
			}

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
			this._showMultiVisualProperties(model);
		},

		_showMultiVisualProperties (ids){

			this.showDesignTokenBtns(ids, 'multi')

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
					//this.opacity.setValue(style.opacity);
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
					this.textProperties.setValue(style)
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
		}

    },
    mounted () {
    }
}
</script>