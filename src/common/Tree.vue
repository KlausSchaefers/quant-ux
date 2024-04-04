
<template>
	<ul class="MatcTree">
    {{value.label}}
    <TreeItem v-for="child in value.children"
      :level="0"
      :key="child.id"
      class="MatcTreeRootNode"
      :value="child"
      @endEdit="onChildEndEdit"
      @startEdit="onStartEdit"
      @select="onSelect"
      @locked="onChildLocked"
			@hidden="onChildHidden"
      @open="onOpen"
      @dnd="onDnd">
    </TreeItem>
	</ul>
</template>
<style lang="scss">
  @import "../style/components/tree.scss";
</style>
<script>

import TreeItem from 'common/TreeItem'

export default {
  name: "Tree",
  props:['value', 'selection'],
  mixins: [],
  data: function() {
    return {
      nodes: {}
    };
  },
  components: {
    'TreeItem': TreeItem
  },
  methods: {
    onOpen (id, open) {
      this.$emit('open', id, open)
    },
    onDnd (from, to, position) {
      this.$emit('dnd', from, to, position)
    },
    onChildLocked (id, value) {
      this.$emit('locked', id, value)
    },
    onChildHidden (id, value) {
      this.$emit('hidden', id, value)
    },
    onChildEndEdit (id, txt) {
      this.clearEdit()
      if (this.nodes[id]) {
        let node = this.nodes[id]
        this.$set(node, 'label', txt)
      } else {
        console.debug('cannot find ', id)
      }
      this.$emit('changeLabel', id, txt)
    },
    onStartEdit (id) {
      this.clearEdit()
      if (this.nodes[id]) {
        let node = this.nodes[id]
        this.$set(node, 'editable', true)
        this.emitSelection()
      }
    },
    clearEdit () {
       for (let id in this.nodes){
        const node = this.nodes[id]
        this.$set(node, 'editable', false)
      }
    },
    onSelect (id, expand) {
      if (!expand) {
        this.clearSelection()
      }
      if (this.nodes[id]) {
        const node = this.nodes[id]
        if (node.selected === true) {
          this.$set(node, 'selected', false)
        } else {
          this.$set(node, 'selected', true)
        }
        this.emitSelection()
      }
    },
    emitSelection () {
      const selection = Object.values(this.nodes)
        .filter(n => n.selected)
        .map(n => n.id)
      this.$emit('select', selection)
    },
    clearSelection () {
      for (let id in this.nodes){
        const node = this.nodes[id]
        this.$set(node, 'selected', false)
      }
    },
    setSelection (ids) {
      this.clearSelection()
      for (let id in ids) {
        if (this.nodes[id]) {
          const node = this.nodes[id]
          this.$set(node, 'selected', true)
        } else {
          console.warn('setSelection(), No node with id', id)
        }
      }
    },
    initTree () {
      const nodes = this.getNodes(this.value, {})
      this.nodes = nodes
    },
    getNodes (node, result) {
      result[node.id] = node
      if (node.children) {
        node.children.forEach(child => {
          this.getNodes(child, result)
        })
      }
      return result
    }
  },
  watch: {
    value (v) {
      this.value = v
      this.initTree()
    },
    selection (v) {
      this.setSelection(v)
    }
  },
  mounted() {
    if (this.value) {
      this.initTree()
    }
    if (this.selection) {
      this.setSelection(this.selection)
    }
  }
};
</script>