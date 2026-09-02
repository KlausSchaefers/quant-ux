
<template>
	<div class="MatcToolbarPopUpCntr">
		<div type="button" ref="button" class="MatcToolbarItem MatcToolbarDropDownButton MatcToolbarIconButton">
			<QIcon icon="Grid" />
			<span class="MatcToolbarItemLabel">Column &amp; Row Sizes</span>
		</div>
		<div class="MatcToolbarPopUp MatcGridConfigPopup MatcToolbarDropDownButtonPopup" role="menu" data-dojo-attach-point="popup" @click.stop="" @mousedown.stop="">
			<GridConfigSettings ref="settings" @change="onSettingsChange" @resize="onResize" />
		</div>
	</div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import _DropDown from './_DropDown'
import GridConfigSettings from './GridConfigSettings'
import QIcon from 'page/QIcon'

export default {
	name: 'GridConfig',
	mixins: [DojoWidget, _DropDown],
	data: function () {
		return {
			widget: null,
			reposition: true,
			arrowPosition: "right"
		}
	},
	components: {
		'GridConfigSettings': GridConfigSettings,
		'QIcon': QIcon
	},
	methods: {

		setWidget (widget) {
			this.widget = widget
			console.debug('setWidget', widget.props)

			if (this.widget) {
				this.$refs.settings.setWidget(this.widget)
			}
		},

		onHide () {
			if (this.tempValue) {
				console.debug('change', this.tempValue)
				this.emit('change', this.tempValue)
			}
		},

		onTempChange (v) {
			this.tempValue = v
			//this.emit('changing', this.tempValue)
		},


		onVisible () {
			console.debug('onVisible')
		},

		onResize () {
			this.updatePosition()
		},

		onSettingsChange (key, value) {
			if (!this.tempValue) {
				this.tempValue = {}
			}
			this.tempValue[key] = value
			this.emit('changing', key, value)
		}
	}
}
</script>
