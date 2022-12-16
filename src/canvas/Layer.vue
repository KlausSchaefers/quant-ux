<script>
import css from 'dojo/css'
import LayerList from 'canvas/toolbar/LayerList'

export default {
    name: 'Layer',
    methods: {
    	initLayer (){
			this.logger.log(2,"initLayer", "entry");
			try{
				if (this.getSettings().layerListVisible){
					this.buildLayerList()
					this.setLayerListScrollBar(true)
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

			this.setLayerListScrollBar(v)

			this.setSettings({layerListVisible: v})
		},

		setLayerListScrollBar(v) {
		
			if (v) {
				css.add(this.scrollBottom, "MatcCanvasScrollBarBottomLayerList");
			} else {
				css.add(this.scrollBottom, "MatcCanvasScrollBarBottomLayerList");
			}
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
				requestAnimationFrame(() => {
					this.layerList.render(model);
				})
			}
		}
    },
    mounted () {
    }
}
</script>