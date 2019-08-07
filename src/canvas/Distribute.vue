<script>
// import on from 'dojo/on'
// import lang from 'dojo/_base/lang'
// import domStyle from 'dojo/domStyle'
import css from 'dojo/css'
// import * as DistributionUtil from 'core/DistributionUtil'

export default {
    name: 'Distribute',
    mixins:[],
    data: function () {
        return {
            resizeButtonSize: 3, 
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
			this.logger.log(3,"onDistributeStart", "enter");
			css.add(this.container, "MatcCanvasModeAlign");
            this._distributeEnabled = true;
            // if (this._selectMulti){
            //    let lines = DistributionUtil.getLines(this.model, this._selectMulti)
            //    this.distibutionHandlers = []
            //    let xLines = lines.xLines
            //    for (let x in xLines) {
            //        console.debug('x', x)
            //        this.renderDistrubutionHandler()
            //    }
            // }
        },
        
        renderDistrubutionHandler (icon) {
            
            var l = (this.resizeButtonSize *2) +1;	
         
            var div = document.createElement("div");
            div.style.width = l + "px";
            div.style.height = l + "px";
            this._addSizeHandlerTouch(div)
            css.add(div, "MatcCutsomerHandler " + icon);
            // var listener = on(div,"mousedown", lang.hitch(this,"onCustomHandlerStart", widget, uiWidget, div, handler));

            this.widgetContainer.appendChild(div);
            this.distibutionHandlers.push({
                div: div
                // handler: handler,
                // listener: listener,
                // widget: widget
            })
        },
		
		onDistributeEnd (){
			this.logger.log(4, "onDistributeEnd", "enter");
			css.remove(this.container, "MatcCanvasModeAlign");
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