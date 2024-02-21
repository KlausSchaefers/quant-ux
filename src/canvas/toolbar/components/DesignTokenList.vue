
<template>
    <div class="MatcDesignTokenList"  @mousedown.stop="" >
        <div>


              <div class=" MatcDesignTokenListSection" v-show="colorTokens.length > 0">
                  <label>Color Styles</label>
                  <div class="MatcDesignTokenListSectionContent">
                    <DesignTokenPreview :designtoken="designtoken" class="MatcToolbarIconButton" v-for="designtoken in colorTokens" :key="designtoken.id" :edit="true" @edit="onEdit" @delete="onDelete"/>
                  </div>
              </div>


              <div class=" MatcDesignTokenListSection" v-show="textTokens.length > 0">
                  <label>Text Styles</label>
                  <div class="MatcDesignTokenListSectionContent">
                    <DesignTokenPreview :designtoken="designtoken" class="MatcToolbarIconButton" v-for="designtoken in textTokens" :key="designtoken.id" :edit="true" @edit="onEdit" @delete="onDelete"/>
                  </div>
              </div>


              <div class=" MatcDesignTokenListSection" v-show="strokeTokens.length > 0">
                  <label>Border Styles</label>
                  <div class="MatcDesignTokenListSectionContent">
                    <DesignTokenPreview :designtoken="designtoken" class="MatcToolbarIconButton" v-for="designtoken in strokeTokens" :key="designtoken.id" :edit="true" @edit="onEdit" @delete="onDelete"/>
                  </div>
              </div>

              <div class=" MatcDesignTokenListSection" v-show="tooltipTokens.length > 0">
                  <label>Tooltip Styles</label>
                  <div class="MatcDesignTokenListSectionContent">
                    <DesignTokenPreview :designtoken="designtoken" class="MatcToolbarIconButton" v-for="designtoken in tooltipTokens" :key="designtoken.id" :edit="true" @edit="onEdit" @delete="onDelete"/>
                  </div>
              </div>



              <div class=" MatcDesignTokenListSection" v-show="shadowTokens.length > 0">
                  <label>Shadow Styles</label>
                  <div class="MatcDesignTokenListSectionContent">
                    <DesignTokenPreview :designtoken="designtoken" class="MatcToolbarIconButton" v-for="designtoken in shadowTokens" :key="designtoken.id" :edit="true" @edit="onEdit" @delete="onDelete"/>
                  </div>
              </div>


              <div class=" MatcDesignTokenListSection" v-show="paddingTokens.length > 0">
                <label>Padding Styles</label>
                <div class="MatcDesignTokenListSectionContent">
                  <DesignTokenPreview :designtoken="designtoken" class="MatcToolbarIconButton" v-for="designtoken in paddingTokens" :key="designtoken.id" :edit="true" @edit="onEdit" @delete="onDelete"/>
                </div>
            </div>

             <div class=" MatcDesignTokenListSection MatcDesignTokenListSectionNoBorder" v-show="isEmpty" style="text-align:left; height:120px">
                  <label>Design Tokens</label>
                  <div class="MatcDesignTokenListSectionContent" style="padding: 0px 16px;">
                    No tokens have been defined yet. Select a widget and press on of the
                    <span class="mdi mdi-dots-horizontal"></span> icon to create a design token.
                  </div>

            </div>
      </div>


       <div class="MatcToolbarPopUp  MatcDesignTokenListPopup MatcToolbarDropDownButtonPopup" role="menu" data-dojo-attach-point="popup" @click.stop="" @mousedown.stop="onPopupClick" >
          <div class="">
            <div class="MatcDesignTokenListPopupSection" v-if="selectedDesignToken">
               <input class="MatcIgnoreOnKeyPress MatcDesignTokenListInput " v-model="selectedDesignToken.name"/>
            </div>
            <div class="MatcDesignTokenListPopupSection" v-show="selectedDesignToken && selectedDesignToken.type === 'boxShadow'">
              <ShadowSettings ref="boxShadowSettings" @resize="onResize"  @change="onChangeShadow" @changing="onChangeShadow"/>
            </div>
            <div class="MatcDesignTokenListPopupSection" v-show="selectedDesignToken && selectedDesignToken.type === 'color'">
              <ColorPickerSketch ref="colorSettings" @resize="onResize" @change="onChangeColor" v-show="!isGradient(selectedDesignToken)"/>
              <GradientPicker ref="gradientSettings" @resize="onResize" @change="onChangeColor" v-show="isGradient(selectedDesignToken)"/>
            </div>
            <div class="MatcDesignTokenListPopupSection " v-show="selectedDesignToken && selectedDesignToken.type === 'text'">
              <TextProperties ref="textSettings" @resize="onResize" @change="onChangeText" @toggle="onToggleText" @changing="onChangeText" :isChildDropDown="true"/>
            </div>
            <div class="MatcDesignTokenListPopupSection MatcDesignTokenListPopupPadding" v-show="selectedDesignToken && selectedDesignToken.type === 'stroke'">
              <BoxBorder ref="borderSettings" @resize="onResize" @change="onBorderChange" :isChildDropDown="true"/>
            </div>
            <div class="MatcDesignTokenListPopupSection MatcDesignTokenListPopupPadding" v-show="selectedDesignToken && selectedDesignToken.type === 'padding'">
              <BoxPadding ref="paddingSettings" @resize="onResize" @change="onPaddingChange" :isChildDropDown="true"/>
            </div>
            <div class="MatcDesignTokenListPopupSection " v-show="selectedDesignToken && selectedDesignToken.type === 'tooltip'">
              <TooltipSettings ref="tooltipSettings" @change="onTooltipChange" :isChildDropDown="true"/>
            </div>
             <div class="MatcDesignTokenListPopupSection">
                <div class="MatcButtonBar">
                  <a class="MatcButton MatcButtonPrimary MatcButtonXS" @click="onSave">Save</a>    
                  <a class="MatcLinkButton  MatcButtonXS" @click="onCancel">Cancel</a>
              </div>
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
import GradientPicker from 'common/GradientPicker'

