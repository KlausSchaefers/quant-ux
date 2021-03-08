
<template>
  <div class="MatcToolbarItem MatcToolbarGridFull"  @mousedown.stop="" >
    {{designtoken.name}}
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