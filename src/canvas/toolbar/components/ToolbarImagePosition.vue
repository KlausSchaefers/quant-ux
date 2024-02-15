
<template>
	<div class=" MatcToolbarPopUpCntr MatcToolbarImagePosition">
		<div type="button" class="MatcToolbarItem MatcToolbarIconButton">
			<QIcon icon="ImageCrop" />
			<span class="MatcToolbarItemLabel">{{ label }}</span>
		</div>
	</div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import lang from 'dojo/_base/lang'
import on from 'dojo/on'
import touch from 'dojo/touch'
import topic from 'dojo/topic'
import domGeom from 'dojo/domGeom'
import Logger from 'common/Logger'
import Dialog from 'common/Dialog'
import DomBuilder from 'common/DomBuilder'
import HSlider from 'common/HSlider'
import win from 'dojo/win'
import QIcon from 'page/QIcon'

export default {
	name: 'ToolbarImagePosition',
	mixins: [DojoWidget],
	data: function () {
		return {
			value: false,
			reposition: true,
			arrowPosition: "right",
			mode: "private",
			multiSelection: false,
			urlPrefix: "/rest/images/",
			jwtToken: 'notoken',
			selection: [],
			label: ''
		}
	},
	components: {
		'QIcon': QIcon
	},
	methods: {
		postCreate() {
			this.own(on(this.domNode, touch.press, lang.hitch(this, "showDialog")));
			this.logger = new Logger("ToolbarImagePosition");
		},

		setJwtToken(t) {
			this.jwtToken = t
		},

		setModel(m) {
			this.model = m;
		},

		setValue(v) {
			this._value = v;
			if (v && v.style && v.style.backgroundPosition) {
				this.label = "Cropped"
			} else {
				this.label = "No Crop"
			}
		},

		init() {
			this.render();
		},

		showDialog(e) {
			this.logger.log(-1, "showDialog", "enter");
			this.stopEvent(e);
			topic.publish("matc/canvas/click", "", "");
			topic.publish("matc/toolbar/click", "");


			const db = new DomBuilder();
			const popup = db.div("MatcDialog MatcAutoWidthDialog MatcPadding").build(this.domNode);
			const cntr = db.div("MatcToolbarImagePositionCntr").build(popup);
			const row = db.div("MatcSliderTable").div("").build(popup);

			if (this._value.style.backgroundImage) {
				this.renderCropper(this._value, cntr, row, db);
			} else {
				db.div("MatcHint MatcMiddle", "No image to crop").build(cntr);
			}

			const bar = db.div("MatcButtonBar MatcMarginTop").build(popup);
			const write = db.div("MatcButton MatcButtonPrimary", "Ok").build(bar);
			const cancel = db.a("MatcLinkButton", "Cancel").build(bar);

			const d = new Dialog({ overflow: true });

			d.own(on(write, touch.press, lang.hitch(this, "save", d)));
			d.own(on(cancel, touch.press, lang.hitch(d, "close")));
			d.own(on(d, "close", function () {

			}));
			d.popup(popup, this.domNode);

		},

		renderCropper(widget, cntr, row, db) {

			var pos = domGeom.position(cntr);

			var scale = ((pos.h - 0) / widget.h);
			var w = Math.round(widget.w * scale);
			var h = Math.round(widget.h * scale);
			if (h > pos.h) {
				scale = ((pos.w - 0) / widget.w);
				w = Math.round(widget.w * scale);
				h = Math.round(widget.h * scale);
			}

			cntr.style.width = w + "px"
			row.style.width = w + "px"

			var top = 0;
			var left = 0;
			var backImg = widget.style.backgroundImage;

			var canvas = db.div("MatcToolbarImagePositionCanvas MatcMiddle").w(w).h(h).build(cntr);

			var img = db.div("MatcToolbarImagePositionImg")
				.w(w).h(h).top(top).left(left)
				.setStyle("backgroundImage", "url(" + this.urlPrefix + backImg.url + "?token=" + this.jwtToken + ")")
				.build(canvas);

			var crop = db.div("MatcToolbarImagePositionCrop")
				.w(w).h(h).top(top).left(left)
				.build(canvas);

			this.own(on(crop, "mousedown", lang.hitch(this, "onMouse")));

			var s = this.$new(HSlider);
			s.setMax(100);
			s.setMin(0);
			s.placeAt(row);
			var zoom = 100;
			if (widget.style.backgroundSize) {
				zoom = (Math.round(10000 / widget.style.backgroundSize));
			}
			s.setValue(zoom);
			this.own(on(s, "change", lang.hitch(this, "onZoomChange")));

			// FIXME: restore the position properly
			//			if (widget.style.backgroundPosition){
			//				console.debug("pos",widget.style.backgroundPosition);
			//				top = -1 * h *  widget.style.backgroundPosition.top;
			//				top = Math.min(Math.max(0, top), h - zoom * h);
			//				left = -1 * w *  widget.style.backgroundPosition.left;
			//				left = Math.min(Math.max(0, left), w - zoom * w);
			//				crop.style.top = top + "px";
			//				crop.style.left = left + "px";
			//			}

			this.slider = s;
			this.img = img;
			this.cntr = cntr;
			this.crop = crop;
			this.pos = pos;
			this.scale = scale;
			this.top = top;
			this.w = w;
			this.h = h;
			this.left = left;
			this.style = widget.style;
			this.onZoomChange();

			return w
		},

		onMouse(e) {
			this.stopEvent(e)
			this._mouseMove = on(this.cntr, "mousemove", lang.hitch(this, "onMouseMove"));
			this._mouseUp = on(win.body(), "mouseup", lang.hitch(this, "onMouseUp"));
			this._mouseStart = this.getMouse(e);
		},

		onMouseMove(e) {
			this.stopEvent(e)
			if (!this._mouseStart) {
				this.cleanUp();
			}
			var mouse = this.getMouse(e);
			var zoom = this.slider.getValue() / 100;
			var left = Math.min(Math.max(0, this.left - (this._mouseStart.x - mouse.x)), this.w - zoom * this.w);
			var top = Math.min(Math.max(0, this.top - (this._mouseStart.y - mouse.y)), this.h - zoom * this.h);
			this.crop.style.top = top + "px";
			this.crop.style.left = left + "px";
		},

		onMouseUp(e) {
			this.stopEvent(e)
			var zoom = this.slider.getValue() / 100;
			var mouse = this.getMouse(e);
			this.left = Math.min(Math.max(0, this.left - (this._mouseStart.x - mouse.x)), this.w - zoom * this.w);
			this.top = Math.min(Math.max(0, this.top - (this._mouseStart.y - mouse.y)), this.h - zoom * this.h);
			this.cleanUp();
			this.onChange();
		},

		onZoomChange() {
			var zoom = this.slider.getValue() / 100;
			this.crop.style.width = zoom * this.w + "px";
			this.crop.style.height = zoom * this.h + "px";
			this.crop.style.borderTopRightRadius = zoom * this.style.borderTopRightRadius + "px";
			this.crop.style.borderTopLeftRadius = zoom * this.style.borderTopLeftRadius + "px";
			this.crop.style.borderBottomRightRadius = zoom * this.style.borderBottomRightRadius + "px";
			this.crop.style.borderBottomLeftRadius = zoom * this.style.borderBottomLeftRadius + "px";

			this.onChange();
		},

		onChange_new: function () {
			var zoom = this.slider.getValue() / 100;
			console.debug(this.left, this.w)
			var t = ((this.top / this.h) * -1);
			var l = ((this.left / this.w) * -1);
			var style = {
				backgroundSize: Math.round(100 / zoom),
				backgroundPosition: {
					top: (t / zoom),
					left: (l / zoom)
				}
			}
			return style;
		},

		onChange() {
			var zoom = this.slider.getValue() / 100;

			// var w = zoom * this.w;
			// var h = zoom * this.h;
			var t = ((this.top / this.h) * -1);
			var l = ((this.left / this.w) * -1);
			// FIXME: if we are in the top lower corner there is a small white gap. Dunno why.
			var style = {
				backgroundSize: Math.round(100 / zoom),
				backgroundPosition: {
					top: (t / zoom),
					left: (l / zoom)
				}
			}
			return style;
		},

		save(d) {
			if (this.slider) {
				var style = this.onChange();
				this.emit("change", style);
			}
			d.close();
			this.cleanUp();
		},


		getMouse(e) {
			var result = {};
			result.x = e.pageX;
			result.y = e.pageY;
			return result;
		},

		cleanUp() {
			if (this._mouseMove) {
				this._mouseMove.remove();
			}
			if (this._mouseUp) {
				this._mouseUp.remove();
			}
			delete this._mouseUp;
			delete this._mouseMove;
			delete this._mouseStart;
		},

		renderCropper_new(widget, cntr, row, db) {
			var img = widget.style.backgroundImage;
			var pos = domGeom.position(cntr);

			var scale = pos.h / img.h;
			var imageH = pos.h;
			var imageW = Math.round(img.w * scale);
			if (imageW > pos.w) {
				scale = ((pos.w) / img.w);
				imageW = pos.w;
				imageH = Math.round(img.h * scale);
			}
			
			var canvas = db.div("MatcToolbarImagePositionCanvas MatcMiddle")
				.w(imageW).h(imageH).build(cntr);
			
	
			db.div("MatcToolbarImagePositionImg")
				.w(imageW).h(imageH).top(0).left(0)
				.setStyle("backgroundImage", "url(" + this.urlPrefix + img.url + ")")
				.build(canvas);
			

			// we scale in width! default is 100%
			var top = 0;
			var left = 0;
			scale = img.w / widget.w
			var cropH = Math.round(widget.h * scale);
			var cropW = Math.round(widget.w * scale);

			var crop = db.div("MatcToolbarImagePositionCrop")
				.w(cropW).h(cropH).top(top).left(left)
				.build(canvas);

			this.own(on(crop, "mousedown", lang.hitch(this, "onMouse")));

			var s = this.$new(HSlider);
			s.setMax(100);
			s.setMin(0);
			s.placeAt(row);

			var zoom = 100;

			if (widget.style.backgroundSize) {
				zoom = (Math.round(10000 / widget.style.backgroundSize));
			}
			s.setValue(zoom);
			this.own(on(s, "change", lang.hitch(this, "onZoomChange")));

			this.slider = s;
			this.img = img;
			this.cntr = cntr;
			this.crop = crop;
			this.pos = pos;
			this.scale = scale;
			this.top = top;
			this.w = cropW;
			this.h = cropH;
			this.imageH = imageH;
			this.imageW = imageW;
			this.left = left;
			this.style = widget.style;
			this.onZoomChange();

			return imageW
		},

		destroy() {
			this.cleanUpTempListener();
			this.cleanUp();
		}
	},
	mounted() {
	}
}
</script>