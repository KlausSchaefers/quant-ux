<script>
import lang from 'dojo/_base/lang'
import css from 'dojo/css'
import on from 'dojo/on'
import CheckBox from 'common/CheckBox'
import LayerList from 'canvas/toolbar/LayerList'

export default {
    name: 'Layer',
    methods: {
      initLayer (){
				this.logger.log(2,"initLayer", "entry");			
				try{	
					if(this.layerCheckCntr){
						this.layerCheckBox = this.$new(CheckBox);
						this.layerCheckBox.setLabel("Show Layers");
						this.layerCheckBox.setValue(this.showLayerList);
						this.layerCheckBox.placeAt(this.layerCheckCntr);
						this.own(on(this.layerCheckBox, "change", lang.hitch(this, "setLayerVisibility")));
						css.remove("appNode", "MatcLayerListVisible");
					}				
					if (this.getSettings().layerListVisible){
						this.layerCheckBox.setValue(true);
						this.buildLayerList()
					}
				} catch (e){
					console.debug(e)
				}	
			},
			
			setLayerVisibility (v){
				this.logger.log(-1,"setLayerVisibility", "enter", v);
				if (this.layerList){
					// this does not work.. should be done later with v-if
					// this.layerList.$destroy();
					//delete this.layerList
				}
				delete this.selectionListener;
				css.remove("CanvasNode", "MatcLayerListVisible");
				if (v){
					this.buildLayerList();
				} 
				this.setSettings({layerListVisible: v})
			},
			
			buildLayerList (){
				if (!this.layerList) {
					this.layerList = this.$new(LayerList);			
					if (this.toolbar && this.controller){
						this.layerList.setToolbar(this.toolbar);
						this.toolbar.setLayerList(this.layerList)
						this.layerList.setController(this.controller);
						this.layerList.setCanvas(this);
					} else {
						this.logger.log(-1,"buildLayerList", "no toolbar", this); // expect in init
					}
				}
				this.selectionListener = this.layerList;
				css.add("CanvasNode", "MatcLayerListVisible");
			},
			
			renderLayerList (model){
				if (this.layerList){
					this.layerList.render(model);
				}
			}
    }, 
    mounted () {
    }
}
</script>