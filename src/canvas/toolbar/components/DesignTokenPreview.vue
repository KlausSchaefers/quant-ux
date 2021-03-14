
<template>
    <div class="MatcDesignTokenPreView" v-if="designtoken">
      <span class="MatcToolbarItemIcon" >
        <span :class="icons[designtoken.type]" />
      </span>
      <span class="MatcToolbarItemLabel">{{designtoken.name}}</span>
    </div>
</template>
<script>

export default {
    name: 'DesignTokenPreview',
    props: ['designtoken'],
    mixins:[],
    data: function () {
        return {
          model: null,
          icons: {
            color: 'mdi mdi-water',
            text: 'mdi mdi-format-size',
            padding: 'mdi mdi-select-all',
            stroke: 'mdi mdi-border-color',
            boxShadow: 'mdi mdi-box-shadow',
          },
          visible: true,
          designtokens: null
        }
    },
    computed: {
    },
    components: {},
    methods: {

    },
    mounted () {
    }
}
</script>