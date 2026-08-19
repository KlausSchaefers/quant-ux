
<template>
	<div class="MatcToolbarPopUpCntr">
		<div type="button" ref="button" class="MatcToolbarItem MatcToolbarDropDownButton MatcToolbarIconButton">
			<QIcon :icon="icon" v-if="icon"></QIcon>
			<label data-dojo-attach-point="label" class="MatcToolbarItemLabel"></label>
			<span class="caret" ref="caret"></span>
		</div>
		<div class="MatcToolbarPopUp MatcToolbarDropDownButtonPopup MatcToolbarSliderPopup" role="menu" data-dojo-attach-point="popup">
			
				<div ref="sliderCntr" class="MatcToolbarSliderCntr">
				</div>
			
		</div>
	</div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import css from 'dojo/css'
import lang from 'dojo/_base/lang'
import on from 'dojo/on'
import _DropDown from './_DropDown'
import ToolbarSlider from './ToolbarSlider'
import QIcon from 'page/QIcon'

export default {
	name: 'ToolbarSliderButton',
	props: ['qMin', 'qMax', 'qValue', 'qIcon', 'qLabel', 'qUpdateLabel', 'qReposition', 'qPostfix', 'qCenter', 'qStep'],
	mixins: [DojoWidget, _DropDown],
	data: function () {
		return {
			icon: '',
			value: 0,
			min: 0,
			max: 100,
			center: false,
			step: 1,
			hasCaret: true,
			updateLabel: true,
			postfix: '',
			arrowPosition: "right",
			currentLabel: '',
			tempValue: null
		}
	},
	components: {
		'QIcon': QIcon
	},
	methods: {

		// onVisible() {
		// 	if (this.slider) {
		// 		setTimeout(() => {
		// 			this.slider.focus()
		// 		}, 100)
		// 	}
		// },

		setIcon(icon) {
			this.icon = icon
		},

		setLabelPostfix(postfix) {
			this.postfix = postfix;
		},

		setMinMax(min, max) {
			this.min = min
			this.max = max
			if (this.slider) {
				this.slider.min = min
				this.slider.max = max
			}
		},

		setStepSize(step) {
			this.step = step
			if (this.slider) {
				this.slider.setStepSize(step)
			}
		},

		init() {
			if (this.slider) {
				return
			}
			this.slider = this.$new(ToolbarSlider, { max: this.max, min: this.min, center: this.center, step: this.step });
			this.slider.placeAt(this.$refs.sliderCntr);
			this.slider.render();
			this.own(on(this.slider, "change", lang.hitch(this, "onSliderChange")));
			this.own(on(this.slider, "changing", lang.hitch(this, "onSliderChanging")));
			this.slider.setValue(this.value);
		},

		onSliderChanging() {
			const value = this.slider.getValue();
			this.tempValue = value;
			this.setLabel(value);
			this.emit("changing", value);
		},

		onSliderChange() {
			const value = this.slider.getValue();
			this.setValue(value);
		
			// give the user time to see the change
			setTimeout(() => {
				this.emit("change", value);
			}, 500)
		},

		setLabel(value) {
			if (value === this.currentLabel) {
				return
			}
			this.currentLabel = value

			if (this.updateLabel) {
				let l = value
				if (this.postfix) {
					l += this.postfix
				}
				this.label.innerHTML = l;
			}
		},

		setValue(value) {
			this.tempValue = null
			this.value = value;
			if (this.slider) {
				this.slider.setValue(value);
			}
			this.setLabel(value);
		},

		getValue() {
			return this.value;
		},

		onHide() {
			if (this.tempValue !== null && this.tempValue !== this.value) {
				// if we close and not click, e.g. because of ESC,
				// we show the old value
				this.emit("changing", this.value);
			}
		},

		hideCaret() {
			if (this.$refs.caret) {
				css.add(this.$refs.caret, 'MatcHidden')
			}
		}
	},
	watch: {
		qMin(v) {
			this.setMinMax(v, this.max)
		},
		qMax(v) {
			this.setMinMax(this.min, v)
		},
		qStep(v) {
			this.setStepSize(v)
		},
		qValue(v) {
			this.setValue(v)
		}
	},
	mounted() {
		if (this.qUpdateLabel === false) {
			this.updateLabel = false
		}
		if (this.qReposition) {
			this.reposition = true
		}
		if (this.qPostfix) {
			this.setLabelPostfix(this.qPostfix)
		}
		if (this.qIcon) {
			this.setIcon(this.qIcon)
		}
		if (this.qCenter) {
			this.center = true
		}
		if (this.qMin != null) {
			this.min = this.qMin
		}
		if (this.qMax != null) {
			this.max = this.qMax
		}
		if (this.qStep != null) {
			this.step = this.qStep
		}
		if (this.qValue != null) {
			this.setValue(this.qValue)
		}
		if (this.hasCaret === false) {
			this.hideCaret()
		}
	}
}
</script>
