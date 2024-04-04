<script>
import css from 'dojo/css'
import * as DistributionUtil from 'core/DistributionUtil'

export default {
    name: 'Distribute',
    mixins:[],
    data: function () {
        return {
            resizeButtonSize: 3,
            prototypingButtonSize: 5,
            resizeBorder: 2,
            resizeEnabled: true
        }
    },
    components: {},
    methods: {

		/**********************************************************************
		 * Distribute Tool
		 **********************************************************************/

		onDistribute (){
			if (this._distributeEnabled){
				this.onDistributeEnd()
			} else {
				this.onDistributeStart();
			}
		},

		onDistributeStart () {
            const matrix = DistributionUtil.getDistributionMatrix(this.model, this.getMultiSelection(), false)
			this.logger.log(-3,"onDistributeStart", "enter", matrix);
			css.add(this.container, "MatcCanvasModeAlign");
            if (matrix.horizontal <= 1) {
                css.add(this.container, "MatcCanvasModeAlignNoVertical");
            }
            if (matrix.vertical <= 1) {
                css.add(this.container, "MatcCanvasModeAlignNoHorizontal");
            }
            this._distributeEnabled = true;
        },

        // renderDistrubutionHandler (icon) {

        //     var l = (this.resizeButtonSize *2) +1;

        //     var div = document.createElement("div");
        //     div.style.width = l + "px";
        //     div.style.height = l + "px";
        //     this._addSizeHandlerTouch(div)
        //     css.add(div, "MatcCutsomerHandler " + icon);
        //     // var listener = on(div,"mousedown", lang.hitch(this,"onCustomHandlerStart", widget, uiWidget, div, handler));

        //     this.dndContainer.appendChild(div);
        //     this.distibutionHandlers.push({
        //         div: div
        //         // handler: handler,
        //         // listener: listener,
        //         // widget: widget
        //     })
        // },

		onDistributeEnd (){
			this.logger.log(4, "onDistributeEnd", "enter");
			css.remove(this.container, "MatcCanvasModeAlign");
             css.remove(this.container, "MatcCanvasModeAlignNoVertical")
            css.remove(this.container, "MatcCanvasModeAlignNoHorizontal")
            this._distributeEnabled = false;
            this.cleanUpDistributionHandlers()
        },


        cleanUpDistributionHandlers () {
            if (this.distibutionHandlers) {
                let list = this.distibutionHandlers
                delete this.distibutionHandlers
				list.forEach(h => {
					var node = h.div
					var parent = node.parentNode;
					if(parent){
						parent.removeChild(node);
					}
					if (h.listener) {
						h.listener.remove()
					}
				})
            }

        }
    }
}
</script>