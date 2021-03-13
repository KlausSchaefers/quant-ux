
<template>
    <div class="MatcDesignTokenList"  @mousedown.stop="" >
      <div :class="[']MatcToolbarSection', {'MatcToolbarSectionCollabsed' : !visible}]">
        <div class=" MatcToolbarSectionLabel"></div>

          <div class=" MatcToolbarSectionContent" v-show="colorTokens.length > 0">
              <label>Color Styles</label>
              <DesignTokenPreview :designtoken="designtoken"  v-for="designtoken in colorTokens" :key="designtoken.id"/>
          </div>


          <div class=" MatcToolbarSectionContent" v-show="textTokens.length > 0">
              <label>Text Styles</label>
              <DesignTokenPreview :designtoken="designtoken"  v-for="designtoken in textTokens" :key="designtoken.id"/>
          </div>


          <div class=" MatcToolbarSectionContent" v-show="strokeTokens.length > 0">
              <label>Border Styles</label>
              <DesignTokenPreview :designtoken="designtoken"  v-for="designtoken in strokeTokens" :key="designtoken.id"/>
          </div>


          <div class=" MatcToolbarSectionContent" v-show="shadowTokens.length > 0">
              <label>Shadow Styles</label>
              <DesignTokenPreview :designtoken="designtoken"  v-for="designtoken in shadowTokens" :key="designtoken.id"/>
          </div>


          <div class=" MatcToolbarSectionContent" v-show="paddingTokens.length > 0">
            <label>Padding Styles</label>
            <DesignTokenPreview :designtoken="designtoken"  v-for="designtoken in paddingTokens" :key="designtoken.id"/>
	      </div>
  </div>
	</div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import DesignTokenPreview from './DesignTokenPreview'
//import Util from 'core/Util'

export default {
    name: 'DesignTokenBtn',
    mixins:[DojoWidget],
    data: function () {
        return {
          model: null,
          icons: {
            color: 'mdi mdi-water',
            text: 'mdi mdi-format-size',
            padding: 'mdi mdi-select-all',
            stroke: 'mdi mdi-border-color',
            boxShadow: 'mdi mdi-box-shadow',
          },
          visible: true,
          designtokens: null
        }
    },
    components: {
      'DesignTokenPreview': DesignTokenPreview
    },
    computed: {
      sortedTokens () {
        let result = {}
        if (this.model && this.model.designtokens) {
          for (let id in this.model.designtokens) {
            let token = this.model.designtokens[id]
            if (token.type === 'color') {
              result.push(token)
            }
          }
        }
        return result
      },
      colorTokens () {
        let result = []
        if (this.model && this.model.designtokens) {
          for (let id in this.model.designtokens) {
            let token = this.model.designtokens[id]
            if (token.type === 'color') {
              result.push(token)
            }
          }
        }
        return result
      },
      textTokens () {
        let result = []
        if (this.model && this.model.designtokens) {
          for (let id in this.model.designtokens) {
            let token = this.model.designtokens[id]
            if (token.type === 'text') {
              result.push(token)
            }
          }
        }
        return result
      },
      shadowTokens () {
        let result = []
        if (this.model && this.model.designtokens) {
          for (let id in this.model.designtokens) {
            let token = this.model.designtokens[id]
            if (token.type === 'boxShadow') {
              result.push(token)
            }
          }
        }
        return result
      },
      strokeTokens () {
        let result = []
        if (this.model && this.model.designtokens) {
          for (let id in this.model.designtokens) {
            let token = this.model.designtokens[id]
            if (token.type === 'stroke') {
              result.push(token)
            }
          }
        }
        return result
      },
      paddingTokens () {
        let result = []
        if (this.model && this.model.designtokens) {
          for (let id in this.model.designtokens) {
            let token = this.model.designtokens[id]
            if (token.type === 'padding') {
              result.push(token)
            }
          }
        }
        return result
      }
    },
    methods: {
      toggleSection (s) {
        this.visible[s] = !this.visible[s]
      },
      setModel (m) {
        this.model = null
        this.model = m
        this.$forceUpdate()
      }

    },
    mounted () {
    }
}
</script>