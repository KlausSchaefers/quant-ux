
<template>
    <div class="MatcDesignTokenButton MatcToolbarDropDownButtonPopup"  @mousedown.stop="" >
      <span class="mdi mdi-dots-horizontal" v-show="isVisible"/>
    	<ul class="MatcToolbarPopUp MatcToolbarDropDownButtonPopup" role="menu" data-dojo-attach-point="popup">
        <li @mousedown.stop="onNew">
          	<span class="MatcToolbarPopUpIcon mdi mdi-plus-circle-outline"></span>
            <label class="MatcToolbarPopUpLabel">Create Design Token</label>
        </li>
        <li @mousedown.stop="onLink" v-show="!hasDesignToken">
            <span class="MatcToolbarPopUpIcon mdi mdi mdi-link-variant-plus"></span>
            <label class="MatcToolbarPopUpLabel">Link Design Token</label>
        </li>
         <li @mousedown.stop="onUnLink" v-show="hasDesignToken">
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
import _DesignToken from './_DesignToken'

export default {
    name: 'DesignTokenBtn',
    mixins:[Util, DojoWidget,_DesignToken, _DropDown],
    data: function () {
        return {
           isVisible: true,
           value: null,
           reposition: true,
           arrowPosition: "right",
           tokenType: ''
        }
    },
    computed: {
    },
    components: {},
    methods: {
      setWidget (w) {
        this.value = w
        this.setBox(w)
        this.isVisible = true
      },
      setScreen (s) {
        this.value = s
        this.setBox(s)
        this.isVisible = true
      },
      setMulti () {
        this.setBox(null)
        this.isVisible = false
      },
      onVisible (){
        // reste state
			},
      setTokenType (t) {
        this.tokenType = t
      },
      onNew () {
        this.emit('new', this.tokenType, this.cssProps)
        this.hideDropDown()
      },
      onLink () {
        this.emit('link', this.tokenType, this.cssProps)
        this.hideDropDown()
      },
      onUnLink () {
        this.emit('unlink', this.tokenType, this.cssProps)
        this.hideDropDown()
      }
    },
    mounted () {
    }
}
</script>