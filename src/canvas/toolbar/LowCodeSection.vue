
<template>
     <div class="MatcToolbarLowCode">
		 <div class="MatcToolbarItem">
             <CheckBox label="Wrap Children" :value="isWraped" @change="onWrapChange"/>
         </div>
          <div class="MatcToolbarItem">
             <CheckBox label="Force Grid" :value="isGrid" @change="onGridChange"/>
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
            isGrid: false,
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
            if (this.isGroup) {
                this.emit('changeGroupStyle', 'wrap', value)
            } else {
                this.emit('changeStyle', 'wrap', value)
            }
        },

        onGridChange (value) {
            if (this.isGroup) {
                this.emit('changeGroupStyle', 'grid', value)
            } else {
                this.emit('changeStyle', 'grid', value)
            }
        },

        onClickChange (e) {
            this.callbacks.click = e.target.value
            if (this.isGroup) {
                this.emit('changeGroupProps', 'callbacks', this.callbacks)
            } else {
                this.emit('changeProps', 'callbacks', this.callbacks)
            }
        },

		setValue (widget, isGroup = false){
            this.isGroup = isGroup
      		if (widget.style && widget.style.wrap) {
                this.isWraped = widget.style.wrap
            } else {
                this.isWraped = false
            }
            if (widget.style && widget.style.grid) {
                this.isGrid = widget.style.grid
            } else {
                this.isGrid = false
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