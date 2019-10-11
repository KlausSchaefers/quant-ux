
<template>
	<ul class="MatcTreeItem">
    <li>
        <div @click="toggleOpen">
          <template v-if="!hasChildren">
            <span v-if="nodeIcon" :class="nodeIcon"></span>
          </template>
          <template v-if="hasChildren">
            <span :class="expendIcon"></span>
          </template>
          {{value.label}}
        </div>
        <ul v-if="isOpen">
          <TreeItem v-for="child in value.children" :key="child.id" :value="child" />
        </ul>
      </li>
	</ul>
</template>
<script>


export default {
  name: "TreeItem",
  props:['value'],
  mixins: [],
  data: function() {
    return {
      isOpen: true
    };
  },
  computed: {
    hasChildren () {
      return this.value.children && this.value.children.length > 0
    },
    nodeIcon () {
      return 'mdi mdi-crop-portrait MatcTreeIcon'
    },
    expendIcon () {
      if (this.isOpen) {
        return 'mdi mdi-menu-down MatcTreeIcon'
      }
      return 'mdi mdi-menu-down MatcTreeIconClosed MatcTreeIcon'
    }
  },
  components: {},
  methods: {
    toggleOpen () {
      this.isOpen = !this.isOpen
    },
    destroy: function() {
    }
  },
  watch: {
    value (v) {
      this.value = v
    }
  },
  mounted() {}
};
</script>