
<template>
  <div class="MatcToolbarItem"  @mousedown.stop="" >
      <DesignTokenPreview :designtoken="designtoken"/>
	</div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import DesignTokenPreview from './DesignTokenPreview'

export default {
    name: 'DesignTokenView',
    props: ['designtoken'],
    mixins:[DojoWidget],
    data: function () {
        return {
          icons: {
            color: 'mdi mdi-water',
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
    components: {
      'DesignTokenPreview': DesignTokenPreview
    },
    methods: {
      unlink () {
        this.emit('unlink', this.designtoken)
      },
      setModel (m) {
        this.model = m
      }
    },
    mounted () {
    }
}
</script>