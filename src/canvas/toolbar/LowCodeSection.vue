
<template>
     <div class="MatcToolbarLowCode">
		 <div class="MatcToolbarItem">
             <CheckBox label="Wrap Element" :value="isWraped" @change="onWrapChange"/>
         </div>
         <div class="MatcToolbarItem MatcToolbarGridFull MatcToobarActionCntr">
             <input class="MatcIgnoreOnKeyPress MatcToobarInlineEdit MatcToobarInput" 
                placeholder="Enter method name"
                :value="callbacks.click" 
                @change="onClickChange"/>
             <div class="MatcToolbarHint">Click Callback</div>
             <!--
            <span class="mdi mdi-cursor-default" />
            -->
         </div>
	</div>
</template>
<script>

import DojoWidget from 'dojo/DojoWidget'
import CheckBox from 'common/CheckBox'

export default {
    name: 'LowCodeSection',
    mixins:[DojoWidget],
    data: function () {
        return {
            isWraped: false,
            callbacks: {
                click: ''
            }
        }
    },
    components: {
        'CheckBox': CheckBox
    },
    methods: {
        onWrapChange (value){		
            this.emit('changeStyle', 'wrap', value)
        },
        
        onClickChange (e) {
            this.callbacks.click = e.target.value
            this.emit('changeProps', 'callbacks', this.callbacks)
        },
		
		setValue (widget){
      		if (widget.style && widget.style.wrap) {
                this.isWraped = widget.style.wrap
            } else {
                this.isWraped = false
            }
            if (widget.props && widget.props.callbacks){
                this.callbacks.click = widget.props.callbacks.click
            } else {
                this.callbacks = {
                    click: ''
                }
            }
		}
    }, 
    mounted () {
    }
}
</script>