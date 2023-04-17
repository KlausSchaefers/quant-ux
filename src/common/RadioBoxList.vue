
<template>
	<div class="VommondRadioBoxList"></div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import css from 'dojo/css'
import lang from 'dojo/_base/lang'
import on from 'dojo/on'
import touch from 'dojo/touch'
import RadioBox from 'common/RadioBox'

export default {
	name: 'RadioBoxList',
	mixins: [DojoWidget],
	props: ['qOptions', 'qValue'],
	data: function () {
		return {
			value: false,
			options: ""
		}
	},
	components: {},
	methods: {
		postCreate() {
			if (this.options) {
				var list = this.options.split(",");
				this.options = [];
				for (var i = 0; i < list.length; i++) {
					this.options.push({
						value: list[i],
						label: list[i]
					});
				}
				this.render(this.options);
			}
			//this.own(on(this.domNode, touch.press, lang.hitch(this, "onChange")));
		},


		setOptions(options) {
			this.options = options;
			this.render(options);
		},

		render(options) {

			var cntr = document.createElement("div");
			this.radios = {};
			for (var i = 0; i < options.length; i++) {
				var option = options[i];
				var row = document.createElement("div");
				css.add(row, "VommondRadioBoxListItem");
				var radio = this.$new(RadioBox);
				radio.placeAt(row);
				this.radios[option.value] = radio;

				var lbl = document.createElement("span");
				lbl.innerHTML = option.label;
				css.add(lbl, "VommondRadioBoxLabel");
				row.appendChild(lbl);
				cntr.appendChild(row);
				this.own(on(row, touch.press, lang.hitch(this, "onChange", option)));
			}
			this.domNode.appendChild(cntr);
		},

		onChange(option) {
			this.setValue(option.value);
			this.emit("change", this.value);
		},

		getValue() {
			return this.value;
		},

		setValue(value) {
			this.value = value;
			for (var i = 0; i < this.options.length; i++) {
				var option = this.options[i];
				var radio = this.radios[option.value];

				if (value == option.value) {
					radio.setValue(true);
				} else {
					radio.setValue(false);
				}
			}
		}
	},
	mounted() {
		if (this.qOptions) {
			this.setOptions(this.qOptions)
		}
		if (this.qValue) {
			this.setValue(this.qValue)
		}
	}
}
</script>