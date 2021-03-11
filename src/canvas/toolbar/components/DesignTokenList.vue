
<template>
    <div class="MatcDesignTokenList"  @mousedown.stop="" >
      <div :class="[']MatcToolbarSection', {'MatcToolbarSectionCollabsed' : !visible}]">
        <div class=" MatcToolbarSectionLabel"></div>



          <div class=" MatcToolbarSectionContent" v-show="colorTokens.length > 0">
              <label>Color Styles</label>
              <div class="MatcToolbarItem MatcDesignTokenView" v-for="designtoken in colorTokens" :key="designtoken.id">
                <span class="MatcToolbarItemIcon" >
                  <span :class="icons[designtoken.type]" :style="{'color': designtoken.value}"/>
                </span>
                <span class="MatcToolbarItemLabel">{{designtoken.name}}</span>
              </div>
          </div>


          <div class=" MatcToolbarSectionContent" v-show="textTokens.length > 0">
              <label>Text Styles</label>
              <div class="MatcToolbarItem MatcDesignTokenView" v-for="designtoken in textTokens" :key="designtoken.id">
                <span class="MatcToolbarItemIcon" >
                  <span :class="icons[designtoken.type]" />
                </span>
                <span class="MatcToolbarItemLabel">{{designtoken.name}}</span>
              </div>
          </div>


          <div class=" MatcToolbarSectionContent" v-show="strokeTokens.length > 0">
              <label>Border Styles</label>
              <div class="MatcToolbarItem MatcDesignTokenView" v-for="designtoken in strokeTokens" :key="designtoken.id">
                <span class="MatcToolbarItemIcon" >
                  <span :class="icons[designtoken.type]" :style="{'color': designtoken.value.borderTopColor}"/>
                </span>
                <span class="MatcToolbarItemLabel">{{designtoken.name}}</span>
              </div>
          </div>


          <div class=" MatcToolbarSectionContent" v-show="shadowTokens.length > 0">
              <label>Shadow Styles</label>
              <div class="MatcToolbarItem MatcDesignTokenView" v-for="designtoken in shadowTokens" :key="designtoken.id">
                <span class="MatcToolbarItemIcon" >
                  <span :class="icons[designtoken.type]" />
                </span>
                <span class="MatcToolbarItemLabel">{{designtoken.name}}</span>
              </div>
          </div>


          <div class=" MatcToolbarSectionContent" v-show="paddingTokens.length > 0">
            <label>Padding Styles</label>
            <div class="MatcToolbarItem MatcDesignTokenView" v-for="designtoken in paddingTokens" :key="designtoken.id">
              <span class="MatcToolbarItemIcon" >
                <span :class="icons[designtoken.type]" />
              </span>
              <span class="MatcToolbarItemLabel">{{designtoken.name}}</span>
            </div>
	      </div>
  </div>
	</div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
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
    components: {},
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