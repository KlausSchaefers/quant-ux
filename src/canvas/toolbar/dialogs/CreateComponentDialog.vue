
<template>
     <div class="" @keydown.stop="" @keyup.stop="">
        
        <div>
            <h3 class="MatcDialogHeader">Create Component</h3>

            <div class="form-group MatcMarginTopXL">
                <input class="form-control input-lg MatcIgnoreOnKeyPress" v-model="name" ref="input" placeholder="The name of the component"/>
            </div>

            
            <div class="form-group MatcMarginTop">
                <CheckBox v-model="autoUpdate" :value="autoUpdate" @change="autoUpdate = !autoUpdate" label="Update all instances on change"/>
            </div>           

        </div>

        <div class="MatcButtonBar MatcMarginTopL">
            <div class="MatcButton MatcButtonPrimary" @click="save">Save</div>
            <div class="MatcLinkButton" @click="cancel">Cancel</div>
        </div>
	</div>
</template>
<style lang="scss">
</style>

<script>
import DojoWidget from 'dojo/DojoWidget'

import CheckBox from 'common/CheckBox'


export default {
    name: 'AISettings',
    mixins:[DojoWidget],
    data: function () {
        return {
            name: '',
            description: '',
            autoUpdate: true
        }
    },
    components: {CheckBox},
    methods: {
        async save () {
            this.emit('save', this.name, this.description, this.autoUpdate)
        },
        cancel() {
            this.emit('cancel')
        },
        focus () {
            if (this.$refs.input){
                this.$refs.input.focus()
            }
        }        
    },
    async mounted () {
      
    }
}
</script>