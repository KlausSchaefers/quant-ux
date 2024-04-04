
<template>
     <div class="MatcToolbarItem ">
		<div type="button" ref="button">
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
import {iconDOM} from 'page/QIconUtil'

export default {
    name: 'DropDown',
    mixins:[DojoWidget],
    data: function () {
        return {
            reposition: false,
            isOpen: false,
            arrowSize: 10,
			popupOffsetRight: 6,
            chevron: true,
			isChildDropDown: false
        }
    },
    components: {},
    methods: {
		postCreate (){
			this.logger = new Logger("_DropDown");
			this.own(on(this.domNode, touch.press, lang.hitch(this, "showDropDown")));
			this.button = this.$refs.button
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

		setActiveButton (node) {
			this.button = node
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

		renderRemovePopupFooter (msg, callback, icon='Delete'){
			const div = document.createElement("div");
			css.add(div, "MatcToolbarPopupFooter");

			div.appendChild(iconDOM(icon))

			const lbl = document.createElement("span")
			lbl.innerHTML = msg
			div.appendChild(lbl)

	
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
		showDropDown (e, forceUpdatePosition =false){
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
			topic.publish("matc/canvas/click", "", "", {isDropDown: true, isChildDropDown: this.isChildDropDown});
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
				console.debug("_DropDown.showDropDown() > return no popup");
				return;
			}

			if (this.button) {
				css.add(this.button, "MatcToolbarItemActive");
			}

			if (this.isChildDropDown) {
				css.add(this.popup, "MatcToolbarPopUpChild");
			}

			css.add(this.popup, "MatcToolbarPopUpOpen");

			this._mouseDownListener = on(win.body(),"mousedown", lang.hitch(this,"hideDropDown"));
			this._topicListener = topic.subscribe("matc/canvas/click", lang.hitch(this,"onCanvasClick"));
			this._escListener = topic.subscribe("matc/canvas/esc", lang.hitch(this,"onEcc"));
			this._dialogListner = topic.subscribe("vommond/dialog/open", lang.hitch(this,"hideDropDown"));

			if (this.isChildDropDown) {
				this._childListener = topic.subscribe("matc/dropdown/child", lang.hitch(this,"hideDropDown"));
			}

			this.onVisible();

			if (this.reposition) {
				this.teleportToBody(forceUpdatePosition)
			}
			this.renderArrow();
			if(this.showListener){
				this.showListener();
			}
			this.isOpen = true;
		},

		teleportToBody (forceUpdatePosition = false) {
			try {
				if (this._reposition(forceUpdatePosition)) {
					this._popupAtBody = true;
					this.domNode.removeChild(this.popup);
					win.body().appendChild(this.popup);
				}
			} catch(e){
					console.error(e);
			}
		},

		getPopupRootNode () {
			return this.domNode
		},

		updatePosition (forceUpdatePosition = false){
			if (this.arrow){
				this.popup.removeChild(this.arrow);
				delete this.arrow;
			}
			this._reposition(forceUpdatePosition);
			this.renderArrow();
		},

		_reposition (forceUpdatePosition = false) {
			var pos = domGeom.position(this.getPopupRootNode());
			if (pos.x === 0) {
				console.debug('_DropDown.teleportToBody() > Position is bad, try agound')
				this.hideDropDown()
				return false
			}

			if (!this.popupPos || forceUpdatePosition){
				this.popupPos = domGeom.position(this.popup);
			}
			this.popupPos.h -=8

			var h = win.getBox().h;
			if(pos.y > h * 0.667){
				this.popup.style.top = pos.y - (this.popupPos.h - pos.h) + "px"
			} else if (pos.y > h* 0.33){
				this.popup.style.top = pos.y - (this.popupPos.h / 2) + "px"
			} else {
				this.popup.style.top = pos.y + "px"
			}


			this.popup.style.bottom = "auto";
			if (this.repositionPosition === 'right') {
				this.popup.style.left = "auto"
				this.popup.style.left = pos.x + pos.w + this.popupOffsetRight + "px";
			} else {
				this.popup.style.right = "auto"
				this.popup.style.left = pos.x - this.popupPos.w -this.popupOffsetRight+ "px";
			}

			return true
		},

		renderArrow () {
			if (this.arrowPosition) {

				if (!this.arrow) {
					this.arrow = document.createElement("div");
					css.add(this.arrow, "MatcToolbarPopUpArrowCntr");
					var triangle = document.createElement("div");
					css.add(triangle, "MatcToolbarPopUpArrow");
					this.arrow.appendChild(triangle);
					this.popup.appendChild(this.arrow);
				}

				if (this.reposition) {
					var pos = domGeom.position(this.getPopupRootNode());
					var popupPos = domGeom.position(this.popup);
					var y = Math.round(pos.y - popupPos.y +((pos.h-this.arrowSize)/2));
					this.arrow.style.top = Math.min(y, (popupPos.h-8) * this.arrowSize) + "px";
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

			if (this.button) {
				css.remove(this.button, "MatcToolbarItemActive");
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
			try {
				if (this._popupAtBody && this.popup){
					win.body().removeChild(this.popup);
					this.domNode.appendChild(this.popup);
				}
			} catch (err) {
				console.error('_DropDown.hideDropDown() > cannot remove', err)
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
			if (this._childListener) {
				this._childListener.remove()
				delete this._childListener
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