
<template>
  <div class="MatcToolbarItem MatcToolbarGridFull"  @mousedown.stop="" >
    <div v-if="designtoken && designtoken.type === 'color'" class="MatcDesignTokenView">
      <span class="MatcToolbarItemIcon">
        <span class="mdi mdi-cog" />
      </span>
      <span class="MatcToolbarItemLabel">{{designtoken.name}}</span>
    </div>

    <div v-if="designtoken && designtoken.type === 'boxShadow'" class="MatcDesignTokenView">
      <span class="MatcToolbarItemIcon">
        <span class="mdi mdi-cogs" />
      </span>
      <span class="MatcToolbarItemLabel">{{designtoken.name}}</span>
    </div>

    <div v-if="designtoken && designtoken.type === 'stroke'" class="MatcDesignTokenView">
      <span class="MatcToolbarItemIcon">
        <span class="mdi mdi-cogs" />
      </span>
      <span class="MatcToolbarItemLabel">{{designtoken.name}}</span>
    </div>

    <div v-if="designtoken && designtoken.type === 'padding'" class="MatcDesignTokenView">
      <span class="MatcToolbarItemIcon">
        <span class="mdi mdi-cogs" />
      </span>
      <span class="MatcToolbarItemLabel">{{designtoken.name}}</span>
    </div>

    <div v-if="designtoken && designtoken.type === 'text'" class="MatcDesignTokenView">
      <span class="MatcToolbarItemIcon">
        <span class="mdi mdi-cogs" />
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