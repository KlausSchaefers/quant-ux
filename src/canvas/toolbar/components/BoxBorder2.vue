
<template>
	<div class="MatcDesignTokenMixin">
		<DesignTokenView v-show="hasDesignToken" :designtoken="currentDesignToken" />
		<div class="MatcBoxBorder2" v-show="!hasDesignToken" ref="cntr"></div>
	</div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'

import lang from 'dojo/_base/lang'
import on from 'dojo/on'
import topic from 'dojo/topic'
import _Tooltip from 'common/_Tooltip'
import ToolbarSlider from './ToolbarSlider'
import ToolbarColor from './ToolbarColor'
import _DesignToken from './_DesignToken'
import DesignTokenView from './DesignTokenView'

export default {
	name: 'BoxBorder2',
	mixins: [_Tooltip, _DesignToken, DojoWidget],
	data: function () {
		return {
			value: false,
			tab: "Width",
			isLocked: true,
			borderWidth: ["borderTopWidth", "borderBottomWidth", "borderLeftWidth", "borderRightWidth"],
			borderColor: ["borderTopColor", "borderBottomColor", "borderRightColor", "borderLeftColor"],
			colorWidgets: [],
			inputEvent: "change"
		}
	},
	components: {
		'DesignTokenView': DesignTokenView
	},
	methods: {

		render() {
			if (!this.rendered) {

				let cntr = this.$refs.cntr

				/**
				 * color
				 */
				this.color = this.renderColorBox(cntr);
				this.addTooltip(this.color.domNode, "Border Color");

				this.own(on(this.color, this.inputEvent, lang.hitch(this, "setColor", "borderTopColor", this.color)));
				this.own(on(this.color, "changing", lang.hitch(this, "setTempColor", "borderTopColor", this.color)));

				this.width = this.renderIntBox(cntr);
				this.own(on(this.width, "change", lang.hitch(this, "setWidth", "borderTopWidth")));
				this.own(on(this.width, "changing", lang.hitch(this, "setTempWidth", "borderTopWidth")));

				this.rendered = true;
			}
		},

		renderIntBox(parent) {
			var input = this.$new(ToolbarSlider, { max: 16 });
			input.placeAt(parent);
			input.render();
			return input;
		},

		renderColorBox(parent) {
			var widget = this.$new(ToolbarColor, { hasPicker: true });
			//widget.updateBackground = true;
			widget.placeAt(parent);
			widget.keepOpenOnTypeSelection = "widget";
			widget.reposition = true;
			widget.updateLabel = true;
			widget.setLabel();
			if (this.model) {
				widget.setModel(this.model);
			}
			if (this.colorWidgets) {
				this.colorWidgets.push(widget);
			}
			return widget;
		},

		blur() {
			if (this.width) {
				this.width.blur();
			}
		},

		setTempWidth(key, value) {
			value = value * 1;
			this.value[key] = value;
			for (var i = 0; i < 4; i++) {
				var k = this.borderWidth[i];
				this.value[k] = value;
			}
			this.emit("changing", this.getDelta(this.value));
			this.closeColor();
		},

		setWidth(key, value) {
			value = value * 1;
			this.value[key] = value;
			for (var i = 0; i < 4; i++) {
				var k = this.borderWidth[i];
				this.value[k] = value;
			}
			this.emit("change", this.getDelta(this.value));
			this.closeColor();
		},

		closeColor() {
			topic.publish("matc/canvas/click", "", "");
		},

		setColor(key, input, value) {
			this.value[key] = value;
			for (var i = 0; i < 4; i++) {
				var k = this.borderColor[i];
				this.value[k] = value;
			}
			this.emit("change", this.getDelta(this.value));
		},

		setTempColor(key, input, value) {
			this.value[key] = value;
			for (var i = 0; i < 4; i++) {
				var k = this.borderColor[i];
				this.value[k] = value;
			}
			this.emit("changing", this.getDelta(this.value));
		},


		update() {

		},


		setValue(v) {
			this.render();
			/**
			 * Clone object as we toggle the value in the toogle()
			 * method and as consequence the command delta
			 * would be null!
			 */
			var clone = {};
			for (var i = 0; i < 4; i++) {
				var w = this.borderWidth[i];
				clone[w] = v[w];

				var c = this.borderColor[i];
				clone[c] = v[c];
			}
			this.value = clone;
			this.orginalValue = v;
			this.color.setValue(clone.borderTopColor);
			this.width.setValue(clone.borderTopWidth);
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
			if (this.color) {
				this.color.setModel(m);
			}
			this.model = m;
		}
	},
	mounted() {
	}
}
</script>