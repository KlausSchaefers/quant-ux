<template>
  <div class="MatcDesignTokenList" @mousedown.stop="">
    <div>


      <div class=" MatcDesignTokenListSection" :class="{ MatcDesignTokenListSectionCollapsed: collapsed.color }">
        <label class="MatcDesignTokenListSectionLabel" @click="toggleSection('color')">
            Color Tokens
            <QIcon icon="Plus" @click.stop="onCreateToken('color')"></QIcon>
          </label>
        <template v-if="!collapsed.color">
          <div class="MatcDesignTokenListSectionContent" >
            <DesignTokenPreview :designtoken="designtoken" class="MatcToolbarIconButton"
              v-for="designtoken in colorTokens" :key="designtoken.id" :ref="'token_' + designtoken.id"
              :edit="true"
              @edit="onEdit"  
              @delete="onDelete" 
              @rename="onNameChange" 
              @error="onError" />
          </div>

          <div class="MatcDesignTokenListSectionContent" v-show="!collapsed.commonColor">
            <DesignTokenPreview :designtoken="designtoken" class="MatcToolbarIconButton"
              v-for="designtoken in commonStyles.colors" :key="designtoken.id" :ref="'token_' + designtoken.id" :edit="false" :refactor="true" @refactor="onRefactor" @rename="onNameChange"
              @error="onError"/>
          </div>
        </template>
      </div>


      <div class=" MatcDesignTokenListSection" :class="{ MatcDesignTokenListSectionCollapsed: collapsed.text }">
        <label class="MatcDesignTokenListSectionLabel" @click="toggleSection('text')">
            Text Tokens
           <QIcon icon="Plus" @click.stop="onCreateToken('text')"></QIcon>  
        </label>
         <template v-if="!collapsed.text">
        <div class="MatcDesignTokenListSectionContent" >
          <DesignTokenPreview :designtoken="designtoken" class="MatcToolbarIconButton" v-for="designtoken in textTokens"
            :key="designtoken.id" :ref="'token_' + designtoken.id" :edit="true" @edit="onEdit" @delete="onDelete" @rename="onNameChange"
              @error="onError"/>
        </div>

        <div class="MatcDesignTokenListSectionContent" >
          <DesignTokenPreview :designtoken="designtoken" class="MatcToolbarIconButton"
            v-for="designtoken in commonStyles.fontFamilies" :key="designtoken.id" :ref="'token_' + designtoken.id" :edit="false" :refactor="true" @refactor="onRefactor" @rename="onNameChange"
              @error="onError"/>
        </div>

        <div class="MatcDesignTokenListSectionContent" >
          <DesignTokenPreview :designtoken="designtoken" class="MatcToolbarIconButton"
            v-for="designtoken in commonStyles.fontSizes" :key="designtoken.id" :ref="'token_' + designtoken.id" :edit="false" :refactor="true" @refactor="onRefactor" @rename="onNameChange"
              @error="onError" />
        </div>
         </template>
      </div>


      <div class=" MatcDesignTokenListSection" :class="{ MatcDesignTokenListSectionCollapsed: collapsed.stroke }">
        <label class="MatcDesignTokenListSectionLabel" @click="toggleSection('stroke')">
          Border Tokens
          <QIcon icon="Plus" @click.stop="onCreateToken('stroke')"></QIcon>  
        </label>
        <div class="MatcDesignTokenListSectionContent" v-show="!collapsed.stroke">
          <DesignTokenPreview :designtoken="designtoken" class="MatcToolbarIconButton"
            v-for="designtoken in strokeTokens" :key="designtoken.id" :ref="'token_' + designtoken.id" :edit="true" @edit="onEdit" @delete="onDelete" @rename="onNameChange"
              @error="onError"/>
        </div>
      </div>

      <div class=" MatcDesignTokenListSection" :class="{ MatcDesignTokenListSectionCollapsed: collapsed.tooltip }"
        v-show="tooltipTokens.length > 0">
        <label class="MatcDesignTokenListSectionLabel" @click="toggleSection('tooltip')">
          Tooltip Tokens
          <QIcon icon="Plus" @click.stop="onCreateToken('tooltip')"></QIcon>  
        </label>
        <div class="MatcDesignTokenListSectionContent" v-show="!collapsed.tooltip">
          <DesignTokenPreview :designtoken="designtoken" class="MatcToolbarIconButton"
            v-for="designtoken in tooltipTokens" :key="designtoken.id" :ref="'token_' + designtoken.id" :edit="true" @edit="onEdit" @delete="onDelete" @rename="onNameChange"
              @error="onError"/>
        </div>
      </div>

      <div class=" MatcDesignTokenListSection" :class="{ MatcDesignTokenListSectionCollapsed: collapsed.boxShadow }">
        <label class="MatcDesignTokenListSectionLabel" @click="toggleSection('boxShadow')">
            Shadow Tokens
            <QIcon icon="Plus" @click.stop="onCreateToken('boxShadow')"></QIcon>  
          </label>
        <div class="MatcDesignTokenListSectionContent" v-show="!collapsed.boxShadow">
          <DesignTokenPreview :designtoken="designtoken" class="MatcToolbarIconButton"
            v-for="designtoken in shadowTokens" :key="designtoken.id" :ref="'token_' + designtoken.id" :edit="true" @edit="onEdit" @delete="onDelete" @rename="onNameChange"
              @error="onError" />
        </div>
      </div>


      <div class=" MatcDesignTokenListSection" :class="{ MatcDesignTokenListSectionCollapsed: collapsed.padding }">
        <label class="MatcDesignTokenListSectionLabel" @click="toggleSection('padding')">
            Padding Tokens
            <QIcon icon="Plus" @click.stop="onCreateToken('padding')"></QIcon>    
        </label>
        <div class="MatcDesignTokenListSectionContent" v-show="!collapsed.padding">
          <DesignTokenPreview :designtoken="designtoken" class="MatcToolbarIconButton"
            v-for="designtoken in paddingTokens" :key="designtoken.id" :ref="'token_' + designtoken.id" :edit="true" @edit="onEdit" @delete="onDelete" @rename="onNameChange"
              @error="onError"/>
        </div>
      </div>


      <div class=" MatcDesignTokenListSection MatcDesignTokenListSectionNoBorder" v-show="isEmpty"
        style="text-align:left; height:120px">
        <label>Design Tokens</label>
        <div class="MatcDesignTokenListSectionContent" style="padding: 0px 16px;">
          No tokens have been defined yet. Select a widget and press on of the
          <span class="mdi mdi-dots-horizontal"></span> icon to create a design token.
        </div>

      </div>
    </div>


    <div class="MatcToolbarPopUp  MatcDesignTokenListPopup MatcToolbarDropDownButtonPopup" role="menu"
      data-dojo-attach-point="popup" @click.stop="" @mousedown.stop="onPopupClick">
      <div class="">
        <!-- <div class="MatcDesignTokenListPopupSection" v-if="selectedDesignToken && !isRefactor">
          <input class="MatcIgnoreOnKeyPress MatcDesignTokenListInput MatcToobarInputInlineEdit " v-model="selectedDesignToken.name" />
        </div> -->
        <div class="MatcDesignTokenListPopupSection"
          v-show="selectedDesignToken && selectedDesignToken.type === 'boxShadow'">
          <ShadowSettings ref="boxShadowSettings" @resize="onResize" @change="onChangeShadow"
            @changing="onChangeShadow" />
        </div>
        <div class="MatcDesignTokenListPopupSection"
          v-show="selectedDesignToken && selectedDesignToken.type === 'color'">
          <ColorPickerSketch ref="colorSettings" @resize="onResize" @change="onChangeColor"
            v-show="!isGradient(selectedDesignToken)" />
          <GradientPicker ref="gradientSettings" @resize="onResize" @change="onChangeColor"
            v-show="isGradient(selectedDesignToken)" />
         
        </div>
        <div class="MatcDesignTokenListPopupSection "
          v-show="selectedDesignToken && selectedDesignToken.type === 'text'">
          <TextProperties ref="textSettings" @resize="onResize" @change="onChangeText" @toggle="onToggleText"
            @changing="onChangeText" :isChildDropDown="true" />
        </div>
        <div class="MatcDesignTokenListPopupSection MatcDesignTokenListPopupPadding"
          v-show="selectedDesignToken && selectedDesignToken.type === 'stroke'">
          <BoxBorder ref="borderSettings" @resize="onResize" @change="onBorderChange" :isChildDropDown="true" />
        </div>
        <div class="MatcDesignTokenListPopupSection MatcDesignTokenListPopupPadding"
          v-show="selectedDesignToken && selectedDesignToken.type === 'padding'">
          <BoxPadding ref="paddingSettings" @resize="onResize" @change="onPaddingChange" :isChildDropDown="true" />
        </div>
        <div class="MatcDesignTokenListPopupSection "
          v-show="selectedDesignToken && selectedDesignToken.type === 'tooltip'">
          <TooltipSettings ref="tooltipSettings" @change="onTooltipChange" :isChildDropDown="true" />
        </div>

        <div class="MatcDesignTokenListPopupSection " v-if="selectedDesignToken && selectedDesignToken.type === 'fontSize'">
          <div class="MatcToolbarSliderPopup">
            <div class="MatcToolbarSliderCntr">
              <ToolbarSlider type="number" 
                :qMax="128"
                :qValue="selectedDesignToken.value"
                class="MatcIgnoreOnKeyPress MatcToobarInput" 
                @change="onFontSizeChange"/>
              </div>
            </div>

        </div>

        <div class="MatcDesignTokenListPopupSection " v-if="selectedDesignToken && selectedDesignToken.type === 'fontFamily'">
          {{fontFamilies}}

        </div>
        

        <div class="MatcDesignTokenListPopupSection">
          <div class="MatcButtonBar MatcButtonBarCols MatcMarginTop">
            <div class="MatcButtonBarCol">
              <a class="MatcButton MatcButtonPrimary MatcButtonXS" @click="onSave" v-if="!isRefactor">Save</a>
              <a class="MatcButton MatcButtonPrimary MatcButtonXS" @click="onSaveRefactor" v-if="isRefactor">Refactor</a>
              <a class="MatcLinkButton  MatcButtonXS" @click="onCancel">Cancel</a>
            </div>

            
              <QIcon icon="DeleteTrash" @click="onDeleteSelected" class="MatcPointer"></QIcon>
            
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

