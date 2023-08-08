<script>
import DojoWidget from 'dojo/DojoWidget'
import css from 'dojo/css'
import _Tooltip from 'common/_Tooltip'

export default {
    name: '_Tools',
    mixins:[_Tooltip, DojoWidget],
    data: function () {
      return {
      }
	  },
    components: {},
    methods: {

			addDesignToken (e) {
				this.stopEvent(e)
				console.debug('addDesignToken')
			},

			toolCopyPasteStyleStart (){
				css.add(this.copyStyleBtn,"MatcToolbarItemActive");
			},

			toolCopyPasteStyleEnd (){
				css.remove(this.copyStyleBtn,"MatcToolbarItemActive");
			},

			toolAlignStart (){
				this.toolAlignEnd();
			},		

			toolAlignEnd (){		
			},

			toolUpdateWidgetButton (){
				this.createBTN.highlight();
			},

			toolNewLine (e){
				var screens = [];
				for(var id in this.model.screens){
					screens.push(this.model.screens[id]);
				}
				this.onNewLine(e)
			},

			toolNewTransformLine (e){
				this.onNewTransformLine(e);
			},

			showAnimationDialog:function(type, e){
				this._showAnimationComposer(this._selectedScreen, type, e.target);
			},

			showAdvancedAnimationDialog:function(line){
				var screen = this.model.screens[line.to];
				if (screen) {
					this._showAnimationComposer(screen, "ScreenLoaded");
				} else {
					console.debug("showAdvancedAnimationDialog() > No Screen for ", line);
				}
			}

    },
    mounted () {
    }
}
</script>