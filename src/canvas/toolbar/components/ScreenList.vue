
<template>
	<div class="MatcToolbarScreenList">
	</div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import lang from 'dojo/_base/lang'
import on from 'dojo/on'
import touch from 'dojo/touch'
import Logger from 'common/Logger'
import Dialog from 'common/Dialog'
import DomBuilder from 'common/DomBuilder'
import ScrollContainer from 'common/ScrollContainer'
import Preview from 'page/Preview'
import Util from 'core/Util'
import {iconDOM} from 'page/QIconUtil'

export default {
	name: 'ScreenList',
	mixins: [Util, DojoWidget],
	data: function () {
		return {
			previewWidth: 150
		}
	},
	components: {},
	methods: {
		postCreate() {
			this.logger = new Logger("ScreenList");
			this.db = new DomBuilder();
		},


		setModel(model) {
			this.model = model;
		},


		setScreen(screen) {
			this.screen = screen;
			this.render(screen);
		},

		setJwtToken(t) {
			this.jwtToken = t
		},

		render() { // screen param removed
			this.cleanUp();
			var cntr = this.db.div("").build();
			var parents = this.getParents();
			for (var i = 0; i < parents.length; i++) {
				var screenID = parents[i];
				if (this.model.screens[screenID]) {
					var screen = this.model.screens[screenID];
					var div = this.db.div(" MatcToolbarItem MatcToobarActionCntr MatcToolbarIconButton").build(cntr);
					div.appendChild(iconDOM("MasterScreen"))
					this.db.span("MatcToolbarItemLabel", screen.name).build(div);
					var btn = this.db.span("MatcToobarRemoveBtn ")
						.tooltip("Remove Master", "vommondToolTipRightBottom")
						.build(div);
					
					btn.appendChild(iconDOM("DeleteX"))
					this.tempOwn(on(btn, touch.press, lang.hitch(this, "onRemoveParent", i)));
				} else {
					console.warn("render() > no screen with id" + screenID);
				}
			}
			this.domNode.appendChild(cntr);
			var add = this.db.div("MatcPointer  MatcToolbarItem MatcToolbarIconButton").build();
			add.appendChild(iconDOM("Plus"))
			this.db.span("MatcToolbarItemLabel", "Add Master Screen").build(add);
			this.tempOwn(on(add, touch.press, lang.hitch(this, "showDialog")));
			this.domNode.appendChild(add);
		},


		showDialog() {

			var d = new Dialog({ overflow: true });

			var div = this.db.div("MatcToolbarScreenListDialog MatcPadding").build();
			this.db.label("", "Select Parent Screen").build(div);
			var cntr = this.db.div("MatcToolbarScreenListDialogCntr").build(div);
			var list = this.db.div().build();

			var height = Math.min(this.model.screenSize.h / (this.model.screenSize.w / this.previewWidth), 250);

			this.previews = [];
			var parents = this.getParents();
			for (var screenID in this.model.screens) {
				/**
				 * Do not show the selected screen or any parents
				 */
				if (this.screen.id != screenID && (parents.indexOf(screenID) < 0)) {
					var screen = this.model.screens[screenID];
					/**
					 * Since 2.2.0 we have ScreenSegment
					 */
					if (!screen.segment) {
						var wrapper = this.db.div("MatcToolbarScreenListPreviewWrapper MatcCreateBtnElement MatcToolbarDropDownButtonItem").build(list);
						var screenCntr = this.db.div("MatcToolbarScreenListPreview").build(wrapper);
						screenCntr.style.width = this.previewWidth + "px";
						screenCntr.style.height = height + "px";
						var preview = this.$new(Preview);
						preview.setJwtToken(this.jwtToken);
						preview.setScreenPos({ w: this.previewWidth, h: height });
						preview.setModel(this.model);
						preview.setScreen(screenID);
						preview.placeAt(screenCntr);
						this.previews.push(preview);
						var lbl = this.db.div("MatcCreateBtnElementLabel", screen.name).build(wrapper);
						lbl.style.width = this.previewWidth + "px";
						d.own(on(wrapper, touch.press, lang.hitch(this, "onScreenSelected", screenID)));
					}
				}
			}

			var scroll = this.$new(ScrollContainer);
			scroll.placeAt(cntr);
			scroll.wrap(list);
			var bar = this.db.div("MatcButtonBar MatcMarginTop").build(div);
			var cancel = this.db.a("MatcButton", "Cancel").build(bar);


			d.own(on(cancel, touch.press, lang.hitch(d, "close")));
			d.own(on(d, "close", lang.hitch(this, "closeDialog")));
			d.popup(div, this.domNode);
			this.dialog = d;
		},

		onScreenSelected(screenID) {
			this.dialog.close()
			var parents = this.getParents();
			parents.push(screenID);
			this.onChange(parents)
		},

		onRemoveParent(i) {



			var parents = this.getParents();
			parents.splice(i, 1);

			this.onChange(parents)
		},

		getParents() {
			var parents = [];
			if (this.screen.parents) {
				parents = this.screen.parents;
			}
			return lang.clone(parents);
		},

		closeDialog() {

			for (var i = 0; i < this.previews.length; i++) {
				this.previews[i].destroy();
			}
			delete this.previews;
		},

		onChange(parents) {

			this.emit("change", parents);
		},

		_getAbstract(string, max) {
			if (string.length > max) {
				string = string.substring(0, max) + "...";
			}
			return string;
		},

		cleanUp() {
			this.cleanUpTempListener();
			this.domNode.innerHTML = "";
		}
	},
	mounted() {
	}
}
</script>