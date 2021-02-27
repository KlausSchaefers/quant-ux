
<template>
     <div class="MatcToolbarDropDownButton MatcToolbarItem MatcTextShadow">
		<div type="button" data-dojo-attach-point="button">
			<span data-dojo-attach-point="lbl" class="MatcToolbarItemIcon MatcTexShadowIcon">T</span>
			<span class="caret"></span>
			</div>
			<div class="MatcToolbarPopUp MatcBoxShadow MatcToolbarDropDownButtonPopup" role="menu" data-dojo-attach-point="popup">
			<div class="MatcToolbarPopUpContainer" role="menu" data-dojo-attach-point="ctnr">
			</div>
			<div data-dojo-attach-point="removeBTN" class="MatcToolbarPopupFooter">
				<span class="MatcToolbarPopupFooterNone glyphicon glyphicon-remove-sign"></span>
				<span class="MatcToolbarPopupFooterLabel">No Text Shadow</span>
			</div>
			</div>
		</div>
</template>
<script>
import css from 'dojo/css'
import lang from 'dojo/_base/lang'
import on from 'dojo/on'
import touch from 'dojo/touch'
import DomBuilder from 'common/DomBuilder'
import BoxShadow from './BoxShadow'

export default {
    name: 'TextShadow',
    mixins:[BoxShadow],
    data: function () {
        return {
            value: false,
            color: "#999",
            blur: 2,
            reposition: true,
            columns: 6,
            dialogClass: "MatcTextShadowDialog",
            arrowPosition: "right"
        }
    },
    components: {},
    methods: {
        renderSliders:function(parent){
			console.debug('TextShadow.')

			/**
			 * hack to make sure everything is rendered correctly
			 */
			css.add(this.popup, "MatcToolbarPopUpOpen");

			var db = new DomBuilder();

			var cntr = db.div("container").build(parent);
			var row = db.div("row").build(cntr);
			var left = db.div("col-md-4 MatcCenter").build(row);
			var right = db.div("col-md-8").build(row);

			var tbody = db.table("MatcSliderTable").tbody().build(right);

			this.hWidgets = this.renderSlider(db, tbody, "Horizontal");
			this.vWidgets = this.renderSlider(db, tbody, "Vertical");
			this.bWidgets = this.renderSlider(db, tbody, "Blur");

			this.renderColors(db, tbody);

			this.previewBox = db.div("MatcTextShadowPreview", "Preview").build(left);

			if(this._value){
				this.setLabels(this._value);
				this.setSliders(this._value);
				this.setPreview(this._value);
				this.setColor(this._value.c);
			}
		},

		onLblChange:function(){
			var boxShadow = {
				v: Math.round(this.vWidgets.label.value),
				h: Math.round(this.hWidgets.label.value),
				b: Math.round(this.bWidgets.label.value),
				c:this.color,
				custom:true
			};
			this.setSliders(boxShadow);
			this.setPreview(boxShadow);
		},


		getCustomBoxShadow:function(){
			return {
				v: Math.round(this.vWidgets.slider.getValue()),
				h: Math.round(this.hWidgets.slider.getValue()),
				b: Math.round(this.bWidgets.slider.getValue()),
				c:this.color,
				custom:true
			};
		},


		setLabels:function(boxShadow){
			if(this.vWidgets){
				this.vWidgets.label.value = boxShadow.v;
				this.hWidgets.label.value = boxShadow.h;
				this.bWidgets.label.value = boxShadow.b;
			}
		},

		setSliders:function(boxShadow){
			if(this.vWidgets){
				this.vWidgets.slider.setValue(boxShadow.v);
				this.hWidgets.slider.setValue(boxShadow.h);
				this.bWidgets.slider.setValue(boxShadow.b);
			}
		},

		setPreview:function(box){
			if(this.previewBox){
				this.previewBox.style.textShadow = box.h+"px "+box.v+"px "+ box.b+"px " + this.color;
			}
		},

		/**********************************************
		 * Default Table
		 **********************************************/

		renderDefaultTable:function(){

			var tbl = document.createElement("table");

			var tr = document.createElement("tr");
			tbl.appendChild(tr);
			this.renderShadowBox(-3, -3, this.blur, tr);
			this.renderShadowBox(0, -3, this.blur, tr);
			this.renderShadowBox(3, -3, this.blur, tr);


			tr = document.createElement("tr");
			tbl.appendChild(tr);
			this.renderShadowBox(-3, 0, this.blur, tr);
			this.renderShadowBox(0, 0, 5, tr);
			this.renderShadowBox(3, 0, this.blur, tr);

			tr = document.createElement("tr");
			tbl.appendChild(tr);
			this.renderShadowBox(-3, 3, this.blur, tr);
			this.renderShadowBox(0, 3, this.blur, tr);
			this.renderShadowBox(3, 3, this.blur, tr);

			this.ctnr.appendChild(tbl);
		},

		renderShadowBox:function(h,v,b, parent){


			var div = document.createElement("td");

			var icon = document.createElement("span");
			css.add(icon, "MatcTextShadowIcon");
			icon.innerHTML = "T";

			icon.style.textShadow = h+"px "+v+"px "+ b+"px "+ this.color;

			div.appendChild(icon);

			this.own(on(div, touch.press, lang.hitch(this, "_selectBoxShadow", h,v,b, this.color)));

			parent.appendChild(div);
		},

		_removeBoxShadow:function(e){
			this.stopEvent(e);
			this.onChange(null);
		},

		_selectBoxShadow:function(h,v,b,c, e){
			this.stopEvent(e);
			var boxShadow = {
				v:v,
				h:h,
				b:10,
				c:"#333"
			};
			this.onChange(boxShadow);
		},



		setValue:function(v){
			if(v){
				this._value = lang.clone(v);
				this.color = this._value.c;
			}
		}
    },
    mounted () {
    }
}
</script>