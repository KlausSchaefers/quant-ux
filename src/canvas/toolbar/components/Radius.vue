
<template>
     <div class="MatcToolbarRadius ">
		 <QIcon icon="BorderRadius"/>
		</div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import lang from 'dojo/_base/lang'
import on from 'dojo/on'
//import ToolbarSlider from './ToolbarSlider'
import InputDropDownButton from './InputDropDownButton'
import QIcon from 'page/QIcon'

export default {
    name: 'Radius',
    mixins:[DojoWidget],
    data: function () {
        return {
            value: false,
            borderRadius: ["borderTopLeftRadius", "borderTopRightRadius", "borderBottomLeftRadius", "borderBottomRightRadius"],
            inputEvent: "change"
        }
    },
    components: {
		'QIcon': QIcon
	},
    methods: {

		render  (){
			if(!this.rendered){
				this.radius = this.renderIntBox(this.domNode);
				this.own(on( this.radius, "change", lang.hitch(this,"setRadius", "borderTopLeftRadius")));
				this.own(on( this.radius, "changing", lang.hitch(this,"setTempRadius", "borderTopLeftRadius")));
				this.rendered = true;
			}
		},

		renderIntBox  (parent){
			const input = this.$new(InputDropDownButton);
			input.setOptions([0, 2, 3, 4, 8, 16, 32, 48, 64, 128]);
			input.reposition = true;
			input.placeAt(parent);
			//input.render();
			return input;
		},

		blur  (){
			if(this.radius){
				this.radius.blur()
			}
		},


		setTempRadius  (key, value){
			value = value * 1;
			this.value[key] = value;
			for(var i=0; i < 4; i++){
				var k = this.borderRadius[i];
				this.value[k] = value;
			}
			this.emit("changing", this.getDelta(this.value));
		},

		setRadius  (key, value){
			value = value * 1;
			this.value[key] = value;
			for(var i=0; i < 4; i++){
				var k = this.borderRadius[i];
				this.value[k] = value;
			}
			this.emit("change", this.getDelta(this.value));
		},



		update  (){

		},


		setValue  (v){
			this.render();
			/**
			 * Clone object as we toggle the value in the toogle()
			 * method and as consequence the command delta
			 * would be null!
			 */
			var clone = {};
			for(var i=0; i < 4; i++){
				var r = this.borderRadius[i];
				clone[r] = v[r];
			}
			this.value = clone;
			this.orginalValue = v;
			this.radius.setValue(clone.borderTopLeftRadius);
		},

		getDelta  (value){
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

		setModel  (m){
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