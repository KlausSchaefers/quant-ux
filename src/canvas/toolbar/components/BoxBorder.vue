
<template>
	<div class="MatcDesignTokenMixin">
		<DesignTokenView v-show="hasDesignToken" :designtoken="currentDesignToken" />
		<div v-show="!hasDesignToken">
			<div class=" MatcBoxBorder MatcToolbarTabContainer">
				<div class="MatcToolbarTabs">
					<a class="MatcToolbarTabActive" data-dojo-attach-point="tabWidth">Width</a>
					<a data-dojo-attach-point="tabColor">Color</a>
					<a data-dojo-attach-point="tabRadius">Radius</a>
					<a data-dojo-attach-point="tabStyle">Style</a>
				</div>
				<div class="MatcBoxBorderContainer hidden" data-dojo-attach-point="cntrWidth">
				</div>
				<div class="MatcBoxBorderContainer hidden" data-dojo-attach-point="cntrRadius">
				</div>
				<div class="MatcBoxBorderContainer hidden" data-dojo-attach-point="cntrColor">
				</div>
				<div class="MatcBoxBorderContainer hidden" data-dojo-attach-point="cntrStyle">
				</div>
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
import DomBuilder from 'common/DomBuilder'
import ToolbarDropDownButton from './ToolbarDropDownButton'
import InputDropDownButton from './InputDropDownButton'
import ToolbarColor from './ToolbarColor'
import _DesignToken from './_DesignToken'
import DesignTokenView from './DesignTokenView'
import {iconDOM} from '../../../page/QIconUtil'

