
<template>
    <div class="MatcDesignTokenList"  @mousedown.stop="" >
        <div :class="[']MatcToolbarSection', {'MatcToolbarSectionCollabsed' : !visible}]">
            <div class=" MatcToolbarSectionLabel"></div>

              <div class=" MatcToolbarSectionContent" v-show="colorTokens.length > 0">
                  <label>Color Styles</label>
                  <DesignTokenPreview :designtoken="designtoken"  v-for="designtoken in colorTokens" :key="designtoken.id" :edit="true" @edit="onEdit"/>
              </div>


              <div class=" MatcToolbarSectionContent" v-show="textTokens.length > 0">
                  <label>Text Styles</label>
                  <DesignTokenPreview :designtoken="designtoken"  v-for="designtoken in textTokens" :key="designtoken.id" :edit="true" @edit="onEdit"/>
              </div>


              <div class=" MatcToolbarSectionContent" v-show="strokeTokens.length > 0">
                  <label>Border Styles</label>
                  <DesignTokenPreview :designtoken="designtoken"  v-for="designtoken in strokeTokens" :key="designtoken.id" :edit="true" @edit="onEdit"/>
              </div>


              <div class=" MatcToolbarSectionContent" v-show="shadowTokens.length > 0">
                  <label>Shadow Styles</label>
                  <DesignTokenPreview :designtoken="designtoken"  v-for="designtoken in shadowTokens" :key="designtoken.id" :edit="true" @edit="onEdit"/>
              </div>


              <div class=" MatcToolbarSectionContent" v-show="paddingTokens.length > 0">
                <label>Padding Styles</label>
                <DesignTokenPreview :designtoken="designtoken"  v-for="designtoken in paddingTokens" :key="designtoken.id" :edit="true" @edit="onEdit"/>
            </div>

             <div class=" MatcToolbarSectionContent" v-show="isEmpty">
                  No tokens have been defined

            </div>
      </div>


       <div class="MatcToolbarPopUp  MatcDesignTokenListPopup MatcToolbarDropDownButtonPopup" role="menu" data-dojo-attach-point="popup" @click.stop="" @mousedown.stop="" >
          <div >
            <div class="MatcDesignTokenListPopupSection" v-if="selectedDesignToken">
               <input class="MatcIgnoreOnKeyPress MatcDesignTokenListInput " v-model="selectedDesignToken.name"/>
            </div>
            <div class="MatcDesignTokenListPopupSection" v-show="selectedDesignToken && selectedDesignToken.type === 'boxShadow'">
              <ShadowSettings ref="boxShadowSettings" @resize="onResize"  @change="onChangeShadow"/>
            </div>
            <div class="MatcDesignTokenListPopupSection" v-show="selectedDesignToken && selectedDesignToken.type === 'color'">
              <ColorPickerSketch ref="colorSettings" @resize="onResize" @change="onChangeColor"/>
            </div>
            <div class="MatcDesignTokenListPopupSection " v-show="selectedDesignToken && selectedDesignToken.type === 'text'">
              <TextProperties ref="textSettings" @resize="onResize" @change="onChangeText" @toggle="onToggleText" :isChildDropDown="true"/>
            </div>
             <div class="MatcDesignTokenListPopupSection">
               <a class="MatcButton" @click="onSave">Save</a>    <a class="MatcLinkButton" @click="onCancel">Cancel</a>
            </div>
          </div>
        </div>
	</div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import DesignTokenPreview from './DesignTokenPreview'
import ShadowSettings from './ShadowSettings'
import _DropDown from './_DropDown'
import lang from 'dojo/_base/lang'
import ColorPickerSketch from 'common/ColorPickerSketch'
import TextProperties from 'canvas/toolbar/components/TextProperties'
import css from 'dojo/css'
//import Input from '../../../common/Input.vue'

export default {
    name: 'DesignTokenBtn',
    mixins:[DojoWidget, _DropDown],
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
          designtokens: null,
          reposition: true,
					arrowPosition: "right",
          selectedDesignToken: null,
          fontFamilies: []
        }
    },
    components: {
      'DesignTokenPreview': DesignTokenPreview,
      'ShadowSettings': ShadowSettings,
      'ColorPickerSketch': ColorPickerSketch,
      'TextProperties': TextProperties
    },
    computed: {

      isText () {
        return this.selectedDesignToken && this.selectedDesignToken.type === 'text'
      },

      isEmpty () {
        if (this.model && this.model.designtokens) {
          return Object.keys(this.model.designtokens).length === 0
        }
        return true
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

      setFontFamilies (f) {
        this.fontFamilies = f
        if (this.$refs.textSettings) {
          this.$refs.textSettings.setFontFamilies(f)
        }
      },

      postCreate (){
			},

      toggleSection (s) {
        this.visible[s] = !this.visible[s]
      },

      onChangeColor (c) {
        console.debug('onChangeColor', c)
        this.selectedDesignToken.value = c
      },

      onChangeShadow (c) {
        console.debug('onChangeShadow', c)
        this.selectedDesignToken.value = c
      },

      onChangeText (key, value) {
        console.debug('onChangeColor', key, value)
        this.selectedDesignToken.value[key] = value
      },

      onToggleText (key, value) {
        console.debug('onToggleText', key, value)
        let style = this.selectedDesignToken.value
        if(style && (style[key] == null || style[key] != value)){
          style[key] = value
        } else {
          style[key] = ''
        }
      },

      onCanvasClick (id, type, e) {
        console.debug('onCanvasClick() keep open',e)
        if (!e || !e.isChildDropDown) {
          this.hideDropDown(id, type);
        }
      },

      onHide () {
        console.debug('onHide', this.selectedDesignToken)
      },

      onSave () {

      },

      onCancel () {
        this.hideDropDown()
      },

      onResize () {
        this.updatePosition()
      },

      onEdit(designtoken, node) {
        console.debug('onEdit', designtoken, node)
        this.hideDropDown();
        css.remove(this.popup, 'MatcDesignTokenListPopupText')

        this.popupRootNode = node
        this.selectedDesignToken = lang.clone(designtoken)

        if (this.selectedDesignToken.type === 'color') {
          this.$refs.colorSettings.setValue(this.selectedDesignToken.value)
        }

        if (this.selectedDesignToken.type === 'text') {
          css.add(this.popup, 'MatcDesignTokenListPopupText')
          this.$refs.textSettings.setValue(this.selectedDesignToken.value)
        }

        if (this.selectedDesignToken.type === 'boxShadow') {
          this.$refs.boxShadowSettings.setValue(this.selectedDesignToken.value)
        }

        this.showDropDown()




      },

    	getPopupRootNode () {
				return this.popupRootNode
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

/**
 *
      getPopupRootNode () {
				return this.popupRootNode
			},

      postCreate () {

			},

      onVisible (){
        console.debug('onVisible')
        this.tempValue = false

			},

      onHide () {
        console.debug('onHide')

      },

      init (){
        console.debug('init')


			},

 */
</script>