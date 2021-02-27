
<template>
     <div class="MatcBoxBorder2 MatcImageRotate">
		 <span class="MatcToolbarItem" style="vertical-align: middle;">
       <span class=" MatcToolbarItemIcon">
          <span class="mdi mdi-rotate-right" />
       </span>
     </span>
	</div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import on from 'dojo/on'
import ToolbarSlider from './ToolbarSlider'
import lang from 'dojo/_base/lang'

export default {
    name: 'Radius',
    mixins:[DojoWidget],
    data: function () {
        return {
            value: false,
            inputEvent: "change"
        }
    },
    components: {},
    methods: {
      render  (){
        if(!this.rendered){
          this.radius = this.renderIntBox(this.domNode);
          this.own(on( this.radius, "change", lang.hitch(this, 'setAngle')));
          this.own(on( this.radius, "changing", lang.hitch(this, 'setTempAngle')));
          this.rendered = true;
        }
      },

      renderIntBox  (parent){
        var input = this.$new(ToolbarSlider,{max:359});
        input.placeAt(parent);
        input.render();
        return input;
      },

      blur  (){
        if(this.radius){
          this.radius.blur()
        }
      },

      setAngle  (value) {
        this.value = value
        this.emit("change", value);
      },

      setTempAngle  (value){
        this.emit("changing", value);
      },

      setValue (v){
        if (v === undefined) {
          v = 0
        }
        this.radius.setValue(v);
      },


      setModel  (m){
        this.model = m;
      }
    },
    mounted () {
      this.render()
    }
}
</script>