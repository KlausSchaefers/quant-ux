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

			if (this.groupName) {
				css.remove(this.groupNameDiv, "MatcToolbarSectionHidden");
				this.groupName.value = model.name ? model.name : "";
				this.groupName.blur();
			}
	
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

			css.remove(this.childDiv,"MatcToolbarSectionHidden" );
			this.responsiveGroupWidget.setValue(model)

			/**
			* Since 2.1.3 we have sub groups
			*/
			if (this.groupName){
				if(model.name){
					this.groupName.value = model.name;
				} else {
					this.groupName.value = "";
				}
				this.groupName.blur();
			}

			let fixed = true;
			const children = this.getAllGroupChildren(model)
			for(let i=0; i< children.length;i++){
				const id = children[i];
				const widget = this.model.widgets[id];
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
			css.remove(this.lowCodeDiv, "MatcToolbarSectionHidden")
			css.remove(this.lowCodeResponsiveDiv, "MatcToolbarSectionHidden")
			this.groupActionBTN.setValue(model);
			if (this.groupName) {
				css.remove(this.groupNameDiv, "MatcToolbarSectionHidden");
				this.groupName.value = model.name ? model.name : "";
				this.groupName.blur();
			}
	
			this.lowCodeSection.setValue(model, true)
			this.lowCodeResponsiveSection.setValue(model, true)
		},

		showMultiProperties (ids){

			this.showProperties();
			if(this.widgetAlignDiv){
				css.remove(this.widgetAlignDiv, "MatcToolbarSectionHidden");
			}
			if(ids.length > 2){
				this.showDistButtons(ids);
			}
			css.remove(this.childDiv,"MatcToolbarSectionHidden" );
			css.remove(this.multiPositionDiv, "MatcToolbarSectionHidden");

			let fixed = true;
			let wrap = true;
			for(let i=0; i< ids.length;i++){
				const id = ids[i];
				const widget = this.model.widgets[id];
				if(widget && widget.style){
					fixed = fixed && widget.style.fixed === true;
					wrap = wrap && widget.style.wrap === true;
				} else {
					console.warn("showMultiProperties() > No widget with id" , id)
				}

			}
			this.multiPositionCheckBox.setValue(fixed);
			this._showMultiVisualProperties(ids);
		},

		_showMultiVisualProperties (ids){

			this.showDesignTokenBtns(ids, 'multi')

			const widgetViewMode = "style";
			let style = null;
			const widgets = [];
			let hasLabel = true;
			let hasPadding = true;
			let hasBorder = true;
			let hasBackground = true;
			const hasColor = true
			let isAllSVG = true
			let resize = {		
				"right" : true,
				"up" : true,
				"left" : true,
				"down" : true,
				"fixedHorizontal" : true,
				"fixedVertical" : true					
			}
			for(let i=0; i< ids.length;i++){
				const id = ids[i];
				const widget = this.model.widgets[id];
				if(widget){
					widgets.push(widget);
					if(!style){
						style = this.getViewModeStyle(widget, widgetViewMode);
					}
					/**
					* Fill up missing values..
					*/
					if (style) {
						const widgetStyle = lang.clone(widget[widgetViewMode]);
						for(let key in widgetStyle){
							if(!style[key]){
								style[key] = widgetStyle[key];
							}
						}
					} else {
						console.erro('_showMultiVisualProperties() No style for widget', widget)
					}
					isAllSVG = widget.type === 'SVGPaths' && isAllSVG
					hasBackground = hasBackground && widget?.has?.backgroundColor
					hasPadding =  hasPadding && this.hasPadding.indexOf(widget.type) >=0
					hasBorder = hasBorder && widget?.has?.border
					hasLabel = hasLabel && widget?.has?.label

					if (widget?.props?.resize) {
						const r = widget?.props?.resize
						resize.right  = resize.right & r.right
						resize.up  = resize.up & r.up
						resize.left  = resize.left & r.left
						resize.down  = resize.down & r.down
						resize.fixedHorizontal  = resize.fixedHorizontal & r.fixedHorizontal
						resize.fixedVertical  = resize.fixedVertical & r.fixedVertical
					} else {
						resize.right = false
						resize.up  = false
						resize.left  = false
						resize.down  = false
						resize.fixedHorizontal = false
						resize.fixedVertical = false
					}
				}
	
			}


			if (isAllSVG) {
				this.showMultiSVGWidgetProperties(ids)
				return
			}

			
			if (this.responsiveDiv) {
				css.remove(this.responsiveDiv, "MatcToolbarSectionHidden")
				this.responsiveWidget.setValue({
					props: {
						resize: resize
					}
				})
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

				if(hasColor){
					css.remove(this.textColorDiv, "MatcToolbarSectionHidden")
					this.color.setValue(style.color)
					this.color.setModel(this.model)
					this.color.setBox(null)
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