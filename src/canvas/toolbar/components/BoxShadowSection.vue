
<template>
    <div class="MatcBoxShadowSection" @keydown.stop="" @keypress.stop="" @keyup.stop="">

         <ToolbarColor
            v-if="model"
            :app="model"
            :color="value.c"
            @changing="setTempShadowColor"
            @change="setShadowColor"/>
          <div class="MatcToolbarItem MatcBoxShadowSectionDetails" v-if="hasShadow">
            <div class="MatcBoxShadowSectionRow">
              <span class="MatcBoxSizeLabel">X:</span>
              <input v-model="value.h" class="MatcBoxShadowInput MatcToobarInput" />
              <span class="MatcBoxSizeLabel">Y:</span>
              <input v-model="value.v" class="MatcBoxShadowInput MatcToobarInput" />
            </div>
            <div class="MatcBoxShadowSectionRow">
              <span class="MatcBoxSizeLabel">B:</span>
              <input v-model="value.b" class="MatcBoxShadowInput MatcToobarInput" />
              <span class="MatcBoxSizeLabel">S:</span>
              <input v-model="value.s" class="MatcBoxShadowInput MatcToobarInput" />
            </div>
          </div>
	</div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'

import lang from 'dojo/_base/lang'
import _DropDown from './_DropDown'
import _Color from 'common/_Color'

import ToolbarColor from './ToolbarColor'
export default {
    name: 'BoxShadowSection',
    mixins:[_Color, DojoWidget, _DropDown],
    data: function () {
        return {
            model: {},
            value: {
              v: 0,
              h: 0,
              b: 0,
              s: 0,
              c: 'transparent'
            }
        }
    },
    components: {
      'ToolbarColor': ToolbarColor
    },
    computed: {
      hasShadow () {
        console.debug('has', this.value)
        return this.value.c !== 'transparent'
      }
    },
    methods: {
      postCreate (){

			},

      setShadowColor (c) {
        console.debug('setShadowColor()', c)
        this.value.c = c
      },

      setTempShadowColor (e) {
        console.debug('setShadowColor', e)
      },



			_removeBoxShadow (e){
				this.stopEvent(e);
				this.onChange(null);
			},

			_selectBoxShadow (h,v,b,c, e){
				this.stopEvent(e);
				var boxShadow = {
					v:v,
					h:h,
					b:10,
					s:2,
					c:c
				};
				this.onChange(boxShadow);
			},


			setValue (v){
        console.debug('setValue', v)
				if (v){
					this.value = lang.clone(v);
					this.color = this.value.c;
				} else {
          this.value = {
              v: 0,
              h: 0,
              b: 0,
              s: 0,
              c: 'transparent'
            }
        }
			},

			setModel (m) {
				this.model = m
			},

			setBox (b){
				this.box = b
			}
    },
    mounted () {
    }
}
</script>