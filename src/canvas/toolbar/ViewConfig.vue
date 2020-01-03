
<template>
     <div class="MatcToolbarDropDownButton MatcToolbarItem MatcToolbarViewConfig" 
        @mousedown.stop="showPopup" @mouseup.stop="">
         <div>
            <span class="mdi mdi-magnify"></span>
            <label class="MatcToolbarLabel"> {{zoomFactor}} %</label>
            <span class="caret" data-dojo-attach-point="caret"></span> 
         </div>
         <div class="MatcToolbarPopUp MatcToolbarPopUpOpen MatcToolbarViewConfigPopup" role="menu" v-if="hasPopup"  
            @mouseup.stop=""
            @mousedown.stop=""
            >
             <!--
             <div class="MatcToolbarPopUpArrowCntr">
                 <div class="MatcToolbarPopUpArrow"></div>
            </div>
            -->
             <div class="MatcToolbarViewConfigCntr">
                <div class=" MatcToolbarViewConfigCntrSpace">
                    <span class=" mdi mdi-minus" @mousedown.stop="onZoomMinus" @mouseup.stop="" @click.stop=""> 			
                    </span> 
                    <span class="MatcToolbarViewConfigZoomLabel" > 	
                        {{zoomFactor}} %
                    </span> 
                    <span class="mdi mdi-plus" @mousedown.stop="onZoomPlus" @mouseup.stop="" @click.stop=""> 			
                    </span> 
                </div>
                <div @mousedown="showGrid" class="MatcToolbarViewConfigCntrSpace">
                    <span class="MatcStatusButtom glyphicon glyphicon-th" style="vertical-align: middle;"></span> 
                    <span class="MatcStatusItemLabel" >Grid &amp; Columns</span> 
                </div>
                <div class="">
                    <CheckBox label="Layers" :value="hasLayers"  @change="onChangeLayer"/>
                </div>

                <div>
                    <CheckBox label="Lines" :value="hasLines"  @change="onChangeLines"/>
                </div>
                <div>
                    <CheckBox label="Distance" :value="hasDistance"  @change="onChangeDistance"/>
                </div>
                <div>
                    <CheckBox label="Ruler" :value="hasRuler"  @change="onChangeRuler"/>
                </div>
                <div>
                    <CheckBox label="Comments" :value="hasComments"  @change="onChangeComments"/>
                </div>
                
                <div>
                    <CheckBox label="Data" :value="hasData"  @change="onChangeData"/>
                </div>
            </div>
		</div>
	</div>
</template>
<script>

import lang from 'dojo/_base/lang'
import on from 'dojo/on'
import topic from 'dojo/topic'
import Logger from 'common/Logger'
import win from 'dojo/win'
import CheckBox from 'common/CheckBox'

export default {
    name: 'ViewConfig',
    mixins:[],
    props: ['value'],
    data: function () {
        return {
            hasPopup: false,
            zoomLevels: [0.05, 0.1, 0.25, 0.5, 0.75, 1.0, 2], 
            zoomLevelPos: 3, 
        }
    },
    computed: {
        zoomFactor () {
            if (this.value && this.value.zoom) {
                return Math.round(this.value.zoom * 100)
            }
            return '-'
        },
        hasLines () {
            if (this.value) {
                return this.value.renderLines
            }
            return true
        },
        hasDistance () {
            if (this.value) {
                return this.value.showDistance
            }
            return true
        },
        hasComments () {
            if (this.value) {
                return this.value.showComments
            }
            return true
        },
        hasRuler () {
             if (this.value) {
                return this.value.showRuler
            }
            return true
        },
        hasData () {
            if (this.value) {
                return this.value.hasDataView
            }
            return true
        },
        hasLayers () {
            if (this.value) {
                return this.value.layerListVisible
            }
            return false
        }
    },
    components: {
        'CheckBox': CheckBox
    },
    methods: {
        showGrid () {
            this.$emit('change', 'showGrid', this.$el)
        },

        onChangeLayer (value) {
            this.log.log(-1, 'onChangeLayer', 'enter', value)
            this.$emit('change', 'layerListVisible', value)
        },

        onChangeLines (value) {
            this.log.log(-1, 'onChangeLines', 'enter', value)
            this.$emit('change', 'renderLines', value)
        },

        onChangeDistance (value) {
            this.log.log(-1, 'onChangeDistance', 'enter', value)
            this.$emit('change', 'showDistance', value)
        },

        onChangeRuler (value) {
            this.log.log(-1, 'onChangeRuler', 'enter', value)
            this.$emit('change', 'showRuler', value)
        },

        onChangeComments (value) {
            this.log.log(-1, 'onChangeRuler', 'enter', value)
            this.$emit('change', 'showComments', value)
        },

        onChangeData (value) {
            this.log.log(-1, 'onChangeData', 'enter', value)
            this.$emit('change', 'hasDataView', value)
        },

        onZoomMinus () {
            this.log.log(-1, 'onZoomMinus', 'enter')
            if (this.zoomLevelPos >= 1){
                this.zoomLevelPos--;
                this.value.zoom = this.zoomLevels[this.zoomLevelPos];
                this.$emit('change', 'zoom', this.value.zoom)
            }
            return false
		},
		
		onZoomPlus (){
            this.log.log(-1, 'onZoomPlus', 'enter')
            if (this.zoomLevelPos < this.zoomLevels.length -1){
                this.zoomLevelPos++;
                this.value.zoom = this.zoomLevels[this.zoomLevelPos];
                this.$emit('change', 'zoom', this.value.zoom)
            }
            return false
        },

        showPopup () {
            this.hasPopup = true
            /**
             * this will force all other popups to close
             */
            topic.publish("matc/canvas/click", "", "");
            /**
             * the canvas can register to this to flush stuff
             */
            topic.publish("matc/toolbar/click", "");
                
            this._mouseDownListener = on(win.body(),"mousedown", lang.hitch(this,"hidePopup"));
        	this._topicListener = topic.subscribe("matc/canvas/click", lang.hitch(this,"onCanvasClick"));
			this._escListener = topic.subscribe("matc/canvas/esc", lang.hitch(this,"hidePopup"));
			this._dialogListner = topic.subscribe("vommond/dialog/open", lang.hitch(this,"hidePopup"));	
        },

        onCanvasClick () {
            // FIXME: This causes the popup to close if we have a selection or rerender ()
            //  console.debug('Hide', new Error().stack)
            this.hidePopup()
        },

        hidePopup () {
            this.hasPopup = false
            if(this._mouseDownListener){
                this._mouseDownListener.remove();
                delete this._mouseDownListener;
			}
			if(this._topicListener){
                this._topicListener.remove();
                delete this._topicListener;
			}
			if (this._escListener){
                this._escListener.remove()
                delete this._escListener;
            }
            if (this._dialogListner){
                this._dialogListner.remove();
                delete this._dialogListner;
            }
        }
    },
    watch: {
        value (v) {
            this.log.log(-1, 'watch(value)', 'enter', v)
            this.value = v
        }
    },
    mounted () {
        this.log = new Logger('ViewConfig')
    }
}
</script>