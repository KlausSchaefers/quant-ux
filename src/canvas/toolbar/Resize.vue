
<template>
     <div class="MatcToolbarResize">
		
	</div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import lang from 'dojo/_base/lang'
//import on from 'dojo/on'

export default {
    name: 'Responsove',
    mixins:[DojoWidget],
    data: function () {
        return {
            value: {}
        }
    },
    components: {},
    methods: {
        postCreate: function(){		
		
		},
		
	
		blur  (){
		},
		
		setValue  (v){
            console.debug('Responsive.setValue', v.props)
            if (v.props.resize) {
                this.value = lang.clone(v)
            }
		},
		
		
		setModel  (m){
			this.model = m;
		}
    }, 
    mounted () {
    }
}
</script>