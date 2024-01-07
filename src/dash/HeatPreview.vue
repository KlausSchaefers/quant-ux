
<template>
  <div class="MatcSimulator MatcPreview"></div>
</template>
<script>

import Preview from 'page/Preview'
import Heat from 'dash/Heat'
import css from "dojo/css";
import domGeom from "dojo/domGeom";

export default {
  name: "HeatPreview",
  mixins: [Heat, Preview],
  data: function() {
    return {
    };
  },
  components: {},
  methods: {
    setEvents (events) {
        this.logger.log(1, "setEvents", "enter > " + events.length);
        this.value = events
    },
    /**
     * Template methods for child widgets
     */
    onScreenRendered(screen, div){
        this.logger.log(2,"onScreenRendered","enter > " + screen.id + " > ");
                        
        var domPos = domGeom.position(this.domNode); // div?
        if(this.model.type =="smartphone" || this.model.type =="tablet"){
            this.defaultRadius = domPos.w / 20;
            this.defaultBlur = domPos.w / 15;
        } else {			
            this.defaultRadius = domPos.w / 120;
            this.defaultBlur = domPos.w / 100;
        }
        this.logger.log(2,"onScreenRendered","adjust radios to " +this.defaultRadius);
        
                
        var cntr = document.createElement("div");
        css.add(cntr, "MatcHeapMapContainer");
        
        /**
         * create canvas
         */
        this._canvas = document.createElement("canvas");
        this._canvas.height = screen.h;
        this._canvas.width = screen.w;
        cntr.appendChild(this._canvas);
        this._width = screen.w;
        this._height = screen.h;
        
        this._ctx = this._canvas.getContext('2d');
        
        
        if (this.value) {
            this.renderHeatMap(this.value);
        } else{
            console.debug('NO Value')
        }
   
        div.appendChild(cntr);
    },
    
    renderHeatMap(value){		
        var dist = this.computeClickDistribution(value, this._width, this._height);
        this.draw(this._ctx, dist.values, dist.max, this._width, this._height);
    }
  },
  mounted() {}
};
</script>