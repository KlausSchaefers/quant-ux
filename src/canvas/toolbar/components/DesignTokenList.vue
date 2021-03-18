
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

      <div class="MatcToolbarPopUp MatcBoxShadowPopup MatcToolbarDropDownButtonPopup" role="menu" data-dojo-attach-point="popup">
        <div class="MatcToolbarPopUpContainer" role="menu" data-dojo-attach-point="ctnr" @click.stop="" @mousedown.stop="" @keydown.stop="" @keypress.stop="" @keyup.stop="">
          Klaus
        </div>
      </div>
	</div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import DesignTokenPreview from './DesignTokenPreview'

import Dialog from 'common/Dialog'
import DesignTokenDialog from '../dialogs/DesignTokenDialog'
import lang from 'dojo/_base/lang'
import on from 'dojo/on'
import touch from 'dojo/touch'
import DomBuilder from 'common/DomBuilder'
import * as DojoUtil from 'dojo/DojoUtil';

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
          designtokens: null,
          reposition: true,
					arrowPosition: "right"
        }
    },
    components: {
      'DesignTokenPreview': DesignTokenPreview
    },
    computed: {

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
      toggleSection (s) {
        this.visible[s] = !this.visible[s]
      },

      onEdit(designtoken, node) {
        console.debug('onEdit', designtoken, this.popup)

				let db = new DomBuilder();


        var popup = db.div("MatcDesignTokenDialog MatcPadding").build(this.ctnr);

        let tokenDialog = DojoUtil.$new(DesignTokenDialog)
        tokenDialog.setModel(this.model)
        tokenDialog.setDesignToken(designtoken)
        tokenDialog.placeAt(popup)

        let bar = db.div("MatcButtonBar MatcMarginTop").build(popup);
				let write = db.div("MatcButton", "Ok").build(bar);
				let cancel = db.a("MatcLinkButton", "Cancel").build(bar);

				var d = new Dialog();
				d.overflow = true
				d.own(on(write, touch.press, lang.hitch(this,"updateDesignToken", d, tokenDialog)));
				d.own(on(cancel, touch.press, () => d.close()));
				d.popup(popup, node);
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