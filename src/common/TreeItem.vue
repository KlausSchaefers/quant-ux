
<template>
	<ul :class="[{'MatcTreeItemDragOver': isDragOver}, {'MatcTreeItemSelected': isSelected && !isEditable}, 'MatcTreeItem']"  >
    <li :class="'MatcTreeItemLevel' + level">
        <div 
            class="MatcTreeItemRow"
            @click.stop="onClick($event)"
            @dragstart="onDragStart" 
            @dragover="onDragOver" 
            @dragleave="onDragLeave"
            @dblclick.stop="onDoubleClick"
            @drop="onDrop"
            :draggable="!isEditable"
          >
          <template v-if="hasChildren">
            <span :class="expandIcon" @click="toggleOpen"></span>
          </template>
          <template v-else>
            <span v-if="nodeIcon" :class="nodeIcon"></span>
          </template>
         <label class="MatcTreeItemLabel" v-if="!isEditable" ref="lblNode" >
            {{value.label}}
          </label>
          <input class="MatcTreeItemLabel" 
            v-if="isEditable" 
            @blur="onBlur" 
            ref="lblNode" 
            @keydown.enter="onBlur" :value="value.label"/>
        </div>
        <ul v-if="isOpen">
          <TreeItem v-for="child in value.children" :key="child.id" 
            :value="child" 
            @dnd="onChildDnd" 
            @select="onChildSelect" 
            @startEdit="onChildStartEdit"
            @endEdit="onChildEndEdit"
            :level="level + 1"/>
        </ul>
      </li>
	</ul>
</template>
<script>


export default {
  name: "TreeItem",
  props:['value', 'level'],
  mixins: [],
  data: function() {
    return {
      isOpen: true,
      isDragOver: false
    };
  },
  computed: {
    hasChildren () {
      return this.value.children && this.value.children.length > 0
    },
    isEditable () {
      return this.value.editable
    },
    isSelected () {
      return this.value.selected
    },
    nodeIcon () {
      if (this.value && this.value.icon) {
        return this.value.icon
      }
      return 'mdi mdi-crop-portrait MatcTreeIcon'
    },
    expandIcon () {
      if (this.isOpen) {
        if (this.value && this.value.openIcon) {
          return this.value.openIcon
        }
        return 'mdi mdi-folder-open MatcTreeIcon'
      }
      if (this.value && this.value.closeIcon) {
         return this.value.closeIcon
      }
      return 'mdi mdi-folder MatcTreeIcon'
    }
  },
  components: {},
  methods: {
    onBlur () {
      if (this.isEditable) {
        this.$emit('endEdit', this.value.id, this.getInlineTxt())
      }
    },
    onDoubleClick () {
      this.$emit('startEdit', this.value.id)
    },
    toggleOpen () {
      this.isOpen = !this.isOpen
    },
    onClick (e) {
      let expand = e.ctrlKey || e.metaKey || e.shiftKey
      this.$emit('select', this.value.id, expand)
    },
    onDragStart (e) {
      e.dataTransfer.setData("text", this.value.id)
    },
    onDragOver (e) {
      e.preventDefault() 
      this.isDragOver = true
    },
    onDragLeave (e) {
      e.preventDefault() 
      this.isDragOver = false
    },
    onDrop (e) {
      let id = e.dataTransfer.getData('text')
      this.isDragOver = false
      this.$emit('dnd', id, this.value.id)
    },
    onChildDnd (from, to) {
      this.$emit('dnd', from, to)
    },
    onChildSelect (id, expand) {
      this.$emit('select', id, expand)
    },
    onChildStartEdit (id) {
      this.$emit('startEdit', id)
    },
    onChildEndEdit (id, txt) {
      this.$emit('endEdit', id, txt)
    },
    destroy () {
    },
    getInlineTxt (){
      if (this.$refs.lblNode){
        var txt = this.$refs.lblNode.value;	
        txt = txt.replace(/(\r\n|\n|\r)/gm, '')
        txt = txt.replace(/<br>/g, "");
        txt = txt.replace(/&nbsp;/g, " ");
        txt = txt.replace(/%/g, "$perc;"); 
        return txt;
      }
    },
    focus () {
      if (this.value.editable) {
        this.$nextTick(() => {
          this.$refs.lblNode.select()
          this.$refs.lblNode.focus()
        })
      }
    }
  },
  watch: {
    value (v) {
      console.debug('watch(value)', v)
      this.value = v
      this.isOpen = this.value.open
      this.focus()
    }
  },
  mounted() {
    if (this.value) {
      this.isOpen = this.value.open
      this.focus()
    }
  }
};
</script>