
<template>
    <div class="MatcDesignTokenPreView" v-if="designtoken" @mousedown.stop="">
      <span class="MatcToolbarItemIcon" v-if="designtoken.type === 'color'">
  				<span data-dojo-attach-point="icon" class="MatcToolbarColorIndicator" :style="{'background': getBackgroundColor(designtoken.value)}" />
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

      <span class="MatcToolbarItemLabel">{{designtoken.name}}</span>

      <span class="MatcToolbarItemIcon MatcDesignTokenEdit" @click="onEdit" v-if="edit === true">
  			  <span class="mdi mdi-cogs" />
      </span>

    </div>
</template>
<script>
export default {
    name: 'DesignTokenPreview',
    props: ['designtoken', 'edit'],
    mixins:[],
    data: function () {
        return {
          model: null,
          icons: {
            color: 'mdi mdi-water',
            text: 'mdi mdi-format-size',
            padding: 'mdi mdi-select-all',
            stroke: 'mdi mdi-border-all-variant',
            boxShadow: 'mdi mdi-blur', //'mdi mdi-box-shadow',
          },
          visible: true,
          designtokens: null
        }
    },
    computed: {
    },
    components: {},
    methods: {
      getBackgroundColor (v) {
				if (v === 'None' || v === 'transparent' || !v) {
					v = '';
				}

				if (v.colors) {
					v = "linear-gradient"  + this._getGradientCSS(v)
				}

        console.debug('getColor', v)
				return v
      },
      _getGradientCSS (gradient) {
				var value = "(" + gradient.direction + "deg";
				for(var i=0; i < gradient.colors.length; i++){
					var color = gradient.colors[i];
					value +="," + color.c + " " + color.p + "% ";
				}
				value + ");";
				return value;
			},
      onEdit (e) {
        this.$emit('edit', this.designtoken, this.$el, e)
      }
    },
    mounted () {
    }
}
</script>