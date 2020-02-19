
<template>
     <div class="MatcToolbarLowCode">
         <div class="MatcToolbarItem MatcToolbarGridFull MatcToobarActionCntr">
             <input class="MatcIgnoreOnKeyPress MatcToobarInlineEdit MatcToobarInput" 
                placeholder="Enter OnClick callback name"
                :value="callbacks.click" 
                @change="onClickChange"/>
             <!--<div class="MatcToolbarHint">Click Callback</div>-->
             <!--
            <span class="mdi mdi-cursor-default" />
            -->
         </div>
        <div class="MatcToolbarItem MatcToolbarGridFull MatcToobarActionCntr">
             <input class="MatcIgnoreOnKeyPress MatcToobarInlineEdit MatcToobarInput" 
                placeholder="Enter OnChange callback name"
                :value="callbacks.change" 
                @change="onChangeChange"/>
          
         </div>
	</div>
</template>
<script>

import DojoWidget from 'dojo/DojoWidget'

export default {
    name: 'LowCodeSection',
    mixins:[DojoWidget],
    data: function () {
        return {
            isWraped: false,
            callbacks: {
                click: '',
                change: ''
            }
        }
    },
    components: {
    },
    methods: {
        onWrapChange (value){		
            this.emit('changeStyle', 'wrap', value)
        },
        
        onClickChange (e) {
            this.callbacks.click = e.target.value
            this.emit('changeProps', 'callbacks', this.callbacks)
        },

        onChangeChange (e) {
            this.callbacks.change = e.target.value
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
                this.callbacks.change = widget.props.callbacks.change
            } else {
                this.callbacks = {
                    click: '',
                    change:''
                }
            }
		}
    }, 
    mounted () {
    }
}
</script>