
<template>
    <div class="MatcToolbarDropDownButton MatcToolbarItem">
			<div type="button" ref="button">
				<span data-dojo-attach-point="lbl" class="MatcToolbarBorder MatcToolbarItemIcon"></span>
				<span class="caret"></span>
			</div>
			<div class="MatcToolbarPopUp" role="menu" data-dojo-attach-point="popup">
					<div data-dojo-attach-point="top" class="MatcToolbarDropDownButtonItem"><span class="MatcToolbarBorder MatcToolbarBorderTop"></span></div>
					<div data-dojo-attach-point="bottom" class="MatcToolbarDropDownButtonItem"><span class="MatcToolbarBorder MatcToolbarBorderBottom"></span></div>
					<div data-dojo-attach-point="left" class="MatcToolbarDropDownButtonItem"><span class="MatcToolbarBorder MatcToolbarBorderLeft"></span></div>
					<div data-dojo-attach-point="right" class="MatcToolbarDropDownButtonItem"><span class="MatcToolbarBorder MatcToolbarBorderRight"></span></div>
			</div>
	</div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import css from 'dojo/css'
import lang from 'dojo/_base/lang'
import on from 'dojo/on'
import touch from 'dojo/touch'
import _DropDown from './_DropDown'
export default {
    name: 'ToolbarBorder',
    mixins:[DojoWidget, _DropDown],
    data: function () {
        return {
            value: false
        }
    },
    components: {},
    methods: {
        init:function(){
			this.own(on(this.top, touch.press, lang.hitch(this, "_toggleValue", "borderTop")));
			this.own(on(this.bottom, touch.press, lang.hitch(this, "_toggleValue", "borderBottom")));
			this.own(on(this.left, touch.press, lang.hitch(this, "_toggleValue", "borderLeft")));
			this.own(on(this.right, touch.press, lang.hitch(this, "_toggleValue", "borderRight")));
		},

		_toggleValue:function(key, e){
			this.stopEvent(e);

			if(this._value[key]){
				this._value[key] = false;
			} else {
				this._value[key] = true;
			}

			this.setValue(this._value);

			var v = {};
			v[key] = this._value[key];

			this.emit("change", v);
		},

		setValue:function(v){

			css.remove(this.lbl, "MatcToolbarBorderBottom MatcToolbarBorderLeft MatcToolbarBorderRight MatcToolbarBorderTop");

			if(v.borderBottom){
				css.add(this.lbl, "MatcToolbarBorderBottom");
				css.add(this.bottom, "MatcToolbarPopupSelected");
			} else {
				css.remove(this.bottom, "MatcToolbarPopupSelected");
			}

			if(v.borderLeft){
				css.add(this.lbl, "MatcToolbarBorderLeft");
				css.add(this.left, "MatcToolbarPopupSelected");
			}else {
				css.remove(this.left, "MatcToolbarPopupSelected");
			}



			if(v.borderRight){
				css.add(this.lbl, "MatcToolbarBorderRight");
				css.add(this.right, "MatcToolbarPopupSelected");
			}else {
				css.remove(this.right, "MatcToolbarPopupSelected");
			}


			if(v.borderTop){
				css.add(this.lbl, "MatcToolbarBorderTop");
				css.add(this.top, "MatcToolbarPopupSelected");
			}else {
				css.remove(this.top, "MatcToolbarPopupSelected");
			}


			/**
			 * Clone object as we toggle the value in the toogle()
			 * method and as consequence the command delta
			 * would be null!
			 */
			this._value = lang.clone(v);

		},
    },
    mounted () {
    }
}
</script>