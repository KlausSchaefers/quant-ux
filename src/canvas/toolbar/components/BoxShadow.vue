
<template>
     <div class="MatcToolbarDropDownButton MatcToolbarItem">
		<div type="button" data-dojo-attach-point="button">
			<span data-dojo-attach-point="lbl" class="MatcToolbarItemIcon"><span class="MatcBoxShadowIcon"></span></span>
			<span class="caret"></span>
			</div>
			<div class="MatcToolbarPopUp MatcBoxShadow MatcToolbarDropDownButtonPopup" role="menu" data-dojo-attach-point="popup">
				<div class="MatcToolbarPopUpContainer" role="menu" data-dojo-attach-point="ctnr">

				</div>
				<div data-dojo-attach-point="removeBTN" class="MatcToolbarPopupFooter">
					<span class="MatcToolbarPopupFooterNone mdi mdi-close-circle"></span>
					<span class="MatcToolbarPopupFooterLabel">No Shadow</span>
				</div>
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
import HSlider from 'common/HSlider'
import Dialog from 'common/Dialog'
import CheckBox from 'common/CheckBox'
import DomBuilder from 'common/DomBuilder'
import _Color from 'common/_Color'
import ColorPickerSketch from 'common/ColorPickerSketch'

export default {
    name: 'BoxShadow',
    mixins:[_Color, DojoWidget, _DropDown],
    data: function () {
        return {
            value: false,
            color: "#333333",
            defaultColor: "rgba(0,0,0,0.25)",
            blur: 2,
            spread: 2,
            reposition: true,
            columns: 6,
            dialogClass: "MatcBoxShadowDialog",
						arrowPosition: "right"
        }
    },
    components: {},
    methods: {
      init (){
				this.own(on(this.removeBTN, touch.press, lang.hitch(this, "_removeBoxShadow")));
				this.renderDefaultTable();
				var db = new DomBuilder();
				this.moreBtn = db.a("","Shadow Settings...").build(this.ctnr);
				this.own(on(this.moreBtn, touch.press, lang.hitch(this, "showDialog")));
			},

			showDialog (e){

				this.stopEvent(e);
				this._ignoreHide = true;

				var db = new DomBuilder();
				/**
				 * Do a little hack in here and add the slider already to the DOM, so
				 * the auto scaling does work... Afterwards we have to detach it and render
				 * in in the dialog
				 */
				var popup = db.div(this.dialogClass + " MatcPadding").build(this.ctnr);

				this.renderSliders(popup);
				this.ctnr.removeChild(popup);
				var bar = db.div("MatcButtonBar MatcMarginTop").build(popup);
				var write = db.div("MatcButton", "Ok").build(bar);
				var cancel = db.a("MatcLinkButton", "Cancel").build(bar);

				var d = new Dialog();
				d.overflow = true
				d.own(on(write, touch.press, lang.hitch(this,"setCustomShadow", d)));
				d.own(on(cancel, touch.press, lang.hitch(this, "closeDialog",d)));
				d.own(on(d, "close", lang.hitch(this, "cleanUpDialog")));
				d.popup(popup,this.moreBtn);

			},

			setCustomShadow (d){
				var boxShadow = this.getCustomBoxShadow();
				d.close();
				this.onChange(boxShadow);
			},

			closeDialog (d, e){
				this.stopEvent(e);
				d.close();
			},

			cleanUpDialog (){
				this.cleanUpTempListener();
				this._ignoreHide = false;

				/**
				 * FIXME:Should I also call the destroy() I hope dojo does that for me!
				 */
				delete this.hWidgets;
				delete this.vWidgets;
				delete this.bWidgets;
				delete this.sWidgets;
				delete this.inverBox;
				delete this.picker;
			},

			renderSliders (parent){
				/**
				 * hack to make sure everything is rendered correctly
				 */
				css.add(this.popup, "MatcToolbarPopUpOpen");

				var db = new DomBuilder();

				var cntr = db.div("container").build(parent);
				var row = db.div("row").build(cntr);
				var left = db.div("col-md-2 MatcCenter").build(row);
				var right = db.div("col-md-5").build(row);
				var color = db.div("col-md-5").build(row);

				var tbody = db.table("MatcSliderTable").tbody().build(right);

				this.hWidgets = this.renderSlider(db, tbody, "Horizontal");
				this.vWidgets = this.renderSlider(db, tbody, "Vertical");
				this.bWidgets = this.renderSlider(db, tbody, "Blur");
				this.sWidgets = this.renderSlider(db, tbody, "Spread");

				this.renderInset(db, tbody);

				this.picker = this.$new(ColorPickerSketch, {isDialog: true});
				this.picker.placeAt(color);
				this.picker.setValue(this.color)
				this.own(on(this.picker, "change", lang.hitch(this, "onColorChange")));
				this.own(on(this.picker, "changing", lang.hitch(this, "onColorChange")));

				this.previewBox = db.div("MatcBoxShadowPreview", "Preview").build(left);

				if(this._value){
					this.setLabels(this._value);
					this.setSliders(this._value);
					this.insertBox.setValue(this._value.i)
					this.setPreview(this._value);
				}
			},

			renderInset (db, tbody){
				var tr = db.tr().build(tbody);
				db.td("", "Inset").build(tr);
				var td = db.td("form-group").build(tr);
				this.insertBox = this.$new(CheckBox);
				this.insertBox.placeAt(td);
				this.tempOwn(on(this.insertBox, "change", lang.hitch(this, "onInsertChange")))
				db.td("").build(tr);
			},


			renderColors (db, tbody){
				var tr = db.tr().build(tbody);
				db.td("", "Color").build(tr);
				var td = db.td().build(tr);
				td.colSpan="2";
				this._colorBoxes = this.renderColorBoxes(this.shadow_palette, td, this.columns, "onColorChange");
			},

			renderSlider (db, tbody, msg){
				var tr = db.tr().build(tbody);
				db.td("", msg).build(tr);
				var row = db.td("").div("MatcBoxShadowSlider").build(tr);

				var s = this.$new(HSlider);
				s.setMax(50);
				s.setMin(-50);
				s.setCenter(true);
				s.placeAt(row);
				s.setValue(0);


				this.tempOwn(on (s, "change", lang.hitch(this,"onSliderChange")));

				var lbl = db.td("", "").input("MatcBoxShadowSliderLabel MatcIgnoreOnKeyPress form-control", "0").build(tr);
				this.tempOwn(on (lbl, "change", lang.hitch(this,"onLblChange")));
				this.tempOwn(on (lbl, "focus", function(){
					lbl.select();
				}));
				return {
					slider : s,
					label : lbl
				};
			},

			onColorChange (c){
				this.color = c;
				var boxShadow = this.getCustomBoxShadow();
				this.setPreview(boxShadow);
				this.setColor(c);
			},

			onInsertChange (){
				var boxShadow = this.getCustomBoxShadow();
				this.setPreview(boxShadow);
			},

			onLblChange (){
				var boxShadow = {
					v: Math.round(this.vWidgets.label.value),
					h: Math.round(this.hWidgets.label.value),
					b: Math.round(this.bWidgets.label.value),
					s: Math.round(this.sWidgets.label.value),
					i : this.insertBox.getValue(),
					c:this.color,
					custom:true
				};
				this.setSliders(boxShadow);
				this.setPreview(boxShadow);
			},

			onSliderChange (){
				var boxShadow = this.getCustomBoxShadow();
				this.setLabels(boxShadow);
				this.setPreview(boxShadow);
			},

			getCustomBoxShadow (){
				return {
					v: Math.round(this.vWidgets.slider.getValue()),
					h: Math.round(this.hWidgets.slider.getValue()),
					b: Math.round(this.bWidgets.slider.getValue()),
					s: Math.round(this.sWidgets.slider.getValue()),
					i : this.insertBox.getValue(),
					c:this.color,
					custom:true
				};
			},

			setColor (c){
				if(this._colorBoxes){
					for(var color in this._colorBoxes){
						var span = this._colorBoxes[color];
						if(c == color){
							span.style.borderColor = "#a5ce00";
						} else {
							if(color!= "#fff" && color!= "#ffffff"){
								span.style.borderColor = color;
							} else {
								span.style.borderColor = "#cecece";
							}

						}
					}
				}
			},

			setLabels (boxShadow){
				if(this.vWidgets){
					this.vWidgets.label.value = boxShadow.v;
					this.hWidgets.label.value = boxShadow.h;
					this.bWidgets.label.value = boxShadow.b;
					this.sWidgets.label.value = boxShadow.s;
				}
			},

			setSliders (boxShadow){
				if(this.vWidgets){
					this.vWidgets.slider.setValue(boxShadow.v);
					this.hWidgets.slider.setValue(boxShadow.h);
					this.bWidgets.slider.setValue(boxShadow.b);
					this.sWidgets.slider.setValue(boxShadow.s);
				}
			},

			setPreview (box){
				if(this.previewBox){
					var insert = box.i ? "inset":"";
					this.previewBox.style.boxShadow = box.h+"px "+box.v+"px "+ box.b+"px " + box.s +"px "+ this.color +" "+ insert;
				}
			},

			renderDefaultTable (){
				var tbl = document.createElement("table");

				var tr = document.createElement("tr");
				tbl.appendChild(tr);
				this.renderShadowBox(-3, -3, this.blur, tr);
				this.renderShadowBox(0, -3, this.blur, tr);
				this.renderShadowBox(3, -3, this.blur, tr);

				tr = document.createElement("tr");
				tbl.appendChild(tr);
				this.renderShadowBox(-3, 0, this.blur, tr);
				this.renderShadowBox(0, 0, this.blur, tr, 3);
				this.renderShadowBox(3, 0, this.blur, tr);

				tr = document.createElement("tr");
				tbl.appendChild(tr);
				this.renderShadowBox(-3, 3, this.blur, tr);
				this.renderShadowBox(0, 3, this.blur, tr);
				this.renderShadowBox(3, 3, this.blur, tr);

				this.ctnr.appendChild(tbl);
			},

			renderShadowBox (h,v,b, parent, spread){

				var div = document.createElement("td");

				var icon = document.createElement("span");
				css.add(icon, "MatcBoxShadowIcon");
				if(!spread){
					icon.style.boxShadow = h+"px "+v+"px "+ b+"px "+ this.defaultColor;
				} else {
					icon.style.boxShadow = h+"px "+v+"px "+ b+"px " + spread +"px "+ this.defaultColor;
				}
				div.appendChild(icon);

				this.own(on(div, touch.press, lang.hitch(this, "_selectBoxShadow", h,v,b, this.defaultColor)));

				parent.appendChild(div);
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
				/**
				 * Clone object as we toggle the value in the toogle()
				 * method and as consequence the command delta
				 * would be null!
				 */
				if(v){
					this._value = lang.clone(v);
					this.color = this._value.c;
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