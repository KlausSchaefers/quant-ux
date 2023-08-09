
<template>
	<a class="MatcToolbarItem MatcToolbarToggleButton" @click="onChange">
		<QIcon :icon="icon" v-if="icon"></QIcon>
	</a>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import css from 'dojo/css'
import QIcon from 'page/QIcon'

export default {
	name: 'ToolbarToggleButton',
	mixins: [DojoWidget],
	data: function () {
		return {
			value: false,
			icon: ''
		}
	},
	components: {
		'QIcon': QIcon
	},
	methods: {
		postCreate() {
		},

		setLabel(label) {
			this.domNode.innerHTML += label;
		},

		setCss() {
		},

		setIcon(icon) {
			console.debug('setIcon', icon)
			this.icon = icon
		},


		setValue(value) {
			if (value) {
				css.add(this.domNode, "MatcToolbarItemActive");
			} else {
				css.remove(this.domNode, "MatcToolbarItemActive");
			}
			this.value = value;
		},


		onChange() {
			this.setValue(!this.value);
			this.emit("change", this.value);
		}
	},
	mounted() {
	}
}
</script>