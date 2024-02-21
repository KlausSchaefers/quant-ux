
<template>
  <div class="MatcDesignTokenPreView" v-if="designtoken" @click.right.stop="showMenu">
    <span class="MatcToolbarItemIcon" v-if="designtoken.type === 'color'">
      <span data-dojo-attach-point="icon" class="MatcToolbarColorIndicator"
        :style="{ 'background': getBackgroundColor(designtoken.value), 'background': getBackgroundColor2(designtoken.value) }" />
    </span>
    <span class="MatcToolbarItemIcon" v-if="designtoken.type === 'stroke'">
      <span :class="icons[designtoken.type]" :style="{ 'color': designtoken.value.borderTopColor }" />
    </span>
    <span class="MatcToolbarItemIcon" v-if="designtoken.type === 'text'">
      <QIcon icon="Text"></QIcon>
    </span>
    <span class="MatcToolbarItemIcon" v-if="designtoken.type === 'padding'">
      <QIcon icon="Padding"></QIcon>
    </span>
    <span class="MatcToolbarItemIcon" v-if="designtoken.type === 'boxShadow'">
      <QIcon icon="BoxShadow"></QIcon>
    </span>
    <span class="MatcToolbarItemIcon" v-if="designtoken.type === 'tooltip'">
      <span :class="icons[designtoken.type]" />
    </span>

    <span class="MatcToolbarItemLabel" :style="textStyle">{{ designtoken.name }}</span>

    <span class="MatcToolbarItemIcon MatcDesignTokenEdit" @click="onEdit" v-if="edit === true && action === 'edit'" ref="editBtn">
      <QIcon icon="Settings"></QIcon>
    </span>

    <span class="MatcToolbarItemIcon MatcDesignTokenEdit" @click="onDelete" v-if="edit === true && action === 'delete'" ref="editBtn">
      <QIcon icon="Delete"></QIcon>
    </span>

  </div>
</template>
<script>
import * as ColorUtil from 'core/code/ColorUtil'
import QIcon from 'page/QIcon'

export default {
  name: 'DesignTokenPreview',
  props: ['designtoken', 'edit'],
  mixins: [],
  data: function () {
    return {
      action: 'edit',
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
    textStyle() {
      if (this.designtoken && this.designtoken.type === 'text') {
        return `
            font-family:${this.designtoken.value.fontFamily}; 
            font-weight: ${this.designtoken.value.fontWeight}; 
            font-style: ${this.designtoken.value.fontStyle};
            text-decoration: ${this.designtoken.value.textDecoration};
            `.trim()
      }
      return ''
    }
  },
  components: {
    'QIcon': QIcon
  },
  methods: {
    showMenu(e) {
      this.stopEvent(e)
      if (this.action === 'edit') {
        this.action = 'delete'
      } else {
        this.action = 'edit'
      }
    },
    stopEvent(e) {
      try {
        if (e && e.stopPropagation) {
          e.stopPropagation();
          e.preventDefault();
        }
      } catch (err) {
        console.warn('DojoWidget.stopEvent', err, e)
      }

    },
    getBackgroundColor(v) {
      if (v === 'None' || v === 'transparent' || !v) {
        v = '';
      }

      if (v.colors) {
        const gradient = ColorUtil.getGradientCSS(v)
        v = "linear-gradient" + gradient
      }
      return v
    },
    getBackgroundColor2(v) {
      if (v === 'None' || v === 'transparent' || !v) {
        v = '';
      }
      if (v.colors) {
        const gradient = ColorUtil.getGradientCSS(v)
        v = "-webkit-linear-gradient" + gradient
      }
      return v
    },
    onDelete (e) {
      this.$emit('delete', this.designtoken, this.$el, e)
    },
    onEdit(e) {
      this.$emit('edit', this.designtoken, this.$el, e)
    }
  },
  mounted() {
  }
}
</script>