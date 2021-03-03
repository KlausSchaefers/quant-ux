
<template>
    <div class=""  @mousedown.stop="" >
      <div class=" MatcToolbarSection">
        <div class=" MatcToolbarSectionLabel">Colors</div>
        <div class=" MatcToolbarSectionContent">

        </div>
      </div>

    <div class=" MatcToolbarSection">
        <div class=" MatcToolbarSectionLabel">Text</div>
        <div class=" MatcToolbarSectionContent">

        </div>
      </div>

        <div class=" MatcToolbarSection">
        <div class=" MatcToolbarSectionLabel">Strokes</div>
        <div class=" MatcToolbarSectionContent">

        </div>
      </div>
	</div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
//import Util from 'core/Util'

export default {
    name: 'DesignTokenBtn',
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