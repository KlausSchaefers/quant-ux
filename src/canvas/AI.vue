<script>

//import topic from 'dojo/topic'

export default {
    name: 'AIEditor',
    mixins:[],
    data: function () {
        return {
        }
    },
    components: {},
    computed: {
      
	},
    methods: {
        openAIEditor () {
            this.logger.log(-1, 'openAIEditor')

            this.setMode('edit');
            const pos = this.getLastMousePos()
            if (!pos) {
                return
            }
            this.$refs.aiEditor.show(this.getLastMousePos())
            this.$refs.aiEditor.setModel(this.sourceModel)
            
            //this._aiCanvasClickListener = topic.subscribe("matc/canvas/click", () => this.endAI());
       
    
            this.setCanvasBackgroundClickCallback('endAI')
            this.setCanvasCancelCallback('endAI')
            this.setCanvasModeListener('endAI')
            this.setZoomListener('endAI')
        },

        endAI() {
            this.logger.log(-1, 'endAI')
            //console.trace()
            this.$refs.aiEditor.close()
            this.cleanUpCancelCallbacks()
            this.clearCanvasModeListener()
            this.clearCanvasBackgroundClickCallback()
            this.clearZoomListener()
            this.setMode("edit");
            if (this._aiCanvasClickListener) {
                this._aiCanvasClickListener.remove()
            }
        },

        showAiSettings (e) {
            if (this.toolbar) {
				this.toolbar.showAISettings(e)
			}
        },
      
    },
    mounted () {
    }
}
</script>