import Logger from 'common/Logger'
import TextProperties from 'canvas/toolbar/components/TextProperties'
import BoxBorder from 'canvas/toolbar/components/BoxBorder'
import BoxPadding from 'canvas/toolbar/components/BoxPadding'
import TooltipSettings from './TooltipSettings'
import css from 'dojo/css'
import topic from 'dojo/topic'
import Dialog from "common/Dialog";
import on from "dojo/on";
import DomBuilder from "common/DomBuilder";

export default {
    name: 'DesignTokenList',
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
            tooltip: 'mdi mdi-cursor-default-click-outline'
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
      //'DeleteDialog': DeleteDialog,
      'DesignTokenPreview': DesignTokenPreview,
      'ShadowSettings': ShadowSettings,
      'ColorPickerSketch': ColorPickerSketch,
      'TextProperties': TextProperties,
      'BoxBorder': BoxBorder,
      'BoxPadding': BoxPadding,
      'GradientPicker': GradientPicker,
      'TooltipSettings': TooltipSettings
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
      tooltipTokens () {
        let result = []
        if (this.model && this.model.designtokens) {
          for (let id in this.model.designtokens) {
            let token = this.model.designtokens[id]
            if (token.type === 'tooltip') {
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
      onDelete (token, node) {
        const div = this.db.div("MatcDeleteDialog").build();
        this.db.h3("title is-4", 'Delete Design Token').build(div);
        this.db.p('MatcMarginBottomXL', `Do you want to delete the '${token.name}' token?`).build(div)
        const bar = this.db.div("MatcButtonBar").build(div);
        const write = this.db.a("MatcButton MatcButtonDanger", this.getNLS("btn.delete")).build(bar);
        const cancel = this.db.a("MatcLinkButton", this.getNLS("btn.cancel")).build(bar);

        const d = new Dialog();
        d.own(on(write, "click", () => this.deleteToken(d, token)));
        d.own(on(cancel, "click", () => d.close()));
        d.popup(div, node);
      },
      deleteToken (d, token) {
        d.close()
        this.emit('delete', token)
        setTimeout(() => {
          this.$forceUpdate()
        }, 100)
      },
      isGradient (token) {
        if (token) {
          let color = token.value
          return color.colors !== undefined
        }
        return true
      },

      onPopupClick () {
        topic.publish('matc/dropdown/child')
      },

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
        this.logger.log(2, 'onChangeColor', 'enter', c)
        this.selectedDesignToken.value = c
      },

      onChangeShadow (c) {
        this.logger.log(2, 'onChangeShadow', 'enter', c)
        this.selectedDesignToken.value = c
      },

      onBorderChange (c) {
        this.logger.log(2, 'onBorderChange', 'enter', c)
        for (let key in c) {
          this.selectedDesignToken.value[key] = c[key]
        }
        this.$refs.borderSettings.setValue(this.selectedDesignToken.value)
      },

      onPaddingChange (c) {
        this.logger.log(2, 'onPaddingChange', 'enter', c)
        for (let key in c) {
          this.selectedDesignToken.value[key] = c[key]
        }
        this.$refs.paddingSettings.setValue(this.selectedDesignToken.value)
      },

      onTooltipChange (style) {
        this.logger.log(-2, 'onTooltipChange', 'enter', style)
        for (let key in style) {
            this.selectedDesignToken.value[key] = style[key]
        }
      },

      onChangeText (key, value) {
        this.logger.log(2, 'onChangeText', 'enter', key, value)
        this.selectedDesignToken.value[key] = value
      },

      onToggleText (key, value) {
        this.logger.log(2, 'onToggleText', 'enter', key, value)
        let style = this.selectedDesignToken.value
        if(style && (style[key] == null || style[key] != value)){
          style[key] = value
        } else {
          style[key] = ''
        }
      },

      onCanvasClick (id, type, e) {
        if (!e || !e.isChildDropDown) {
          this.hideDropDown(id, type);
        }
      },

      onHide () {
      },

      onSave () {
        if (this.selectedDesignToken) {
          this.emit('change', this.selectedDesignToken)
        }
        this.hideDropDown()
      },

      onCancel () {
        this.hideDropDown()
      },

      onResize () {
        this.updatePosition()
      },

      onEdit(designtoken, node, e) {
        this.logger.log(-1, 'onEdit', 'enter', designtoken)

       
        this.hideDropDown();

        this.setActiveButton(node)
        if (designtoken.type === 'text' || designtoken.type === 'stroke' || designtoken.type === 'padding') {
          css.add(this.popup, 'MatcDesignTokenListPopupText')
        } else {
          css.remove(this.popup, 'MatcDesignTokenListPopupText')
        }

        this.popupRootNode = node
        this.selectedDesignToken = lang.clone(designtoken)

        if (this.selectedDesignToken.type === 'color') {
          if (!this.isGradient(this.selectedDesignToken)) {
            this.$refs.colorSettings.setValue(this.selectedDesignToken.value)
          } else {
            this.$refs.gradientSettings.setValue(this.selectedDesignToken.value)
          }
        }

        if (this.selectedDesignToken.type === 'text') {

          this.$refs.textSettings.setValue(this.selectedDesignToken.value)
        }

        if (this.selectedDesignToken.type === 'boxShadow') {
          this.$refs.boxShadowSettings.setValue(this.selectedDesignToken.value)
        }

        if (this.selectedDesignToken.type === 'stroke') {
          this.$refs.borderSettings.setModel(this.model)
          this.$refs.borderSettings.setValue(this.selectedDesignToken.value)
        }

        if (this.selectedDesignToken.type === 'padding') {
          this.$refs.paddingSettings.setValue(this.selectedDesignToken.value)
        }

        if (this.selectedDesignToken.type === 'tooltip') {
          this.$refs.tooltipSettings.setModel(this.model)
          this.$refs.tooltipSettings.setValue(this.selectedDesignToken.value)
        }

        /**
         * This is still super buggy! It triggers somehow also the children dropdown???
         */
        this.$nextTick(() => {
          this.showDropDown(e, true)
        })

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
      this.logger = new Logger('DesignTokenList')
      this.db = new DomBuilder()
    }
}
</script>