
<template>
     <div class="MatcToolbarSelector">	
		<a :class="['MatcToolbarItem MatcToolbarToggleButton', {'MatcToolbarItemActive' : o.value == value}]" v-for="o in visibleOptions" :key="o.value" @click="onChange(o.value)">
			
			<QIcon :icon="o.icon " v-if="o.icon"></QIcon>
			<span v-if="o.label">{{ o.label }}</span>
		
		</a>
		
	</div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import QIcon from 'page/QIcon'

export default {
    name: 'ToolbarSelector',
    mixins:[DojoWidget],
	props: ['options', 'selected'],
    data: function () {
        return {
            value: false,
			visibleOptions: [],
			hidden: {}
        }
    },
    components: {
		'QIcon':QIcon
	},
	computed: {
		
	},
    methods: {
		setOptions (list){
			this.options = list
			this.visibleOptions = list
		},

		setValue (value){
			this.value = value;
		},
		
		hideOption (value){
			this.hidden[value] = true
			this.setVisible()
		},

		setVisible () {
			this.visibleOptions = this.options.filter(o => this.hidden[o.value] !== true)
		},
		
		showOption (value){
			this.hidden[value] = false
			this.setVisible()
		},
		
		getValue (){
			return this.value;
		},
		
		
		onChange (value){
			this.setValue(value);
			this.emit("change", value);
		}
    }, 
    mounted () {
		if (this.options) {
			this.setOptions(this.options)
		}
    }
}
</script>