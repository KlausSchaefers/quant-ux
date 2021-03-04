
<template>
     <div class="MatcToolbarItem ">
							<div type="button" data-dojo-attach-point="button">
								<label data-dojo-attach-point="label" class="">F</label>
							    <span class="caret" data-dojo-attach-point="caret"></span>
							 </div>
							 <div class="MatcToolbarPopUp" role="menu" data-dojo-attach-point="popup">
							  </div>
						  </div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import css from 'dojo/css'
import lang from 'dojo/_base/lang'
import on from 'dojo/on'
import touch from 'dojo/touch'
import topic from 'dojo/topic'
import domGeom from 'dojo/domGeom'
import Logger from 'common/Logger'
import win from 'dojo/win'

export default {
    name: 'DropDown',
    mixins:[DojoWidget],
    data: function () {
        return {
            reposition: false,
            isOpen: false,
            arrowSize: 10,
            chevron: true
        }
    },
    components: {},
    methods: {
			postCreate: function(){
					this.logger = new Logger("_DropDown");
					this.own(on(this.domNode, touch.press, lang.hitch(this, "showDropDown")));
					this.setChevron()
			},

			setChevron () {
				if (!this.chevron && this.caret){
						this.button.removeChild(this.caret);
				}
			},

			/***************************************************
			 * Template methods!
			 ***************************************************/
			init (){

			},

			onVisible (){

			},

			onHide (){

			},


			setPopupCss (cls){
				css.add(this.popup, cls);
			},


			setShowListener (fct){
				this.showListener = fct;
			},

			setHideListener (fct){
				this.hideListener = fct;
			},

			renderRemovePopupFooter (msg, callback){
				var div = document.createElement("div");
				css.add(div, "MatcToolbarPopupFooter");
				div.innerHTML = '<span class="MatcToolbarPopupFooterIcon mdi mdi-close-circle"></span><span class="MatcToolbarPopupFooterLabel">' + msg + '</span>';
				this.own(on(div, touch.press, callback));
				this.popup.appendChild(div)
				this.popupFooter = div
			},

			removePopupFooter () {
				try {
					if (this.popupFooter && this.popupFooter.parentNode) {
						this.popupFooter.parentNode.removeChild(this.popupFooter)
					}
					delete this.popupFooter
				} catch (e) {
					console.error(e)
				}
			},

			setHint (hint){
				var div = document.createElement("div");
				css.add(div, "MatcToolbarHint");
				div.innerHTML = hint;
				this.button.appendChild(div);
			},

			/***************************************************
			 * Hide and show methods
			 ***************************************************/
			showDropDown (e){
				this._ignoreHide = false;
				/**
				 * Lazy init only when first time clicked!
				 */
				if(!this._inited){
					this.init();
					this._inited = true;
				}
				this.stopEvent(e);
				/**
				 * this will force all other popups to close
				 */
				topic.publish("matc/canvas/click", "", "");
				/**
				 * the canvas can register to this to flush stuff
				 */
				topic.publish("matc/toolbar/click", "");

				if (!this.popup){
					/**
					 * FIXME: This can happen in the data section! The model gets updated,
					 * and the data section gets rendered again. This means also, that this widget
					 * will be in the mean time deleted!
					 */
					console.debug("return no popup");
					return;
				}

				css.add(this.popup, "MatcToolbarPopUpOpen");

				this._mouseDownListener = on(win.body(),"mousedown", lang.hitch(this,"hideDropDown"));
				this._topicListener = topic.subscribe("matc/canvas/click", lang.hitch(this,"onCanvasClick"));
				this._escListener = topic.subscribe("matc/canvas/esc", lang.hitch(this,"onEcc"));
				this._dialogListner = topic.subscribe("vommond/dialog/open", lang.hitch(this,"hideDropDown"));


				this.onVisible();

				if(this.reposition){
					try {
						/**
						 * We will now place the popup to the body, to allow scrolling in the properties bar
						 */
						var pos = domGeom.position(this.domNode);
						var h = win.getBox().h;
						if(!this.popupPos){
							this.popupPos = domGeom.position(this.popup);
						}
						this._popupAtBody = true;
						this.domNode.removeChild(this.popup);
						if(pos.y > h* 0.667){
							this.popup.style.top = pos.y - (this.popupPos.h - pos.h) + "px"
						} else if (pos.y > h* 0.33){
							this.popup.style.top = pos.y - (this.popupPos.h/2) + "px"
						}else {
							this.popup.style.top = pos.y + "px"
						}
						this.popup.style.bottom = "auto";
						this.popup.style.left = pos.x - this.popupPos.w - this.arrowSize+ "px";
						win.body().appendChild(this.popup);
					} catch(e){
						console.error(e);
					}
				}
				this.renderArrow();
				if(this.showListener){
					this.showListener();
				}
				this.isOpen = true;
			},

			updatePosition (doNotUpdatePosition = true){
				if (this.arrow){
					this.popup.removeChild(this.arrow);
					delete this.arrow;
				}
				this._reposition(doNotUpdatePosition);
			},

			_reposition (doNotUpdatePosition){
				var pos = domGeom.position(this.domNode);
				var h = win.getBox().h;
				delete this.arrow;
				if (!doNotUpdatePosition){
					this.popupPos = domGeom.position(this.popup);
				}
				this._popupAtBody = true;
				if(pos.y > h* 0.667){
					this.popup.style.top = pos.y - (this.popupPos.h - pos.h) + "px"
				} else if (pos.y > h* 0.33){
					this.popup.style.top = pos.y - (this.popupPos.h/2) + "px"
				}else {
					this.popup.style.top = pos.y + "px"
				}

				this.popup.style.bottom = "auto";
				this.popup.style.left = pos.x - this.popupPos.w -this.arrowSize+ "px";

				this.renderArrow();
			},

			renderArrow (){

				if(this.arrowPosition){
					if(!this.arrow){
						this.arrow = document.createElement("div");
						css.add(this.arrow, "MatcToolbarPopUpArrowCntr");

						var triangle = document.createElement("div");
						css.add(triangle, "MatcToolbarPopUpArrow");
						this.arrow.appendChild(triangle);

						this.popup.appendChild(this.arrow);
					}

					if(this.reposition){
						var pos = domGeom.position(this.domNode);
						var popupPos = domGeom.position(this.popup);
						var y = Math.round(pos.y - popupPos.y +((pos.h-this.arrowSize)/2));
						this.arrow.style.top = Math.min(y, popupPos.h-2*this.arrowSize) + "px";
					}
				}
			},

			cleanUpPopup (){
				delete this.arrow;
			},

			onEcc (e){
				this.hideDropDown(e);
			},

			onCanvasClick (id, type) {
				this.hideDropDown(id, type);
			},

			hideDropDown (){
				this.isOpen = false;
				if(this._ignoreHide){
					return;
				}

				if(this.popup){
					css.remove(this.popup, "MatcToolbarPopUpOpen");
				} else {
					/**
					 * FIXME: This is a stupid bug that happens all the time. Not sure why exactly, m
					 *
					 */
					//var e = new Error("hideDropDown() > this.popup is null > " +  this.declaredClass);
					//this.logger.sendError(e);
				}

				if(this._popupAtBody && this.popup){
					win.body().removeChild(this.popup);
					this.domNode.appendChild(this.popup);
				}
				this._popupAtBody = false;

				if(this._mouseDownListener){
					this._mouseDownListener.remove();
					delete this._mouseDownListener;
				}
				if(this._topicListener){
					this._topicListener.remove();
					delete this._topicListener;
				}
				if (this._escListener){
					this._escListener.remove()
					delete this._escListener;
				}
				if (this._dialogListner){
					this._dialogListner.remove();
					delete this._dialogListner;
				}
				this.onHide();
				if(this.hideListener){
					this.hideListener();
				}
			},

			onChange (value,e, keepOpen){
				this.stopEvent(e);
				if(!keepOpen){
					this.hideDropDown(e);
				}
				this.setValue(value);
				this.emit("change", value );
			}
    }
}
</script>