<script>
import css from 'dojo/css'
import LayerList from 'canvas/toolbar/LayerList'

export default {
    name: 'Layer',
	data: function () {
        return {
			layerListWidth: 256,
        }
    },
    methods: {
    	initLayer (){
			this.logger.log(2,"initLayer", "entry");
			const w = localStorage.getItem('quxLayerListWidth')
			if (w && !isNaN(w * 1)) {
				this.setLayerListWidth( w * 1)				
			}
			try{
				if (this.getSettings().layerListVisible){
					this.buildLayerList()
					this.setLayerListScrollBar(true)
				}
			} catch (e){
				console.debug(e)
			}
		},

		setLayerListWidth(w) {
			this.layerListWidth = w
			if (this.toolbar) {
				this.toolbar.setLayerListWidth(w)
			} else {
				console.debug('No toolbar')
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
				this.layerList = this.$new(LayerList, {layerListWidth: this.layerListWidth});
				if (this.toolbar && this.controller){
					this.layerList.setToolbar(this.toolbar);
					this.toolbar.setLayerList(this.layerList)
					this.layerList.setController(this.controller);
					this.layerList.setCanvas(this);
					this.layerList.on("onWidthChange", width => this.onChangeLayerListWidth(width))
				} else {
					this.logger.log(-1,"buildLayerList", "no toolbar", this); // expect in init
				}
			}
			this.selectionListener = this.layerList;
			css.add("CanvasNode", "MatcLayerListVisible");
		},

		onChangeLayerListWidth(width) {
			this.logger.log(2,"onChangeLayerListWidth", "enter", width); // expect in init
			localStorage.setItem('quxLayerListWidth', this.layerListWidth)
			this.setLayerListWidth(width)	
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