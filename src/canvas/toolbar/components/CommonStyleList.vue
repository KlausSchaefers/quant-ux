
<template>
    <div class="MatcDesignTokenList MatcCommonStyleList" @mousedown.stop="">

        <div class="MatcDesignTokenListSection MatcDesignTokenListSectionNoBorder" v-show="backgroundColors.length > 0">
            <label>Background Colors</label>
            <div class="MatcDesignTokenListSectionContent">
                <DesignTokenPreview :designtoken="token" class="MatcToolbarIconButton" v-for="token in backgroundColors" :key="token.id" :edit="false"/>
            </div>
        </div>

        <div class="MatcDesignTokenListSection" v-show="fontColors.length > 0">
            <label>Font Colors</label>
            <div class="MatcDesignTokenListSectionContent">
                <DesignTokenPreview :designtoken="token" class="MatcToolbarIconButton" v-for="token in fontColors" :key="token.id" :edit="false"/>
            </div>
        </div>

        <div class="MatcDesignTokenListSection" v-show="borderColors.length > 0">
            <label>Border Colors</label>
            <div class="MatcDesignTokenListSectionContent">
                <DesignTokenPreview :designtoken="token" class="MatcToolbarIconButton" v-for="token in borderColors" :key="token.id" :edit="false"/>
            </div>
        </div>

        <div class="MatcDesignTokenListSection" v-show="borderWidths.length > 0">
            <label>Border Widths</label>
            <div class="MatcDesignTokenListSectionContent">
                <div class="MatcCommonStyleBorderWidth MatcToolbarIconButton" v-for="width in borderWidths" :key="width.id">
                    <span class="MatcCommonStyleBorderWidthBar" :style="{ borderBottomWidth: width.value }"></span>
                    <span class="MatcToolbarItemLabel">{{ width.label }}</span>
                </div>
            </div>
        </div>

        <div class="MatcDesignTokenListSection" v-show="fontFamilies.length > 0">
            <label>Font Families</label>
            <div class="MatcDesignTokenListSectionContent">
                <DesignTokenPreview :designtoken="token" class="MatcToolbarIconButton" v-for="token in fontFamilies" :key="token.id" :edit="false"/>
            </div>
        </div>

        <div class="MatcDesignTokenListSection MatcDesignTokenListSectionNoBorder" v-show="isEmpty" style="text-align:left; height:120px">
            <label>Common Styles</label>
            <div class="MatcDesignTokenListSectionContent" style="padding: 0px 16px;">
                No colors, border widths or fonts have been used in this model yet.
            </div>
        </div>

	</div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import DesignTokenPreview from './DesignTokenPreview'
import Logger from 'common/Logger'

const STATE_KEYS = ['style', 'hover', 'focus', 'checked', 'active', 'error']

export default {
    name: 'CommonStyleList',
    mixins: [DojoWidget],
    data: function () {
        return {
          model: null,
          backgroundColors: [],
          fontColors: [],
          borderColors: [],
          borderWidths: [],
          fontFamilies: []
        }
    },
    components: {
      'DesignTokenPreview': DesignTokenPreview
    },
    computed: {
      isEmpty () {
        return this.backgroundColors.length === 0 &&
          this.fontColors.length === 0 &&
          this.borderColors.length === 0 &&
          this.borderWidths.length === 0 &&
          this.fontFamilies.length === 0
      }
    },
    methods: {

      postCreate () {
      },

      setModel (m) {
        this.model = m
        this.scanModel(this.model)
      },

      scanModel (model) {
        const backgrounds = new Map()
        const colors = new Map()
        const borderColors = new Map()
        const borderWidths = new Map()
        const fontFamilies = new Map()

        const addValue = (map, value) => {
          if (value === undefined || value === null || value === '') {
            return
          }
          const key = (value && typeof value === 'object') ? JSON.stringify(value) : value
          if (!map.has(key)) {
            map.set(key, { value, count: 0 })
          }
          map.get(key).count++
        }

        const scanStyle = (style) => {
          if (!style) {
            return
          }
          addValue(backgrounds, style.background)
          addValue(colors, style.color)
          addValue(borderColors, style.borderTopColor)
          addValue(borderColors, style.borderBottomColor)
          addValue(borderColors, style.borderLeftColor)
          addValue(borderColors, style.borderRightColor)
          if (style.borderTopWidth && parseFloat(style.borderTopWidth) > 0) {
            addValue(borderWidths, style.borderTopWidth)
          }
          if (style.borderBottomWidth && parseFloat(style.borderBottomWidth) > 0) {
            addValue(borderWidths, style.borderBottomWidth)
          }
          if (style.borderLeftWidth && parseFloat(style.borderLeftWidth) > 0) {
            addValue(borderWidths, style.borderLeftWidth)
          }
          if (style.borderRightWidth && parseFloat(style.borderRightWidth) > 0) {
            addValue(borderWidths, style.borderRightWidth)
          }
          addValue(fontFamilies, style.fontFamily)
        }

        const scanEntity = (entity) => {
          STATE_KEYS.forEach(key => scanStyle(entity[key]))
        }

        if (model && model.widgets) {
          for (let id in model.widgets) {
            scanEntity(model.widgets[id])
          }
        }

        if (model && model.screens) {
          for (let id in model.screens) {
            scanEntity(model.screens[id])
          }
        }

        const toSortedList = (map) => {
          return Array.from(map.entries())
            .sort((a, b) => b[1].count - a[1].count)
            .map(([key, entry]) => ({ id: key, value: entry.value, count: entry.count }))
        }

        const toLabel = (entry) => {
          const label = (entry.value && typeof entry.value === 'object') ? 'Gradient' : entry.value
          return entry.count > 1 ? `${label} · ${entry.count}` : label
        }

        this.backgroundColors = toSortedList(backgrounds).map(entry => ({
          id: 'background-' + entry.id,
          type: 'color',
          name: toLabel(entry),
          value: entry.value
        }))

        this.fontColors = toSortedList(colors).map(entry => ({
          id: 'color-' + entry.id,
          type: 'color',
          name: toLabel(entry),
          value: entry.value
        }))

        this.borderColors = toSortedList(borderColors).map(entry => ({
          id: 'border-color-' + entry.id,
          type: 'color',
          name: toLabel(entry),
          value: entry.value
        }))

        this.borderWidths = toSortedList(borderWidths).map(entry => ({
          id: 'border-width-' + entry.id,
          value: entry.value,
          label: toLabel(entry)
        }))

        this.fontFamilies = toSortedList(fontFamilies).map(entry => ({
          id: 'font-family-' + entry.id,
          type: 'text',
          name: toLabel(entry),
          value: {
            fontFamily: entry.value,
            fontWeight: '400',
            fontStyle: 'normal',
            textDecoration: 'none'
          }
        }))
      }
    },
    mounted () {
      this.logger = new Logger('CommonStyleList')
    }
}
</script>
