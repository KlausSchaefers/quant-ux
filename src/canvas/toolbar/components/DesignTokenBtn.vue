
<template>
    <div class="MatcDesignTokenButton MatcToolbarDropDownButtonPopup"  @mousedown.stop="" >
      <span class="mdi mdi-dots-horizontal" @click.stop="onPlus"/>
    	<ul class="MatcToolbarPopUp MatcToolbarDropDownButtonPopup" role="menu" data-dojo-attach-point="popup">
        <li>
          	<span class="MatcToolbarPopUpIcon mdi mdi-plus-circle-outline"></span>
            <label class="MatcToolbarPopUpLabel">Create Design Token</label>
        </li>
        <li>
            <span class="MatcToolbarPopUpIcon mdi mdi mdi-link-variant-plus"></span>
            <label class="MatcToolbarPopUpLabel">Link Design Token</label>
        </li>
         <li>
            <span class="MatcToolbarPopUpIcon mdi mdi mdi-link-variant-minus"></span>
            <label class="MatcToolbarPopUpLabel">Remove Design Token</label>
        </li>
			</ul>
	</div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import _DropDown from './_DropDown'
import Util from 'core/Util'

export default {
    name: 'DesignTokenBtn',
    mixins:[Util, DojoWidget, _DropDown],
    data: function () {
        return {
            value: null,
            reposition: true,
            arrowPosition: "right"
        }
    },
    components: {},
    methods: {
      onVisible (){
        // reste state
			},
      setType (t) {
        this.type = t
      },
      onPlus () {
        console.debug('onPlus')
      }
    },
    mounted () {
    }
}
</script>