import ToolbarSlider from './ToolbarSlider'
import DesignTokenUtil from '../../../core/DesignTokenUtil'
import QIcon from 'page/QIcon'

export default {
  name: 'DesignTokenList',
  mixins: [DojoWidget, _DropDown],
  data: function () {
    return {
      model: null,
      isRefactor: false,
      icons: {
        color: 'mdi mdi-water',
        text: 'mdi mdi-format-size',
        padding: 'mdi mdi-select-all',
        stroke: 'mdi mdi-border-color',
        boxShadow: 'mdi mdi-box-shadow',
        tooltip: 'mdi mdi-cursor-default-click-outline'
      },
      visible: true,
      collapsed: {
        color: false,
        text: false,
        stroke: false,
        tooltip: false,
        boxShadow: false,
        padding: false,
        commonColor: false,
        commonFontFamily: false,
        commonFontSize: false
      },
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
    'TooltipSettings': TooltipSettings,
    'ToolbarSlider': ToolbarSlider,
    'QIcon': QIcon
  },
  computed: {

    isText() {
      return this.selectedDesignToken && this.selectedDesignToken.type === 'text'
    },

    isEmpty() {
      if (this.model && this.model.designtokens) {
        return Object.keys(this.model.designtokens).length === 0
      }
      return true
    },

    colorTokens() {
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
    textTokens() {
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
    shadowTokens() {
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
    tooltipTokens() {
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
    strokeTokens() {
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
    paddingTokens() {
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
    },

    commonStyles() {
      //DesignTokenUtil.getCommonStyles(this.model)
      return {
        colors: [],
        fontFamilies: [],
        fontSizes: []
      }
    }
  },
  methods: {
    onDeleteSelected(e) {
      if (this.selectedDesignToken) {
        this.onDelete(this.selectedDesignToken, e.target)
      }
    },
    onDelete(token, node) {
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
    deleteToken(d, token) {
      d.close()
      this.emit('delete', token)
      setTimeout(() => {
        this.$forceUpdate()
      }, 100)
    },
    isGradient(token) {
      if (token) {
        let color = token.value
        return color.colors !== undefined
      }
      return true
    },

    onPopupClick() {
      topic.publish('matc/dropdown/child')
    },

    setFontFamilies(f) {
      this.fontFamilies = f
      if (this.$refs.textSettings) {
        this.$refs.textSettings.setFontFamilies(f)
      }
    },

    postCreate() {
    },

    toggleSection(s) {
      this.collapsed[s] = !this.collapsed[s]
    },

    onCreateToken(type){
      this.logger.log(-2, 'onCreateToken', 'enter', type)
      const dt = {name: 'New Token'}
      if (type === 'color') {
        dt.type = "color"
        dt.isComplex = false
        dt.value = "#000000"
      }

      if (type === 'boxShadow') {
        dt.type = "boxShadow",
        dt.value = {
          "v" : 0,
          "h" : 0,
          "b" : 24,
          "s" : 0,
          "c" : "rgba(0, 0, 0, 0.25)"
        }
      }

      if (type === 'text') {
        dt.type = "text",
        dt.value = {
          "fontSize" : 14,
          "fontFamily" : "Helvetica Neue,Helvetica,Arial,sans-serif",
          "textAlign" : "left",
          "letterSpacing" : 0,
          "lineHeight" : 1.4,
          "verticalAlign" : "top"
        }
        dt.isComplex = true
      }

      if (type === 'padding') {
        dt.type = "padding",
        dt.value = {
          "paddingTop" : 8,
          "paddingBottom" : 8,
          "paddingLeft" : 8,
          "paddingRight" : 8
        }
        dt.isComplex = true
      }

      if (type === 'stroke') {
        dt.type = "stroke",
        dt.value = {
          "borderTopWidth" : 1,
          "borderRightWidth" : 1,
          "borderLeftWidth" : 1,
          "borderBottomWidth" : 1,
          "borderTopColor" : "#000000",
          "borderBottomColor" : "#000000",
          "borderRightColor" : "#000000",
          "borderLeftColor" : "#000000"
        }
        dt.isComplex = true
      }

      this.emit('new', dt)
    },
   
    renameToken(id) {
      setTimeout(() => {
        const ref = this.$refs['token_' + id]
        const preview = Array.isArray(ref) ? ref[0] : ref
        console.debug(preview)
        if (preview) {
          preview.onStartRename()
        }
      }, 200)
    },

    onNameChange(value, id) {
      this.logger.log(-2, 'onNameChange', 'enter', value, id)
      if (this.model && this.model.designtokens) {
        const dt = this.model.designtokens[id]
        dt.name = value
        this.emit('change', dt)
      }
    },
    onError(errorMsg){
      this.logger.error('onError', 'enter', errorMsg)
      this.emit('error', errorMsg)
    },
    onFontSizeChange (value) {
      this.logger.log(-12, 'onFontSizeChange', 'enter', value)
      this.selectedDesignToken.value = value * 1
    },
    onChangeColor(c) {
      this.logger.log(2, 'onChangeColor', 'enter', c)
      this.selectedDesignToken.value = c
    },

    onChangeShadow(c) {
      this.logger.log(2, 'onChangeShadow', 'enter', c)
      this.selectedDesignToken.value = c
    },

    onBorderChange(c) {
      this.logger.log(2, 'onBorderChange', 'enter', c)
      for (let key in c) {
        this.selectedDesignToken.value[key] = c[key]
      }
      this.$refs.borderSettings.setValue(this.selectedDesignToken.value)
    },

    onPaddingChange(c) {
      this.logger.log(2, 'onPaddingChange', 'enter', c)
      for (let key in c) {
        this.selectedDesignToken.value[key] = c[key]
      }
      this.$refs.paddingSettings.setValue(this.selectedDesignToken.value)
    },

    onTooltipChange(style) {
      this.logger.log(-2, 'onTooltipChange', 'enter', style)
      for (let key in style) {
        this.selectedDesignToken.value[key] = style[key]
      }
    },

    onChangeText(key, value) {
      this.logger.log(2, 'onChangeText', 'enter', key, value)
      this.selectedDesignToken.value[key] = value
    },

    onToggleText(key, value) {
      this.logger.log(2, 'onToggleText', 'enter', key, value)
      let style = this.selectedDesignToken.value
      if (style && (style[key] == null || style[key] != value)) {
        style[key] = value
      } else {
        style[key] = ''
      }
    },

    onCanvasClick(id, type, e) {
      if (!e || !e.isChildDropDown) {
        this.hideDropDown(id, type);
      }
    },

    onHide() {
    },

    onSaveRefactor() {
      if (this.selectedDesignToken) {
        this.emit('refactor', this.selectedDesignToken)
      }
      this.hideDropDown()
    },

    onSave() {
      if (this.selectedDesignToken) {
        this.emit('change', this.selectedDesignToken)
      }
      this.hideDropDown()
    },

    onCancel() {
      this.hideDropDown()
    },

    onResize() {
      this.updatePosition()
    },

    onRefactor (designtoken, node, e) {
      this.logger.log(-1, 'onRefactor', 'enter', designtoken)
      this.onEdit(designtoken, node, e, true)
    },

    onEdit(designtoken, node, e, isRefactor = false) {
      this.logger.log(-1, 'onEdit', 'enter', designtoken)

      this.isRefactor = isRefactor
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

    getPopupRootNode() {
      return this.popupRootNode
    },

    setModel(m) {
      this.model = null
      this.model = m
      this.$forceUpdate()
    },

    isInt (value){
			var er = /^-?[0-9]+$/;
			return er.test(value);
		}
  },
  mounted() {
    this.logger = new Logger('DesignTokenList')
    this.db = new DomBuilder()
  }
}
</script>