
<template>
     <div class="MatcBoxBorder2"></div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'

import lang from 'dojo/_base/lang'
import on from 'dojo/on'
import topic from 'dojo/topic'
import _Tooltip from 'common/_Tooltip'
import ToolbarSlider from './ToolbarSlider'
import ToolbarColor from './ToolbarColor'

export default {
    name: 'BoxBorder2',
    mixins:[_Tooltip, DojoWidget],
    data: function () {
        return {
            value: false,
            tab: "Width",
            isLocked: true,
            borderWidth: ["borderTopWidth","borderBottomWidth", "borderLeftWidth", "borderRightWidth" ],
            borderColor: ["borderTopColor", "borderBottomColor", "borderRightColor", "borderLeftColor"],
            colorWidgets: [],
            inputEvent: "change"
        }
    },
    components: {},
    methods: {
        postCreate: function(){
		},

		render:function(){
			if(!this.rendered){

				/**
				 * color
				 */
				this.color = this.renderColorBox(this.domNode);
				this.addTooltip(this.color.domNode, "Border Color");

				this.own(on( this.color, this.inputEvent, lang.hitch(this,"setColor", "borderTopColor", this.color)));
				this.own(on( this.color, "changing", lang.hitch(this,"setTempColor", "borderTopColor", this.color)));

				this.width = this.renderIntBox(this.domNode);
				this.own(on( this.width, "change", lang.hitch(this,"setWidth", "borderTopWidth")));
				this.own(on( this.width, "changing", lang.hitch(this,"setTempWidth", "borderTopWidth")));

				this.rendered = true;
			}
		},

		renderIntBox:function(parent){
			var input =  this.$new(ToolbarSlider, {max:50});
			input.placeAt(parent);
			input.render();
			return input;
		},

		renderColorBox:function(parent){
			var widget = this.$new(ToolbarColor, {hasPicker:true});
			//widget.updateBackground = true;
			widget.placeAt(parent);
			widget.keepOpenOnTypeSelection = "widget";
			widget.reposition = true;
			widget.updateLabel = true;
			widget.setLabel('<span class="MatcToolbarColorIndicator"></span>');
			if (this.model){
				widget.setModel(this.model);
			}
			if (this.colorWidgets){
				this.colorWidgets.push(widget);
			}
			return widget;
		},

		blur:function(){
			if(this.width){
				this.width.blur();
			}
		},



		setTempWidth (key, value){
			value = value * 1;
			this.value[key] = value;
			for(var i=0; i < 4; i++){
				var k = this.borderWidth[i];
				this.value[k] = value;
			}
			this.emit("changing", this.getDelta(this.value));
			this.closeColor();
		},

		setWidth (key, value){
			value = value * 1;
			this.value[key] = value;
			for(var i=0; i < 4; i++){
				var k = this.borderWidth[i];
				this.value[k] = value;
			}
			this.emit("change", this.getDelta(this.value));
			this.closeColor();
		},

		closeColor:function(){
			topic.publish("matc/canvas/click", "", "");
		},

		setColor:function(key, input, value){
			this.value[key] = value;
			for(var i=0; i < 4; i++){
				var k = this.borderColor[i];
				this.value[k] = value;
			}
			this.emit("change", this.getDelta(this.value));
		},

		setTempColor:function(key, input, value){
			this.value[key] = value;
			for(var i=0; i < 4; i++){
				var k = this.borderColor[i];
				this.value[k] = value;
			}
			this.emit("changing", this.getDelta(this.value));
		},


		update:function(){

		},


		setValue:function(v){
			this.render();
			/**
			 * Clone object as we toggle the value in the toogle()
			 * method and as consequence the command delta
			 * would be null!
			 */
			var clone = {};
			for(var i=0; i < 4; i++){
				var w = this.borderWidth[i];
				clone[w] = v[w];

				var c =this.borderColor[i];
				clone[c] = v[c];
			}
			this.value = clone;
			this.orginalValue = v;
			this.color.setValue(clone.borderTopColor);
			this.width.setValue(clone.borderTopWidth);
		},

		getDelta:function(value){
			var delta = {};
			for(var key in value){
				var o = this.orginalValue[key];
				var n = value[key];
				if(o != n){
					delta[key] = n;
				}
			}
			return delta;
		},

		setModel:function(m){
			if (this.color) {
				this.color.setModel(m);
			}
			this.model = m;
		}
    },
    mounted () {
    }
}
</script>