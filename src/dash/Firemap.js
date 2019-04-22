
<template>
    
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import css from 'dojo/css'
import lang from 'dojo/_base/lang'
import window from 'dojo/window'
import on from 'dojo/on'
import touch from 'dojo/touch'
import ioQuery from 'dojo/ioQuery'
import Evented from 'dojo/Evented'
import dom-geometry from 'dojo/dom-geometry'
import _Color from 'common/_Color'
import Logger from 'common/Logger'
import Util from 'core/Util'
import RenderFactory from 'core/RenderFactory'
import _Heat from 'dash/_Heat'
import Preview from 'page/Preview'




export default {
    name: 'Firemap',
    mixins:[Preview, _Color, _Heat, DojoWidget],
    data: function () {
        return {
            mode: "click"
        }
    },
    components: {},
    methods: {
        postCreate: function(){
			this.logger = new Logger({className : "de.vommond.matc.dash.HeatMap"});
			this.logger.log(2,"postCreate","enter >" + this.mode);
			this.renderFactory = new RenderFactory();
			this.renderFactory.setMode("view");
		},
		
		/**
		 * array of events
		 */
		setValue:function(value){
			this.value = value;
		},
		
		
		/**
		 * Template methods for child widgets
		 */
		onScreenRendered:function(screen, div){
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
		    
		    
			if(this.value){
				this.renderHeatMap(this.value);
			}
		    
		    div.appendChild(cntr);
		},
		
		renderHeatMap:function(value){		
		
			if(this.mode == "click"){
				this._renderClickHeatMap(value);					
			} else if(this.mode == "visibility"){
				this._renderScrollHeatMap(value);
			} else if(this.mode=="duration"){
				this._renderScrollDuration(value);
			} else {
				console.warn("renderHeatMap() > Type '", this.mode, "' is not supported");
			}
			
			
		},
		
		_renderScrollDuration:function(value){
			this.logger.log(2,"_renderScrollDuration","enter" );

			var visibleScreenSize = this.model.screenSize.h;
			
			var dist = this.computeScrollDurationDistrubtion(value,visibleScreenSize, this._height);
		
			//this._max = dist.max;
			this.drawSections(dist);
			
			
			this.logger.log(0,"_renderScrollDuration","exit" );
		},	
		
		
		_renderScrollHeatMap:function(value){
			this.logger.log(2,"_renderScrollHeatMap","enter" );
			
			var visibleScreenSize = this.model.screenSize.h;
			
			var dist = this.computeScrollVisibiltyDistribution(value,visibleScreenSize, this._height);
			
			//this._max = dist.max;

			this.drawSections(dist);
			
			this.logger.log(2,"_renderScrollHeatMap","exit" );
		},
		
		
		
		_renderClickHeatMap:function(value){
			
			/**
			 * convert to [[x,y, value]]
			 */
			var dist = this.computeClickDistribution(value, this._width, this._height);
			this.draw(this._ctx, dist.values, dist.max, this._width, this._height);
		},
    }, 
    mounted () {
    }
}
</script>