export default {
	name: 'BoxBorder',
	props: ['isChildDropDown'],
	mixins: [_DesignToken, DojoWidget],
	data: function () {
		return {
			value: false,
			tab: "Width",
			isLocked: true,
			borderWidth: ["borderTopWidth", "borderBottomWidth", "borderLeftWidth", "borderRightWidth"],
			borderRadius: ["borderTopLeftRadius", "borderTopRightRadius", "borderBottomLeftRadius", "borderBottomRightRadius"],
			borderColor: ["borderTopColor", "borderBottomColor", "borderRightColor", "borderLeftColor"],
			borderStyle: ["borderTopStyle", "borderBottomStyle", "borderRightStyle", "borderLeftStyle"],
			inputEvent: "change"
		}
	},
	components: {
		'DesignTokenView': DesignTokenView
	},
	methods: {
		postCreate() {

			this.db = new DomBuilder();

			this.own(on(this.tabWidth, touch.press, lang.hitch(this, "showWidth")));
			this.own(on(this.tabColor, touch.press, lang.hitch(this, "showColor")));
			this.own(on(this.tabRadius, touch.press, lang.hitch(this, "showRadius")));
			this.own(on(this.tabStyle, touch.press, lang.hitch(this, "showStyle")));


			this.render();
		},

		render() {
			if (!this.rendered) {


				/**
				 * Width
				 */
				var cntrPos = { w: 150, h: 75 };
				var inputPos = { w: 45, h: 24 };

				//domGeom.position(this.cntrWidth);


				var options = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 20];

				this.topWidth = this.renderIntBox(this.cntrWidth, options);
				this.topWidth.domNode.style.top = -1 * ((inputPos.h / 2) - 1) + "px";
				this.topWidth.domNode.style.left = (cntrPos.w - inputPos.w) / 2 + "px";

				this.bottomWidth = this.renderIntBox(this.cntrWidth, options);
				this.bottomWidth.domNode.style.bottom = -1 * ((inputPos.h / 2) - 1) + "px";
				this.bottomWidth.domNode.style.left = (cntrPos.w - inputPos.w) / 2 + "px";

				this.leftWidth = this.renderIntBox(this.cntrWidth, options);
				this.leftWidth.domNode.style.top = (cntrPos.h - inputPos.h) / 2 - 1 + "px";
				this.leftWidth.domNode.style.left = -1 * ((inputPos.w / 2) - 1) + "px";

				this.rightWidth = this.renderIntBox(this.cntrWidth, options);
				this.rightWidth.domNode.style.top = (cntrPos.h - inputPos.h) / 2 - 1 + "px";
				this.rightWidth.domNode.style.right = -1 * ((inputPos.w / 2) - 1) + "px";

				this.lockWidth = this.renderLock(this.cntrWidth, cntrPos);

				this.own(on(this.topWidth, this.inputEvent, lang.hitch(this, "setWidth", "borderTopWidth", this.topWidth)));
				this.own(on(this.bottomWidth, this.inputEvent, lang.hitch(this, "setWidth", "borderBottomWidth", this.bottomWidth)));
				this.own(on(this.leftWidth, this.inputEvent, lang.hitch(this, "setWidth", "borderLeftWidth", this.leftWidth)));
				this.own(on(this.rightWidth, this.inputEvent, lang.hitch(this, "setWidth", "borderRightWidth", this.rightWidth)));
				this.own(on(this.lockWidth, touch.press, lang.hitch(this, "toggleLock", this.lockWidth)));


				/**
				 * radius
				 */
				options = [0, 2, 4, 8, 12, 16, 24, 32, 64, 128, 256];

				this.topRightRadius = this.renderIntBox(this.cntrRadius, options);
				this.topRightRadius.domNode.style.top = -1 * ((inputPos.h / 2) - 1) + "px";
				this.topRightRadius.domNode.style.right = -1 * ((inputPos.w / 2) - 1) + "px";

				this.topLeftRadius = this.renderIntBox(this.cntrRadius, options);
				this.topLeftRadius.domNode.style.top = -1 * ((inputPos.h / 2) - 1) + "px";
				this.topLeftRadius.domNode.style.left = -1 * ((inputPos.w / 2) - 1) + "px";

				this.bottomRightRadius = this.renderIntBox(this.cntrRadius, options);
				this.bottomRightRadius.domNode.style.bottom = -1 * ((inputPos.h / 2) - 1) + "px";
				this.bottomRightRadius.domNode.style.right = -1 * ((inputPos.w / 2) - 1) + "px";

				this.bottomLeftRadius = this.renderIntBox(this.cntrRadius, options);
				this.bottomLeftRadius.domNode.style.bottom = -1 * ((inputPos.h / 2) - 1) + "px";
				this.bottomLeftRadius.domNode.style.left = -1 * ((inputPos.w / 2) - 1) + "px";

				this.lockRadius = this.renderLock(this.cntrRadius, cntrPos);

				this.own(on(this.topRightRadius, this.inputEvent, lang.hitch(this, "setRadius", "borderTopRightRadius", this.topRightRadius)));
				this.own(on(this.topLeftRadius, this.inputEvent, lang.hitch(this, "setRadius", "borderTopLeftRadius", this.topLeftRadius)));
				this.own(on(this.bottomRightRadius, this.inputEvent, lang.hitch(this, "setRadius", "borderBottomRightRadius", this.bottomRightRadius)));
				this.own(on(this.bottomLeftRadius, this.inputEvent, lang.hitch(this, "setRadius", "borderBottomLeftRadius", this.bottomLeftRadius)));
				this.own(on(this.lockRadius, touch.press, lang.hitch(this, "toggleLock", this.lockRadius)));


				/**
				 * color
				 */
				this.topColor = this.renderColorBox(this.cntrColor);
				this.topColor.domNode.style.top = -1 * ((inputPos.h / 2) - 1) + "px";
				this.topColor.domNode.style.left = (cntrPos.w - inputPos.w) / 2 + "px";

				this.bottomColor = this.renderColorBox(this.cntrColor);
				this.bottomColor.domNode.style.bottom = -1 * ((inputPos.h / 2) - 1) + "px";
				this.bottomColor.domNode.style.left = (cntrPos.w - inputPos.w) / 2 + "px";

				this.leftColor = this.renderColorBox(this.cntrColor);
				this.leftColor.domNode.style.top = (cntrPos.h - inputPos.h) / 2 - 1 + "px";
				this.leftColor.domNode.style.left = -1 * ((inputPos.w / 2) - 1) + "px";

				this.rightColor = this.renderColorBox(this.cntrColor);
				this.rightColor.domNode.style.top = (cntrPos.h - inputPos.h) / 2 - 1 + "px";
				this.rightColor.domNode.style.right = -1 * ((inputPos.w / 2) - 1) + "px";

				this.lockColor = this.renderLock(this.cntrColor, cntrPos);

				this.own(on(this.topColor, this.inputEvent, lang.hitch(this, "setColor", "borderTopColor", this.topColor)));
				this.own(on(this.bottomColor, this.inputEvent, lang.hitch(this, "setColor", "borderBottomColor", this.bottomColor)));
				this.own(on(this.leftColor, this.inputEvent, lang.hitch(this, "setColor", "borderLeftColor", this.leftColor)));
				this.own(on(this.rightColor, this.inputEvent, lang.hitch(this, "setColor", "borderRightColor", this.rightColor)));
				this.own(on(this.lockColor, touch.press, lang.hitch(this, "toggleLock", this.lockColor)));

				this.own(on(this.topColor, "changing", lang.hitch(this, "setTempColor", "borderTopColor", this.topColor)));
				this.own(on(this.bottomColor, "changing", lang.hitch(this, "setTempColor", "borderBottomColor", this.bottomColor)));
				this.own(on(this.leftColor, "changing", lang.hitch(this, "setTempColor", "borderLeftColor", this.leftColor)));
				this.own(on(this.rightColor, "changing", lang.hitch(this, "setTempColor", "borderRightColor", this.rightColor)));



				/**
				 * style
				 */
				this.topStyle = this.renderStyleBox(this.cntrStyle);
				this.topStyle.domNode.style.top = -1 * ((inputPos.h / 2) - 1) + "px";
				this.topStyle.domNode.style.left = (cntrPos.w - inputPos.w) / 2 + "px";

				this.bottomStyle = this.renderStyleBox(this.cntrStyle);
				this.bottomStyle.domNode.style.bottom = -1 * ((inputPos.h / 2) - 1) + "px";
				this.bottomStyle.domNode.style.left = (cntrPos.w - inputPos.w) / 2 + "px";

				this.leftStyle = this.renderStyleBox(this.cntrStyle);
				this.leftStyle.domNode.style.top = (cntrPos.h - inputPos.h) / 2 - 1 + "px";
				this.leftStyle.domNode.style.left = -1 * ((inputPos.w / 2) - 1) + "px";

				this.rightStyle = this.renderStyleBox(this.cntrStyle);
				this.rightStyle.domNode.style.top = (cntrPos.h - inputPos.h) / 2 - 1 + "px";
				this.rightStyle.domNode.style.right = -1 * ((inputPos.w / 2) - 1) + "px";

				this.lockStyle = this.renderLock(this.cntrStyle, cntrPos);

				this.own(on(this.topStyle, this.inputEvent, lang.hitch(this, "setStyle", "borderTopStyle", this.topStyle)));
				this.own(on(this.bottomStyle, this.inputEvent, lang.hitch(this, "setStyle", "borderBottomStyle", this.bottomStyle)));
				this.own(on(this.leftStyle, this.inputEvent, lang.hitch(this, "setStyle", "borderLeftStyle", this.leftStyle)));
				this.own(on(this.rightStyle, this.inputEvent, lang.hitch(this, "setStyle", "borderRightStyle", this.rightStyle)));
				this.own(on(this.lockStyle, touch.press, lang.hitch(this, "toggleLock", this.lockStyle)));


				this.rendered = true;
			}
		},

		renderStyleBox(parent) {
			const widget = this.$new(ToolbarDropDownButton);
			widget.placeAt(parent);
			widget.reposition = true;
			widget.updateLabel = true;
			widget.isChildDropDown = this.isChildDropDown
			widget.maxLabelLength = 2000;
			widget.setOptions([
				{ value: "solid", label: '<div class="MatcBorderStyle"><div class="MatcBorderStyleSolid"></div></div>' },
				{ value: "dashed", label: '<div class="MatcBorderStyle"><div class="MatcBorderStyleDashed"></div></div>' },
				{ value: "dotted", label: '<div class="MatcBorderStyle"><div class="MatcBorderStyleDotted"></div></div>' }
			]);
			return widget;
		},

		renderIntBox(parent, options) {
			const input = this.$new(InputDropDownButton);
			input.setOptions(options);
			input.placeAt(parent);
			input.isChildDropDown = this.isChildDropDown
			input.reposition = true;
			return input;
		},

		renderColorBox(parent) {
			const widget = this.$new(ToolbarColor, { hasPicker: true });
			widget.updateBackground = true;
			widget.placeAt(parent);
			widget.keepOpenOnTypeSelection = "widget";
			widget.reposition = true;
			widget.isChildDropDown = this.isChildDropDown
			if (this.colorWidgets) {
				this.colorWidgets.push(widget)
			}
			return widget;
		},

		

		blur () {
			if (this.rendered) {
				this.topRightRadius.blur();
				this.topLeftRadius.blur();
				this.bottomRightRadius.blur();
				this.bottomLeftRadius.blur();

				this.topWidth.blur();
				this.bottomWidth.blur();
				this.leftWidth.blur();
				this.rightWidth.blur();
			}

		},

		show  () {
			if (this["show" + this.tab]) {
				this["show" + this.tab]();
			}
		},

		showStyle () {
			this._resetTabs(this.tabStyle, this.cntrStyle);
			this.tab = "Style";
			this.isLocked = this.isEqual(this.borderStyle);
			this.setLock(this.lockWidth);
			this.topStyle.setValue(this.value.borderTopStyle);
			this.bottomStyle.setValue(this.value.borderBottomStyle);
			this.leftStyle.setValue(this.value.borderLeftStyle);
			this.rightStyle.setValue(this.value.borderRightStyle);
			for (let i = 0; i < 4; i++) {
				const k = this.borderStyle[i];
				this.cntrStyle.style[k] = this.value[k];
			}
		},

		setStyle(key, input, value) {

			this.value[key] = value;
			if (this.isLocked) {
				for (let i = 0; i < 4; i++) {
					const k = this.borderStyle[i];
					this.value[k] = value;
				}
			}
			this.emit("change", this.value);
		},

		showWidth() {
			this._resetTabs(this.tabWidth, this.cntrWidth);
			this.tab = "Width";
			this.isLocked = this.isEqual(this.borderWidth);
			this.setLock(this.lockWidth);
			this.topWidth.setValue(this.value.borderTopWidth);
			this.bottomWidth.setValue(this.value.borderBottomWidth);
			this.leftWidth.setValue(this.value.borderLeftWidth);
			this.rightWidth.setValue(this.value.borderRightWidth);
		},


		setWidth(key, input, value) {
			value = value * 1;
			if (this.isValid(value)) {
				this.value[key] = value;
				if (this.isLocked) {
					for (let i = 0; i < 4; i++) {
						const k = this.borderWidth[i];
						this.value[k] = value;
					}
				}
				this.emit("change", this.getDelta(this.value));
			}
		},


		showColor() {
			this._resetTabs(this.tabColor, this.cntrColor);
			this.tab = "Color";
			this.isLocked = this.isEqual(this.borderColor);
			this.setLock(this.lockColor);
			this.topColor.setValue(this.value.borderTopColor);
			this.bottomColor.setValue(this.value.borderBottomColor);
			this.leftColor.setValue(this.value.borderLeftColor);
			this.rightColor.setValue(this.value.borderRightColor);
		},

		setColor(key, input, value) {
			this.value[key] = value;
			if (this.isLocked) {
				for (var i = 0; i < 4; i++) {
					var k = this.borderColor[i];
					this.value[k] = value;
				}
			}
			this.emit("change", this.getDelta(this.value));
		},

		setTempColor(key, input, value) {
			this.value[key] = value;
			if (this.isLocked) {
				for (var i = 0; i < 4; i++) {
					var k = this.borderColor[i];
					this.value[k] = value;
				}
			}
			this.emit("changing", this.getDelta(this.value));
		},

		showRadius() {
			this._resetTabs(this.tabRadius, this.cntrRadius);
			this.tab = "Radius";
			this.isLocked = this.isEqual(this.borderRadius);
			this.setLock(this.lockRadius);
			this.topRightRadius.setValue(this.value.borderTopRightRadius);
			this.topLeftRadius.setValue(this.value.borderTopLeftRadius);
			this.bottomRightRadius.setValue(this.value.borderBottomRightRadius);
			this.bottomLeftRadius.setValue(this.value.borderBottomLeftRadius);
		},

		setRadius(key, input, value) {
			value = value * 1;
			if (this.isValid(value)) {
				this.value[key] = value;
				if (this.isLocked) {
					for (var i = 0; i < 4; i++) {
						var k = this.borderRadius[i];
						this.value[k] = value;
					}
				}
				this.emit("change", this.getDelta(this.value));
			}
		},

		toggleLock(lock) {
			this.isLocked = !this.isLocked;
			this.setLock(lock);
		},

		renderLock(node, cntrPos) {

			const div = this.db.div("MatcToolbarItem").build(node);
			const lock = iconDOM('LockOpen')
			div.appendChild(lock)

			const inputPos = { h: 40, w: 45 };
			div.style.top = (cntrPos.h - inputPos.h) / 2 - 1 + "px";
			div.style.left = (cntrPos.w - inputPos.w) / 2 + "px";

			this.setLock(div);

			return div;
		},

		setLock(div) {
			div.innerText = ""
			if (!this.isLocked) {
				const lock = iconDOM('LockOpen')
				div.appendChild(lock)
			} else {		
				const lock = iconDOM('LockClosed')
				div.appendChild(lock)
			}
		},

		isEqual(list) {
			let last = null;
			let result = true;
			for (let i = 0; i < list.length; i++) {
				const key = list[i];
				const current = this.value[key];
				if (last != null) {
					result &= current == last;
				}
				last = current;
			}

			return result;
		},

		isValid(value) {
			const er = /^-?[0-9]+$/;
			const valid = er.test(value);
			if (!valid) {
				return false;
			}
			if (value >= 0) {
				return true;
			}
			return false;
		},
		update() {
		},
		_resetTabs(tab, cntr) {

			this.render();

			css.remove(this.tabStyle, "MatcToolbarTabActive");
			css.remove(this.tabWidth, "MatcToolbarTabActive");
			css.remove(this.tabColor, "MatcToolbarTabActive");
			css.remove(this.tabRadius, "MatcToolbarTabActive");

			css.add(this.cntrWidth, "hidden");
			css.add(this.cntrColor, "hidden");
			css.add(this.cntrRadius, "hidden");
			css.add(this.cntrStyle, "hidden");

			css.add(tab, "MatcToolbarTabActive");
			css.remove(cntr, "hidden");
		},

		setValue(v) {

			/**
			 * Clone object as we toggle the value in the toogle()
			 * method and as consequence the command delta
			 * would be null!
			 */
			var clone = {};
			for (let i = 0; i < 4; i++) {
				var s = this.borderStyle[i];
				clone[s] = v[s];

				var w = this.borderWidth[i];
				clone[w] = v[w];

				var r = this.borderRadius[i];
				clone[r] = v[r];

				var c = this.borderColor[i];
				clone[c] = v[c];
			}

			this.value = clone;
			for (let i = 0; i < 4; i++) {
				var k = this.borderStyle[i];
				if (!this.value[k]) {
					this.value[k] = "solid";
				}
			}
			this.orginalValue = v;
			this.show();
		},

		getDelta(value) {
			var delta = {};
			for (var key in value) {
				var o = this.orginalValue[key];
				var n = value[key];
				if (o != n) {
					delta[key] = n;
				}
			}
			return delta;
		},

		setModel(m) {
			this.topColor.setModel(m);
			this.bottomColor.setModel(m);
			this.leftColor.setModel(m);
			this.rightColor.setModel(m);
			this.model = m
		}
	},
	mounted() {
		if (this.isChildDropDown) {
			this.postCreate()
		}
	}
}
</script>