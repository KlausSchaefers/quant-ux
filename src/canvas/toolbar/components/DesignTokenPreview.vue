
<template>
    <div class="MatcDesignTokenPreView" v-if="designtoken">
      <span class="MatcToolbarItemIcon" v-if="designtoken.type === 'color'">
  				<span data-dojo-attach-point="icon" class="MatcToolbarColorIndicator" :style="{'background': getBackgroundColor(designtoken.value), 'background': getBackgroundColor2(designtoken.value)}" />
      </span>
       <span class="MatcToolbarItemIcon" v-if="designtoken.type === 'stroke'">
  				  <span :class="icons[designtoken.type]" :style="{'color': designtoken.value.borderTopColor}" />
      </span>
      <span class="MatcToolbarItemIcon" v-if="designtoken.type === 'text'">
  				  <span :class="icons[designtoken.type]" />
      </span>
       <span class="MatcToolbarItemIcon" v-if="designtoken.type === 'padding'">
  				  <span :class="icons[designtoken.type]" />
      </span>
      <span class="MatcToolbarItemIcon" v-if="designtoken.type === 'boxShadow'">
  			  <span :class="icons[designtoken.type]" />
      </span>
      <span class="MatcToolbarItemIcon" v-if="designtoken.type === 'tooltip'">
  			  <span :class="icons[designtoken.type]" />
      </span>

      <span class="MatcToolbarItemLabel" :style="textStyle">{{designtoken.name}}</span>

      <span class="MatcToolbarItemIcon MatcDesignTokenEdit" @click="onEdit" v-if="edit === true" ref="editBtn">
  			  <span class="mdi mdi-tune-vertical" />
      </span>

    </div>
</template>
<script>
import * as ColorUtil from 'core/code/ColorUtil'
export default {
    name: 'DesignTokenPreview',
    props: ['designtoken', 'edit'],
    mixins:[],
    data: function () {
        return {
          model: null,
          icons: {
            color: 'mdi mdi-water',
            text: 'mdi mdi-format-text-variant',
            padding: 'mdi mdi-select-all',
            stroke: 'mdi mdi-border-all-variant',
            tooltip: 'mdi mdi-cursor-default-click-outline',
            boxShadow: 'mdi mdi mdi-box-shadow', //'mdi mdi-box-shadow',
          },
          visible: true,
          designtokens: null
        }
    },
    computed: {
      textStyle () {
        if (this.designtoken && this.designtoken.type === 'text') {
          return `font-family:${this.designtoken.value.fontFamily}; font-weight: ${this.designtoken.value.fontWeight}`
        }
        return ''
      }
    },
    components: {},
    methods: {
      getBackgroundColor (v) {
				if (v === 'None' || v === 'transparent' || !v) {
					v = '';
				}

				if (v.colors) {
          const gradient = ColorUtil.getGradientCSS(v)
					v = "linear-gradient"  + gradient
				}
				return v
      },
      getBackgroundColor2 (v) {
				if (v === 'None' || v === 'transparent' || !v) {
					v = '';
				}
				if (v.colors) {
          const gradient = ColorUtil.getGradientCSS(v)
					v = "-webkit-linear-gradient" + gradient
				}
				return v
      },
      onEdit (e) {
        this.$emit('edit', this.designtoken, this.$el, e)
      }
    },
    mounted () {
    }
}
</script>