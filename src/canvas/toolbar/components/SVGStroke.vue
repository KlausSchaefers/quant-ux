
<template>
	  <div class="MatcDesignTokenMixin">
			<div class="MatcBoxBorder2" v-show="!hasDesignToken" ref="cntr"></div>
		</div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'

import lang from 'dojo/_base/lang'
import on from 'dojo/on'
import topic from 'dojo/topic'
import _Tooltip from 'common/_Tooltip'
import ToolbarSlider from './ToolbarSlider'
import ToolbarColor from './ToolbarColor'
import _DesignToken from './_DesignToken'

export default {
    name: 'BoxBorder2',
    mixins:[_Tooltip, _DesignToken, DojoWidget],
    data: function () {
        return {
            width: 1,
            color: '#333',
            colorWidgets: [],
            inputEvent: "change"
        }
    },
    components: {		
	},
    methods: {

        render (){
            if(!this.rendered){
                let cntr = this.$refs.cntr
                this.colorPicker = this.renderColorBox(cntr);
                this.addTooltip(this.colorPicker.domNode, "Stroke Color");

                this.own(on( this.colorPicker, this.inputEvent, lang.hitch(this,"setColor")));
                this.own(on( this.colorPicker, "changing", lang.hitch(this,"setTempColor")));

                this.widthSlider = this.renderIntBox(cntr);
                this.own(on( this.widthSlider, "change", lang.hitch(this,"setWidth")));
                this.own(on( this.widthSlider, "changing", lang.hitch(this,"setTempWidth")));

                this.rendered = true;
            }
        },

        renderIntBox (parent){
            const input =  this.$new(ToolbarSlider, {max:16});
            input.placeAt(parent);
            input.render();
            return input;
        },

        renderColorBox (parent){
            const widget = this.$new(ToolbarColor, {hasPicker:true});
            widget.placeAt(parent);
            widget.keepOpenOnTypeSelection = "widget";
            widget.reposition = true;
            widget.updateLabel = true;
            widget.setLabel();
            if (this.model){
                widget.setModel(this.model);
            }
            if (this.colorWidgets){
                this.colorWidgets.push(widget);
            }
            return widget;
        },

        blur (){
            if(this.width){
                this.width.blur();
            }
        },

        setTempWidth (value){
            this.width = value
            this.emit("changing", "strokeWidth", this.width);
            this.closeColor();
        },

        setWidth (value){
            this.width = value
            this.emit("change", "strokeWidth", this.width);
            this.closeColor();
        },

        closeColor (){
            topic.publish("matc/canvas/click", "", "");
        },

        setColor (value){
            this.color = value
            this.emit("change", 'stroke', this.color);
        },

        setTempColor (value){
            this.color = value
            this.emit("changing", 'stroke', this.color);
        },

        setValue (path){
            this.render();
            this.color = path.stroke
            this.width = path.strokeWidth
            this.colorPicker.setValue(this.color);
            this.widthSlider.setValue(this.width);
        },

        setModel (m){
            if (this.colorPicker) {
                this.colorPicker.setModel(m);
            }
            this.model = m;
        }
    },
    mounted () {
    }
}
</script>