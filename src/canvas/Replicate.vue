<script>

import css from 'dojo/css'

export default {
    name: 'Replicate',
    mixins:[],
    data: function () {

      return {
      }
    },
    components: {},
    methods: {

		/**********************************************************************
		 * Replicate Tool
		 **********************************************************************/

      onReplicate (){
        this.logger.log(0,"onReplicate", "enter");

        // toggle between states
        if (!this._resizeDnDEndHandler){
          this._resizeDnDMoveHandler = "onReplicateDnDMove";
          this._resizeDnDEndHandler = "onReplicateDnDEnd";
          css.add(this.container, "MatcCanvasModeReplicate");

          this._selectCloneIds = []
          if (this._selectGroup){
            this._selectCloneIds = this._selectGroup.children
          }
          if (this._selectWidget){
            this._selectCloneIds.push(this._selectWidget.id)
          }
          if (this._selectMulti){
            this._selectCloneIds = this._selectMulti;
          }

        } else {
          delete this._resizeDnDMoveHandler;
          delete this._resizeDnDEndHandler;
          css.remove(this.container, "MatcCanvasModeReplicate");
        }

      },

      onReplicateDnDMove (modelType, e){

        /**
         * get the position of the placeholder
         */
        try {
          var pos = this._getSizePos(e);
          this._resizeCopyJobs = this.getClones(this._selectCloneIds, pos).previews;
          this._resizeRenderJobsHandlerPos = pos;

          /**
           * now request rendering
           */
          if(!window.requestAnimationFrame){
            console.warn("No requestAnimationFrame()");
            this._replicateDndUpDateUI();
          } else {
            requestAnimationFrame(() => {
              this._replicateDndUpDateUI()
            });
          }
        } catch (e){
          console.error(e)
        }
        //console.debug('onReplicateDnDMove() exit')
      },

      onReplicateDnDEnd (modelType, e){
        this.logger.log(0,"onReplicateDnDEnd", "enter");

        /**
         * Create models
         */
        var pos = this._getSizePos(e);
        var cloneIDs = this.getController().replicateWidgets(this._selectCloneIds, pos, this._selectGroup);

        /**
         * Select everything
         */
        var selection = cloneIDs.widgets.concat(this._selectCloneIds);
        this.onMutliSelected(selection)
        this.onResizeDnDCleanUp();
        this.renderSelection();
      },


      _replicateDndUpDateUI () {
        if(!this._resizeCopyJobs){
          /**
           * Because of some weird reason this is since the introduction
           * of the some times null. Dunno why this did not happen earlier.
           */
          // this.onResizeDnDCleanUp();
          return;
        }

        // remove old stuff
        this.cleanUpReplicate();

        // render place holders
        this._resizeCopyJobsDivs = [];
        for(var i=0; i < this._resizeCopyJobs.length; i++){
          var job = this._resizeCopyJobs[i];
          var div = this.createBox(job);
          css.add(div, "MatcBoxPlaceHolder");
          this.widgetContainer.appendChild(div);
          this._resizeCopyJobsDivs.push(div);
        }
        delete this._resizeCopyJobs;

        /**
         * now update all handlers
         */
        if(this._resizeRenderJobsHandlerPos){
          this._updateResizeHandlers(this._resizeRenderJobsHandlerPos);
        }

        console.debug('_replicateDndUpDateUI() > exit')
      },

      cleanUpReplicate (){
        //this.logger.log(0,"cleanUpReplicate", "enter");
        if (this._resizeCopyJobsDivs) {
          for(var i=0; i< this._resizeCopyJobsDivs.length; i++){
            var div = this._resizeCopyJobsDivs[i]
            if (div.parentNode){
              div.parentNode.removeChild(div);
            }
          }
        }
      }



		}

}
</script>