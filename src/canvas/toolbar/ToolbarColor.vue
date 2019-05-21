
<template>
    <div class="MatcToolbarDropDownButton MatcToolbarItem MatcToolbarColor ">
		<div type="button" data-dojo-attach-point="button"> 
			<label data-dojo-attach-point="label" class="MatcToolbarItemIcon"></label> 
			<span data-dojo-attach-point="caret" class="caret"></span> 
		</div>
		<div class="MatcToolbarPopUp MatcToolbarDropDownButtonPopup" role="menu" data-dojo-attach-point="popup">
		</div>
	</div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import css from 'dojo/css'
import lang from 'dojo/_base/lang'
import on from 'dojo/on'
import touch from 'dojo/touch'
import ColorPickerSketch from 'common/ColorPickerSketch'
import GradientPicker from 'common/GradientPicker'
import Dialog from 'common/Dialog'
import DomBuilder from 'common/DomBuilder'
import _DropDown from 'canvas/toolbar/_DropDown'
import _Color from 'common/_Color'
import Util from 'core/Util'

export default {
    name: 'ToolbarColor',
    mixins:[Util, _Color, DojoWidget, _DropDown],
    data: function () {
        return {
            value: null, 
            updateColor: false, 
            updateBackground: false, 
            updateLabel: false, 
            updateLabelBackground: false, 
            hasCustomColor: true, 
            reposition: true, 
            columns: 10, 
            hasGradient: false, 
            arrowPosition: "right", 
            keepOpenOnTypeSelection: null, 
            lastOpen: 0, 
            lastClose: 0, 
						colors : [
							"#e2f4fb", "#a8dff4", "#8ad5f0", "#50c0e9", "#33b5e5", "#2cb1e1", "#1da9da", "#16a5d7", "#0fa1d3", "#0099cc",
							"#f5eafa", "#ddbcee", "#d6adeb", "#cb97e5", "#c58be2", "#c182e0", "#b368d9", "#ac59d6", "#a750d3", "#9933cc",
							"#f0f8db", "#d3e992", "#c5e26d", "#a8d324", "#99cc00", "#92c500", "#83b600", "#7caf00", "#75a800", "#669900",
							"#fff6df", "#ffe3a0", "#ffd980", "#ffc641", "#ffbd21", "#ffb61c", "#ffa713", "#ffa00e", "#ff9909", "#ff8a00",
							"#ffe4e4", "#ffafaf", "#ff9494", "#ff5f5f", "#ff4444", "#f83a3a", "#e92727", "#e21d1d", "#db1313", "#cc0000",
							"#ffffff", "#E6E6E6", "#D9D9D9", "#BFBFBF", "#B2B2B2", "#999999",  "#666666", "#4D4D4D", "#333333", "#000000"
						],		
						gradientsColors: [
							["#fff", "#ccc",0],
							["#22a5d5", "#23df96"],
							["#b122d5", "#6092d4"],
							["#d54222", "#d460c5"]
						],
            gradients: []
        }
    },
    components: {},
    methods: {
      init (){			
				/**
				 * Init gradients
				 */
				if (this.gradients.length == 0) {
					let angles = [0,90,180,270, 45, 135]
					for (var i=0; i< this.gradientsColors.length; i++){
						let colors = this.gradientsColors[i];
						for (let a = 0; a < angles.length; a++){
							this.gradients.push([colors[0], colors[1], angles[a]]);
						}
					}
				}
			
				var db = new DomBuilder();			
				var cntr = db.div("MatcToolbarPopUpContainer MatcToolbarColorContainer MatcToolbarColorSketch").build();
				
				/**
				 * render tabs
				 */
			
				if(this.hasGradient || this.hasPicker){
					
					let tabHeader = db.div("MatcToolbarTabContainer").div("MatcToolbarTabs").build(this.popup);

					/**
					 * Picker Tab
					 */		
					if(this.hasPicker) {
						let tabPicker = this.createTab("Solid", tabHeader,cntr, db, true);	
						this.pickerDiv = db.div("Pick").build(tabPicker);	
						this.picker = this.$new(ColorPickerSketch);
						this.picker.placeAt(this.pickerDiv);
						this.own(on(this.picker, "change", lang.hitch(this, "onTempColorSelected")));
					}
					
					/**
					 * Solid color tab
					 */
					let tabSolidColor = this.createTab("Default Palette", tabHeader,cntr, db, true);	
					this.colorDiv =  db.div().build(tabSolidColor);			
					
					/**
					 * Gradient Tab
					 */		
					if(this.hasGradient) {
						let tabGradient = this.createTab("Gradient", tabHeader,cntr, db, false);	
						this.gradientDiv = db.div().build(tabGradient);	
						var lblCntr = db.div("MatcToolbarColorLabel").build(tabGradient);
						let a = db.a("","Custom Gradient...").build(lblCntr);
						this.own(on(a, touch.press, lang.hitch(this, "showGradient")));
					}
							
				} else {
					let tabHeader = db.div("MatcToolbarTabContainer").div("MatcToolbarTabs").build(this.popup);
					/**
					 * Solid color tab
					 */
					this.createTab("Default Palette", tabHeader,cntr, db, true);					
					this.colorDiv =  db.div().build(cntr);					
				}
				
				this.customColorDivLabel = db.div("MatcToolbarColorLabel", "Global Colors").build(cntr);
				this.customColorDiv =  db.div("MatcToolbarColorCustomCntr").build(cntr);	
			

				this.popup.appendChild(cntr);	
				this.renderRemovePopupFooter("No Color", lang.hitch(this, "setTransparent"));
			},
			
			
			
			onVisible (){
				
				this.reOpenTab();
				
				this.cleanUpTempListener();

				/**
				 * 1) set palette
				 */
				if (this.picker){
					this.picker.setValue(this.value);
				}
			
				/**
				 * 2) set palette
				 */
				this.colorDiv.innerHTML ="";
				this._colorBoxes = this.renderColorBoxes(this.colors, this.colorDiv, this.columns, "onChange");
				this.setBoxes(this._colorBoxes);

				/**
				 * 3) render custom colors
				 */
				var customColors = this.getCustomColors();
				this._renderCustomColors(customColors, this.customColorDivLabel, this.customColorDiv);
				
				
				/**
				 * 4) Render Gradient
				 */
				if(this.hasGradient){
					this.gradientDiv.innerHTML=""
					this._gradientBoxes = this.renderGradientBoxes(this.gradients, this.gradientDiv, 6, "onChange");
				}
		
				this.lastOpen = new Date().getTime();
		
			},
			
			_renderCustomColors  (customColors,labelDiv, div){
				if (div) {
					div.innerHTML="";
					if(customColors.length > 0){
						var customColorBoxes = this.renderColorBoxes(customColors, this.customColorDiv, this.columns, "onColorSelected");
						this.setBoxes(customColorBoxes);
						css.remove(labelDiv, "hidden");
					} else {
						css.add(labelDiv, "hidden");
					}
				}
			},
			
			
			onColorSelected  (c,e){
				this.stopEvent(e);
				if(c!=""){
					this._ignoreHide = false;
					this.onChange(c, e);
				} else {
					this.stopEvent(e);
					this.hideDropDown();
				}
			},

			setTransparent () {
				this.onTempColorSelected('transparent')
				//this.onChange('transparent');
			},
			
			
			onHide  (){
				this.flush();
				this.lastClose = new Date().getTime();
			},
			
			flush  (){
				if (this.tempValue && this.tempValue){
					this.emit("change", this.tempValue);
					delete this.tempValue
				}
			},
			
			onTempColorSelected  (value){
				if (this.value != value) {
					this.tempValue = value;
					this.emit("changing", value);
					this.setLabelColor(value);
				}
			},
			
			getCustomColors  (){			
				var colors = [];
				if(this.model){	
					var temp = {}
					// var boxColors = this.getBoxColors(this.model.screens,temp);
					// var boxColors = this.getBoxColors(this.model.widgets,temp);
					this.getBoxColors(this.model.screens,temp);
					this.getBoxColors(this.model.widgets,temp);				
					var list = []
					for(var color in temp){
						list.push({
							color: color,
							count: temp[color]
						});
					}				
					for(var i=0; i < list.length; i++){
						colors.push(list[i].color);
					}
				}
				return colors;
			},
			
			
			getBoxColors (boxes, result){
				for(var id in boxes){
					var box = boxes[id];
					this._countColor(box.style.background, result);
					this._countColor(box.style.color, result);	
					this._countColor(box.style.borderTopColor, result);	
	//				this._countColor(box.style.borderBottomColor, result);	
	//				this._countColor(box.style.borderRightColor, result);	
	//				this._countColor(box.style.borderLeftColor, result);	
				}
			},
			
			_countColor  (color, result){
				if(color && color!="transparent" && color!="none"){
					if (!result[color]){
						result[color] = 0
					}
					result[color]++;
				}
			},		
			showGradient  (e){
				
				var db = new DomBuilder();
				var popup = db.div("MatcColorGradientDialog MatcPadding").build();
				
				var gradientPicker = this.$new(GradientPicker);
				gradientPicker.placeAt(popup);			
					
				var bar = db.div("MatcButtonBar MatcMarginTop").build(popup);
					
				var write = db.div("MatcButton", "Ok").build(bar);
				var cancel = db.a("MatcLinkButton", "Cancel").build(bar);
				
				var d = new Dialog();
				d.own(on(write, touch.press, lang.hitch(this,"setGradient", gradientPicker, d)));
				d.own(on(cancel, touch.press, lang.hitch(this, "closeColorDialog",d)));
				d.popup(popup, e.target);
				
				if(this.isGradient(this.value)){
					var value = this.value;
					setTimeout(function(){
						gradientPicker.setValue(value);
						gradientPicker.selectHandle(0);					
					},300);		
				}
			},
			
			setCustomColor  (colorPicker, d){
			
				var color = colorPicker.getValue();
				if(color){
					this.onChange(color.toHex());
				} 
				this.closeColorDialog(d);
				
			},
			
			setGradient  (gradientPicker, d){
				var gradient = gradientPicker.getValue();
				if(gradient){
					this.onChange(gradient);
				} 
				this.closeColorDialog(d);
			},
			
			closeColorDialog  (d){
				d.close();
				this._ignoreHide = false;
			},
			
			setValue  (v){
				
				if(this.domNode && this.label) {
					if(!this.isGradient(v)){
						this.setLabelColor(v);
					} else {
						console.debug("setValue() > Gradient >", v);
					}
					
				} else  {
					console.debug("setValue() > Widget disposed");
				}
		
				
				/**
				 * If we keep the popup open, we should make sure
				 * that we update the colors
				 */
				this.value = v;
				if (this.isOpen && !this.isGradient(v)) {
					this.onVisible();
				}
			},
			
			setLabelColor  (v){
				if(this.updateColor){
					this.label.style.color = v;
				}

				if(this.updateBackground){
					this.domNode.style.background = v;				
				}
				
				if(this.updateLabel){
					if(this.label.firstChild){
						this.label.firstChild.style.background = v;
					} else {
						this.label.style.background = v;
					}
				}
			},
			
			
			
			
			setBoxes  (boxes){
				if(!this.isGradient(this.value)){
					for(var color in boxes){
						var span = boxes[color];
						if(this.value == color){
							span.style.borderColor = "red";
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
			
			isGradient  (v){
				return v!=null && v.gradient;
			},
			
			getValue  (){
				return this.value;
			},
			
			setLabel  (value){
				this.label.innerHTML = value;
			},
			
			setModel  (m){
				this.model = m;
			},
			
			
			
			
			
			renderGradientBoxes  (gradients, parent, columns, callback){
				
				var boxes = {};
				var table = document.createElement("table");
				var tbody = document.createElement("tbody");
				table.appendChild(tbody);
				
				var tr = null;
				for(var i=0; i<  gradients.length; i++){
					if(i % columns ==0 || tr ==null){
						tr = document.createElement("tr");
						tbody.appendChild(tr);
					}
					var gradientColors = gradients[i];
					
					var gradient = {
						colors : 
						[
									{c:gradientColors[0], p:0},
									{c:gradientColors[1], p:100},
								],
								gradient:true,
								direction : gradientColors[2]
					};
				
					
					
					var td = document.createElement("td");
					css.add(td,"MatcGradientBox MatcColorBox MatcColorBox"+i % columns);
					var span = document.createElement("span");			
					var cssGradientKey = this._setGradientCSS(span,gradient )
					boxes[cssGradientKey] = span;
					this.tempOwn(on(span, touch.press, lang.hitch(this, callback, gradient)));				
					td.appendChild(span);				
					tr.appendChild(td);				
				}
				parent.appendChild(table);
				return boxes;
			},
			
			_setGradientCSS  (node, gradient){
				var value = "(" + gradient.direction + "deg";
				for(var i=0; i < gradient.colors.length; i++){
					var color = gradient.colors[i];
					value +="," + color.c + " " + color.p+"% ";
				}
				value +");";
				node.style.background = "linear-gradient" + value;
				node.style.background = "-webkit-linear-gradient" + value;
				return value;
			},
		
		
			
			createTab  (lbl, parent, cntr, db, showDefaultColor){
				
				if(!this.tabs){
					this.tabs =[];
					this.tabContainers = [];
				}
				var tab = db.a("MatcToolbarTabActive",lbl).build(parent);
				var tabCntr = db.div().build(cntr);
				
				this.tabs.push(tab);
				this.tabContainers.push(tabCntr);
				
				this.own(on(tab, touch.press, lang.hitch(this, "onSelectTab", this.tabContainers.length-1, showDefaultColor)));
				
				return tabCntr;
				
			},
			
			onSelectTab  (i,showDefaultColor, e){
				
				this.stopEvent(e);
				
				if(this.tabs){
					for(var j=0; j < this.tabs.length; j++ ){
						css.remove(this.tabs[j], "MatcToolbarTabActive");
						css.add(this.tabContainers[j], "hidden");
					}
					
					css.add(this.tabs[i], "MatcToolbarTabActive");
					css.remove(this.tabContainers[i], "hidden");
				}
				if (!showDefaultColor){
					css.add(this.customColorDivLabel, "hidden");
					css.add( this.customColorDiv, "hidden");
				} else {
					css.remove(this.customColorDivLabel, "hidden");
					css.remove( this.customColorDiv, "hidden");
				}
				this._selectedTabNumber = i;
				this.__selectedTabDefault = showDefaultColor
			},
			
			reOpenTab  (){
				if (this._selectedTabNumber){
					this.onSelectTab(this._selectedTabNumber, this.__selectedTabDefault)
				} else {
					this.onSelectTab(0, true)
				}
			}
    }, 
    mounted () {
    }
}
</script>