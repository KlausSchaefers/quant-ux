// eslint-disable-next-line 
<template>
	<div class="VommondCheckBoxWrapper">
		<div class="VommondCheckBox">
			<span class="VommondCheckBoxHook" data-dojo-attach-point="hook">	
			</span>
		</div>
		<span class="VommondCheckBoxLabel" v-if="label">{{label}}</span>
	</div>
</template>

<style>
 @import '../../public/style/vommond.css';
</style>

<script>
import DojoWidget from 'dojo/DojoWidget'
import css from 'dojo/css'
import touch from 'dojo/touch'
import lang from 'dojo/_base/lang'
import on from 'dojo/on'
import Logger from 'common/Logger'

export default {
  name: 'CheckBox',
  mixins: [DojoWidget],
  data: function () {
    return {
      checked: false
    }
  },
  props: ['label', 'value'],
  components: {
  },
  methods: {	
		postCreate: function(){
			this.log = new Logger('CheckBox')
			this.own(on(this.domNode, touch.press, lang.hitch(this, "onChange")));
			if(this.value || this.value === "true"){
				this.setValue(true);
			}			
		},
		
		getValue:function(){
			return this.checked;
		},
		
		setValue:function(value){
			this.checked = value;
			if(value){
				css.add(this.domNode,"VommondCheckBoxChecked") ;
			} else {
				css.remove(this.domNode,"VommondCheckBoxChecked") ;
			}
		},
		
		setLabel:function(l){
			this.label = l
		},
		
		onChange:function(){
			this.setValue(!this.checked);
			this.emit("change", this.checked );
			this.emit("input", this.checked );
		}
  },
  watch: {
	  value (v) {
		  this.setValue(v)
	  }
  },
  mounted () {
      this.log.log(10, 'mounted', 'enter')
  }
}
</script>
