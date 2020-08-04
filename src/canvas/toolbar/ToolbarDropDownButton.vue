
<template>
     <div class=" MatcToolbarItem MatcToolbarDropDownButton">
	<div type="button" data-dojo-attach-point="button">
		<label data-dojo-attach-point="label" class="MatcToolbarItemIcon"></label>
		<span class="caret"></span>
		</div>
		<div class="MatcToolbarPopUp MatcToolbarDropDownButtonPopup" role="menu" data-dojo-attach-point="popup">
			<ul class="" role="menu" data-dojo-attach-point="ul">
			</ul>
		</div>
	</div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import css from 'dojo/css'
import lang from 'dojo/_base/lang'
import on from 'dojo/on'
import touch from 'dojo/touch'
import _DropDown from 'canvas/toolbar/_DropDown'
import DomBuilder from 'common/DomBuilder'

export default {
		name: 'ToolbarDropDownButton',
		props: ["qOptions", "qValue", 'qUpdateLabel', 'qReposition'],
    mixins:[DojoWidget, _DropDown],
    data: function () {
        return {
            value: false,
            hasObjects: false,
            updateLabel: true,
            maxLabelLength: 7,
            hasLabelTxt: true,
            updateSelection: true,
						arrowPosition: "right",
						currentLabel: null
        }
    },
    components: {},
    methods: {
      setLabelPostfix (postfix){
				this.postfix = postfix;
			},

			setContent (node){
				this.popup.innerHTML ="";
				delete this.ul;
				this.popup.appendChild(node);
				this._reposition();
			},

			/**
			 * we can pass a list of if int or strings or {value:"", label:"", icon:"", css:""}
			 */
			setOptions (list){
				// FIXME: Make lazy onlz on shjow???
				this.cleanUpTempListener();
				if(!this.ul){
					this.popup.innerHTML ="";
					this.ul = document.createElement("ul");
					this.popup.appendChild(this.ul);
				}
				this.ul.innerHTML="";
				this._lis={};
				this._uls=[];
				/**
				 * I think here was a global bug...
				 */
				var selectedValue = this.render(list, this.ul);
				this._options = list;
				if(selectedValue){
					this.setValue(selectedValue);
				}
			},

			render (list, ul){
				var selectedValue = null
				for(var i=0; i < list.length; i++){
					var o = list[i];
					var li = document.createElement("li");

					if((o.label || o.icon || o.css || o.value!=null)) {
						this.hasObjects = true;
						if(o.icon){
							var icon = document.createElement("span");
							css.add(icon,"MatcToolbarPopUpIcon");
							css.add(icon, o.icon);
							li.appendChild(icon);

							if(o.icon2){
								var icon2 = document.createElement("span");
								css.add(icon2,"MatcToolbarPopUpIconSmall");
								css.add(icon2, o.icon2);
								icon.appendChild(icon2);
							}
						}
						if(o.label){
							var lbl = document.createElement("label");
							css.add(lbl,"MatcToolbarPopUpLabel");
							lbl.innerHTML=o.label;
							li.appendChild(lbl);

							if(o.children){
								var marker = document.createElement("span");
								css.add(marker," MatcToolbarPopupChildMarker");
								lbl.appendChild(marker);
							}
						}

						if (o.font) {
							li.style.fontFamily = o.font
						}
						if(o.css){
							css.add(li, o.css);
						}
						if(o.selected){
							selectedValue = o.value;
						}
						if(o.callback){
							this.tempOwn(on(li, touch.press,lang.hitch(this, "invokeCallback", o.callback)));
						} else if(o.callback2){
							this.tempOwn(on(li, touch.press,lang.hitch(this, "invokeCallback2", o.callback2)));
						} else if(o.dialog){
							this.tempOwn(on(li, touch.press,lang.hitch(this, "showInputDialog", o, li)));
						} else if(o.children){
							var childUL = document.createElement("ul");
							css.add(childUL, "MatcToolbarPopupChildren MatcToolbarPopUp");

							this.render(o.children, childUL);
							li.appendChild(childUL);
							this._uls.push(childUL);

							this.tempOwn(on(li, touch.over,lang.hitch(this, "showChildren", childUL)));
							this.tempOwn(on(li, touch.out,lang.hitch(this, "hideChildren")));
						} else {
							this.tempOwn(on(li, touch.press, lang.hitch(this, "onChange", o.value)));
						}
						this._lis[o.value] = li;
					} else {
						li.innerHTML = o;
						this._lis[o] = li;
						this.tempOwn(on(li, touch.press, lang.hitch(this, "onChange", list[i])));
					}
					ul.appendChild(li);
				}
				return selectedValue
			},

			hideChildren (){
				for(var i=0; i < this._uls.length; i++){
					var child = this._uls[i];
					css.remove(child, "MatcToolbarPopUpOpen");
				}
			},

			showInputDialog (o, li,e){
				this.stopEvent(e);
				var dialog = o.dialog;

				var db = new DomBuilder();
				var div = db.div("MatcToolbarDropDownButtonDialog").build();
				db.span("", dialog.label).build(div);

				var value = dialog.value;
				if(this.dialogValues && this.dialogValues[o.value]){
					value = this.dialogValues[o.value];
				}
				var input = db.input("MatcToolbarDropDownButtonInlineEdit MatcIgnoreOnKeyPress", value).build(div);
				db.span("", dialog.unit).build(div);

				/**
				 * Focus and select the new input
				 */
				setTimeout(function(){
					input.focus();
					input.select();
				}, 50);

				/**
				 * Listen to some keyboard events..
				 */
				var me = this;
				this.tempOwn(on(input, "keyup", function(e){
					var keyCode = e.keyCode ? e.keyCode : e.which;
					/**
					 * Close on ESC
					 */
					if( 27 == keyCode){
						/**
						 * Was btn before??
						 */
						me.hideDropDown();
					}
					/**
					 * Change will not be fired if the users presses enter without changing the value!
					 */
					if(13 == keyCode && dialog.value == input.value){
						me.onDialogValueChanged(input, o)
					}
				}));
				this.tempOwn(on(input, "change", lang.hitch(this, "onDialogValueChanged", input, o)));
				this.tempOwn(on(div, touch.press, lang.hitch(this, "stopPropagation")));

				this.setContent(div);

			},

			onDialogValueChanged (input, o){
				this.setValue(o.value);
				if(!this.dialogValues){
					this.dialogValues ={};
				}
				this.dialogValues[o.value] = input.value;
				this.hideDropDown();
				css.add(input, "MatcToolbarDropDownButtonInlineEditPassive");
				this.setOptions(this._options);
			},

			getDialogValue (key){
				if(this.dialogValues){
					return this.dialogValues[key];
				}
			},


			setDialogValue (key, value){
				if(!this.dialogValues){
					this.dialogValues ={};
				}
				return this.dialogValues[key] = value;
			},


			showChildren (ul,e){
				this.stopEvent(e);
				this.hideChildren();
				css.add(ul, "MatcToolbarPopUpOpen");
			},



			setLabel (value){
				/**
				 * Since 3.0.5 we try to be smarter...
				 */
				if (value === this.currentLabel) {
					// console.debug('ToobarDropDownButton.setLabel() > Ignore', value)
					return
				}
				this.currentLabel = value

				if(this.hasObjects){
					this.label.innerHTML = "";

					for(var i=0; i < this._options.length; i++){
						var o = this._options[i];

						if (value == o.value){

							if (o.icon){
								var icon = document.createElement("span");
								css.add(icon, o.icon);
								this.label.appendChild(icon);

								if (o.icon2){
									var icon2 = document.createElement("span");
									css.add(icon2,"MatcToolbarPopUpIconSmall");
									css.add(icon2, o.icon2);
									icon.appendChild(icon2);
								}
							}

							if (o.label && this.hasLabelTxt){
								var lbl = document.createElement("span");
								css.add(lbl, "MatcToolbarDropDownButtonLabel");
								var l =o.label;

								if(l.length > this.maxLabelLength){
									l= l.substring(0, this.maxLabelLength) + "...";
								}
								lbl.innerHTML=l;
								this.label.appendChild(lbl);

								if (o.css){
									css.add(lbl, o.css);
								}
							}
						}
					}
				} else if(value){
					this.label.innerHTML = value;
				}
			},

			setValue  (value){

				if(this._selectedLi){
					css.remove(this._selectedLi, "MatcToolbarPopupSelected");
				}

				if(this._lis[value] && this.updateSelection){
					css.add(this._lis[value], "MatcToolbarPopupSelected");
					this._selectedLi = this._lis[value];
				}
				if(this.updateLabel){
					this.setLabel(value);
				}

				this.value = value;
			},

			getValue (){
				return this.value;
			},

			invokeCallback (callback, e){
				this.stopEvent(e);
				this.hideDropDown();
				callback(e);
			},

			invokeCallback2 (callback, e){
				this.stopEvent(e);
				callback(e);
			},

			onChange (value, e){
				this.stopEvent(e);
				this.hideDropDown();
				this.setValue(value);
				this.emit("change", value ,e);
			},

			onHide (){
				this.hideChildren();
			}
		},
		watch: {
			qOptions (v) {
				this.setOptions(v)
			},
			qValue (v) {
				this.setValue(v)
			}
		},
    mounted () {
			if (this.qUpdateLabel === true) {
				this.updateLabel = true
			}
			if (this.qOptions) {
				this.setOptions(this.qOptions)
			}
			if (this.qReposition) {
				this.reposition = true
			}
			if (this.qValue) {
				this.setValue(this.qValue)
			}
    }
}
</script>