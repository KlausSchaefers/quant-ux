<script>
import DojoWidget from 'dojo/DojoWidget'
import css from 'dojo/css'
import _Tooltip from 'common/_Tooltip'
import _ShowWidget from './_ShowWidget'
import _ShowGroup from './_ShowGroup'
import _ShowScreen from './_ShowScreen'
import _ShowCanvas from './_ShowCanvas'
import _ShowSVG from './_ShowSVG'


export default {
    name: '_Show',
    mixins:[_ShowWidget, _ShowGroup, _ShowScreen, _ShowCanvas, _ShowSVG, _Tooltip, DojoWidget],
    data: function () {
        return {
      }
	},
    components: {},
	computed: {
		isDataView () {
			return this.canvasViewMode === 'data'
		},
		isDesignView () {
			return this.canvasViewMode === 'design'
		},
		isPrototypeView () {
			return this.canvasViewMode === 'prototype'
		},
		isSVGPathsSelection () {
			return this._selection === 'svgPaths'
		}
	},
    methods: {

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
		* Twemplate properties
		****************************************************************************************************/

		showTemplate (widget){
			css.remove(this.templateDiv, "MatcToolbarSectionHidden");
			const btn = this.$refs.templateBTN
			btn.setWidget(widget)
		},

		showTemplateMerge () {

		},


		showTemplateMarkers (lbl){
			css.add(this.domNode, "MatcToolbarTemplateMarkerVisible");
			if(this.templateMarkers){
				for(let i=0; i< this.templateMarkers.length; i++){
					this.templateMarkers[i].innerText=lbl;
				}
			}
		},

		/*****************************************************************************************************
		* tool properties
		****************************************************************************************************/

		showScreenTools () {
			css.remove(this.toolsCntrDiv, "MatcToolbarSectionHidden");
			css.remove(this.distributeBtn, "hidden");
		},

		showTools (){

			css.remove(this.toolsDiv, "MatcToolbarSectionHidden");
			css.remove(this.toolsCntrDiv, "MatcToolbarSectionHidden");
			
			css.remove(this.replicateBtn, "hidden");

			if (this._selectedMulti || this._selectedGroup ) {
				css.remove(this.groupDIV, "MatcToolbarSectionHidden");
				css.remove(this.distributeBtn, "hidden");
				if(this._selectedGroup){
					css.add(this.groupBTN, "hidden");
					css.remove(this.ungroupBTN, "hidden");
				} else {
					css.remove(this.groupBTN, "hidden");
					css.add(this.ungroupBTN, "hidden");
				}
			} else {
				css.add(this.distributeBtn, "hidden");
				css.add(this.groupDIV, "MatcToolbarSectionHidden");
			}
		},

		/*****************************************************************************************************
		* Tools properties
		****************************************************************************************************/

		hideTools (){
			css.add(this.toolsDiv, "MatcToolbarSectionHidden");
		},

		showDevTools () {
			if (this.isDeveloperMode) {
				css.remove(this.developerDiv, "MatcToolbarSectionHidden");
			}
		},

		showCopyPaste (){
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

		hideWidgetTools (){
			css.add(this.toolsCntrDiv,"MatcToolbarSectionHidden");
		},


		showWidgetTools (){
			css.remove(this.toolsCntrDiv,"MatcToolbarSectionHidden");
		},


		hideDisButtons (){
			this.alignmentBtn.hideDistribution()
		},

		showDistButtons (ids){
			this.alignmentBtn.showDistribution(ids)		
		},

		hideCopyPaste (){
			this.logger.log(3,"hideCopyPaste", "entry");		
			css.add(this.copyBtn, "MatcToolbarItemDisbaled");
			if(this.canvas && !this.canvas.hasCopy()){
				css.add(this.pasteBtn, "MatcToolbarItemDisbaled");
			}
			css.add(this.deleteBtn, "MatcToolbarItemDisbaled");
			css.add(this.copyStyleBtn, "MatcToolbarItemDisbaled");
			this.logger.log(3,"hideCopyPaste", "exit");
		},

		hideNotNeededButtons (){
			this.logger.log(3,"hideNotNeededButtons", "entry");
	

			try{
				if (this.model && this.model.screens) {					
					const screenCount = this.getObjectLength(this.model.screens);
					this.hasScreens = screenCount > 0
					if(screenCount > 0) {					
						//this._removeCss(this.layerListCntr, "MatcToolbarSectionHidden");
					} else {
						//this._addCss(this.layerListCntr, "MatcToolbarSectionHidden");
					}
				} else {
					this.logger.error('hideNotNeededButtons', 'No screens', this.model)
					this.logger.sendError(new Error('hideNotNeededButtons() no screens'));
				}
			} catch(e ){
				this.logger.sendError(e);
			}

		},

		_removeCss (node, cls){
			if(node){
				css.remove(node, cls);
			} else {
				var e = new Error("_removeCss() > Node is null");
				this.logger.sendError(e);
			}
		},

		_addCss (node, cls){
			if (node){
				css.add(node, cls);
			} else {
				var e = new Error("_addCss() > Node is null");
				this.logger.sendError(e);
			}
		},

		hideAllSections (){
			this.logger.log(2,"hideAllSections", "entry");

			this.hideProperties();
			this.hideWidgetTools();

			if(this.screenDIV){
				css.add(this.screenDIV, "MatcToolbarSectionHidden");
			}
			css.add(this.screenShapeDiv, "MatcToolbarSectionHidden")
			css.add(this.screenNameDiv, "MatcToolbarSectionHidden");
			css.add(this.screenBackDiv, "MatcToolbarSectionHidden");
			css.add(this.screenParentsDiv, "MatcToolbarSectionHidden");
			css.add(this.screenDownloadDiv, "MatcToolbarSectionHidden");
			css.add(this.screenDownLoad.domNode, "MatcHidden")
			css.add(this.screenImageDiv, "MatcToolbarSectionHidden")

			if(this.screenActionDiv){
				css.add(this.screenActionDiv, "MatcToolbarSectionHidden");
			}
			if(this.screenAnimationDiv){
				css.add(this.screenAnimationDiv,"MatcToolbarSectionHidden" );
			}

			if (this.rulerSectionDIV) {
				css.add(this.rulerSectionDIV, "MatcToolbarSectionHidden");
			}

			css.add(this.tooltipDiv, "MatcToolbarSectionHidden");
			css.add(this.developerDiv, "MatcToolbarSectionHidden");
			css.add(this.templateDiv, "MatcToolbarSectionHidden");
			css.add(this.multiPositionDiv, "MatcToolbarSectionHidden");
			css.add(this.textDiv, "MatcToolbarSectionHidden");
			css.add(this.textColorDiv, "MatcToolbarSectionHidden")
			css.add(this.borderDiv, "MatcToolbarSectionHidden");
			css.add(this.boxDiv, "MatcToolbarSectionHidden");
			css.add(this.childDiv,"MatcToolbarSectionHidden" );
			css.add(this.inheritedWidgetDiv, "MatcToolbarSectionHidden");
			css.add(this.dataDiv,"MatcToolbarSectionHidden" );
			css.add(this.validationDiv, "MatcToolbarSectionHidden");
			css.add(this.backgroundColorDiv, "MatcToolbarSectionHidden");
			css.add(this.designTokenDiv, "MatcToolbarSectionHidden")
			css.add(this.designTokenDownloadDiv, "MatcToolbarSectionHidden")
			css.add(this.imageWidgetDiv, "MatcToolbarSectionHidden")

			css.add(this.lowCodeDiv, "MatcToolbarSectionHidden")
			css.add(this.callBackDiv, "MatcToolbarSectionHidden")
			css.add(this.lowCodeResponsiveDiv, "MatcToolbarSectionHidden")

			if (this.boxShadowBackgroundDiv) {
				css.add(this.boxShadowBackgroundDiv, "MatcToolbarSectionHidden")
			}
			if (this.responsiveDiv){
				css.add(this.responsiveDiv, "MatcToolbarSectionHidden")
			}
			if (this.responsiveGroupDiv) {
				css.add(this.responsiveGroupDiv, "MatcToolbarSectionHidden")
			}
			if(this.widgetAlignDiv){
				css.add(this.widgetAlignDiv, "MatcToolbarSectionHidden");
			}

			if (this.condStyleDiv) {
				css.add(this.condStyleDiv, 'MatcToolbarSectionHidden')
			}
		
			css.add(this.lineDiv,"MatcToolbarSectionHidden" );
			css.add(this.toolsDiv, "MatcToolbarSectionHidden");
			css.add(this.widgetNameDiv, "MatcToolbarSectionHidden");
			css.add(this.widgetShapeDiv, "MatcToolbarSectionHidden")
			css.add(this.groupDIV, "MatcToolbarSectionHidden");
			css.add(this.groupNameDiv, "MatcToolbarSectionHidden");
			css.add(this.groupActionDiv, "MatcToolbarSectionHidden");
			css.add(this.widgetViewSection, "MatcToolbarSectionHidden");

			css.add(this.svgButtonDiv, 'MatcToolbarSectionHidden')
			css.add(this.svgBoxDiv, "MatcToolbarSectionHidden")
			css.add(this.svgStrokeDiv, "MatcToolbarSectionHidden")
			css.add(this.svgFillDiv, "MatcToolbarSectionHidden")
			css.add(this.svgTransformDiv, "MatcToolbarSectionHidden")

			css.remove(this.domNode, "MatcToolbarTemplateMarkerVisible");
			this.hideDisButtons();

			this.logger.log(3,"hideAllSections", "exit");
		},


		showRemoveButton (callback){
			console.warn('DEPRECATED > showRemoveButton')
			this._removeBTN = this.createToolBarItem('<span class="mdi mdi-trash-can-outline"></span>', callback, "MatcToolbarItemRemove");
		},

		showDesignTokenBtns (selection, type) {
			var widgetViewMode = this.widgetViewModeBtn.getValue();
			this.designTokenBtns.forEach(btn => {
				btn.setModel(this.model)
				btn.setWidgetViewMode(widgetViewMode)

				if (type === 'widget') {
					btn.setWidget(selection)
				}
				if (type === 'screen') {
					btn.setScreen(selection)
				}
				if (type === 'multi' || type === 'group') {
					btn.setMulti(selection)
				}

			})
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