
<template>
  <div class="MatcToolbarItem MatcToolbarGridFull"  @mousedown.stop="" >
    <div class="MatcDesignTokenView" v-if="designtoken">
      <span class="MatcToolbarItemIcon" >
        <span :class="icons[designtoken.type]" />
      </span>
      <span class="MatcToolbarItemLabel">{{designtoken.name}}</span>
    </div>
	</div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'

export default {
    name: 'DesignTokenView',
    props: ['designtoken'],
    mixins:[DojoWidget],
    data: function () {
        return {
          icons: {
            color: 'mdi mdi-palette',
            text: 'mdi mdi-format-size',
            padding: 'mdi mdi-select-all',
            stroke: 'mdi mdi-border-color',
            boxShadow: 'mdi mdi-box-shadow',
          },
          model: null
        }
    },
    computed: {
    },
    components: {},
    methods: {
      setModel (m) {
        this.model = m
      }
    },
    mounted () {
    }
}
</script>