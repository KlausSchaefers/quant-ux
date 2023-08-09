
<template>
     <div class="MatcToolbarSelector">	
		<a :class="['MatcToolbarItem MatcToolbarToggleButton', {'MatcToolbarItemActive' : o.value == value}]" v-for="o in options" :key="o.value" @click="onChange(o.value)">
			<QIcon :icon="o.icon"></QIcon>
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
            value: false
        }
    },
    components: {
		'QIcon':QIcon
	},
    methods: {
        postCreate (){			
		},		
		
		setOptions (list){
			this.options = list
		},


		
		setValue (value){
			this.value = value;
		},
		
		hideOption (){
		},
		
		showOption (){
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
			console.debug('mounted', this.options)
			this.setOptions(this.options)
		}
    }
}
</script>