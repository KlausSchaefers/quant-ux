
<template>
  <div class="MatcToolbarItem MatcToolbarIconButton"  @mousedown.stop="" @click.stop="onClick" >
      <DesignTokenPreview :designtoken="designtoken"/>
      
      <ul 
        class="MatcToolbarPopUp MatcToolbarDropDownButtonPopup MatcDesignTokenButtonPopup" 
        role="menu" 
        ref="popup"
      >

        <li @mousedown.stop="onUnLink" class="MatcDesignTokenButtonHeader">
            <QIcon icon="Delete"/>
            <label class="MatcToolbarPopUpLabel">Remove Design Token</label>
        </li>
  

        <!-- add here list and filter -->
        <ul class="MatcDesignTokenButtonPreviews">
          <li v-for="designtoken in filteredTokens" :key="designtoken.id" @mousedown="onSelectToken(designtoken)" >
            <DesignTokenPreview :designtoken="designtoken" />
          </li>
        </ul>

			</ul>
	</div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import DesignTokenPreview from './DesignTokenPreview'
import _DropDown from './_DropDown'
import QIcon from 'page/QIcon.vue'

export default {
    name: 'DesignTokenView',
    props: ['designtoken', 'model', 'designTokenList', 'tokenType'],
    mixins:[DojoWidget, _DropDown],
    data: function () {
        return {
          reposition: true,
          overRideAttachWithRef: true,
          arrowPosition: "right",
          icons: {
            color: 'mdi mdi-water',
            text: 'mdi mdi-format-size',
            padding: 'mdi mdi-select-all',
            stroke: 'mdi mdi-border-color',
            boxShadow: 'mdi mdi-box-shadow',
          }
        }
    },
    computed: {
       filteredTokens () {
        let result = []
        if (this.designTokenList) {
          Object.values(this.designTokenList).forEach(t => {
            if (t.type === this.tokenType) {
              result.push(t)
            }
          })
        }
        return result
      }
    },
    components: {
      'DesignTokenPreview': DesignTokenPreview,
      'QIcon': QIcon
    },
    methods: {
      onSelectToken(token) {
       this.emit('change', token)
      },
      onClick () {   
 
      },
      onUnLink () {
        this.emit('remove', this.designtoken)  
      },
      setModel (m) {
        this.model = m
      }
    },
    mounted () {
    }
}
</script>